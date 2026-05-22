ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS ugf_payment_digest text,
  ADD COLUMN IF NOT EXISTS ugf_fee_tx_hash text,
  ADD COLUMN IF NOT EXISTS ugf_fee_digest text,
  ADD COLUMN IF NOT EXISTS claim_tx_hash text,
  ADD COLUMN IF NOT EXISTS ugf_claim_digest text;

CREATE OR REPLACE FUNCTION public.handle_claim_settled()
RETURNS trigger AS $$
BEGIN
    IF NEW.claim_status IN ('paid', 'completed', 'minted')
       AND OLD.claim_status NOT IN ('paid', 'completed', 'minted') THEN
        INSERT INTO public.xp_logs (user_id, xp_change, reason, related_auction_id)
        VALUES (NEW.winner_user_id, 50, 'Won auction', NEW.auction_id);

        INSERT INTO public.xp_logs (user_id, xp_change, reason, related_auction_id)
        VALUES (NEW.seller_user_id, 40, 'Successful sale', NEW.auction_id);

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

DROP VIEW IF EXISTS public.view_collectibles;

CREATE VIEW public.view_collectibles AS
SELECT 
    c.id,
    a.title,
    a.image_url AS image,
    c.amount_paid AS "wonPrice",
    a.xp_reward AS "xpReward",
    c.claim_tx_hash AS "txHash",
    c.claimed_at AS "mintedDate",
    c.winner_user_id AS owner_id,
    a.prize_details AS "prizeDetails",
    c.nft_token_id
FROM public.claims c
JOIN public.auctions a ON c.auction_id = a.id;
