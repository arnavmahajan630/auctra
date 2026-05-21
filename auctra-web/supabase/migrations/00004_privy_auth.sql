-- Alter profiles table for Privy Auth Support
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privy_user_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Allow id to be generated independently of auth.users
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Disable RLS on profiles since Privy now handles our authentication and identity verification
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other tables accessed via server API (using anon key without JWT)
ALTER TABLE public.seller_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets DISABLE ROW LEVEL SECURITY;
