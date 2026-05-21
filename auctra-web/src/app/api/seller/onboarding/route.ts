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
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const country = formData.get('country') as string;
    
    // First find the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('privy_user_id', privyUserId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Upsert verification record to handle duplicate submissions smoothly
    const { error: insertError } = await supabase
      .from('seller_verifications')
      .upsert({
        user_id: profile.id,
        submitted_name: fullName,
        submitted_email: email,
        notes: `Phone: ${phone}, Country: ${country}`,
        verification_status: 'verified', // Auto verify for hackathon
        verified_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (insertError) {
      console.error("Verification Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 });
    }

    // Update profile seller status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_verified_seller: true,
        seller_status: 'verified'
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error("Profile Update Error:", updateError);
      return NextResponse.json({ error: "Failed to update profile seller status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Seller Onboarding API Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
