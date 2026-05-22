import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to manage seller onboarding / status.
 * 
 * TODO: Integration with Seller Registration smart contracts / backend KYC system.
 * - Call the backend registration endpoint or register as an authorized on-chain seller.
 */
export function useSeller() {
  const isSeller = useAppStore((state) => state.isSeller);
  const sellerBio = useAppStore((state) => state.sellerBio);
  const sellerInitialized = useAppStore((state) => state.sellerInitialized);
  const initializeSellerAction = useAppStore((state) => state.initializeSeller);

  const initializeSeller = async (bio: string) => {
    // TODO: Connect with contract registration or backend api.
    // Example:
    // await axios.post('/api/seller/register', { bio });
    initializeSellerAction(bio);
    return { success: true };
  };

  return {
    isSeller,
    sellerBio,
    sellerInitialized,
    initializeSeller
  };
}
