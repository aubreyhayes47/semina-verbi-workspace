// visualAssets.ts
// Aggregates visual asset suggestions from DPLA, Europeana, Wikimedia Commons, and Internet Archive
// Returns deduplicated, attributed results for use in the Visual Asset Suggestion Engine

export interface VisualAsset {
  title: string;
  url: string;
  source: string;
  thumbnail?: string;
  attribution: string;
}

// Real DPLA fetcher implementation
async function fetchDPLA(query: string): Promise<VisualAsset[]> {
  const apiKey = process.env.DPLA_API_KEY || '';
  const url = `https://api.dp.la/v2/items?q=${encodeURIComponent(query)}&api_key=${apiKey}&page_size=10`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('DPLA API error');
  const data = await resp.json();
  if (!data.docs) return [];
  return data.docs.map((doc: any) => ({
    title: doc.title || 'Untitled',
    url: doc.isShownAt || '#',
    source: 'DPLA',
    thumbnail: doc.object || '',
    attribution: doc.dataProvider ? `Courtesy of ${doc.dataProvider}` : 'DPLA',
  }));
}

// Real Europeana fetcher implementation
async function fetchEuropeana(query: string): Promise<VisualAsset[]> {
  const apiKey = process.env.EUROPEANA_API_KEY || '';
  const url = `https://www.europeana.eu/api/v2/search.json?wskey=${apiKey}&query=${encodeURIComponent(query)}&rows=10`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Europeana API error');
  const data = await resp.json();
  if (!data.items) return [];
  return data.items.map((item: any) => ({
    title: item.title && item.title[0] ? item.title[0] : 'Untitled',
    url: item.guid || '#',
    source: 'Europeana',
    thumbnail: item.edmPreview && item.edmPreview[0] ? item.edmPreview[0] : '',
    attribution: item.dataProvider && item.dataProvider[0] ? `Courtesy of ${item.dataProvider[0]}` : 'Europeana',
  }));
}

// Real Wikimedia Commons fetcher implementation
async function fetchWikimedia(query: string): Promise<VisualAsset[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&iiprop=url|extmetadata`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Wikimedia Commons API error');
  const data = await resp.json();
  if (!data.query || !data.query.pages) return [];
  return Object.values(data.query.pages).map((page: any) => {
    const info = page.imageinfo && page.imageinfo[0] ? page.imageinfo[0] : {};
    const meta = info.extmetadata || {};
    return {
      title: meta.ObjectName ? meta.ObjectName.value : page.title || 'Untitled',
      url: info.descriptionurl || '#',
      source: 'Wikimedia Commons',
      thumbnail: info.thumburl || info.url || '',
      attribution: meta.Artist ? meta.Artist.value : 'Wikimedia Commons',
    };
  });
}

// Real Internet Archive fetcher implementation
async function fetchInternetArchive(query: string): Promise<VisualAsset[]> {
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,mediatype,title,creator,collection,description&rows=10&page=1&output=json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Internet Archive API error');
  const data = await resp.json();
  if (!data.response || !data.response.docs) return [];
  return data.response.docs.map((doc: any) => {
    const identifier = doc.identifier;
    return {
      title: doc.title || 'Untitled',
      url: `https://archive.org/details/${identifier}`,
      source: 'Internet Archive',
      thumbnail: identifier ? `https://archive.org/services/img/${identifier}` : '',
      attribution: doc.creator ? `By ${doc.creator}` : 'Internet Archive',
    };
  });
}

async function safeFetch(fetcher: (q: string) => Promise<VisualAsset[]>, query: string, source: string): Promise<VisualAsset[]> {
  try {
    return await fetcher(query);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching from ${source}:`, e);
    return [];
  }
}

// Exported for direct testing
export function simpleSemanticScore(query: string, asset: VisualAsset): number {
  // Simple keyword overlap between query and asset title/attribution
  const qWords = new Set(query.toLowerCase().split(/\W+/));
  const tWords = new Set((asset.title + ' ' + (asset.attribution || '')).toLowerCase().split(/\W+/));
  let overlap = 0;
  qWords.forEach(w => { if (tWords.has(w) && w.length > 2) overlap++; });
  return overlap;
}

export async function getVisualAssets(query: string): Promise<VisualAsset[]> {
  const results = await Promise.all([
    safeFetch(fetchDPLA, query, 'DPLA'),
    safeFetch(fetchEuropeana, query, 'Europeana'),
    safeFetch(fetchWikimedia, query, 'Wikimedia Commons'),
    safeFetch(fetchInternetArchive, query, 'Internet Archive'),
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
  // Semantic filtering: rank by simple semantic score, keep only relevant (score > 0) or top 10
  deduped = deduped
    .map(asset => ({ ...asset, _score: simpleSemanticScore(query, asset) }))
    .filter(a => a._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 10)
    .map(({ _score, ...asset }) => asset);
  // Fallback: if all sources fail or no relevant assets, provide a generic suggestion
  if (deduped.length === 0) {
    deduped = [{
      title: 'No assets found',
      url: '#',
      source: 'Fallback',
      thumbnail: '',
      attribution: 'No visual assets could be found for your query. Please try again later or refine your script.'
    }];
  }
  return deduped;
}

export { fetchDPLA, fetchEuropeana, fetchWikimedia, fetchInternetArchive };
