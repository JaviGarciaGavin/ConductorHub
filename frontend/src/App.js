import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing/landing';
import Login from './components/Login/login';
import Register from './components/Register/register';
import Dashboard from './components/Dashboard/dashboard';
import ProjectDashboard from './components/ProjectDashboard/ProjectDashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Cargar estado al iniciar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('conductorHub_user');
    const savedUsers = localStorage.getItem('conductorHub_users');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('conductorHub_user', JSON.stringify(userData));
  };

  const handleRegister = (newUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setIsLoggedIn(true);
    setUser(newUser);
    localStorage.setItem('conductorHub_user', JSON.stringify(newUser));
    localStorage.setItem('conductorHub_users', JSON.stringify(updatedUsers));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('conductorHub_user');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Landing />
            } 
          />
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} users={users} />
            } 
          />
          <Route 
            path="/register" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" replace /> : 
                <Register onRegister={handleRegister} users={users} />
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              isLoggedIn ? 
                <Dashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/project/:projectId" 
            element={
              isLoggedIn ? 
                <ProjectDashboard user={user} /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;