import { create } from 'zustand';
import { Auction, Collectible, LeaderboardEntry } from '../types';
import { supabase } from '../server/supabase';

interface AppState {
  // Authentication / Wallet
  isConnected: boolean;
  walletAddress: string | null;
  reputationXP: number;
  multiplier: number;
  artifactsCount: number;
  
  // Profile specific state fields
  profileId: string | null;
  profileName: string | null;
  profileAvatar: string | null;
  profileBio: string | null;
  profileLevel: number;
  profileRankTitle: string;
  isVerifiedSeller: boolean;
  sellerStatus: string;
  profileActiveBids: any[];
  profileActivityLogs: any[];
  
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
  fetchLeaderboard: () => Promise<void>;
  fetchProfileData: (profileId: string) => Promise<void>;
  simulateProfileSwitch: (profileId: string) => Promise<void>;
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

  // Profile specific state fields
  profileId: null,
  profileName: null,
  profileAvatar: null,
  profileBio: null,
  profileLevel: 1,
  profileRankTitle: 'Rookie',
  isVerifiedSeller: false,
  sellerStatus: 'none',
  profileActiveBids: [],
  profileActivityLogs: [],

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


  // Actions
  connectWallet: () => {
    set({
      isConnected: true,
      walletAddress: '0x7C2a69Df...D44E',
    });
    // Dynamically fetch seeded AetherLord's database details to represent the active user profile
    get().fetchProfileData('11111111-1111-1111-1111-111111111111');
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      walletAddress: null,
      reputationXP: 0,
      multiplier: 1.0,
      artifactsCount: 0,
      collectibles: [],
      profileId: null,
      profileName: null,
      profileAvatar: null,
      profileBio: null,
      profileLevel: 1,
      profileRankTitle: 'Rookie',
      isVerifiedSeller: false,
      sellerStatus: 'none',
      profileActiveBids: [],
      profileActivityLogs: []
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
  },

  fetchLeaderboard: async () => {
    try {
      const { data, error } = await supabase
        .from('view_leaderboard')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      if (data) {
        set({ leaderboard: data as LeaderboardEntry[] });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  fetchProfileData: async (privyUserId: string) => {
    try {
      // 1. Fetch profile details using Privy DID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('privy_user_id', privyUserId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      const profileId = profile.id;

      // 2. Fetch primary wallet
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('user_id', profileId)
        .eq('is_primary', true)
        .single();

      const walletAddress = walletData?.wallet_address || '0xUnknown...';

      // 3. Fetch collectibles
      const { data: collectibles, error: collError } = await supabase
        .from('view_collectibles')
        .select('*')
        .eq('owner_id', profileId);

      if (collError) throw collError;

      // 4. Fetch bids for active bids tab
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*, auction:auctions(*)')
        .eq('bidder_id', profileId);

      if (bidsError) throw bidsError;

      // Filter active bids: group by auction_id, keep the highest bid, only where auction is active
      const activeBidsMap: Record<string, any> = {};
      if (bidsData) {
        bidsData.forEach((bid) => {
          const auction = bid.auction;
          if (auction && auction.auction_status === 'active') {
            const existingBid = activeBidsMap[auction.id];
            if (!existingBid || Number(bid.bid_amount) > Number(existingBid.currentBid)) {
              activeBidsMap[auction.id] = {
                id: auction.id,
                title: auction.title,
                image: auction.image_url,
                currentBid: Number(bid.bid_amount),
                creator: 'Oktra Creator',
                xpReward: auction.xp_reward,
                endsAt: auction.ends_at,
                highestBidder: walletAddress
              };
            }
          }
        });
      }
      const activeBids = Object.values(activeBidsMap);

      // 5. Fetch claims for transaction feed
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*, auction:auctions(title)')
        .eq('winner_user_id', profileId);

      if (claimsError) throw claimsError;

      // Merge bids and claims into activity feed sorted by date descending
      const activityLogs: any[] = [];
      if (bidsData) {
        bidsData.forEach((bid) => {
          activityLogs.push({
            type: 'Bid Submitted',
            item: bid.auction?.title || 'Unknown Asset',
            amount: `${Number(bid.bid_amount).toFixed(2)} ETH`,
            status: bid.is_winning_bid ? 'Winning' : 'Confirmed',
            txHash: bid.tx_hash ? `${bid.tx_hash.substring(0, 8)}...${bid.tx_hash.substring(bid.tx_hash.length - 4)}` : '0xUnknown',
            date: new Date(bid.created_at).toLocaleDateString() + ' ' + new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawDate: new Date(bid.created_at)
          });
        });
      }
      if (claimsData) {
        claimsData.forEach((claim) => {
          activityLogs.push({
            type: 'Artifact Won & Claimed',
            item: claim.auction?.title || 'Unknown Asset',
            amount: `${Number(claim.amount_paid).toFixed(2)} ETH`,
            status: 'Minted',
            txHash: claim.payment_tx_hash ? `${claim.payment_tx_hash.substring(0, 8)}...${claim.payment_tx_hash.substring(claim.payment_tx_hash.length - 4)}` : '0xUnknown',
            date: new Date(claim.claimed_at || claim.created_at).toLocaleDateString() + ' ' + new Date(claim.claimed_at || claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawDate: new Date(claim.claimed_at || claim.created_at)
          });
        });
      }
      activityLogs.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      // Update state
      set({
        isConnected: true,
        profileId,
        walletAddress,
        profileName: profile.display_name || profile.username,
        profileAvatar: profile.avatar_url,
        profileBio: profile.bio || 'Digital collector of elite on-chain artifacts.',
        reputationXP: profile.xp,
        multiplier: Number(profile.multiplier),
        artifactsCount: profile.total_auctions_won,
        profileLevel: profile.level,
        profileRankTitle: profile.rank_title,
        isVerifiedSeller: profile.is_verified_seller,
        sellerStatus: profile.seller_status,
        collectibles: (collectibles || []).map(c => ({
          id: c.id,
          title: c.title,
          image: c.image,
          wonPrice: Number(c.wonPrice),
          xpReward: c.xpReward,
          mintedDate: c.mintedDate,
          txHash: c.txHash
        })),
        profileActiveBids: activeBids,
        profileActivityLogs: activityLogs
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  },

  simulateProfileSwitch: async (profileId: string) => {
    await get().fetchProfileData(profileId);
  }
}));
