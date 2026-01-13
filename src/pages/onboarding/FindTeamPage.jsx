import React from 'react';
import { useNavigate } from 'react-router-dom';
import './onboarding.css';

/**
 * Find Team Page
 * Placeholder for future team browsing/search functionality
 */
function FindTeamPage() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <button
          className="onboarding-back-button"
          onClick={() => navigate('/onboarding')}
        >
          ← Back
        </button>

        <div className="onboarding-form-container">
          <div className="onboarding-form-header">
            <h1 className="onboarding-form-title">Find a Team</h1>
            <p className="onboarding-form-subtitle">
              Browse and search for teams to join
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              Coming Soon
            </h3>
            <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
              Team browsing and search functionality will be available soon.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '300px',
                margin: '0 auto',
              }}
            >
              <button
                className="onboarding-form-button onboarding-form-button-primary"
                onClick={() => navigate('/onboarding/create-team')}
              >
                Create Your Team Instead
              </button>
              <button
                className="onboarding-form-button onboarding-form-button-secondary"
                onClick={() => navigate('/onboarding/join')}
              >
                Have an Invite Code?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindTeamPage;
