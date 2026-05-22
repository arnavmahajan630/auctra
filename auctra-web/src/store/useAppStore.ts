import { create } from 'zustand';
import { Auction, Collectible, LeaderboardEntry } from '../types';

interface AppState {
  // Authentication / Wallet
  isConnected: boolean;
  walletAddress: string | null;
  reputationXP: number;
  multiplier: number;
  artifactsCount: number;
  
  // Seller State
  isSeller: boolean;
  sellerBio: string;
  sellerInitialized: boolean;
  sellerProfile?: {
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;
    walletAddress?: string;
    govId?: string; // mock filename
    selfie?: string; // mock filename
    verified?: boolean;
  };

  // Listings & Seller auctions
  sellerListings: Auction[];
  wonAuctions: Collectible[]; // won but not claimed yet

  // Auctions State
  auctions: Auction[];
  collectibles: Collectible[];
  leaderboard: LeaderboardEntry[];
  
  // Actions
  connectWallet: () => void;
  disconnectWallet: () => void;
  initializeSeller: (bio: string) => void;
  registerSellerProfile: (profile: Partial<AppState['sellerProfile']>) => Promise<{ success: boolean }>;
  placeBid: (auctionId: string, amount: number) => { success: boolean; error?: string };
  claimAuction: (auctionId: string) => void;
  createListing: (listing: Auction) => Promise<{ success: boolean }>;
  claimReward: (collectibleId: string) => Promise<{ success: boolean }>;
  // Auth modal UI
  authModalOpen: boolean;
  authModalMessage: string | null;
  pendingAuthRedirect: string | null;
  openAuthModal: (message?: string, redirect?: string) => void;
  closeAuthModal: () => void;

  // Sidebar & Mobile Navigation UI
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: (open?: boolean) => void;
}

const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 'chronos-watch',
    title: 'Chronos Elite Obsidian Watch',
    description: 'A premium luxury timepiece with intricate dark-matter gears, custom carbon-fiber bezel, and glowing on-chain sapphire indexes.',
    image: '/images/obsidian_watch.png',
    currentBid: 4.25,
    minBidIncrement: 0.1,
    highestBidder: '0x3D9...F21A',
    endsAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    xpReward: 850,
    status: 'active',
    creator: 'ObsidianLabs',
    bidsCount: 14
  },
  {
    id: 'aetherial-shard',
    title: 'Aetherial Shard #09',
    description: 'A glowing levitating crystalline cluster pulsing with raw psychic energy, certified and registered on the Ethereum blockchain.',
    image: '/images/aetherial_shard.png',
    currentBid: 1.15,
    minBidIncrement: 0.05,
    highestBidder: '0x9E1...B50C',
    endsAt: new Date(Date.now() + 86400000 * 1.5).toISOString(), // 1.5 days from now
    xpReward: 320,
    status: 'active',
    creator: 'CrystalForge',
    bidsCount: 8
  },
  {
    id: 'nebula-core',
    title: 'Nebula Core Prime',
    description: 'A dynamic fusion core orb containing swirling high-energy dark plasma trapped inside a magnetic stasis ring.',
    image: '/images/nebula_core.png',
    currentBid: 0.85,
    minBidIncrement: 0.02,
    highestBidder: '0x7C2...D44E',
    endsAt: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    xpReward: 150,
    status: 'active',
    creator: 'StarForgeInc',
    bidsCount: 5
  },
  {
    id: 'quantum-ring',
    title: 'Quantum Apex Ring',
    description: 'A sleek black high-tech mechanical band featuring a micro-fusion cyan glow strip that links directly to owner reputation scores.',
    image: '/images/quantum_ring.png',
    currentBid: 2.10,
    minBidIncrement: 0.05,
    highestBidder: null,
    endsAt: new Date(Date.now() + 45000000).toISOString(), // ~12 hours from now
    xpReward: 450,
    status: 'active',
    creator: 'CyberForge',
    bidsCount: 12
  },
  {
    id: 'void-helmet',
    title: 'Void Walker Helmet',
    description: 'Ultra-durable nanoweave combat armor helmet fitted with a blue glowing ocular visor and deep vacuum oxygen regulators.',
    image: '/images/void_helmet.png',
    currentBid: 3.50,
    minBidIncrement: 0.1,
    highestBidder: '0x1F2...A98E',
    endsAt: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
    xpReward: 600,
    status: 'active',
    creator: 'AegisSystems',
    bidsCount: 22
  }
];

const INITIAL_COLLECTIBLES: Collectible[] = [
  {
    id: 'won-watch',
    title: 'Chronos Elite Obsidian Watch',
    image: '/images/obsidian_watch.png',
    wonPrice: 4.25,
    xpReward: 850,
    mintedDate: '2026-05-18T10:30:00Z',
    txHash: '0x8f7c9e...4b2d'
  },
  {
    id: 'won-shard',
    title: 'Aetherial Shard #09',
    image: '/images/aetherial_shard.png',
    wonPrice: 1.15,
    xpReward: 320,
    mintedDate: '2026-05-19T14:45:00Z',
    txHash: '0xa4b3d8...2f6e'
  },
  {
    id: 'won-core',
    title: 'Nebula Core Prime',
    image: '/images/nebula_core.png',
    wonPrice: 0.85,
    xpReward: 150,
    mintedDate: '2026-05-19T18:20:00Z',
    txHash: '0x9c8e7d...1a2b'
  },
  {
    id: 'won-ring',
    title: 'Quantum Apex Ring',
    image: '/images/quantum_ring.png',
    wonPrice: 2.10,
    xpReward: 450,
    mintedDate: '2026-05-20T08:15:00Z',
    txHash: '0x5d4c3b...9e8f'
  }
];

const INITIAL_WON: Collectible[] = [
  {
    id: 'pending-won-01',
    title: 'Celestial Relic (Pending Claim)',
    image: '/images/aetherial_shard.png',
    wonPrice: 0.95,
    xpReward: 200,
    mintedDate: new Date().toISOString(),
    txHash: ''
  }
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    wallet: '0x7C2...D44E',
    name: 'AetherLord.eth',
    artifactsCount: 42,
    reputationXP: 18450,
    multiplier: 1.45,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'
  },
  {
    rank: 2,
    wallet: '0x3D9...F21A',
    name: 'ObsidianKnight',
    artifactsCount: 31,
    reputationXP: 14200,
    multiplier: 1.30,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces'
  },
  {
    rank: 3,
    wallet: '0x9E1...B50C',
    name: 'GlitchHacker',
    artifactsCount: 24,
    reputationXP: 9850,
    multiplier: 1.20,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces'
  },
  {
    rank: 4,
    wallet: '0x8F3...4D1A', // The current connected user's dummy wallet
    name: 'You (Anon Collector)',
    artifactsCount: 12,
    reputationXP: 2320,
    multiplier: 1.15,
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces'
  },
  {
    rank: 5,
    wallet: '0x1F2...A98E',
    name: 'NebulaWhale.eth',
    artifactsCount: 18,
    reputationXP: 8120,
    multiplier: 1.10,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication / Wallet
  isConnected: false,
  walletAddress: null,
  reputationXP: 0,
  multiplier: 1.0,
  artifactsCount: 0,

  // Seller State
  isSeller: false,
  sellerBio: '',
  sellerInitialized: false,
  sellerProfile: undefined,

  // Seller listings
  sellerListings: [],
  wonAuctions: INITIAL_WON,

  // Lists
  auctions: INITIAL_AUCTIONS,
  collectibles: [],
  leaderboard: INITIAL_LEADERBOARD,

  // UI / Auth modal
  authModalOpen: false,
  authModalMessage: null,
  pendingAuthRedirect: null,
  openAuthModal: (message?: string, redirect?: string) => {
    set({ authModalOpen: true, authModalMessage: message || null, pendingAuthRedirect: redirect || null });
  },
  closeAuthModal: () => {
    set({ authModalOpen: false, authModalMessage: null, pendingAuthRedirect: null });
  },

  // Sidebar & Mobile Navigation UI
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  toggleSidebar: () => {
    const nextCollapsed = !get().sidebarCollapsed;
    localStorage.setItem('oktra_sidebar_collapsed', String(nextCollapsed));
    set({ sidebarCollapsed: nextCollapsed });
  },
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },
  toggleMobileMenu: (open) => {
    set({ mobileMenuOpen: open !== undefined ? open : !get().mobileMenuOpen });
  },


  // Actions
  connectWallet: () => {
    set({
      isConnected: true,
      walletAddress: '0x8F3a2C...4D1A',
      reputationXP: 2320,
      multiplier: 1.15,
      artifactsCount: 12,
      collectibles: INITIAL_COLLECTIBLES
    });
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      walletAddress: null,
      reputationXP: 0,
      multiplier: 1.0,
      artifactsCount: 0,
      collectibles: []
    });
  },

  initializeSeller: (bio: string) => {
    set({
      isSeller: true,
      sellerBio: bio,
      sellerInitialized: true,
      sellerProfile: {
        verified: true
      }
    });
  },

  registerSellerProfile: async (profile: Partial<AppState['sellerProfile']>) => {
    // Simulate verification delay and success
    set({ sellerProfile: { ...(get().sellerProfile || {}), ...profile, verified: false } });
    await new Promise((r) => setTimeout(r, 2200));
    set({ sellerProfile: { ...(get().sellerProfile || {}), ...profile, verified: true }, isSeller: true, sellerInitialized: true });
    return { success: true };
  },

  placeBid: (auctionId: string, amount: number) => {
    const { isConnected, auctions } = get();
    if (!isConnected) {
      return { success: false, error: 'Please connect your wallet to bid.' };
    }

    const auctionIndex = auctions.findIndex(a => a.id === auctionId);
    if (auctionIndex === -1) {
      return { success: false, error: 'Auction not found.' };
    }

    const auction = auctions[auctionIndex];
    if (amount <= auction.currentBid) {
      return { success: false, error: `Bid must be higher than current bid: ${auction.currentBid} ETH` };
    }

    const updatedAuctions = [...auctions];
    updatedAuctions[auctionIndex] = {
      ...auction,
      currentBid: amount,
      highestBidder: '0x8F3a2C...4D1A', // Current user
      bidsCount: auction.bidsCount + 1
    };

    set({ auctions: updatedAuctions });
    return { success: true };
  },

  claimAuction: (auctionId: string) => {
    const { auctions, collectibles, reputationXP, artifactsCount } = get();
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    const newCollectible: Collectible = {
      id: `won-${auctionId}-${Date.now()}`,
      title: auction.title,
      image: auction.image,
      wonPrice: auction.currentBid,
      xpReward: auction.xpReward,
      mintedDate: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    };

    set({
      collectibles: [newCollectible, ...collectibles],
      reputationXP: reputationXP + auction.xpReward,
      artifactsCount: artifactsCount + 1,
      auctions: auctions.filter(a => a.id !== auctionId)
    });
  },

  createListing: async (listing: Auction) => {
    // append to sellerListings and global auctions to appear in Explore
    const { auctions, sellerListings } = get();
    const newListing = { ...listing, status: 'active' } as Auction;
    set({ sellerListings: [newListing, ...sellerListings], auctions: [newListing, ...auctions] });
    // simulate async mint/list steps
    await new Promise((r) => setTimeout(r, 1400));
    return { success: true };
  },

  claimReward: async (collectibleId: string) => {
    const { wonAuctions, collectibles } = get();
    const item = wonAuctions.find((c) => c.id === collectibleId);
    if (!item) return { success: false };
    // simulate payment/mint flow
    await new Promise((r) => setTimeout(r, 1600));
    set({ collectibles: [item, ...collectibles], wonAuctions: wonAuctions.filter((c) => c.id !== collectibleId) });
    return { success: true };
  }
}));
