import React from 'react';
import './landing.css';

const Landing = ({ onNavigate }) => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">ConductorHub</h1>
            <p className="hero-subtitle">
              Disfrute de un gestor de incidencias sencillo que puede aplicar para cualquier ámbito
            </p>
            <div className="button-group">
              <button 
                className="primary-button"
                onClick={() => onNavigate('login')}
              >
                🔑 Iniciar Sesión
              </button>
              <button 
                className="secondary-button"
                onClick={() => onNavigate('register')}
              >
                📝 Crear Cuenta
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-content">
                <span className="card-icon">📋</span>
                <span>Gestión</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <span className="card-icon">⚡</span>
                <span>Rápido</span>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-content">
                <span className="card-icon">🎯</span>
                <span>Preciso</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegir ConductorHub?</h2>
            <p>La solución completa para la gestión de incidencias</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Implementación Rápida</h3>
              <p>Comienza a usar la plataforma en minutos, sin complicaciones técnicas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Para cualquier ámbito</h3>
              <p>Adaptable a diferentes tipos de proyectos y sectores profesionales</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Seguimiento en Tiempo Real</h3>
              <p>Monitorea el estado de todas tus incidencias desde un solo lugar</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Trabajo Colaborativo</h3>
              <p>Comparte y gestiona incidencias con tu equipo de forma eficiente</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Seguro y Confiable</h3>
              <p>Tus datos protegidos con los más altos estándares de seguridad</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Interfaz Intuitiva</h3>
              <p>Diseñado para ser usado por cualquier persona, sin curva de aprendizaje</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>¿Cómo funciona?</h2>
            <p>Simple, rápido y efectivo en 3 pasos</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Regístrate</h3>
              <p>Crea tu cuenta en menos de 2 minutos</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configura</h3>
              <p>Personaliza según las necesidades de tu proyecto</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Gestiona</h3>
              <p>Comienza a crear y seguir tus incidencias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "ConductorHub ha simplificado enormemente nuestra gestión de incidencias. ¡Increíble!"
              </div>
              <div className="testimonial-author">
                <strong>Ana Martínez</strong>
                <span>Project Manager</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "La facilidad de uso es impresionante. Todo el equipo lo adoptó sin problemas."
              </div>
              <div className="testimonial-author">
                <strong>Carlos Rodríguez</strong>
                <span>Team Lead</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Por fin una herramienta que se adapta a nuestros procesos, no al revés."
              </div>
              <div className="testimonial-author">
                <strong>María López</strong>
                <span>CTO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para comenzar?</h2>
            <p>Únete a miles de profesionales que ya gestionan sus incidencias con ConductorHub</p>
            <div className="cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => onNavigate('register')}
              >
                Comenzar Gratis
              </button>
              <button 
                className="cta-secondary"
                onClick={() => onNavigate('login')}
              >
                Acceder a mi Cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2025 ConductorHub. Todos los derechos reservados.</p>
            <p>Creador: Javier Garcia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;