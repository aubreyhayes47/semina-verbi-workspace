// distribution.ts
// AI-powered generation of YouTube summaries, titles, descriptions, tags, and community posts

// Vite env type augmentation for ImportMeta
const HF_API_KEY = (import.meta.env?.VITE_HF_API_KEY as string) || '';
const HF_SUMMARY_MODEL = 'facebook/bart-large-cnn';
const HF_TITLE_MODEL = 'google/flan-t5-base';
const HF_TAGS_MODEL = 'google/flan-t5-base';

async function callHuggingFace(model: string, prompt: string): Promise<string> {
  if (!HF_API_KEY) throw new Error('HuggingFace API key not set');
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  });
  if (!res.ok) throw new Error('AI generation failed');
  const data = await res.json();
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (data?.generated_text) return data.generated_text;
  if (data?.summary_text) return data.summary_text;
  return prompt;
}

export async function generateYouTubeSummary(script: string): Promise<string> {
  return callHuggingFace(HF_SUMMARY_MODEL, `Summarize this for a YouTube video: ${script}`);
}

export async function generateYouTubeTitle(script: string): Promise<string> {
  return callHuggingFace(HF_TITLE_MODEL, `Generate a catchy YouTube title for: ${script}`);
}

export async function generateYouTubeTags(script: string): Promise<string> {
  return callHuggingFace(HF_TAGS_MODEL, `Generate 5-10 relevant YouTube tags for: ${script}`);
}

export async function generateCommunityPost(script: string): Promise<string> {
  return callHuggingFace(HF_TITLE_MODEL, `Write a community tab post to engage viewers about: ${script}`);
}
