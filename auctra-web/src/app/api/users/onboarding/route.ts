import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase'; // Using the existing supabase client
import { PrivyClient } from '@privy-io/server-auth';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const privyAppSecret = process.env.PRIVY_APP_SECRET || '';

const privy = new PrivyClient(privyAppId, privyAppSecret);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the Privy Token
    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const privyUserId = verifiedClaims.userId;

    const formData = await req.formData();
    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;
    const avatar = formData.get('avatar') as File | null;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    let avatarUrl = '';

    // Handle avatar upload if provided
    if (avatar) {
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${privyUserId}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatar);

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Continue anyway or return error. Let's continue without avatar for resilience.
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = publicUrlData.publicUrl;
      }
    }

    // Insert or update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        privy_user_id: privyUserId,
        username,
        bio,
        avatar_url: avatarUrl || null,
        onboarding_complete: true,
        display_name: username // default display name to username
      }, { onConflict: 'privy_user_id' })
      .select()
      .single();

    if (error) {
      console.error('Profile DB Error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Get full user object from Privy to extract the wallet address
    const privyUser = await privy.getUser(privyUserId);
    const walletAddress = privyUser.wallet?.address || privyUser.linkedAccounts?.find(a => a.type === 'wallet')?.address;

    if (walletAddress) {
      await supabase.from('user_wallets').upsert({
        user_id: profile.id,
        wallet_address: walletAddress.toLowerCase(),
        wallet_type: 'evm',
        is_primary: true
      }, { onConflict: 'wallet_address' });
    }

    return NextResponse.json({ success: true, profile });

  } catch (err: any) {
    console.error('Onboarding API Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
