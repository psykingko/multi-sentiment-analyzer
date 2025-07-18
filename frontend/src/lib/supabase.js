import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations for analysis history
export const analysisHistory = {
  // Save analysis result
  async saveAnalysis(userId, analysisData) {
    const { data, error } = await supabase
      .from('analysis_history')
      .insert([
        {
          user_id: userId,
          text: analysisData.text,
          model: analysisData.model,
          results: analysisData.results,
          summary: analysisData.summary,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }

    return data;
  },

  // Get user's recent analysis history
  async getRecentAnalysis(userId, limit = 10) {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analysis history:', error);
      throw error;
    }

    return data;
  },

  // Get analysis by ID
  async getAnalysisById(analysisId, userId) {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }

    return data;
  },

  // Delete analysis
  async deleteAnalysis(analysisId, userId) {
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }

    return true;
  },
}; 