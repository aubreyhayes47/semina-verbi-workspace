import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import WelcomeScreen from './WelcomeScreen';

describe('WelcomeScreen', () => {
  const mockNav = vi.fn();
  const defaultProps = {
    onNavigateToKnowledgeHub: mockNav,
    onNavigateToWriterRoom: mockNav,
    onNavigateToProductionPipeline: mockNav,
    onNavigateToDistributionEngine: mockNav,
  };

  beforeEach(() => mockNav.mockClear());

  it('renders onboarding steps and navigation buttons', () => {
    render(<WelcomeScreen {...defaultProps} />);
    expect(screen.getByText(/Get started in three steps/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to Knowledge Hub/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to Writer's Room/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to Production Pipeline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to Distribution Engine/i)).toBeInTheDocument();
  });

  it('calls navigation handler when Knowledge Hub button is clicked', () => {
    render(<WelcomeScreen {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Go to Knowledge Hub/i));
    expect(mockNav).toHaveBeenCalled();
  });

  it('is accessible by keyboard (tab navigation)', () => {
    render(<WelcomeScreen {...defaultProps} />);
    const buttons = [
      screen.getByLabelText(/Go to Knowledge Hub/i),
      screen.getByLabelText(/Go to Writer's Room/i),
      screen.getByLabelText(/Go to Production Pipeline/i),
      screen.getByLabelText(/Go to Distribution Engine/i),
    ];
    buttons.forEach(btn => {
      expect(btn).toBeInstanceOf(HTMLElement);
      // All buttons are focusable by default
      expect(btn.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });
});
