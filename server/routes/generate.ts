import { Hono } from 'hono';
import { z } from 'zod';
import { newId, nowIso, runBatch } from '../db/index.ts';
import type { StyleMode } from '../db/schema.ts';
import type { AppEnv, Env } from '../env.ts';
import { rateLimit, requireAuth } from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';
import { completeText, extractJson } from '../ai/client.ts';
import { buildGenerationPrompt, GENERATION_SYSTEM_PROMPT, STYLE_MODES } from '../ai/prompts.ts';
import { getCachedTraits } from './voice.ts';
import { listInspirations } from './inspirations.ts';
import { serializeDraft } from './drafts.ts';

export const generateRouter = new Hono<AppEnv>();
generateRouter.use(requireAuth);

const styleMode = z.enum(STYLE_MODES as [StyleMode, ...StyleMode[]]);

const generateBody = z.object({
  one_liner: z.string().trim().min(3, 'Tell us a little more about your idea').max(500),
  selected_modes: z.array(styleMode).min(1).max(4).optional(),
  regenerate_single_mode: styleMode.optional(),
  inspiration_id: z.string().nullable().optional(),
  // When regenerating, the draft being replaced is marked "discarded".
  replace_draft_id: z.string().optional(),
});

const variantSchema = z.object({
  style: z.string(),
  post_text: z.string().min(1),
  hook_line: z.string().default(''),
  suggested_hashtags: z.array(z.string()).default([]),
});
const responseSchema = z.object({ variants: z.array(variantSchema).min(1) });
type Variant = z.infer<typeof variantSchema>;

const normalizeHashtags = (tags: string[]) =>
  [...new Set(tags.map((t) => '#' + t.replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '')).filter((t) => t.length > 1))].slice(0, 5);

function withHashtags(postText: string, hashtags: string[]) {
  const text = postText.trim();
  const missing = hashtags.filter((h) => !text.toLowerCase().includes(h.toLowerCase()));
  return missing.length ? `${text}\n\n${missing.join(' ')}` : text;
}

async function requestVariants(env: Env, prompt: string, modes: StyleMode[]): Promise<Map<StyleMode, Variant>> {
  let lastError: unknown;
  // One retry if the model returns malformed or incomplete JSON.
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await completeText(env, { system: GENERATION_SYSTEM_PROMPT, user: prompt, maxTokens: 6000 });
    try {
      const { variants } = responseSchema.parse(extractJson(text));
      const byMode = new Map<StyleMode, Variant>();
      for (const v of variants) {
        const mode = v.style.trim().toLowerCase() as StyleMode;
        if (modes.includes(mode) && !byMode.has(mode)) byMode.set(mode, v);
      }
      // Fall back to positional matching if the model relabeled styles.
      if (byMode.size < modes.length && variants.length === modes.length) {
        modes.forEach((m, i) => byMode.set(m, variants[i]));
      }
      if (byMode.size < modes.length) throw new Error(`Expected ${modes.length} variants, got ${byMode.size}`);
      return byMode;
    } catch (err) {
      lastError = err;
      console.warn(`[ai] generation parse failed (attempt ${attempt + 1})`, err);
    }
  }
  console.error('[ai] giving up on generation', lastError);
  throw new HttpError(502, 'The AI response came back in an unexpected format. Please try again.');
}

generateRouter.post(
  '/',
  rateLimit('AI_LIMITER', 'You are generating very quickly. Take a breath and try again in a minute.'),
  async (c) => {
    const db = c.get('db');
    const userId = c.get('userId');
    const body = await parseBody(c, generateBody);

    const modes: StyleMode[] = body.regenerate_single_mode
      ? [body.regenerate_single_mode]
      : [...new Set(body.selected_modes ?? STYLE_MODES.slice(0, 3))];

    const [user, pillars, voiceSamples, traits, inspirations] = await Promise.all([
      db.selectFrom('users').select(['name', 'role', 'industry']).where('id', '=', userId).executeTakeFirstOrThrow(),
      db.selectFrom('content_pillars').select('topic').where('user_id', '=', userId).execute(),
      db.selectFrom('voice_samples').select('sample_text').where('user_id', '=', userId).orderBy('created_at').execute(),
      getCachedTraits(db, userId),
      body.inspiration_id ? listInspirations(db, userId) : Promise.resolve([]),
    ]);

    let inspiration = null;
    if (body.inspiration_id) {
      const found = inspirations.find((i) => i.id === body.inspiration_id);
      if (!found) throw new HttpError(404, 'That inspiration no longer exists');
      inspiration = { name: found.name, samples: found.samples.map((s) => s.sample_text) };
    }

    const prompt = buildGenerationPrompt({
      oneLiner: body.one_liner,
      modes,
      profile: user,
      pillars: pillars.map((p) => p.topic),
      voiceSamples: voiceSamples.map((s) => s.sample_text),
      traits,
      inspiration,
    });

    const variants = await requestVariants(c.env, prompt, modes);

    const createdAt = nowIso();
    const rows = modes.map((mode) => {
      const v = variants.get(mode)!;
      const hashtags = normalizeHashtags(v.suggested_hashtags);
      return {
        id: newId(),
        user_id: userId,
        one_liner: body.one_liner,
        style_mode: mode,
        post_text: withHashtags(v.post_text, hashtags),
        hook_line: v.hook_line.trim() || v.post_text.trim().split('\n')[0],
        hashtags_json: JSON.stringify(hashtags),
        status: 'generated' as const,
        created_at: createdAt,
      };
    });

    await runBatch(c.env.DB, [
      db.insertInto('drafts').values(rows),
      ...(body.replace_draft_id
        ? [
            db
              .updateTable('drafts')
              .set({ status: 'discarded' })
              .where('id', '=', body.replace_draft_id)
              .where('user_id', '=', userId)
              .where('status', '=', 'generated'),
          ]
        : []),
    ]);

    return c.json({ variants: rows.map(serializeDraft) });
  },
);
