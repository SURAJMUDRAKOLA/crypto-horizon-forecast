import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://tflmntmxnuahlzobwwzh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbG1udG14bnVhaGx6b2J3d3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTA5MTQsImV4cCI6MjA3MTM2NjkxNH0.5PU2j4kOcKaq4W9FDdXlT5I2UkpwpsLIomQ0YeDWgaI";

const supabase = createClient(supabaseUrl, supabaseKey);

// Python LSTM Backend URL - Update this with your deployed backend URL
const LSTM_BACKEND_URL = Deno.env.get('LSTM_BACKEND_URL') || 'http://localhost:8000';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, currentPrice, historicalPrices, horizon = '1H' } = await req.json();
    
    console.log(`Generating real LSTM prediction for ${symbol} with horizon ${horizon}`);
    
    // Fetch historical data from Supabase for better prediction context
    const { data: ohlcvData, error: ohlcvError } = await supabase
      .from('ohlcv_data')
      .select('close_price')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (ohlcvError) {
      console.warn(`Could not fetch OHLCV data: ${ohlcvError.message}`);
    }
    
    // Prepare historical prices array - use OHLCV data if available, otherwise use provided data
    let fullHistoricalPrices = historicalPrices;
    if (ohlcvData && ohlcvData.length > 0) {
      const ohlcvPrices = ohlcvData.map(d => parseFloat(d.close_price)).reverse();
      fullHistoricalPrices = [...ohlcvPrices, ...historicalPrices].slice(-100); // Keep last 100 data points
    }
    
    // Call Python LSTM Backend
    console.log(`Calling LSTM backend at ${LSTM_BACKEND_URL}/predict`);
    
    const predictionPayload = {
      symbol: symbol.toUpperCase(),
      current_price: currentPrice,
      historical_prices: fullHistoricalPrices,
      horizon: horizon
    };
    
    const backendResponse = await fetch(`${LSTM_BACKEND_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionPayload),
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error ${backendResponse.status}: ${errorText}`);
      throw new Error(`LSTM backend error: ${backendResponse.status} - ${errorText}`);
    }
    
    const lstmResult = await backendResponse.json();
    console.log(`LSTM prediction result:`, lstmResult);
    
    // The Python backend already stores the prediction in Supabase
    // We just need to fetch the latest prediction for this symbol to get the database record
    const { data: latestPrediction, error: predictionError } = await supabase
      .from('predictions')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (predictionError) {
      console.warn(`Could not fetch stored prediction: ${predictionError.message}`);
    }
    
    console.log(`Real LSTM prediction for ${symbol}: $${lstmResult.predicted_price} (${(lstmResult.confidence_level * 100).toFixed(1)}% confidence)`);
    
    return new Response(JSON.stringify({
      success: true,
      prediction: latestPrediction || {
        symbol,
        current_price: currentPrice,
        predicted_price: lstmResult.predicted_price,
        confidence_level: lstmResult.confidence_level,
        prediction_horizon: horizon,
        features: lstmResult.features
      },
      model_info: lstmResult.model_info,
      reasoning: lstmResult.reasoning,
      metrics: {
        rmse: lstmResult.rmse,
        mae: lstmResult.mae,
        mape: lstmResult.mape
      },
      features: lstmResult.features
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in LSTM predictions:', error);
    
    // Fallback: return error without fake prediction
    return new Response(JSON.stringify({ 
      error: `Real LSTM prediction failed: ${error.message}. Please ensure the Python backend is running at ${LSTM_BACKEND_URL}`,
      success: false,
      backend_url: LSTM_BACKEND_URL
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});