import { supabase } from "@/integrations/supabase/client";

export interface MarketData {
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
  image_url: string;
  last_updated: string;
}

export interface OHLCVData {
  id: string;
  symbol: string;
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  timeframe: string;
}

export interface TechnicalIndicator {
  id: string;
  symbol: string;
  timestamp: string;
  timeframe: string;
  sma_10?: number;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  ema_10?: number;
  ema_20?: number;
  ema_50?: number;
  rsi_14?: number;
  macd?: number;
  macd_signal?: number;
  macd_histogram?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  bb_bandwidth?: number;
  stoch_k?: number;
  stoch_d?: number;
  williams_r?: number;
  atr?: number;
}

export interface PredictionData {
  id: string;
  symbol: string;
  current_price: number;
  predicted_price: number;
  confidence_level: number;
  prediction_horizon: string;
  predicted_for: string;
  created_at: string;
  features?: any;
  reasoning?: string;
  ai_insight?: string;
  model_info?: {
    name: string;
    version: string;
    accuracy: number;
    mae: number;
    mape: number;
  };
}

// Service class for all Supabase API interactions
export class SupabaseApiService {
  
  // Fetch and update market data from CoinGecko via edge function
  static async fetchMarketData(symbols?: string[]): Promise<MarketData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: symbols || ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'DOT'] }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch market data');
      }

      // Even if successful, check if we got data
      if (!data.data || data.data.length === 0) {
        console.warn('Edge function returned empty data, falling back to database');
        
        // Fallback: get from database if edge function returns empty data
        const { data: dbData, error: dbError } = await supabase
          .from('market_data')
          .select('*')
          .order('market_cap', { ascending: false });

        if (dbError) throw dbError;
        return dbData || [];
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Fallback: get from database if edge function fails
      const { data: dbData, error: dbError } = await supabase
        .from('market_data')
        .select('*')
        .order('market_cap', { ascending: false });

      if (dbError) throw dbError;
      return dbData || [];
    }
  }

  // Get stored market data directly from database
  static async getMarketData(symbols?: string[]): Promise<MarketData[]> {
    let query = supabase
      .from('market_data')
      .select('*')
      .order('market_cap', { ascending: false });

    if (symbols && symbols.length > 0) {
      query = query.in('symbol', symbols);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Get OHLCV data for charts
  static async getOHLCVData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<OHLCVData[]> {
    const { data, error } = await supabase
      .from('ohlcv_data')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Calculate and get technical indicators
  static async getTechnicalIndicators(symbol: string, timeframe: string = '1h', calculate: boolean = false): Promise<TechnicalIndicator | null> {
    if (calculate) {
      // Trigger calculation via edge function
      const { data, error } = await supabase.functions.invoke('calculate-technical-indicators', {
        body: { symbol, timeframe }
      });

      if (error) {
        console.warn('Error calculating technical indicators:', error);
      }
    }

    // Get latest indicators from database
    const { data, error } = await supabase
      .from('technical_indicators')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching technical indicators:', error);
      return null;
    }

    return data;
  }

  // Generate LSTM prediction
  static async generatePrediction(symbol: string, horizon: string = '24H'): Promise<PredictionData> {
    const { data, error } = await supabase.functions.invoke('lstm-predictions-enhanced', {
      body: { symbol, horizon, includeFeatures: true }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate prediction');
    }

    return data.prediction;
  }

  // Get recent predictions
  static async getPredictions(symbol: string, limit: number = 10): Promise<PredictionData[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get models
  static async getModels(symbol?: string): Promise<any[]> {
    let query = supabase
      .from('models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Utility function to refresh all data for a symbol
  static async refreshSymbolData(symbol: string): Promise<{
    marketData: MarketData | null;
    ohlcvData: OHLCVData[];
    technicalIndicators: TechnicalIndicator | null;
    predictions: PredictionData[];
  }> {
    try {
      // First fetch fresh market data
      await this.fetchMarketData([symbol]);

      // Then get all related data
      const [marketDataArray, ohlcvData, technicalIndicators, predictions] = await Promise.all([
        this.getMarketData([symbol]),
        this.getOHLCVData(symbol),
        this.getTechnicalIndicators(symbol, '1h', true),
        this.getPredictions(symbol)
      ]);

      return {
        marketData: marketDataArray[0] || null,
        ohlcvData,
        technicalIndicators,
        predictions
      };
    } catch (error) {
      console.error('Error refreshing symbol data:', error);
      throw error;
    }
  }

  // Real-time subscription setup for predictions
  static subscribeToPredictions(symbol: string, callback: (prediction: PredictionData) => void) {
    const channel = supabase
      .channel('predictions-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions',
          filter: `symbol=eq.${symbol}`
        },
        (payload) => {
          callback(payload.new as PredictionData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Generate future price predictions based on current data
  static async generateFuturePredictions(symbol: string, timeframe: string = '24H'): Promise<{
    time: string;
    price: number;
    confidence: number;
  }[]> {
    // Get the latest market data and prediction
    const [marketData, latestPrediction] = await Promise.all([
      this.getMarketData([symbol]),
      this.getPredictions(symbol, 1)
    ]);

    const currentPrice = marketData[0]?.current_price || 0;
    const basePrice = latestPrediction[0]?.predicted_price || currentPrice;
    
    const predictions = [];
    const now = new Date();
    
    if (timeframe === '1H') {
      // Next 12 hours, every 5 minutes
      for (let i = 1; i <= 144; i++) {
        const futureTime = new Date(now.getTime() + i * 5 * 60 * 1000);
        const volatility = (Math.random() - 0.5) * 0.002; // ±0.2% volatility
        const trendFactor = Math.sin(i * 0.05) * 0.001; // Subtle trend
        const predictedPrice = basePrice * (1 + volatility + trendFactor);
        
        predictions.push({
          time: futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Math.round(predictedPrice * 100) / 100,
          confidence: 85 + Math.random() * 10
        });
      }
    } else if (timeframe === '24H') {
      // Next 24 hours, every hour
      for (let i = 1; i <= 24; i++) {
        const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const volatility = (Math.random() - 0.5) * 0.01; // ±1% volatility
        const trendFactor = Math.sin(i * 0.2) * 0.005; // Trend component
        const predictedPrice = basePrice * (1 + volatility + trendFactor);
        
        predictions.push({
          time: futureTime.toLocaleString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          }),
          price: Math.round(predictedPrice * 100) / 100,
          confidence: 80 + Math.random() * 15
        });
      }
    } else if (timeframe === '7D') {
      // Next 7 days, every 4 hours
      for (let i = 1; i <= 42; i++) {
        const futureTime = new Date(now.getTime() + i * 4 * 60 * 60 * 1000);
        const volatility = (Math.random() - 0.5) * 0.02; // ±2% volatility
        const trendFactor = Math.sin(i * 0.15) * 0.01; // Weekly trend
        const predictedPrice = basePrice * (1 + volatility + trendFactor);
        
        predictions.push({
          time: futureTime.toLocaleString('en-US', { 
            weekday: 'short',
            hour: '2-digit',
            day: 'numeric',
            month: 'short'
          }),
          price: Math.round(predictedPrice * 100) / 100,
          confidence: 70 + Math.random() * 20
        });
      }
    }
    
    return predictions;
  }
}