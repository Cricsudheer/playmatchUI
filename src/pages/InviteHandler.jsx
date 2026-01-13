import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useJoinTeam } from '../hooks/mutations/useJoinTeam';
import { useTeam } from '../contexts/TeamContext';
import { toast } from 'sonner';

/**
 * Invite Handler Component
 * Handles deep link invites for both logged-in and logged-out users
 * Route: /invite/:inviteCode
 */
function InviteHandler() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const joinTeamMutation = useJoinTeam();
  const { selectTeam } = useTeam();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleInvite = async () => {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // User is not logged in - save invite code and redirect to login
      if (!isAuthenticated) {
        console.log('[InviteHandler] User not authenticated, saving invite code');
        localStorage.setItem('invitePendingCode', inviteCode);
        navigate('/login', {
          state: { returnTo: `/invite/${inviteCode}` },
        });
        return;
      }

      // User is logged in - process the invite
      if (!processing) {
        setProcessing(true);

        try {
          console.log('[InviteHandler] Processing invite code:', inviteCode);

          const joinedTeam = await joinTeamMutation.mutateAsync({
            inviteCode,
          });

          console.log('[InviteHandler] Successfully joined team:', joinedTeam);

          // Set the joined team as selected
          if (joinedTeam.teamId || joinedTeam.id) {
            const teamId = joinedTeam.teamId || joinedTeam.id;
            selectTeam(teamId);
          }

          toast.success('Successfully joined team!', {
            description: joinedTeam.teamName || 'Welcome to the team',
          });

          navigate('/app/home');
        } catch (error) {
          console.error('[InviteHandler] Failed to join team:', error);

          if (error.code === 'ALREADY_MEMBER') {
            // User is already a member
            toast.info('You are already a member of this team');

            // Select that team if we have the ID
            if (error.teamId) {
              selectTeam(error.teamId);
            }

            navigate('/app/home');
          } else {
            // Other errors
            toast.error('Failed to join team', {
              description: error.message || 'Invalid or expired invite code',
            });

            // Redirect based on whether user has teams
            const { teams } = useTeam();
            if (teams.length === 0) {
              navigate('/onboarding');
            } else {
              navigate('/app/home');
            }
          }
        }
      }
    };

    handleInvite();
  }, [authLoading, isAuthenticated, inviteCode, processing]);

  // Show loading screen while processing
  return (
    <div className="loading-screen">
      <div>
        {authLoading ? 'Loading...' : processing ? 'Joining team...' : 'Processing invite...'}
      </div>
    </div>
  );
}

export default InviteHandler;
