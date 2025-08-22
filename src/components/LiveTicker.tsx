
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  icon: string;
}

const LiveTicker = () => {
  const [tickerData, setTickerData] = useState<TickerData[]>([
    { symbol: "BTC", price: 43250, change: 2.45, icon: "₿" },
    { symbol: "ETH", price: 2680, change: -1.23, icon: "Ξ" },
    { symbol: "ADA", price: 0.45, change: 3.87, icon: "₳" },
    { symbol: "SOL", price: 98.76, change: 5.23, icon: "◎" },
    { symbol: "DOT", price: 7.89, change: -2.14, icon: "●" },
    { symbol: "LINK", price: 14.56, change: 1.78, icon: "⬢" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData(prev => prev.map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() - 0.5) * 0.001),
        change: coin.change + (Math.random() - 0.5) * 0.1
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border-y border-white/10">
      <motion.div
        className="flex space-x-8 py-3"
        animate={{ x: [-100, -2000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...tickerData, ...tickerData, ...tickerData].map((coin, index) => (
          <motion.div
            key={`${coin.symbol}-${index}`}
            className="flex items-center space-x-3 text-sm font-medium whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl">{coin.icon}</span>
            <span className="text-foreground font-bold">{coin.symbol}</span>
            <span className="text-foreground">${coin.price.toLocaleString()}</span>
            <div className={`flex items-center space-x-1 ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {coin.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LiveTicker;
