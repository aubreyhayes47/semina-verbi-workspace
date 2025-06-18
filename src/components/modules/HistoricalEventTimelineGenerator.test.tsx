import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HistoricalEventTimelineGenerator from './HistoricalEventTimelineGenerator';

describe('HistoricalEventTimelineGenerator', () => {
  it('renders timeline title and event fields', () => {
    render(<HistoricalEventTimelineGenerator />);
    expect(screen.getByLabelText(/Timeline Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event 1 Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event 1 Description/i)).toBeInTheDocument();
  });

  it('adds and removes events', () => {
    render(<HistoricalEventTimelineGenerator />);
    fireEvent.click(screen.getByText(/Add Event/i));
    expect(screen.getByLabelText(/Event 2 Year/i)).toBeInTheDocument();
    // Fix: Use getAllByRole for trash buttons, which have no accessible name, so use getAllByRole('button') and filter by svg or class if needed.
    const trashButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-trash2'));
    fireEvent.click(trashButtons[0]);
    expect(screen.queryByLabelText(/Event 2 Year/i)).not.toBeInTheDocument();
  });
});
