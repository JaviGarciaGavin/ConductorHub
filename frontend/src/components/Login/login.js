import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import './login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Buscando usuario:', email);
      
      // Obtener TODOS los usuarios
      const response = await fetch('http://localhost:8000/api/users');
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      const users = data.member || data['hydra:member'] || [];
      console.log('Usuarios encontrados:', users.length);
      
      const user = users.find(u => u.email === email);
      console.log('Usuario encontrado:', user ? user.email : 'NO');
      
      if (user) {
        console.log('Verificando contraseña...');
        console.log('Hash en BD:', user.password);
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
          console.log('Login exitoso!');
          onLogin(user);
        } else {
          console.log('Contraseña incorrecta');
          setError('Contraseña incorrecta');
        }
      } else {
        console.log('Usuario no encontrado');
        setError('Usuario no encontrado');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Volver
        </button>
        <h2 className="auth-title">Iniciar Sesión</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
          
          <div className="auth-link">
            <span>¿No tienes cuenta? </span>
            <button 
              type="button"
              className="link-button"
              onClick={() => navigate('/register')}
            >
              Regístrate aquí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;