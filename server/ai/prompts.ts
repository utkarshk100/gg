import type { StyleMode } from '../db/schema.ts';

export const STYLE_MODES: StyleMode[] = ['punchy', 'storytelling', 'listicle', 'contrarian'];

export const GENERATION_SYSTEM_PROMPT = `You are a LinkedIn ghostwriting assistant. Take the user's one-line idea and expand it into polished, ready-to-post LinkedIn posts — written to sound authentically like the user based on their writing samples and style traits, and structurally inspired (hook style, rhythm, formatting, paragraph structure) by any inspiration samples provided, but never copying anyone's actual words, opinions, or specific claims — structure only, never content. Never fabricate facts, numbers, or achievements not implied by the one-liner. Write in short LinkedIn-style paragraphs with generous line breaks. Generate exactly one post per requested style mode: 'punchy' (short, high-impact, minimal elaboration), 'storytelling' (narrative arc with a takeaway), 'listicle' (structured around a list of points), or 'contrarian' (challenges a common assumption in the user's field). Output ONLY valid JSON, no markdown fences, no extra text:
{
  "variants": [
    { "style": string, "post_text": string, "hook_line": string, "suggested_hashtags": string[] }
  ]
}`;

export interface StyleTraits {
  tone: string;
  sentence_length: string;
  formality: string;
  hook_pattern: string;
  structural_habits: string[];
  emoji_usage: string;
}

export interface GenerationContext {
  oneLiner: string;
  modes: StyleMode[];
  profile: { name: string | null; role: string | null; industry: string | null };
  pillars: string[];
  voiceSamples: string[];
  traits: StyleTraits | null;
  inspiration: { name: string; samples: string[] } | null;
}

const block = (tag: string, body: string) => `<${tag}>\n${body.trim()}\n</${tag}>`;

export function buildGenerationPrompt(ctx: GenerationContext): string {
  const parts: string[] = [];

  const about = [
    ctx.profile.name && `Name: ${ctx.profile.name}`,
    ctx.profile.role && `Role: ${ctx.profile.role}`,
    ctx.profile.industry && `Industry: ${ctx.profile.industry}`,
    ctx.pillars.length && `Content pillars (what they want to be known for): ${ctx.pillars.join(', ')}`,
  ].filter(Boolean);
  parts.push(block('about_the_user', about.length ? about.join('\n') : 'No profile details provided.'));

  if (ctx.voiceSamples.length) {
    parts.push(
      block(
        'user_writing_samples',
        ctx.voiceSamples.map((s) => block('sample', s)).join('\n\n'),
      ),
    );
  } else {
    parts.push(
      block(
        'user_writing_samples',
        'The user has not provided writing samples yet. Use a neutral, warm, professional first-person tone: clear, confident, human, and free of buzzwords.',
      ),
    );
  }

  if (ctx.traits) {
    parts.push(
      block(
        'user_style_traits',
        [
          `Tone: ${ctx.traits.tone}`,
          `Sentence length: ${ctx.traits.sentence_length}`,
          `Formality: ${ctx.traits.formality}`,
          `Hook pattern: ${ctx.traits.hook_pattern}`,
          `Structural habits: ${ctx.traits.structural_habits.join('; ')}`,
          `Emoji usage: ${ctx.traits.emoji_usage}`,
        ].join('\n'),
      ),
    );
  }

  if (ctx.inspiration && ctx.inspiration.samples.length) {
    parts.push(
      block(
        'inspiration_samples',
        `Creator: ${ctx.inspiration.name}\nBorrow ONLY structure from these (hook style, rhythm, formatting, paragraph shape). Do not reuse their words, topics, opinions, or claims.\n\n` +
          ctx.inspiration.samples.map((s, i) => `--- Inspiration post ${i + 1} ---\n${s.trim()}`).join('\n\n'),
      ),
    );
  }

  parts.push(block('one_liner_idea', ctx.oneLiner));
  parts.push(
    `Requested style modes (generate exactly one variant for each, in this order, using these exact lowercase style values): ${ctx.modes
      .map((m) => `"${m}"`)
      .join(', ')}.`,
  );

  return parts.join('\n\n');
}

export const ANALYSIS_SYSTEM_PROMPT = `You analyze a person's writing samples and describe their writing style so a ghostwriter can match it. Describe style only — never summarize the content or topics. Keep each field short (2-6 words), except structural_habits which is a list of 2-4 short phrases. Output ONLY valid JSON, no markdown fences, no extra text:
{
  "tone": string,
  "sentence_length": string,
  "formality": string,
  "hook_pattern": string,
  "structural_habits": string[],
  "emoji_usage": string
}`;

export function buildAnalysisPrompt(samples: string[]): string {
  return samples.map((s, i) => `--- Sample ${i + 1} ---\n${s.trim()}`).join('\n\n');
}
