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

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    fetchUserProjects();
    fetchPendingInvitations();
  }, [currentUser]);

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const fetchPendingInvitations = async () => {
    if (!currentUser?.email) return;
    
    try {
      setLoadingNotifications(true);
      const response = await fetch('http://localhost:8000/api/project_invitations', {
        headers: { 'Accept': 'application/ld+json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allInvitations = data.member || data['hydra:member'] || [];
        const userInvitations = allInvitations.filter(invitation => 
          invitation.invitedEmail === currentUser.email && invitation.status === 'pending'
        );
        setNotifications(userInvitations);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const invitationResponse = await fetch(`http://localhost:8000/api/project_invitations/${invitationId}`, {
        headers: { 'Accept': 'application/ld+json' }
      });
      
      if (!invitationResponse.ok) {
        alert('Error al obtener la invitación');
        return;
      }
      
      const invitation = await invitationResponse.json();
      
      let projectId;
      if (typeof invitation.project === 'string') {
        const match = invitation.project.match(/\/api\/projects\/(\d+)/);
        projectId = match ? match[1] : null;
      } else if (invitation.project && invitation.project.id) {
        projectId = invitation.project.id;
      }
      
      if (!projectId) {
        alert('Error: No se pudo obtener el ID del proyecto');
        return;
      }
      
      const memberResponse = await fetch('http://localhost:8000/api/project_members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          user: `/api/users/${currentUser.id}`,
          project: `/api/projects/${projectId}`,
          role: invitation.role || 'member',
          joinedAt: new Date().toISOString()
        })
      });
      
      if (memberResponse.ok) {
        const updateResponse = await fetch(`http://localhost:8000/api/project_invitations/${invitationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/merge-patch+json',
            'Accept': 'application/ld+json',
          },
          body: JSON.stringify({
            status: 'accepted',
            acceptedAt: new Date().toISOString()
          })
        });
        
        if (updateResponse.ok) {
          setNotifications(prev => prev.filter(inv => inv.id !== invitationId));
          fetchUserProjects();
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
      console.log('🔍 Buscando proyectos para usuario:', currentUser.id, currentUser.email);
      
      let userProjects = [];
  
      // 1. Cargar TODOS los proyectos
      const allProjectsResponse = await fetch('http://localhost:8000/api/projects', {
        headers: { 'Accept': 'application/ld+json' }
      });
      
      if (allProjectsResponse.ok) {
        const data = await allProjectsResponse.json();
        const allProjects = data.member || data['hydra:member'] || [];
        
        // 2. Cargar TODOS los project_members (el filtro no funciona)
        const membersResponse = await fetch('http://localhost:8000/api/project_members', {
          headers: { 'Accept': 'application/ld+json' }
        });
        
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          const allMembers = membersData.member || membersData['hydra:member'] || [];
          
          console.log('🔍 DEBUG - Todos los project_members:', allMembers);
          
          // FILTRAR MANUALMENTE los miembros del usuario actual
          const userMembers = allMembers.filter(member => {
            const userIri = member.user;
            let userId = null;
            
            if (typeof userIri === 'string') {
              const match = userIri.match(/\/api\/users\/(\d+)/);
              if (match) userId = parseInt(match[1]);
            } else if (userIri && userIri['@id']) {
              const match = userIri['@id'].match(/\/api\/users\/(\d+)/);
              if (match) userId = parseInt(match[1]);
            } else if (userIri && userIri.id) {
              userId = userIri.id;
            }
            
            const isUserMember = userId === currentUser.id;
            if (isUserMember) {
              console.log('✅ Miembro encontrado para usuario', currentUser.id, 'en proyecto:', member.project);
            }
            
            return isUserMember;
          });
          
          console.log('👥 Miembros del usuario actual:', userMembers.length);
          console.log('👥 Miembros detalle:', userMembers);
  
          // Obtener IDs de proyectos donde es miembro
          const memberProjectIds = userMembers.map(member => {
            const projectIri = member.project;
            if (typeof projectIri === 'string') {
              const match = projectIri.match(/\/api\/projects\/(\d+)/);
              return match ? parseInt(match[1]) : null;
            } else if (projectIri && projectIri.id) {
              return projectIri.id;
            } else if (projectIri && projectIri['@id']) {
              const match = projectIri['@id'].match(/\/api\/projects\/(\d+)/);
              return match ? parseInt(match[1]) : null;
            }
            return null;
          }).filter(id => id !== null);
  
          console.log('👥 Proyectos donde es miembro:', memberProjectIds);
  
          // Filtrar proyectos: owner O member
          userProjects = allProjects.filter(project => {
            // Verificar si es owner
            const ownerIri = project.userOwner;
            let ownerId = null;
            
            if (typeof ownerIri === 'string') {
              const match = ownerIri.match(/\/api\/users\/(\d+)/);
              if (match) ownerId = parseInt(match[1]);
            } else if (ownerIri && ownerIri.id) {
              ownerId = ownerIri.id;
            }
            
            const isOwner = ownerId === currentUser.id;
            const isMember = memberProjectIds.includes(project.id);
            
            if (isOwner) {
              console.log('✅ Usuario es OWNER del proyecto:', project.name);
              return true;
            }
            
            if (isMember) {
              // Encontrar el role del member
              const memberInfo = userMembers.find(member => {
                const memberProjectIri = member.project;
                let memberProjectId = null;
                
                if (typeof memberProjectIri === 'string') {
                  const match = memberProjectIri.match(/\/api\/projects\/(\d+)/);
                  if (match) memberProjectId = parseInt(match[1]);
                } else if (memberProjectIri && memberProjectIri.id) {
                  memberProjectId = memberProjectIri.id;
                } else if (memberProjectIri && memberProjectIri['@id']) {
                  const match = memberProjectIri['@id'].match(/\/api\/projects\/(\d+)/);
                  if (match) memberProjectId = parseInt(match[1]);
                }
                
                return memberProjectId === project.id;
              });
              
              console.log('✅ Usuario es MIEMBRO del proyecto:', project.name, 'Rol:', memberInfo?.role);
              
              // Añadir información del role al proyecto
              project.userRole = memberInfo?.role;
              project.isMember = true;
              return true;
            }
            
            return false;
          });
        }
      }
  
      console.log('🎯 Proyectos totales para el usuario:', userProjects.length);
      userProjects.forEach(project => {
        const role = project.isMember ? project.userRole : 'Owner';
        console.log('📋 Proyecto:', project.name, 'ID:', project.id, 'Rol:', role);
      });
  
      setProjects(userProjects);
      await fetchAllTicketsAndDistribute(userProjects);
      
    } catch (error) {
      console.error('❌ Error cargando proyectos:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTicketsAndDistribute = async (userProjects) => {
    try {
      const response = await fetch('http://localhost:8000/api/tickets', {
        headers: { 'Accept': 'application/ld+json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allTickets = data.member || data['hydra:member'] || data || [];
        
        const ticketsByProject = {};
        userProjects.forEach(project => {
          ticketsByProject[project.id] = [];
        });
        
        allTickets.forEach(ticket => {
          const ticketProject = ticket.project;
          let projectId = null;
          
          if (typeof ticketProject === 'string') {
            const match = ticketProject.match(/\/api\/projects\/(\d+)/);
            if (match) projectId = parseInt(match[1]);
          } else if (ticketProject && ticketProject.id) {
            projectId = ticketProject.id;
          }
          
          if (projectId && ticketsByProject[projectId] !== undefined) {
            ticketsByProject[projectId].push(ticket);
          }
        });
        
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
      console.error('Error cargando tickets:', error);
    }
  };

  const priorityConfig = {
    low: { icon: '◇', color: '#10B981', label: 'Baja' },
    medium: { icon: '◇', color: '#F59E0B', label: 'Media' },
    high: { icon: '❗', color: '#EF4444', label: 'Alta' },
    urgent: { icon: '💀', color: '#DC2626', label: 'Urgente' }
  };

  const getUserInitial = () => {
    return currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  };

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
        user={currentUser}
        onBack={() => setShowSettings(false)}
        onLogout={onLogout}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">🚀 ConductorHub</div>
        </div>
        
        <div className="header-right">
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
          
          <button className="logout-btn" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="projects-section">
          <h2>Mis Proyectos</h2>
          
          {loading && <div className="loading">Cargando...</div>}
          
          <div className="projects-grid">
            {Array.isArray(projects) && projects.map(project => {
              const ticketsData = projectTickets[project.id];
              const counts = ticketsData?.counts || { low: 0, medium: 0, high: 0, urgent: 0 };
              const isOwner = !project.isMember;
              
              return (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <div className="project-role-badge">
                      <span className={`role-badge ${isOwner ? 'Dueño' : (project.userRole === 'admin' ? 'Admin' : 'Miembro')}`}>
                        <span className={`badge-icon ${isOwner ? 'owner' : (project.userRole === 'admin' ? 'admin' : 'member')}`}></span>
                        {isOwner ? 'Dueño' : (project.userRole === 'admin' ? 'Admin' : 'Miembro')}
                      </span>
                    </div>
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
            
            {!loading && Array.isArray(projects) && projects.length === 0 && (
              <div className="no-projects">
                <p>No tienes proyectos creados todavía.</p>
                <p>¡Crea uno primero!</p>
              </div>
            )}
            
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