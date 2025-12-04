import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 17L15 12L10 7" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Iniciar Sesión
                  </button>
                  <button 
                    className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                    onClick={() => navigate('/register')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 8V14" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 11H17" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Crear Cuenta
                  </button>
                </div>
              </div>
            </div>
            {/*Tarjetas flotantes */}
            <div className="col-lg-6">
              <div className="hero-visual position-relative mt-5 mt-lg-0">
                {/* Tarjeta 1 - Gestión */}
                <div className="floating-card card-1 position-absolute">
                  <div className="card-content">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="card-icon mb-2">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"/>
                      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z"/>
                      <path d="M9 12H15"/>
                      <path d="M9 16H15"/>
                    </svg>
                    <span className="d-block fw-semibold">Gestión</span>
                    <small className="text-white-50 d-block mt-1">Organizada</small>
                  </div>
                </div>
                
                {/* Tarjeta 2 - Rápido */}
                <div className="floating-card card-2 position-absolute">
                  <div className="card-content">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="card-icon mb-2">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
                    </svg>
                    <span className="d-block fw-semibold">Rápido</span>
                    <small className="text-white-50 d-block mt-1">Inmediato</small>
                  </div>
                </div>
                
                {/* Tarjeta 3 - Preciso */}
                <div className="floating-card card-3 position-absolute">
                  <div className="card-content">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="card-icon mb-2">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                    <span className="d-block fw-semibold">Preciso</span>
                    <small className="text-white-50 d-block mt-1">Exacto</small>
                  </div>
                </div>
                
                {/* Tarjeta 4 - Colaborativo (nueva) */}
                <div className="floating-card position-absolute" 
                    style={{ 
                      top: '65%', 
                      right: '5%',
                      animation: 'float 8.5s ease-in-out infinite 2.5s'
                    }}>
                  <div className="card-content">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="card-icon mb-2">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"/>
                    </svg>
                    <span className="d-block fw-semibold">Colaborativo</span>
                    <small className="text-white-50 d-block mt-1">Equipo</small>
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
            {/* Feature 1: Implementación Rápida */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <h3 className="h5 fw-bold">Implementación Rápida</h3>
                  <p className="text-muted">Comienza a usar la plataforma en minutos, sin complicaciones técnicas</p>
                </div>
              </div>
            </div>

            {/* Feature 2: Para cualquier ámbito */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                  </div>
                  <h3 className="h5 fw-bold">Para cualquier ámbito</h3>
                  <p className="text-muted">Adaptable a diferentes tipos de proyectos y sectores profesionales</p>
                </div>
              </div>
            </div>

            {/* Feature 3: Seguimiento en Tiempo Real */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  </div>
                  <h3 className="h5 fw-bold">Seguimiento en Tiempo Real</h3>
                  <p className="text-muted">Monitorea el estado de todas tus incidencias desde un solo lugar</p>
                </div>
              </div>
            </div>

            {/* Feature 4: Trabajo Colaborativo */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3 className="h5 fw-bold">Trabajo Colaborativo</h3>
                  <p className="text-muted">Comparte y gestiona incidencias con tu equipo de forma eficiente</p>
                </div>
              </div>
            </div>

            {/* Feature 5: Seguro y Confiable */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="h5 fw-bold">Seguro y Confiable</h3>
                  <p className="text-muted">Tus datos protegidos con los más altos estándares de seguridad</p>
                </div>
              </div>
            </div>

            {/* Feature 6: Interfaz Intuitiva */}
            <div className="col-md-6 col-lg-4">
              <div className="feature-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
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
                <h3 className="h4 fw-bold mb-3">Crea</h3>
                <p className="text-muted">Comienza a crear y seguir tus incidencias</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="step text-center">
                <div className="step-number mx-auto mb-3">3</div>
                <h3 className="h4 fw-bold mb-3">Invita</h3>
                <p className="text-muted">Añade a gente para colaborar en tu proyecto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                    "Es super sencillo de usar. Todo los miembros de mi equipo lo adoptó sin problemas."
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
                    "Por fin una herramienta que se adapta a nuestros procesos"
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 8V14" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 11H17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Comenzar Gratis
              </button>
              <button 
                className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold"
                onClick={() => navigate('/login')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"/>
                  <path d="M10 17L15 12L10 7"/>
                  <path d="M15 12H3"/>
                </svg>
                Acceder a mi Cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

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