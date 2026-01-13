import React, { useState } from 'react';
import { mockStats } from '../../data/mockData';

export const StatsPage = () => {
  const [filter, setFilter] = useState('overall');
  const stats = mockStats.overall;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Statistics</h2>
        <p className="page-subtitle">Your performance across all teams</p>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
        <button
          className={`app-btn ${filter === 'overall' ? 'app-btn-primary' : 'app-btn-secondary'}`}
          onClick={() => setFilter('overall')}
        >
          Overall
        </button>
        <button
          className={`app-btn ${filter === 'by-team' ? 'app-btn-primary' : 'app-btn-secondary'}`}
          onClick={() => setFilter('by-team')}
        >
          By Team
        </button>
      </div>

      {filter === 'overall' ? (
        <>
          {/* Overall Stats */}
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

          {/* Detailed Stats Cards */}
          <div className="app-grid">
            <div className="app-card">
              <div className="app-card-header">
                <h3 className="app-card-title">Batting Stats</h3>
              </div>
              <div className="app-card-content">
                <p><strong>Runs:</strong> {stats.runs}</p>
                <p><strong>Average:</strong> {stats.average}</p>
                <p><strong>Strike Rate:</strong> {stats.strikeRate}</p>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-header">
                <h3 className="app-card-title">Bowling Stats</h3>
              </div>
              <div className="app-card-content">
                <p><strong>Wickets:</strong> {stats.wickets}</p>
                <p><strong>Economy:</strong> {stats.economy}</p>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-header">
                <h3 className="app-card-title">Fielding Stats</h3>
              </div>
              <div className="app-card-content">
                <p><strong>Catches:</strong> {stats.catches}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* By Team Stats */
        <div className="app-grid">
          {mockStats.byTeam.map((team) => (
            <div key={team.teamId} className="app-card">
              <div className="app-card-header">
                <h3 className="app-card-title">{team.teamName}</h3>
              </div>
              <div className="app-card-content">
                <p><strong>Matches:</strong> {team.matches}</p>
                <p><strong>Runs:</strong> {team.runs}</p>
                <p><strong>Wickets:</strong> {team.wickets}</p>
                <p><strong>Catches:</strong> {team.catches}</p>
                <p><strong>Average:</strong> {team.average}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Matches */}
      <div className="app-card mt-md">
        <div className="app-card-header">
          <h3 className="app-card-title">Recent Matches</h3>
        </div>
        <div className="app-card-content">
          {mockStats.recentMatches.map((match, index) => (
            <div
              key={index}
              style={{
                marginBottom: index < mockStats.recentMatches.length - 1 ? 'var(--space-md)' : '0',
                paddingBottom: index < mockStats.recentMatches.length - 1 ? 'var(--space-md)' : '0',
                borderBottom: index < mockStats.recentMatches.length - 1 ? '1px solid var(--border-subtle)' : 'none'
              }}
            >
              <p><strong>{match.date}</strong> - {match.team}</p>
              <p>vs {match.opponent}</p>
              <p>Batting: {match.batting} | Bowling: {match.bowling}</p>
              <p style={{ color: '#43a047' }}>{match.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
