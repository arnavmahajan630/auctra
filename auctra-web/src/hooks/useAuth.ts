import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Custom hook to manage wallet connection / authentication states.
 * 
 * TODO: Integration with Privy (@privy-io/react-auth) or Wagmi / Viem.
 * - Replace mock connectWallet/disconnectWallet with actual wallet providers.
 * - Listen to chain-changed and accounts-changed events.
 */
export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const router = useRouter();

  return {
    isConnected: authenticated,
    walletAddress: user?.wallet?.address || null,
    
    // Actions
    // Connect without redirect (suitable for onClick handlers)
    connectWallet: async () => {
      login();
    },

    // Connect and then redirect to a specific path
    connectWalletAndRedirect: async (redirectTo: string) => {
      login();
      // Redirection logic should be handled post-login or via Privy callbacks if possible
      // but for simplicity we rely on the component's effects.
    },

  disconnectWallet: async () => {
      await logout();
      router.push('/');
    }
  };
}
