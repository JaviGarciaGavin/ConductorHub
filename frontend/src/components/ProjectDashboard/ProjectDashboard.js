// src/components/ProjectDashboard/ProjectDashboard.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ProjectDashboard.css';

const ProjectDashboard = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchProjectTickets();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error cargando proyecto:', error);
    }
  };

  const fetchProjectTickets = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/tickets?project.id=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const ticketsArray = data['hydra:member'] || data.member || data || [];
        setTickets(ticketsArray);
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) return <div className="loading">Cargando proyecto...</div>;

  return (
    <div className="project-dashboard">
      <header className="project-header">
        <button onClick={handleBackToDashboard} className="back-btn">
          ← Volver al Dashboard
        </button>
        <h1>{project?.name || 'Proyecto'}</h1>
        <p>{project?.description || 'Sin descripción'}</p>
      </header>

      <main className="project-content">
        <div className="project-stats">
          <h2>Resumen del Proyecto</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Tickets</h3>
              <span className="stat-number">{tickets.length}</span>
            </div>
            <div className="stat-card">
              <h3>En Progreso</h3>
              <span className="stat-number">
                {tickets.filter(ticket => ticket.status === 'in_progress').length}
              </span>
            </div>
            <div className="stat-card">
              <h3>Pendientes</h3>
              <span className="stat-number">
                {tickets.filter(ticket => ticket.status === 'open').length}
              </span>
            </div>
          </div>
        </div>

        <section className="tickets-section">
          <h2>Tickets del Proyecto</h2>
          <div className="tickets-list">
            {tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <h4>{ticket.title}</h4>
                <p>{ticket.description}</p>
                <div className="ticket-meta">
                  <span className={`priority ${ticket.priority}`}>
                    {ticket.priority}
                  </span>
                  <span className={`status ${ticket.status}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDashboard;