/**
 * ProductionPipeline.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Streamlines audio recording, transcription, and preparation for DaVinci Resolve.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState, useRef } from 'react';
import Card from '../Card';
import Button from '../Button';
import Textarea from '../Textarea';
import Spinner from '../Spinner';
import QualityTools from "./QualityTools";
import { transcribeAudio } from '../../api/huggingface';

interface ProductionPipelineProps {
  isLoading: {
    transcription: boolean;
    xml: boolean;
  };
  transcriptionContent: string;
}

const ProductionPipeline: React.FC<ProductionPipelineProps> = ({
  isLoading,
  transcriptionContent,
}) => {
  const [scriptContent, setScriptContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState(transcriptionContent);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setIsTranscribing(true);
    setError(null);
    try {
      const text = await transcribeAudio(audioFile);
      setTranscription(text);
    } catch (error) {
      setError((error instanceof Error) ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Audio recording handlers
  const handleStartRecording = async () => {
    setError(null);
    setRecordedChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        setAudioFile(new File([blob], 'recording.webm'));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone access denied or unavailable.');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Export/copy handlers
  const handleCopyTranscription = () => {
    navigator.clipboard.writeText(transcription);
  };
  const handleExportTranscription = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recording & Editing Pipeline</h2>
      <p className="text-gray-600 mb-6">
        Streamline your audio recording, transcription, and preparation for DaVinci Resolve.
      </p>
      <div className="mb-6">
        <Textarea
          label="Video Script Content (for XML sync)"
          placeholder="Paste your final script here. This will be used to sync with transcription for XML generation."
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          rows={6}
        />
      </div>
      <div className="mb-6 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Automated Transcription & Correction
        </h3>
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <input type="file" accept="audio/*" onChange={handleAudioChange} aria-label="Upload audio for transcription" />
          <Button onClick={handleTranscribe} disabled={!audioFile || isTranscribing} className="ml-2">
            {isTranscribing ? <Spinner size="sm" color="text-blue-600" className="mr-2" /> : 'Transcribe Audio'}
          </Button>
          <Button onClick={isRecording ? handleStopRecording : handleStartRecording} variant={isRecording ? 'primary' : 'secondary'} aria-label={isRecording ? 'Stop Recording' : 'Start Recording'} className="ml-2">
            {isRecording ? 'Stop Recording' : 'Record Audio'}
          </Button>
        </div>
        {error && <div className="text-red-600 mb-2" role="alert">{error}</div>}
        <Textarea
          label="Transcription Output"
          value={transcription}
          onChange={e => setTranscription(e.target.value)}
          rows={6}
          className="mb-4"
          data-testid="transcription-output"
        />
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant="outline" onClick={handleCopyTranscription} aria-label="Copy Transcription">Copy</Button>
          <Button size="sm" variant="outline" onClick={handleExportTranscription} aria-label="Export Transcription">Export</Button>
        </div>
        <QualityTools />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          DaVinci Resolve XML Generation
        </h3>
        <p className="text-gray-600 mb-4">
          Generate a basic .xml timeline file for DaVinci Resolve, syncing your script and transcription.
        </p>
        <Button disabled={isLoading.xml || !scriptContent.trim() || !transcription.trim()}>
          {isLoading.xml ? <Spinner size="sm" color="text-white" /> : 'Generate DaVinci Resolve XML'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductionPipeline;