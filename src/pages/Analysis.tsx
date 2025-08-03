import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Brain, Activity, AlertTriangle } from "lucide-react";

const Analysis = () => {
  const [selectedModel, setSelectedModel] = useState("bitcoin");
  const [timeframe, setTimeframe] = useState("7d");

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

  // Mock recent predictions vs actual
  const predictionData = [
    { time: '00:00', actual: 42750, predicted: 42680, confidence: 92 },
    { time: '04:00', actual: 42890, predicted: 42920, confidence: 89 },
    { time: '08:00', actual: 43200, predicted: 43150, confidence: 94 },
    { time: '12:00', actual: 43050, predicted: 43100, confidence: 91 },
    { time: '16:00', actual: 42980, predicted: 42950, confidence: 88 },
    { time: '20:00', actual: 43150, predicted: 43180, confidence: 93 },
  ];

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
    }
  };

  const currentMetrics = modelMetrics[selectedModel as keyof typeof modelMetrics];

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

                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    Generate Detailed Report
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