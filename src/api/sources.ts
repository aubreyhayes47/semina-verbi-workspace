// sources.ts
// Aggregates source/fidelity suggestions from Magisterium AI, CrossRef, Wikipedia, and Library of Congress
// Returns deduplicated, attributed results for use in the Source & Fidelity Checker

export interface SourceResult {
  title: string;
  url: string;
  source: string;
  snippet: string;
  attribution: string;
  confidence: number; // 0-1, how confident the system is in this source
  explanation: string; // Short explanation of why this source was selected
}

// Example fetchers (real implementations would use fetch and handle API keys/rate limits)
async function fetchMagisterium(query: string): Promise<SourceResult[]> {
  // Placeholder: Replace with real API call
  return [
    {
      title: `Magisterium Example for ${query}`,
      url: 'https://magisterium.com/item/example',
      source: 'Magisterium AI',
      snippet: 'Relevant doctrinal snippet.',
      attribution: 'Courtesy of Magisterium AI',
      confidence: 0.95,
      explanation: 'Direct doctrinal match found in Magisterium AI database.',
    },
  ];
}

// Real CrossRef fetcher implementation
async function fetchCrossRef(query: string): Promise<SourceResult[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('CrossRef API error');
    const data = await resp.json();
    if (!data.message || !data.message.items) return [];
    return data.message.items.map((item: any) => ({
      title: item.title && item.title[0] ? item.title[0] : 'Untitled',
      url: item.URL || '#',
      source: 'CrossRef',
      snippet: item['abstract'] || '',
      attribution: item.publisher || 'CrossRef',
      confidence: 0.8, // Heuristic
      explanation: 'Academic article matched by CrossRef.',
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching from CrossRef:', e);
    return [];
  }
}

// Real Wikipedia fetcher implementation
async function fetchWikipedia(query: string): Promise<SourceResult[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}&srlimit=3`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Wikipedia API error');
    const data = await resp.json();
    if (!data.query || !data.query.search) return [];
    return data.query.search.map((item: any) => ({
      title: item.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      source: 'Wikipedia',
      snippet: item.snippet.replace(/<[^>]+>/g, ''),
      attribution: 'Wikipedia',
      confidence: 0.6, // Heuristic
      explanation: 'Wikipedia article matched by search.',
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching from Wikipedia:', e);
    return [];
  }
}

// Real Library of Congress fetcher implementation
async function fetchLibraryOfCongress(query: string): Promise<SourceResult[]> {
  const url = `https://www.loc.gov/search/?q=${encodeURIComponent(query)}&fo=json&c=3`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Library of Congress API error');
    const data = await resp.json();
    if (!data.results) return [];
    return data.results.map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.id || '#',
      source: 'Library of Congress',
      snippet: item.description && item.description[0] ? item.description[0] : '',
      attribution: 'Library of Congress',
      confidence: 0.7, // Heuristic
      explanation: 'Library of Congress record matched by search.',
    }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error fetching from Library of Congress:', e);
    return [];
  }
}

function simpleSourceSemanticScore(query: string, source: SourceResult): number {
  // Simple keyword overlap between query and title/snippet/attribution
  const qWords = new Set(query.toLowerCase().split(/\W+/));
  const tWords = new Set((source.title + ' ' + source.snippet + ' ' + (source.attribution || '')).toLowerCase().split(/\W+/));
  let overlap = 0;
  qWords.forEach(w => { if (tWords.has(w) && w.length > 2) overlap++; });
  return overlap;
}

export async function getSourceResults(query: string): Promise<SourceResult[]> {
  const results = await Promise.all([
    fetchMagisterium(query),
    fetchCrossRef(query),
    fetchWikipedia(query),
    fetchLibraryOfCongress(query),
  ]);
  // Flatten and deduplicate by normalized URL or title+source
  const flat = results.flat();
  const seen = new Set<string>();
  let deduped = flat.filter((item) => {
    const key = (item.url || '').toLowerCase() || (item.title + item.source).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Semantic filtering: rank by simple semantic score and confidence, keep only relevant (score > 0) or top 10
  deduped = deduped
    .map(source => ({ ...source, _score: simpleSourceSemanticScore(query, source) + (source.confidence || 0) }))
    .filter(s => s._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 10)
    .map(({ _score, ...source }) => source);
  // Fallback: if all sources fail or no relevant sources, provide a generic suggestion
  if (deduped.length === 0) {
    deduped = [{
      title: 'No sources found',
      url: '#',
      source: 'Fallback',
      snippet: '',
      attribution: 'No sources could be found for your query. Please try again later or refine your script.',
      confidence: 0,
      explanation: 'No relevant sources found.'
    }];
  }
  return deduped;
}
