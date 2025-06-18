/**
 * CommunityTabPostGenerator.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Generate engaging YouTube Community Tab posts aligned with channel mission.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

// CommunityTabPostGenerator.tsx
import React, { useState } from 'react';
import Card from '../Card';
import Textarea from '../Textarea';
import Button from '../Button';
import Select from '../Select';
import AIActions from '../AIActions';

interface CommunityTabPostGeneratorProps {
  onGenerate: (prompt: string, type: string, options?: { tone: string; length: string; style: string }) => Promise<string[]>;
  isLoading: boolean;
  generatedPosts: string[];
}

const postTypeOptions = [
  { value: 'poll', label: 'Poll' },
  { value: 'text', label: 'Text Update' },
  { value: 'question', label: 'Question' },
  { value: 'behind_the_scenes', label: 'Behind-the-Scenes' },
];

const toneOptions = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'humorous', label: 'Humorous' },
];
const lengthOptions = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];
const styleOptions = [
  { value: 'informative', label: 'Informative' },
  { value: 'engaging', label: 'Engaging' },
  { value: 'conversational', label: 'Conversational' },
];

const CommunityTabPostGenerator: React.FC<CommunityTabPostGeneratorProps> = ({
  onGenerate,
  isLoading,
  generatedPosts,
}) => {
  const [topic, setTopic] = useState('');
  const [postType, setPostType] = useState(postTypeOptions[0].value);
  const [tone, setTone] = useState(toneOptions[0].value);
  const [length, setLength] = useState(lengthOptions[1].value);
  const [style, setStyle] = useState(styleOptions[0].value);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isCheckingDoctrine, setIsCheckingDoctrine] = useState(false);
  const [doctrinalResult, setDoctrinalResult] = useState<string | null>(null);
  const [selectedPostIdx, setSelectedPostIdx] = useState<number | null>(null);
  const [editedPosts, setEditedPosts] = useState<string[]>(generatedPosts);
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down' | null>>({});

  // Update editedPosts when generatedPosts changes
  React.useEffect(() => {
    setEditedPosts(generatedPosts);
  }, [generatedPosts]);

  const handleGenerateClick = () => {
    if (topic.trim()) {
      onGenerate(topic, postType, { tone, length, style });
    }
  };

  const handleEditChange = (idx: number, value: string) => {
    setEditedPosts((prev) => prev.map((p, i) => (i === idx ? value : p)));
  };

  const handleFeedback = (idx: number, value: 'up' | 'down') => {
    setFeedback((prev) => ({ ...prev, [idx]: prev[idx] === value ? null : value }));
  };

  // AI Summarization for a post
  const handleSummarize = async (post: string, idx: number) => {
    setIsSummarizing(true);
    setSummary(null);
    setSelectedPostIdx(idx);
    try {
      const { summarizeText } = await import('../../api/huggingface');
      const result = await summarizeText(post);
      setSummary(result);
    } catch (err) {
      setSummary('Summarization failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Magisterium AI doctrinal check for a post
  const handleDoctrineCheck = async (post: string, idx: number) => {
    setIsCheckingDoctrine(true);
    setDoctrinalResult(null);
    setSelectedPostIdx(idx);
    try {
      const { fetchMagisteriumAI } = await import('../../api/magisterium');
      const results = await fetchMagisteriumAI(post);
      setDoctrinalResult(results.length > 0 ? results.map(r => `• ${r.title}: ${r.snippet}`).join('\n\n') : 'No doctrinal issues or clarifications found.');
    } catch (err) {
      setDoctrinalResult('Doctrinal check failed: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
    } finally {
      setIsCheckingDoctrine(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Community Tab Post Generator </h2>
      <p className="text-gray-600 mb-6">
        Quickly draft engaging posts for your YouTube Community Tab based on your content.{' '}
        <span className="text-xs text-blue-700 font-semibold">
          (AI features are currently mocked; real AI integration coming soon.)
        </span>
      </p>

      <div className="space-y-4 mb-6">
        <Textarea
          label="Main Topic or Video Theme"
          placeholder="e.g., The Inculturation of the Gospel in Celtic Ireland, or Researching St. Augustine's City of God"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Select
          label="Type of Post"
          options={postTypeOptions}
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
        />
        <div className="flex gap-4">
          <Select
            label="Tone"
            options={toneOptions}
            value={tone}
            onChange={e => setTone(e.target.value)}
          />
          <Select
            label="Length"
            options={lengthOptions}
            value={length}
            onChange={e => setLength(e.target.value)}
          />
          <Select
            label="Style"
            options={styleOptions}
            value={style}
            onChange={e => setStyle(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleGenerateClick} disabled={isLoading || !topic.trim()}>
          {isLoading ? 'Loading...' : 'Generate Post Ideas'}
        </Button>
      </div>

      {generatedPosts.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Generated Post Options:</h3>
          <div className="space-y-4">
            {generatedPosts.map((post, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">AI-generated</span>
                </div>
                <Textarea
                  label={undefined}
                  value={editedPosts[index] ?? post}
                  onChange={e => handleEditChange(index, e.target.value)}
                  rows={3}
                  className="mb-2"
                  aria-label={`Edit generated post ${index + 1}`}
                />
                <div className="flex gap-2 mt-1 items-center">
                  <Button
                    variant={feedback[index] === 'up' ? 'primary' : 'outline'}
                    size="sm"
                    aria-label="Thumbs up"
                    onClick={() => handleFeedback(index, 'up')}
                  >👍</Button>
                  <Button
                    variant={feedback[index] === 'down' ? 'primary' : 'outline'}
                    size="sm"
                    aria-label="Thumbs down"
                    onClick={() => handleFeedback(index, 'down')}
                  >👎</Button>
                  <AIActions label="Summarize Post" onClick={() => handleSummarize(editedPosts[index] ?? post, index)} isLoading={isSummarizing && selectedPostIdx === index} />
                  <AIActions label="Check Doctrine" onClick={() => handleDoctrineCheck(editedPosts[index] ?? post, index)} isLoading={isCheckingDoctrine && selectedPostIdx === index} />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(editedPosts[index] ?? post)}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                {summary && selectedPostIdx === index && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="font-semibold text-blue-700 mb-1">AI Summary</h5>
                    <p className="text-blue-900 text-sm whitespace-pre-line">{summary}</p>
                  </div>
                )}
                {doctrinalResult && selectedPostIdx === index && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-semibold text-green-700 mb-1">Doctrinal Check</h5>
                    <p className="text-green-900 text-sm whitespace-pre-line">{doctrinalResult}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CommunityTabPostGenerator;