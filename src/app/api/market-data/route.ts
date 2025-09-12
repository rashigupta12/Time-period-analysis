import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.API_KEY_TWELVE_DATA;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' }, 
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=10&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the API returned an error
    if (data.status === 'error') {
      return NextResponse.json(
        { error: data.message || 'API returned an error' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}