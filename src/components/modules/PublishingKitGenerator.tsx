/**
 * PublishingKitGenerator.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Generate YouTube titles, descriptions, and tags from scripts and themes.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { generateYouTubeTitle, generateYouTubeSummary, generateYouTubeTags } from '../../api/distribution';

const PublishingKitGenerator: React.FC = () => {
  const [scriptInput, setScriptInput] = useState('');
  const [themesInput, setThemesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    description: string;
    tags: string[];
  } | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');

  React.useEffect(() => {
    setEditedTitle(generatedContent?.title ?? '');
    setEditedDescription(generatedContent?.description ?? '');
  }, [generatedContent]);

  const handleGenerateClick = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const input = `${scriptInput}\n${themesInput}`.trim();
      const [title, description, tags] = await Promise.all([
        generateYouTubeTitle(input),
        generateYouTubeSummary(input),
        generateYouTubeTags(input).then(t => t.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)),
      ]);
      setGeneratedContent({ title, description, tags });
    } catch (e) {
      setError((e instanceof Error) ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);
  const handleExport = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Automated YouTube Publishing Kit </h2>
      <p className="text-gray-600 mb-6">
        Generate compelling video titles, descriptions, and relevant tags for YouTube directly from your script.
      </p>
      {error && (
        <div className="text-red-600 mb-2" role="alert">
          {error}
          {error.toLowerCase().includes('api key not set') && (
            <div className="mt-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
              <strong>How to fix:</strong> Set your HuggingFace API key in a <code>.env</code> file as <code>VITE_HF_API_KEY=your_key_here</code> and restart the app.<br />
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-800"
              >
                Get your HuggingFace API key
              </a>
            </div>
          )}
        </div>
      )}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1" htmlFor="scriptContent">Video Script Content (Optional, for context)</label>
          <textarea
            id="scriptContent"
            placeholder="Paste your full script here for best results..."
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            rows={6}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1" htmlFor="keyThemes">Key Themes / Keywords</label>
          <input
            id="keyThemes"
            type="text"
            placeholder="e.g., Inculturation, St. Augustine, City of God, Early Church, Providence"
            value={themesInput}
            onChange={(e) => setThemesInput(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleGenerateClick} disabled={isLoading || (!scriptInput.trim() && !themesInput.trim())}>
          {isLoading ? 'Generating...' : 'Generate Publishing Kit'}
        </Button>
      </div>
      {generatedContent && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Generated Content:</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800">Title:</h4>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">AI-generated</span>
              </div>
              <input
                className="w-full p-2 border border-gray-300 rounded mb-2"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                aria-label="Edit generated title"
              />
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleCopy(editedTitle)}>Copy Title</Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport(editedTitle, 'title.txt')}>Export Title</Button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-800">Description:</h4>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">AI-generated</span>
              </div>
              <textarea
                className="w-full p-2 border border-gray-300 rounded mb-2"
                value={editedDescription}
                onChange={e => setEditedDescription(e.target.value)}
                rows={4}
                aria-label="Edit generated description"
              />
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleCopy(editedDescription)}>Copy Description</Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport(editedDescription, 'description.txt')}>Export Description</Button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-1">Tags:</h4>
              <p className="text-gray-700">{generatedContent.tags.join(', ')}</p>
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleCopy(generatedContent.tags.join(', '))}>Copy Tags</Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport(generatedContent.tags.join(', '), 'tags.txt')}>Export Tags</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PublishingKitGenerator;