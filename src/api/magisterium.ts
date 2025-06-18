// src/api/magisterium.ts
// Centralized Magisterium AI API utility

const MAGISTERIUM_API_KEY = (import.meta.env?.VITE_MAGISTERIUM_API_KEY as string) || '';
const MAGISTERIUM_API_URL = 'https://api.magisterium.com/v1/search';

export interface MagisteriumResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
}

export async function fetchMagisteriumAI(query: string): Promise<MagisteriumResult[]> {
  if (!MAGISTERIUM_API_KEY) throw new Error('Magisterium AI API key not set');
  const res = await fetch(MAGISTERIUM_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MAGISTERIUM_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Magisterium AI API error');
  const data = await res.json();
  return (data.results || []).map((item: { id: string; title: string; snippet?: string; url?: string }) => ({
    id: item.id,
    title: item.title,
    snippet: item.snippet || '',
    url: item.url || '',
  }));
}
