/**
 * Custom hooks for MVP match operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useMvpAuth } from './useMvpAuth';

/**
 * Hook to fetch user's matches from /v2/mvp/matches/my-games
 * Returns: { games, totalCount, upcomingCount, completedCount, cancelledCount }
 */
export function useMyMatches() {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, upcomingCount: 0, completedCount: 0, cancelledCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useMvpAuth();

  const fetchMatches = useCallback(async () => {
    if (!isAuthenticated) {
      setMatches([]);
      setStats({ totalCount: 0, upcomingCount: 0, completedCount: 0, cancelledCount: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyGames();
      setMatches(data.games || []);
      setStats({
        totalCount: data.totalCount || 0,
        upcomingCount: data.upcomingCount || 0,
        completedCount: data.completedCount || 0,
        cancelledCount: data.cancelledCount || 0,
      });
    } catch (err) {
      setError(err.message);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, stats, loading, error, refetch: fetchMatches, setMatches };
}

/**
 * Hook to fetch a single match by ID
 */
export function useMatch(matchId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getMatchById(matchId);
      setMatch(data);
    } catch (err) {
      setError(err.message);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { match, loading, error, refetch: fetchMatch, setMatch };
}

/**
 * Hook to fetch match by invite token (public, no auth required)
 * Uses the unified resolveInvite endpoint for both team and emergency invites
 */
export function useMatchByToken(token) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.resolveInvite(token);
      setMatch(data);
    } catch (err) {
      setError(err.message);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { match, loading, error, refetch: fetchMatch };
}

/**
 * Hook to fetch match by emergency token (public, no auth required)
 * Uses the same resolveInvite endpoint - inviteType will indicate EMERGENCY
 */
export function useMatchByEmergencyToken(token) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.resolveInvite(token);
      setMatch(data);
    } catch (err) {
      setError(err.message);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { match, loading, error, refetch: fetchMatch };
}

/**
 * Hook for match mutations (create, respond, etc.)
 */
export function useMatchMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMatch = useCallback(async (matchData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.createMatch(matchData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToMatch = useCallback(async (matchId, response) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.respondToMatch(matchId, response);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logBackout = useCallback(async (matchId, userId, reason, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      await api.logBackout(matchId, userId, reason, notes);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeMatch = useCallback(async (matchId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.completeMatch(matchId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelMatch = useCallback(async (matchId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.cancelMatch(matchId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createMatch,
    respondToMatch,
    logBackout,
    completeMatch,
    cancelMatch,
  };
}

/**
 * Hook for emergency operations
 */
export function useEmergency(matchId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getEmergencyRequests(matchId);
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const requestSlot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.requestEmergencySlot(matchId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const approveRequest = useCallback(async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      await api.approveEmergencyRequest(matchId, requestId);
      await fetchRequests();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId, fetchRequests]);

  const rejectRequest = useCallback(async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      await api.rejectEmergencyRequest(matchId, requestId);
      await fetchRequests();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId, fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    requestSlot,
    approveRequest,
    rejectRequest,
  };
}

/**
 * Hook for payment operations
 * Uses dedicated /payments/tracking endpoint for data
 * Captain sees all players, regular players see only their own
 */
export function usePayments(matchId) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentTracking = useCallback(async (filterStatus = null) => {
    if (!matchId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getPaymentTracking(matchId, filterStatus);
      setPaymentData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const markPayment = useCallback(async (userId, paymentMode) => {
    try {
      setLoading(true);
      setError(null);
      await api.markPayment(matchId, userId, paymentMode);
      // Refetch to get updated data
      await fetchPaymentTracking();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [matchId, fetchPaymentTracking]);

  useEffect(() => {
    fetchPaymentTracking();
  }, [fetchPaymentTracking]);

  return {
    paymentData,
    loading,
    error,
    refetch: fetchPaymentTracking,
    markPayment,
  };
}
