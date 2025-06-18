/**
 * WelcomeScreen.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Welcome users and guide them to core workspace features.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React from 'react';
import Card from '../Card';
import Button from '../Button';
import { Sparkles, BookOpen, Edit, Mic, Share2 } from 'lucide-react'; // Lucide React icons

interface WelcomeScreenProps {
  onNavigateToKnowledgeHub: () => void;
  onNavigateToWriterRoom: () => void;
  onNavigateToProductionPipeline: () => void;
  onNavigateToDistributionEngine: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToKnowledgeHub,
  onNavigateToWriterRoom,
  onNavigateToProductionPipeline,
  onNavigateToDistributionEngine,
}) => {
  return (
    <Card className="p-8 text-center max-w-2xl mx-auto" aria-label="Welcome Screen">
      <Sparkles size={64} className="text-blue-500 mx-auto mb-6" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4" tabIndex={0}>
        Welcome to Semina Verbi Workspace!
      </h1>
      <p className="text-lg text-gray-600 mb-8" tabIndex={0}>
        Your dedicated digital scriptorium for crafting impactful content exploring faith and culture.
      </p>
      <div className="mb-8">
        <p className="text-base text-gray-700 mb-2" tabIndex={0}><strong>Get started in three steps:</strong></p>
        <ol className="list-decimal list-inside text-left text-gray-700 mx-auto max-w-md" aria-label="Onboarding Steps">
          <li tabIndex={0}>Explore the <strong>Knowledge Hub</strong> to gather and organize research.</li>
          <li tabIndex={0}>Draft and refine your script in the <strong>Writer's Room</strong> with AI-powered tools.</li>
          <li tabIndex={0}>Move to the <strong>Production Pipeline</strong> to record, transcribe, and prepare for editing, then use the <strong>Distribution Engine</strong> to publish and share your work.</li>
        </ol>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="navigation" aria-label="Main Navigation">
        <Button
          variant="secondary"
          size="lg"
          onClick={onNavigateToKnowledgeHub}
          className="flex flex-col items-center justify-center py-6 h-auto focus:ring-2 focus:ring-blue-500"
          aria-label="Go to Knowledge Hub"
        >
          <BookOpen size={36} className="mb-2 text-blue-600" aria-hidden="true" />
          <span className="text-xl font-semibold">Knowledge Hub</span>
          <span className="text-sm text-gray-600 mt-1">Research & organize your insights</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onNavigateToWriterRoom}
          className="flex flex-col items-center justify-center py-6 h-auto focus:ring-2 focus:ring-blue-500"
          aria-label="Go to Writer's Room"
        >
          <Edit size={36} className="mb-2 text-blue-600" aria-hidden="true" />
          <span className="text-xl font-semibold">Writer's Room</span>
          <span className="text-sm text-gray-600 mt-1">Craft your scripts with AI assistance</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onNavigateToProductionPipeline}
          className="flex flex-col items-center justify-center py-6 h-auto focus:ring-2 focus:ring-blue-500"
          aria-label="Go to Production Pipeline"
        >
          <Mic size={36} className="mb-2 text-blue-600" aria-hidden="true" />
          <span className="text-xl font-semibold">Production Pipeline</span>
          <span className="text-sm text-gray-600 mt-1">Record, transcribe, and prep for editing</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onNavigateToDistributionEngine}
          className="flex flex-col items-center justify-center py-6 h-auto focus:ring-2 focus:ring-blue-500"
          aria-label="Go to Distribution Engine"
        >
          <Share2 size={36} className="mb-2 text-blue-600" aria-hidden="true" />
          <span className="text-xl font-semibold">Distribution Engine</span>
          <span className="text-sm text-gray-600 mt-1">Generate publishing kits and short-form content</span>
        </Button>
      </div>
      <p className="text-gray-500 text-sm mt-8" tabIndex={0}>
        "Veritatem in caritate facere." (To do the truth in charity - Ephesians 4:15)
      </p>
    </Card>
  );
};

export default WelcomeScreen;