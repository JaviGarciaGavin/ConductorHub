import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 text-center text-lg-start">
              <div className="hero-content">
                <h1 className="hero-title display-2 fw-bold mb-4">ConductorHub</h1>
                <p className="hero-subtitle lead mb-4">
                  Disfrute de un gestor de incidencias sencillo que puede aplicar para cualquier ámbito
                </p>
                <div className="button-group d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                  <button 
                    className="btn btn-primary btn-lg px-4 py-3 fw-semibold"
                    onClick={() => navigate('/login')}
                  >
                     Iniciar Sesión
                  </button>
                  <button 
                    className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                    onClick={() => navigate('/register')}
                  >
                     Crear Cuenta
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-visual position-relative mt-5 mt-lg-0">
                <div className="floating-card card-1 position-absolute">
                  <div className="card-content">
                    <span className="card-icon">📋</span>
                    <span>Gestión</span>
                  </div>
                </div>
                <div className="floating-card card-2 position-absolute">
                  <div className="card-content">
                    <span className="card-icon">⚡</span>
                    <span>Rápido</span>
                  </div>
                </div>
                <div className="floating-card card-3 position-absolute">
                  <div className="card-content">
                    <span className="card-icon">🎯</span>
                    <span>Preciso</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">¿Por qué elegir ConductorHub?</h2>
            <p className="lead text-muted">La solución completa para la gestión de incidencias</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🚀</div>
                  <h3 className="h5 fw-bold">Implementación Rápida</h3>
                  <p className="text-muted">Comienza a usar la plataforma en minutos, sin complicaciones técnicas</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🔧</div>
                  <h3 className="h5 fw-bold">Para cualquier ámbito</h3>
                  <p className="text-muted">Adaptable a diferentes tipos de proyectos y sectores profesionales</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">📊</div>
                  <h3 className="h5 fw-bold">Seguimiento en Tiempo Real</h3>
                  <p className="text-muted">Monitorea el estado de todas tus incidencias desde un solo lugar</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">👥</div>
                  <h3 className="h5 fw-bold">Trabajo Colaborativo</h3>
                  <p className="text-muted">Comparte y gestiona incidencias con tu equipo de forma eficiente</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">🛡️</div>
                  <h3 className="h5 fw-bold">Seguro y Confiable</h3>
                  <p className="text-muted">Tus datos protegidos con los más altos estándares de seguridad</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">💡</div>
                  <h3 className="h5 fw-bold">Interfaz Intuitiva</h3>
                  <p className="text-muted">Diseñado para ser usado por cualquier persona, sin curva de aprendizaje</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works py-5 bg-white">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">¿Cómo funciona?</h2>
            <p className="lead text-muted">Simple, rápido y efectivo en 3 pasos</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="step text-center">
                <div className="step-number mx-auto mb-3">1</div>
                <h3 className="h4 fw-bold mb-3">Regístrate</h3>
                <p className="text-muted">Crea tu cuenta en menos de 2 minutos</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="step text-center">
                <div className="step-number mx-auto mb-3">2</div>
                <h3 className="h4 fw-bold mb-3">Configura</h3>
                <p className="text-muted">Personaliza según las necesidades de tu proyecto</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="step text-center">
                <div className="step-number mx-auto mb-3">3</div>
                <h3 className="h4 fw-bold mb-3">Gestiona</h3>
                <p className="text-muted">Comienza a crear y seguir tus incidencias</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="testimonial-card card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="testimonial-text mb-3">
                    "ConductorHub ha simplificado enormemente nuestra gestión de incidencias. ¡Increíble!"
                  </div>
                  <div className="testimonial-author text-end">
                    <strong className="d-block">Ana Martínez</strong>
                    <small className="text-muted">Project Manager</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="testimonial-card card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="testimonial-text mb-3">
                    "La facilidad de uso es impresionante. Todo el equipo lo adoptó sin problemas."
                  </div>
                  <div className="testimonial-author text-end">
                    <strong className="d-block">Carlos Rodríguez</strong>
                    <small className="text-muted">Team Lead</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="testimonial-card card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="testimonial-text mb-3">
                    "Por fin una herramienta que se adapta a nuestros procesos, no al revés."
                  </div>
                  <div className="testimonial-author text-end">
                    <strong className="d-block">María López</strong>
                    <small className="text-muted">CTO</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta py-5">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="display-4 fw-bold mb-3">¿Listo para comenzar?</h2>
            <p className="lead mb-4">
              Únete a miles de profesionales que ya gestionan sus incidencias con ConductorHub
            </p>
            <div className="cta-buttons d-flex gap-3 justify-content-center flex-wrap">
              <button 
                className="btn btn-primary btn-lg px-4 py-3 fw-semibold"
                onClick={() => navigate('/register')}
              >
                Comenzar Gratis
              </button>
              <button 
                className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                onClick={() => navigate('/login')}
              >
                Acceder a mi Cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container">
          <div className="footer-bottom text-center">
            <p className="mb-1">&copy; 2025 ConductorHub. Todos los derechos reservados.</p>
            <p className="mb-0">Creador: Javier Garcia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;