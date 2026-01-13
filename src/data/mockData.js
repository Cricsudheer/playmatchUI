// Mock data for development
// Replace with real API calls when backend is ready

export const mockTeams = [
  {
    id: 1,
    name: 'Team Sigma',
    city: 'Bengaluru',
    role: 'ADMIN',
    memberCount: 15,
    upcomingEvents: 3,
    description: 'Weekend cricket enthusiasts'
  },
  {
    id: 2,
    name: 'Weekend Warriors',
    city: 'Mumbai',
    role: 'COORDINATOR',
    memberCount: 20,
    upcomingEvents: 1,
    description: 'Competitive cricket team'
  },
  {
    id: 3,
    name: 'City Champions',
    city: 'Bengaluru',
    role: 'PLAYER',
    memberCount: 25,
    upcomingEvents: 0,
    description: 'City-level cricket club'
  }
];

export const mockEvents = [
  {
    id: 1,
    title: 'Sunday Practice Match',
    type: 'PRACTICE_MATCH',
    date: '2026-01-19',
    time: '09:00 AM',
    location: 'Cubbon Park Cricket Ground',
    team: 'Team Sigma',
    teamId: 1,
    userStatus: 'YES',
    participants: {
      yes: 15,
      no: 3,
      tentative: 2
    }
  },
  {
    id: 2,
    title: 'League Match vs Royal Warriors',
    type: 'LEAGUE_MATCH',
    date: '2026-01-22',
    time: '03:00 PM',
    location: 'MG Road Ground',
    team: 'Weekend Warriors',
    teamId: 2,
    userStatus: 'PENDING',
    participants: {
      yes: 8,
      no: 1,
      tentative: 5
    }
  },
  {
    id: 3,
    title: 'Tournament Final',
    type: 'TOURNAMENT',
    date: '2026-01-25',
    time: '10:00 AM',
    location: 'JP Nagar Stadium',
    team: 'City Champions',
    teamId: 3,
    userStatus: 'YES',
    participants: {
      yes: 18,
      no: 2,
      tentative: 3
    }
  }
];

export const mockStats = {
  overall: {
    matches: 15,
    runs: 325,
    wickets: 8,
    catches: 12,
    average: 28.2,
    strikeRate: 142.5,
    economy: 6.1
  },
  byTeam: [
    {
      teamId: 1,
      teamName: 'Team Sigma',
      matches: 6,
      runs: 125,
      wickets: 3,
      catches: 4,
      average: 31.2
    },
    {
      teamId: 2,
      teamName: 'Weekend Warriors',
      matches: 7,
      runs: 150,
      wickets: 4,
      catches: 6,
      average: 25.0
    },
    {
      teamId: 3,
      teamName: 'City Champions',
      matches: 2,
      runs: 50,
      wickets: 1,
      catches: 2,
      average: 25.0
    }
  ],
  recentMatches: [
    {
      date: '2026-01-12',
      opponent: 'Royal Warriors',
      team: 'Team Sigma',
      batting: '34(22)',
      bowling: '1/18(4)',
      result: 'Won by 23 runs'
    },
    {
      date: '2026-01-08',
      opponent: 'MG Road XI',
      team: 'Weekend Warriors',
      batting: '42(28)',
      bowling: '2/15(4)',
      result: 'Won by 15 runs'
    }
  ]
};
