import { useEffect } from "react";

function App() {
  useEffect(() => {
    window.location.replace('/landing.html');
  }, []);

  return (
    <div style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00F5FF', fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.2em' }}>
        INCLUDE ENGENHARIA...
      </div>
    </div>
  );
}

export default App;
