import React from 'react';
import { useNavigate } from 'react-router-dom';
import './onboarding.css';

/**
 * Onboarding Hub - Main choice screen
 * Shows 3 options: Create Team, Join Team, Find Team
 */
function OnboardingHub() {
  const navigate = useNavigate();

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

export default OnboardingHub;
