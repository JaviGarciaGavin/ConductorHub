import React, { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Animación inicial del header
    animate({
      targets: '.App-header',
      opacity: [0, 1],
      translateY: [-50, 0],
      duration: 1000,
      easing: 'easeOutElastic(1, .8)'
    });

    // Cargar tickets desde la API
    fetch('/api/tickets')
      .then(response => response.json())
      .then(data => {
        const ticketsData = data['hydra:member'] || [];
        setTickets(ticketsData);
        setLoading(false);
        
        // Animación para los tickets después de cargar
        setTimeout(() => {
          animate({
            targets: '.ticket-card',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: stagger(100),
            duration: 600,
            easing: 'easeOutExpo'
          });
        }, 500);
      })
      .catch(error => {
        console.error('Error loading tickets:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando tickets...</p>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <h2>🎫 Tickets del Sistema</h2>
      {tickets.length === 0 ? (
        <p className="no-tickets">No hay tickets creados aún</p>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <div className="ticket-meta">
              <span className={`status ${ticket.status}`}>
                {ticket.status}
              </span>
              <span className={`priority ${ticket.priority}`}>
                {ticket.priority}
              </span>
              <span className="category">
                {ticket.category}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TicketList;