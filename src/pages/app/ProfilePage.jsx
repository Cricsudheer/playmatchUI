import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">Manage your cricket profile</p>
      </div>

      <div className="app-card">
        <div className="app-card-header">
          <h3 className="app-card-title">Personal Information</h3>
        </div>
        <div className="app-card-content">
          <p><strong>Name:</strong> {user?.name || 'Not set'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <button
          onClick={handleEditProfile}
          className="app-btn app-btn-primary"
          style={{ flex: 1 }}
        >
          Edit Full Profile
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="app-btn app-btn-secondary"
        style={{ width: '100%' }}
      >
        Logout
      </button>
    </div>
  );
};
