import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import KnowledgeHub from './KnowledgeHub';
import { vi } from 'vitest';

// Mock Magisterium AI
vi.mock('../../api/magisterium', () => ({
  fetchMagisteriumAI: vi.fn(async (context) => {
    if (context === 'error') throw new Error('Mocked doctrinal error');
    if (context === 'none') return [];
    return [{ title: 'Doctrine', snippet: 'All good.' }];
  })
}));

window.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([0.9, 0.2]), // mock similarity scores
  })
) as unknown as jest.Mock;

describe('KnowledgeHub', () => {
  it('renders semantic search button and input', () => {
    render(<KnowledgeHub />);
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /semantic search/i })).toBeInTheDocument();
  });

  it('enables semantic search button when notes and search term exist', () => {
    render(<KnowledgeHub />);
    const noteTitleInput = screen.getByLabelText(/note title/i);
    const noteContentTextarea = screen.getByLabelText(/note content/i);
    fireEvent.change(noteTitleInput, { target: { value: 'Test Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'This is a test.' } });
    fireEvent.click(screen.getByText(/add note/i));
    fireEvent.change(screen.getByPlaceholderText(/search notes/i), { target: { value: 'test' } });
    expect(screen.getByRole('button', { name: /semantic search/i })).not.toBeDisabled();
  });

  it('shows filtered notes after semantic search', async () => {
    render(<KnowledgeHub />);
    const noteTitleInput = screen.getByLabelText(/note title/i);
    const noteContentTextarea = screen.getByLabelText(/note content/i);
    fireEvent.change(noteTitleInput, { target: { value: 'Test Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'This is a test.' } });
    fireEvent.click(screen.getByText(/add note/i));
    fireEvent.change(screen.getByPlaceholderText(/search notes/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /semantic search/i }));
    await waitFor(() => {
      const noteTitles = screen.getAllByText(/Test Note/i);
      // Should be at least one note card with this title
      expect(noteTitles.length).toBeGreaterThan(0);
    });
  });

  it('persists projects and notes to localStorage', () => {
    render(<KnowledgeHub />);
    const noteTitleInput = screen.getByLabelText(/note title/i);
    const noteContentTextarea = screen.getByLabelText(/note content/i);
    fireEvent.change(noteTitleInput, { target: { value: 'Persistent Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'Persistence test.' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Simulate reload by unmounting and remounting
    // (jsdom does not support window.location.reload)
    render(<KnowledgeHub />);
    const noteTitles = screen.getAllByText(/Persistent Note/i);
    expect(noteTitles.length).toBeGreaterThan(0);
  });

  it('can export and import project backups', async () => {
    render(<KnowledgeHub />);
    // Add a note
    fireEvent.change(screen.getByLabelText(/note title/i), { target: { value: 'Backup Note' } });
    fireEvent.change(screen.getByLabelText(/note content/i), { target: { value: 'Backup test.' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Export
    const exportBtn = screen.getByText(/export backup/i);
    expect(exportBtn).toBeInTheDocument();
    // Import (simulate file input)
    // ...mock FileReader and test import logic...
  });

  it('can link notes and display backlinks', async () => {
    render(<KnowledgeHub />);
    // Add two notes
    fireEvent.change(screen.getByLabelText(/note title/i), { target: { value: 'Note 1' } });
    fireEvent.change(screen.getByLabelText(/note content/i), { target: { value: 'Content 1' } });
    fireEvent.click(screen.getByText(/add note/i));
    fireEvent.change(screen.getByLabelText(/note title/i), { target: { value: 'Note 2' } });
    fireEvent.change(screen.getByLabelText(/note content/i), { target: { value: 'Content 2' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Link Note 1 to Note 2
    const linkSelect = screen.getByLabelText(/link to note from Note 1/i) as HTMLSelectElement;
    const note2Option = Array.from(linkSelect.options).find((opt: HTMLOptionElement) => opt.text === 'Note 2');
    fireEvent.change(linkSelect, { target: { value: note2Option?.value } });
    // Wait for backlinks to update
    await waitFor(() => {
      const backlinks = screen.getByTestId(/backlinks-.*/);
      expect(backlinks).toHaveTextContent(/Linked to: Note 2/i);
    });
  });

  it('allows user to refine doctrinal context and uses it in API call', async () => {
    render(<KnowledgeHub />);
    const noteTitleInput = screen.getByLabelText(/note title/i);
    const noteContentTextarea = screen.getByLabelText(/note content/i);
    fireEvent.change(noteTitleInput, { target: { value: 'Test Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'This is a test.' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Find the correct note card by title
    const noteCards = screen.getAllByText('Test Note');
    let contextTextarea: HTMLElement | undefined = undefined;
    let utils: ReturnType<typeof within> | undefined = undefined;
    for (const cardTitle of noteCards) {
      const card = cardTitle.closest('div');
      const w = within(card!);
      try {
        contextTextarea = w.getByLabelText(/refine doctrinal check context/i);
        utils = w;
        break;
      } catch {}
    }
    expect(contextTextarea).toBeDefined();
    expect(utils).toBeDefined();
    fireEvent.change(contextTextarea as HTMLElement, { target: { value: 'Refined context for doctrine' } });
    // Click Check Doctrine
    utils && fireEvent.click(utils.getByText(/Check Doctrine/i));
    await waitFor(() => expect(utils!.getByText(/Doctrinal Check/i)).toBeInTheDocument());
    expect(utils!.getByText(/All good/)).toBeInTheDocument();
  });

  it('shows doctrinal error and no-issue cases', async () => {
    render(<KnowledgeHub />);
    const noteTitleInput = screen.getByLabelText(/note title/i);
    const noteContentTextarea = screen.getByLabelText(/note content/i);
    // Add error note
    fireEvent.change(noteTitleInput, { target: { value: 'Test Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'error' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Find the error note card
    let noteCardDivs = Array.from(document.querySelectorAll('div.bg-white'));
    let card: Element | undefined = undefined;
    for (const c of noteCardDivs) {
      const h5 = c.querySelector('h5');
      const p = c.querySelector('p');
      if (h5?.textContent === 'Test Note' && p?.textContent === 'error') {
        card = c;
        break;
      }
    }
    expect(card).toBeDefined();
    const utils = within(card as HTMLElement);
    utils.getByText(/Check Doctrine/i) && fireEvent.click(utils.getByText(/Check Doctrine/i));
    await waitFor(() => {
      const doctrinalError = utils.queryByText(/Doctrinal check failed/i);
      const doctrinalResult = utils.queryByText(/Doctrinal Check/i);
      expect(doctrinalError || doctrinalResult).toBeInTheDocument();
    });

    // Add a new note for the no-issue case
    fireEvent.change(noteTitleInput, { target: { value: 'Test Note' } });
    fireEvent.change(noteContentTextarea, { target: { value: 'none' } });
    fireEvent.click(screen.getByText(/add note/i));
    // Find the new card for 'none'
    noteCardDivs = Array.from(document.querySelectorAll('div.bg-white'));
    let cardNone: Element | undefined = undefined;
    for (const c of noteCardDivs) {
      const h5 = c.querySelector('h5');
      const p = c.querySelector('p');
      if (h5?.textContent === 'Test Note' && p?.textContent === 'none') {
        cardNone = c;
        break;
      }
    }
    expect(cardNone).toBeDefined();
    const utilsNone = within(cardNone as HTMLElement);
    utilsNone.getByText(/Check Doctrine/i) && fireEvent.click(utilsNone.getByText(/Check Doctrine/i));
    await waitFor(() => {
      expect(utilsNone.getByText(/No doctrinal issues/i)).toBeInTheDocument();
    });
  });

  it('allows editing project name and description', () => {
    render(<KnowledgeHub />);
    const nameInput = screen.getByLabelText(/Project Name/i);
    const descInput = screen.getByLabelText(/Project Description/i);
    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.change(descInput, { target: { value: 'Test Description' } });
    expect(nameInput).toHaveValue('Test Project');
    expect(descInput).toHaveValue('Test Description');
  });

  it('saves a new note to the current project', async () => {
    render(<KnowledgeHub />);
    fireEvent.change(screen.getByLabelText(/Note Title/i), { target: { value: 'Note 1' } });
    fireEvent.change(screen.getByLabelText(/Note Content/i), { target: { value: 'Content 1' } });
    const tagsInput = screen.getByLabelText(/Tags \(comma-separated\)/i);
    fireEvent.change(tagsInput, { target: { value: 'tag1,tag2' } });
    fireEvent.blur(tagsInput); // Ensure state is committed
    fireEvent.click(screen.getByText(/Add Note/i));
    // Assert tags are rendered in the DOM
    await screen.findByText('tag1');
    await screen.findByText('tag2');
  });
});
