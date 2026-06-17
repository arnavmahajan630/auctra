-- =========================================================================
-- OKTRA LEADERBOARD SEED SQL SCRIPT
-- Paste this into your Supabase Dashboard SQL Editor to populate dummy data!
-- =========================================================================

-- 1. Create a few mock users in Supabase Auth (necessary for profiles FK)
-- Note: In Supabase, the public.profiles are automatically created by our trigger!
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aetherlord@oktra.io', '{"username": "AetherLord.eth", "display_name": "AetherLord.eth", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"}'::jsonb, now()),
  ('22222222-2222-2222-2222-222222222222', 'obsidian@oktra.io', '{"username": "ObsidianKnight", "display_name": "ObsidianKnight", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"}'::jsonb, now()),
  ('33333333-3333-3333-3333-333333333333', 'glitch@oktra.io', '{"username": "GlitchHacker", "display_name": "GlitchHacker", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop"}'::jsonb, now()),
  ('44444444-4444-4444-4444-444444444444', 'nebula@oktra.io', '{"username": "NebulaWhale.eth", "display_name": "NebulaWhale.eth", "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"}'::jsonb, now());

-- 2. Update their profile attributes (reputation, xp, multiplier, total wins)
-- Note: These rows already exist because of our handle_new_user trigger!
UPDATE public.profiles 
SET reputation_score = 18450, xp = 18450, total_auctions_won = 42, multiplier = 1.45, rank_title = 'Elite'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles 
SET reputation_score = 14200, xp = 14200, total_auctions_won = 31, multiplier = 1.30, rank_title = 'Champion'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.profiles 
SET reputation_score = 9850, xp = 9850, total_auctions_won = 24, multiplier = 1.20, rank_title = 'Pro'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.profiles 
SET reputation_score = 8120, xp = 8120, total_auctions_won = 18, multiplier = 1.10, rank_title = 'Veteran'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- 3. Insert mock user primary wallets (leaderboard needs this to show wallet address)
INSERT INTO public.user_wallets (user_id, wallet_address, wallet_type, is_primary)
VALUES
  ('11111111-1111-1111-1111-111111111111', '0x7C2a69Df...D44E', 'metamask', true),
  ('22222222-2222-2222-2222-222222222222', '0x3D9b2fC1...F21A', 'embedded', true),
  ('33333333-3333-3333-3333-333333333333', '0x9E1d21A5...B50C', 'walletconnect', true),
  ('44444444-4444-4444-4444-444444444444', '0x1F2f9011...A98E', 'embedded', true);
