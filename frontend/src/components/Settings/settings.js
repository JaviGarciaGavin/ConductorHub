import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import './settings.css';

const Settings = ({ user, onBack, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Estados para proyectos
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar proyectos del usuario cuando se active la pestaña
  useEffect(() => {
    if (activeTab === 'projects' && user?.id) {
      fetchUserProjects();
    }
  }, [activeTab, user?.id]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Función para cargar proyectos del usuario
  const fetchUserProjects = async () => {
    setProjectsLoading(true);
    try {
      // Obtener proyectos donde el usuario es dueño
      const response = await fetch(`http://localhost:8000/api/projects?userOwner=/api/users/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const projects = data.member || data['hydra:member'] || [];
        setUserProjects(projects);
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      showMessage('Error cargando proyectos', 'danger');
    } finally {
      setProjectsLoading(false);
    }
  };

  // Función para preparar borrado de proyecto
  const handlePrepareDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Función para borrar proyecto con todo su contenido
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setDeletingProjectId(projectToDelete.id);
    
    try {
      // PRIMERO: Obtener y borrar todos los tickets del proyecto
      const ticketsResponse = await fetch('http://localhost:8000/api/tickets');
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        const allTickets = ticketsData.member || ticketsData['hydra:member'] || [];
        
        // Filtrar tickets de este proyecto
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
          
          return ticketProjectId === projectToDelete.id;
        });

        console.log(`Borrando ${projectTickets.length} tickets del proyecto ${projectToDelete.id}`);
        
        // Para cada ticket, borrar primero sus comentarios y luego el ticket
        for (const ticket of projectTickets) {
          // Borrar comentarios del ticket
          const commentsResponse = await fetch('http://localhost:8000/api/comments');
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            const allComments = commentsData.member || commentsData['hydra:member'] || [];
            
            const ticketComments = allComments.filter(comment => {
              const commentTicket = comment.ticket;
              let commentTicketId = null;
              
              if (typeof commentTicket === 'string') {
                const match = commentTicket.match(/\/api\/tickets\/(\d+)/);
                if (match) {
                  commentTicketId = parseInt(match[1]);
                }
              } else if (commentTicket && commentTicket.id) {
                commentTicketId = commentTicket.id;
              }
              
              return commentTicketId === ticket.id;
            });

            // Borrar cada comentario
            for (const comment of ticketComments) {
              await fetch(`http://localhost:8000/api/comments/${comment.id}`, {
                method: 'DELETE'
              });
            }
          }

          // Borrar el ticket
          await fetch(`http://localhost:8000/api/tickets/${ticket.id}`, {
            method: 'DELETE'
          });
        }

        // SEGUNDO: Borrar miembros del proyecto
        const membersResponse = await fetch(`http://localhost:8000/api/project_members?project=/api/projects/${projectToDelete.id}`);
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          const projectMembers = membersData.member || membersData['hydra:member'] || [];
          
          for (const member of projectMembers) {
            await fetch(`http://localhost:8000/api/project_members/${member.id}`, {
              method: 'DELETE'
            });
          }
        }

        // TERCERO: Borrar invitaciones del proyecto
        const invitationsResponse = await fetch(`http://localhost:8000/api/project_invitations?project=/api/projects/${projectToDelete.id}`);
        if (invitationsResponse.ok) {
          const invitationsData = await invitationsResponse.json();
          const projectInvitations = invitationsData.member || invitationsData['hydra:member'] || [];
          
          for (const invitation of projectInvitations) {
            await fetch(`http://localhost:8000/api/project_invitations/${invitation.id}`, {
              method: 'DELETE'
            });
          }
        }

        // CUARTO: Borrar el proyecto
        const deleteResponse = await fetch(`http://localhost:8000/api/projects/${projectToDelete.id}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok || deleteResponse.status === 204) {
          // Actualizar la lista de proyectos
          setUserProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
          showMessage(`Proyecto "${projectToDelete.name}" borrado con éxito`, 'success');
        } else {
          throw new Error('Error al borrar el proyecto');
        }
      }
    } catch (error) {
      console.error('Error borrando proyecto:', error);
      showMessage(`Error al borrar el proyecto: ${error.message}`, 'danger');
    } finally {
      setDeletingProjectId(null);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 7) {
      errors.push('Mínimo 7 caracteres');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Al menos un número');
    }
    
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'La contraseña actual es obligatoria';
      isValid = false;
    }

    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      errors.newPassword = `Requisitos: ${passwordErrors.join(', ')}`;
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          name: profileData.name
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        showMessage('Perfil actualizado correctamente', 'success');
        
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.message || 'Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(passwordData.newPassword, saltRounds);

      const response = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json',
        },
        body: JSON.stringify({
          password: hashedPassword
        })
      });

      if (response.ok) {
        showMessage('Contraseña cambiada correctamente', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage(error.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-page bg-dark min-vh-100">
      {/* Header con Bootstrap */}
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <span className="navbar-brand mb-0 h1 fs-3 fw-bold text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-icon lucide-ticket">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
               onductorHub
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-outline-light d-flex align-items-center gap-2"
              onClick={onBack}
            >
              <i className="bi bi-arrow-left"></i>
              Volver al Dashboard
            </button>
            
            <span className="text-light fw-medium bg-secondary bg-opacity-25 px-3 py-1 rounded">
              {user?.name}
            </span>
          </div>
        </div>
      </nav>

      {/* Mensaje de notificación */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show m-3 position-fixed top-0 end-0 z-3`}
             style={{maxWidth: '400px'}}>
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ text: '', type: '' })}
          ></button>
        </div>
      )}

      {/* Modal de confirmación para borrar proyecto */}
      {showDeleteModal && projectToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-danger">
              <div className="modal-header border-danger">
                <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmar Borrado
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  disabled={deletingProjectId !== null}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>¡ADVERTENCIA!</strong> Esta acción no se puede deshacer.
                </div>
                <p className="text-light">
                  ¿Estás seguro de que quieres borrar el proyecto <strong className="text-warning">"{projectToDelete.name}"</strong>?
                </p>
                <p className="text-muted small">
                  Se borrarán permanentemente:
                  <ul className="mt-2">
                    <li>Todos los tickets del proyecto</li>
                    <li>Todos los comentarios de los tickets</li>
                    <li>Todos los miembros del proyecto</li>
                    <li>Todas las invitaciones pendientes</li>
                  </ul>
                </p>
              </div>
              <div className="modal-footer border-danger">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  disabled={deletingProjectId !== null}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeleteProject}
                  disabled={deletingProjectId !== null}
                >
                  {deletingProjectId !== null ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Borrando...
                    </>
                  ) : (
                    'Borrar Proyecto'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Sidebar de Navegación */}
          <div className="col-md-3 col-lg-2">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h6 className="text-uppercase text-muted small fw-bold mb-3">Configuración</h6>
                
                <div className="d-flex flex-column gap-2">
                  <button 
                    className={`btn btn-sm d-flex align-items-center gap-2 text-start ${
                      activeTab === 'profile' 
                        ? 'btn-primary text-white' 
                        : 'btn-outline-secondary text-light'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person"></i>
                    <span>Perfil</span>
                  </button>
                  
                  <button 
                    className={`btn btn-sm d-flex align-items-center gap-2 text-start ${
                      activeTab === 'security' 
                        ? 'btn-primary text-white' 
                        : 'btn-outline-secondary text-light'
                    }`}
                    onClick={() => setActiveTab('security')}
                  >
                    <i className="bi bi-shield-lock"></i>
                    <span>Seguridad</span>
                  </button>
                  
                  <button 
                    className={`btn btn-sm d-flex align-items-center gap-2 text-start ${
                      activeTab === 'projects' 
                        ? 'btn-primary text-white' 
                        : 'btn-outline-secondary text-light'
                    }`}
                    onClick={() => setActiveTab('projects')}
                  >
                    <i className="bi bi-folder"></i>
                    <span>Mis Proyectos</span>
                    {userProjects.length > 0 && (
                      <span className="badge bg-secondary ms-auto">
                        {userProjects.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de la Configuración */}
          <div className="col-md-9 col-lg-10">
            <div className="row g-4">
              {activeTab === 'profile' && (
                <div className="col-12">
                  <div className="card bg-dark border-secondary">
                    <div className="card-header bg-dark border-secondary">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-person text-primary fs-5"></i>
                        <h4 className="card-title mb-0 text-light">Información del Perfil</h4>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <form onSubmit={handleUpdateProfile}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-light">Nombre</label>
                            <input
                              type="text"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              placeholder="Tu nombre completo"
                              className="form-control bg-dark text-light border-secondary"
                            />
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label text-light">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={profileData.email}
                              disabled
                              className="form-control bg-dark text-light border-secondary"
                            />
                            <div className="form-text text-light opacity-75">
                              El email no se puede cambiar
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-top border-secondary">
                          <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Guardando...
                              </>
                            ) : (
                              'Guardar Cambios'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="col-12">
                  <div className="card bg-dark border-secondary">
                    <div className="card-header bg-dark border-secondary">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-shield-lock text-primary fs-5"></i>
                        <h4 className="card-title mb-0 text-light">Seguridad</h4>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <form onSubmit={handleChangePassword}>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label text-light">Contraseña Actual</label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              className={`form-control bg-dark text-light border-secondary ${
                                passwordErrors.currentPassword ? 'is-invalid' : ''
                              }`}
                            />
                            {passwordErrors.currentPassword && (
                              <div className="invalid-feedback">
                                {passwordErrors.currentPassword}
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label text-light">Nueva Contraseña</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              className={`form-control bg-dark text-light border-secondary ${
                                passwordErrors.newPassword ? 'is-invalid' : ''
                              }`}
                            />
                            {passwordErrors.newPassword && (
                              <div className="invalid-feedback">
                                {passwordErrors.newPassword}
                              </div>
                            )}
                            <div className="form-text text-muted">
                              Mínimo 7 caracteres, 1 mayúscula, 1 minúscula y 1 número
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label text-light">Confirmar Nueva Contraseña</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              className={`form-control bg-dark text-light border-secondary ${
                                passwordErrors.confirmPassword ? 'is-invalid' : ''
                              }`}
                            />
                            {passwordErrors.confirmPassword && (
                              <div className="invalid-feedback">
                                {passwordErrors.confirmPassword}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-top border-secondary">
                          <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={passwordLoading}
                          >
                            {passwordLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Cambiando...
                              </>
                            ) : (
                              'Cambiar Contraseña'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="col-12">
                  <div className="card bg-dark border-secondary">
                    <div className="card-header bg-dark border-secondary">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-folder text-primary fs-5"></i>
                        <h4 className="card-title mb-0 text-light">Mis Proyectos</h4>
                        <span className="badge bg-primary ms-2">
                          {userProjects.length} proyectos
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      {projectsLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando proyectos...</span>
                          </div>
                          <p className="text-light mt-3">Cargando tus proyectos...</p>
                        </div>
                      ) : userProjects.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-folder-x text-muted fs-1"></i>
                          <p className="text-light mt-3">No tienes proyectos creados</p>
                          <p className="text-muted">Los proyectos que crees aparecerán aquí</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-dark table-hover">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Creado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userProjects.map(project => (
                                <tr key={project.id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <i className="bi bi-folder2 text-warning me-2"></i>
                                      <strong>{project.name}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <small>
                                      {project.description || 'Sin descripción'}
                                    </small>
                                  </td>
                                  <td>
                                    <small>
                                      {new Date(project.createdAt).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </small>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handlePrepareDeleteProject(project)}
                                        disabled={deletingProjectId === project.id}
                                        title="Borrar proyecto y todo su contenido"
                                      >
                                        {deletingProjectId === project.id ? (
                                          <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                          <i className="bi bi-trash"></i>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-top border-secondary">
                        <div className="alert alert-warning bg-dark border-warning text-warning">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          <strong>Nota:</strong> Solo puedes borrar proyectos de los que seas el dueño.
                          Esta acción borrará permanentemente todos los tickets, comentarios, miembros e invitaciones del proyecto.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default Settings;