import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyJoinRequests } from '../../hooks/useJoinRequests';
import './onboarding.css';

/**
 * Onboarding Hub - Main choice screen
 * Shows 3 options: Create Team, Join Team, Find Team
 * Also shows pending join requests if any
 */
function OnboardingHub() {
  const navigate = useNavigate();
  const { data: myRequests, isLoading } = useMyJoinRequests();
  
  const pendingRequests = myRequests?.filter(r => r.requestStatus === 'PENDING') || [];

  const options = [
    {
      id: 'create',
      title: 'Create a Team',
      description: 'Start your own team and invite members',
      icon: '🏏',
      path: '/onboarding/create-team',
      color: 'primary',
    },
    {
      id: 'join',
      title: 'Join a Team',
      description: 'Enter an invite code to join an existing team',
      icon: '🤝',
      path: '/onboarding/join',
      color: 'secondary',
    },
    {
      id: 'find',
      title: 'Find a Team',
      description: 'Browse and search for teams to join',
      icon: '🔍',
      path: '/onboarding/find-team',
      color: 'tertiary',
    },
  ];

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Welcome to GameTeam!</h1>
          <p className="onboarding-subtitle">
            Get started by creating or joining a team
          </p>
        </div>

        {/* Pending Requests Section */}
        {!isLoading && pendingRequests.length > 0 && (
          <div style={styles.pendingSection}>
            <h3 style={styles.pendingSectionTitle}>
              ⏳ Pending Requests ({pendingRequests.length})
            </h3>
            <p style={styles.pendingSectionText}>
              You have requests waiting for approval
            </p>
            <div style={styles.pendingList}>
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} style={styles.pendingItem}>
                  <span style={styles.pendingTeam}>{request.teamName}</span>
                  <span style={styles.pendingStatus}>Pending</span>
                </div>
              ))}
              {pendingRequests.length > 3 && (
                <p style={styles.pendingMore}>
                  +{pendingRequests.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        <div className="onboarding-options">
          {options.map((option) => (
            <button
              key={option.id}
              className={`onboarding-option onboarding-option-${option.color}`}
              onClick={() => navigate(option.path)}
            >
              <div className="onboarding-option-icon">{option.icon}</div>
              <div className="onboarding-option-content">
                <h3 className="onboarding-option-title">{option.title}</h3>
                <p className="onboarding-option-description">
                  {option.description}
                </p>
              </div>
              <div className="onboarding-option-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pendingSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
  },
  pendingSectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fbbf24',
    marginBottom: '4px',
  },
  pendingSectionText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '12px',
  },
  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pendingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  pendingTeam: {
    fontSize: '0.9375rem',
    color: 'var(--text-primary, #fff)',
    fontWeight: 500,
  },
  pendingStatus: {
    fontSize: '0.75rem',
    color: '#fbbf24',
    padding: '2px 8px',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: '4px',
  },
  pendingMore: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #9ca3af)',
    textAlign: 'center',
    marginTop: '4px',
  },
};

export default OnboardingHub;
