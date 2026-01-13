import React from 'react';
import { mockEvents, mockStats } from '../../data/mockData';

export const HomePage = () => {
  const nextEvent = mockEvents[0];
  const stats = mockStats.overall;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Welcome back! Here's your cricket overview</p>
      </div>

      {/* Next Event Card */}
      <div className="app-card">
        <div className="app-card-header">
          <h3 className="app-card-title">Next Event</h3>
        </div>
        <div className="app-card-content">
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>
            {nextEvent.title}
          </h4>
          <p>📍 {nextEvent.location}</p>
          <p>🕐 {nextEvent.date} at {nextEvent.time}</p>
          <p>🎪 {nextEvent.team}</p>
          <p style={{ marginTop: 'var(--space-md)' }}>
            <strong style={{ color: '#43a047' }}>
              Your Status: {nextEvent.userStatus === 'YES' ? '✅ Confirmed' : '⏱️ Pending'}
            </strong>
          </p>
          <p>
            {nextEvent.participants.yes} Yes • {nextEvent.participants.no} No • {nextEvent.participants.tentative} Tentative
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.matches}</div>
          <div className="stat-label">Matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.runs}</div>
          <div className="stat-label">Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.wickets}</div>
          <div className="stat-label">Wickets</div>
        </div>
      </div>

      {/* Season Stats Card */}
      <div className="app-card">
        <div className="app-card-header">
          <h3 className="app-card-title">Season Stats</h3>
        </div>
        <div className="app-card-content">
          <p><strong>Batting Average:</strong> {stats.average}</p>
          <p><strong>Strike Rate:</strong> {stats.strikeRate}</p>
          <p><strong>Economy Rate:</strong> {stats.economy}</p>
          <p><strong>Catches:</strong> {stats.catches}</p>
        </div>
      </div>
    </div>
  );
};
