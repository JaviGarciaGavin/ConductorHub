// src/components/Project/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import './ProjectDetail.css';

const ProjectDetail = ({ project, user, onBack }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'low' // low, medium, high, urgent
  });

  // Cargar tickets del proyecto
  useEffect(() => {
    fetchProjectTickets();
  }, [project]);

  const fetchProjectTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}/tickets`, {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ticketsArray = data['hydra:member'] || data || [];
        setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Iconos y colores por prioridad
  const getPriorityConfig = (priority) => {
    const config = {
      low: {
        icon: '◇',
        color: '#10B981',
        label: 'Baja',
        bgColor: 'rgba(16, 185, 129, 0.1)'
      },
      medium: {
        icon: '◇',
        color: '#F59E0B',
        label: 'Media',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      },
      high: {
        icon: '❗',
        color: '#EF4444',
        label: 'Alta',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      },
      urgent: {
        icon: '💀',
        color: '#DC2626',
        label: 'Urgente',
        bgColor: 'rgba(220, 38, 38, 0.1)'
      }
    };
    return config[priority] || config.low;
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) {
      alert('El título del ticket es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          title: newTicket.title,
          description: newTicket.description,
          priority: newTicket.priority,
          project: `/api/projects/${project.id}`,
          createdBy: `/api/users/${user.id}`,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const createdTicket = await response.json();
        setTickets(prev => [...prev, createdTicket]);
        setNewTicket({ title: '', description: '', priority: 'low' });
        setShowCreateTicket(false);
        alert('Ticket creado exitosamente!');
      } else {
        const errorData = await response.json();
        alert('Error al crear el ticket: ' + (errorData.detail || 'Inténtalo de nuevo'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="project-detail">
      {/* Header */}
      <header className="project-header">
        <button className="back-btn" onClick={onBack}>
          ← Volver
        </button>
        <div className="project-title">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <button 
          className="create-ticket-btn"
          onClick={() => setShowCreateTicket(true)}
        >
          + Nuevo Ticket
        </button>
      </header>

      {/* Panel principal */}
      <div className="project-layout">
        {/* Columna izquierda - Información del proyecto */}
        <div className="project-info">
          <div className="info-card">
            <h3>Información del Proyecto</h3>
            <div className="info-item">
              <strong>Creado:</strong> 
              <span>{new Date(project.createdAt || project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Tickets:</strong> 
              <span>{tickets.length}</span>
            </div>
            <div className="info-item">
              <strong>Propietario:</strong> 
              <span>{project.userOwner?.name || user.name}</span>
            </div>
          </div>
        </div>

        {/* Columna derecha - Lista de tickets */}
        <div className="tickets-section">
          <h2>Tickets del Proyecto</h2>
          
          {loading && <div className="loading">Cargando tickets...</div>}
          
          <div className="tickets-grid">
            {Array.isArray(tickets) && tickets.map(ticket => {
              const priorityConfig = getPriorityConfig(ticket.priority);
              
              return (
                <div 
                  key={ticket.id} 
                  className="ticket-card"
                  style={{ borderLeft: `4px solid ${priorityConfig.color}` }}
                >
                  <div className="ticket-header">
                    <div 
                      className="priority-indicator"
                      style={{ 
                        backgroundColor: priorityConfig.bgColor,
                        color: priorityConfig.color
                      }}
                      title={`Prioridad ${priorityConfig.label}`}
                    >
                      <span className="priority-icon">{priorityConfig.icon}</span>
                      <span className="priority-label">{priorityConfig.label}</span>
                    </div>
                    <span className="ticket-status">{ticket.status}</span>
                  </div>
                  
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">
                    {ticket.description || 'Sin descripción'}
                  </p>
                  
                  <div className="ticket-footer">
                    <span className="ticket-date">
                      {new Date(ticket.createdAt || ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className="ticket-author">
                      {ticket.createdBy?.name || 'Usuario'}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Mensaje si no hay tickets */}
            {!loading && Array.isArray(tickets) && tickets.length === 0 && (
              <div className="no-tickets">
                <p>No hay tickets en este proyecto</p>
                <p>Crea el primer ticket para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear ticket */}
      {showCreateTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Nuevo Ticket</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateTicket(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="ticketTitle">Título del Ticket *</label>
                <input
                  type="text"
                  id="ticketTitle"
                  name="title"
                  value={newTicket.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Error en el login"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ticketDescription">Descripción</label>
                <textarea
                  id="ticketDescription"
                  name="description"
                  value={newTicket.description}
                  onChange={handleInputChange}
                  placeholder="Describe el problema o tarea..."
                  className="form-textarea"
                  rows="4"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ticketPriority">Prioridad</label>
                <select
                  id="ticketPriority"
                  name="priority"
                  value={newTicket.priority}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="low">◇ Baja</option>
                  <option value="medium">◇ Media</option>
                  <option value="high">❗ Alta</option>
                  <option value="urgent">💀 Urgente</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateTicket(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateTicket}
                disabled={loading || !newTicket.title.trim()}
              >
                {loading ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;