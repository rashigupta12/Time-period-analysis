import { NextRequest, NextResponse } from 'next/server';

interface MarketstackEODData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_high: number;
  adj_low: number;
  adj_close: number;
  adj_open: number;
  adj_volume: number;
  split_factor: number;
  dividend: number;
  symbol: string;
  exchange: string;
  date: string;
}

interface MarketstackEODResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MarketstackEODData[];
}

interface TransformedEODResponse {
  meta: {
    symbol: string;
    interval: string;
    exchange: string;
  };
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
  }[];
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = searchParams.get('limit') || '10';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
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

    // Calculate date range for the last 10 trading days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 20); // Get more days to account for weekends/holidays

    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];

    // Build the API URL
    const apiUrl = new URL('https://api.marketstack.com/v2/eod');
    apiUrl.searchParams.set('access_key', API_KEY);
    apiUrl.searchParams.set('symbols', symbol);
    apiUrl.searchParams.set('date_from', dateFrom);
    apiUrl.searchParams.set('date_to', dateTo);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('sort', 'DESC'); // Most recent first

    console.log('Fetching stock data from Marketstack:', apiUrl.toString().replace(API_KEY, '[HIDDEN]'));

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketstack API error:', response.status, errorText);
      
      // Handle common error cases
      if (response.status === 422) {
        return NextResponse.json(
          { error: 'Invalid symbol or symbol not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Marketstack API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: MarketstackEODResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified symbol' },
        { status: 404 }
      );
    }

    // Get exchange from first data point
    const exchange = data.data[0]?.exchange || 'UNKNOWN';

    // Transform the response to match your expected format
    const transformedData: TransformedEODResponse = {
      meta: {
        symbol: symbol,
        interval: '1day',
        exchange: exchange,
      },
      values: data.data.map(item => ({
        datetime: item.date,
        open: item.open.toString(),
        high: item.high.toString(),
        low: item.low.toString(),
        close: item.close.toString(),
      })),
      status: 'ok',
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Stock data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
