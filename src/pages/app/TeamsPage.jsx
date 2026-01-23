import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMyTeams } from '../../hooks/useMyTeams';
import { useTeamContext } from '../../contexts/TeamContext';
import { useMyJoinRequests, useCancelJoinRequest, usePendingJoinRequests } from '../../hooks/useJoinRequests';
import { useDiscoverTeams } from '../../hooks/useDiscoverTeams';
import { MyRequestsList, PendingRequestsList } from '../../components/joinRequests';
import { TeamSearchBar, CityFilter, DiscoverTeamCard } from '../../components/teams';
import { JoinRequestModal } from '../../components/joinRequests';
import { useSubmitJoinRequest } from '../../hooks/useJoinRequests';
import { getAvailableCities } from '../../api/discover.api';
import { toast } from 'sonner';

export const TeamsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL param for initial tab (used by notification click)
    const urlTab = searchParams.get('tab');
    return urlTab || 'teams';
  });
  
  // Discover state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Queries
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams();
  const { data: myRequests, isLoading: requestsLoading } = useMyJoinRequests();
  const { data: discoverData, isLoading: discoverLoading } = useDiscoverTeams({
    name: debouncedQuery || undefined,
    city: cityFilter || undefined,
    limit: 20,
    offset: 0,
  }, { enabled: activeTab === 'discover' });
  
  const { setSelectedTeamId, selectedTeamId } = useTeamContext();
  const submitMutation = useSubmitJoinRequest();
  const cancelMutation = useCancelJoinRequest();
  
  const discoverTeams = discoverData?.items || [];
  const cities = getAvailableCities();
  const pendingRequests = myRequests?.filter(r => r.requestStatus === 'PENDING') || [];
  
  // Get teams where user is captain (ADMIN or COORDINATOR)
  const captainTeams = myTeams?.filter(
    (t) => t.role === 'ADMIN' || t.role === 'COORDINATOR'
  ) || [];
  
  // Get selected captain team for managing requests
  const [captainTeamId, setCaptainTeamId] = useState(null);
  useEffect(() => {
    if (captainTeams.length > 0 && !captainTeamId) {
      setCaptainTeamId(captainTeams[0].teamId || captainTeams[0].id);
    }
  }, [captainTeams, captainTeamId]);
  
  const selectedCaptainTeam = captainTeams.find(
    (t) => (t.teamId || t.id) === captainTeamId
  );
  
  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: '👑',
      COORDINATOR: '⭐',
      PLAYER: '🏏'
    };
    return badges[role] || '🏏';
  };
  
  // Check if user is member of a team
  const isMemberOf = (teamId) => {
    if (!myTeams) return false;
    return myTeams.some((t) => (t.teamId || t.id) === teamId);
  };
  
  // Handle request join
  const handleRequestJoin = ({ teamId, teamName }) => {
    setSelectedTeam({ id: teamId, name: teamName });
    setModalOpen(true);
  };
  
  // Handle submit request
  const handleSubmitRequest = async (message) => {
    if (!selectedTeam) return;
    
    try {
      await submitMutation.mutateAsync({
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        message,
      });
      toast.success('Join request sent!');
      setModalOpen(false);
      setSelectedTeam(null);
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    }
  };
  
  // Handle cancel request
  const handleCancelRequest = async (requestId) => {
    try {
      await cancelMutation.mutateAsync(requestId);
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel request');
    }
  };
  
  // Handle team click
  const handleTeamClick = (teamId) => {
    setSelectedTeamId(teamId);
    navigate('/app/home');
  };

  // Tabs - shorter labels for mobile
  const tabs = [
    { id: 'teams', label: 'Teams', mobileLabel: 'Teams', icon: '🏏', count: myTeams?.length },
    { id: 'requests', label: 'Requests', mobileLabel: 'Requests', icon: '📤', count: pendingRequests.length },
    ...(captainTeams.length > 0 ? [{ id: 'captain-requests', label: 'Manage', mobileLabel: 'Manage', icon: '📥', count: null }] : []),
    { id: 'discover', label: 'Discover', mobileLabel: 'Find', icon: '🔍', count: null },
  ];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Teams</h2>
        <p style={styles.pageSubtitle}>Manage your teams and find new ones</p>
      </div>
      
      {/* Tab Navigation - Equal width tabs, icon-only on mobile */}
      <div style={styles.tabWrapper}>
        <div style={styles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="teams-tab"
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="teams-tab-icon" style={styles.tabIcon}>{tab.icon}</span>
              <span className="teams-tab-label" style={styles.tabLabel}>{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span style={{
                  ...styles.tabBadge,
                  ...(activeTab === tab.id ? styles.tabBadgeActive : {}),
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* My Teams Tab */}
      {activeTab === 'teams' && (
        <>
          {teamsLoading ? (
            <div style={styles.loadingGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="app-card" style={{ opacity: 0.5 }}>
                  <div style={{ height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </div>
              ))}
            </div>
          ) : myTeams && myTeams.length > 0 ? (
            <div className="app-grid">
              {myTeams.map((team) => (
                <div 
                  key={team.teamId || team.id} 
                  className="app-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTeamClick(team.teamId || team.id)}
                >
                  <div className="app-card-header">
                    <h3 className="app-card-title">
                      {getRoleBadge(team.role)} {team.teamName || team.name}
                    </h3>
                  </div>
                  <div className="app-card-content">
                    <p><strong>Role:</strong> {team.role}</p>
                    {team.city && <p><strong>City:</strong> {team.city}</p>}
                    {team.memberCount && <p><strong>Members:</strong> {team.memberCount}</p>}
                    {team.description && (
                      <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-muted)' }}>
                        {team.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="app-empty-state">
              <div className="app-empty-icon">🏏</div>
              <h3 className="app-empty-title">No teams yet</h3>
              <p className="app-empty-text">Join an existing team or create your own</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  className="app-btn app-btn-primary"
                  onClick={() => setActiveTab('discover')}
                >
                  Find Teams
                </button>
                <button 
                  className="app-btn app-btn-secondary"
                  onClick={() => navigate('/onboarding/create-team')}
                >
                  Create Team
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* My Requests Tab */}
      {activeTab === 'requests' && (
        <MyRequestsList />
      )}
      
      {/* Captain Requests Tab - Manage incoming requests */}
      {activeTab === 'captain-requests' && captainTeams.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {/* Team Selector for Captains with multiple teams */}
          {captainTeams.length > 1 && (
            <div style={styles.captainTeamSelector}>
              <label style={styles.selectorLabel}>Select Team:</label>
              <select
                style={styles.teamSelect}
                value={captainTeamId || ''}
                onChange={(e) => setCaptainTeamId(e.target.value)}
              >
                {captainTeams.map((team) => (
                  <option key={team.teamId || team.id} value={team.teamId || team.id}>
                    {team.teamName || team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Pending Requests List */}
          {captainTeamId && (
            <PendingRequestsList
              teamId={captainTeamId}
              teamName={selectedCaptainTeam?.teamName || selectedCaptainTeam?.name || 'Team'}
              showBulkActions={true}
            />
          )}
        </div>
      )}
      
      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div style={{ marginTop: '16px' }}>
          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <TeamSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search teams..."
            />
          </div>
          
          {/* City Filter */}
          <CityFilter
            cities={cities}
            selected={cityFilter}
            onSelect={setCityFilter}
          />
          
          {/* Results */}
          {discoverLoading ? (
            <div className="teams-discover-grid" style={styles.loadingGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="app-card" style={{ opacity: 0.5 }}>
                  <div style={{ height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </div>
              ))}
            </div>
          ) : discoverTeams.length === 0 ? (
            <div className="app-empty-state">
              <div className="app-empty-icon">🔍</div>
              <h3 className="app-empty-title">No teams found</h3>
              <p className="app-empty-text">
                {searchQuery || cityFilter
                  ? 'Try adjusting your search'
                  : 'Be the first to create a team!'}
              </p>
            </div>
          ) : (
            <div className="teams-discover-grid" style={styles.discoverGrid}>
              {discoverTeams.map((team) => (
                <DiscoverTeamCard
                  key={team.id}
                  team={team}
                  isMember={isMemberOf(team.id)}
                  onRequestJoin={handleRequestJoin}
                  onCancelRequest={handleCancelRequest}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTeam(null);
        }}
        onSubmit={handleSubmitRequest}
        teamName={selectedTeam?.name || ''}
        isSubmitting={submitMutation.isPending}
      />
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '0',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  pageHeader: {
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
    fontWeight: 700,
    color: 'var(--text-primary, #fff)',
    margin: '0 0 4px 0',
  },
  pageSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted, #9ca3af)',
    margin: 0,
  },
  tabWrapper: {
    marginBottom: '20px',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'var(--surface-bg, #0f172a)',
    padding: '4px',
    borderRadius: '12px',
  },
  tab: {
    flex: 1,
    padding: '10px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--text-muted, #9ca3af)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: 0,
  },
  tabActive: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    color: 'var(--text-primary, #fff)',
  },
  tabIcon: {
    fontSize: '0.875rem',
    lineHeight: 1,
    flexShrink: 0,
  },
  tabLabel: {
    display: 'none', // Hidden by default on mobile
  },
  tabBadge: {
    padding: '1px 5px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '0.625rem',
    fontWeight: 600,
    minWidth: '16px',
    textAlign: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'var(--primary, #1e88e5)',
    color: '#fff',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  discoverGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  captainTeamSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '12px',
  },
  selectorLabel: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #9ca3af)',
    fontWeight: 500,
  },
  teamSelect: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-bg, #0f172a)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: '8px',
    color: 'var(--text-primary, #fff)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  // Responsive grid for larger screens - using CSS media query workaround
  '@media (min-width: 640px)': {
    discoverGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
};

// Add CSS for responsive grid and tab labels
const responsiveStyles = `
  @media (min-width: 480px) {
    .teams-tab-label {
      display: inline !important;
    }
    .teams-tab {
      font-size: 0.8125rem !important;
      padding: 10px 12px !important;
      gap: 6px !important;
    }
    .teams-tab-icon {
      font-size: 1rem !important;
    }
  }
  
  @media (min-width: 640px) {
    .teams-discover-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (min-width: 1024px) {
    .teams-discover-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
`;

// Inject responsive styles
if (typeof document !== 'undefined') {
  const styleId = 'teams-page-responsive';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = responsiveStyles;
    document.head.appendChild(styleEl);
  }
}
