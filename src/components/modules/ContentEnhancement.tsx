/**
 * ContentEnhancement.tsx
 *
 * Combines Visual Asset Suggestion Engine and Distribution tools for the Semina Verbi Workspace.
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Textarea from '../Textarea';
import Button from '../Button';
import Spinner from '../Spinner';
import Tabs from '../Tabs';
import { YoutubeIcon, LightbulbIcon } from 'lucide-react';
import { generateYouTubeSummary, generateYouTubeTitle, generateYouTubeTags, generateCommunityPost } from '../../api/distribution';

const ContentEnhancement: React.FC = () => {
  // Visual Asset Suggestion state
  const [scriptInput, setScriptInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Distribution (Summary, Title, Tags, Community Post) state
  const [summaryOutput, setSummaryOutput] = useState('');
  const [titleOutput, setTitleOutput] = useState('');
  const [tagsOutput, setTagsOutput] = useState('');
  const [communityPostOutput, setCommunityPostOutput] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [distError, setDistError] = useState<string | null>(null);

  // Mock visual asset suggestion
  const handleSuggestClick = async () => {
    if (scriptInput.trim()) {
      setIsSuggesting(true);
      setTimeout(() => {
        setSuggestions([
          'Image: 16th-century Jesuit missionary map of China',
          'Artifact: Ancient Chinese cross',
          'Map: Silk Road trade routes',
        ]);
        setIsSuggesting(false);
      }, 1200);
    }
  };

  // Real summary generation
  const handleGenerateSummary = async () => {
    setIsDistributing(true);
    setDistError(null);
    try {
      const summary = await generateYouTubeSummary(scriptInput);
      setSummaryOutput(summary);
    } catch (e) {
      setDistError('Failed to generate summary: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
    } finally {
      setIsDistributing(false);
    }
  };
  // Real title generation
  const handleGenerateTitle = async () => {
    setIsDistributing(true);
    setDistError(null);
    try {
      const title = await generateYouTubeTitle(scriptInput);
      setTitleOutput(title);
    } catch (e) {
      setDistError('Failed to generate title: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
    } finally {
      setIsDistributing(false);
    }
  };
  // Real tags generation
  const handleGenerateTags = async () => {
    setIsDistributing(true);
    setDistError(null);
    try {
      const tags = await generateYouTubeTags(scriptInput);
      setTagsOutput(tags);
    } catch (e) {
      setDistError('Failed to generate tags: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
    } finally {
      setIsDistributing(false);
    }
  };
  // Real community post generation
  const handleGenerateCommunityPost = async () => {
    setIsDistributing(true);
    setDistError(null);
    try {
      const post = await generateCommunityPost(scriptInput);
      setCommunityPostOutput(post);
    } catch (e) {
      setDistError('Failed to generate community post: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
    } finally {
      setIsDistributing(false);
    }
  };
  // Export/copy handlers
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
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Enhancement</h2>
      <Tabs
        tabs={[
          {
            label: 'Visual Asset Suggestions',
            content: (
              <div>
                <p className="text-gray-600 mb-6">
                  AI will analyze your script content and suggest relevant images, maps, and artifacts from integrated archives.
                </p>
                <Textarea
                  label="Script Content"
                  placeholder="Paste the relevant section of your script here to get visual suggestions..."
                  value={scriptInput}
                  onChange={e => setScriptInput(e.target.value)}
                  rows={8}
                />
                <div className="flex justify-end mb-6">
                  <Button onClick={handleSuggestClick} disabled={isSuggesting || !scriptInput.trim()}>
                    {isSuggesting ? <Spinner size="sm" color="text-white" /> : 'Suggest Visual Assets'}
                  </Button>
                </div>
                {suggestions.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Suggested Visuals:</h3>
                    <ul className="list-disc pl-6">
                      {suggestions.map((s, i) => (
                        <li key={i} className="text-gray-700 text-sm mb-1">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: 'Distribution Tools',
            content: (
              <div>
                <p className="text-gray-600 mb-6">
                  Manage and automate content distribution, including YouTube summaries and community posts.
                </p>
                {distError && (
                  <div className="text-red-600 mb-2" role="alert">
                    {distError}
                    {distError.toLowerCase().includes('api key not set') && (
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
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button onClick={handleGenerateSummary} disabled={isDistributing || !scriptInput.trim()} className="mr-2">
                    {isDistributing ? <Spinner size="sm" color="text-white" /> : <><YoutubeIcon size={18} className="mr-2" />Generate YouTube Summary</>}
                  </Button>
                  <Button onClick={handleGenerateTitle} disabled={isDistributing || !scriptInput.trim()} className="mr-2">
                    {isDistributing ? <Spinner size="sm" color="text-white" /> : 'Generate Title'}
                  </Button>
                  <Button onClick={handleGenerateTags} disabled={isDistributing || !scriptInput.trim()} className="mr-2">
                    {isDistributing ? <Spinner size="sm" color="text-white" /> : 'Generate Tags'}
                  </Button>
                  <Button onClick={handleGenerateCommunityPost} disabled={isDistributing || !scriptInput.trim()}>
                    {isDistributing ? <Spinner size="sm" color="text-white" /> : <><LightbulbIcon size={18} className="mr-2" />Generate Community Post</>}
                  </Button>
                </div>
                <Textarea
                  label="Script Content"
                  placeholder="Paste the relevant section of your script here to get visual suggestions..."
                  value={scriptInput}
                  onChange={e => setScriptInput(e.target.value)}
                  rows={8}
                />
                {titleOutput && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">YouTube Title:</h4>
                    <Textarea value={titleOutput} readOnly rows={2} />
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(titleOutput)} aria-label="Copy Title">Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(titleOutput, 'title.txt')} aria-label="Export Title">Export</Button>
                    </div>
                  </div>
                )}
                {summaryOutput && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">YouTube Summary:</h4>
                    <Textarea value={summaryOutput} readOnly rows={4} />
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(summaryOutput)} aria-label="Copy Summary">Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(summaryOutput, 'summary.txt')} aria-label="Export Summary">Export</Button>
                    </div>
                  </div>
                )}
                {tagsOutput && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">YouTube Tags:</h4>
                    <Textarea value={tagsOutput} readOnly rows={2} />
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(tagsOutput)} aria-label="Copy Tags">Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(tagsOutput, 'tags.txt')} aria-label="Export Tags">Export</Button>
                    </div>
                  </div>
                )}
                {communityPostOutput && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Community Tab Post:</h4>
                    <Textarea value={communityPostOutput} readOnly rows={4} />
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(communityPostOutput)} aria-label="Copy Community Post">Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport(communityPostOutput, 'community-post.txt')} aria-label="Export Community Post">Export</Button>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        initialActiveTab={0}
        className="mb-6"
      />
    </Card>
  );
};

export default ContentEnhancement;
