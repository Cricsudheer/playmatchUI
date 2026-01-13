import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTeam } from '../hooks/useMyTeams';
import { useTeamContext } from '../contexts/TeamContext';
import { getTeamId } from '../utils/team';
import { ROUTES } from '../constants/routes';
import { toast } from 'sonner';
import './onboarding/onboarding.css';

/**
 * Onboarding Hub
 * Shows 4 sections: Join with invite, Find team, Create team, Pending requests
 */
function OnboardingHub() {
  const navigate = useNavigate();
  const { setSelectedTeamId } = useTeamContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Create team mutation
  const createTeamMutation = useCreateTeam({
    onTeamCreated: (newTeam) => {
      const teamId = getTeamId(newTeam);
      setSelectedTeamId(teamId);
    },
  });

  // Form state for create team
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    description: '',
    logoUrl: '',
  });

  // Form state for join team
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.city.trim()) {
      toast.error('Team name and city are required');
      return;
    }

    try {
      await createTeamMutation.mutateAsync({
        name: formData.name.trim(),
        city: formData.city.trim(),
        description: formData.description.trim() || undefined,
        logoUrl: formData.logoUrl.trim() || undefined,
      });

      toast.success('Team created successfully!');
      navigate(ROUTES.APP.HOME);
    } catch (error) {
      toast.error(error.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    toast.info('Join team feature coming soon!');
  };

  if (showCreateForm) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content">
          <button className="onboarding-back-button" onClick={() => setShowCreateForm(false)}>
            ← Back to options
          </button>

          <div className="onboarding-form-container">
            <div className="onboarding-form-header">
              <h1 className="onboarding-form-title">Create Your Team</h1>
              <p className="onboarding-form-subtitle">Set up your team and start organizing matches</p>
            </div>

            <form className="onboarding-form" onSubmit={handleCreateTeam}>
              <div className="onboarding-form-group">
                <label htmlFor="name" className="onboarding-form-label">
                  Team Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="onboarding-form-input"
                  placeholder="e.g., Mumbai Strikers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={createTeamMutation.isPending}
                />
              </div>

              <div className="onboarding-form-group">
                <label htmlFor="city" className="onboarding-form-label">
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  className="onboarding-form-input"
                  placeholder="e.g., Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={createTeamMutation.isPending}
                />
              </div>

              <div className="onboarding-form-group">
                <label htmlFor="description" className="onboarding-form-label">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  className="onboarding-form-textarea"
                  placeholder="Tell us about your team..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={createTeamMutation.isPending}
                />
              </div>

              <div className="onboarding-form-group">
                <label htmlFor="logoUrl" className="onboarding-form-label">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  className="onboarding-form-input"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  disabled={createTeamMutation.isPending}
                />
              </div>

              <div className="onboarding-form-actions">
                <button
                  type="button"
                  className="onboarding-form-button onboarding-form-button-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={createTeamMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="onboarding-form-button onboarding-form-button-primary"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? (
                    <div className="onboarding-loading">
                      <div className="onboarding-spinner"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Team'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content">
          <button className="onboarding-back-button" onClick={() => setShowJoinForm(false)}>
            ← Back to options
          </button>

          <div className="onboarding-form-container">
            <div className="onboarding-form-header">
              <h1 className="onboarding-form-title">Join a Team</h1>
              <p className="onboarding-form-subtitle">Enter your invite code</p>
            </div>

            <form className="onboarding-form" onSubmit={handleJoinTeam}>
              <div className="onboarding-form-group">
                <label htmlFor="inviteCode" className="onboarding-form-label">
                  Invite Code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  className="onboarding-form-input"
                  placeholder="ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>

              <div className="onboarding-form-actions">
                <button
                  type="button"
                  className="onboarding-form-button onboarding-form-button-secondary"
                  onClick={() => setShowJoinForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="onboarding-form-button onboarding-form-button-primary">
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Welcome to PlayMatch!</h1>
          <p className="onboarding-subtitle">Get started by joining or creating a team</p>
        </div>

        <div className="onboarding-grid">
          {/* Section 1: Join with invite */}
          <div className="onboarding-section">
            <div className="onboarding-section-icon">🤝</div>
            <h3 className="onboarding-section-title">Join with Invite</h3>
            <p className="onboarding-section-description">Have an invite code from a team admin?</p>
            <button className="onboarding-section-button" onClick={() => setShowJoinForm(true)}>
              Enter Invite Code
            </button>
          </div>

          {/* Section 2: Find team */}
          <div className="onboarding-section">
            <div className="onboarding-section-icon">🔍</div>
            <h3 className="onboarding-section-title">Find a Team</h3>
            <p className="onboarding-section-description">Browse and search for teams near you</p>
            <button className="onboarding-section-button" onClick={() => toast.info('Coming soon!')}>
              Browse Teams
            </button>
          </div>

          {/* Section 3: Create team */}
          <div className="onboarding-section onboarding-section-featured">
            <div className="onboarding-section-icon">🏏</div>
            <h3 className="onboarding-section-title">Create Your Team</h3>
            <p className="onboarding-section-description">Start your own team and invite members</p>
            <button className="onboarding-section-button" onClick={() => setShowCreateForm(true)}>
              Create New Team
            </button>
          </div>

          {/* Section 4: Pending requests */}
          <div className="onboarding-section">
            <div className="onboarding-section-icon">⏳</div>
            <h3 className="onboarding-section-title">Pending Requests</h3>
            <p className="onboarding-section-description">View your pending join requests</p>
            <button className="onboarding-section-button" onClick={() => toast.info('No pending requests')}>
              View Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingHub;
