import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PublishingKitGenerator from './PublishingKitGenerator';
import * as distributionApi from '../../api/distribution';
import { vi } from 'vitest';

// Mock URL.createObjectURL for jsdom environment (needed for export tests)
beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url');
});
afterAll(() => {
  (global.URL.createObjectURL as any).mockRestore?.();
});

describe('PublishingKitGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
  });

  it('renders input fields and button', () => {
    render(<PublishingKitGenerator />);
    expect(screen.getByLabelText(/Video Script Content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Key Themes/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Publishing Kit/i)).toBeInTheDocument();
  });

  it('calls AI functions and displays generated content', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeTitle').mockResolvedValue('AI Title');
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockResolvedValue('AI Description');
    vi.spyOn(distributionApi, 'generateYouTubeTags').mockResolvedValue('tag1, tag2');
    render(<PublishingKitGenerator />);
    fireEvent.change(screen.getByLabelText(/Video Script Content/i), { target: { value: 'script' } });
    fireEvent.change(screen.getByLabelText(/Key Themes/i), { target: { value: 'theme' } });
    fireEvent.click(screen.getByText(/Generate Publishing Kit/i));
    expect(await screen.findByDisplayValue('AI Title')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('AI Description')).toBeInTheDocument();
    expect(await screen.findByText(/tag1, tag2/)).toBeInTheDocument();
  });

  it('shows error feedback if API fails', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeTitle').mockRejectedValue(new Error('API error'));
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockResolvedValue('desc');
    vi.spyOn(distributionApi, 'generateYouTubeTags').mockResolvedValue('tag1, tag2');
    render(<PublishingKitGenerator />);
    fireEvent.change(screen.getByLabelText(/Video Script Content/i), { target: { value: 'script' } });
    fireEvent.change(screen.getByLabelText(/Key Themes/i), { target: { value: 'theme' } });
    fireEvent.click(screen.getByText(/Generate Publishing Kit/i));
    expect(await screen.findByRole('alert')).toHaveTextContent(/api error/i);
  });

  it('shows actionable guidance if API key is missing', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeTitle').mockRejectedValue(new Error('HuggingFace API key not set'));
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockResolvedValue('desc');
    vi.spyOn(distributionApi, 'generateYouTubeTags').mockResolvedValue('tag1, tag2');
    render(<PublishingKitGenerator />);
    fireEvent.change(screen.getByLabelText(/Video Script Content/i), { target: { value: 'script' } });
    fireEvent.change(screen.getByLabelText(/Key Themes/i), { target: { value: 'theme' } });
    fireEvent.click(screen.getByText(/Generate Publishing Kit/i));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/api key not set/i);
    expect(alert).toHaveTextContent(/how to fix/i);
    expect(screen.getByText(/get your huggingface api key/i)).toHaveAttribute('href', expect.stringContaining('huggingface.co/settings/tokens'));
  });

  it('allows editing, copying, and exporting of title, description, and tags', async () => {
    vi.spyOn(distributionApi, 'generateYouTubeTitle').mockResolvedValue('AI Title');
    vi.spyOn(distributionApi, 'generateYouTubeSummary').mockResolvedValue('AI Description');
    vi.spyOn(distributionApi, 'generateYouTubeTags').mockResolvedValue('tag1, tag2');
    render(<PublishingKitGenerator />);
    fireEvent.change(screen.getByLabelText(/Video Script Content/i), { target: { value: 'script' } });
    fireEvent.change(screen.getByLabelText(/Key Themes/i), { target: { value: 'theme' } });
    fireEvent.click(screen.getByText(/Generate Publishing Kit/i));
    const titleInput = await screen.findByLabelText(/Edit generated title/i);
    const descTextarea = await screen.findByLabelText(/Edit generated description/i);
    fireEvent.change(titleInput, { target: { value: 'Edited Title' } });
    fireEvent.change(descTextarea, { target: { value: 'Edited Description' } });
    expect(titleInput).toHaveValue('Edited Title');
    expect(descTextarea).toHaveValue('Edited Description');
    // Copy
    fireEvent.click(screen.getByRole('button', { name: /copy title/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Edited Title');
    fireEvent.click(screen.getByRole('button', { name: /copy description/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Edited Description');
    fireEvent.click(screen.getByRole('button', { name: /copy tags/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('tag1, tag2');
    // Export (mock createElement and click)
    const clickMock = vi.fn();
    const aMock = { click: clickMock, set href(_val: string) {}, set download(_val: string) {} } as any;
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(aMock);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node: any) => node);
    fireEvent.click(screen.getByRole('button', { name: /export title/i }));
    fireEvent.click(screen.getByRole('button', { name: /export description/i }));
    fireEvent.click(screen.getByRole('button', { name: /export tags/i }));
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickMock).toHaveBeenCalled();
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });
});
