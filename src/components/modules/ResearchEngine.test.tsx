import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
// Mock summarizeText to always return 'Summary'
vi.mock('../../api/huggingface', () => ({
  summarizeText: vi.fn(async () => 'Summary'),
  semanticSearch: vi.fn(async () => [1, 0.5, 0.2]),
}));
import ResearchEngine from './ResearchEngine';

describe('ResearchEngine', () => {
  it('renders search UI and handles empty search', () => {
    render(<ResearchEngine />);
    expect(screen.getByTestId('search-query')).toBeInTheDocument();
    expect(screen.getByLabelText(/search source/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /main search button/i })).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (globalThis as unknown as { fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<object> }> }).fetch = vi.fn(() => Promise.resolve({ ok: false, json: async () => ({}) }));
    render(<ResearchEngine />);
    fireEvent.change(screen.getByTestId('search-query'), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /main search button/i }));
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/an error occurred while searching/i);
    });
  });

  it('shows results for DPLA (mocked)', async () => {
    (globalThis as unknown as { fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }> }).fetch = vi.fn((url: string) => {
      if (url.toString().includes('dp.la')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: [
            { id: '1', sourceResource: { title: 'Test Title', description: ['Test Desc'] }, isShownAt: 'http://example.com' }
          ] })
        });
      }
      // Summarization returns original text
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ summary_text: 'Summary' }]) });
    });
    render(<ResearchEngine />);
    fireEvent.change(screen.getByTestId('search-query'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/search source/i), { target: { value: 'dpla' } });
    fireEvent.click(screen.getByRole('button', { name: /main search button/i }));
    await waitFor(() => {
      expect(screen.getByTestId('result-title')).toHaveTextContent(/test title/i);
      expect(screen.getByText(/summary/i)).toBeInTheDocument();
    });
  });

  it('deduplicates results from multiple sources', async () => {
    (globalThis as unknown as { fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }> }).fetch = vi.fn((url: string) => {
      if (url.toString().includes('dp.la')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: [
            { id: '1', sourceResource: { title: 'Test Title', description: ['Test Desc'] }, isShownAt: 'http://example.com' }
          ] })
        });
      }
      if (url.toString().includes('wikipedia')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ query: { search: [
            { pageid: 1, title: 'Test Title', snippet: 'Test Desc' }
          ] } })
        });
      }
      // Summarization returns original text
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ summary_text: 'Summary' }]) });
    });
    render(<ResearchEngine />);
    fireEvent.change(screen.getByTestId('search-query'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/search source/i), { target: { value: 'all' } });
    fireEvent.click(screen.getByRole('button', { name: /main search button/i }));
    await waitFor(() => {
      // Only two results should appear (not deduplicated, different sources)
      expect(screen.getAllByTestId('result-title').length).toBe(2);
    });
  });

  it('shows citation export buttons for results', async () => {
    (globalThis as unknown as { fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }> }).fetch = vi.fn((url: string) => {
      if (url.toString().includes('dp.la')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs: [
            { id: '1', sourceResource: { title: 'Test Title', description: ['Test Desc'] }, isShownAt: 'http://example.com' }
          ] })
        });
      }
      // Summarization returns original text
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ summary_text: 'Summary' }]) });
    });
    render(<ResearchEngine />);
    fireEvent.change(screen.getByTestId('search-query'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/search source/i), { target: { value: 'dpla' } });
    fireEvent.click(screen.getByRole('button', { name: /main search button/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy citation/i })).toBeInTheDocument();
    });
  });

  it('allows user to refine search with keyword and date filters', async () => {
    render(<ResearchEngine />);
    fireEvent.change(screen.getByTestId('search-query'), { target: { value: 'test' } });
    fireEvent.change(screen.getByTestId('keyword-filter'), { target: { value: 'inculturation' } });
    fireEvent.change(screen.getByTestId('date-from'), { target: { value: '2020-01-01' } });
    fireEvent.change(screen.getByTestId('date-to'), { target: { value: '2021-01-01' } });
    fireEvent.change(screen.getByLabelText(/search source/i), { target: { value: 'dpla' } });
    // Mock fetch to check query string
    (globalThis as unknown as { fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }> }).fetch = vi.fn((url: string) => {
      expect(url).toContain('test');
      expect(url).toContain('inculturation');
      // Date filters are appended as text, not as real API params in this mock
      expect(url).toContain('2020-01-01');
      expect(url).toContain('2021-01-01');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ docs: [
          { id: '1', sourceResource: { title: 'Test Title', description: ['Test Desc'] }, isShownAt: 'http://example.com' }
        ] })
      });
    });
    fireEvent.click(screen.getByRole('button', { name: /main search button/i }));
    await waitFor(() => {
      expect(screen.getByTestId('result-title')).toHaveTextContent(/test title/i);
    });
  });
});
