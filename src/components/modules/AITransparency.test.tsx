import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AITransparency from './AITransparency';

describe('AITransparency', () => {
  it('renders feature checkboxes and generates disclosure', () => {
    render(<AITransparency />);
    // Check for a known feature label
    expect(screen.getByLabelText(/AI-Powered Script Outlines/i)).toBeInTheDocument();
    // Select a feature and generate disclosure
    fireEvent.click(screen.getByLabelText(/AI-Powered Script Outlines/i));
    // Fix: Use correct accessible name for the button (matches aria-label="Generate AI Disclosure")
    fireEvent.click(screen.getByRole('button', { name: /generate ai disclosure/i }));
    expect(screen.getByText(/AI was utilized for/i)).toBeInTheDocument();
  });
});
