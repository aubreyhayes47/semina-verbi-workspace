// App.tsx
import React, { useState } from 'react';
// @ts-expect-error: TypeScript does not recognize CSS imports, but this is required for Tailwind
import './index.css'; // Ensure Tailwind CSS is imported
import Sidebar from './components/Sidebar'; // Correct path
import WelcomeScreen from './components/modules/WelcomeScreen';
import KnowledgeHub from './components/modules/KnowledgeHub';
import WriterRoom from './components/modules/WriterRoom';
import ProductionPipeline from './components/modules/ProductionPipeline';
import PublishingKitGenerator from './components/modules/PublishingKitGenerator';
import AnalyticsDashboard from './components/modules/AnalyticsDashboard';
import AITransparency from './components/modules/AITransparency';
import QualityTools from './components/modules/QualityTools';
import ContentEnhancement from './components/modules/ContentEnhancement';
import HistoricalEventTimelineGenerator from './components/modules/HistoricalEventTimelineGenerator';
import CommunityTabPostGenerator from './components/modules/CommunityTabPostGenerator';
import ResearchEngine from './components/modules/ResearchEngine';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState('welcome'); // Default to welcome screen

  // State for ProductionPipeline (mocked for now)
  const [currentTranscription] = useState<string>('');
  const [productionIsLoading] = useState({ transcription: false, xml: false });
  const [audioDownloadPending, setAudioDownloadPending] = useState(false);
  const [pendingAudioBlob, setPendingAudioBlob] = useState<Blob | null>(null);

  // State for PublishingKitGenerator
  const [publishingKitLoading, setPublishingKitLoading] = useState(false);
  const [publishingKitContent, setPublishingKitContent] = useState<{
    title: string;
    description: string;
    tags: string[];
  } | null>(null);

  // State for CommunityTabPostGenerator
  const [communityPostsLoading, setCommunityPostsLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<string[]>([]);

  // Utility: Download a Blob as a file
  const downloadBlob = (blob: Blob, filename: string) => {
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

  React.useEffect(() => {
    if (audioDownloadPending && pendingAudioBlob) {
      console.log('Triggering audio download:', pendingAudioBlob);
      downloadBlob(pendingAudioBlob, 'recorded_audio.webm');
      setAudioDownloadPending(false);
      setPendingAudioBlob(null);
    }
  }, [audioDownloadPending, pendingAudioBlob]);

  // Fix handlePublishingKitGenerate to return the generated object
  // Removed unused parameters scriptContent and keyThemes
  const handlePublishingKitGenerate = async () => {
    setPublishingKitLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const result = {
      title: 'The Gifts of Providence: St. Augustine and the Early Church',
      description: 'Explore the inculturation of the Gospel in the ancient world, focusing on St. Augustine, the City of God, and the providential hand of God in history. Discover how faith and culture meet in the Early Church.',
      tags: ['Inculturation', 'St. Augustine', 'City of God', 'Early Church', 'Providence', 'Catholic', 'History', 'Faith', 'Culture']
    };
    setPublishingKitContent(result);
    setPublishingKitLoading(false);
    return result;
  };

  // Mocked generate function
  const handleCommunityPostGenerate = async (prompt: string, type: string) => {
    setCommunityPostsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    let posts: string[] = [];
    if (type === 'poll') {
      posts = [
        `Which aspect of ${prompt} interests you most?\n- The history\n- The theology\n- The cultural impact\n- The personal stories`,
        `Poll: How familiar are you with ${prompt}?\n- Very familiar\n- Somewhat familiar\n- Not at all`
      ];
    } else if (type === 'question') {
      posts = [
        `What questions do you have about ${prompt}? Let us know below!`,
        `If you could ask a historical figure from ${prompt} one thing, what would it be?`
      ];
    } else if (type === 'behind_the_scenes') {
      posts = [
        `Behind the scenes: Researching ${prompt} has revealed some fascinating details! Stay tuned for more.`,
        `A quick look at our process for exploring ${prompt}—from research to script to video!`
      ];
    } else {
      posts = [
        `Excited to share more about ${prompt} in our upcoming video! What are you most looking forward to?`,
        `Here's a quick update: We're diving into ${prompt}—let us know your thoughts!`
      ];
    }
    setCommunityPosts(posts);
    setCommunityPostsLoading(false);
    return posts;
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'welcome':
        return (
          <WelcomeScreen
            onNavigateToKnowledgeHub={() => setActiveModule('knowledge-hub')}
            onNavigateToWriterRoom={() => setActiveModule('writer-room')}
            onNavigateToProductionPipeline={() => setActiveModule('production-pipeline')}
            onNavigateToDistributionEngine={() => setActiveModule('distribution-engine')}
          />
        );
      case 'knowledge-hub':
        return <KnowledgeHub />;
      case 'writer-room':
        return <WriterRoom />;
      case 'production-pipeline':
        return (
          <ProductionPipeline
            isLoading={productionIsLoading}
            transcriptionContent={currentTranscription}
          />
        );
      case 'distribution-engine':
        return (
          <div className="p-4 flex flex-col space-y-6">
            <PublishingKitGenerator
              onGenerate={handlePublishingKitGenerate}
              isLoading={publishingKitLoading}
              generatedContent={publishingKitContent}
            />
            <CommunityTabPostGenerator
              onGenerate={handleCommunityPostGenerate}
              isLoading={communityPostsLoading}
              generatedPosts={communityPosts}
            />
            <AITransparency />
            <ContentEnhancement />
            <AnalyticsDashboard />
          </div>
        );
      case 'analytics-dashboard':
        return <AnalyticsDashboard />;
      case 'ethical-guardrails':
        return <AITransparency />;
      case 'quality-tools':
        return <QualityTools />;
      case 'content-enhancement':
        return <ContentEnhancement />;
      case 'historical-timeline':
        return <HistoricalEventTimelineGenerator />;
      case 'research-engine':
        return <ResearchEngine />;
      default:
        return <WelcomeScreen
          onNavigateToKnowledgeHub={() => setActiveModule('knowledge-hub')}
          onNavigateToWriterRoom={() => setActiveModule('writer-room')}
          onNavigateToProductionPipeline={() => setActiveModule('production-pipeline')}
          onNavigateToDistributionEngine={() => setActiveModule('distribution-engine')}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onNavigate={setActiveModule} activeModule={activeModule} />
      <div className="flex-1 overflow-auto p-6">
        {renderModule()}
      </div>
    </div>
  );
};

export default App;