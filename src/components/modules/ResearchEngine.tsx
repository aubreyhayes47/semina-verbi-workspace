/**
 * ResearchEngine.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Search and synthesize historical and theological sources for content development.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 *
 * Future AI Integration: External research APIs and semantic summarization will be integrated in a future version. See TASKS.md.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import Select from '../Select';
import Spinner from '../Spinner';
import { Search, BookOpen, Layers } from 'lucide-react'; // Assuming Lucide React is installed
import { summarizeText } from '../../api/huggingface';
import { fetchMagisteriumAI } from '../../api/magisterium';
import AIActions from '../AIActions';

interface SearchResult {
  id: string;
  title: string;
  source: string;
  snippet: string;
  url: string;
  type: 'historical' | 'theological';
}

// API endpoints and summarization config
const DPLA_API_URL = 'https://api.dp.la/v2/items';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const LOC_API_URL = 'https://www.loc.gov/search/';
const EUROPEANA_API_URL = 'https://www.europeana.eu/api/v2/search.json';
const IA_API_URL = 'https://archive.org/advancedsearch.php';
const CROSSREF_API_URL = 'https://api.crossref.org/works';
// Use Vite's ImportMetaEnv type for type safety
const MAGISTERIUM_API_KEY = import.meta.env?.VITE_MAGISTERIUM_API_KEY || '';

async function fetchDPLA(query: string): Promise<SearchResult[]> {
  const url = `${DPLA_API_URL}?q=${encodeURIComponent(query)}&page_size=5&api_key=demoKey`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('DPLA API error');
  const data = await res.json();
  return (data.docs || []).map((item: { id: string; sourceResource?: { title?: string; description?: string[] }; isShownAt?: string }) => ({
    id: item.id,
    title: item.sourceResource?.title || 'Untitled',
    source: 'DPLA',
    snippet: item.sourceResource?.description?.[0] || '',
    url: item.isShownAt || '',
    type: 'historical',
  }));
}

async function fetchWikipedia(query: string): Promise<SearchResult[]> {
  const url = `${WIKIPEDIA_API_URL}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wikipedia API error');
  const data = await res.json();
  return (data.query?.search || []).slice(0, 5).map((item: { pageid: number; title: string; snippet: string }) => ({
    id: item.pageid.toString(),
    title: item.title,
    source: 'Wikipedia',
    snippet: item.snippet.replace(/<[^>]+>/g, ''),
    url: `https://en.wikipedia.org/?curid=${item.pageid}`,
    type: 'historical',
  }));
}

async function fetchLOC(query: string): Promise<SearchResult[]> {
  const url = `${LOC_API_URL}?q=${encodeURIComponent(query)}&fo=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Library of Congress API error');
  const data = await res.json();
  return (data.results || []).slice(0, 5).map((item: { id: string; title: string; description?: string; url?: string }) => ({
    id: item.id,
    title: item.title,
    source: 'Library of Congress',
    snippet: item.description || '',
    url: item.url || '',
    type: 'historical',
  }));
}

async function fetchEuropeana(query: string): Promise<SearchResult[]> {
  const url = `${EUROPEANA_API_URL}?wskey=apidemo&query=${encodeURIComponent(query)}&rows=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Europeana API error');
  const data = await res.json();
  return (data.items || []).map((item: { id: string; title?: string[]; dataProvider?: string[]; guid?: string }) => ({
    id: item.id,
    title: item.title?.[0] || 'Untitled',
    source: 'Europeana',
    snippet: item.dataProvider?.[0] || '',
    url: item.guid || '',
    type: 'historical',
  }));
}

async function fetchInternetArchive(query: string): Promise<SearchResult[]> {
  const url = `${IA_API_URL}?q=${encodeURIComponent(query)}&fl[]=identifier,title,description&rows=5&output=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Internet Archive API error');
  const data = await res.json();
  return (data.response?.docs || []).map((item: { identifier: string; title?: string; description?: string }) => ({
    id: item.identifier,
    title: item.title || 'Untitled',
    source: 'Internet Archive',
    snippet: item.description || '',
    url: `https://archive.org/details/${item.identifier}`,
    type: 'historical',
  }));
}

async function fetchCrossRef(query: string): Promise<SearchResult[]> {
  const url = `${CROSSREF_API_URL}?query=${encodeURIComponent(query)}&rows=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('CrossRef API error');
  const data = await res.json();
  return (data.message?.items || []).map((item: { DOI: string; title?: string[]; 'container-title'?: string[]; URL?: string }) => ({
    id: item.DOI,
    title: item.title?.[0] || 'Untitled',
    source: 'CrossRef',
    snippet: item['container-title']?.[0] || '',
    url: item.URL || '',
    type: 'historical',
  }));
}

// Helper to convert MagisteriumResult to SearchResult
interface MagisteriumResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
}
function magisteriumToSearchResult(m: MagisteriumResult): SearchResult {
  return {
    id: m.id,
    title: m.title,
    source: 'Magisterium AI',
    snippet: m.snippet,
    url: m.url,
    type: 'theological',
  };
}

// Deduplicate results by title+source+url
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    const key = `${r.title}|${r.source}|${r.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'dpla', label: 'DPLA (Historical Archives)' },
  { value: 'wikipedia', label: 'Wikipedia (Encyclopedic)' },
  { value: 'loc', label: 'Library of Congress' },
  { value: 'europeana', label: 'Europeana (European Archives)' },
  { value: 'internet_archive', label: 'Internet Archive' },
  { value: 'crossref', label: 'CrossRef (Academic Papers)' },
  { value: 'magisterium_ai', label: 'Magisterium AI (Conceptual)' },
];

const ResearchEngine: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState(sourceOptions[0].value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSummarizingAll, setIsSummarizingAll] = useState(false);
  const [allSummaries, setAllSummaries] = useState<string[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  // Add state for advanced search filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');

  // Update handleSearch to use filters
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      let query = searchQuery;
      if (keywordFilter.trim()) query += ` ${keywordFilter}`;
      if (dateFrom.trim() || dateTo.trim()) query += ` ${dateFrom.trim() ? 'after:' + dateFrom : ''}${dateTo.trim() ? ' before:' + dateTo : ''}`;
      let fetched: SearchResult[] = [];
      if (selectedSource === 'all') {
        const [dpla, wiki, loc, europeana, ia, crossref, magisterium] = await Promise.all([
          fetchDPLA(query),
          fetchWikipedia(query),
          fetchLOC(query),
          fetchEuropeana(query),
          fetchInternetArchive(query),
          fetchCrossRef(query),
          MAGISTERIUM_API_KEY ? fetchMagisteriumAI(query) : Promise.resolve([]),
        ]);
        fetched = [
          ...dpla,
          ...wiki,
          ...loc,
          ...europeana,
          ...ia,
          ...crossref,
          ...((magisterium as MagisteriumResult[]).map(magisteriumToSearchResult)),
        ];
      } else if (selectedSource === 'dpla') {
        fetched = await fetchDPLA(query);
      } else if (selectedSource === 'wikipedia') {
        fetched = await fetchWikipedia(query);
      } else if (selectedSource === 'loc') {
        fetched = await fetchLOC(query);
      } else if (selectedSource === 'europeana') {
        fetched = await fetchEuropeana(query);
      } else if (selectedSource === 'internet_archive') {
        fetched = await fetchInternetArchive(query);
      } else if (selectedSource === 'crossref') {
        fetched = await fetchCrossRef(query);
      } else if (selectedSource === 'magisterium_ai') {
        const magisterium = await fetchMagisteriumAI(query);
        fetched = (magisterium as MagisteriumResult[]).map(magisteriumToSearchResult);
      }
      // Deduplicate and attribute sources
      const deduped = deduplicateResults(fetched);
      // Summarize snippets
      const summarized = await Promise.all(deduped.map(async (item) => ({
        ...item,
        snippet: item.snippet ? await summarizeText(item.snippet) : '',
      })));
      setResults(summarized);
    } catch (err) {
      setError('An error occurred while searching: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize all results
  const handleSummarizeAll = async () => {
    setIsSummarizingAll(true);
    setAllSummaries([]);
    try {
      const summaries = await Promise.all(results.map(async (item) => item.snippet ? await summarizeText(item.snippet) : ''));
      setAllSummaries(summaries);
    } catch (err) {
      setAllSummaries(['Summarization failed: ' + ((err instanceof Error) ? err.message : 'Unknown error')]);
    } finally {
      setIsSummarizingAll(false);
    }
  };

  // Semantic search for user-saved results
  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim() || results.length === 0) return;
    setIsSemanticSearching(true);
    setSemanticError(null);
    setSemanticResults([]);
    try {
      // Use result snippets for semantic search
      const sentences = results.map(r => r.snippet);
      const { semanticSearch } = await import('../../api/huggingface');
      const scores = await semanticSearch(semanticQuery, sentences);
      // Map scores to results
      const sorted = scores
        .map((score: number, i: number) => ({ ...results[i], score }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      setSemanticResults(sorted);
    } catch (err) {
      setSemanticError((err instanceof Error) ? err.message : 'Semantic search failed');
    } finally {
      setIsSemanticSearching(false);
    }
  };

  // Citation export helpers
  function toBibTeX(result: SearchResult) {
    return `@misc{${result.id},\n  title={${result.title}},\n  howpublished={${result.url}},\n  note={${result.source}}\n}`;
  }
  function toPlainCitation(result: SearchResult) {
    return `${result.title}. ${result.source}. ${result.url}`;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Federated Research Engine </h2>
      <p className="text-gray-600 mb-6">
        Search across historical archives and theological data to inform your content creation. 
      </p>
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            label="Search Query"
            placeholder="e.g., St. Augustine, Inculturation, evangelization"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            data-testid="search-query"
          />
          <Select
            label="Search Source"
            options={sourceOptions}
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          />
          <Input
            label="Keyword Filter"
            placeholder="Filter by keyword (optional)"
            value={keywordFilter}
            onChange={e => setKeywordFilter(e.target.value)}
            data-testid="keyword-filter"
          />
          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            data-testid="date-from"
          />
          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            data-testid="date-to"
          />
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()} aria-busy={isLoading} aria-label="Main Search Button">
          {isLoading ? <Spinner size="sm" color="text-white" /> : 'Search'}
        </Button>
      </div>
      {error && (
        <div className="text-red-600 mb-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}
      {results.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Search Results:</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center mb-2">
                  {result.type === 'historical' ? (
                    <BookOpen size={18} className="mr-2 text-blue-600" />
                  ) : (
                    <Layers size={18} className="mr-2 text-green-600" />
                  )}
                  <h4 className="font-semibold text-gray-800" role="heading" aria-level={4} data-testid="result-title">{result.title}</h4>
                  <span className="ml-auto text-xs text-gray-500">Source: {result.source}</span>
                </div>
                <p className="text-gray-700 text-sm mb-2 line-clamp-3">{result.snippet}</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Read More
                </a>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" aria-label="Copy Citation" onClick={() => navigator.clipboard.writeText(toPlainCitation(result))}>Copy Citation</Button>
                  <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(toBibTeX(result))}>Copy BibTeX</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {results.length === 0 && !isLoading && searchQuery.trim() && (
        <p className="text-gray-500 text-center mt-6">No results found for your query.</p>
      )}
      <div className="flex gap-2 mb-4">
        <AIActions label="Summarize All Results" onClick={handleSummarizeAll} isLoading={isSummarizingAll} />
        <Input
          label="Semantic Search Query"
          placeholder="e.g., Inculturation, evangelization, St. Patrick"
          value={semanticQuery}
          onChange={e => setSemanticQuery(e.target.value)}
          data-testid="semantic-search-query"
        />
        <AIActions label="Semantic Search" onClick={handleSemanticSearch} isLoading={isSemanticSearching} />
      </div>
      {allSummaries.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-700 mb-1">AI Summaries</h4>
          <ol className="list-decimal list-inside text-blue-900 text-sm">
            {allSummaries.map((summary, i) => (
              <li key={i}>{summary}</li>
            ))}
          </ol>
        </div>
      )}
      {semanticError && <div className="text-red-600 mb-2">{semanticError}</div>}
      {semanticResults.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-700 mb-1">Most Relevant Results</h4>
          <ol className="list-decimal list-inside text-yellow-900 text-sm">
            {semanticResults.map((result, i) => (
              <li key={i}><b>{result.title}</b> ({result.source}): {result.snippet}</li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
};

export default ResearchEngine;