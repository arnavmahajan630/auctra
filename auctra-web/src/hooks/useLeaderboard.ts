import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to manage the global collector leaderboard.
 * 
 * TODO: Integration with leaderboard ranking API / subgraph.
 * - Call the backend database or query a Graph Protocol subgraph for high-reputation accounts.
 */
export function useLeaderboard() {
  const leaderboard = useAppStore((state) => state.leaderboard);

  return {
    leaderboard
  };
}
