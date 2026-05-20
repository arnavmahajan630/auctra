import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to manage the Web3 user profile state.
 * Interacts directly with Zustand store and retrieves data dynamically from Supabase.
 */
export function useProfile() {
  const isConnected = useAppStore((state) => state.isConnected);
  const walletAddress = useAppStore((state) => state.walletAddress);
  const profileId = useAppStore((state) => state.profileId);
  const profileName = useAppStore((state) => state.profileName);
  const profileAvatar = useAppStore((state) => state.profileAvatar);
  const profileBio = useAppStore((state) => state.profileBio);
  const reputationXP = useAppStore((state) => state.reputationXP);
  const multiplier = useAppStore((state) => state.multiplier);
  const artifactsCount = useAppStore((state) => state.artifactsCount);
  const level = useAppStore((state) => state.profileLevel);
  const rankTitle = useAppStore((state) => state.profileRankTitle);
  const collectibles = useAppStore((state) => state.collectibles);
  const activeBids = useAppStore((state) => state.profileActiveBids);
  const activityLogs = useAppStore((state) => state.profileActivityLogs);

  const fetchProfileData = useAppStore((state) => state.fetchProfileData);
  const simulateProfileSwitch = useAppStore((state) => state.simulateProfileSwitch);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync profile details from Supabase database when connection status starts
  useEffect(() => {
    if (!isConnected) return;

    // Use currently active profileId or fallback to AetherLord.eth's ID
    const activeId = profileId || '11111111-1111-1111-1111-111111111111';

    let active = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        await fetchProfileData(activeId);
        if (active) setError(null);
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Failed to load profile from database.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isConnected, profileId, fetchProfileData]);

  const switchProfile = async (id: string) => {
    try {
      setLoading(true);
      await simulateProfileSwitch(id);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to switch profile.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    walletAddress,
    profileId,
    name: profileName,
    avatar: profileAvatar,
    bio: profileBio,
    reputationXP,
    multiplier,
    artifactsCount,
    level,
    rankTitle,
    collectibles,
    activeBids,
    activityLogs,
    loading,
    error,
    switchProfile
  };
}
