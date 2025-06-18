import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  it('renders dashboard headings and charts', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Views \(Last 6 Months\)/i)).toBeInTheDocument();
    // Use getAllByText for ambiguous headings
    expect(screen.getAllByText(/Watch Time \(Hours\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Key Insights/i)).toBeInTheDocument();
  });

  it('renders import/export controls', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByLabelText(/Import YouTube Analytics CSV/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Export Analytics Data/i)).toBeInTheDocument();
  });

  it('shows error feedback for invalid CSV', async () => {
    // Robust FileReader mock with onload setter/getter
    let onloadCallback: ((ev: any) => void) | null = null;
    class MockFileReader {
      public result: string | null = null;
      set onload(cb: ((ev: any) => void) | null) {
        onloadCallback = cb;
      }
      get onload() {
        return onloadCallback;
      }
      readAsText() {
        setTimeout(() => {
          if (onloadCallback) {
            onloadCallback({ target: { result: 'bad,data' } });
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader as any);

    render(<AnalyticsDashboard />);
    const input = screen.getByLabelText(/Import YouTube Analytics CSV/i);
    const file = new File(['bad,data'], 'bad.csv', { type: 'text/csv' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      // Wait for FileReader to trigger
      await new Promise(res => setTimeout(res, 10));
    });
    // Try both role and testid for error
    await waitFor(() => {
      try {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      } catch (e) {
        // Fallback to testid and log DOM for debugging
        // eslint-disable-next-line no-console
        console.log(screen.debug());
        expect(screen.getByTestId('csv-error')).toBeInTheDocument();
      }
    });
  });

  it('shows dynamic insights and recommendations', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText(/Key Insights/i)).toBeInTheDocument();
    expect(screen.getByText(/Actionable Recommendations/i)).toBeInTheDocument();
    // At least one insight and one recommendation should be present
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(1);
    // Explainability should be present (multiple explanations possible)
    expect(screen.getAllByText(/Explain:/i).length).toBeGreaterThan(0);
  });
});
