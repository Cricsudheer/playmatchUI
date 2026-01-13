import React, { useState } from 'react';
import { mockEvents } from '../../data/mockData';

export const EventsPage = () => {
  const [filter, setFilter] = useState('upcoming');

  const getStatusBadge = (status) => {
    const badges = {
      YES: '✅ Confirmed',
      NO: '❌ Declined',
      PENDING: '⏱️ Not Responded'
    };
    return badges[status] || '⏱️ Pending';
  };

  const getEventIcon = (type) => {
    const icons = {
      PRACTICE_MATCH: '🏏',
      LEAGUE_MATCH: '🏆',
      TOURNAMENT: '🎪'
    };
    return icons[type] || '🏏';
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Events</h2>
        <p className="page-subtitle">Your upcoming cricket matches and practices</p>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
        <button
          className={`app-btn ${filter === 'upcoming' ? 'app-btn-primary' : 'app-btn-secondary'}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`app-btn ${filter === 'past' ? 'app-btn-primary' : 'app-btn-secondary'}`}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
      </div>

      {filter === 'upcoming' && (
        <div className="app-grid">
          {mockEvents.map((event) => (
            <div key={event.id} className="app-card">
              <div className="app-card-header">
                <h3 className="app-card-title">
                  {getEventIcon(event.type)} {event.title}
                </h3>
              </div>
              <div className="app-card-content">
                <p><strong>📅 Date:</strong> {event.date}</p>
                <p><strong>🕐 Time:</strong> {event.time}</p>
                <p><strong>📍 Location:</strong> {event.location}</p>
                <p><strong>🎪 Team:</strong> {event.team}</p>

                <div style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <p><strong>Your Status:</strong> {getStatusBadge(event.userStatus)}</p>
                  <p style={{ marginTop: 'var(--space-xs)' }}>
                    {event.participants.yes} Yes • {event.participants.no} No • {event.participants.tentative} Tentative
                  </p>
                </div>

                {event.userStatus === 'PENDING' && (
                  <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
                    <button className="app-btn app-btn-primary" style={{ flex: 1 }}>
                      Accept
                    </button>
                    <button className="app-btn app-btn-secondary" style={{ flex: 1 }}>
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filter === 'past' && (
        <div className="app-empty-state">
          <div className="app-empty-icon">📜</div>
          <h3 className="app-empty-title">No past events</h3>
          <p className="app-empty-text">Your event history will appear here</p>
        </div>
      )}
    </div>
  );
};
