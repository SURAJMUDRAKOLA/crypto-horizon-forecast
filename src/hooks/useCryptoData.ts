
import { useState, useEffect } from 'react';
import { SupabaseApiService, MarketData, OHLCVData, TechnicalIndicator } from '@/services/supabaseApi';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  icon: string;
  image?: string;
}

interface ChartData {
  time: string;
  price?: number;
  predicted?: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

const getIconForSymbol = (symbol: string): string => {
  const icons: Record<string, string> = {
    BTC: "₿",
    ETH: "Ξ", 
    BNB: "⬢",
    XRP: "⟁",
    SOL: "◎",
    ADA: "₳",
    DOT: "●",
    LINK: "⬢"
  };
  return icons[symbol.toUpperCase()] || "●";
};

export const useCryptoData = (selectedCoin: string, timeframe: string = '7D') => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertMarketDataToCryptoData = (marketData: MarketData[]): CryptoData[] => {
    return marketData.map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume: formatNumber(coin.total_volume),
      marketCap: formatNumber(coin.market_cap),
      icon: getIconForSymbol(coin.symbol),
      image: coin.image_url
    }));
  };

  const convertOHLCVToChartData = (ohlcvData: OHLCVData[], timeframe: string): ChartData[] => {
    if (!ohlcvData || ohlcvData.length === 0) {
      // Generate synthetic data if no OHLCV data available
      return generateSyntheticChartData(timeframe);
    }

    return ohlcvData.map(item => {
      const date = new Date(item.timestamp);
      let timeLabel: string;

      if (timeframe === '1D') {
        timeLabel = date.toLocaleTimeString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (timeframe === '7D') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '1M') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '3M') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '1Y') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          year: '2-digit' 
        });
      } else {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      }

      return {
        time: timeLabel,
        price: item.close_price,
        predicted: item.close_price // Real price, not predicted
      };
    });
  };

  const generateSyntheticChartData = (timeframe: string): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    let points = 0;
    let interval = 0;

    switch (timeframe) {
      case '1D':
        points = 24;
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case '7D':
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1M':
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '3M':
        points = 90;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1Y':
        points = 12;
        interval = 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
      default:
        points = 7;
        interval = 24 * 60 * 60 * 1000;
    }

    const basePrice = 40000; // Base price for synthetic data
    
    // Generate data starting from past and ending at current time (aligned with live clock)
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * interval);
      let timeLabel: string;

      // Use IST timezone to match the live clock
      if (timeframe === '1D') {
        timeLabel = date.toLocaleTimeString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (timeframe === '7D') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '1M') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '3M') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      } else if (timeframe === '1Y') {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          year: '2-digit' 
        });
      } else {
        timeLabel = date.toLocaleDateString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          month: 'short', 
          day: 'numeric' 
        });
      }

      const volatility = (Math.random() - 0.5) * 0.1; // ±5% volatility
      const trend = Math.sin((i / points) * Math.PI) * 0.05; // Sine wave trend
      const price = basePrice * (1 + volatility + trend);

      data.push({
        time: timeLabel,
        price: price,
        predicted: price
      });
    }

    return data;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get market data (this will fetch fresh data from CoinGecko and ensure BNB is included)
        console.log('Fetching market data for all supported coins including BNB...');
        const marketData = await SupabaseApiService.fetchMarketData(['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK']);
        console.log('Market data received:', marketData.map(coin => coin.symbol));
        setCryptoData(convertMarketDataToCryptoData(marketData));

        // Get OHLCV data for selected coin
        if (selectedCoin) {
          const timeframeMap: Record<string, string> = {
            '1D': '1h',
            '7D': '1h', 
            '1M': '1d',
            '3M': '1d',
            '1Y': '1d'
          };
          
          const dbTimeframe = timeframeMap[timeframe] || '1h';
          const limit = timeframe === '1D' ? 24 : timeframe === '7D' ? 168 : 30;
          
          const ohlcvData = await SupabaseApiService.getOHLCVData(selectedCoin, dbTimeframe, limit);
          setChartData(convertOHLCVToChartData(ohlcvData, timeframe));
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        
        // Fallback to stored data
        try {
          console.log('Trying fallback data fetch...');
          const storedData = await SupabaseApiService.getMarketData(['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK']);
          console.log('Stored data received:', storedData.map(coin => coin.symbol));
          if (storedData.length > 0) {
            setCryptoData(convertMarketDataToCryptoData(storedData));
          }
        } catch (fallbackError) {
          console.error('Fallback data fetch failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCoin, timeframe]);

  // Update market data every 2 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const marketData = await SupabaseApiService.getMarketData(['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK']);
        setCryptoData(convertMarketDataToCryptoData(marketData));
      } catch (error) {
        console.error('Error updating crypto data:', error);
      }
    }, 120000); // Update every 2 minutes

    return () => clearInterval(interval);
  }, []);

  return { cryptoData, chartData, loading, error };
};
