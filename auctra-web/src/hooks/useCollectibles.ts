import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to manage claimed/minted collectibles and reputation multipliers.
 * 
 * TODO: Integration with ERC-721 / ERC-1155 NFTs.
 * - Retrieve user owned NFTs from the indexing API (e.g. Alchemy NFT API or OpenSea SDK).
 * - Read multiplier multiplier factors from on-chain reputation contracts.
 */
export function useCollectibles() {
  const collectibles = useAppStore((state) => state.collectibles);
  const reputationXP = useAppStore((state) => state.reputationXP);
  const multiplier = useAppStore((state) => state.multiplier);
  const artifactsCount = useAppStore((state) => state.artifactsCount);

  return {
    collectibles,
    reputationXP,
    multiplier,
    artifactsCount
  };
}
