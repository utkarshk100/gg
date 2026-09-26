import { Router } from 'express';
import { z } from 'zod';
import { db, newId, nowIso } from '../db/index.ts';
import { requireAuth, uid } from '../auth.ts';
import { asyncHandler, HttpError, parseBody } from '../lib/http.ts';

export const MAX_INSPIRATIONS = 3;
export const MAX_SAMPLES_PER_INSPIRATION = 3;

const name = z.string().trim().min(1, 'Give this creator a name or nickname').max(80);
const sampleText = z.string().trim().min(1).max(5000);
const inspirationBody = z.object({
  name,
  samples: z
    .array(z.string().trim().max(5000))
    .max(MAX_SAMPLES_PER_INSPIRATION, `Up to ${MAX_SAMPLES_PER_INSPIRATION} sample posts per creator`)
    .default([])
    .transform((s) => s.filter(Boolean)),
});

export const inspirationsRouter = Router();
inspirationsRouter.use(requireAuth);

export async function listInspirations(userId: string) {
  const inspirations = await db
    .selectFrom('inspirations')
    .select(['id', 'name', 'created_at'])
    .where('user_id', '=', userId)
    .orderBy('created_at')
    .execute();
  if (!inspirations.length) return [];
  const samples = await db
    .selectFrom('inspiration_samples')
    .select(['id', 'inspiration_id', 'sample_text'])
    .where(
      'inspiration_id',
      'in',
      inspirations.map((i) => i.id),
    )
    .execute();
  return inspirations.map((i) => ({
    ...i,
    samples: samples.filter((s) => s.inspiration_id === i.id).map(({ id, sample_text }) => ({ id, sample_text })),
  }));
}

async function assertOwned(userId: string, inspirationId: string) {
  const row = await db
    .selectFrom('inspirations')
    .select('id')
    .where('id', '=', inspirationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
  if (!row) throw new HttpError(404, 'Inspiration not found');
}

const findInspiration = async (userId: string, id: string) =>
  (await listInspirations(userId)).find((i) => i.id === id);

inspirationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ inspirations: await listInspirations(uid(req)) });
  }),
);

inspirationsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const body = parseBody(inspirationBody, req.body);
    const id = newId();

    await db.transaction().execute(async (trx) => {
      const { count } = await trx
        .selectFrom('inspirations')
        .select((eb) => eb.fn.countAll<number>().as('count'))
        .where('user_id', '=', userId)
        .executeTakeFirstOrThrow();
      if (Number(count) >= MAX_INSPIRATIONS) {
        throw new HttpError(400, `You can save up to ${MAX_INSPIRATIONS} inspirations`);
      }
      await trx.insertInto('inspirations').values({ id, user_id: userId, name: body.name, created_at: nowIso() }).execute();
      if (body.samples.length) {
        await trx
          .insertInto('inspiration_samples')
          .values(body.samples.map((sample_text) => ({ id: newId(), inspiration_id: id, sample_text })))
          .execute();
      }
    });

    res.status(201).json({ inspiration: await findInspiration(userId, id) });
  }),
);

// Replaces the name and full sample list — used by the editable cards.
inspirationsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const id = req.params.id;
    await assertOwned(userId, id);
    const body = parseBody(inspirationBody, req.body);

    await db.transaction().execute(async (trx) => {
      await trx.updateTable('inspirations').set({ name: body.name }).where('id', '=', id).execute();
      await trx.deleteFrom('inspiration_samples').where('inspiration_id', '=', id).execute();
      if (body.samples.length) {
        await trx
          .insertInto('inspiration_samples')
          .values(body.samples.map((sample_text) => ({ id: newId(), inspiration_id: id, sample_text })))
          .execute();
      }
    });

    res.json({ inspiration: await findInspiration(userId, id) });
  }),
);

inspirationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    await assertOwned(userId, req.params.id);
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('inspiration_samples').where('inspiration_id', '=', req.params.id).execute();
      await trx.deleteFrom('inspirations').where('id', '=', req.params.id).execute();
    });
    res.json({ ok: true });
  }),
);

inspirationsRouter.get(
  '/:id/samples',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    await assertOwned(userId, req.params.id);
    const samples = await db
      .selectFrom('inspiration_samples')
      .select(['id', 'sample_text'])
      .where('inspiration_id', '=', req.params.id)
      .execute();
    res.json({ samples });
  }),
);

inspirationsRouter.post(
  '/:id/samples',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const inspirationId = req.params.id;
    await assertOwned(userId, inspirationId);
    const { sample_text } = parseBody(z.object({ sample_text: sampleText }), req.body);
    const { count } = await db
      .selectFrom('inspiration_samples')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('inspiration_id', '=', inspirationId)
      .executeTakeFirstOrThrow();
    if (Number(count) >= MAX_SAMPLES_PER_INSPIRATION) {
      throw new HttpError(400, `Up to ${MAX_SAMPLES_PER_INSPIRATION} sample posts per creator`);
    }
    const sample = { id: newId(), inspiration_id: inspirationId, sample_text };
    await db.insertInto('inspiration_samples').values(sample).execute();
    res.status(201).json({ sample: { id: sample.id, sample_text } });
  }),
);

inspirationsRouter.delete(
  '/:id/samples/:sampleId',
  asyncHandler(async (req, res) => {
    await assertOwned(uid(req), req.params.id);
    const result = await db
      .deleteFrom('inspiration_samples')
      .where('id', '=', req.params.sampleId)
      .where('inspiration_id', '=', req.params.id)
      .executeTakeFirst();
    if (!result.numDeletedRows) throw new HttpError(404, 'Sample not found');
    res.json({ ok: true });
  }),
);
