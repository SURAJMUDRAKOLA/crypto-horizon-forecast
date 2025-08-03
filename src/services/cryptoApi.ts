const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoApiData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  price_change_24h: number;
  image: string;
}

export interface HistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const coinIdMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  DOT: 'polkadot',
  LINK: 'chainlink',
  SOL: 'solana'
};

export const fetchCryptoData = async (coins: string[] = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'SOL']): Promise<CryptoApiData[]> => {
  try {
    const coinIds = coins.map(symbol => coinIdMap[symbol]).filter(Boolean).join(',');
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    // Return mock data as fallback
    return getMockCryptoData();
  }
};

export const fetchHistoricalData = async (coinSymbol: string, timeframe: string = '7D'): Promise<HistoricalData> => {
  try {
    const coinId = coinIdMap[coinSymbol];
    if (!coinId) throw new Error('Coin not supported');
    
    // Convert timeframe to days
    const daysMap: Record<string, number> = {
      '1D': 1,
      '7D': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };
    
    const days = daysMap[timeframe] || 7;
    const interval = days === 1 ? 'hourly' : days <= 7 ? 'hourly' : days <= 30 ? 'daily' : 'daily';
    
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock data as fallback
    return getMockHistoricalData(coinSymbol, timeframe);
  }
};

// Fallback mock data
const getMockCryptoData = (): CryptoApiData[] => [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 42750 + Math.random() * 1000,
    price_change_percentage_24h: -2.34 + Math.random() * 5,
    total_volume: 28500000000,
    market_cap: 837200000000,
    price_change_24h: -1000 + Math.random() * 2000,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 2580 + Math.random() * 200,
    price_change_percentage_24h: 1.45 + Math.random() * 3,
    total_volume: 15200000000,
    market_cap: 310400000000,
    price_change_24h: 37 + Math.random() * 50,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  }
];

const getMockHistoricalData = (coinSymbol: string, timeframe: string): HistoricalData => {
  const prices: [number, number][] = [];
  const basePrice = coinSymbol === 'BTC' ? 42000 : coinSymbol === 'ETH' ? 2500 : 1;
  
  // Generate different amounts of data based on timeframe
  const daysMap: Record<string, number> = {
    '1D': 1,
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365
  };
  
  const days = daysMap[timeframe] || 7;
  const pointsPerDay = timeframe === '1D' ? 24 : 1; // Hourly for 1D, daily for others
  const totalPoints = days * pointsPerDay;
  
  for (let i = 0; i < totalPoints; i++) {
    const hoursBack = timeframe === '1D' ? (totalPoints - i) : (totalPoints - i) * 24;
    const timestamp = Date.now() - hoursBack * 60 * 60 * 1000;
    const variation = Math.sin(i * 0.1) * 0.1 + (Math.random() - 0.5) * 0.05;
    const price = basePrice * (1 + variation);
    prices.push([timestamp, price]);
  }
  
  return {
    prices,
    market_caps: prices.map(([timestamp, price]) => [timestamp, price * 19700000]),
    total_volumes: prices.map(([timestamp, price]) => [timestamp, price * 500000])
  };
};