
import { useState } from "react";
import Header from "@/components/Header";
import CoinSelector from "@/components/CoinSelector";
import PriceCard from "@/components/PriceCard";
import PriceChart from "@/components/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import PredictionPanel from "@/components/PredictionPanel";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [timeframe, setTimeframe] = useState("7D");
  const { cryptoData, chartData, loading } = useCryptoData(selectedCoin, timeframe);

  // Mock technical indicators data
  const technicalData = {
    rsi: 65.4,
    macd: {
      macd: 0.0234,
      signal: 0.0189,
      histogram: 0.0045
    },
    bollingerBands: {
      upper: 44200,
      middle: 42800,
      lower: 41400,
      current: 43150
    }
  };

  // Mock prediction data
  const predictionData = {
    currentPrice: cryptoData.find(coin => coin.symbol === selectedCoin)?.price || 42750,
    predictions: {
      '1h': 43200,
      '24h': 44500,
      '7d': 46800,
      '30d': 48200
    },
    confidence: {
      '1h': 92,
      '24h': 87,
      '7d': 74,
      '30d': 68
    },
    accuracy: {
      rmse: 145.7,
      mae: 98.3,
      mape: 2.4
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading cryptocurrency data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Section: Coin Selector and Featured Prices */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CoinSelector selectedCoin={selectedCoin} onCoinChange={setSelectedCoin} />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {cryptoData.slice(0, 3).map((coin) => (
              <PriceCard key={coin.symbol} {...coin} />
            ))}
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PriceChart 
              data={chartData} 
              selectedCoin={selectedCoin} 
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </div>
          <div className="xl:col-span-1">
            <TechnicalIndicators {...technicalData} />
          </div>
        </div>

        {/* Predictions and Additional Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <PredictionPanel {...predictionData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cryptoData.slice(3, 7).map((coin) => (
              <PriceCard key={coin.symbol} {...coin} />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-xl p-6 shadow-lg crypto-glow text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Advanced LSTM Cryptocurrency Forecasting Platform
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our machine learning models use Long Short-Term Memory (LSTM) neural networks combined with 
            technical analysis to provide accurate cryptocurrency price predictions. The system analyzes 
            historical price data, trading volumes, and market sentiment to forecast future price movements 
            with high precision.
          </p>
          <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-500">
            <span>📊 Real-time Data</span>
            <span>🤖 AI-Powered Predictions</span>
            <span>📈 Technical Analysis</span>
            <span>🔒 Secure Platform</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
