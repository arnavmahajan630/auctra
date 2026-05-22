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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string; // Need to map to ID or string
    const startingPrice = parseFloat(formData.get('startingPrice') as string);
    const minBidIncrement = parseFloat(formData.get('minBidIncrement') as string);
    const durationHours = parseFloat(formData.get('durationHours') as string);
    const prizeDetails = formData.get('prizeDetails') as string;
    const image = formData.get('image') as File | null;

    if (!title || !description || isNaN(startingPrice) || isNaN(durationHours)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the seller profile ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_verified_seller')
      .eq('privy_user_id', privyUserId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.is_verified_seller) {
      return NextResponse.json({ error: "Must be a verified seller to list an auction" }, { status: 403 });
    }

    // Handle Image Upload
    let imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
    
    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('auction_images') // Requires auction_images bucket to exist and be public
        .upload(fileName, image);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('auction_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    // Insert Auction
    const { data: auction, error: insertError } = await supabase
      .from('auctions')
      .insert({
        seller_id: profile.id,
        title,
        description,
        prize_details: prizeDetails || null,
        image_url: imageUrl,
        starting_price: startingPrice,
        current_price: startingPrice,
        minimum_bid_increment: minBidIncrement || (startingPrice * 0.05),
        xp_reward: Math.floor(startingPrice * 100), // example formula
        auction_status: 'active',
        ends_at: endsAt
      })
      .select()
      .single();

    if (insertError) {
      console.error("Auction Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to create auction" }, { status: 500 });
    }

    return NextResponse.json({ success: true, auction });

  } catch (err: any) {
    console.error('Auction Creation Error:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
