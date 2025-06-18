/**
 * AITransparency.tsx
 *
 * Combines AI transparency disclosure generation and feature tracking for the Semina Verbi Workspace.
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState, useCallback } from 'react';
import Card from '../Card';
import Checkbox from '../Checkbox';
import Textarea from '../Textarea';
import Button from '../Button';
import { Lightbulb, Copy } from 'lucide-react';

const aiFeatures = [
  { id: 'outline', label: 'AI-Powered Script Outlines' },
  { id: 'fidelity-check', label: 'Source & Fidelity Checker' },
  { id: 'visual-suggestions', label: 'Visual Asset Suggestion Engine' },
  { id: 'transcription', label: 'Automated Transcription' },
  { id: 'publishing-kit', label: 'Automated Publishing Kit (Title, Description, Tags)' },
  { id: 'short-form-content', label: 'Short-Form Content Identification' },
  { id: 'timeline-generation', label: 'Historical Event Timeline Generation' },
  { id: 'seedOfTheWord', label: 'Seeds of the Word Concepts' },
  { id: 'summaryGenerator', label: 'Video Summary/Description' },
  { id: 'communityPostGenerator', label: 'Community Tab Posts' },
  { id: 'scriptOutline', label: 'Script Outline Generation' },
  { id: 'visualSuggestion', label: 'Visual Asset Suggestions' },
];

const featureDescriptions: { [key: string]: string } = {
  outline: 'Script outline generation.',
  'fidelity-check': 'Theological and historical fidelity checks.',
  'visual-suggestions': 'Suggesting visual assets.',
  transcription: 'Automated audio transcription.',
  'publishing-kit': 'Generating YouTube titles, descriptions, and tags.',
  'short-form-content': 'Identifying short-form content segments.',
  'timeline-generation': 'Generating historical event timelines.',
  seedOfTheWord: "Identifying 'Seeds of the Word' concepts.",
  summaryGenerator: 'Generating video summary/description.',
  communityPostGenerator: 'Drafting community tab posts.',
  scriptOutline: 'Generating script outlines.',
  visualSuggestion: 'Suggesting visual assets.',
};

const AITransparency: React.FC = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [disclosureText, setDisclosureText] = useState('');

  const handleCheckboxChange = (featureId: string, isChecked: boolean) => {
    setSelectedFeatures(prev =>
      isChecked ? [...prev, featureId] : prev.filter(id => id !== featureId)
    );
  };

  const generateDisclosure = useCallback(() => {
    let disclosure =
      'This content was created with assistance from Artificial Intelligence tools. While AI was used to aid in specific aspects of production, all historical facts, theological interpretations, and the final narrative were meticulously reviewed and discerned by human intellect to ensure accuracy, fidelity, and a charitable tone.';
    if (selectedFeatures.length > 0) {
      disclosure += '\n\nSpecifically, AI was utilized for:';
      selectedFeatures.forEach(feature => {
        if (featureDescriptions[feature]) {
          disclosure += `\n- ${featureDescriptions[feature]}`;
        }
      });
    }
    disclosure += '\n\nSemina Verbi Workspace is committed to truth, transparency, and the primacy of human reason in all content creation.';
    setDisclosureText(disclosure);
  }, [selectedFeatures]);

  const handleCopy = () => {
    navigator.clipboard.writeText(disclosureText);
  };

  return (
    <Card className="p-6" aria-label="AI Transparency Panel">
      <h2 className="text-xl font-semibold text-gray-800 mb-4" tabIndex={0}>AI Transparency</h2>
      <p className="text-gray-600 mb-6" tabIndex={0}>
        Generate clear and explicit disclosures for your audience regarding the use of AI in your content, and track which AI features were used.
      </p>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center" tabIndex={0}>
          <Lightbulb size={20} className="mr-2 text-blue-600" aria-hidden="true" /> Select AI Features Used:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-label="AI Features Checklist">
          {aiFeatures.map(feature => (
            <Checkbox
              key={feature.id}
              label={feature.label}
              checked={selectedFeatures.includes(feature.id)}
              onChange={e => handleCheckboxChange(feature.id, e.target.checked)}
              aria-checked={selectedFeatures.includes(feature.id)}
              aria-label={feature.label}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button onClick={generateDisclosure} disabled={selectedFeatures.length === 0} aria-label="Generate AI Disclosure">
          Generate Disclosure
        </Button>
      </div>
      <Textarea
        label="Generated Disclosure"
        value={disclosureText}
        readOnly
        rows={8}
        className="mb-4"
        aria-label="Generated AI Disclosure Text"
      />
      <Button onClick={handleCopy} disabled={!disclosureText} className="flex items-center" aria-label="Copy Disclosure">
        <Copy className="mr-2" size={18} aria-hidden="true" /> Copy Disclosure
      </Button>
    </Card>
  );
};

export default AITransparency;
