// src/components/Dashboard/dashboard.js
import React, { useState, useEffect } from 'react';
import './dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectTickets, setProjectTickets] = useState({}); // { projectId: {tickets: [], counts: {}} }
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  // Cargar proyectos del usuario al montar el componente
  useEffect(() => {
    fetchUserProjects();
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user || !user.id) {
      setProjects([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/projects', {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let projectsArray = [];
        
        if (data.member) {
          projectsArray = data.member;
        } else if (data['hydra:member']) {
          projectsArray = data['hydra:member'];
        } else if (Array.isArray(data)) {
          projectsArray = data;
        }
        
        // Filtrar proyectos del usuario actual
        const userProjects = projectsArray.filter(project => 
          (project.userOwner && project.userOwner.id === user.id) ||
          (typeof project.userOwner === 'string' && project.userOwner.includes(`/api/users/${user.id}`))
        );
        
        setProjects(userProjects);
        
        // Cargar tickets para cada proyecto
        userProjects.forEach(project => {
          fetchProjectTickets(project.id);
        });
      } else {
        console.error('Error al cargar proyectos');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar tickets de un proyecto
  const fetchProjectTickets = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tickets?project.id=${projectId}`, {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ticketsArray = data.member || data['hydra:member'] || data || [];
        const tickets = Array.isArray(ticketsArray) ? ticketsArray : [];
        
        // Contar tickets por prioridad
        const counts = tickets.reduce((acc, ticket) => {
          acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
          return acc;
        }, { low: 0, medium: 0, high: 0, urgent: 0 });
        
        setProjectTickets(prev => ({
          ...prev,
          [projectId]: { tickets, counts }
        }));
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    }
  };

  // Configuración de prioridades
  const priorityConfig = {
    low: { icon: '◇', color: '#10B981', label: 'Baja' },
    medium: { icon: '◇', color: '#F59E0B', label: 'Media' },
    high: { icon: '❗', color: '#EF4444', label: 'Alta' },
    urgent: { icon: '💀', color: '#DC2626', label: 'Urgente' }
  };

  // Función para obtener la inicial del usuario
  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  // Función para generar color basado en el nombre
  const getUserColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    if (!user?.name) return colors[0];
    
    const index = user.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const now = new Date().toISOString();
      
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          createdAt: now,
          updatedAt: now,
          userOwner: `/api/users/${user.id}`
        })
      });

      if (response.ok) {
        const createdProject = await response.json();
        setProjects(prev => [...prev, createdProject]);
        setNewProject({ name: '', description: '' });
        setShowCreateProject(false);
        alert('Proyecto creado exitosamente!');
      } else {
        const errorData = await response.json();
        alert('Error al crear el proyecto: ' + (errorData.detail || 'Inténtalo de nuevo'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            🚀 ConductorHub
          </div>
        </div>
        
        <div className="header-right">
          <button className="settings-btn" title="Ajustes">
            ⚙️
          </button>
          
          <div 
            className="user-avatar"
            style={{ backgroundColor: getUserColor() }}
            title={user?.name || 'Usuario'}
          >
            {getUserInitial()}
          </div>
          
          <button 
            className="logout-btn" 
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-content">
        <section className="projects-section">
          <h2>Mis Proyectos</h2>
          
          {loading && <div className="loading">Cargando...</div>}
          
          <div className="projects-grid">
            {/* Proyectos existentes */}
            {Array.isArray(projects) && projects.map(project => {
              const ticketsData = projectTickets[project.id];
              const counts = ticketsData?.counts || { low: 0, medium: 0, high: 0, urgent: 0 };
              
              return (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <div className="tickets-counter">
                      {Object.entries(priorityConfig).map(([priority, config]) => (
                        counts[priority] > 0 && (
                          <div 
                            key={priority} 
                            className="priority-counter"
                            style={{ borderColor: config.color }}
                            title={`${config.label}: ${counts[priority]} tickets`}
                          >
                            <span className="priority-icon" style={{ color: config.color }}>
                              {config.icon}
                            </span>
                            <span className="priority-count">
                              {counts[priority]}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  
                  <p>{project.description || 'Sin descripción'}</p>
                  
                  <div className="project-meta">
                    <span className="project-date">
                      Creado: {new Date(project.createdAt || project.created_at).toLocaleDateString()}
                    </span>
                    <span className="total-tickets">
                      Total: {ticketsData?.tickets?.length || 0} tickets
                    </span>
                  </div>
                  
                  <button className="project-btn">
                    Abrir Proyecto
                  </button>
                </div>
              );
            })}
            
            {/* Mostrar mensaje si no hay proyectos */}
            {!loading && Array.isArray(projects) && projects.length === 0 && (
              <div className="no-projects">
                <p>No tienes proyectos creados todavía.</p>
                <p>¡Crea tu primer proyecto!</p>
              </div>
            )}
            
            {/* Card para crear nuevo proyecto */}
            <div 
              className="project-card new-project-card"
              onClick={() => !loading && setShowCreateProject(true)}
            >
              <div className="new-project-content">
                <div className="plus-icon">+</div>
                <h3>Crear Nuevo Proyecto</h3>
                <p>Inicia un nuevo proyecto de trabajo</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal/Popup para crear proyecto */}
      {showCreateProject && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Nuevo Proyecto</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateProject(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="projectName">Nombre del Proyecto *</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Desarrollo Web App"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="projectDescription">Descripción</label>
                <textarea
                  id="projectDescription"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  placeholder="Describe el propósito de este proyecto..."
                  className="form-textarea"
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateProject(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateProject}
                disabled={loading || !newProject.name.trim()}
              >
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;