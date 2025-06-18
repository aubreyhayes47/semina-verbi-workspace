/**
 * KnowledgeHub.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Organize research, notes, and projects for YouTube content creation.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 *
 * Future AI Integration: Semantic search and external research APIs will be integrated in a future version. See TASKS.md.
 */

import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { semanticSearch } from '../../api/huggingface';
import { summarizeText } from '../../api/huggingface';
import { fetchMagisteriumAI } from '../../api/magisterium';
import { PlusCircle, Search, FileText, Globe } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  backlinks?: string[]; // IDs of related notes
}

interface Project {
  id: string;
  name: string;
  description: string;
  notes: Note[];
}

const STORAGE_KEY = 'svw-knowledge-projects';

const KnowledgeHub: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('proj1');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticResults, setSemanticResults] = useState<string[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isCheckingDoctrine, setIsCheckingDoctrine] = useState(false);
  const [doctrinalResult, setDoctrinalResult] = useState<string | null>(null);

  // Add state for user-refined doctrinal context per note
  const [doctrinalContexts, setDoctrinalContexts] = useState<Record<string, string>>({});

  // Load projects from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      if (parsed.length > 0) setCurrentProjectId(parsed[0].id);
    } else {
      setProjects([
        {
          id: 'proj1',
          name: 'Untitled Project',
          description: 'A new project for your research.',
          notes: [],
        },
      ]);
    }
  }, []);

  // Save projects to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Helper to get/set current project
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || { id: '', name: '', description: '', notes: [] };
  // Helper to update current project
  const updateCurrentProject = (updated: Project) => {
    setProjects(projects => projects.map(p => p.id === updated.id ? { ...p, ...updated } : p));
  };

  // Add note logic (fix persistence)
  const addNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      // eslint-disable-next-line no-console
      console.log('DEBUG: newNoteTags at addNote:', newNoteTags);
      const newNote: Note = {
        id: `note${Date.now()}`,
        title: newNoteTitle,
        content: newNoteContent,
        tags: newNoteTags.split(',').map(t => t.trim()).filter(Boolean),
        backlinks: [],
      };
      updateCurrentProject({
        ...currentProject,
        notes: [...currentProject.notes, newNote],
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteTags('');
    }
  };

  const handleSemanticSearch = async () => {
    setIsSemanticSearching(true);
    setSemanticError(null);
    try {
      // Pass array of note contents to semanticSearch
      const noteContents = currentProject.notes.map(n => n.content);
      const scores = await semanticSearch(searchTerm, noteContents);
      // Map scores to note indices, sort, and get corresponding note IDs
      const sorted = scores
        .map((score, i) => ({ id: currentProject.notes[i].id, score }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.id);
      setSemanticResults(sorted);
    } catch (err) {
      setSemanticError((err instanceof Error) ? err.message : 'Semantic search failed');
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleSummarizeNote = async (note: Note) => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await summarizeText(note.content);
      setSummary(result);
    } catch (err) {
      setSummary('Summarization failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Update doctrinal context for a note
  const handleContextChange = (noteId: string, value: string) => {
    setDoctrinalContexts(prev => ({ ...prev, [noteId]: value }));
  };

  const handleDoctrineCheckNote = async (note: Note) => {
    setIsCheckingDoctrine(true);
    setDoctrinalResult(null);
    try {
      // Use user-refined context if present, else note.content
      const context = doctrinalContexts[note.id] || note.content;
      const results = await fetchMagisteriumAI(context);
      setDoctrinalResult(results.length > 0 ? results.map(r => `• ${r.title}: ${r.snippet}`).join('\n\n') : 'No doctrinal issues or clarifications found.');
    } catch (err) {
      setDoctrinalResult('Doctrinal check failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsCheckingDoctrine(false);
    }
  };

  const addBacklink = (fromId: string, toId: string) => {
    const fromProject = { ...currentProject };
    const noteIdx = fromProject.notes.findIndex(n => n.id === fromId);
    if (noteIdx !== -1) {
      const note = { ...fromProject.notes[noteIdx] };
      note.backlinks = Array.from(new Set([...(note.backlinks || []), toId]));
      fromProject.notes[noteIdx] = note;
      updateCurrentProject(fromProject);
    }
  };

  const allNotes = projects.flatMap(p => p.notes.map(n => ({ ...n, project: p })));
  const filteredNotes = (semanticResults.length > 0 && searchTerm.trim())
    ? allNotes.filter(note => semanticResults.includes(note.id))
    : allNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Research & Knowledge Hub </h2>
      <p className="text-gray-600 mb-6">
        Manage your project ideas, notes, and integrate research from various sources. 
      </p>

      {/* Project Details */}
      <div className="mb-8 border-b pb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Current Project: {currentProject.name}</h3>
        <Input
          label="Project Name"
          value={currentProject.name}
          onChange={(e) => updateCurrentProject({ ...currentProject, name: e.target.value })}
        />
        <Input
          label="Project Description"
          value={currentProject.description}
          onChange={(e) => updateCurrentProject({ ...currentProject, description: e.target.value })}
        />
      </div>

      {/* Project switcher UI */}
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="project-switcher" className="text-sm font-medium text-gray-700">Project:</label>
        <select
          id="project-switcher"
          value={currentProjectId}
          onChange={e => setCurrentProjectId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => {
          const newId = `proj${Date.now()}`;
          const newProj: Project = { id: newId, name: 'Untitled Project', description: '', notes: [] };
          setProjects([...projects, newProj]);
          setCurrentProjectId(newId);
        }}>+ New Project</Button>
        {projects.length > 1 && (
          <Button size="sm" variant="secondary" style={{ color: 'red' }} onClick={() => {
            if (window.confirm('Delete this project?')) {
              const newProjects = projects.filter(p => p.id !== currentProjectId);
              setProjects(newProjects);
              setCurrentProjectId(newProjects[0]?.id || '');
            }
          }}>Delete</Button>
        )}
      </div>

      {/* Backup & Import */}
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => {
          // Export all projects as JSON
          const data = JSON.stringify(projects, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'knowledge-projects-backup.json';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }}>Export Backup</Button>
        <label className="inline-block cursor-pointer">
          <span className="px-2 py-1 bg-gray-200 rounded text-sm">Import Backup</span>
          <input
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = evt => {
                try {
                  const imported = JSON.parse(evt.target?.result as string);
                  if (Array.isArray(imported)) {
                    setProjects(imported);
                    setCurrentProjectId(imported[0]?.id || '');
                  } else {
                    alert('Invalid backup file.');
                  }
                } catch {
                  alert('Failed to import backup.');
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </div>

      {/* Note-Taking System */}
      <div className="mb-8 border-b pb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <FileText size={20} className="mr-2 text-blue-600" /> Integrated Note-Taking System
        </h3>
        <div className="space-y-4">
          <Input
            label="Note Title"
            placeholder="e.g., St. Justin Martyr & Semina Verbi"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <Input
            label="Note Content"
            placeholder="Write your detailed notes here..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <Input
            label="Tags (comma-separated)"
            placeholder="e.g., patristics, inculturation, early church"
            value={newNoteTags}
            onChange={(e) => setNewNoteTags(e.target.value)}
          />
          <Button onClick={addNote} disabled={!newNoteTitle.trim() || !newNoteContent.trim()} className="w-full">
            <PlusCircle size={18} className="mr-2" /> Add Note
          </Button>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">All Notes ({allNotes.length})</h4>
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Search notes by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />} // Assuming icon prop is handled by Input
            />
            <Button onClick={handleSemanticSearch} disabled={!searchTerm.trim() || currentProject.notes.length === 0 || isSemanticSearching} aria-label="Semantic Search">
              {isSemanticSearching ? 'Searching...' : 'Semantic Search'}
            </Button>
          </div>
          {semanticError && <div className="text-red-600 mb-2">{semanticError}</div>}
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-500 text-sm">No notes found. Add some or adjust your search.</p>
            ) : (
              filteredNotes.map((note) => {
                return (
                  <div key={note.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <h5 className="font-semibold text-gray-800">{note.title}</h5>
                    <p className="text-gray-600 text-sm line-clamp-2">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {note.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => handleSummarizeNote(note)} disabled={isSummarizing} className="flex-1">
                        {isSummarizing ? 'Summarizing...' : 'Summarize Note'}
                      </Button>
                      <Button onClick={() => handleDoctrineCheckNote(note)} disabled={isCheckingDoctrine} className="flex-1">
                        {isCheckingDoctrine ? 'Checking...' : 'Check Doctrine'}
                      </Button>
                    </div>
                    {summary && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="font-semibold text-blue-700 mb-1">AI Summary</h5>
                        <p className="text-blue-900 text-sm whitespace-pre-line">{summary}</p>
                      </div>
                    )}
                    {/* User refinement for doctrinal context */}
                    <div className="mt-2">
                      <label htmlFor={`doctrinal-context-${note.id}`} className="text-xs font-semibold text-green-700">Refine doctrinal check context (optional):</label>
                      <textarea
                        id={`doctrinal-context-${note.id}`}
                        className="w-full p-2 border border-green-200 rounded mt-1 text-xs"
                        placeholder="Add or edit the context/question for doctrinal review..."
                        value={doctrinalContexts[note.id] ?? note.content}
                        onChange={e => handleContextChange(note.id, e.target.value)}
                        rows={2}
                        aria-label="Refine doctrinal check context"
                      />
                    </div>
                    {doctrinalResult && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <h5 className="font-semibold text-green-700 mb-1">Doctrinal Check <span className="text-xs text-blue-700 font-semibold">(AI-assisted)</span></h5>
                        <p className="text-green-900 text-sm whitespace-pre-line">{doctrinalResult}</p>
                      </div>
                    )}
                    {/* In the note UI, add a button to link to another note */}
                    {filteredNotes.length > 1 && (
                      <div className="flex gap-2 mt-2">
                        <label htmlFor={`link-note-select-${note.id}`} className="text-sm">Link to:</label>
                        <select id={`link-note-select-${note.id}`} aria-label={`Link to note from ${note.title}`} onChange={e => addBacklink(note.id, e.target.value)}>
                          <option value="">Select note...</option>
                          {filteredNotes.filter(n => n.id !== note.id).map(n => (
                            <option key={n.id} value={n.id}>{n.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Show backlinks in note UI */}
                    {note.backlinks && note.backlinks.length > 0 && (
                      <div className="mt-2 text-xs text-blue-700" data-testid={`backlinks-${note.id}`}>Linked to: {note.backlinks.map(id => {
                        const linked = currentProject.notes.find(n => n.id === id);
                        return linked ? linked.title : id;
                      }).join(', ')}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Federated Research Engine Placeholder */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <Globe size={20} className="mr-2 text-blue-600" /> Federated Research Engine 
        </h3>
        <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-sm">
          <p className="mb-2">
            This section will integrate search capabilities across historical archives (like DPLA)  and conceptual "Magisterium AI" data. 
          </p>
          <p className="font-semibold">
            Search functionality and dynamic results from external APIs are coming in Version 1.1! 
          </p>
        </div>
      </div>
    </Card>
  );
};

export default KnowledgeHub;