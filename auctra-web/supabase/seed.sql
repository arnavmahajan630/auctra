-- ============================================================
-- AUCTRA PLATFORM SEED DATA
-- Paste into Supabase SQL Editor (runs as postgres, bypasses RLS)
-- ============================================================

DO $$
DECLARE
  -- User UUIDs
  u1  uuid := '11111111-1111-1111-1111-111111111111';
  u2  uuid := '22222222-2222-2222-2222-222222222222';
  u3  uuid := '33333333-3333-3333-3333-333333333333';
  u4  uuid := '44444444-4444-4444-4444-444444444444';
  u5  uuid := '55555555-5555-5555-5555-555555555555';
  u6  uuid := '66666666-6666-6666-6666-666666666666';
  u7  uuid := '77777777-7777-7777-7777-777777777777';
  u8  uuid := '88888888-8888-8888-8888-888888888888';
  u9  uuid := '99999999-9999-9999-9999-999999999999';
  u10 uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  -- Auction UUIDs
  a1  uuid := 'a1000001-0000-0000-0000-000000000001';
  a2  uuid := 'a2000002-0000-0000-0000-000000000002';
  a3  uuid := 'a3000003-0000-0000-0000-000000000003';
  a4  uuid := 'a4000004-0000-0000-0000-000000000004';
  a5  uuid := 'a5000005-0000-0000-0000-000000000005';
  a6  uuid := 'a6000006-0000-0000-0000-000000000006';
  a7  uuid := 'a7000007-0000-0000-0000-000000000007';
  a8  uuid := 'a8000008-0000-0000-0000-000000000008';
  a9  uuid := 'a9000009-0000-0000-0000-000000000009';
  a10 uuid := 'a1000010-0000-0000-0000-000000000010';
  a11 uuid := 'a1100011-0000-0000-0000-000000000011';
  a12 uuid := 'a1200012-0000-0000-0000-000000000012';
  a13 uuid := 'a1300013-0000-0000-0000-000000000013';
  a14 uuid := 'a1400014-0000-0000-0000-000000000014';
  a15 uuid := 'a1500015-0000-0000-0000-000000000015';
  a16 uuid := 'a1600016-0000-0000-0000-000000000016';
  a17 uuid := 'a1700017-0000-0000-0000-000000000017';
  a18 uuid := 'a1800018-0000-0000-0000-000000000018';
  a19 uuid := 'a1900019-0000-0000-0000-000000000019';
  a20 uuid := 'a2000020-0000-0000-0000-000000000020';

  -- Claim UUIDs
  c1 uuid := 'c1000001-0000-0000-0000-000000000001';
  c2 uuid := 'c2000002-0000-0000-0000-000000000002';
  c3 uuid := 'c3000003-0000-0000-0000-000000000003';
  c4 uuid := 'c4000004-0000-0000-0000-000000000004';
  c5 uuid := 'c5000005-0000-0000-0000-000000000005';

  -- Category IDs resolved after insert
  cat_elec  int;
  cat_art   int;
  cat_coll  int;
  cat_game  int;
  cat_fash  int;
  cat_watch int;

BEGIN

-- ============================================================
-- 1. AUTH USERS  (trigger auto-creates profile shells)
-- ============================================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at, aud, role,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  (u1,  '00000000-0000-0000-0000-000000000000',
   'blockbaron@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '8 months',
   '{"username":"blockbaron","display_name":"Block Baron","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=blockbaron"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '8 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u2,  '00000000-0000-0000-0000-000000000000',
   'pixelqueen@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '7 months',
   '{"username":"pixelqueen","display_name":"Pixel Queen","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=pixelqueen"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '7 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u3,  '00000000-0000-0000-0000-000000000000',
   'nfthunter@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '6 months',
   '{"username":"nfthunter","display_name":"NFT Hunter","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=nfthunter"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '6 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u4,  '00000000-0000-0000-0000-000000000000',
   'artarchon@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '5 months',
   '{"username":"artarchon","display_name":"Art Archon","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=artarchon"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '5 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u5,  '00000000-0000-0000-0000-000000000000',
   'vaultviper@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '4 months',
   '{"username":"vaultviper","display_name":"Vault Viper","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=vaultviper"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '4 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u6,  '00000000-0000-0000-0000-000000000000',
   'chainchaser@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '3 months',
   '{"username":"chainchaser","display_name":"Chain Chaser","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=chainchaser"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '3 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u7,  '00000000-0000-0000-0000-000000000000',
   'tokentitan@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '2 months',
   '{"username":"tokentitan","display_name":"Token Titan","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=tokentitan"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '2 months', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u8,  '00000000-0000-0000-0000-000000000000',
   'rareraider@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '6 weeks',
   '{"username":"rareraider","display_name":"Rare Raider","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=rareraider"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '6 weeks', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u9,  '00000000-0000-0000-0000-000000000000',
   'gemguardian@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '1 month',
   '{"username":"gemguardian","display_name":"Gem Guardian","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=gemguardian"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '1 month', now(), 'authenticated', 'authenticated', '', '', '', ''),
  (u10, '00000000-0000-0000-0000-000000000000',
   'cryptoking@auctra.xyz',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   now() - interval '2 weeks',
   '{"username":"cryptoking","display_name":"Crypto King","avatar_url":"https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoking"}',
   '{"provider":"email","providers":["email"]}',
   now() - interval '2 weeks', now(), 'authenticated', 'authenticated', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. PROFILES  (trigger created shells — flesh them out)
-- ============================================================
UPDATE profiles SET
  bio = 'OG auction whale. Been in the game since genesis block. Chase nothing, acquire everything.',
  reputation_score = 5200, xp = 24000, level = 10, rank_title = 'Legend',
  multiplier = 2.50, total_auctions_won = 31, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'United States', city = 'New York', onboarding_complete = true
WHERE id = u1;

UPDATE profiles SET
  bio = 'Digital artist turned auction architect. Every piece tells a story.',
  reputation_score = 3800, xp = 17200, level = 8, rank_title = 'Master',
  multiplier = 2.00, total_auctions_won = 12, total_auctions_created = 24,
  total_successful_sales = 21, is_verified_seller = true, seller_status = 'approved',
  country = 'Japan', city = 'Tokyo', onboarding_complete = true
WHERE id = u2;

UPDATE profiles SET
  bio = 'Always hunting for the next rare drop. Portfolio keeps growing.',
  reputation_score = 2100, xp = 9800, level = 6, rank_title = 'Expert',
  multiplier = 1.50, total_auctions_won = 18, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'Germany', city = 'Berlin', onboarding_complete = true
WHERE id = u3;

UPDATE profiles SET
  bio = 'Curator of rare artifacts. Authenticity guaranteed, provenance verified.',
  reputation_score = 4100, xp = 19500, level = 9, rank_title = 'Master',
  multiplier = 2.00, total_auctions_won = 8, total_auctions_created = 35,
  total_successful_sales = 32, is_verified_seller = true, seller_status = 'approved',
  country = 'United Kingdom', city = 'London', onboarding_complete = true
WHERE id = u4;

UPDATE profiles SET
  bio = 'Tech enthusiast and collector. Stacking wins one auction at a time.',
  reputation_score = 1200, xp = 5400, level = 4, rank_title = 'Apprentice',
  multiplier = 1.20, total_auctions_won = 9, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'Canada', city = 'Toronto', onboarding_complete = true
WHERE id = u5;

UPDATE profiles SET
  bio = 'New to the chain, quick on the bid. Watch this space.',
  reputation_score = 450, xp = 2100, level = 2, rank_title = 'Rookie',
  multiplier = 1.00, total_auctions_won = 3, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'Australia', city = 'Sydney', onboarding_complete = true
WHERE id = u6;

UPDATE profiles SET
  bio = 'Blockchain veteran. Rare gaming items and limited editions are my domain.',
  reputation_score = 2600, xp = 11800, level = 7, rank_title = 'Expert',
  multiplier = 1.75, total_auctions_won = 22, total_auctions_created = 15,
  total_successful_sales = 14, is_verified_seller = true, seller_status = 'approved',
  country = 'South Korea', city = 'Seoul', onboarding_complete = true
WHERE id = u7;

UPDATE profiles SET
  bio = 'Rare item radar activated. If it drops, I find it.',
  reputation_score = 880, xp = 3900, level = 3, rank_title = 'Apprentice',
  multiplier = 1.10, total_auctions_won = 6, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'Brazil', city = 'São Paulo', onboarding_complete = true
WHERE id = u8;

UPDATE profiles SET
  bio = 'Gem hunter. Every bid is calculated. Every win is earned.',
  reputation_score = 1650, xp = 7200, level = 5, rank_title = 'Expert',
  multiplier = 1.50, total_auctions_won = 14, total_auctions_created = 8,
  total_successful_sales = 7, is_verified_seller = true, seller_status = 'approved',
  country = 'France', city = 'Paris', onboarding_complete = true
WHERE id = u9;

UPDATE profiles SET
  bio = 'Just getting started. Eyes on the throne.',
  reputation_score = 300, xp = 1200, level = 1, rank_title = 'Rookie',
  multiplier = 1.00, total_auctions_won = 1, total_auctions_created = 0,
  total_successful_sales = 0, is_verified_seller = false, seller_status = 'none',
  country = 'India', city = 'Mumbai', onboarding_complete = false
WHERE id = u10;

-- ============================================================
-- 3. USER WALLETS
-- ============================================================
INSERT INTO user_wallets (user_id, wallet_address, wallet_type, is_primary) VALUES
  (u1,  '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b', 'embedded', true),
  (u2,  '0x2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c', 'embedded', true),
  (u3,  '0x3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d', 'metamask',  true),
  (u4,  '0x4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e', 'embedded', true),
  (u5,  '0x5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f', 'metamask',  true),
  (u6,  '0x6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a', 'embedded', true),
  (u7,  '0x7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5A6b', 'embedded', true),
  (u8,  '0x8B9c0D1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B7c', 'metamask',  true),
  (u9,  '0x9C0d1E2f3A4b5C6d7E8f9A0b1C2d3E4f5A6b7C8d', 'embedded', true),
  (u10, '0xaD1e2F3a4B5c6D7e8F9a0B1c2D3e4F5a6B7c8D9e', 'metamask',  true)
ON CONFLICT (wallet_address) DO NOTHING;

-- ============================================================
-- 4. SELLER VERIFICATIONS
-- ============================================================
INSERT INTO seller_verifications (user_id, verification_status, submitted_name, submitted_email, verified_at) VALUES
  (u2, 'approved', 'Pixel Queen',  'pixelqueen@auctra.xyz',  now() - interval '6 months'),
  (u4, 'approved', 'Art Archon',   'artarchon@auctra.xyz',   now() - interval '4 months'),
  (u7, 'approved', 'Token Titan',  'tokentitan@auctra.xyz',  now() - interval '5 weeks'),
  (u9, 'approved', 'Gem Guardian', 'gemguardian@auctra.xyz', now() - interval '3 weeks'),
  (u5, 'pending',  'Vault Viper',  'vaultviper@auctra.xyz',  NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
INSERT INTO categories (slug, name) VALUES
  ('electronics',  'Electronics'),
  ('digital-art',  'Digital Art'),
  ('collectibles', 'Collectibles'),
  ('gaming',       'Gaming'),
  ('fashion',      'Fashion'),
  ('watches',      'Watches')
ON CONFLICT (slug) DO NOTHING;

SELECT id INTO cat_elec  FROM categories WHERE slug = 'electronics';
SELECT id INTO cat_art   FROM categories WHERE slug = 'digital-art';
SELECT id INTO cat_coll  FROM categories WHERE slug = 'collectibles';
SELECT id INTO cat_game  FROM categories WHERE slug = 'gaming';
SELECT id INTO cat_fash  FROM categories WHERE slug = 'fashion';
SELECT id INTO cat_watch FROM categories WHERE slug = 'watches';

-- ============================================================
-- 6a. ACTIVE AUCTIONS
-- ============================================================
INSERT INTO auctions (
  id, seller_id, category_id, title, description, image_url,
  starting_price, current_price, minimum_bid_increment, reserve_price,
  xp_reward, auction_status, starts_at, ends_at,
  highest_bidder, total_bids, total_watchers, prize_details
) VALUES
  (a1, u2, cat_elec,
   'Sony PlayStation 5 Pro — Signed by Hideo Kojima',
   'Limited edition PS5 Pro console personally signed by gaming legend Hideo Kojima at Tokyo Game Show 2025. Includes certificate of authenticity, custom display case, and one signed copy of Death Stranding 2.',
   'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
   450.000000, 1240.000000, 25.000000, 800.000000, 150,
   'active', now() - interval '2 days', now() + interval '1 day 14 hours',
   u1, 22, 87,
   'Signed PS5 Pro, certificate of authenticity, custom acrylic display case, signed Death Stranding 2.'),

  (a2, u4, cat_watch,
   'Rolex Submariner 1969 — Original Box & Papers',
   'A pristine 1969 Rolex Submariner ref. 1680 with original box and papers. Unpolished case, original glossy dial. Graded NM+ by independent authenticator.',
   'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
   3500.000000, 8950.000000, 100.000000, 6000.000000, 300,
   'active', now() - interval '3 days', now() + interval '2 days 6 hours',
   u1, 34, 156,
   'Original box and papers, service records, independent appraisal certificate.'),

  (a3, u2, cat_art,
   'Genesis Collection: "Neon Epoch" — 1/1 Original',
   'The crown jewel of the Genesis Collection. A 1/1 original digital artwork by acclaimed crypto artist Pixel Queen, rendered at 8K. Includes perpetual commercial rights and exclusive holder perks.',
   'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
   200.000000, 2100.000000, 50.000000, NULL, 200,
   'active', now() - interval '1 day', now() + interval '3 days 2 hours',
   u1, 18, 203,
   'Full commercial rights. 8K master file. Lifetime collector Discord access.'),

  (a4, u7, cat_game,
   'Street Fighter II Cabinet — SNES World Championship Edition',
   'Fully restored SNES World Championship arcade cabinet, one of only 26 ever made. Original PCB, perfect display, coin-op mechanism preserved. Museum grade restoration.',
   'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
   800.000000, 3400.000000, 50.000000, 2000.000000, 250,
   'active', now() - interval '4 days', now() + interval '8 hours',
   u3, 29, 112,
   'Original PCB intact. Full restoration log. White-glove courier shipping only.'),

  (a5, u4, cat_coll,
   'First Edition Pokémon Base Set — PSA 10 Charizard',
   'The holy grail. PSA 10 First Edition Shadowless Charizard. Perfect centering, pristine edges, zero print defects. One of fewer than 50 known PSA 10 copies in existence.',
   'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800',
   15000.000000, 42500.000000, 500.000000, 25000.000000, 500,
   'active', now() - interval '5 days', now() + interval '4 days',
   u1, 61, 432,
   'PSA cert #79842561. Tamper-evident case, appraisal letter, insured shipping.'),

  (a6, u9, cat_fash,
   'Supreme x Louis Vuitton Duffel — DS w/ Tags',
   'Deadstock Supreme x Louis Vuitton 2017 collab duffel bag. Never used, all tags attached, original dust bag and receipt. One of the most sought-after streetwear collabs ever made.',
   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
   1200.000000, 4100.000000, 100.000000, 2500.000000, 175,
   'active', now() - interval '2 days', now() + interval '5 days',
   u5, 27, 198,
   'Deadstock. Original receipt. Dust bag. Authentication via LEGIT app QR code.'),

  (a7, u7, cat_elec,
   'Apple Vision Pro Developer Kit — Pre-Production Unit',
   'Rare pre-production Apple Vision Pro developer kit with unreleased engineering sample accessories. Acquired through official developer program. Perfect working condition.',
   'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
   2000.000000, 5600.000000, 100.000000, 3500.000000, 220,
   'active', now() - interval '1 day', now() + interval '6 days 12 hours',
   u1, 15, 89,
   'Pre-production unit. Developer accessories included. Original Apple packaging preserved.'),

  (a8, u2, cat_coll,
   'Banksy "Girl With Balloon" — Authenticated Print 12/150',
   'Authenticated Banksy screen print "Girl with Balloon" numbered 12 of 150. Pest Control certificate. Acid-free archival mounting. Provenance: private UK collection, acquired 2008.',
   'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
   5000.000000, 13200.000000, 200.000000, 8000.000000, 350,
   'active', now() - interval '6 days', now() + interval '1 day 3 hours',
   u1, 44, 267,
   'Pest Control certificate. Archival UV-protective glass. White-glove delivery.');

-- ============================================================
-- 6b. ENDED AUCTIONS
-- ============================================================
INSERT INTO auctions (
  id, seller_id, category_id, title, description, image_url,
  starting_price, current_price, minimum_bid_increment, reserve_price,
  xp_reward, auction_status, starts_at, ends_at,
  highest_bidder, winner_user_id, total_bids, total_watchers,
  is_claimed, blockchain_settled, prize_details
) VALUES
  (a9, u4, cat_art,
   '"Chromatic Abyss" — Generative Art 1/1',
   'Unique generative artwork via proprietary algorithm. Dynamic gradient shifts across 16.7M colors. Sold with full source code and exclusive minting rights.',
   'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
   100.000000, 780.000000, 20.000000, NULL, 100,
   'ended', now() - interval '10 days', now() - interval '3 days',
   u1, u1, 24, 98, true, true,
   'Source code included. Full commercial rights. Exclusive minting access.'),

  (a10, u2, cat_watch,
   'Patek Philippe Nautilus 5711 — Discontinued Steel',
   'The legendary discontinued Patek Philippe Nautilus 5711/1A-010 in stainless steel. Box and papers from 2020 purchase. Exceptional condition, never worn.',
   'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
   8000.000000, 18500.000000, 200.000000, 12000.000000, 400,
   'ended', now() - interval '14 days', now() - interval '7 days',
   u3, u3, 52, 334, true, true,
   'Box and papers. Service warranty active. Independent valuation at $22,000.'),

  (a11, u7, cat_game,
   'Nintendo World Championships 1990 Cartridge',
   'Ultra-rare NWC 1990 gray cartridge in remarkable preserved condition. One of approximately 116 given to competitors. VGA graded 80+ NM.',
   'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800',
   5000.000000, 14800.000000, 200.000000, 8000.000000, 450,
   'ended', now() - interval '8 days', now() - interval '1 day',
   u1, u1, 38, 221, false, false,
   'VGA graded. Custom protective case. Full provenance documentation.'),

  (a12, u9, cat_fash,
   'Travis Scott x Air Jordan 1 Low "Olive" — DS Sz 10',
   'Deadstock Travis Scott x AJ1 Low Olive size 10. Factory sealed box with all accessories. StockX verified authentic.',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
   800.000000, 2200.000000, 50.000000, 1200.000000, 130,
   'ended', now() - interval '6 days', now() - interval '2 days',
   u5, u5, 29, 145, true, true,
   'Factory sealed. All accessories. StockX verification QR included.'),

  (a13, u4, cat_coll,
   'Magic: The Gathering Alpha Black Lotus — PSA 7',
   'The most iconic card in trading card game history. Alpha Edition Black Lotus in PSA 7 condition. Cert #34891029.',
   'https://images.unsplash.com/photo-1610703564073-3e5e75ad6c8c?w=800',
   20000.000000, 68000.000000, 1000.000000, 40000.000000, 1000,
   'ended', now() - interval '20 days', now() - interval '13 days',
   u3, u3, 87, 891, true, true,
   'PSA 7 graded. Cert #34891029. Insured shipping. Transfer of PSA registry.'),

  (a14, u7, cat_elec,
   'IBM Personal Computer 5150 — First Model, Original Box',
   'The original 1981 IBM 5150 in remarkable preserved condition with original retail box, all documentation, and factory-sealed software. A piece of computing history.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
   500.000000, 2800.000000, 50.000000, 1500.000000, 200,
   'ended', now() - interval '5 days', now() - interval '18 hours',
   u8, u8, 31, 167, false, false,
   'All original documentation. Factory condition preserved. Tested and fully functional.'),

  (a15, u2, cat_art,
   '"Solitude Protocol" — AI x Human Collaboration 1/1',
   'Groundbreaking 1/1 artwork created in live collaboration between Pixel Queen and an experimental AI system. 6K digital canvas with handwritten artist notes.',
   'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=800',
   300.000000, 1650.000000, 30.000000, NULL, 175,
   'ended', now() - interval '12 days', now() - interval '5 days',
   u6, u6, 21, 134, true, true,
   '6K master file. AI collaboration notes. Artist signed certificate.');

-- ============================================================
-- 6c. DRAFT + UPCOMING AUCTIONS
-- ============================================================
INSERT INTO auctions (
  id, seller_id, category_id, title, description, image_url,
  starting_price, current_price, minimum_bid_increment,
  xp_reward, auction_status, starts_at, ends_at,
  total_bids, total_watchers, prize_details
) VALUES
  (a16, u4, cat_watch,
   'Richard Mille RM 011 Americas — Felipe Massa Edition',
   'Ultra rare RM 011 Americas Felipe Massa Edition. NTPT carbon case, titanium movement. Acquired from authorized dealer 2019. Never serviced — still on factory oil.',
   'https://images.unsplash.com/photo-1599994069960-6c65441f9982?w=800',
   18000.000000, 18000.000000, 500.000000, 600,
   'draft', now() + interval '2 days', now() + interval '9 days', 0, 0,
   'Box and papers. Dealer invoice. Never serviced — still on factory oil.'),

  (a17, u9, cat_coll,
   'Bored Ape Yacht Club #2890 — Physical Print + NFT Transfer',
   'Museum-quality archival fine art print (36x36", acid-free) of BAYC #2890 plus full NFT ownership transfer. Rare blue background, laser eyes trait. Sold as one unified piece.',
   'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800',
   4000.000000, 4000.000000, 100.000000, 400,
   'draft', now() + interval '1 day', now() + interval '8 days', 0, 0,
   'Physical 36x36" print. Full NFT transfer on Ethereum mainnet.'),

  (a18, u7, cat_game,
   'Atari 2600 Heavy Sixer — CIB w/ 42 Cartridges',
   'Complete-in-box Atari 2600 "Heavy Sixer" (first production run, 1977) with 42 cartridges all CIB, original paddles and joysticks. Fully tested, all games functional.',
   'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
   400.000000, 400.000000, 25.000000, 180,
   'draft', now() + interval '3 days', now() + interval '10 days', 0, 0,
   'All 42 cartridges complete-in-box. Original peripherals. Tested functional.'),

  (a19, u2, cat_art,
   '"Hyper Bloom" — Animated 1/1 with Physical Canvas',
   'Animated digital artwork with companion hand-painted physical canvas. Dual ownership. The digital and physical exist as one unified piece — inseparable by contract.',
   'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
   500.000000, 500.000000, 25.000000, 225,
   'active', now() + interval '6 hours', now() + interval '7 days', 0, 47,
   'Physical canvas shipped. Digital file delivered on close. Unified ownership contract.'),

  (a20, u4, cat_coll,
   'Yu-Gi-Oh! 2002 Tournament Black Luster Soldier — Only 1 Exists',
   'The rarest Yu-Gi-Oh! card ever produced. Awarded to the first world tournament champion in 2002. CGC 9. Only one copy in existence. This may never appear at auction again.',
   'https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?w=800',
   50000.000000, 50000.000000, 2000.000000, 2000,
   'active', now() + interval '12 hours', now() + interval '14 days', 0, 1204,
   'CGC 9 graded. Original tournament provenance documents. CGC registry transfer.');

-- ============================================================
-- 7. AUCTION IMAGES (extra angles)
-- ============================================================
INSERT INTO auction_images (auction_id, image_url, image_order) VALUES
  (a1, 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800', 1),
  (a2, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800', 1),
  (a5, 'https://images.unsplash.com/photo-1554902843-260acd0993f8?w=800',    1),
  (a8, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', 1);

-- ============================================================
-- 8. BIDS — active auctions
-- ============================================================
INSERT INTO bids (auction_id, bidder_id, bid_amount, is_winning_bid, created_at) VALUES
  -- a1: PS5 Pro signed (22 bids)
  (a1, u3,  475.00,  false, now() - interval '2 days'),
  (a1, u5,  500.00,  false, now() - interval '47 hours'),
  (a1, u3,  550.00,  false, now() - interval '46 hours'),
  (a1, u6,  600.00,  false, now() - interval '44 hours'),
  (a1, u8,  675.00,  false, now() - interval '40 hours'),
  (a1, u3,  725.00,  false, now() - interval '36 hours'),
  (a1, u5,  800.00,  false, now() - interval '30 hours'),
  (a1, u1,  875.00,  false, now() - interval '24 hours'),
  (a1, u3,  950.00,  false, now() - interval '20 hours'),
  (a1, u5,  1050.00, false, now() - interval '16 hours'),
  (a1, u1,  1100.00, false, now() - interval '12 hours'),
  (a1, u8,  1150.00, false, now() - interval '8 hours'),
  (a1, u3,  1200.00, false, now() - interval '4 hours'),
  (a1, u1,  1240.00, true,  now() - interval '2 hours'),
  -- a2: Rolex (34 bids, showing last 13)
  (a2, u1,  3600.00, false, now() - interval '3 days'),
  (a2, u3,  3800.00, false, now() - interval '70 hours'),
  (a2, u5,  4100.00, false, now() - interval '68 hours'),
  (a2, u1,  4500.00, false, now() - interval '65 hours'),
  (a2, u8,  4800.00, false, now() - interval '60 hours'),
  (a2, u3,  5200.00, false, now() - interval '55 hours'),
  (a2, u1,  5800.00, false, now() - interval '50 hours'),
  (a2, u6,  6200.00, false, now() - interval '45 hours'),
  (a2, u3,  6700.00, false, now() - interval '40 hours'),
  (a2, u1,  7300.00, false, now() - interval '35 hours'),
  (a2, u5,  7800.00, false, now() - interval '28 hours'),
  (a2, u3,  8400.00, false, now() - interval '20 hours'),
  (a2, u1,  8950.00, true,  now() - interval '8 hours'),
  -- a3: Neon Epoch (18 bids)
  (a3, u5,  250.00,  false, now() - interval '1 day'),
  (a3, u6,  300.00,  false, now() - interval '23 hours'),
  (a3, u8,  400.00,  false, now() - interval '22 hours'),
  (a3, u5,  550.00,  false, now() - interval '20 hours'),
  (a3, u1,  700.00,  false, now() - interval '18 hours'),
  (a3, u6,  900.00,  false, now() - interval '16 hours'),
  (a3, u3,  1100.00, false, now() - interval '12 hours'),
  (a3, u1,  1400.00, false, now() - interval '8 hours'),
  (a3, u3,  1700.00, false, now() - interval '4 hours'),
  (a3, u1,  2100.00, true,  now() - interval '1 hour'),
  -- a4: SF2 Cabinet (29 bids)
  (a4, u5,  850.00,  false, now() - interval '4 days'),
  (a4, u3,  950.00,  false, now() - interval '90 hours'),
  (a4, u6,  1100.00, false, now() - interval '88 hours'),
  (a4, u8,  1300.00, false, now() - interval '85 hours'),
  (a4, u3,  1600.00, false, now() - interval '80 hours'),
  (a4, u5,  2000.00, false, now() - interval '72 hours'),
  (a4, u1,  2400.00, false, now() - interval '60 hours'),
  (a4, u3,  2800.00, false, now() - interval '48 hours'),
  (a4, u1,  3100.00, false, now() - interval '24 hours'),
  (a4, u3,  3400.00, true,  now() - interval '5 hours'),
  -- a5: PSA 10 Charizard (61 bids — high activity)
  (a5, u3,  15500.00, false, now() - interval '5 days'),
  (a5, u6,  16000.00, false, now() - interval '118 hours'),
  (a5, u8,  17000.00, false, now() - interval '115 hours'),
  (a5, u3,  18500.00, false, now() - interval '112 hours'),
  (a5, u1,  20000.00, false, now() - interval '108 hours'),
  (a5, u5,  22000.00, false, now() - interval '102 hours'),
  (a5, u3,  24000.00, false, now() - interval '96 hours'),
  (a5, u1,  26000.00, false, now() - interval '90 hours'),
  (a5, u5,  28000.00, false, now() - interval '84 hours'),
  (a5, u3,  30000.00, false, now() - interval '78 hours'),
  (a5, u1,  33000.00, false, now() - interval '70 hours'),
  (a5, u8,  36000.00, false, now() - interval '60 hours'),
  (a5, u3,  38500.00, false, now() - interval '48 hours'),
  (a5, u1,  40000.00, false, now() - interval '36 hours'),
  (a5, u5,  41000.00, false, now() - interval '24 hours'),
  (a5, u3,  42000.00, false, now() - interval '12 hours'),
  (a5, u1,  42500.00, true,  now() - interval '3 hours'),
  -- a6: Supreme LV duffel
  (a6, u6,  1300.00, false, now() - interval '2 days'),
  (a6, u8,  1500.00, false, now() - interval '46 hours'),
  (a6, u3,  1800.00, false, now() - interval '44 hours'),
  (a6, u5,  2200.00, false, now() - interval '40 hours'),
  (a6, u8,  2700.00, false, now() - interval '36 hours'),
  (a6, u3,  3200.00, false, now() - interval '24 hours'),
  (a6, u1,  3700.00, false, now() - interval '12 hours'),
  (a6, u5,  4100.00, true,  now() - interval '3 hours'),
  -- a7: Apple Vision Pro
  (a7, u8,  2100.00, false, now() - interval '1 day'),
  (a7, u6,  2400.00, false, now() - interval '22 hours'),
  (a7, u3,  2900.00, false, now() - interval '20 hours'),
  (a7, u8,  3500.00, false, now() - interval '16 hours'),
  (a7, u5,  4200.00, false, now() - interval '10 hours'),
  (a7, u3,  5100.00, false, now() - interval '5 hours'),
  (a7, u1,  5600.00, true,  now() - interval '1 hour'),
  -- a8: Banksy print
  (a8, u5,  5200.00,  false, now() - interval '6 days'),
  (a8, u3,  5800.00,  false, now() - interval '140 hours'),
  (a8, u8,  6500.00,  false, now() - interval '135 hours'),
  (a8, u1,  7200.00,  false, now() - interval '130 hours'),
  (a8, u5,  8000.00,  false, now() - interval '120 hours'),
  (a8, u3,  9000.00,  false, now() - interval '108 hours'),
  (a8, u1,  10200.00, false, now() - interval '96 hours'),
  (a8, u5,  11500.00, false, now() - interval '72 hours'),
  (a8, u3,  12500.00, false, now() - interval '48 hours'),
  (a8, u1,  13200.00, true,  now() - interval '10 hours');

-- ============================================================
-- 9. BIDS — ended auctions
-- ============================================================
INSERT INTO bids (auction_id, bidder_id, bid_amount, is_winning_bid, created_at) VALUES
  (a9,  u3,  120.00,   false, now() - interval '13 days'),
  (a9,  u5,  200.00,   false, now() - interval '12 days'),
  (a9,  u8,  340.00,   false, now() - interval '11 days'),
  (a9,  u1,  500.00,   false, now() - interval '10 days'),
  (a9,  u3,  620.00,   false, now() - interval '9 days'),
  (a9,  u1,  780.00,   true,  now() - interval '3 days' + interval '2 hours'),

  (a10, u1,  8500.00,  false, now() - interval '14 days'),
  (a10, u5,  10000.00, false, now() - interval '13 days'),
  (a10, u1,  12000.00, false, now() - interval '12 days'),
  (a10, u5,  14000.00, false, now() - interval '10 days'),
  (a10, u3,  16000.00, false, now() - interval '8 days'),
  (a10, u3,  18500.00, true,  now() - interval '7 days' + interval '1 hour'),

  (a11, u3,  5500.00,  false, now() - interval '8 days'),
  (a11, u5,  7000.00,  false, now() - interval '7 days'),
  (a11, u3,  9000.00,  false, now() - interval '6 days'),
  (a11, u1,  11000.00, false, now() - interval '5 days'),
  (a11, u3,  13000.00, false, now() - interval '4 days'),
  (a11, u1,  14800.00, true,  now() - interval '1 day' + interval '2 hours'),

  (a12, u3,  900.00,   false, now() - interval '6 days'),
  (a12, u8,  1100.00,  false, now() - interval '5 days'),
  (a12, u3,  1400.00,  false, now() - interval '4 days'),
  (a12, u5,  1800.00,  false, now() - interval '3 days'),
  (a12, u5,  2200.00,  true,  now() - interval '2 days' + interval '3 hours'),

  (a13, u1,  22000.00, false, now() - interval '20 days'),
  (a13, u5,  28000.00, false, now() - interval '18 days'),
  (a13, u1,  35000.00, false, now() - interval '16 days'),
  (a13, u3,  45000.00, false, now() - interval '15 days'),
  (a13, u1,  55000.00, false, now() - interval '14 days'),
  (a13, u3,  68000.00, true,  now() - interval '13 days' + interval '1 hour'),

  (a14, u3,  600.00,   false, now() - interval '5 days'),
  (a14, u6,  800.00,   false, now() - interval '4 days'),
  (a14, u3,  1100.00,  false, now() - interval '3 days'),
  (a14, u8,  1600.00,  false, now() - interval '2 days'),
  (a14, u8,  2800.00,  true,  now() - interval '18 hours'),

  (a15, u5,  350.00,   false, now() - interval '12 days'),
  (a15, u8,  500.00,   false, now() - interval '11 days'),
  (a15, u5,  750.00,   false, now() - interval '10 days'),
  (a15, u6,  1000.00,  false, now() - interval '8 days'),
  (a15, u6,  1650.00,  true,  now() - interval '5 days' + interval '30 minutes');

-- ============================================================
-- 10. CLAIMS
-- ============================================================
INSERT INTO claims (
  id, auction_id, winner_user_id, seller_user_id,
  claim_status, payment_tx_hash, claimed_at, amount_paid,
  claim_tx_hash, nft_token_id, created_at
) VALUES
  (c1, a9,  u1, u4, 'minted',
   '0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5fee0001',
   now() - interval '3 days' + interval '4 hours', 780.00,
   '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4claim001', 1,
   now() - interval '3 days'),
  (c2, a10, u3, u2, 'minted',
   '0xf2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6fee0002',
   now() - interval '7 days' + interval '6 hours', 18500.00,
   '0xd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5claim002', 2,
   now() - interval '7 days'),
  (c3, a12, u5, u9, 'minted',
   '0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7fee0003',
   now() - interval '2 days' + interval '8 hours', 2200.00,
   '0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6claim003', 3,
   now() - interval '2 days'),
  (c4, a13, u3, u4, 'minted',
   '0xf4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8fee0004',
   now() - interval '13 days' + interval '5 hours', 68000.00,
   '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7claim004', 4,
   now() - interval '13 days'),
  (c5, a15, u6, u2, 'minted',
   '0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9fee0005',
   now() - interval '5 days' + interval '10 hours', 1650.00,
   '0xd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8claim005', 5,
   now() - interval '5 days')
ON CONFLICT (auction_id) DO NOTHING;

INSERT INTO claims (auction_id, winner_user_id, seller_user_id, claim_status, created_at) VALUES
  (a11, u1, u7, 'pending', now() - interval '1 day'),
  (a14, u8, u7, 'pending', now() - interval '18 hours')
ON CONFLICT (auction_id) DO NOTHING;

-- ============================================================
-- 11. DELIVERY ASSETS
-- ============================================================
INSERT INTO delivery_assets (claim_id, asset_type, title, content) VALUES
  (c1, 'license',  'Commercial Rights License',   'Full commercial rights to "Chromatic Abyss". License ID: CA-2025-001.'),
  (c1, 'file',     'Source Code Access',          'Private GitHub repo access granted. Repo: github.com/artarchon/chromatic-abyss-src'),
  (c2, 'document', 'Watch Authentication Docs',   'Patek Philippe Certificate of Origin. Serial 4195XXX. Service history enclosed.'),
  (c3, 'file',     'StockX Verification',         'StockX tag #SX-2025-TJ1-0001. Transfer code: STXVERIFY892.'),
  (c4, 'document', 'PSA Registry Transfer',       'PSA registry transfer complete. Cert #34891029 now registered to new owner.'),
  (c5, 'file',     'Digital Artwork Master File', 'IPFS: ipfs://QmSolProt.../solitude-protocol-6k-master.png. Commercial rights active.');

-- ============================================================
-- 12. XP LOGS
-- ============================================================
INSERT INTO xp_logs (user_id, xp_change, reason, related_auction_id, created_at) VALUES
  (u1, 100,  'Won auction: Chromatic Abyss',              a9,  now() - interval '3 days'),
  (u1, 450,  'Won auction: NWC 1990 Cartridge — pending', a11, now() - interval '1 day'),
  (u1, 350,  'High-value bid streak bonus',               NULL, now() - interval '2 days'),
  (u2, 80,   'Auction settled: Chromatic Abyss',          a9,  now() - interval '3 days'),
  (u2, 140,  'Auction settled: Solitude Protocol',        a15, now() - interval '5 days'),
  (u3, 400,  'Won auction: Patek Philippe Nautilus',      a10, now() - interval '7 days'),
  (u3, 1000, 'Won auction: MTG Alpha Black Lotus',        a13, now() - interval '13 days'),
  (u3, 200,  'Competitive bidding streak',                NULL, now() - interval '1 day'),
  (u4, 100,  'Auction fulfilled: Chromatic Abyss',        a9,  now() - interval '3 days'),
  (u4, 1000, 'Auction fulfilled: MTG Black Lotus',        a13, now() - interval '13 days'),
  (u5, 130,  'Won auction: Travis Scott Jordan 1',        a12, now() - interval '2 days'),
  (u6, 175,  'Won auction: Solitude Protocol',            a15, now() - interval '5 days'),
  (u7, 200,  'Auction fulfilled: IBM PC 5150 — pending',  a14, now() - interval '18 hours'),
  (u8, 200,  'Won auction: IBM PC 5150 — pending',        a14, now() - interval '18 hours'),
  (u9, 130,  'Auction fulfilled: Travis Scott Jordan 1',  a12, now() - interval '2 days');

-- ============================================================
-- 13. REPUTATION LOGS
-- ============================================================
INSERT INTO reputation_logs (user_id, reputation_change, reason, related_auction_id, created_at) VALUES
  (u1, 200,  'Successful claim: Chromatic Abyss',        a9,  now() - interval '3 days'),
  (u1, 450,  'Claim initiated: NWC 1990 Cartridge',      a11, now() - interval '22 hours'),
  (u2, 175,  'Auction fulfilled: Solitude Protocol',     a15, now() - interval '5 days'),
  (u2, 80,   'Auction fulfilled: Chromatic Abyss',       a9,  now() - interval '3 days'),
  (u3, 400,  'Successful claim: Patek Philippe',         a10, now() - interval '7 days'),
  (u3, 1000, 'Successful claim: MTG Alpha Black Lotus',  a13, now() - interval '13 days'),
  (u4, 100,  'Auction fulfilled: Chromatic Abyss',       a9,  now() - interval '3 days'),
  (u4, 1000, 'Auction fulfilled: MTG Black Lotus',       a13, now() - interval '13 days'),
  (u5, 130,  'Successful claim: Travis Scott Jordan 1',  a12, now() - interval '2 days'),
  (u6, 175,  'Successful claim: Solitude Protocol',      a15, now() - interval '5 days'),
  (u7, 200,  'Auction fulfilled: IBM PC 5150',           a14, now() - interval '16 hours'),
  (u8, 200,  'Claim pending: IBM PC 5150',               a14, now() - interval '16 hours'),
  (u9, 130,  'Auction fulfilled: Travis Scott Jordan 1', a12, now() - interval '2 days');

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_auction_id, created_at) VALUES
  (u3,  'Outbid!',         'You''ve been outbid on "Rolex Submariner 1969". Current bid: $8,950',            'outbid',        false, a2,  now() - interval '8 hours'),
  (u5,  'Outbid!',         'You''ve been outbid on "Banksy Girl With Balloon". Current bid: $13,200',        'outbid',        false, a8,  now() - interval '10 hours'),
  (u6,  'Outbid!',         'You''ve been outbid on "Supreme x LV Duffel". Current bid: $4,100',             'outbid',        false, a6,  now() - interval '3 hours'),
  (u1,  'Claim Ready',     'You won "Nintendo World Championships 1990" — you have 24h to claim!',          'claim_ready',   false, a11, now() - interval '1 day'),
  (u8,  'Claim Ready',     'You won "IBM Personal Computer 5150" — you have 24h to claim!',                 'claim_ready',   false, a14, now() - interval '18 hours'),
  (u1,  'NFT Minted!',     'Your achievement badge for "Chromatic Abyss" has been minted. Token #1',        'nft_minted',    true,  a9,  now() - interval '3 days' + interval '5 hours'),
  (u3,  'NFT Minted!',     'Your achievement badge for "MTG Alpha Black Lotus" minted. Token #4',           'nft_minted',    true,  a13, now() - interval '13 days' + interval '6 hours'),
  (u5,  'NFT Minted!',     'Your achievement badge for "Travis Scott x AJ1 Low Olive" minted. Token #3',   'nft_minted',    true,  a12, now() - interval '2 days' + interval '9 hours'),
  (u6,  'Auction Won!',    'Congratulations! You won "Solitude Protocol" for $1,650. Claim now.',           'auction_won',   true,  a15, now() - interval '5 days'),
  (u3,  'Auction Won!',    'Congratulations! You won "Patek Philippe Nautilus 5711" for $18,500.',          'auction_won',   true,  a10, now() - interval '7 days'),
  (u3,  'Auction Won!',    'Congratulations! You won "MTG Alpha Black Lotus" for $68,000.',                 'auction_won',   true,  a13, now() - interval '13 days'),
  (u4,  'Listing Trending','Your auction "PSA 10 Charizard" has 61 bids and is the hottest listing!',       'auction_active',true,  a5,  now() - interval '12 hours'),
  (u2,  'Listing Live',    'Your auction "Neon Epoch" is live with active bidding at $2,100',               'auction_active',true,  a3,  now() - interval '6 hours'),
  (u9,  'Sale Complete',   'Your auction "Travis Scott x AJ1 Olive" ended. Winner has claimed and paid.',   'auction_ended', true,  a12, now() - interval '2 days' + interval '10 hours'),
  (u10, 'Welcome!',        'Welcome to Auctra! Complete your profile to start bidding on rare items.',      'welcome',       false, NULL, now() - interval '2 weeks');

-- ============================================================
-- 15. LEADERBOARD SNAPSHOTS
-- ============================================================
INSERT INTO leaderboard_snapshots (user_id, reputation_score, xp, rank_position, snapshot_date) VALUES
  (u1,  5200, 24000, 1,  current_date),
  (u4,  4100, 19500, 2,  current_date),
  (u2,  3800, 17200, 3,  current_date),
  (u7,  2600, 11800, 4,  current_date),
  (u3,  2100, 9800,  5,  current_date),
  (u9,  1650, 7200,  6,  current_date),
  (u5,  1200, 5400,  7,  current_date),
  (u8,  880,  3900,  8,  current_date),
  (u6,  450,  2100,  9,  current_date),
  (u10, 300,  1200,  10, current_date),
  -- Yesterday snapshot (powers rank change deltas in UI)
  (u1,  5000, 23000, 1,  current_date - 1),
  (u4,  4100, 19500, 2,  current_date - 1),
  (u2,  3660, 16500, 3,  current_date - 1),
  (u7,  2600, 11800, 4,  current_date - 1),
  (u3,  1700, 8000,  5,  current_date - 1),
  (u9,  1520, 6800,  6,  current_date - 1),
  (u5,  1070, 4900,  7,  current_date - 1),
  (u8,  680,  3200,  8,  current_date - 1),
  (u6,  275,  1500,  9,  current_date - 1),
  (u10, 300,  1200,  10, current_date - 1);

END $$;
