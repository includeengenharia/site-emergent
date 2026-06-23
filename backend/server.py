from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class ContactFormSubmission(BaseModel):
    nome: str
    nome_da_empresa: str
    telefone: str
    o_que_voc_busca: str


def _get_pipefy_credentials() -> tuple[str | None, str | None]:
    access_token = (
        os.getenv("PIPEFY_ACCESS_TOKEN")
        or os.getenv("ACCESS_TOKEN")
        or os.getenv("REACT_APP_ACCESS_TOKEN")
    )
    pipe_id = (
        os.getenv("PIPEFY_PIPE_ID")
        or os.getenv("PIPE_ID")
        or os.getenv("REACT_APP_PIPE_ID")
    )
    return access_token, pipe_id


def _get_pipefy_field_ids() -> dict[str, str]:
    return {
        "nome": os.getenv("PIPEFY_FIELD_ID_NOME", "nome"),
        "nome_da_empresa": os.getenv("PIPEFY_FIELD_ID_NOME_EMPRESA", "nome_da_empresa"),
        "telefone": os.getenv("PIPEFY_FIELD_ID_TELEFONE", "telefone"),
        "o_que_voc_busca": os.getenv("PIPEFY_FIELD_ID_BUSCA", "o_que_voc_busca"),
    }

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


@api_router.post("/contact")
async def submit_contact_form(payload: ContactFormSubmission):
    access_token, pipe_id = _get_pipefy_credentials()
    field_ids = _get_pipefy_field_ids()
    if not access_token or not pipe_id:
        raise HTTPException(
            status_code=500,
            detail="Pipefy credentials are missing. Set PIPEFY_PIPE_ID and PIPEFY_ACCESS_TOKEN.",
        )

    try:
        pipe_id_int = int(pipe_id)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail="PIPEFY_PIPE_ID must be a valid integer.") from exc

    # Use JSON encoding to avoid breaking GraphQL strings with user-provided quotes.
    mutation = f"""
    mutation {{
      createCard(input: {{
        pipe_id: {pipe_id_int},
        fields_attributes: [
                    {{ field_id: {json.dumps(field_ids['nome'])}, field_value: {json.dumps(payload.nome, ensure_ascii=False)} }},
                    {{ field_id: {json.dumps(field_ids['nome_da_empresa'])}, field_value: {json.dumps(payload.nome_da_empresa, ensure_ascii=False)} }},
                    {{ field_id: {json.dumps(field_ids['telefone'])}, field_value: {json.dumps(payload.telefone, ensure_ascii=False)} }},
                    {{ field_id: {json.dumps(field_ids['o_que_voc_busca'])}, field_value: {json.dumps(payload.o_que_voc_busca, ensure_ascii=False)} }}
        ]
      }}) {{
        card {{
          id
        }}
      }}
    }}
    """

    try:
        response = await run_in_threadpool(
            requests.post,
            "https://api.pipefy.com/graphql",
            json={"query": mutation},
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
    except requests.RequestException as exc:
        logger.exception("Failed to connect to Pipefy")
        raise HTTPException(status_code=502, detail="Unable to reach Pipefy API.") from exc

    if not response.ok:
        raise HTTPException(status_code=502, detail=f"Pipefy API error: HTTP {response.status_code}")

    try:
        response_data = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Invalid response from Pipefy API.") from exc

    if response_data.get("errors"):
        logger.error("Pipefy returned errors: %s", response_data["errors"])
        first_error = response_data["errors"][0].get("message", "Pipefy rejected the request.")
        raise HTTPException(status_code=502, detail=f"Pipefy rejected the request: {first_error}")

    card_id = (
        response_data.get("data", {})
        .get("createCard", {})
        .get("card", {})
        .get("id")
    )
    if not card_id:
        raise HTTPException(status_code=502, detail="Pipefy response did not include a card id.")

    return {"ok": True, "card_id": card_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)