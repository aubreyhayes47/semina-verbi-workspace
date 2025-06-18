/**
 * VisualAssetSuggestionEngine.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Suggest relevant images, maps, and artifacts for scripts using AI.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

// VisualAssetSuggestionEngine.tsx
import React, { useState } from 'react';
import Card from '../Card';
import Textarea from '../Textarea';
import Button from '../Button';
import Spinner from '../Spinner';
import { VisualAsset } from '../../api/visualAssets';

interface VisualAssetSuggestionEngineProps {
  onSuggest?: (scriptContent: string) => Promise<VisualAsset[]>;
  isLoading: boolean;
}

const VisualAssetSuggestionEngine: React.FC<VisualAssetSuggestionEngineProps> = ({ onSuggest, isLoading }) => {
  const [scriptInput, setScriptInput] = useState('');
  const [suggestions, setSuggestions] = useState<VisualAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestClick = async () => {
    setError(null);
    if (scriptInput.trim() && onSuggest) {
      try {
        const assets = await onSuggest(scriptInput);
        setSuggestions(assets);
      } catch (e) {
        setError('Failed to fetch visual assets: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
        setSuggestions([]);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Visual Asset Suggestion Engine </h2>
      <p className="text-gray-600 mb-6">
        AI will analyze your script content and suggest relevant images, maps, and artifacts from integrated archives. 
      </p>

      <div className="mb-6">
        <Textarea
          label="Script Content"
          placeholder="Paste the relevant section of your script here to get visual suggestions..."
          value={scriptInput}
          onChange={(e) => setScriptInput(e.target.value)}
          rows={8}
        />
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleSuggestClick} disabled={isLoading || !scriptInput.trim()}>
          {isLoading ? <Spinner size="sm" color="text-white" /> : 'Suggest Visual Assets'}
        </Button>
      </div>

      {/* Error always takes priority and is always rendered if present */}
      {error ? (
        <div className="text-red-600 mb-2" role="alert" data-testid="error-feedback">
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          {suggestions.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Suggested Visuals:</h3>
              <div className="space-y-4">
                {suggestions.map((asset, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200" tabIndex={0} aria-label={`Visual asset suggestion: ${asset.title}`}> 
                    <div className="flex items-center mb-2">
                      {asset.thumbnail ? (
                        <img
                          src={asset.thumbnail}
                          alt={asset.title}
                          className="w-16 h-16 object-cover rounded mr-3 border border-gray-200"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <span className="w-16 h-16 mr-3 bg-gray-200 flex items-center justify-center rounded text-gray-400" aria-label="No image available">No Image</span>
                      )}
                      <span className="text-gray-800 font-medium">{asset.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {asset.url !== '#' && (
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm" aria-label={`View source for ${asset.title}`}>View Source</a>
                      )}
                      <span className="text-xs text-gray-500">{asset.source}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">{asset.attribution}</div>
                    {asset.url !== '#' && (
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`${asset.title} (${asset.source}): ${asset.url} — ${asset.attribution}`)} aria-label={`Copy attribution for ${asset.title}`}>Copy Attribution</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {suggestions.length === 1 && suggestions[0].source === 'Fallback' && !isLoading && scriptInput.trim() && (
            <p className="text-gray-500 text-center mt-6" role="alert">No specific visual suggestions found for this script content. Please try again later or refine your script.</p>
          )}
          {suggestions.length === 0 && !isLoading && scriptInput.trim() && (
            <p className="text-gray-500 text-center mt-6" role="alert">No specific visual suggestions found for this script content.</p>
          )}
        </>
      )}
      {/* Error and fallback handling: see docs/InstructionManual.md for project values and user feedback standards.
          All error and fallback states must provide clear, accessible feedback (Truth, Charity, Intellectual Rigor). */}
    </Card>
  );
};

export default VisualAssetSuggestionEngine;