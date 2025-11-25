import React, { useState, useEffect } from 'react';
import Landing from './components/Landing/landing';
import Login from './components/Login/login';
import Register from './components/Register/register';
import Dashboard from './components/Dashboard/dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
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
      setCurrentView('dashboard');
    }
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentView('dashboard');
    localStorage.setItem('conductorHub_user', JSON.stringify(userData));
  };

  const handleRegister = (newUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setIsLoggedIn(true);
    setUser(newUser);
    setCurrentView('dashboard');
    localStorage.setItem('conductorHub_user', JSON.stringify(newUser));
    localStorage.setItem('conductorHub_users', JSON.stringify(updatedUsers));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('landing');
    localStorage.removeItem('conductorHub_user');
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