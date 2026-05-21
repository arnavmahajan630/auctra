-- Drop dependent views
DROP VIEW IF EXISTS public.view_collectibles;

-- Fix numeric precision for ETH values (from 2 decimal places to 6)
ALTER TABLE public.auctions 
  ALTER COLUMN starting_price TYPE numeric(18,6),
  ALTER COLUMN current_price TYPE numeric(18,6),
  ALTER COLUMN minimum_bid_increment TYPE numeric(18,6),
  ALTER COLUMN reserve_price TYPE numeric(18,6);

ALTER TABLE public.bids 
  ALTER COLUMN bid_amount TYPE numeric(18,6);

ALTER TABLE public.claims 
  ALTER COLUMN amount_paid TYPE numeric(18,6);

-- Recreate dependent views
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
