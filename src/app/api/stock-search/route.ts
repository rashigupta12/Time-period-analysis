import { NextRequest, NextResponse } from 'next/server';

interface MarketstackTicker {
  name: string;
  symbol: string;
  has_intraday: boolean;
  has_eod: boolean;
  stock_exchange: {
    name: string;
    acronym: string;
    mic: string;
    country?: string;
    country_code?: string;
    city?: string;
    website?: string;
  };
}

interface MarketstackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MarketstackTicker[];
}

interface TransformedResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: {
    name: string;
    ticker: string;
    has_intraday: boolean;
    has_eod: boolean;
    stock_exchange: {
      name: string;
      acronym: string;
      mic: string;
    };
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query parameter is required and must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const API_KEY = process.env.MARKETSTACK_API_KEY;
    if (!API_KEY) {
      console.error('MARKETSTACK_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    // CORRECTED: Use the proper Marketstack endpoint for tickers
    const apiUrl = new URL('http://api.marketstack.com/v1/tickers');
    apiUrl.searchParams.set('access_key', API_KEY);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    
    // Marketstack v1 uses 'search' parameter for filtering
    apiUrl.searchParams.set('search', query);

    console.log('Fetching from Marketstack:', apiUrl.toString().replace(API_KEY, '[HIDDEN]'));

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketstack API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Marketstack API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: MarketstackResponse = await response.json();

    // Transform the response
    const transformedData: TransformedResponse = {
      pagination: data.pagination,
      data: data.data.map(ticker => ({
        name: ticker.name,
        ticker: ticker.symbol,
        has_intraday: ticker.has_intraday,
        has_eod: ticker.has_eod,
        stock_exchange: {
          name: ticker.stock_exchange.name,
          acronym: ticker.stock_exchange.acronym,
          mic: ticker.stock_exchange.mic,
        },
      })),
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Stock search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}