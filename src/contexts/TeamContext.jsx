import React, { createContext, useContext, useState } from 'react';
import { createLogger } from '../utils/logger';
import { getTeamId } from '../utils/team';

const log = createLogger('TeamContext');
const TeamContext = createContext(null);

/**
 * Team Context Provider
 * Manages selectedTeamId (client state only)
 * Persists in localStorage
 */
export const TeamProvider = ({ children }) => {
  // Initialize from localStorage synchronously to avoid flash
  const getInitialTeamId = () => {
    const saved = localStorage.getItem('selectedTeamId');
    if (saved && saved !== 'null') {
      return parseInt(saved, 10);
    }
    return null;
  };

  const [selectedTeamId, setSelectedTeamIdState] = useState(getInitialTeamId);

  /**
   * Set selected team and persist to localStorage
   */
  const setSelectedTeamId = (teamId) => {
    setSelectedTeamIdState(teamId);
    if (teamId) {
      localStorage.setItem('selectedTeamId', teamId.toString());
    } else {
      localStorage.removeItem('selectedTeamId');
    }
  };

  /**
   * Ensure a valid team is selected
   * Call this after fetching teams
   * @param {Array} myTeams - Array of user's teams
   */
  const ensureSelectedTeam = (myTeams) => {
    if (!myTeams || myTeams.length === 0) {
      // No teams - clear selection
      setSelectedTeamId(null);
      return;
    }

    // If no selection, pick first team
    if (!selectedTeamId) {
      const firstTeamId = getTeamId(myTeams[0]);
      setSelectedTeamId(firstTeamId);
      log.info('Auto-selected first team', { teamId: firstTeamId });
      return;
    }

    // Validate current selection
    const isValid = myTeams.some((t) => getTeamId(t) === selectedTeamId);
    if (!isValid) {
      // Selection not in list, pick first team
      const firstTeamId = getTeamId(myTeams[0]);
      setSelectedTeamId(firstTeamId);
      log.warn('Invalid team selection, auto-selected first team', {
        invalidId: selectedTeamId,
        newId: firstTeamId,
      });
    }
  };

  /**
   * Reset team context (called on logout)
   */
  const resetTeamContext = () => {
    setSelectedTeamId(null);
    log.info('Team context reset');
  };

  const value = {
    selectedTeamId,
    setSelectedTeamId,
    ensureSelectedTeam,
    resetTeamContext,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

/**
 * Hook to access team context
 */
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider');
  }
  return context;
};

/**
 * Alias for backwards compatibility
 * @deprecated Use useTeamContext instead
 */
export const useTeam = useTeamContext;
