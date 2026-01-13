import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTeams } from '../../hooks/useMyTeams';
import { useTeamContext } from '../../contexts/TeamContext';
import { getTeamId, findTeamById, getRoleLabel, getRoleEmoji } from '../../utils/team';
import { ROUTES } from '../../constants/routes';

export const TeamSelector = () => {
  const navigate = useNavigate();
  const { data: myTeams, isLoading } = useMyTeams();
  const { selectedTeamId, setSelectedTeamId } = useTeamContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleTeamSelect = (teamId) => {
    setSelectedTeamId(teamId);
    setIsOpen(false);
  };

  // Find selected team object
  const selectedTeam = findTeamById(myTeams, selectedTeamId);

  // Loading state
  if (isLoading) {
    return (
      <div className="team-selector">
        <div className="team-selector-trigger">
          <div className="team-selector-content">
            <span className="team-selector-name">Loading teams...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no teams
  if (!myTeams || myTeams.length === 0) {
    return (
      <div className="team-selector">
        <button
          className="team-selector-trigger team-selector-empty"
          onClick={() => navigate(ROUTES.ONBOARDING)}
        >
          <div className="team-selector-content">
            <span className="team-selector-name">No teams • Create one</span>
          </div>
        </button>
      </div>
    );
  }

  // Selected team not found (e.g., user was removed from team)
  if (selectedTeamId && !selectedTeam) {
    // Auto-select first team
    const firstTeamId = getTeamId(myTeams[0]);
    if (firstTeamId) {
      setSelectedTeamId(firstTeamId);
    }
  }

  return (
    <div className="team-selector" ref={dropdownRef}>
      <button className="team-selector-trigger" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <div className="team-selector-content">
          <span className="team-selector-name">{selectedTeam ? selectedTeam.teamName : 'Select Team'}</span>
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
            {myTeams.map((team) => {
              const teamId = getTeamId(team);
              return (
                <button
                  key={teamId}
                  className={`team-selector-item ${selectedTeamId === teamId ? 'active' : ''}`}
                  onClick={() => handleTeamSelect(teamId)}
                >
                  <span className="team-selector-item-emoji">{getRoleEmoji(team.role)}</span>
                  <div className="team-selector-item-content">
                    <div className="team-selector-item-name">{team.teamName}</div>
                    <div className="team-selector-item-meta">
                      {getRoleLabel(team.role)} • {team.playerCount} members
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="team-selector-actions">
            <button className="team-selector-action" onClick={() => navigate(ROUTES.APP.TEAMS)}>
              Manage Teams →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
