import { render, screen, fireEvent } from '@testing-library/react';
import EthicalGuardrails from './EthicalGuardrails';
import * as guardrailsApi from '../../api/ethicalGuardrails';
import { vi } from 'vitest';

describe('EthicalGuardrails', () => {
  it('renders input and button', () => {
    render(<EthicalGuardrails />);
    expect(screen.getByPlaceholderText(/Paste or write your content/i)).toBeInTheDocument();
    expect(screen.getByText(/Check Content/i)).toBeInTheDocument();
  });

  it('shows results from API', async () => {
    vi.spyOn(guardrailsApi, 'checkEthicalGuardrails').mockResolvedValue([
      { type: 'bias', message: 'Potentially biased statement detected.', suggestion: 'Consider more nuanced language.' },
    ]);
    render(<EthicalGuardrails />);
    fireEvent.change(screen.getByPlaceholderText(/Paste or write your content/i), { target: { value: 'Always' } });
    fireEvent.click(screen.getByText(/Check Content/i));
    expect(await screen.findByText(/Potentially biased statement/i)).toBeInTheDocument();
    expect(screen.getByText(/Consider more nuanced language/i)).toBeInTheDocument();
  });

  it('shows error feedback if API fails', async () => {
    vi.spyOn(guardrailsApi, 'checkEthicalGuardrails').mockRejectedValue(new Error('fail'));
    render(<EthicalGuardrails />);
    fireEvent.change(screen.getByPlaceholderText(/Paste or write your content/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Check Content/i));
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to check ethical guardrails/i);
  });
});
