-- 1. Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', 'Anonymous'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Place Bid (RPC Function)
-- This encapsulates the business logic of placing a bid to ensure data consistency
CREATE OR REPLACE FUNCTION public.place_bid(
    p_auction_id uuid,
    p_bid_amount numeric
)
RETURNS public.bids AS $$
DECLARE
    v_auction public.auctions;
    v_new_bid public.bids;
BEGIN
    -- 1. Get and lock the auction row to prevent race conditions
    SELECT * INTO v_auction 
    FROM public.auctions 
    WHERE id = p_auction_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auction not found';
    END IF;

    -- 2. Validate auction is active and not ended
    IF v_auction.auction_status != 'active' THEN
        RAISE EXCEPTION 'Auction is not active (current status: %)', v_auction.auction_status;
    END IF;

    IF v_auction.ends_at <= now() THEN
        RAISE EXCEPTION 'Auction has already ended';
    END IF;

    -- 3. Validate bid amount
    IF p_bid_amount < (v_auction.current_price + v_auction.minimum_bid_increment) THEN
        RAISE EXCEPTION 'Bid amount must be at least %', (v_auction.current_price + v_auction.minimum_bid_increment);
    END IF;

    -- 4. Insert into bids
    INSERT INTO public.bids (auction_id, bidder_id, bid_amount)
    VALUES (p_auction_id, auth.uid(), p_bid_amount)
    RETURNING * INTO v_new_bid;

    -- 5. Update auctions
    UPDATE public.auctions
    SET 
        current_price = p_bid_amount,
        highest_bidder = auth.uid(),
        total_bids = total_bids + 1,
        updated_at = now()
    WHERE id = p_auction_id;

    -- 6. Send notification to previous highest bidder (if someone was outbid)
    IF v_auction.highest_bidder IS NOT NULL AND v_auction.highest_bidder != auth.uid() THEN
        INSERT INTO public.notifications (user_id, title, message, notification_type, related_auction_id)
        VALUES (
            v_auction.highest_bidder, 
            'You have been outbid!', 
            'Someone placed a higher bid on ' || v_auction.title, 
            'outbid', 
            p_auction_id
        );
    END IF;

    RETURN v_new_bid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Automatically Log XP when Collectible/Claim is settled
CREATE OR REPLACE FUNCTION public.handle_claim_settled()
RETURNS trigger AS $$
BEGIN
    -- If claim status changed to 'paid' or 'completed' and wasn't before
    IF (NEW.claim_status = 'paid' OR NEW.claim_status = 'completed') AND (OLD.claim_status = 'pending') THEN
        
        -- Winner gets XP
        INSERT INTO public.xp_logs (user_id, xp_change, reason, related_auction_id)
        VALUES (NEW.winner_user_id, 50, 'Won auction', NEW.auction_id);
        
        -- Seller gets XP
        INSERT INTO public.xp_logs (user_id, xp_change, reason, related_auction_id)
        VALUES (NEW.seller_user_id, 40, 'Successful sale', NEW.auction_id);
        
        -- Update the profiles total stats
        UPDATE public.profiles
        SET total_auctions_won = total_auctions_won + 1,
            xp = xp + 50
        WHERE id = NEW.winner_user_id;

        UPDATE public.profiles
        SET total_successful_sales = total_successful_sales + 1,
            xp = xp + 40
        WHERE id = NEW.seller_user_id;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_claim_settled
  AFTER UPDATE OF claim_status ON public.claims
  FOR EACH ROW EXECUTE PROCEDURE public.handle_claim_settled();
