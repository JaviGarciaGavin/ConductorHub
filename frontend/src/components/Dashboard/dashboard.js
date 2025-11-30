import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Settings from '../Settings/settings';
import './dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [projectTickets, setProjectTickets] = useState({});
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  // Estados para la campanita de notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // AÑADIR ESTADO PARA EL USUARIO ACTUALIZADO
  const [currentUser, setCurrentUser] = useState(user);

  // Actualizar currentUser cuando user cambie
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Cargar proyectos del usuario al montar el componente
  useEffect(() => {
    fetchUserProjects();
    fetchPendingInvitations();
  }, [currentUser]); // Cambiar a currentUser

  // AÑADIR ESTA FUNCIÓN PARA ACTUALIZAR EL USUARIO
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    // También actualizar en localStorage si lo usas
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  // Cargar invitaciones pendientes
  const fetchPendingInvitations = async () => {
    if (!currentUser?.email) return;
    
    try {
      setLoadingNotifications(true);
      console.log('🔍 Buscando invitaciones para:', currentUser.email);
      
      const response = await fetch('http://localhost:8000/api/project_invitations', {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 DATA COMPLETA DE API:', data);
        
        // CORREGIDO: Usar data.member en lugar de data['hydra:member']
        const allInvitations = data.member || data['hydra:member'] || [];
        
        console.log('📨 Todas las invitaciones:', allInvitations);
        
        // BUSCAR POR EMAIL
        const userInvitations = allInvitations.filter(invitation => {
          const matchesEmail = invitation.invitedEmail === currentUser.email;
          const isPending = invitation.status === 'pending';
          
          console.log(`🔍 Comparando: "${invitation.invitedEmail}" === "${currentUser.email}" && status: ${invitation.status} → ${matchesEmail && isPending}`);
          
          return matchesEmail && isPending;
        });
        
        console.log('✅ Invitaciones filtradas para', currentUser.email, ':', userInvitations);
        setNotifications(userInvitations);
      } else {
        console.log('❌ Error en la API:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Aceptar invitación
  const handleAcceptInvitation = async (invitationId) => {
    try {
      // Primero obtenemos la invitación completa
      const invitationResponse = await fetch(`http://localhost:8000/api/project_invitations/${invitationId}`, {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (!invitationResponse.ok) {
        alert('Error al obtener la invitación');
        return;
      }
      
      const invitation = await invitationResponse.json();
      
      // Crear el ProjectMember
      const memberResponse = await fetch('http://localhost:8000/api/project_members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          user: `/api/users/${currentUser.id}`,
          project: invitation.project,
          role: invitation.role || 'member',
          joinedAt: new Date().toISOString()
        })
      });
      
      if (memberResponse.ok) {
        // Actualizar la invitación a "accepted"
        const updateResponse = await fetch(`http://localhost:8000/api/project_invitations/${invitationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/ld+json',
            'Accept': 'application/ld+json',
          },
          body: JSON.stringify({
            ...invitation,
            status: 'accepted',
            acceptedAt: new Date().toISOString()
          })
        });
        
        if (updateResponse.ok) {
          setNotifications(prev => prev.filter(inv => inv.id !== invitationId));
          fetchUserProjects(); // Recargar proyectos
          alert('¡Invitación aceptada! Ahora eres miembro del proyecto.');
        }
      } else {
        alert('Error al unirse al proyecto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  // Rechazar invitación
  const handleRejectInvitation = async (invitationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/project_invitations/${invitationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(inv => inv.id !== invitationId));
        alert('Invitación rechazada');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserProjects = async () => {
    if (!currentUser || !currentUser.id) {
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
        
        if (data['hydra:member']) {
          projectsArray = data['hydra:member'];
        } else if (data.member) {
          projectsArray = data.member;
        } else if (Array.isArray(data)) {
          projectsArray = data;
        }
        
        // Filtrar proyectos del usuario actual usando el IRI
        const userProjects = projectsArray.filter(project => {
          const ownerIri = project.userOwner;
          return typeof ownerIri === 'string' 
            ? ownerIri.includes(`/api/users/${currentUser.id}`)
            : (ownerIri && ownerIri.id === currentUser.id);
        });
        
        setProjects(userProjects);
        
        // Cargar TODOS los tickets una sola vez y distribuirlos por proyecto
        await fetchAllTicketsAndDistribute(userProjects);
      } else {
        console.error('Error al cargar proyectos:', response.status);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Cargar todos los tickets y distribuirlos por proyecto
  const fetchAllTicketsAndDistribute = async (userProjects) => {
    try {
      const response = await fetch('http://localhost:8000/api/tickets', {
        headers: {
          'Accept': 'application/ld+json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allTickets = data['hydra:member'] || data.member || data || [];
        
        console.log('Todos los tickets cargados:', allTickets); // Para debug
        
        // Crear un objeto para almacenar tickets por proyecto
        const ticketsByProject = {};
        
        // Inicializar todos los proyectos con arrays vacíos
        userProjects.forEach(project => {
          ticketsByProject[project.id] = [];
        });
        
        // Distribuir tickets a sus proyectos correspondientes
        allTickets.forEach(ticket => {
          const ticketProject = ticket.project;
          let projectId = null;
          
          // Extraer el projectId del ticket
          if (typeof ticketProject === 'string') {
            // Si es un IRI como "/api/projects/1"
            const match = ticketProject.match(/\/api\/projects\/(\d+)/);
            if (match) {
              projectId = parseInt(match[1]);
            }
          } else if (ticketProject && ticketProject.id) {
            // Si es un objeto con id
            projectId = ticketProject.id;
          }
          
          // Si encontramos un projectId válido y el proyecto existe en userProjects
          if (projectId && ticketsByProject[projectId] !== undefined) {
            ticketsByProject[projectId].push(ticket);
          }
        });
        
        console.log('Tickets distribuidos por proyecto:', ticketsByProject); // Para debug
        
        // Actualizar el estado con los tickets distribuidos
        Object.keys(ticketsByProject).forEach(projectId => {
          const tickets = ticketsByProject[projectId];
          const counts = tickets.reduce((acc, ticket) => {
            const priority = ticket.priority || 'low';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
          }, { low: 0, medium: 0, high: 0, urgent: 0 });
          
          setProjectTickets(prev => ({
            ...prev,
            [projectId]: { tickets, counts }
          }));
        });
      }
    } catch (error) {
      console.error('Error cargando todos los tickets:', error);
      // Inicializar todos los proyectos con contadores en 0
      userProjects.forEach(project => {
        setProjectTickets(prev => ({
          ...prev,
          [project.id]: { tickets: [], counts: { low: 0, medium: 0, high: 0, urgent: 0 } }
        }));
      });
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
    return currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  };

  // Función para generar color basado en el nombre
  const getUserColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    if (!currentUser?.name) return colors[0];
    
    const index = currentUser.name.charCodeAt(0) % colors.length;
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
          userOwner: `/api/users/${currentUser.id}`
        })
      });

      if (response.ok) {
        const createdProject = await response.json();
        setProjects(prev => [...prev, createdProject]);
        setNewProject({ name: '', description: '' });
        setShowCreateProject(false);
        alert('Proyecto creado exitosamente!');
        
        // Recargar los tickets para incluir el nuevo proyecto
        fetchUserProjects();
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

  const pendingNotificationsCount = notifications.length;
  
  if (showSettings) {
    return (
      <Settings 
        user={currentUser} // Cambiar a currentUser
        onBack={() => setShowSettings(false)}
        onLogout={onLogout}
        onUserUpdate={handleUserUpdate} // ← AÑADIR ESTA PROP
      />
    );
  }

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
          {/* Campanita de Notificaciones */}
          <div className="notifications-bell">
            <button 
              className={`bell-btn ${pendingNotificationsCount > 0 ? 'has-notifications' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Invitaciones Pendientes"
            >
              🔔
              {pendingNotificationsCount > 0 && (
                <span className="notification-badge">{pendingNotificationsCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h4>Invitaciones Pendientes</h4>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowNotifications(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="notifications-list">
                  {loadingNotifications ? (
                    <div className="loading-notifications">Cargando...</div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      No tienes invitaciones pendientes
                    </div>
                  ) : (
                    notifications.map(invitation => (
                      <div key={invitation.id} className="notification-item">
                        <div className="notification-content">
                          <strong>Te han invitado a:</strong>
                          <p>{invitation.project?.name || 'Proyecto'}</p>
                          <small>Rol: {invitation.role || 'member'}</small>
                        </div>
                        
                        <div className="notification-actions">
                          <button 
                            className="accept-btn"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            title="Aceptar"
                          >
                            ✅
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleRejectInvitation(invitation.id)}
                            title="Rechazar"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="settings-btn" 
            title="Ajustes"
            onClick={() => setShowSettings(true)}
          >
          ⚙️
          </button>
          
          <div 
            className="user-avatar"
            style={{ backgroundColor: getUserColor() }}
            title={currentUser?.name || 'Usuario'}
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
                  
                  <button 
                    className="project-btn"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    Abrir Proyecto
                  </button>
                </div>
              );
            })}
            
            {/* Mostrar mensaje si no hay proyectos */}
            {!loading && Array.isArray(projects) && projects.length === 0 && (
              <div className="no-projects">
                <p>No tienes proyectos creados todavía.</p>
                <p>¡Crea uno primero!</p>
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