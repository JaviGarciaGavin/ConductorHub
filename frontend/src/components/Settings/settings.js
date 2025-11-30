import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import './settings.css';

// AÑADIR onUserUpdate A LAS PROPS
const Settings = ({ user, onBack, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
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
        
        // AÑADIR ESTO: ACTUALIZAR EL USUARIO EN EL PADRE
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
      // HASHEAR LA CONTRASEÑA
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

  // ... (resto de tu componente Settings igual)
  return (
    <div className="settings-page bg-dark min-vh-100">
      {/* Header con Bootstrap */}
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <span className="navbar-brand mb-0 h1 fs-3 fw-bold text-primary">
              🚀 ConductorHub
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