
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SupabaseApiService } from '@/services/supabaseApi';
import { useSupabasePredictions } from '@/hooks/useSupabasePredictions';

interface PriceChartProps {
  data: Array<{
    time: string;
    price?: number;
    predicted?: number;
  }>;
  selectedCoin: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const PriceChart = ({ data, selectedCoin, timeframe, onTimeframeChange }: PriceChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [combinedData, setCombinedData] = useState(data);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const { predictions } = useSupabasePredictions(selectedCoin);

  const timeframes = ['1H', '1D', '7D', '1M', '3M', '1Y'];

  // Fetch real-time market data and future predictions
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        // Get current market data
        const marketData = await SupabaseApiService.getMarketData([selectedCoin]);
        const currentPrice = marketData[0]?.current_price || 0;
        
        // Generate future predictions based on timeframe
        const futurePredictions = await SupabaseApiService.generateFuturePredictions(selectedCoin, timeframe);
        
        // Combine historical data with current price point (if not already present)
        const now = new Date();
        const lastHistoricalTime = data[data.length - 1]?.time;
        const currentDataPoint = {
          time: now.toLocaleTimeString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            hour: '2-digit', 
            minute: '2-digit',
            ...(timeframe !== '1H' && { day: 'numeric', month: 'short' })
          }),
          price: currentPrice,
          predicted: undefined // Current point has actual price, not prediction
        };

        // Only add current point if it's different from last historical point
        const historicalWithCurrent = lastHistoricalTime !== currentDataPoint.time 
          ? [...data, currentDataPoint] 
          : data;

        // Prepare future prediction data (only prediction values, no actual prices)
        const futureData = futurePredictions.slice(0, 20).map(pred => ({
          time: pred.time,
          price: undefined, // No actual price for future
          predicted: pred.price,
          confidence: pred.confidence
        }));

        // Combine all data: historical + current + future
        const combined = [...historicalWithCurrent, ...futureData];
        setCombinedData(combined);
        setRealTimeData(futureData);
        
      } catch (error) {
        console.error('Error fetching real-time data:', error);
        setCombinedData(data);
      }
    };

    fetchRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [selectedCoin, timeframe, data, predictions]);

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg crypto-glow border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{selectedCoin} Real-Time & LSTM Predictions</h3>
          <p className="text-sm text-muted-foreground">Live Price Data with AI-Powered Forecasts</p>
          {realTimeData.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ● Live • {realTimeData.length} future predictions loaded
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(tf)}
              className="text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button
          variant={chartType === 'area' ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType('area')}
        >
          Area Chart
        </Button>
        <Button
          variant={chartType === 'line' ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType('line')}
        >
          Line Chart
        </Button>
      </div>

      <div className="h-80 chart-container rounded-lg p-4 bg-card">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={combinedData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              {/* Current/Historical Price Area */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Current Price"
                connectNulls={false}
              />
              {/* LSTM Predictions Area */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0.5}
                fill="url(#colorPredicted)"
                name="LSTM Prediction"
              />
            </AreaChart>
          ) : (
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              {/* Current/Historical Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                name="Current Price"
                connectNulls={false}
              />
              {/* LSTM Predictions Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                name="LSTM Prediction"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
