import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
  circulating_supply: number;
  max_supply: number;
  image: string;
}

const coinIdMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  XRP: 'ripple',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  LINK: 'chainlink'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK'] } = await req.json().catch(() => ({ symbols: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK'] }));
    
    console.log('Fetching market data for symbols:', symbols);

    // Fetch data from CoinGecko
    const coinIds = symbols.map((symbol: string) => coinIdMap[symbol]).filter(Boolean).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoData[] = await response.json();
    console.log('Fetched data from CoinGecko:', data.length, 'coins');

    // Store data in Supabase
    const marketDataPromises = data.map(async (coin) => {
      const { error } = await supabase
        .from('market_data')
        .upsert({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          ath: coin.ath,
          ath_date: coin.ath_date,
          atl: coin.atl,
          atl_date: coin.atl_date,
          circulating_supply: coin.circulating_supply,
          max_supply: coin.max_supply,
          image_url: coin.image,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'symbol',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error storing market data for', coin.symbol, ':', error);
      }
    });

    await Promise.all(marketDataPromises);

    // Fetch historical OHLCV data for each symbol
    const ohlcvPromises = symbols.map(async (symbol: string) => {
      const coinId = coinIdMap[symbol];
      if (!coinId) return;

      try {
        // Fetch 24h hourly data
        const histResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`
        );

        if (histResponse.ok) {
          const ohlcData = await histResponse.json();
          
          // Store OHLCV data
          const ohlcvPromises = ohlcData.map(async ([timestamp, open, high, low, close]: number[]) => {
            const { error } = await supabase
              .from('ohlcv_data')
              .upsert({
                symbol: symbol,
                timestamp: new Date(timestamp).toISOString(),
                open_price: open,
                high_price: high,
                low_price: low,
                close_price: close,
                volume: 0, // CoinGecko OHLC doesn't include volume
                timeframe: '1h'
              }, {
                onConflict: 'symbol,timestamp,timeframe',
                ignoreDuplicates: true
              });

            if (error) {
              console.error('Error storing OHLCV data:', error);
            }
          });

          await Promise.all(ohlcvPromises);
        }
      } catch (error) {
        console.error('Error fetching OHLCV data for', symbol, ':', error);
      }
    });

    await Promise.all(ohlcvPromises);

    // Return the processed data - always get fresh data from database
    const { data: marketData, error: fetchError } = await supabase
      .from('market_data')
      .select('*')
      .order('market_cap', { ascending: false });

    if (fetchError) {
      console.error('Error fetching stored data:', fetchError);
      throw new Error('Error fetching stored data: ' + fetchError.message);
    }

    console.log('Successfully processed market data for', marketData?.length || 0, 'coins');
    console.log('Market data symbols:', marketData?.map(d => d.symbol).join(', '));

    return new Response(JSON.stringify({
      success: true,
      data: marketData || [],
      message: `Successfully updated market data for ${marketData?.length || 0} cryptocurrencies`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-market-data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});