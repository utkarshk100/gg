import { Hono } from 'hono';
import type { Kysely } from 'kysely';
import { z } from 'zod';
import { newId, nowIso, runBatch } from '../db/index.ts';
import type { Database } from '../db/schema.ts';
import type { AppEnv } from '../env.ts';
import { requireAuth } from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';

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

export const inspirationsRouter = new Hono<AppEnv>();
inspirationsRouter.use(requireAuth);

export async function listInspirations(db: Kysely<Database>, userId: string) {
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

async function assertOwned(db: Kysely<Database>, userId: string, inspirationId: string) {
  const row = await db
    .selectFrom('inspirations')
    .select('id')
    .where('id', '=', inspirationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
  if (!row) throw new HttpError(404, 'Inspiration not found');
}

const findInspiration = async (db: Kysely<Database>, userId: string, id: string) =>
  (await listInspirations(db, userId)).find((i) => i.id === id);

const insertSamples = (db: Kysely<Database>, inspirationId: string, samples: string[]) =>
  db
    .insertInto('inspiration_samples')
    .values(samples.map((sample_text) => ({ id: newId(), inspiration_id: inspirationId, sample_text })));

inspirationsRouter.get('/', async (c) => {
  return c.json({ inspirations: await listInspirations(c.get('db'), c.get('userId')) });
});

inspirationsRouter.post('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const body = await parseBody(c, inspirationBody);

  const { count } = await db
    .selectFrom('inspirations')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow();
  if (Number(count) >= MAX_INSPIRATIONS) {
    throw new HttpError(400, `You can save up to ${MAX_INSPIRATIONS} inspirations`);
  }

  const id = newId();
  await runBatch(c.env.DB, [
    db.insertInto('inspirations').values({ id, user_id: userId, name: body.name, created_at: nowIso() }),
    ...(body.samples.length ? [insertSamples(db, id, body.samples)] : []),
  ]);

  return c.json({ inspiration: await findInspiration(db, userId, id) }, 201);
});

// Replaces the name and full sample list — used by the editable cards.
inspirationsRouter.put('/:id', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const id = c.req.param('id');
  await assertOwned(db, userId, id);
  const body = await parseBody(c, inspirationBody);

  await runBatch(c.env.DB, [
    db.updateTable('inspirations').set({ name: body.name }).where('id', '=', id),
    db.deleteFrom('inspiration_samples').where('inspiration_id', '=', id),
    ...(body.samples.length ? [insertSamples(db, id, body.samples)] : []),
  ]);

  return c.json({ inspiration: await findInspiration(db, userId, id) });
});

inspirationsRouter.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await assertOwned(db, c.get('userId'), id);
  await runBatch(c.env.DB, [
    db.deleteFrom('inspiration_samples').where('inspiration_id', '=', id),
    db.deleteFrom('inspirations').where('id', '=', id),
  ]);
  return c.json({ ok: true });
});

inspirationsRouter.get('/:id/samples', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await assertOwned(db, c.get('userId'), id);
  const samples = await db
    .selectFrom('inspiration_samples')
    .select(['id', 'sample_text'])
    .where('inspiration_id', '=', id)
    .execute();
  return c.json({ samples });
});

inspirationsRouter.post('/:id/samples', async (c) => {
  const db = c.get('db');
  const inspirationId = c.req.param('id');
  await assertOwned(db, c.get('userId'), inspirationId);
  const { sample_text } = await parseBody(c, z.object({ sample_text: sampleText }));
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
  return c.json({ sample: { id: sample.id, sample_text } }, 201);
});

inspirationsRouter.delete('/:id/samples/:sampleId', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await assertOwned(db, c.get('userId'), id);
  const result = await db
    .deleteFrom('inspiration_samples')
    .where('id', '=', c.req.param('sampleId'))
    .where('inspiration_id', '=', id)
    .executeTakeFirst();
  if (!result.numDeletedRows) throw new HttpError(404, 'Sample not found');
  return c.json({ ok: true });
});
