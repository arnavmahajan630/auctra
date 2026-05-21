import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
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
    
    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const privyUserId = verifiedClaims.userId;

    const formData = await req.formData();
    const avatar = formData.get('avatar') as File | null;

    if (!avatar) {
      return NextResponse.json({ error: "No avatar provided" }, { status: 400 });
    }

    let avatarUrl = '';

    const fileExt = avatar.name.split('.').pop();
    const fileName = `${privyUserId}-${Date.now()}.${fileExt}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar);

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
    } else if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      avatarUrl = publicUrlData.publicUrl;
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('privy_user_id', privyUserId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, avatarUrl, profile });

  } catch (err: any) {
    console.error('Avatar API Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
