-- Add nft_token_id to claims table
ALTER TABLE public.claims ADD COLUMN nft_token_id integer;

DROP VIEW IF EXISTS public.view_collectibles;

CREATE OR REPLACE VIEW public.view_collectibles AS
SELECT 
    c.id,
    a.title,
    a.image_url AS image,
    c.amount_paid AS "wonPrice",
    a.xp_reward AS "xpReward",
    a.prize_details AS "prizeDetails",
    c.payment_tx_hash AS "txHash",
    c.claimed_at AS "mintedDate",
    c.winner_user_id AS owner_id,
    c.nft_token_id
FROM public.claims c
JOIN public.auctions a ON c.auction_id = a.id;
