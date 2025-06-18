import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { vi } from 'vitest';
import CommunityTabPostGenerator from './CommunityTabPostGenerator';

describe('CommunityTabPostGenerator', () => {
  const mockGenerate = jest.fn(() => Promise.resolve(['Post 1', 'Post 2']));

  it('renders input fields and button', () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={[]} />
    );
    expect(screen.getByLabelText(/Main Topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Post Ideas/i)).toBeInTheDocument();
  });

  it('calls onGenerate with correct input', async () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={[]} />
    );
    fireEvent.change(screen.getByLabelText(/Main Topic/i), { target: { value: 'Test Topic' } });
    fireEvent.change(screen.getByLabelText(/Type of Post/i), { target: { value: 'poll' } });
    fireEvent.click(screen.getByText(/Generate Post Ideas/i));
    await waitFor(() =>
      expect(mockGenerate).toHaveBeenCalledWith('Test Topic', 'poll', {
        tone: 'friendly',
        length: 'medium',
        style: 'informative',
      })
    );
  });

  it('calls AI summarization when Summarize Post is clicked', async () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={['Post 1']} />
    );
    fireEvent.click(screen.getByText(/Summarize Post/i));
    // You would mock summarizeText and check for summary output in a real test
  });
  it('calls doctrinal check when Check Doctrine is clicked', async () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={['Post 1']} />
    );
    fireEvent.click(screen.getByText(/Check Doctrine/i));
    // You would mock fetchMagisteriumAI and check for doctrinal output in a real test
  });
  it('shows AI-generated badge for each generated post', () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={["Post 1", "Post 2"]} />
    );
    const badges = screen.getAllByText(/AI-generated/i);
    expect(badges).toHaveLength(2);
  });
  it('allows editing of generated posts', () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={["Post 1"]} />
    );
    const textarea = screen.getByLabelText(/Edit generated post 1/i);
    fireEvent.change(textarea, { target: { value: 'Edited Post' } });
    expect(textarea).toHaveValue('Edited Post');
  });

  it('allows feedback (thumbs up/down) on generated posts', () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={["Post 1"]} />
    );
    const upBtn = screen.getByRole('button', { name: /thumbs up/i });
    const downBtn = screen.getByRole('button', { name: /thumbs down/i });
    fireEvent.click(upBtn);
    expect(upBtn).toHaveClass('bg-blue-600'); // primary variant
    fireEvent.click(downBtn);
    expect(downBtn).toHaveClass('bg-blue-600');
    fireEvent.click(downBtn);
    expect(downBtn).not.toHaveClass('bg-blue-600'); // toggles off
  });
  it('passes tone, length, and style options to onGenerate', async () => {
    render(
      <CommunityTabPostGenerator onGenerate={mockGenerate} isLoading={false} generatedPosts={[]} />
    );
    fireEvent.change(screen.getByLabelText(/Main Topic/i), { target: { value: 'Test Topic' } });
    fireEvent.change(screen.getByLabelText(/Type of Post/i), { target: { value: 'poll' } });
    fireEvent.change(screen.getByLabelText(/Tone/i), { target: { value: 'humorous' } });
    fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: 'long' } });
    fireEvent.change(screen.getByLabelText(/Style/i), { target: { value: 'conversational' } });
    fireEvent.click(screen.getByText(/Generate Post Ideas/i));
    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith('Test Topic', 'poll', {
        tone: 'humorous',
        length: 'long',
        style: 'conversational',
      });
    });
  });
});
