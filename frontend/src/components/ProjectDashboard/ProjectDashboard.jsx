import React, { useState, useEffect } from 'react';
import './ProjectDashboard.css';

const ProjectDashboard = ({ project, user, onNavigate }) => {
  const [tickets, setTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Prioridades para las columnas
  const priorities = {
    critical: { label: 'Crítico', color: '#dc3545', tickets: [] },
    high: { label: 'Alta', color: '#fd7e14', tickets: [] },
    medium: { label: 'Media', color: '#ffc107', tickets: [] },
    low: { label: 'Baja', color: '#198754', tickets: [] }
  };

  useEffect(() => {
    fetchProjectData();
  }, [project?.id]);

  const fetchProjectData = async () => {
    try {
      // Obtener tickets del proyecto
      const ticketsRes = await fetch(`/api/tickets?project.id=${project.id}`);
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData['hydra:member'] || []);

      // Obtener miembros del proyecto
      const membersRes = await fetch(`/api/project_members?project.id=${project.id}`);
      const membersData = await membersRes.json();
      setMembers(membersData['hydra:member'] || []);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      const response = await fetch('/api/project_invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify({
          project: `/api/projects/${project.id}`,
          invitedEmail: newMemberEmail,
          inviter: `/api/users/${user.id}`,
          role: 'member',
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (response.ok) {
        setNewMemberEmail('');
        alert('Invitación enviada');
      }
    } catch (error) {
      console.error('Error enviando invitación:', error);
    }
  };

  // Organizar tickets por prioridad
  const organizedTickets = { ...priorities };
  tickets.forEach(ticket => {
    if (organizedTickets[ticket.priority]) {
      organizedTickets[ticket.priority].tickets.push(ticket);
    }
  });

  if (loading) return <div className="loading">Cargando proyecto...</div>;

  return (
    <div className="project-dashboard">
      {/* Header */}
      <header className="project-header">
        <div className="header-content">
          <div className="project-info">
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => onNavigate('create-ticket')}>
              + Nuevo Ticket
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('projects')}>
              ← Volver a Proyectos
            </button>
          </div>
        </div>
      </header>

      <div className="project-content">
        {/* Main Content - Columnas de Tickets */}
        <main className="tickets-board">
          {Object.entries(organizedTickets).map(([priorityKey, priority]) => (
            <div key={priorityKey} className="ticket-column">
              <div className="column-header" style={{ borderTopColor: priority.color }}>
                <h3>{priority.label}</h3>
                <span className="ticket-count">{priority.tickets.length}</span>
              </div>
              
              <div className="tickets-list">
                {priority.tickets.map(ticket => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      <span className="ticket-id">#{ticket.id}</span>
                      <span className="ticket-category">{ticket.category}</span>
                    </div>
                    <h4 className="ticket-title">{ticket.title}</h4>
                    <p className="ticket-description">{ticket.description}</p>
                    <div className="ticket-footer">
                      <span className="ticket-assignee">
                        {ticket.userAssigned?.name || 'Sin asignar'}
                      </span>
                      <span className="ticket-status">{ticket.status}</span>
                    </div>
                  </div>
                ))}
                
                {priority.tickets.length === 0 && (
                  <div className="empty-column">
                    No hay tickets con {priority.label.toLowerCase()} prioridad
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>

        {/* Sidebar - Miembros */}
        <aside className="project-sidebar">
          <div className="sidebar-section">
            <h3>Miembros del Proyecto</h3>
            <div className="members-list">
              {members.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.user.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Invitar Miembro</h3>
            <form onSubmit={inviteMember} className="invite-form">
              <input
                type="email"
                placeholder="email@ejemplo.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="email-input"
                required
              />
              <button type="submit" className="btn-invite">
                Invitar
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDashboard;