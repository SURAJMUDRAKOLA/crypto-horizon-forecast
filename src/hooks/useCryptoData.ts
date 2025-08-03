
import { useState, useEffect } from 'react';
import { fetchCryptoData, fetchHistoricalData, CryptoApiData, HistoricalData } from '@/services/cryptoApi';

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
  price?: number; // Optional since we're only showing predictions
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
    ADA: "₳",
    DOT: "●",
    LINK: "⬢",
    SOL: "◎"
  };
  return icons[symbol.toUpperCase()] || "●";
};

export const useCryptoData = (selectedCoin: string, timeframe: string = '7D') => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const convertApiToCryptoData = (apiData: CryptoApiData[]): CryptoData[] => {
    return apiData.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume: formatNumber(coin.total_volume),
      marketCap: formatNumber(coin.market_cap),
      icon: getIconForSymbol(coin.symbol),
      image: coin.image
    }));
  };

  const convertHistoricalToChartData = (historical: HistoricalData, timeframe: string): ChartData[] => {
    if (!historical.prices || historical.prices.length === 0) return [];
    
    // Get the latest price as the starting point for predictions
    const latestPrice = historical.prices[historical.prices.length - 1][1];
    const currentTime = Date.now();
    
    // Generate ONLY future predictions based on timeframe
    const chartPoints: ChartData[] = [];
    
    if (timeframe === '1D') {
      // For 1D: Show next 24 hours (hourly predictions)
      for (let i = 1; i <= 24; i++) {
        const futureTime = currentTime + (i * 60 * 60 * 1000); // i hours from now
        const futureDate = new Date(futureTime);
        const timeLabel = futureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Generate realistic hourly prediction
        const hourlyVariation = Math.sin(i * 0.2) * 0.005 + (Math.random() - 0.5) * 0.01;
        const predictedPrice = latestPrice * (1 + hourlyVariation);
        
        chartPoints.push({
          time: timeLabel,
          price: undefined, // No historical price for future
          predicted: Math.round(predictedPrice * 100) / 100
        });
      }
    } else if (timeframe === '7D') {
      // For 7D: Show next 7 days (daily predictions)
      for (let i = 1; i <= 7; i++) {
        const futureTime = currentTime + (i * 24 * 60 * 60 * 1000); // i days from now
        const futureDate = new Date(futureTime);
        const timeLabel = futureDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        
        // Generate realistic daily prediction
        const dailyTrend = Math.sin(i * 0.3) * 0.02;
        const dailyVolatility = (Math.random() - 0.5) * 0.03;
        const predictedPrice = latestPrice * (1 + dailyTrend + dailyVolatility);
        
        chartPoints.push({
          time: timeLabel,
          price: undefined,
          predicted: Math.round(predictedPrice * 100) / 100
        });
      }
    } else if (timeframe === '1M') {
      // For 1M: Show next 30 days
      for (let i = 1; i <= 30; i++) {
        const futureTime = currentTime + (i * 24 * 60 * 60 * 1000);
        const futureDate = new Date(futureTime);
        const timeLabel = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const monthlyTrend = Math.sin(i * 0.1) * 0.05;
        const monthlyVolatility = (Math.random() - 0.5) * 0.04;
        const predictedPrice = latestPrice * (1 + monthlyTrend + monthlyVolatility);
        
        chartPoints.push({
          time: timeLabel,
          price: undefined,
          predicted: Math.round(predictedPrice * 100) / 100
        });
      }
    } else if (timeframe === '3M') {
      // For 3M: Show next 90 days
      for (let i = 1; i <= 90; i++) {
        const futureTime = currentTime + (i * 24 * 60 * 60 * 1000);
        const futureDate = new Date(futureTime);
        const timeLabel = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const quarterlyTrend = Math.sin(i * 0.07) * 0.08;
        const quarterlyVolatility = (Math.random() - 0.5) * 0.05;
        const predictedPrice = latestPrice * (1 + quarterlyTrend + quarterlyVolatility);
        
        chartPoints.push({
          time: timeLabel,
          price: undefined,
          predicted: Math.round(predictedPrice * 100) / 100
        });
      }
    } else if (timeframe === '1Y') {
      // For 1Y: Show next 365 days
      for (let i = 1; i <= 365; i++) {
        const futureTime = currentTime + (i * 24 * 60 * 60 * 1000);
        const futureDate = new Date(futureTime);
        const timeLabel = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const yearlyTrend = Math.sin(i * 0.02) * 0.15;
        const yearlyVolatility = (Math.random() - 0.5) * 0.08;
        const predictedPrice = latestPrice * (1 + yearlyTrend + yearlyVolatility);
        
        chartPoints.push({
          time: timeLabel,
          price: undefined,
          predicted: Math.round(predictedPrice * 100) / 100
        });
      }
    }

    return chartPoints;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apiData, historicalData] = await Promise.all([
          fetchCryptoData(),
          fetchHistoricalData(selectedCoin, timeframe)
        ]);
        
        setCryptoData(convertApiToCryptoData(apiData));
        setChartData(convertHistoricalToChartData(historicalData, timeframe));
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCoin, timeframe]); // Added timeframe dependency

  // Update prices every 2 minutes - minimal API calls for accurate current data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Only update live crypto card prices, not chart predictions
        const apiData = await fetchCryptoData();
        setCryptoData(convertApiToCryptoData(apiData));
      } catch (error) {
        console.error('Error updating crypto data:', error);
        // Don't update state on error to prevent fluctuations with mock data
      }
    }, 120000); // Update every 2 minutes to minimize API calls

    return () => clearInterval(interval);
  }, []);

  return { cryptoData, chartData, loading };
};
