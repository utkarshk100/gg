import Anthropic from '@anthropic-ai/sdk';
import { env } from '../env.ts';
import { HttpError } from '../lib/http.ts';

let client: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new HttpError(503, 'AI is not configured. Add ANTHROPIC_API_KEY to your .env file and restart the server.');
  }
  // The SDK reads ANTHROPIC_API_KEY from the environment; the key never leaves the backend.
  client ??= new Anthropic({ maxRetries: 2 });
  return client;
}

/** Sends a single-turn request to Claude and returns the concatenated text output. */
export async function completeText(opts: { system: string; user: string; maxTokens: number }): Promise<string> {
  try {
    const response = await getClient().messages.create({
      model: env.anthropicModel,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    });

    if (response.stop_reason === 'refusal') {
      throw new HttpError(422, 'Claude declined to write this post. Try rephrasing your idea.');
    }
    if (response.stop_reason === 'max_tokens') {
      throw new HttpError(502, 'The AI response was cut off. Please try again.');
    }

    return response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err instanceof Anthropic.AuthenticationError) {
      throw new HttpError(503, 'The ANTHROPIC_API_KEY in .env was rejected. Check the key and restart the server.');
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new HttpError(429, 'The AI service is busy right now. Wait a moment and try again.');
    }
    if (err instanceof Anthropic.APIError) {
      console.error('[ai] Anthropic API error', err.status, err.message);
      throw new HttpError(502, 'The AI service returned an error. Please try again.');
    }
    throw err;
  }
}

/** Extracts the first JSON object from model output, tolerating stray fences or prose. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('No JSON object found in AI response');
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}
