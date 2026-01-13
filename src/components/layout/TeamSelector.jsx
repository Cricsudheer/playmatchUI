import React, { useState, useRef, useEffect } from 'react';
import { useTeam } from '../../contexts/TeamContext';
import { useNavigate } from 'react-router-dom';

export const TeamSelector = () => {
  const { selectedTeam, teams, selectTeam, selectAllTeams } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTeamSelect = (team) => {
    selectTeam(team);
    setIsOpen(false);
  };

  const handleAllTeamsView = () => {
    selectAllTeams();
    setIsOpen(false);
  };

  const handleFindTeams = () => {
    navigate('/app/teams');
    setIsOpen(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Admin',
      COORDINATOR: 'Coordinator',
      PLAYER: 'Player'
    };
    return labels[role] || role;
  };

  const getTeamEmoji = (role) => {
    const emojis = {
      ADMIN: '👑',
      COORDINATOR: '⭐',
      PLAYER: '🏏'
    };
    return emojis[role] || '🏏';
  };

  return (
    <div className="team-selector" ref={dropdownRef}>
      <button
        className="team-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="team-selector-content">
          <span className="team-selector-name">
            {selectedTeam ? selectedTeam.name : 'All Teams'}
          </span>
          <svg
            className={`team-selector-icon ${isOpen ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="team-selector-dropdown">
          <div className="team-selector-section">
            <div className="team-selector-section-header">MY TEAMS</div>
            {teams.map((team) => (
              <button
                key={team.id}
                className={`team-selector-item ${
                  selectedTeam?.id === team.id ? 'active' : ''
                }`}
                onClick={() => handleTeamSelect(team)}
              >
                <span className="team-selector-item-emoji">
                  {getTeamEmoji(team.role)}
                </span>
                <div className="team-selector-item-content">
                  <div className="team-selector-item-name">{team.name}</div>
                  <div className="team-selector-item-meta">
                    {getRoleLabel(team.role)} • {team.memberCount} members
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="team-selector-actions">
            <button
              className={`team-selector-action ${
                selectedTeam === null ? 'active' : ''
              }`}
              onClick={handleAllTeamsView}
            >
              All Teams View
            </button>
            <button
              className="team-selector-action"
              onClick={handleFindTeams}
            >
              Find More Teams →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
