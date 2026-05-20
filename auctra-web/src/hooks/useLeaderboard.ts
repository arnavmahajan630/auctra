import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to manage the global collector leaderboard.
 * Fetches rankings dynamically from Supabase database view.
 */
export function useLeaderboard() {
  const leaderboard = useAppStore((state) => state.leaderboard);
  const fetchLeaderboard = useAppStore((state) => state.fetchLeaderboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchLeaderboard();
        if (active) setError(null);
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Failed to load leaderboard data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [fetchLeaderboard]);

  const refetch = async () => {
    try {
      setLoading(true);
      await fetchLeaderboard();
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboard,
    loading,
    error,
    refetch
  };
}

