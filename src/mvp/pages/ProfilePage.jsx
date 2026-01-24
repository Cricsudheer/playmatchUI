/**
 * MVP Profile Page
 * Minimal profile - just name for now
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMvpAuth } from '../hooks/useMvpAuth';
import {
  GhostButton,
  PrimaryButton,
  SecondaryButton,
  Input,
  ConfirmModal,
} from '../components';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useMvpAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
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

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        confirmVariant="danger"
      />
    </div>
  );
}
