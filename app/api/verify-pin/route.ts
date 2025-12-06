import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { driverName, pin } = await request.json();

    if (!driverName || !pin) {
      return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    // Use direct fetch to Supabase REST API
    const response = await fetch(
      `${supabaseUrl}/rest/v1/drivers?name=eq.${encodeURIComponent(driverName)}&select=pin`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase fetch error:', response.status, errorText);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    const data = await response.json();
    console.log('Supabase response:', data);

    const correctPin = data?.[0]?.pin;

    if (correctPin && correctPin === pin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
