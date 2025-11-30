import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProjectDashboard.css';

const ProjectDashboard = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectOwner, setProjectOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para comentarios
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Estado para nuevo ticket
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'task'
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchProjectTickets();
      fetchProjectMembers();
    }
  }, [projectId]);

  // Cargar comentarios cuando se selecciona un ticket
  useEffect(() => {
    if (selectedTicket) {
      fetchComments(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
        
        // Cargar información del dueño
        const ownerIri = projectData.userOwner;
        if (typeof ownerIri === 'string') {
          const ownerResponse = await fetch(`http://localhost:8000${ownerIri}`);
          if (ownerResponse.ok) {
            const ownerData = await ownerResponse.json();
            setProjectOwner(ownerData);
          }
        } else if (ownerIri && ownerIri.id) {
          setProjectOwner(ownerIri);
        }
      }
    } catch (error) {
      console.error('Error cargando proyecto:', error);
    }
  };

  const fetchProjectTickets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tickets');
      if (response.ok) {
        const data = await response.json();
        const allTickets = data.member || data['hydra:member'] || data || [];
        
        // Filtrar manualmente los tickets que pertenecen a este proyecto
        const projectTickets = allTickets.filter(ticket => {
          const ticketProject = ticket.project;
          let ticketProjectId = null;
          
          if (typeof ticketProject === 'string') {
            const match = ticketProject.match(/\/api\/projects\/(\d+)/);
            if (match) {
              ticketProjectId = parseInt(match[1]);
            }
          } else if (ticketProject && ticketProject.id) {
            ticketProjectId = ticketProject.id;
          }
          
          return ticketProjectId === parseInt(projectId);
        });
        
        setTickets(projectTickets);
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar comentarios
  const fetchComments = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/comments?ticket=/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        const commentsArray = data.member || data['hydra:member'] || [];
        
        // Cargar detalles del autor para cada comentario
        const commentsWithAuthors = await Promise.all(
          commentsArray.map(async (comment) => {
            try {
              const userResponse = await fetch(`http://localhost:8000${comment.user}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...comment,
                  author: userData
                };
              }
            } catch (error) {
              console.error('Error cargando autor del comentario:', error);
            }
            return comment;
          })
        );
        
        setComments(commentsWithAuthors);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  // Función para agregar comentario
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;

    setCommentLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          content: newComment,
          createdAt: new Date().toISOString(),
          user: `/api/users/${user.id}`,
          ticket: `/api/tickets/${selectedTicket.id}`
        })
      });

      if (response.ok) {
        const createdComment = await response.json();
        
        // Cargar detalles del autor para el nuevo comentario
        const userResponse = await fetch(`http://localhost:8000/api/users/${user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const commentWithAuthor = {
            ...createdComment,
            author: userData
          };
          
          setComments(prev => [...prev, commentWithAuthor]);
          setNewComment('');
        }
      } else {
        alert('Error al agregar comentario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setCommentLoading(false);
    }
  };

  // NUEVA FUNCIÓN MEJORADA para cargar miembros
  const fetchProjectMembers = async () => {
    try {
      // Cargar miembros del proyecto
      const membersResponse = await fetch(`http://localhost:8000/api/project_members?project=/api/projects/${projectId}`);
      if (membersResponse.ok) {
        const data = await membersResponse.json();
        const membersArray = data.member || data['hydra:member'] || [];
        
        // Cargar detalles de cada miembro
        const membersWithDetails = await Promise.all(
          membersArray.map(async (member) => {
            try {
              const userResponse = await fetch(`http://localhost:8000${member.user}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...member,
                  userDetails: userData
                };
              }
            } catch (error) {
              console.error('Error cargando usuario:', error);
            }
            return member;
          })
        );
        
        setProjectMembers(membersWithDetails);
      }
    } catch (error) {
      console.error('Error cargando miembros:', error);
    }
  };

  // Función para obtener color del avatar
  const getUserColor = (userName) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    if (!userName) return colors[0];
    const index = userName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleCreateTicket = async (priority) => {
    setNewTicket(prev => ({ ...prev, priority }));
    setShowCreateTicketModal(true);
  };

  //Cambiar estado del ticket
  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    
    setActionLoading(true);
    try {
      // Usar PATCH en lugar de PUT para actualizar solo el campo necesario
      const response = await fetch(`http://localhost:8000/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
      });
  
      if (response.ok) {
        const updatedTicket = await response.json();
        
        // Actualizar el estado local inmediatamente
        setTickets(prev => prev.map(ticket => 
          ticket.id === selectedTicket.id ? updatedTicket : ticket
        ));
        setSelectedTicket(updatedTicket);
        
        console.log('Estado actualizado correctamente!');
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error al actualizar el estado: ${errorData.detail || 'Error del servidor'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al actualizar el estado');
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicket || !window.confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/tickets/${selectedTicket.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTickets(prev => prev.filter(ticket => ticket.id !== selectedTicket.id));
        setShowTicketModal(false);
        setSelectedTicket(null);
        alert('Ticket eliminado correctamente!');
      } else {
        alert('Error al eliminar el ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitNewTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title.trim()) return;

    try {
      const now = new Date().toISOString();
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
          category: newTicket.category,
          status: 'open',
          createdAt: now,
          updatedAt: now,
          userCreator: `/api/users/${user.id}`,
          project: `/api/projects/${projectId}`
        })
      });

      if (response.ok) {
        const createdTicket = await response.json();
        setTickets(prev => [...prev, createdTicket]);
        setNewTicket({
          title: '',
          description: '',
          priority: 'medium',
          category: 'task'
        });
        setShowCreateTicketModal(false);
        alert('Ticket creado exitosamente!');
      } else {
        alert('Error al crear el ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
  
    setInviteLoading(true);
    try {
      // Buscar usuario - AHORA SÍ FUNCIONA
      const userSearchResponse = await fetch(`http://localhost:8000/api/users?email=${encodeURIComponent(inviteEmail.trim())}`);
      
      if (!userSearchResponse.ok) throw new Error('Error buscando usuario');
  
      const userData = await userSearchResponse.json();
      const users = userData.member || [];
      
      if (users.length === 0) {
        alert('❌ Usuario no encontrado.');
        return;
      }
  
      const foundUser = users[0];
  
      // Enviar invitación
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
  
      const invitationData = {
        invitedEmail: foundUser.email,
        invitedUser: `/api/users/${foundUser.id}`,
        project: `/api/projects/${projectId}`,
        inviter: `/api/users/${user.id}`,
        role: 'member',
        status: 'pending',
        token: `invite_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        expiresAt: expiresAt.toISOString()
      };
  
      const response = await fetch('http://localhost:8000/api/project_invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify(invitationData)
      });
  
      if (response.ok) {
        alert(`✅ Invitación enviada a ${foundUser.name} (${foundUser.email})`);
        setInviteEmail('');
        setShowInviteModal(false);
        fetchProjectMembers(); // Recargar miembros
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.detail || 'No se pudo enviar la invitación'}`);
      }
  
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    } finally {
      setInviteLoading(false);
    }
  };

  // Agrupar tickets por prioridad
  const ticketsByPriority = {
    low: tickets.filter(ticket => ticket.priority === 'low'),
    medium: tickets.filter(ticket => ticket.priority === 'medium'),
    high: tickets.filter(ticket => ticket.priority === 'high'),
    urgent: tickets.filter(ticket => ticket.priority === 'urgent')
  };

  const priorityConfig = {
    low: { 
      label: 'Baja', 
      color: '#10B981', 
      bgColor: 'rgba(16, 185, 129, 0.25)',
      borderColor: 'rgba(16, 185, 129, 0.6)',
      glow: 'rgba(16, 185, 129, 0.3)',
      icon: '◇',
      class: 'success' 
    },
    medium: { 
      label: 'Media', 
      color: '#F59E0B', 
      bgColor: 'rgba(245, 158, 11, 0.25)',
      borderColor: 'rgba(245, 158, 11, 0.6)',
      glow: 'rgba(245, 158, 11, 0.3)',
      icon: '◇',  
      class: 'warning' 
    },
    high: { 
      label: 'Alta', 
      color: '#EF4444', 
      bgColor: 'rgba(239, 68, 68, 0.25)',
      borderColor: 'rgba(239, 68, 68, 0.6)',
      glow: 'rgba(239, 68, 68, 0.3)',
      icon: '❗', 
      class: 'danger' 
    },
    urgent: { 
      label: 'Urgente', 
      color: '#DC2626', 
      bgColor: 'rgba(220, 38, 38, 0.25)',
      borderColor: 'rgba(220, 38, 38, 0.6)',
      glow: 'rgba(220, 38, 38, 0.3)',
      icon: '💀', 
      class: 'dark' 
    }
  };

  const statusConfig = {
    open: { label: 'Abierto', class: 'secondary', color: '#6B7280' },
    in_progress: { label: 'En Progreso', class: 'primary', color: '#3B82F6' },
    closed: { label: 'Cerrado', class: 'success', color: '#10B981' }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando proyecto...</span>
      </div>
    </div>
  );

  return (
    <div className="project-dashboard">
      {/* Header */}
      <header className="project-dashboard-header bg-dark text-white py-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <div className="project-dashboard-logo fs-4 fw-bold">
                  🚀 ConductorHub
                </div>
              </div>
            </div>
            
            <div className="col-md-4 text-center">
              <h1 className="h4 mb-1 fw-bold">{project?.name || 'Proyecto'}</h1>
              <p className="mb-0 text-muted small">
                {project?.description || 'Sin descripción'}
              </p>
              <small className="text-info">
                {tickets.length} tickets en este proyecto
              </small>
            </div>
            
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={handleBackToDashboard}
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container-fluid py-4">
        <div className="row">
          {/* Sección Tickets - 75% */}
          <div className="col-lg-9 mb-4">
            <div className="card project-dashboard-main-card border-0">
              <div className="card-header project-dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Tickets del Proyecto</h5>
                <span className="badge bg-primary">{tickets.length} tickets</span>
              </div>
              <div className="card-body p-3">
                <div className="row g-3">
                  {Object.entries(priorityConfig).map(([priority, config]) => (
                    <div key={priority} className="col-xl-3 col-lg-6 col-md-6">
                      <div 
                        className="project-dashboard-priority-column rounded-3 h-100"
                        style={{ 
                          backgroundColor: config.bgColor,
                          border: `2px solid ${config.borderColor}`,
                          boxShadow: `0 8px 32px ${config.glow}`
                        }}
                      >
                        <div className="p-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold" style={{ color: config.color }}>
                              {config.icon} {config.label}
                            </h6>
                            <span 
                              className="badge rounded-pill fw-bold"
                              style={{ 
                                backgroundColor: config.color,
                                color: 'white',
                                fontSize: '0.8rem'
                              }}
                            >
                              {ticketsByPriority[priority].length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-2" style={{ minHeight: '250px' }}>
                          {ticketsByPriority[priority].map(ticket => (
                            <div 
                              key={ticket.id} 
                              className="project-dashboard-ticket-card card mb-2 border-0"
                              onClick={() => handleTicketClick(ticket)}
                            >
                              <div className="card-body p-3">
                                <h6 className="card-title mb-2 fw-semibold">{ticket.title}</h6>
                                <p className="card-text small text-muted mb-2">
                                  {ticket.description?.substring(0, 80)}...
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span 
                                    className="badge rounded-pill"
                                    style={{ 
                                      backgroundColor: statusConfig[ticket.status]?.color,
                                      color: 'white'
                                    }}
                                  >
                                    {statusConfig[ticket.status]?.label || ticket.status}
                                  </span>
                                  <small className="text-muted">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {ticketsByPriority[priority].length === 0 && (
                            <div className="text-center text-muted py-4">
                              <small>No hay tickets</small>
                            </div>
                          )}
                          
                          {/* Botón para añadir ticket */}
                          <button
                            className="btn w-100 mt-2 project-dashboard-add-btn"
                            onClick={() => handleCreateTicket(priority)}
                            style={{ 
                              backgroundColor: `${config.color}15`,
                              border: `2px dashed ${config.color}`,
                              color: config.color,
                              fontWeight: '600'
                            }}
                          >
                            + Añadir Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sección Miembros - 25% */}
          <div className="col-lg-3">
            <div className="card project-dashboard-main-card border-0">
              <div className="card-header project-dashboard-card-header">
                <h5 className="mb-0 fw-bold">Miembros del Proyecto</h5>
              </div>
              <div className="card-body p-3">
                <div className="mb-3">
                  {/* Mostrar dueño primero */}
                  {projectOwner && (
                    <div key="owner" className="project-dashboard-member-card d-flex align-items-center mb-2 p-2 rounded-3 owner-member">
                      <div 
                        className="project-dashboard-member-avatar rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ backgroundColor: getUserColor(projectOwner.name) }}
                      >
                        {projectOwner.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold d-flex align-items-center">
                          {projectOwner.name || 'Dueño'}
                          <span className="owner-crown ms-2" title="Dueño">👑</span>
                          {projectOwner.id === user.id && (
                            <span className="badge bg-info ms-2">Tú</span>
                          )}
                        </div>
                        <small className="text-muted">{projectOwner.email || ''}</small>
                        <div>
                          <span className="badge bg-primary me-1">Owner</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar otros miembros */}
                  {projectMembers
                    .filter(member => member.userDetails && member.userDetails.id !== projectOwner?.id)
                    .map(member => (
                      <div key={member.id} className="project-dashboard-member-card d-flex align-items-center mb-2 p-2 rounded-3">
                        <div 
                          className="project-dashboard-member-avatar rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ backgroundColor: getUserColor(member.userDetails?.name) }}
                        >
                          {member.userDetails?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold d-flex align-items-center">
                            {member.userDetails?.name || 'Usuario'}
                            {member.userDetails?.id === user.id && (
                              <span className="badge bg-info ms-2">Tú</span>
                            )}
                          </div>
                          <small className="text-muted">{member.userDetails?.email || ''}</small>
                          <div>
                            <span className={`badge ${
                              member.role === 'admin' ? 'bg-warning' : 
                              member.role === 'member' ? 'bg-secondary' : 'bg-secondary'
                            } me-1`}>
                              {member.role === 'admin' ? 'Admin' : 
                               member.role === 'member' ? 'Member' : member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  
                  {/* Mensaje si no hay miembros */}
                  {projectMembers.length === 0 && !projectOwner && (
                    <div className="text-center text-muted py-3">
                      <small>No hay miembros en el proyecto</small>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary w-100 project-dashboard-invite-btn"
                  onClick={() => setShowInviteModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Invitar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para detalles del ticket CON COMENTARIOS */}
      {showTicketModal && selectedTicket && (
        <div className="modal show d-block project-dashboard-modal-overlay">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content project-dashboard-modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedTicket.title}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTicketModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6 mb-2">
                    <strong>Prioridad:</strong>
                    <span 
                      className="badge rounded-pill fw-bold ms-2"
                      style={{ 
                        backgroundColor: priorityConfig[selectedTicket.priority]?.color,
                        color: 'white'
                      }}
                    >
                      {priorityConfig[selectedTicket.priority]?.icon} {priorityConfig[selectedTicket.priority]?.label}
                    </span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Estado:</strong>
                    <span 
                      className="badge rounded-pill fw-bold ms-2"
                      style={{ 
                        backgroundColor: statusConfig[selectedTicket.status]?.color,
                        color: 'white'
                      }}
                    >
                      {statusConfig[selectedTicket.status]?.label}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <strong>Categoría:</strong>
                  <span className="badge bg-info ms-2 text-capitalize">
                    {selectedTicket.category || 'task'}
                  </span>
                </div>

                <div className="mb-4">
                  <strong>Descripción:</strong>
                  <p className="mt-2 p-3 bg-dark rounded">
                    {selectedTicket.description || 'Sin descripción'}
                  </p>
                </div>

                {/* SECCIÓN DE COMENTARIOS */}
                <div className="mb-4 border-top pt-3">
                  <h6 className="fw-bold mb-3">💬 Comentarios ({comments.length})</h6>
                  
                  {/* Lista de comentarios */}
                  <div className="comments-section mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <div key={comment.id} className="comment-item mb-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div 
                                className="comment-avatar rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ 
                                  backgroundColor: getUserColor(comment.author?.name),
                                  width: '32px',
                                  height: '32px',
                                  fontSize: '0.8rem',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              >
                                {comment.author?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <strong className="d-block">{comment.author?.name || 'Usuario'}</strong>
                                <small className="text-muted">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </small>
                              </div>
                            </div>
                            {comment.author?.id === user.id && (
                              <span className="badge bg-info">Tú</span>
                            )}
                          </div>
                          <p className="mb-0">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-3">
                        <small>No hay comentarios aún</small>
                      </div>
                    )}
                  </div>

                  {/* Formulario para nuevo comentario */}
                  <form onSubmit={handleAddComment}>
                    <div className="mb-2">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                        disabled={commentLoading || !newComment.trim()}
                      >
                        {commentLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Enviando...
                          </>
                        ) : 'Agregar Comentario'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Controles para cambiar estado y eliminar */}
                <div className="border-top pt-3">
                  <div className="row">
                    <div className="col-md-8">
                      <strong>Cambiar Estado:</strong>
                      <div className="btn-group mt-2" role="group">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <button
                            key={status}
                            type="button"
                            className={`btn btn-${selectedTicket.status === status ? config.class : 'outline-' + config.class} btn-sm`}
                            onClick={() => handleStatusChange(status)}
                            disabled={actionLoading}
                          >
                            {actionLoading && selectedTicket.status === status ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            ) : null}
                            {config.label}
                          </button>
                        ))}
                      </div>
                      {actionLoading && (
                        <small className="text-muted mt-1 d-block">Actualizando estado...</small>
                      )}
                    </div>
                    <div className="col-md-4 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleDeleteTicket}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          '🗑️ Eliminar'
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row text-muted mt-4 pt-3 border-top">
                  <div className="col-md-6">
                    <small><strong>Creado:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="col-md-6">
                    <small><strong>Actualizado:</strong> {new Date(selectedTicket.updatedAt).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTicketModal(false)}
                  disabled={actionLoading}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear ticket */}
      {showCreateTicketModal && (
        <div className="modal show d-block project-dashboard-modal-overlay">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content project-dashboard-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Ticket</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateTicketModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitNewTicket}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Título *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título del ticket"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del ticket"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Prioridad</label>
                      <select
                        className="form-select"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="task">Tarea</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="improvement">Mejora</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateTicketModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para invitar usuarios */}
      {showInviteModal && (
        <div className="modal show d-block project-dashboard-modal-overlay">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content project-dashboard-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invitar Usuario al Proyecto</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <form onSubmit={handleInviteUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="inviteEmail" className="form-label">Email del usuario</label>
                    <input
                      type="email"
                      className="form-control"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Enviando...
                      </>
                    ) : 'Enviar Invitación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;