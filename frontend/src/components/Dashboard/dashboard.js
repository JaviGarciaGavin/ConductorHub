import React from 'react';
import './dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">ConductorHub</h1>
          <div className="user-info">
            <span>Bienvenido, <strong>{user?.name}</strong></span>
            <button 
              className="logout-button"
              onClick={onLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Panel de Control</h2>
          <p>¡Hola {user?.name}! Has iniciado sesión correctamente.</p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Incidencias Activas</h3>
              <p className="stat-number">5</p>
            </div>
            <div className="stat-card">
              <h3>Resueltas</h3>
              <p className="stat-number">12</p>
            </div>
            <div className="stat-card">
              <h3>En Progreso</h3>
              <p className="stat-number">3</p>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Acciones Rápidas</h3>
            <div className="action-buttons">
              <button className="action-button">➕ Nueva Incidencia</button>
              <button className="action-button">👥 Gestionar Equipo</button>
              <button className="action-button">📊 Ver Reportes</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;