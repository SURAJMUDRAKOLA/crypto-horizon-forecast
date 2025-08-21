import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Zap, Target } from "lucide-react";
import { useSupabasePredictions } from "@/hooks/useSupabasePredictions";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface PredictionPanelProps {
  selectedCoin: string;
}

const PredictionPanel = ({ selectedCoin }: PredictionPanelProps) => {
  const { predictions, models, loading, error, generatePrediction } = useSupabasePredictions(selectedCoin);
  const { cryptoData } = useCryptoData(selectedCoin, '1D');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const currentCrypto = cryptoData.find(crypto => crypto.symbol === selectedCoin);
  const currentPrice = currentCrypto?.price || 0;
  const activeModel = models[0]; // Get the most recent model

  const handleGeneratePrediction = async (horizon: string) => {
    if (!currentPrice) {
      toast({
        title: "Error",
        description: "Unable to fetch current price data",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Generate mock historical prices for the API
      const historicalPrices = Array.from({ length: 50 }, (_, i) => 
        currentPrice * (1 + (Math.random() - 0.5) * 0.02 * (50 - i))
      );

      await generatePrediction(currentPrice, historicalPrices, horizon);
      
      toast({
        title: "Prediction Generated",
        description: `New ${horizon} prediction created successfully`,
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatTimeframe = (horizon: string) => {
    switch (horizon) {
      case '1H': return '1 Hour';
      case '24H': return '24 Hours';
      case '7D': return '7 Days';
      default: return horizon;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* LSTM Predictions */}
      <Card className="crypto-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            LSTM Predictions
          </CardTitle>
          <div className="flex gap-2">
            {['1H', '24H', '7D'].map((horizon) => (
              <Button
                key={horizon}
                variant="outline"
                size="sm"
                onClick={() => handleGeneratePrediction(horizon)}
                disabled={generating || loading}
                className="flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                {formatTimeframe(horizon)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-center text-muted-foreground">Loading predictions...</div>}
          {error && <div className="text-center text-red-500">Error: {error}</div>}
          
          {predictions.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No predictions yet</p>
              <p className="text-sm">Generate your first AI prediction above</p>
            </div>
          )}

          {predictions.slice(0, 5).map((pred) => {
            const change = ((pred.predicted_price - pred.current_price) / pred.current_price) * 100;
            const isPositive = change >= 0;
            
            return (
              <div key={pred.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatTimeframe(pred.prediction_horizon)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(pred.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${pred.predicted_price.toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {(pred.confidence_level * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Model Performance */}
      {activeModel && (
        <Card className="crypto-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-xl font-bold">{((activeModel.accuracy || 0) * 100).toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">MAE</p>
                <p className="text-xl font-bold">${(activeModel.mae || 0).toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">MAPE</p>
                <p className="text-xl font-bold">{(activeModel.mape || 0).toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>Model Status:</strong> {activeModel.name} v{activeModel.version} - 
                Trained on {(activeModel.training_data_points || 0).toLocaleString()} data points
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionPanel;