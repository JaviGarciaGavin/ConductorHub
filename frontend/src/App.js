import React, { useState } from 'react';
import Landing from './components/Landing/landing';
import Login from './components/Login/login';
import Register from './components/Register/register';
import Dashboard from './components/Dashboard/dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Simulación de base de datos
  const [users, setUsers] = useState([]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegister = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    setIsLoggedIn(true);
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('landing');
  };

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  // Renderizado condicional
  switch (currentView) {
    case 'login':
      return <Login 
        onLogin={handleLogin} 
        onNavigate={navigateTo} 
        users={users}
      />;
    case 'register':
      return <Register 
        onRegister={handleRegister} 
        onNavigate={navigateTo} 
        users={users}
      />;
    case 'dashboard':
      return <Dashboard 
        user={user} 
        onLogout={handleLogout} 
      />;
    default:
      return <Landing onNavigate={navigateTo} />;
  }
}

export default App;