import { Hono } from 'hono';
import { z } from 'zod';
import type { DraftsTable } from '../db/schema.ts';
import type { AppEnv } from '../env.ts';
import { requireAuth } from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';

export const draftsRouter = new Hono<AppEnv>();
draftsRouter.use(requireAuth);

export function serializeDraft(row: DraftsTable) {
  const { user_id: _userId, hashtags_json, ...rest } = row;
  return { ...rest, hashtags: JSON.parse(hashtags_json) as string[] };
}

const postText = z.string().trim().min(1, 'Post cannot be empty').max(3000, 'LinkedIn posts max out at 3,000 characters');

draftsRouter.get('/recent', async (c) => {
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 12, 1), 50);
  const rows = await c
    .get('db')
    .selectFrom('drafts')
    .selectAll()
    .where('user_id', '=', c.get('userId'))
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute();
  return c.json({ drafts: rows.map(serializeDraft) });
});

draftsRouter.get('/stats', async (c) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await c
    .get('db')
    .selectFrom('drafts')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('user_id', '=', c.get('userId'))
    .where('created_at', '>=', since)
    .executeTakeFirstOrThrow();
  return c.json({ last_7_days: Number(count) });
});

draftsRouter.patch('/:id/status', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await parseBody(c, z.object({ status: z.enum(['copied', 'discarded']), post_text: postText.optional() }));

  let query = db
    .updateTable('drafts')
    .set(body.post_text ? { status: body.status, post_text: body.post_text } : { status: body.status })
    .where('id', '=', id)
    .where('user_id', '=', userId);
  // A copied draft was (probably) posted — never downgrade it to discarded.
  if (body.status === 'discarded') query = query.where('status', '=', 'generated');
  await query.execute();

  const row = await db.selectFrom('drafts').selectAll().where('id', '=', id).where('user_id', '=', userId).executeTakeFirst();
  if (!row) throw new HttpError(404, 'Draft not found');
  return c.json({ draft: serializeDraft(row) });
});

draftsRouter.patch('/:id', async (c) => {
  const { post_text } = await parseBody(c, z.object({ post_text: postText }));
  const result = await c
    .get('db')
    .updateTable('drafts')
    .set({ post_text })
    .where('id', '=', c.req.param('id'))
    .where('user_id', '=', c.get('userId'))
    .executeTakeFirst();
  if (!result.numUpdatedRows) throw new HttpError(404, 'Draft not found');
  return c.json({ ok: true });
});

// Bulk-discard drafts that were never copied (called when leaving the results
// screen, including via navigator.sendBeacon on tab close).
draftsRouter.post('/discard', async (c) => {
  const { ids } = await parseBody(c, z.object({ ids: z.array(z.string()).max(20) }));
  if (ids.length) {
    await c
      .get('db')
      .updateTable('drafts')
      .set({ status: 'discarded' })
      .where('user_id', '=', c.get('userId'))
      .where('id', 'in', ids)
      .where('status', '=', 'generated')
      .execute();
  }
  return c.json({ ok: true });
});
