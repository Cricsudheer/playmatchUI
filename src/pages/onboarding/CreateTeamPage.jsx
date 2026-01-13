import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTeam } from '../../hooks/mutations/useCreateTeam';
import { useTeam } from '../../contexts/TeamContext';
import { toast } from 'sonner';
import './onboarding.css';

/**
 * Create Team Page
 * Form for creating a new team with validation
 */
function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeamMutation = useCreateTeam();
  const { selectTeam } = useTeam();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    description: '',
    logoUrl: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Optional URL validation
    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      console.log('[CreateTeamPage] Submitting team data:', formData);

      const newTeam = await createTeamMutation.mutateAsync({
        name: formData.name.trim(),
        city: formData.city.trim(),
        description: formData.description.trim() || undefined,
        logoUrl: formData.logoUrl.trim() || undefined,
      });

      console.log('[CreateTeamPage] Team created successfully:', newTeam);

      // Set the newly created team as selected (optimistic update)
      if (newTeam.teamId || newTeam.id) {
        const teamId = newTeam.teamId || newTeam.id;
        selectTeam(teamId);
      }

      toast.success('Team created successfully!', {
        description: `Welcome to ${formData.name}`,
      });

      // Navigate to app home
      navigate('/app/home');
    } catch (error) {
      console.error('[CreateTeamPage] Failed to create team:', error);

      toast.error('Failed to create team', {
        description: error.message || 'Please try again',
      });
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
            <h1 className="onboarding-form-title">Create Your Team</h1>
            <p className="onboarding-form-subtitle">
              Set up your team and start organizing matches
            </p>
          </div>

          <form className="onboarding-form" onSubmit={handleSubmit}>
            <div className="onboarding-form-group">
              <label htmlFor="name" className="onboarding-form-label">
                Team Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="onboarding-form-input"
                placeholder="e.g., Mumbai Strikers"
                value={formData.name}
                onChange={handleChange}
                disabled={createTeamMutation.isPending}
              />
              {errors.name && (
                <span className="onboarding-form-error">{errors.name}</span>
              )}
            </div>

            <div className="onboarding-form-group">
              <label htmlFor="city" className="onboarding-form-label">
                City <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="onboarding-form-input"
                placeholder="e.g., Mumbai"
                value={formData.city}
                onChange={handleChange}
                disabled={createTeamMutation.isPending}
              />
              {errors.city && (
                <span className="onboarding-form-error">{errors.city}</span>
              )}
            </div>

            <div className="onboarding-form-group">
              <label htmlFor="description" className="onboarding-form-label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                className="onboarding-form-textarea"
                placeholder="Tell us about your team..."
                value={formData.description}
                onChange={handleChange}
                disabled={createTeamMutation.isPending}
              />
              <span className="onboarding-form-hint">
                Brief description of your team
              </span>
            </div>

            <div className="onboarding-form-group">
              <label htmlFor="logoUrl" className="onboarding-form-label">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                className="onboarding-form-input"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={handleChange}
                disabled={createTeamMutation.isPending}
              />
              {errors.logoUrl && (
                <span className="onboarding-form-error">{errors.logoUrl}</span>
              )}
              <span className="onboarding-form-hint">
                Link to your team logo image
              </span>
            </div>

            <div className="onboarding-form-actions">
              <button
                type="button"
                className="onboarding-form-button onboarding-form-button-secondary"
                onClick={() => navigate('/onboarding')}
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

export default CreateTeamPage;
