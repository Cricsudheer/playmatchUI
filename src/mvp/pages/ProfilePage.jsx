/**
 * MVP Profile Page
 * Minimal profile - just name for now
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import {
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  Input,
} from '../components';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      // API call to update profile would go here
      toast.success('Profile updated');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mvp-page mvp-profile">
      <header className="mvp-page-header">
        <GhostButton onClick={() => navigate('/')}>← Back</GhostButton>
        <h1 className="mvp-page-title">Profile</h1>
      </header>

      <section className="mvp-profile-section">
        {isEditing ? (
          <div className="mvp-profile-edit">
            <Input
              label="Your Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
            <div className="mvp-profile-actions">
              <GhostButton onClick={() => setIsEditing(false)}>
                Cancel
              </GhostButton>
              <PrimaryButton
                onClick={handleSave}
                loading={loading}
                fullWidth={false}
              >
                Save
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="mvp-profile-view">
            <div className="mvp-profile-avatar">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="mvp-profile-info">
              <h2 className="mvp-profile-name">{user?.name || 'Unknown'}</h2>
              <p className="mvp-profile-phone">
                {user?.phone ? `+91 ${user.phone}` : user?.email || 'No contact info'}
              </p>
            </div>
            <SecondaryButton onClick={() => setIsEditing(true)} fullWidth={false}>
              Edit Name
            </SecondaryButton>
          </div>
        )}
      </section>

      <section className="mvp-profile-section mvp-profile-section--danger">
        <SecondaryButton onClick={handleLogout} variant="danger">
          Log Out
        </SecondaryButton>
      </section>
    </div>
  );
}
