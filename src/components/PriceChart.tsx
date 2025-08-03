
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  data: Array<{
    time: string;
    price: number;
    predicted?: number;
  }>;
  selectedCoin: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const PriceChart = ({ data, selectedCoin, timeframe, onTimeframeChange }: PriceChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const timeframes = ['1D', '7D', '1M', '3M', '1Y'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg crypto-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{selectedCoin} Price Chart</h3>
          <p className="text-sm text-gray-500">Historical & Predicted Prices</p>
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

      <div className="h-80 chart-container rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f7971e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f7971e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#667eea"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Current Price"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#f7971e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPredicted)"
                strokeDasharray="5 5"
                name="LSTM Prediction"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#667eea"
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                name="Current Price"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f7971e"
                strokeWidth={3}
                strokeDasharray="8 8"
                dot={{ fill: '#f7971e', strokeWidth: 2, r: 4 }}
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
