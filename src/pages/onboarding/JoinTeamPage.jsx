import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJoinTeam } from '../../hooks/useMyTeams';
import { useTeamContext } from '../../contexts/TeamContext';
import { toast } from 'sonner';
import './onboarding.css';

/**
 * Join Team Page
 * Form for joining a team via invite code
 */
function JoinTeamPage() {
  const navigate = useNavigate();
  const joinTeamMutation = useJoinTeam();
  const { setSelectedTeamId } = useTeamContext();

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setInviteCode(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    try {
      console.log('[JoinTeamPage] Joining team with code:', inviteCode);

      const joinedTeam = await joinTeamMutation.mutateAsync({
        inviteCode: inviteCode.trim(),
      });

      console.log('[JoinTeamPage] Joined team successfully:', joinedTeam);

      // Set the joined team as selected (optimistic update)
      if (joinedTeam.teamId || joinedTeam.id) {
        const teamId = joinedTeam.teamId || joinedTeam.id;
        setSelectedTeamId(teamId);
      }

      toast.success('Successfully joined team!', {
        description: joinedTeam.teamName || 'Welcome to the team',
      });

      // Navigate to app home
      navigate('/app/home');
    } catch (error) {
      console.error('[JoinTeamPage] Failed to join team:', error);

      if (error.code === 'ALREADY_MEMBER') {
        // User is already a member, redirect them anyway
        if (error.teamId) {
          setSelectedTeamId(error.teamId);
        }
        toast.info('You are already a member of this team');
        navigate('/app/home');
      } else {
        setError(error.message || 'Failed to join team. Please check your invite code.');
      }
    }
  };

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
            <h1 className="onboarding-form-title">Join a Team</h1>
            <p className="onboarding-form-subtitle">
              Enter your invite code to join an existing team
            </p>
          </div>

          <form className="onboarding-form" onSubmit={handleSubmit}>
            <div className="onboarding-form-group">
              <label htmlFor="inviteCode" className="onboarding-form-label">
                Invite Code <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                className="onboarding-form-input"
                placeholder="e.g., ABC123XYZ"
                value={inviteCode}
                onChange={handleChange}
                disabled={joinTeamMutation.isPending}
                autoFocus
              />
              {error && <span className="onboarding-form-error">{error}</span>}
              <span className="onboarding-form-hint">
                Get the invite code from your team admin
              </span>
            </div>

            <div className="onboarding-form-actions">
              <button
                type="button"
                className="onboarding-form-button onboarding-form-button-secondary"
                onClick={() => navigate('/onboarding')}
                disabled={joinTeamMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="onboarding-form-button onboarding-form-button-primary"
                disabled={joinTeamMutation.isPending}
              >
                {joinTeamMutation.isPending ? (
                  <div className="onboarding-loading">
                    <div className="onboarding-spinner"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Join Team'
                )}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Don't have an invite code?{' '}
              <button
                onClick={() => navigate('/onboarding/find-team')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Browse teams
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinTeamPage;
