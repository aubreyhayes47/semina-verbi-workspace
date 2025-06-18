import { render, screen, fireEvent } from '@testing-library/react';
import ContentEnhancement from './ContentEnhancement';
import * as distributionApi from '../../api/distribution';
import { vi } from 'vitest';

describe('ContentEnhancement', () => {
  it('renders tabs and generates mock visual suggestions', async () => {
    render(<ContentEnhancement />);
    // Switch to Visual Asset Suggestion tab
    expect(screen.getByText(/Visual Asset Suggestion/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Script Content/i), { target: { value: 'Augustine' } });
    fireEvent.click(screen.getByRole('button', { name: /suggest visual assets/i }));
    // Wait for mock result
    expect(await screen.findByText(/Augustine/i)).toBeInTheDocument();
  });
});

describe('ContentEnhancement — Distribution Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders distribution controls', () => {
    render(<ContentEnhancement />);
    // Switch to Distribution Tools tab
    fireEvent.click(screen.getByText(/Distribution Tools/i));
    // Fix: Use getByRole for buttons with correct accessible names, and check for their presence.
    expect(screen.getByRole('button', { name: /generate youtube summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate title/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate tags/i })).toBeInTheDocument();
    expect(screen.getByText(/Generate Community Post/i)).toBeInTheDocument();
  });

  it('shows generated summary, title, tags, and community post', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockResolvedValue('AI Summary');
    vi.spyOn(distributionApi, 'generateYouTubeTitle').mockResolvedValue('AI Title');
    vi.spyOn(distributionApi, 'generateYouTubeTags').mockResolvedValue('AI Tags');
    vi.spyOn(distributionApi, 'generateCommunityPost').mockResolvedValue('AI Community Post');
    render(<ContentEnhancement />);
    // Switch to Distribution Tools tab
    fireEvent.click(screen.getByText(/Distribution Tools/i));
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    // Click and await each button/output in sequence
    fireEvent.click(screen.getByRole('button', { name: /generate youtube summary/i }));
    expect(await screen.findByText('AI Summary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /generate title/i }));
    expect(await screen.findByText('AI Title')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /generate tags/i }));
    expect(await screen.findByText('AI Tags')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /generate community post/i }));
    expect(await screen.findByText('AI Community Post')).toBeInTheDocument();
  });

  it('shows error feedback if API fails', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockRejectedValue(new Error('API error'));
    render(<ContentEnhancement />);
    // Switch to Distribution Tools tab
    fireEvent.click(screen.getByText(/Distribution Tools/i));
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /generate youtube summary/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to generate summary/i);
  });

  it('shows actionable guidance if API key is missing', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockRejectedValue(new Error('HuggingFace API key not set'));
    render(<ContentEnhancement />);
    fireEvent.click(screen.getByText(/Distribution Tools/i));
    fireEvent.change(screen.getByPlaceholderText(/Paste the relevant section/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /generate youtube summary/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/api key not set/i);
    expect(alert).toHaveTextContent(/how to fix/i);
    expect(screen.getByText(/get your huggingface api key/i)).toHaveAttribute('href', expect.stringContaining('huggingface.co/settings/tokens'));
  });
});
