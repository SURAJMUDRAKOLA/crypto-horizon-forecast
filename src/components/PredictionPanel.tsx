
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface PredictionPanelProps {
  currentPrice: number;
  predictions: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
    '1y': number;
  };
  confidence: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
    '1y': number;
  };
  accuracy: {
    rmse: number;
    mae: number;
    mape: number;
  };
}

const PredictionPanel = ({ currentPrice, predictions, confidence, accuracy }: PredictionPanelProps) => {
  const calculateChange = (predicted: number, current: number) => {
    return ((predicted - current) / current) * 100;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* LSTM Predictions */}
      <Card className="crypto-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>LSTM Price Predictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(predictions).map(([timeframe, price]) => {
              const change = calculateChange(price, currentPrice);
              const isPositive = change >= 0;
              const conf = confidence[timeframe as keyof typeof confidence];
              
              return (
                <div key={timeframe} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-600 uppercase">{timeframe}</span>
                    <Badge className={getConfidenceColor(conf)}>
                      {conf}% confidence
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-800">
                      ${price.toLocaleString()}
                    </p>
                    <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Model Accuracy */}
      <Card className="crypto-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Model Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">RMSE</p>
              <p className="text-xl font-bold text-gray-800">{accuracy.rmse}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">MAE</p>
              <p className="text-xl font-bold text-gray-800">{accuracy.mae}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">MAPE</p>
              <p className="text-xl font-bold text-gray-800">{accuracy.mape}%</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Model Status:</strong> High accuracy LSTM model trained on 2+ years of data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionPanel;
