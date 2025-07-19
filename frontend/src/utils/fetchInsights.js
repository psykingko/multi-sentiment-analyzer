import { supabase } from '../lib/supabase';

export async function fetchGlobalInsights() {
  const { data, error } = await supabase
    .from('global_insights')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
