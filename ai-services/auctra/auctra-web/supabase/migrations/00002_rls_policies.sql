-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. USER WALLETS
CREATE POLICY "User wallets are viewable by everyone for leaderboard."
ON public.user_wallets FOR SELECT USING (true);

CREATE POLICY "Users can insert their own wallet."
ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet."
ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id);

-- 3. SELLER VERIFICATIONS
CREATE POLICY "Users can view their own verification."
ON public.seller_verifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification."
ON public.seller_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. CATEGORIES
CREATE POLICY "Categories are viewable by everyone."
ON public.categories FOR SELECT USING (true);

-- 5. AUCTIONS
CREATE POLICY "Auctions are viewable by everyone."
ON public.auctions FOR SELECT USING (true);

CREATE POLICY "Verified sellers can insert auctions."
ON public.auctions FOR INSERT WITH CHECK (auth.uid() = seller_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified_seller = true
));

CREATE POLICY "Sellers can update their own auctions."
ON public.auctions FOR UPDATE USING (auth.uid() = seller_id);

-- 6. AUCTION IMAGES
CREATE POLICY "Auction images are viewable by everyone."
ON public.auction_images FOR SELECT USING (true);

CREATE POLICY "Sellers can insert their auction images."
ON public.auction_images FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.auctions WHERE id = auction_images.auction_id AND seller_id = auth.uid()
));

-- 7. BIDS
CREATE POLICY "Bids are viewable by everyone."
ON public.bids FOR SELECT USING (true);

CREATE POLICY "Users can insert their own bids."
ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- 8. CLAIMS
CREATE POLICY "Claims are viewable by everyone (Trophy Case)."
ON public.claims FOR SELECT USING (true);

CREATE POLICY "Buyers and sellers can update claims."
ON public.claims FOR UPDATE USING (auth.uid() = winner_user_id OR auth.uid() = seller_user_id);

-- 9. DELIVERY ASSETS (RESTRICTED)
-- Only the winner and the seller can view the delivery assets (e.g., electronic pass/secret link)
CREATE POLICY "Only winner and seller can view delivery assets."
ON public.delivery_assets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.claims 
        WHERE id = delivery_assets.claim_id 
        AND (winner_user_id = auth.uid() OR seller_user_id = auth.uid())
    )
);

CREATE POLICY "Sellers can insert delivery assets."
ON public.delivery_assets FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.claims 
        WHERE id = delivery_assets.claim_id AND seller_user_id = auth.uid()
    )
);

-- 10. XP LOGS
CREATE POLICY "XP Logs are viewable by the user."
ON public.xp_logs FOR SELECT USING (auth.uid() = user_id);

-- 11. REPUTATION LOGS
CREATE POLICY "Reputation Logs are viewable by the user."
ON public.reputation_logs FOR SELECT USING (auth.uid() = user_id);

-- 12. NOTIFICATIONS
CREATE POLICY "Notifications are viewable by the user."
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications (mark as read)."
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 13. LEADERBOARD SNAPSHOTS
CREATE POLICY "Leaderboard snapshots are viewable by everyone."
ON public.leaderboard_snapshots FOR SELECT USING (true);
