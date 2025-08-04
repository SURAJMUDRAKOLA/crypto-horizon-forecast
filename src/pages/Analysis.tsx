import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Brain, Activity, AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Analysis = () => {
  const [selectedModel, setSelectedModel] = useState("bitcoin");
  const [timeframe, setTimeframe] = useState("7d");
  const { toast } = useToast();

  // Mock prediction accuracy data over time
  const accuracyData = [
    { date: 'Jan', accuracy: 89.2, loss: 0.045 },
    { date: 'Feb', accuracy: 91.5, loss: 0.038 },
    { date: 'Mar', accuracy: 93.1, loss: 0.032 },
    { date: 'Apr', accuracy: 94.2, loss: 0.028 },
    { date: 'May', accuracy: 94.8, loss: 0.025 },
    { date: 'Jun', accuracy: 95.1, loss: 0.023 },
    { date: 'Jul', accuracy: 94.9, loss: 0.024 },
    { date: 'Aug', accuracy: 95.3, loss: 0.022 }
  ];

  // Dynamic prediction data based on selected model
  const getPredictionData = (model: string) => {
    const baseData = {
      bitcoin: [
        { time: '00:00', actual: 115200, predicted: 115150, confidence: 92 },
        { time: '04:00', actual: 115400, predicted: 115380, confidence: 89 },
        { time: '08:00', actual: 115100, predicted: 115120, confidence: 94 },
        { time: '12:00', actual: 115300, predicted: 115290, confidence: 91 },
        { time: '16:00', actual: 115180, predicted: 115200, confidence: 88 },
        { time: '20:00', actual: 115250, predicted: 115240, confidence: 93 },
      ],
      ethereum: [
        { time: '00:00', actual: 3680, predicted: 3675, confidence: 91 },
        { time: '04:00', actual: 3690, predicted: 3695, confidence: 88 },
        { time: '08:00', actual: 3670, predicted: 3672, confidence: 93 },
        { time: '12:00', actual: 3685, predicted: 3680, confidence: 90 },
        { time: '16:00', actual: 3682, predicted: 3685, confidence: 87 },
        { time: '20:00', actual: 3688, predicted: 3690, confidence: 92 },
      ],
      cardano: [
        { time: '00:00', actual: 0.751, predicted: 0.750, confidence: 89 },
        { time: '04:00', actual: 0.753, predicted: 0.754, confidence: 86 },
        { time: '08:00', actual: 0.749, predicted: 0.750, confidence: 91 },
        { time: '12:00', actual: 0.752, predicted: 0.751, confidence: 88 },
        { time: '16:00', actual: 0.750, predicted: 0.752, confidence: 85 },
        { time: '20:00', actual: 0.751, predicted: 0.751, confidence: 90 },
      ],
      polkadot: [
        { time: '00:00', actual: 3.72, predicted: 3.71, confidence: 87 },
        { time: '04:00', actual: 3.74, predicted: 3.75, confidence: 84 },
        { time: '08:00', actual: 3.70, predicted: 3.71, confidence: 89 },
        { time: '12:00', actual: 3.73, predicted: 3.72, confidence: 86 },
        { time: '16:00', actual: 3.71, predicted: 3.73, confidence: 83 },
        { time: '20:00', actual: 3.72, predicted: 3.72, confidence: 88 },
      ],
      chainlink: [
        { time: '00:00', actual: 16.97, predicted: 16.95, confidence: 90 },
        { time: '04:00', actual: 17.01, predicted: 17.02, confidence: 87 },
        { time: '08:00', actual: 16.94, predicted: 16.96, confidence: 92 },
        { time: '12:00', actual: 16.99, predicted: 16.98, confidence: 89 },
        { time: '16:00', actual: 16.96, predicted: 16.98, confidence: 86 },
        { time: '20:00', actual: 16.98, predicted: 16.97, confidence: 91 },
      ],
      solana: [
        { time: '00:00', actual: 167.5, predicted: 167.2, confidence: 93 },
        { time: '04:00', actual: 167.8, predicted: 167.9, confidence: 90 },
        { time: '08:00', actual: 167.3, predicted: 167.4, confidence: 95 },
        { time: '12:00', actual: 167.6, predicted: 167.5, confidence: 92 },
        { time: '16:00', actual: 167.4, predicted: 167.6, confidence: 89 },
        { time: '20:00', actual: 167.5, predicted: 167.5, confidence: 94 },
      ]
    };
    return baseData[model as keyof typeof baseData] || baseData.bitcoin;
  };

  const predictionData = getPredictionData(selectedModel);

  const modelMetrics = {
    bitcoin: {
      name: "Bitcoin LSTM",
      accuracy: 95.3,
      rmse: 145.7,
      mae: 98.3,
      mape: 2.4,
      sharpe: 1.8,
      maxDrawdown: -5.2,
      totalPredictions: 15420,
      correctPredictions: 14698
    },
    ethereum: {
      name: "Ethereum LSTM", 
      accuracy: 91.8,
      rmse: 12.3,
      mae: 8.9,
      mape: 3.1,
      sharpe: 1.6,
      maxDrawdown: -7.1,
      totalPredictions: 12350,
      correctPredictions: 11339
    },
    cardano: {
      name: "Cardano LSTM",
      accuracy: 89.2,
      rmse: 0.025,
      mae: 0.018,
      mape: 2.8,
      sharpe: 1.4,
      maxDrawdown: -8.3,
      totalPredictions: 11280,
      correctPredictions: 10064
    },
    polkadot: {
      name: "Polkadot LSTM",
      accuracy: 87.5,
      rmse: 0.15,
      mae: 0.11,
      mape: 3.5,
      sharpe: 1.3,
      maxDrawdown: -9.1,
      totalPredictions: 9850,
      correctPredictions: 8619
    },
    chainlink: {
      name: "Chainlink LSTM",
      accuracy: 88.9,
      rmse: 0.42,
      mae: 0.31,
      mape: 3.2,
      sharpe: 1.5,
      maxDrawdown: -7.8,
      totalPredictions: 10750,
      correctPredictions: 9557
    },
    solana: {
      name: "Solana LSTM",
      accuracy: 92.4,
      rmse: 3.8,
      mae: 2.9,
      mape: 2.7,
      sharpe: 1.7,
      maxDrawdown: -6.4,
      totalPredictions: 13200,
      correctPredictions: 12197
    }
  };

  const currentMetrics = modelMetrics[selectedModel as keyof typeof modelMetrics];

  const generateDetailedReport = () => {
    const report = `
# AI Model Analysis Report - ${currentMetrics.name}
Generated on: ${new Date().toLocaleDateString()}

## Model Performance Summary
- Accuracy: ${currentMetrics.accuracy}%
- RMSE: ${currentMetrics.rmse}
- MAE: ${currentMetrics.mae}
- MAPE: ${currentMetrics.mape}%
- Sharpe Ratio: ${currentMetrics.sharpe}
- Max Drawdown: ${currentMetrics.maxDrawdown}%

## Prediction Statistics
- Total Predictions: ${currentMetrics.totalPredictions.toLocaleString()}
- Correct Predictions: ${currentMetrics.correctPredictions.toLocaleString()}
- Success Rate: ${((currentMetrics.correctPredictions / currentMetrics.totalPredictions) * 100).toFixed(2)}%

## Model Configuration
- LSTM Layers: 3 layers
- Hidden Units: 128 units
- Sequence Length: 60 timesteps
- Dropout Rate: 0.2

## Recent Performance Insights
- High accuracy period achieved during stable market conditions
- LSTM layers showing improved pattern recognition
- Increased prediction uncertainty during high volatility periods

## Recommendations
- Continue monitoring model performance during volatile periods
- Consider retraining if accuracy drops below 85%
- Implement additional technical indicators for enhanced predictions
    `;

    return report.trim();
  };

  const downloadReport = () => {
    const report = generateDetailedReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMetrics.name.replace(' ', '_')}_Analysis_Report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Detailed analysis report has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI Model Analysis
          </h1>
          <p className="text-gray-600">
            Deep dive into prediction performance and model behavior
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bitcoin">Bitcoin LSTM</SelectItem>
              <SelectItem value="ethereum">Ethereum LSTM</SelectItem>
              <SelectItem value="cardano">Cardano LSTM</SelectItem>
              <SelectItem value="polkadot">Polkadot LSTM</SelectItem>
              <SelectItem value="chainlink">Chainlink LSTM</SelectItem>
              <SelectItem value="solana">Solana LSTM</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="crypto-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-green-600">{currentMetrics.accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crypto-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">RMSE</p>
                  <p className="text-2xl font-bold text-blue-600">{currentMetrics.rmse}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crypto-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-purple-600">{currentMetrics.sharpe}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crypto-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Max Drawdown</p>
                  <p className="text-2xl font-bold text-orange-600">{currentMetrics.maxDrawdown}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="crypto-glow">
            <CardHeader>
              <CardTitle>Model Accuracy Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={['dataMin - 1', 'dataMax + 1']} />
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
                      dataKey="accuracy"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-glow">
            <CardHeader>
              <CardTitle>Predictions vs Actual (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
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
                      dataKey="actual"
                      stroke="#667eea"
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                      name="Actual Price"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#f7971e"
                      strokeWidth={3}
                      strokeDasharray="8 8"
                      dot={{ fill: '#f7971e', strokeWidth: 2, r: 4 }}
                      name="Predicted Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="crypto-glow">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mean Absolute Error</p>
                    <p className="text-lg font-bold text-gray-800">{currentMetrics.mae}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">MAPE</p>
                    <p className="text-lg font-bold text-gray-800">{currentMetrics.mape}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Predictions</p>
                    <p className="text-lg font-bold text-gray-800">{currentMetrics.totalPredictions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correct Predictions</p>
                    <p className="text-lg font-bold text-green-600">{currentMetrics.correctPredictions.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Model Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">LSTM Layers</span>
                      <Badge variant="outline">3 layers</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hidden Units</span>
                      <Badge variant="outline">128 units</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sequence Length</span>
                      <Badge variant="outline">60 timesteps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dropout Rate</span>
                      <Badge variant="outline">0.2</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-glow">
            <CardHeader>
              <CardTitle>Recent Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">High Accuracy Period</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Model achieved 97.2% accuracy in the last 48 hours during stable market conditions.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Model Learning</h4>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    LSTM layers showing improved pattern recognition for volatile market periods.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">Market Volatility</h4>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Increased prediction uncertainty detected during high volatility periods.
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Report Generated",
                        description: "Detailed analysis report has been generated successfully.",
                      });
                    }}
                  >
                    Generate Detailed Report
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={downloadReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analysis;