import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTeams } from '../data/mockData';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams] = useState(mockTeams);

  // Load saved team from localStorage on mount
  useEffect(() => {
    const savedTeamId = localStorage.getItem('selectedTeamId');
    if (savedTeamId === 'all') {
      setSelectedTeam(null);
    } else if (savedTeamId) {
      const team = teams.find(t => t.id === parseInt(savedTeamId));
      if (team) {
        setSelectedTeam(team);
      } else {
        // Default to first team if saved team not found
        setSelectedTeam(teams[0]);
      }
    } else {
      // Default to first team
      setSelectedTeam(teams[0]);
    }
  }, [teams]);

  const selectTeam = (team) => {
    setSelectedTeam(team);
    if (team === null) {
      localStorage.setItem('selectedTeamId', 'all');
    } else {
      localStorage.setItem('selectedTeamId', team.id.toString());
    }
  };

  const selectAllTeams = () => {
    selectTeam(null);
  };

  return (
    <TeamContext.Provider value={{ selectedTeam, teams, selectTeam, selectAllTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
};
