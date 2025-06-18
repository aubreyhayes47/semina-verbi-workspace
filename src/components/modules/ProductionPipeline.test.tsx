import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProductionPipeline from './ProductionPipeline';

window.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ text: 'Test transcription output.' }),
  })
) as unknown as jest.Mock;

describe('ProductionPipeline', () => {
  it('renders audio upload and transcription controls', () => {
    render(<ProductionPipeline isLoading={{ transcription: false, xml: false }} transcriptionContent="" />);
    expect(screen.getByLabelText(/Upload audio for transcription/i)).toBeInTheDocument();
    expect(screen.getByText(/Transcribe Audio/i)).toBeInTheDocument();
  });

  it('enables Transcribe Audio button when file is selected', () => {
    render(<ProductionPipeline isLoading={{ transcription: false, xml: false }} transcriptionContent="" />);
    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });
    const input = screen.getByLabelText(/Upload audio for transcription/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText(/Transcribe Audio/i)).not.toBeDisabled();
  });

  it('shows transcription output after processing', async () => {
    render(<ProductionPipeline isLoading={{ transcription: false, xml: false }} transcriptionContent="" />);
    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' });
    const input = screen.getByLabelText(/Upload audio for transcription/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText(/Transcribe Audio/i));
    await waitFor(() => expect(screen.getByTestId('transcription-output')).toHaveValue('Test transcription output.'));
  });

  it('shows and allows editing of transcription output', async () => {
    render(<ProductionPipeline isLoading={{ transcription: false, xml: false }} transcriptionContent="Initial transcription" />);
    const textarea = screen.getByTestId('transcription-output');
    expect(textarea).toHaveValue('Initial transcription');
    fireEvent.change(textarea, { target: { value: 'Edited transcription' } });
    expect(textarea).toHaveValue('Edited transcription');
  });

  it('copies and exports transcription', async () => {
    render(<ProductionPipeline isLoading={{ transcription: false, xml: false }} transcriptionContent="Copy me" />);
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    fireEvent.click(screen.getByRole('button', { name: /Copy Transcription/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy me');
    // Export: createObjectURL and click are not easily testable, but button is present
    expect(screen.getByRole('button', { name: /Export Transcription/i })).toBeInTheDocument();
  });
});
