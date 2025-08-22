import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import PriceChart from "@/components/PriceChart";
import CandlestickChart from "@/components/CandlestickChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import PredictionPanel from "@/components/PredictionPanel";
import ModernPriceCard from "@/components/ModernPriceCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Loader2 } from "lucide-react";

const CoinDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("7D");
  const { cryptoData, chartData, loading } = useCryptoData(symbol || "BTC", timeframe);

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

  // Mock candlestick data
  const candlestickData = chartData.map((item, index) => ({
    time: item.time,
    open: (item.predicted || 40000) * (0.98 + Math.random() * 0.04),
    high: (item.predicted || 40000) * (1.01 + Math.random() * 0.03),
    low: (item.predicted || 40000) * (0.96 + Math.random() * 0.02),
    close: item.predicted || 40000,
    volume: Math.floor(Math.random() * 1000000) + 500000,
    predicted: item.predicted,
    confidence: 85 + Math.random() * 10
  }));

  const currentCoin = cryptoData.find(coin => coin.symbol === symbol) || cryptoData[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
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
            <p className="text-lg text-foreground">Loading {symbol} data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Back Button and Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Market Overview
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {currentCoin.name} ({symbol}) Analysis
            </h1>
            <p className="text-muted-foreground">Comprehensive AI-powered cryptocurrency analysis</p>
          </div>
          
          <div className="w-40"> {/* Spacer for centering */}</div>
        </motion.div>

        {/* Current Coin Price Card */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-full max-w-md">
            <ModernPriceCard {...currentCoin} index={0} />
          </div>
        </motion.div>

        {/* Analysis Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Tabs defaultValue="predictions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
              <TabsTrigger value="candlestick">Advanced Chart</TabsTrigger>
              <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
              <TabsTrigger value="ai">AI Forecasts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictions" className="space-y-6">
              <PriceChart 
                data={chartData} 
                selectedCoin={symbol || "BTC"} 
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </TabsContent>
            
            <TabsContent value="candlestick" className="space-y-6">
              <CandlestickChart
                data={candlestickData}
                selectedCoin={symbol || "BTC"}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TechnicalIndicators {...technicalData} />
                <div className="grid grid-cols-1 gap-4">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">Market Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap Rank</span>
                        <span className="font-semibold">#{currentCoin.symbol === 'BTC' ? '1' : currentCoin.symbol === 'ETH' ? '2' : '3'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">24h Volume</span>
                        <span className="font-semibold">${currentCoin.volume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="font-semibold">${currentCoin.marketCap}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Circulating Supply</span>
                        <span className="font-semibold">{currentCoin.symbol === 'BTC' ? '19.7M' : currentCoin.symbol === 'ETH' ? '120.3M' : '45.4B'} {symbol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-6">
              <PredictionPanel selectedCoin={symbol || "BTC"} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default CoinDetails;