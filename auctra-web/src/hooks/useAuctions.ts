import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Custom hook to manage active auctions, fetch details, and place live bids.
 * 
 * TODO: Integration with Smart Contracts & Socket.io for Real-Time Bidding.
 * - Connect to the auction contract (e.g. via wagmi's useWriteContract / useReadContract).
 * - Listen to real-time events via Socket.io/WebSockets to sync live bids instantly.
 */
export function useAuctions() {
  const auctions = useAppStore((state) => state.auctions);
  const fetchAuctions = useAppStore((state) => state.fetchAuctions);
  const placeBidAction = useAppStore((state) => state.placeBid);
  const claimAuction = useAppStore((state) => state.claimAuction);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const getAuctionById = (id: string) => {
    return auctions.find((a) => a.id === id);
  };

  const { getAccessToken } = usePrivy();

  const placeBid = async (auctionId: string, amount: number) => {
    try {
      const token = await getAccessToken();
      if (!token) return { success: false, error: 'User not authenticated' };

      const res = await fetch('/api/buyer/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ auctionId, amount })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Trigger a frontend refetch so UI updates instantly
        fetchAuctions();
        // Still update the local mock for immediate feedback on profile tab if needed
        placeBidAction(auctionId, amount);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to place bid' };
      }
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message || 'An error occurred' };
    }
  };

  return {
    auctions,
    getAuctionById,
    placeBid,
    claimAuction
  };
}
