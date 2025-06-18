/**
 * ScriptEditor.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Draft, outline, and refine scripts with AI and fidelity checks.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Textarea from '../Textarea';
import Button from '../Button';
import Input from '../Input';
import Spinner from '../Spinner';
import { CheckSquare, Image, Search } from 'lucide-react'; // Assuming Lucide React is installed
import { exportScriptToXML, exportScriptToFCPXML } from './scriptExportHelpers';
import { summarizeText, semanticSearch } from '../../api/huggingface';
import { fetchMagisteriumAI } from '../../api/magisterium';
import AIActions from '../AIActions';

interface ScriptEditorProps {
  onGenerateOutline: (theme: string, length: string, style?: string, tone?: string, structure?: string, action?: 'regenerate' | 'expand') => Promise<string>;
  onCheckFidelity: (script: string) => Promise<string>;
  onSuggestVisuals: (script: string) => Promise<string[]>;
  isLoading: {
    outline: boolean;
    fidelity: boolean;
    visuals: boolean;
  };
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  onGenerateOutline,
  onCheckFidelity,
  onSuggestVisuals,
  isLoading,
}) => {
  const [scriptContent, setScriptContent] = useState('');
  const [outlineTheme, setOutlineTheme] = useState('');
  const [outlineLength, setOutlineLength] = useState('medium');
  const [outlineStyle, setOutlineStyle] = useState('bulleted');
  const [outlineTone, setOutlineTone] = useState('neutral');
  const [outlineStructure, setOutlineStructure] = useState('standard');
  const [fidelityCheckResult, setFidelityCheckResult] = useState<string | null>(null);
  const [visualSuggestions, setVisualSuggestions] = useState<string[]>([]);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // Undo/Redo stack
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Summarization state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Semantic search state
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<number[]>([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  // Magisterium AI doctrinal check state
  const [isCheckingDoctrine, setIsCheckingDoctrine] = useState(false);
  const [doctrinalResult, setDoctrinalResult] = useState<string | null>(null);

  // Iterative refinement: allow user to select a section and regenerate/expand it
  const [isRefining, setIsRefining] = useState(false);

  // Outline generation error state
  const [outlineError, setOutlineError] = useState<string | null>(null);

  // Push to undo stack on content change
  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUndoStack((prev) => [...prev, scriptContent]);
    setScriptContent(e.target.value);
    setRedoStack([]); // Clear redo stack on new input
  };

  const handleUndo = React.useCallback(() => {
    if (undoStack.length > 0) {
      const prev = undoStack[undoStack.length - 1];
      setRedoStack((r) => [scriptContent, ...r]);
      setScriptContent(prev);
      setUndoStack((u) => u.slice(0, -1));
    }
  }, [undoStack, scriptContent]);

  const handleRedo = React.useCallback(() => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setUndoStack((u) => [...u, scriptContent]);
      setScriptContent(next);
      setRedoStack((r) => r.slice(1));
    }
  }, [redoStack, scriptContent]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoStack, redoStack, scriptContent, handleUndo, handleRedo]);

  const handleGenerateOutline = async () => {
    setOutlineError(null);
    if (outlineTheme.trim()) {
      try {
        const outline = await onGenerateOutline(outlineTheme, outlineLength, outlineStyle, outlineTone, outlineStructure);
        setScriptContent(outline); // Populate editor with generated outline
      } catch (err) {
        setOutlineError('Outline generation failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
      }
    }
  };

  const handleCheckFidelity = async () => {
    if (scriptContent.trim()) {
      const result = await onCheckFidelity(scriptContent);
      setFidelityCheckResult(result);
    }
  };

  const handleSuggestVisuals = async () => {
    if (scriptContent.trim()) {
      const suggestions = await onSuggestVisuals(scriptContent);
      setVisualSuggestions(suggestions);
    }
  };

  // AI Summarization
  const handleSummarize = async () => {
    if (!scriptContent.trim()) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await summarizeText(scriptContent);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error && err.message.includes('API key')) {
        setSummary('Summarization failed: API key is missing or invalid. Please set your HuggingFace API key in the environment variables.');
      } else {
        setSummary('Summarization failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  // Semantic Search
  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim() || !scriptContent.trim()) return;
    setIsSemanticSearching(true);
    setSemanticError(null);
    setSemanticResults([]);
    try {
      const sentences = scriptContent.split(/(?<=[.!?])\s+/);
      const scores = await semanticSearch(semanticQuery, sentences);
      setSemanticResults(scores);
    } catch (err) {
      setSemanticError((err instanceof Error) ? err.message : 'Semantic search failed');
    } finally {
      setIsSemanticSearching(false);
    }
  };

  // Magisterium AI doctrinal check
  const handleDoctrineCheck = async () => {
    if (!scriptContent.trim()) return;
    setIsCheckingDoctrine(true);
    setDoctrinalResult(null);
    try {
      const results = await fetchMagisteriumAI(scriptContent);
      setDoctrinalResult(results.length > 0 ? results.map(r => `• ${r.title}: ${r.snippet}`).join('\n\n') : 'No doctrinal issues or clarifications found.');
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.toLowerCase().includes('api key') || err.message.toLowerCase().includes('not set'))
      ) {
        setDoctrinalResult('Doctrinal check failed: API key is missing or invalid. Please set your Magisterium AI API key in the environment variables.');
      } else if (
        err instanceof Error &&
        (err.message.toLowerCase().includes('api error') || err.message.toLowerCase().includes('fetch failed'))
      ) {
        setDoctrinalResult('Doctrinal check failed: Unable to reach Magisterium AI. Please check your network connection or try again later.');
      } else {
        setDoctrinalResult('Doctrinal check failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
      }
    } finally {
      setIsCheckingDoctrine(false);
    }
  };

  // Refinement handlers
  const handleRefineSection = async (sectionIdx: number, action: 'regenerate' | 'expand') => {
    setOutlineError(null);
    if (!scriptContent.trim()) return;
    setIsRefining(true);
    try {
      const sections = scriptContent.split(/\n(?=\d+\.|\*|#|-)/g); // crude split by outline markers
      const section = sections[sectionIdx] || '';
      // Call outline generator with context and action
      const refined = await onGenerateOutline(section, outlineLength, outlineStyle, outlineTone, outlineStructure, action);
      sections[sectionIdx] = refined;
      setScriptContent(sections.join('\n'));
    } catch (err) {
      setOutlineError('Outline refinement failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsRefining(false);
    }
  };

  // Formatting helpers
  const applyFormat = (before: string, after: string = before) => {
    const textarea = textareaRef;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = scriptContent.substring(start, end);
    const newText =
      scriptContent.substring(0, start) +
      before + selected + after +
      scriptContent.substring(end);
    setScriptContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Section helpers
  const insertSection = (type: 'scene' | 'timestamp' | 'speaker') => {
    let insertText = '';
    switch (type) {
      case 'scene':
        insertText = '\n\n# Scene Title\n';
        break;
      case 'timestamp':
        insertText = `\n\n[00:00] `;
        break;
      case 'speaker':
        insertText = '\n\nSPEAKER: ';
        break;
    }
    setScriptContent(scriptContent + insertText);
  };

  // Persistence helpers
  const STORAGE_KEY = 'svw-script-content';

  // Load script from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setScriptContent(saved);
  }, []);

  // Save script to localStorage
  const handleSaveScript = () => {
    localStorage.setItem(STORAGE_KEY, scriptContent);
  };

  // Load script from localStorage
  const handleLoadScript = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setScriptContent(saved);
  };

  // Export script as XML
  const handleExportXML = () => {
    const xml = exportScriptToXML(scriptContent);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.xml';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Export script as FCPXML (for DaVinci Resolve)
  const handleExportFCPXML = () => {
    const xml = exportScriptToFCPXML(scriptContent);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.fcpxml';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">The Writer's Room </h2>
      <p className="text-gray-600 mb-6">
        Craft your video scripts with AI assistance for outlines, and tools for theological fidelity and visual planning. 
      </p>

      {/* Formatting Toolbar */}
      <div className="flex space-x-2 mb-2" role="toolbar" aria-label="Formatting toolbar">
        <Button type="button" size="sm" variant="outline" onClick={() => applyFormat('**', '**')} tabIndex={0} aria-label="Bold (Ctrl+B)">Bold</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyFormat('*', '*')} tabIndex={0} aria-label="Italic (Ctrl+I)">Italic</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyFormat('# ', '')} tabIndex={0} aria-label="Heading">Heading</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyFormat('- ', '')} tabIndex={0} aria-label="List">List</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertSection('scene')} tabIndex={0} aria-label="Scene">Scene</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertSection('timestamp')} tabIndex={0} aria-label="Timestamp">Timestamp</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertSection('speaker')} tabIndex={0} aria-label="Speaker">Speaker</Button>
        <Button type="button" size="sm" variant="outline" onClick={handleUndo} tabIndex={0} aria-label="Undo (Ctrl+Z)">Undo</Button>
        <Button type="button" size="sm" variant="outline" onClick={handleRedo} tabIndex={0} aria-label="Redo (Ctrl+Y)">Redo</Button>
      </div>
      {/* Save/Load Controls */}
      <div className="flex space-x-2 mb-4">
        <Button type="button" size="sm" variant="secondary" onClick={handleSaveScript}>Save Script</Button>
        <Button type="button" size="sm" variant="outline" onClick={handleLoadScript}>Load Last Saved</Button>
      </div>
      {/* Export Controls */}
      <div className="flex space-x-2 mb-4">
        <Button type="button" size="sm" variant="primary" onClick={handleExportXML} disabled={!scriptContent.trim()}>
          Export as Simple XML
        </Button>
        <Button type="button" size="sm" variant="primary" onClick={handleExportFCPXML} disabled={!scriptContent.trim()}>
          Export as FCPXML (DaVinci)
        </Button>
      </div>
      {/* Script Editor */}
      <div className="mb-8 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Distraction-Free Script Editor </h3>
        <Textarea
          ref={setTextareaRef}
          placeholder="Start writing your script here..."
          value={scriptContent}
          onChange={handleScriptChange}
          rows={15}
          className="font-serif text-lg leading-relaxed"
        />
        <div className="text-right text-sm text-gray-500 mt-2">
          Word Count: {scriptContent.split(/\s+/).filter(Boolean).length}
        </div>
        <div className="flex gap-2 mt-4">
          <AIActions label="Summarize Script" onClick={handleSummarize} isLoading={isSummarizing} />
          <AIActions label="Check Doctrine" onClick={handleDoctrineCheck} isLoading={isCheckingDoctrine} />
        </div>
        {summary && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-700 mb-1">AI Summary</h4>
            <p className="text-blue-900 text-sm whitespace-pre-line">{summary}</p>
          </div>
        )}
        {doctrinalResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-700 mb-1">Doctrinal Check</h4>
            <p className="text-green-900 text-sm whitespace-pre-line">{doctrinalResult}</p>
          </div>
        )}
      </div>

      {/* AI-Powered Script Outlines */}
      <div className="mb-8 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <CheckSquare size={20} className="mr-2 text-blue-600" /> AI-Powered Script Outlines 
        </h3>
        <p className="text-gray-600 mb-4">
          Generate a concise, editable outline based on your video theme and desired length. 
        </p>
        <div className="flex space-x-4 mb-4">
          <div className="flex-grow">
            <Input
              label="Outline Theme"
              placeholder="e.g., The life of St. Patrick, Inculturation in the New World"
              value={outlineTheme}
              onChange={(e) => setOutlineTheme(e.target.value)}
            />
          </div>
          <div className="w-1/4">
            <select
              className="mt-6 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={outlineLength}
              onChange={(e) => setOutlineLength(e.target.value)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div className="w-1/4">
            <select
              className="mt-6 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={outlineStyle}
              onChange={(e) => setOutlineStyle(e.target.value)}
            >
              <option value="bulleted">Bulleted</option>
              <option value="numbered">Numbered</option>
              <option value="sectioned">Sectioned</option>
            </select>
          </div>
          <div className="w-1/4">
            <select
              className="mt-6 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={outlineTone}
              onChange={(e) => setOutlineTone(e.target.value)}
            >
              <option value="neutral">Neutral</option>
              <option value="inspirational">Inspirational</option>
              <option value="scholarly">Scholarly</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>
          <div className="w-1/4">
            <select
              className="mt-6 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={outlineStructure}
              onChange={(e) => setOutlineStructure(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="problem-solution">Problem/Solution</option>
              <option value="chronological">Chronological</option>
              <option value="thematic">Thematic</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerateOutline} disabled={isLoading.outline || !outlineTheme.trim()} className="w-full">
          {isLoading.outline ? <Spinner size="sm" color="text-white" /> : 'Generate Outline'}
        </Button>
        {outlineError && (
          <div className="text-red-600 mb-2" role="alert">
            <strong>Error:</strong> {outlineError}
          </div>
        )}
      </div>

      {/* Source & Fidelity Checker */}
      <div className="mb-8 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <CheckSquare size={20} className="mr-2 text-blue-600" /> Source & Fidelity Checker 
        </h3>
        <p className="text-gray-600 mb-4">
          Check your script for theological consistency and suggest relevant sources. 
        </p>
        <Button onClick={handleCheckFidelity} disabled={isLoading.fidelity || !scriptContent.trim()} className="w-full">
          {isLoading.fidelity ? <Spinner size="sm" color="text-white" /> : 'Check Script Fidelity'}
        </Button>
        {fidelityCheckResult && (
          <div className={`mt-4 p-3 rounded-md text-sm ${fidelityCheckResult.includes('discrepancy') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            <p className="font-semibold mb-1">Fidelity Check Result:</p>
            <p>{fidelityCheckResult}</p>
          </div>
        )}
      </div>

      {/* Visual Asset Suggestion Engine */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <Image size={20} className="mr-2 text-blue-600" /> Visual Asset Suggestion Engine 
        </h3>
        <p className="text-gray-600 mb-4">
          AI suggests relevant images, maps, and artifacts from integrated archives for your script. 
        </p>
        <Button onClick={handleSuggestVisuals} disabled={isLoading.visuals || !scriptContent.trim()} className="w-full">
          {isLoading.visuals ? <Spinner size="sm" color="text-white" /> : 'Suggest Visuals'}
        </Button>
        {visualSuggestions.length > 0 && (
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Suggested Visuals:</h4>
            <ul className="list-disc list-inside text-blue-700 text-sm">
              {visualSuggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Semantic Search UI */}
      <div className="mb-8 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <Search size={20} className="mr-2 text-blue-600" /> Semantic Search
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            label="Semantic Query"
            placeholder="e.g., Inculturation, evangelization, St. Patrick"
            value={semanticQuery}
            onChange={e => setSemanticQuery(e.target.value)}
          />
          <AIActions label="Semantic Search" onClick={handleSemanticSearch} isLoading={isSemanticSearching} />
        </div>
        {semanticError && <div className="text-red-600 mb-2">{semanticError}</div>}
        {semanticResults.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-700 mb-1">Most Relevant Sentences</h4>
            <ol className="list-decimal list-inside text-yellow-900 text-sm">
              {scriptContent.split(/(?<=[.!?])\s+/).map((sentence, i) => (
                <li key={i} className={semanticResults[i] > 0.5 ? 'font-bold' : ''}>{sentence}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Outline refinement UI */}
      {scriptContent && (
        <div className="mt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Refine Outline Sections</h4>
          <ol className="list-decimal list-inside">
            {scriptContent.split(/\n(?=\d+\.|\*|#)/g).map((section, idx) => (
              <li key={idx}>
                <div className="flex items-center gap-2">
                  <span>{section.trim()}</span>
                  <Button size="sm" onClick={() => handleRefineSection(idx, 'regenerate')} disabled={isRefining}>
                    {isRefining ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                  <Button size="sm" onClick={() => handleRefineSection(idx, 'expand')} disabled={isRefining}>
                    {isRefining ? 'Expanding...' : 'Expand'}
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
};

export default ScriptEditor;