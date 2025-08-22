
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import LiveTicker from "@/components/LiveTicker";
import ParallaxHero from "@/components/ParallaxHero";
import CoinSelector from "@/components/CoinSelector";
import ModernPriceCard from "@/components/ModernPriceCard";
import PriceChart from "@/components/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import PredictionPanel from "@/components/PredictionPanel";
import LiveClock from "@/components/LiveClock";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Header />
        <motion.div 
          className="flex items-center justify-center h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-lg text-white">Loading cryptocurrency data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      <Header />
      <LiveTicker />
      <ParallaxHero />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Top Section: Coin Selector, Featured Prices, and Live Clock */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="lg:col-span-1">
            <GlassmorphismCard className="p-4">
              <CoinSelector selectedCoin={selectedCoin} onCoinChange={setSelectedCoin} />
            </GlassmorphismCard>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {cryptoData.slice(0, 3).map((coin, index) => (
              <ModernPriceCard key={coin.symbol} {...coin} index={index} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <GlassmorphismCard className="p-4">
              <LiveClock />
            </GlassmorphismCard>
          </div>
        </motion.div>

        {/* Main Chart Section */}
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
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
        </motion.div>

        {/* Predictions and Additional Data */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div>
            <PredictionPanel selectedCoin={selectedCoin} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cryptoData.slice(3, 7).map((coin, index) => (
              <ModernPriceCard key={coin.symbol} {...coin} index={index + 3} />
            ))}
          </div>
        </motion.div>

        {/* Footer Info with Disclaimer */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <GlassmorphismCard className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced LSTM Cryptocurrency Forecasting Platform
            </h3>
            <p className="text-muted-foreground max-w-4xl mx-auto mb-6 leading-relaxed">
              Our machine learning models use Long Short-Term Memory (LSTM) neural networks combined with 
              technical analysis to provide accurate cryptocurrency price predictions. The system analyzes 
              historical price data, trading volumes, and market sentiment to forecast future price movements 
              with high precision.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-blue-400 bg-blue-400/10 rounded-lg p-3">
                <span>📊</span>
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-purple-400 bg-purple-400/10 rounded-lg p-3">
                <span>🤖</span>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-400/10 rounded-lg p-3">
                <span>📈</span>
                <span>Technical Analysis</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-400 bg-orange-400/10 rounded-lg p-3">
                <Shield className="w-4 h-4" />
                <span>Secure Platform</span>
              </div>
            </div>
          </GlassmorphismCard>

          {/* Disclaimer */}
          <GlassmorphismCard className="p-6 border-l-4 border-orange-500">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Disclaimer</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All predictions and forecasts provided by this platform are for educational and informational purposes only. 
                  Cryptocurrency markets are highly volatile and unpredictable. We are not financial advisors and do not 
                  provide investment advice. Never invest more than you can afford to lose. Past performance does not 
                  guarantee future results. We are not responsible for any financial losses incurred from using this platform.
                </p>
              </div>
            </div>
          </GlassmorphismCard>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
