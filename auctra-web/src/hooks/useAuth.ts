import { useAppStore } from '../store/useAppStore';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to manage wallet connection / authentication states.
 * 
 * TODO: Integration with Privy (@privy-io/react-auth) or Wagmi / Viem.
 * - Replace mock connectWallet/disconnectWallet with actual wallet providers.
 * - Listen to chain-changed and accounts-changed events.
 */
export function useAuth() {
  const isConnected = useAppStore((state) => state.isConnected);
  const walletAddress = useAppStore((state) => state.walletAddress);
  const connectWallet = useAppStore((state) => state.connectWallet);
  const disconnectWallet = useAppStore((state) => state.disconnectWallet);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const closeAuthModal = useAppStore((s) => s.closeAuthModal);
  const pendingAuthRedirect = useAppStore((s) => s.pendingAuthRedirect);
  const router = useRouter();

  return {
    isConnected,
    walletAddress,
    
    // Actions
    // Connect without redirect (suitable for onClick handlers)
    connectWallet: async () => {
      connectWallet();
      await new Promise((r) => setTimeout(r, 600));
      closeAuthModal();
      // Navigate to pending redirect if set
      if (pendingAuthRedirect) {
        router.push(pendingAuthRedirect);
      }
    },

    // Connect and then redirect to a specific path
    connectWalletAndRedirect: async (redirectTo: string) => {
      connectWallet();
      await new Promise((r) => setTimeout(r, 600));
      closeAuthModal();
      router.push(redirectTo);
    },

  disconnectWallet: async () => {
      // TODO: Call Privy's logout() or Wagmi's disconnect() here.
      // Example:
      // const { disconnect } = useDisconnect();
      // disconnect();
      disconnectWallet();
    }
  };
}
