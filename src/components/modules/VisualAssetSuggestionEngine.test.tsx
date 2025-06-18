import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualAssetSuggestionEngine from './VisualAssetSuggestionEngine';
import { VisualAsset } from '../../api/visualAssets';
import { vi } from 'vitest';

describe('VisualAssetSuggestionEngine', () => {
  const mockAssets: VisualAsset[] = [
    {
      title: 'Test Image',
      url: 'https://example.com/image',
      source: 'DPLA',
      thumbnail: 'https://example.com/image-thumb.jpg',
      attribution: 'Courtesy of DPLA',
    },
    {
      title: 'Test Map',
      url: 'https://example.com/map',
      source: 'Europeana',
      thumbnail: '',
      attribution: 'Courtesy of Europeana',
    },
  ];

  it('renders input and button', () => {
    render(<VisualAssetSuggestionEngine isLoading={false} />);
    expect(screen.getByPlaceholderText(/Paste the relevant section/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggest Visual Assets/i)).toBeInTheDocument();
  });

  it('shows suggestions from API', async () => {
    const mockSuggest = vi.fn(() => Promise.resolve(mockAssets));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getByText('Test Image')).toBeInTheDocument());
    expect(screen.getByText('Test Map')).toBeInTheDocument();
    expect(screen.getAllByText(/Copy Attribution/i).length).toBe(2);
    // Check for image element
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    // Fallback for missing thumbnail
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('shows error feedback if API fails', async () => {
    const mockSuggest = vi.fn(() => Promise.reject(new Error('fail')));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    const errorDiv = await screen.findByTestId('error-feedback');
    expect(errorDiv).toHaveTextContent(/failed to fetch visual assets/i);
  });

  it('shows fallback suggestion if all APIs fail', async () => {
    const mockSuggest = vi.fn(() => Promise.resolve([
      {
        title: 'No assets found',
        url: '#',
        source: 'Fallback',
        thumbnail: '',
        attribution: 'No visual assets could be found for your query. Please try again later or refine your script.'
      }
    ]));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getByText(/No specific visual suggestions found/i)).toBeInTheDocument());
    expect(screen.getByText(/No visual assets could be found/i)).toBeInTheDocument();
  });

  it('filters out irrelevant assets using semantic filtering', async () => {
    const mockSuggest = vi.fn(() => Promise.resolve([
      { title: 'Banana', url: 'u1', source: 'DPLA', thumbnail: '', attribution: 'A fruit' },
      { title: 'Relevant Map', url: 'u2', source: 'Europeana', thumbnail: '', attribution: 'Map of Rome' },
    ]));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'Rome' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getByText('Relevant Map')).toBeInTheDocument());
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('deduplicates assets by URL or title+source', async () => {
    const mockSuggest = vi.fn(() => Promise.resolve([
      { title: 'Map', url: 'u1', source: 'DPLA', thumbnail: '', attribution: 'A' },
      { title: 'Map', url: 'u1', source: 'Europeana', thumbnail: '', attribution: 'B' },
      { title: 'Map', url: 'u2', source: 'DPLA', thumbnail: '', attribution: 'C' },
    ]));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'Map' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getAllByText('Map').length).toBeLessThanOrEqual(2));
  });

  it('has accessible ARIA labels and tab navigation', async () => {
    const mockSuggest = vi.fn(() => Promise.resolve([{
      title: 'Accessible Asset', url: 'u1', source: 'DPLA', thumbnail: '', attribution: 'A' }
    ]));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'Accessible' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getByLabelText(/Visual asset suggestion/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/Copy attribution/i)).toBeInTheDocument();
  });

  it('copies attribution text to clipboard when button is clicked', async () => {
    const mockClipboard = { writeText: vi.fn() };
    // @ts-ignore
    global.navigator.clipboard = mockClipboard;
    const asset = { title: 'CopyTest', url: 'u1', source: 'DPLA', thumbnail: '', attribution: 'Attr' };
    const mockSuggest = vi.fn(() => Promise.resolve([asset]));
    render(<VisualAssetSuggestionEngine onSuggest={mockSuggest} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'CopyTest' } });
    fireEvent.click(screen.getByText(/Suggest Visual Assets/i));
    await waitFor(() => expect(screen.getByText('CopyTest')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/Copy attribution/i));
    expect(mockClipboard.writeText).toHaveBeenCalledWith('CopyTest (DPLA): u1 — Attr');
  });
});
