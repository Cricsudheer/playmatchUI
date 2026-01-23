import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscoverTeams } from '../../hooks/useDiscoverTeams';
import { useMyTeams } from '../../hooks/useMyTeams';
import { useSubmitJoinRequest, useCancelJoinRequest, useMyJoinRequests } from '../../hooks/useJoinRequests';
import { TeamSearchBar, CityFilter, DiscoverTeamCard } from '../../components/teams';
import { JoinRequestModal } from '../../components/joinRequests';
import { getAvailableCities } from '../../api/discover.api';
import { toast } from 'sonner';
import './onboarding.css';

/**
 * Find Team Page
 * Browse and search for teams to join
 */
function FindTeamPage() {
  const navigate = useNavigate();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Queries
  const { data: teamsData, isLoading, error } = useDiscoverTeams({
    name: debouncedQuery || undefined,
    city: cityFilter || undefined,
    limit: 20,
    offset: 0,
  });

  const { data: myTeams } = useMyTeams();
  const { data: myRequests } = useMyJoinRequests();

  // Mutations
  const submitMutation = useSubmitJoinRequest();
  const cancelMutation = useCancelJoinRequest();

  const teams = teamsData?.items || [];
  const totalCount = teamsData?.total || 0;
  const cities = getAvailableCities();

  // Check if user is member of a team
  const isMemberOf = (teamId) => {
    if (!myTeams) return false;
    return myTeams.some((t) => (t.teamId || t.id) === teamId);
  };

  // Get pending request for a team
  const getPendingRequest = (teamId) => {
    if (!myRequests) return null;
    return myRequests.find(
      (r) => r.teamId === teamId && r.requestStatus === 'PENDING'
    );
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
      toast.success('Join request sent!', {
        description: `Your request to join ${selectedTeam.name} has been submitted.`,
      });
      setModalOpen(false);
      setSelectedTeam(null);
    } catch (err) {
      if (err.status === 409) {
        toast.error('You already have a pending request for this team');
      } else if (err.status === 400) {
        toast.error('You are already a member of this team');
      } else {
        toast.error(err.message || 'Failed to send request');
      }
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

  return (
    <div className="onboarding-container">
      <div className="onboarding-content" style={{ maxWidth: '800px' }}>
        <button
          className="onboarding-back-button"
          onClick={() => navigate('/onboarding')}
        >
          ← Back
        </button>

        <div className="onboarding-form-container" style={{ maxWidth: '100%' }}>
          <div className="onboarding-form-header">
            <h1 className="onboarding-form-title">Find a Team</h1>
            <p className="onboarding-form-subtitle">
              Browse teams and request to join
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <TeamSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by team name..."
            />
          </div>

          {/* City Filter */}
          <CityFilter
            cities={cities}
            selected={cityFilter}
            onSelect={setCityFilter}
          />

          {/* Results */}
          {isLoading ? (
            <div style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles.skeleton}>
                  <div style={{ ...styles.skeletonBox, width: '56px', height: '56px', borderRadius: '12px' }} />
                  <div style={{ ...styles.skeletonBox, width: '70%', height: '20px', marginTop: '16px' }} />
                  <div style={{ ...styles.skeletonBox, width: '50%', height: '16px', marginTop: '8px' }} />
                  <div style={{ ...styles.skeletonBox, width: '100%', height: '36px', marginTop: '16px' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>⚠️</span>
              <h3 style={styles.emptyTitle}>Failed to load teams</h3>
              <p style={styles.emptyText}>{error.message}</p>
            </div>
          ) : teams.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🔍</span>
              <h3 style={styles.emptyTitle}>No teams found</h3>
              <p style={styles.emptyText}>
                {searchQuery || cityFilter
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a team in your area!'}
              </p>
              <button
                style={styles.createButton}
                onClick={() => navigate('/onboarding/create-team')}
              >
                Create a Team
              </button>
            </div>
          ) : (
            <>
              <p style={styles.resultCount}>
                {totalCount} team{totalCount !== 1 ? 's' : ''} found
              </p>
              <div style={styles.grid}>
                {teams.map((team) => (
                  <DiscoverTeamCard
                    key={team.id}
                    team={team}
                    isMember={isMemberOf(team.id)}
                    onRequestJoin={handleRequestJoin}
                    onCancelRequest={(requestId) => handleCancelRequest(requestId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

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
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  resultCount: {
    fontSize: '0.875rem',
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.9375rem',
    color: 'var(--text-muted, #9ca3af)',
    marginBottom: '24px',
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary, #1e88e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  skeleton: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
  },
  skeletonBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default FindTeamPage;
