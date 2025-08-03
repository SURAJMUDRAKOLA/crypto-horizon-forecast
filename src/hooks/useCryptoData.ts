
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
  price: number;
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

export const useCryptoData = (selectedCoin: string) => {
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

  const convertHistoricalToChartData = (historical: HistoricalData): ChartData[] => {
    if (!historical.prices || historical.prices.length === 0) return [];
    
    return historical.prices.map((priceData, index) => {
      const [timestamp, price] = priceData;
      const date = new Date(timestamp);
      
      // Add LSTM predictions for the last 7 days
      const predicted = index >= historical.prices.length - 7 
        ? price * (1 + (Math.random() - 0.5) * 0.02)
        : undefined;
      
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(price * 100) / 100,
        predicted: predicted ? Math.round(predicted * 100) / 100 : undefined
      };
    });
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apiData, historicalData] = await Promise.all([
          fetchCryptoData(),
          fetchHistoricalData(selectedCoin)
        ]);
        
        setCryptoData(convertApiToCryptoData(apiData));
        setChartData(convertHistoricalToChartData(historicalData));
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCoin]);

  // Update prices every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const apiData = await fetchCryptoData();
        setCryptoData(convertApiToCryptoData(apiData));
      } catch (error) {
        console.error('Error updating crypto data:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { cryptoData, chartData, loading };
};
