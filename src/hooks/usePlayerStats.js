import { useState, useEffect } from 'react';
import { fetchPlayerStats } from '../services/playerService';

/**
 * Custom hook for fetching and managing player stats
 * @returns {Object} - { players, loading, error }
 */
export function usePlayerStats() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPlayerStats();
        setPlayers(data);
      } catch (e) {
        console.error('Failed to fetch player stats:', e);
        setError('Could not load stats from backend. Check API / CORS.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { players, loading, error };
}
