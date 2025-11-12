import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('probando...');
  const [ticketsCount, setTicketsCount] = useState(0);

  useEffect(() => {
    // Probar conexión con la API
    fetch('/api/tickets')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setApiStatus('✅ CONECTADO');
        setTicketsCount(data['hydra:totalItems'] || 0);
      })
      .catch(error => {
        setApiStatus(`❌ ERROR: ${error.message}`);
        console.error('Error:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 ConductorHub</h1>
        <p>Sistema de Gestión de Tickets</p>
      </header>
      <main>
        <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
          <h2>¡Frontend funcionando!</h2>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '10px',
            margin: '20px 0'
          }}>
            <p><strong>Estado del Backend:</strong> {apiStatus}</p>
            <p><strong>Tickets en sistema:</strong> {ticketsCount}</p>
            <p><strong>Backend URL:</strong> localhost:8000</p>
            <p><strong>Frontend URL:</strong> localhost:3000</p>
          </div>
          
          {/* Botón para probar manualmente */}
          <button 
            onClick={() => window.open('http://localhost:8000/api/tickets', '_blank')}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '10px'
            }}
          >
            🔗 Ver API en nueva pestaña
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;