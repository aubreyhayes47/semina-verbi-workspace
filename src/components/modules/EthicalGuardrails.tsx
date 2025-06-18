import React, { useState } from 'react';
import Card from '../Card';
import Textarea from '../Textarea';
import Button from '../Button';
import Spinner from '../Spinner';
import { checkEthicalGuardrails, GuardrailResult } from '../../api/ethicalGuardrails';

const EthicalGuardrails: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<GuardrailResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    setError(null);
    setResults([]);
    try {
      const res = await checkEthicalGuardrails(input);
      setResults(res);
    } catch (e) {
      setError('Failed to check ethical guardrails: ' + ((e instanceof Error) ? e.message : 'Unknown error'));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="p-6" aria-label="Ethical Guardrails Panel">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ethical Guardrails</h2>
      <p className="text-gray-600 mb-6">
        Automatically check your content for bias, misinformation, and alignment with project values (Truth, Charity, Intellectual Rigor).
      </p>
      <Textarea
        label="Content to Check"
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={6}
        placeholder="Paste or write your content here..."
      />
      <div className="flex gap-2 mt-4 mb-4">
        <Button onClick={handleCheck} disabled={isChecking || !input.trim()} aria-label="Check Ethical Guardrails">
          {isChecking ? <Spinner size="sm" color="text-white" /> : 'Check Content'}
        </Button>
      </div>
      {error && <div className="text-red-600 mb-2" role="alert">{error}</div>}
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Results</h3>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className={`p-3 rounded border ${r.type === 'ok' ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
                <span className="font-semibold">{r.message}</span>
                {r.suggestion && <div className="text-sm text-gray-700 mt-1">Suggestion: {r.suggestion}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default EthicalGuardrails;
