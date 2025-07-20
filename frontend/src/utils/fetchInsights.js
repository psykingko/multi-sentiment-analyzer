import { getBackendUrl } from './getBackendUrl';

export async function fetchGlobalInsights() {
  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return await res.json();
}
