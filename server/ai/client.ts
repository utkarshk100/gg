import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env.ts';
import { HttpError } from '../lib/http.ts';

const DEFAULT_MODEL = 'claude-sonnet-4-5';

function getClient(env: Env) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new HttpError(
      503,
      'AI is not configured. Add ANTHROPIC_API_KEY to .dev.vars locally, or run `npx wrangler secret put ANTHROPIC_API_KEY`.',
    );
  }
  // The key is a Worker secret and never reaches the browser.
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2 });
}

/** Sends a single-turn request to Claude and returns the concatenated text output. */
export async function completeText(
  env: Env,
  opts: { system: string; user: string; maxTokens: number },
): Promise<string> {
  try {
    const response = await getClient(env).messages.create({
      model: env.ANTHROPIC_MODEL || DEFAULT_MODEL,
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
      throw new HttpError(503, 'The ANTHROPIC_API_KEY was rejected. Check the key and update the secret.');
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
