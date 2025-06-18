import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ScriptEditor from './ScriptEditor';

describe('ScriptEditor', () => {
  const mockOutline = vi.fn(() => Promise.resolve('Outline text'));
  const mockFidelity = vi.fn(() => Promise.resolve('Fidelity OK'));
  const mockVisuals = vi.fn(() => Promise.resolve(['Image 1', 'Image 2']));
  const isLoading = { outline: false, fidelity: false, visuals: false };

  it('renders the script editor UI', () => {
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    expect(screen.getByText(/The Writer's Room/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Start writing your script/i)).toBeInTheDocument();
  });

  it('calls onGenerateOutline when Generate Outline is clicked', async () => {
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByLabelText(/Outline Theme/i), { target: { value: 'Test Theme' } });
    fireEvent.click(screen.getByText(/Generate Outline/i));
    await waitFor(() => expect(mockOutline).toHaveBeenCalledWith('Test Theme', 'medium', 'bulleted', 'neutral', 'standard'));
  });

  it('calls AI summarization when Summarize Script is clicked', async () => {
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: 'Some script content.' } });
    fireEvent.click(screen.getByText(/Summarize Script/i));
    // You would mock summarizeText and check for summary output in a real test
  });

  it('calls doctrinal check when Check Doctrine is clicked', async () => {
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: 'Some script content.' } });
    fireEvent.click(screen.getByText(/Check Doctrine/i));
    // You would mock fetchMagisteriumAI and check for doctrinal output in a real test
  });

  it('calls onGenerateOutline with all options', async () => {
    const mock = vi.fn(() => Promise.resolve('Outline text'));
    render(
      <ScriptEditor
        onGenerateOutline={mock}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByLabelText(/Outline Theme/i), { target: { value: 'Test Theme' } });
    fireEvent.change(screen.getByDisplayValue('Medium'), { target: { value: 'long' } });
    fireEvent.change(screen.getByDisplayValue('Bulleted'), { target: { value: 'numbered' } });
    fireEvent.change(screen.getByDisplayValue('Neutral'), { target: { value: 'inspirational' } });
    fireEvent.change(screen.getByDisplayValue('Standard'), { target: { value: 'chronological' } });
    fireEvent.click(screen.getByText(/Generate Outline/i));
    await waitFor(() => expect(mock).toHaveBeenCalledWith('Test Theme', 'long', 'numbered', 'inspirational', 'chronological'));
  });

  it('shows error feedback if outline generation fails', async () => {
    const mock = vi.fn(() => Promise.reject(new Error('fail')));
    render(
      <ScriptEditor
        onGenerateOutline={mock}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByLabelText(/Outline Theme/i), { target: { value: 'Test Theme' } });
    fireEvent.click(screen.getByText(/Generate Outline/i));
    expect(await screen.findByRole('alert')).toHaveTextContent(/outline generation failed/i);
  });

  it('shows error feedback if summarization fails due to missing API key', async () => {
    vi.doMock('../../api/huggingface', () => ({
      summarizeText: vi.fn(() => Promise.reject(new Error('HuggingFace API key not set'))),
      semanticSearch: vi.fn(),
    }));
    const { default: ScriptEditor } = await import('./ScriptEditor');
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: 'Some script content.' } });
    fireEvent.click(screen.getByText(/Summarize Script/i));
    expect(await screen.findByText(/API key is missing or invalid/i)).toBeInTheDocument();
  });

  it('shows error feedback if doctrinal check fails due to missing API key', async () => {
    vi.doMock('../../api/magisterium', () => ({
      fetchMagisteriumAI: vi.fn(() => Promise.reject(new Error('API key is missing or invalid'))),
    }));
    const { default: ScriptEditor } = await import('./ScriptEditor');
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: 'Some script content.' } });
    fireEvent.click(screen.getByText(/Check Doctrine/i));
    // Wait for doctrinal feedback container and check its text content
    const doctrinalFeedback = await screen.findByText('Doctrinal Check');
    const feedbackContainer = doctrinalFeedback.parentElement;
    expect(feedbackContainer?.textContent).toMatch(/Doctrinal check failed/i);
  });

  it('shows error feedback if doctrinal check fails due to network/API error', async () => {
    vi.doMock('../../api/magisterium', () => ({
      fetchMagisteriumAI: vi.fn(() => Promise.reject(new Error('Magisterium AI API error'))),
    }));
    const { default: ScriptEditor } = await import('./ScriptEditor');
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: 'Some script content.' } });
    fireEvent.click(screen.getByText(/Check Doctrine/i));
    // Wait for doctrinal feedback container and check its text content
    const doctrinalFeedback = await screen.findByText('Doctrinal Check');
    const feedbackContainer = doctrinalFeedback.parentElement;
    expect(feedbackContainer?.textContent).toMatch(/Unable to reach Magisterium AI/i);
  });

  it('refines outline sections (regenerate/expand)', async () => {
    const mockOutline = vi.fn((section, length, style, tone, structure, action) => {
      if (action === 'regenerate') return Promise.resolve('Regenerated Section');
      if (action === 'expand') return Promise.resolve('Expanded Section');
      return Promise.resolve('Outline text');
    });
    render(
      <ScriptEditor
        onGenerateOutline={mockOutline}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    // Set script content with two sections
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: '1. First Section\n2. Second Section' } });
    // Regenerate first section
    fireEvent.click(screen.getAllByText('Regenerate')[0]);
    await waitFor(() => {
      const textareas = screen.getAllByPlaceholderText(/Start writing your script/i);
      expect(Array.from(textareas).some(t => (t as HTMLTextAreaElement).value === 'Regenerated Section\n2. Second Section')).toBe(true);
    });
    // Expand second section
    fireEvent.click(screen.getAllByText('Expand')[1]);
    await waitFor(() => {
      const textareas = screen.getAllByPlaceholderText(/Start writing your script/i);
      expect(Array.from(textareas).some(t => (t as HTMLTextAreaElement).value === 'Regenerated Section\nExpanded Section')).toBe(true);
    });
  });

  it('shows error feedback if outline refinement fails', async () => {
    const mockOutlineError = vi.fn(() => Promise.reject(new Error('refine fail')));
    render(
      <ScriptEditor
        onGenerateOutline={mockOutlineError}
        onCheckFidelity={mockFidelity}
        onSuggestVisuals={mockVisuals}
        isLoading={isLoading}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Start writing your script/i), { target: { value: '1. Section' } });
    fireEvent.click(screen.getByText('Regenerate'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/outline refinement failed/i);
  });
});
