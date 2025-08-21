import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Prediction = Tables<'predictions'>;
type Model = Tables<'models'>;

export const useSupabasePredictions = (selectedCoin: string) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent predictions
  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('symbol', selectedCoin)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPredictions(data || []);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    }
  };

  // Fetch models
  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('symbol', selectedCoin)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    }
  };

  // Generate new prediction
  const generatePrediction = async (currentPrice: number, historicalPrices: number[], horizon: string = '1H') => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('lstm-predictions', {
        body: {
          symbol: selectedCoin,
          currentPrice,
          historicalPrices,
          horizon
        }
      });

      if (response.error) throw response.error;

      // Refresh predictions after generating new one
      await fetchPredictions();
      
      return response.data;
    } catch (err) {
      console.error('Error generating prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate prediction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchPredictions(),
        fetchModels()
      ]);
      
      setLoading(false);
    };

    if (selectedCoin) {
      loadData();
    }
  }, [selectedCoin]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('predictions-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions',
          filter: `symbol=eq.${selectedCoin}`
        },
        (payload) => {
          setPredictions(prev => [payload.new as Prediction, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCoin]);

  return {
    predictions,
    models,
    loading,
    error,
    generatePrediction,
    refetch: () => {
      fetchPredictions();
      fetchModels();
    }
  };
};