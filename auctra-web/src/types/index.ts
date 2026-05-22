/**
 * Shared type definitions and interfaces for Oktra Web3 Auctions
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  image: string;
  currentBid: number;
  startingPrice: number;
  minBidIncrement: number;
  highestBidder: string | null;
  endsAt: string; // ISO String
  xpReward: number;
  status: 'active' | 'ended' | 'upcoming';
  creator: string;
  creatorAvatar?: string;
  bidsCount: number;
}

export interface Collectible {
  id: string;
  title: string;
  image: string;
  wonPrice: number;
  xpReward: number;
  prizeDetails?: string;
  mintedDate: string;
  txHash: string;
  tokenId?: number;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  name: string;
  artifactsCount: number;
  reputationXP: number;
  multiplier: number;
  avatar: string;
}
