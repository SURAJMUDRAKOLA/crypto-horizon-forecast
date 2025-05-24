
import { useState, useEffect } from 'react';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  icon: string;
}

interface ChartData {
  time: string;
  price: number;
  predicted?: number;
}

// Mock data generator for demonstration
export const useCryptoData = (selectedCoin: string) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const mockCryptoData: Record<string, CryptoData> = {
    BTC: {
      symbol: "BTC",
      name: "Bitcoin",
      price: 42750 + Math.random() * 1000,
      change24h: -2.34 + Math.random() * 5,
      volume: "$28.5B",
      marketCap: "$837.2B",
      icon: "₿"
    },
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      price: 2580 + Math.random() * 200,
      change24h: 1.45 + Math.random() * 3,
      volume: "$15.2B",
      marketCap: "$310.4B",
      icon: "Ξ"
    },
    ADA: {
      symbol: "ADA",
      name: "Cardano",
      price: 0.45 + Math.random() * 0.1,
      change24h: 3.21 + Math.random() * 2,
      volume: "$489M",
      marketCap: "$15.8B",
      icon: "₳"
    },
    DOT: {
      symbol: "DOT",
      name: "Polkadot",
      price: 6.75 + Math.random() * 1,
      change24h: -1.87 + Math.random() * 4,
      volume: "$156M",
      marketCap: "$8.2B",
      icon: "●"
    },
    LINK: {
      symbol: "LINK",
      name: "Chainlink",
      price: 14.25 + Math.random() * 2,
      change24h: 0.95 + Math.random() * 3,
      volume: "$432M",
      marketCap: "$8.1B",
      icon: "⬢"
    },
    SOL: {
      symbol: "SOL",
      name: "Solana",
      price: 95.30 + Math.random() * 10,
      change24h: 5.67 + Math.random() * 2,
      volume: "$2.1B",
      marketCap: "$42.3B",
      icon: "◎"
    }
  };

  const generateChartData = (coin: string): ChartData[] => {
    const basePrice = mockCryptoData[coin]?.price || 40000;
    const data: ChartData[] = [];
    
    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = Math.sin(i * 0.1) * 0.1 + (Math.random() - 0.5) * 0.05;
      const price = basePrice * (1 + variation);
      
      data.push({
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(price * 100) / 100,
        predicted: i < 7 ? Math.round(price * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100 : undefined
      });
    }
    
    return data;
  };

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setCryptoData(Object.values(mockCryptoData));
      setChartData(generateChartData(selectedCoin));
      setLoading(false);
    }, 1000);
  }, [selectedCoin]);

  // Update prices every 10 seconds to simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => 
        prev.map(coin => ({
          ...coin,
          price: coin.price * (1 + (Math.random() - 0.5) * 0.001),
          change24h: coin.change24h + (Math.random() - 0.5) * 0.1
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return { cryptoData, chartData, loading };
};
