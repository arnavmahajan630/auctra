import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Custom hook to manage the Web3 user profile state.
 * Interacts directly with Zustand store and retrieves data dynamically from Supabase.
 */
export function useProfile() {
  const { user, authenticated, ready } = usePrivy();
  
  const isConnected = useAppStore((state) => state.isConnected) || authenticated;
  let walletAddress = useAppStore((state) => state.walletAddress);
  if (!walletAddress || walletAddress.startsWith('0xUnknown')) {
    walletAddress = user?.wallet?.address || '0xUnknown...';
  }
  const profileId = useAppStore((state) => state.profileId);
  const profileName = useAppStore((state) => state.profileName);
  const profileAvatar = useAppStore((state) => state.profileAvatar);
  const profileBio = useAppStore((state) => state.profileBio);
  const reputationXP = useAppStore((state) => state.reputationXP);
  const multiplier = useAppStore((state) => state.multiplier);
  const artifactsCount = useAppStore((state) => state.artifactsCount);
  const level = useAppStore((state) => state.profileLevel);
  const rankTitle = useAppStore((state) => state.profileRankTitle);
  const isVerifiedSeller = useAppStore((state) => state.isVerifiedSeller);
  const sellerStatus = useAppStore((state) => state.sellerStatus);
  const collectibles = useAppStore((state) => state.collectibles);
  const activeBids = useAppStore((state) => state.profileActiveBids);
  const activityLogs = useAppStore((state) => state.profileActivityLogs);

  const fetchProfileData = useAppStore((state) => state.fetchProfileData);
  const simulateProfileSwitch = useAppStore((state) => state.simulateProfileSwitch);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync profile details from Supabase database when connection status starts
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) return;

    let active = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        await fetchProfileData(user.id);
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
  }, [ready, authenticated, user?.id, fetchProfileData]);

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
    isVerifiedSeller,
    sellerStatus,
    collectibles,
    activeBids,
    activityLogs,
    loading,
    error
  };
}
