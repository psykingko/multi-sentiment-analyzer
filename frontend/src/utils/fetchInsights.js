import { supabase } from '../lib/supabase';

export async function fetchGlobalInsights() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const res = await fetch(`${backendUrl}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return await res.json();
}
