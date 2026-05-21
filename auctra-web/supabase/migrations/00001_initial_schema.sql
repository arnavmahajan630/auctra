-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username varchar(32) UNIQUE NOT NULL,
    display_name varchar(64),
    email text,
    avatar_url text,
    bio text,
    reputation_score integer DEFAULT 0,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    rank_title varchar(32) DEFAULT 'Rookie',
    multiplier numeric(3,2) DEFAULT 1.0,
    total_auctions_won integer DEFAULT 0,
    total_auctions_created integer DEFAULT 0,
    total_successful_sales integer DEFAULT 0,
    is_verified_seller boolean DEFAULT false,
    seller_status varchar(20) DEFAULT 'none',
    country varchar(64),
    city varchar(64),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. USER WALLETS
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_address varchar(255) UNIQUE NOT NULL,
    wallet_type varchar(32),
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. SELLER VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.seller_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id),
    verification_status varchar(20) DEFAULT 'pending',
    submitted_name varchar(128),
    submitted_email text,
    notes text,
    verified_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id serial PRIMARY KEY,
    slug varchar(64) UNIQUE NOT NULL,
    name varchar(64) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 5. AUCTIONS
CREATE TABLE IF NOT EXISTS public.auctions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid NOT NULL REFERENCES public.profiles(id),
    category_id integer REFERENCES public.categories(id),
    title varchar(255) NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    starting_price numeric(18,2) NOT NULL,
    current_price numeric(18,2) NOT NULL,
    minimum_bid_increment numeric(18,2) DEFAULT 1,
    reserve_price numeric(18,2),
    xp_reward integer DEFAULT 0,
    auction_status varchar(20) DEFAULT 'draft',
    starts_at timestamptz DEFAULT now(),
    ends_at timestamptz NOT NULL,
    highest_bidder uuid REFERENCES public.profiles(id),
    winner_user_id uuid REFERENCES public.profiles(id),
    total_bids integer DEFAULT 0,
    total_watchers integer DEFAULT 0,
    is_claimed boolean DEFAULT false,
    blockchain_settled boolean DEFAULT false,
    contract_auction_id varchar(255),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_auctions_status ON public.auctions(auction_status);
CREATE INDEX idx_auctions_ends_at ON public.auctions(ends_at);
CREATE INDEX idx_auctions_seller ON public.auctions(seller_id);

-- 6. AUCTION IMAGES
CREATE TABLE IF NOT EXISTS public.auction_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    image_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 7. BIDS
CREATE TABLE IF NOT EXISTS public.bids (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_id uuid NOT NULL REFERENCES public.profiles(id),
    bid_amount numeric(18,2) NOT NULL,
    is_winning_bid boolean DEFAULT false,
    tx_hash text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bids_auction ON public.bids(auction_id);
CREATE INDEX idx_bids_bidder ON public.bids(bidder_id);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);

-- 8. CLAIMS
CREATE TABLE IF NOT EXISTS public.claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id uuid UNIQUE NOT NULL REFERENCES public.auctions(id),
    winner_user_id uuid NOT NULL REFERENCES public.profiles(id),
    seller_user_id uuid NOT NULL REFERENCES public.profiles(id),
    claim_status varchar(20) DEFAULT 'pending',
    payment_tx_hash text,
    claimed_at timestamptz,
    amount_paid numeric(18,2),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_claims_winner ON public.claims(winner_user_id);

-- 9. DELIVERY ASSETS
CREATE TABLE IF NOT EXISTS public.delivery_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    asset_type varchar(32),
    title varchar(255),
    content text,
    file_url text,
    created_at timestamptz DEFAULT now()
);

-- 10. XP LOGS
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    xp_change integer NOT NULL,
    reason varchar(255),
    related_auction_id uuid REFERENCES public.auctions(id),
    created_at timestamptz DEFAULT now()
);

-- 11. REPUTATION LOGS
CREATE TABLE IF NOT EXISTS public.reputation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    reputation_change integer NOT NULL,
    reason varchar(255),
    related_auction_id uuid REFERENCES public.auctions(id),
    created_at timestamptz DEFAULT now()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    title varchar(255),
    message text,
    notification_type varchar(64),
    is_read boolean DEFAULT false,
    related_auction_id uuid REFERENCES public.auctions(id),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- 13. LEADERBOARD SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    reputation_score integer,
    xp integer,
    rank_position integer,
    snapshot_date date DEFAULT current_date
);

-- VIEWS FOR UI COMPATIBILITY
CREATE OR REPLACE VIEW public.view_collectibles AS
SELECT 
    c.id,
    a.title,
    a.image_url AS image,
    c.amount_paid AS "wonPrice",
    a.xp_reward AS "xpReward",
    c.payment_tx_hash AS "txHash",
    c.claimed_at AS "mintedDate",
    c.winner_user_id AS owner_id
FROM public.claims c
JOIN public.auctions a ON c.auction_id = a.id;

CREATE OR REPLACE VIEW public.view_leaderboard AS
SELECT 
    ROW_NUMBER() OVER(ORDER BY reputation_score DESC) as rank,
    w.wallet_address AS wallet,
    p.display_name AS name,
    p.total_auctions_won AS "artifactsCount",
    p.reputation_score AS "reputationXP",
    p.multiplier,
    p.avatar_url AS avatar
FROM public.profiles p
LEFT JOIN public.user_wallets w ON p.id = w.user_id AND w.is_primary = true;
