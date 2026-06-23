import React from 'react';

const Testimonials = () => {
  return (
    <section id="testimonials" className="section" data-testid="testimonials-section">
      <div className="container">
        <div className="section-header testimonials-header">
          <p className="section-overline">Depoimentos</p>
          <h2 className="section-title">
            O que nossos <br /><em>clientes dizem</em>
          </h2>
        </div>

        <div className="testimonials-wrapper" data-testid="testimonials-wrapper">
          <div className="testimonials-slider" id="testimonials-slider">
            <div className="testimonial-card" data-testid="testimonial-card-1">
              <div className="testimonial-inner">
                <div className="testimonial-quote"><i className="fas fa-quote-left"></i></div>
                <p className="testimonial-text">"A Include Engenharia nos surpreendeu com a qualidade técnica e a dedicação da equipe. Entregaram um sistema robusto, moderno e dentro do prazo combinado. Resultado acima do esperado."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">59</div>
                  <div>
                    <strong>59Mil</strong>
                    <span>Parceiro Estratégico</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-testid="testimonial-card-2">
              <div className="testimonial-inner">
                <div className="testimonial-quote"><i className="fas fa-quote-left"></i></div>
                <p className="testimonial-text">"Equipe extremamente competente e proativa. Resolveram nossos desafios com agilidade e expertise técnica, superando todas as nossas expectativas em qualidade e prazo de entrega."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">AC</div>
                  <div>
                    <strong>Acont</strong>
                    <span>Empresa Parceira</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-testid="testimonial-card-3">
              <div className="testimonial-inner">
                <div className="testimonial-quote"><i className="fas fa-quote-left"></i></div>
                <p className="testimonial-text">"A Include Engenharia é referência de excelência no Movimento Empresa Júnior. Uma EJ que transforma desafios reais em soluções digitais de alto impacto e inspiração para todo o MEJ."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">BJ</div>
                  <div>
                    <strong>Brasil Júnior</strong>
                    <span>Confederação Nacional de EJs</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-testid="testimonial-card-4">
              <div className="testimonial-inner">
                <div className="testimonial-quote"><i className="fas fa-quote-left"></i></div>
                <p className="testimonial-text">"Parceria incrível! A Include entendeu nossas necessidades com precisão e entregou uma solução digital que modernizou completamente nossa operação. Resultados reais e mensuráveis."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">CJ</div>
                  <div>
                    <strong>Consej</strong>
                    <span>Consultoria Jurídica Júnior</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-testid="testimonial-card-5">
              <div className="testimonial-inner">
                <div className="testimonial-quote"><i className="fas fa-quote-left"></i></div>
                <p className="testimonial-text">"Profissionalismo, comprometimento e excelência técnica. A Include Engenharia é, sem dúvida, a melhor escolha para projetos de desenvolvimento digital no RN. Recomendamos fortemente."</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">CE</div>
                  <div>
                    <strong>Consolida Engenharia</strong>
                    <span>EJ de Engenharia Civil</span>
                  </div>
                </div>
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonials-controls" data-testid="testimonials-controls">
            <button className="testimonial-btn" id="testimonial-prev" data-testid="testimonial-prev" aria-label="Anterior">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="testimonial-dots" id="testimonial-dots" data-testid="testimonial-dots">
              <button className="dot active" data-index="0"></button>
              <button className="dot" data-index="1"></button>
              <button className="dot" data-index="2"></button>
              <button className="dot" data-index="3"></button>
              <button className="dot" data-index="4"></button>
            </div>
            <button className="testimonial-btn" id="testimonial-next" data-testid="testimonial-next" aria-label="Próximo">
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
