import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { db, newId, nowIso } from '../db/index.ts';
import { requireAuth, uid } from '../auth.ts';
import { asyncHandler, HttpError, parseBody } from '../lib/http.ts';
import { completeText, extractJson } from '../ai/client.ts';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, type StyleTraits } from '../ai/prompts.ts';

export const MAX_VOICE_SAMPLES = 5;

const sampleText = z.string().trim().min(20, 'Samples should be at least 20 characters').max(5000);

export const voiceSamplesRouter = Router();
voiceSamplesRouter.use(requireAuth);

const listSamples = (userId: string) =>
  db
    .selectFrom('voice_samples')
    .select(['id', 'sample_text', 'created_at'])
    .where('user_id', '=', userId)
    .orderBy('created_at')
    .execute();

voiceSamplesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ samples: await listSamples(uid(req)) });
  }),
);

voiceSamplesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const { sample_text } = parseBody(z.object({ sample_text: sampleText }), req.body);
    const existing = await listSamples(userId);
    if (existing.length >= MAX_VOICE_SAMPLES) {
      throw new HttpError(400, `You can save up to ${MAX_VOICE_SAMPLES} writing samples`);
    }
    const sample = { id: newId(), user_id: userId, sample_text, created_at: nowIso() };
    await db.insertInto('voice_samples').values(sample).execute();
    res.status(201).json({ sample: { id: sample.id, sample_text, created_at: sample.created_at } });
  }),
);

voiceSamplesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { sample_text } = parseBody(z.object({ sample_text: sampleText }), req.body);
    const result = await db
      .updateTable('voice_samples')
      .set({ sample_text })
      .where('id', '=', req.params.id)
      .where('user_id', '=', uid(req))
      .executeTakeFirst();
    if (!result.numUpdatedRows) throw new HttpError(404, 'Sample not found');
    res.json({ ok: true });
  }),
);

voiceSamplesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await db
      .deleteFrom('voice_samples')
      .where('id', '=', req.params.id)
      .where('user_id', '=', uid(req))
      .executeTakeFirst();
    if (!result.numDeletedRows) throw new HttpError(404, 'Sample not found');
    res.json({ ok: true });
  }),
);

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

const hashSamples = (samples: { sample_text: string }[]) =>
  crypto
    .createHash('sha256')
    .update(samples.map((s) => s.sample_text).join('\u0000'))
    .digest('hex');

export async function getCachedTraits(userId: string): Promise<StyleTraits | null> {
  const row = await db
    .selectFrom('voice_profiles')
    .select('traits_json')
    .where('user_id', '=', userId)
    .executeTakeFirst();
  if (!row) return null;
  const parsed = traitsSchema.safeParse(JSON.parse(row.traits_json));
  return parsed.success ? parsed.data : null;
}

export const voiceProfileRouter = Router();
voiceProfileRouter.use(requireAuth);

voiceProfileRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const [samples, row] = await Promise.all([
      listSamples(userId),
      db.selectFrom('voice_profiles').selectAll().where('user_id', '=', userId).executeTakeFirst(),
    ]);
    res.json({
      traits: row ? JSON.parse(row.traits_json) : null,
      analyzed_at: row?.analyzed_at ?? null,
      is_stale: row ? row.samples_hash !== hashSamples(samples) : samples.length > 0,
    });
  }),
);

voiceProfileRouter.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const samples = await listSamples(userId);
    if (!samples.length) throw new HttpError(400, 'Add at least one writing sample to analyze your style');

    const text = await completeText({
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
      samples_hash: hashSamples(samples),
      analyzed_at: nowIso(),
    };
    await db
      .insertInto('voice_profiles')
      .values(record)
      .onConflict((oc) => oc.column('user_id').doUpdateSet(record))
      .execute();

    res.json({ traits, analyzed_at: record.analyzed_at, is_stale: false });
  }),
);
