-- Create Avatars Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create Auction Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('auction_images', 'auction_images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access to all buckets for now since we rely on server APIs for auth
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (true);

CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING (true);

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING (true);
