import React from 'react';
import { mockTeams } from '../../data/mockData';

export const TeamsPage = () => {
  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: '👑',
      COORDINATOR: '⭐',
      PLAYER: '🏏'
    };
    return badges[role] || '🏏';
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Teams</h2>
        <p className="page-subtitle">You're active in {mockTeams.length} teams</p>
      </div>

      <div className="app-grid">
        {mockTeams.map((team) => (
          <div key={team.id} className="app-card">
            <div className="app-card-header">
              <h3 className="app-card-title">
                {getRoleBadge(team.role)} {team.name}
              </h3>
            </div>
            <div className="app-card-content">
              <p><strong>Role:</strong> {team.role}</p>
              <p><strong>City:</strong> {team.city}</p>
              <p><strong>Members:</strong> {team.memberCount}</p>
              <p><strong>Upcoming Events:</strong> {team.upcomingEvents}</p>
              <p style={{ marginTop: 'var(--space-sm)' }}>
                {team.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="app-empty-state mt-lg">
        <div className="app-empty-icon">➕</div>
        <h3 className="app-empty-title">Looking for more teams?</h3>
        <p className="app-empty-text">Browse and join cricket teams in your city</p>
        <button className="app-btn app-btn-primary mt-md">
          Find Teams
        </button>
      </div>
    </div>
  );
};
