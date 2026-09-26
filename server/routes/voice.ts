import { Hono } from 'hono';
import type { Kysely } from 'kysely';
import { z } from 'zod';
import { newId, nowIso } from '../db/index.ts';
import type { Database } from '../db/schema.ts';
import type { AppEnv } from '../env.ts';
import { rateLimit, requireAuth } from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';
import { completeText, extractJson } from '../ai/client.ts';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, type StyleTraits } from '../ai/prompts.ts';

export const MAX_VOICE_SAMPLES = 5;

const sampleText = z.string().trim().min(20, 'Samples should be at least 20 characters').max(5000);

export const voiceSamplesRouter = new Hono<AppEnv>();
voiceSamplesRouter.use(requireAuth);

const listSamples = (db: Kysely<Database>, userId: string) =>
  db
    .selectFrom('voice_samples')
    .select(['id', 'sample_text', 'created_at'])
    .where('user_id', '=', userId)
    .orderBy('created_at')
    .execute();

voiceSamplesRouter.get('/', async (c) => {
  return c.json({ samples: await listSamples(c.get('db'), c.get('userId')) });
});

voiceSamplesRouter.post('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const { sample_text } = await parseBody(c, z.object({ sample_text: sampleText }));
  const existing = await listSamples(db, userId);
  if (existing.length >= MAX_VOICE_SAMPLES) {
    throw new HttpError(400, `You can save up to ${MAX_VOICE_SAMPLES} writing samples`);
  }
  const sample = { id: newId(), user_id: userId, sample_text, created_at: nowIso() };
  await db.insertInto('voice_samples').values(sample).execute();
  return c.json({ sample: { id: sample.id, sample_text, created_at: sample.created_at } }, 201);
});

voiceSamplesRouter.put('/:id', async (c) => {
  const { sample_text } = await parseBody(c, z.object({ sample_text: sampleText }));
  const result = await c
    .get('db')
    .updateTable('voice_samples')
    .set({ sample_text })
    .where('id', '=', c.req.param('id'))
    .where('user_id', '=', c.get('userId'))
    .executeTakeFirst();
  if (!result.numUpdatedRows) throw new HttpError(404, 'Sample not found');
  return c.json({ ok: true });
});

voiceSamplesRouter.delete('/:id', async (c) => {
  const result = await c
    .get('db')
    .deleteFrom('voice_samples')
    .where('id', '=', c.req.param('id'))
    .where('user_id', '=', c.get('userId'))
    .executeTakeFirst();
  if (!result.numDeletedRows) throw new HttpError(404, 'Sample not found');
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Voice profile (cached style analysis)
// ---------------------------------------------------------------------------

const traitsSchema = z.object({
  tone: z.string(),
  sentence_length: z.string(),
  formality: z.string(),
  hook_pattern: z.string(),
  structural_habits: z.array(z.string()),
  emoji_usage: z.string(),
});

async function hashSamples(samples: { sample_text: string }[]) {
  const data = new TextEncoder().encode(samples.map((s) => s.sample_text).join('\u0000'));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getCachedTraits(db: Kysely<Database>, userId: string): Promise<StyleTraits | null> {
  const row = await db
    .selectFrom('voice_profiles')
    .select('traits_json')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  if (!row) return null;
  const parsed = traitsSchema.safeParse(JSON.parse(row.traits_json));
  return parsed.success ? parsed.data : null;
}

export const voiceProfileRouter = new Hono<AppEnv>();
voiceProfileRouter.use(requireAuth);

voiceProfileRouter.get('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const [samples, row] = await Promise.all([
    listSamples(db, userId),
    db.selectFrom('voice_profiles').selectAll().where('user_id', '=', userId).executeTakeFirst(),
  ]);
  return c.json({
    traits: row ? JSON.parse(row.traits_json) : null,
    analyzed_at: row?.analyzed_at ?? null,
    is_stale: row ? row.samples_hash !== (await hashSamples(samples)) : samples.length > 0,
  });
});

voiceProfileRouter.post(
  '/analyze',
  rateLimit('AI_LIMITER', 'You are generating very quickly. Take a breath and try again in a minute.'),
  async (c) => {
    const db = c.get('db');
    const userId = c.get('userId');
    const samples = await listSamples(db, userId);
    if (!samples.length) throw new HttpError(400, 'Add at least one writing sample to analyze your style');

    const text = await completeText(c.env, {
      system: ANALYSIS_SYSTEM_PROMPT,
      user: buildAnalysisPrompt(samples.map((s) => s.sample_text)),
      maxTokens: 1024,
    });

    let traits: StyleTraits;
    try {
      traits = traitsSchema.parse(extractJson(text));
    } catch (err) {
      console.error('[ai] could not parse style analysis', err, text);
      throw new HttpError(502, 'The style analysis came back in an unexpected format. Please try again.');
    }

    const record = {
      user_id: userId,
      traits_json: JSON.stringify(traits),
      samples_hash: await hashSamples(samples),
      analyzed_at: nowIso(),
    };
    await db
      .insertInto('voice_profiles')
      .values(record)
      .onConflict((oc) => oc.column('user_id').doUpdateSet(record))
      .execute();

    return c.json({ traits, analyzed_at: record.analyzed_at, is_stale: false });
  },
);
