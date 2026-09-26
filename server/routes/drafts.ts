import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.ts';
import type { DraftsTable } from '../db/schema.ts';
import { requireAuth, uid } from '../auth.ts';
import { asyncHandler, HttpError, parseBody } from '../lib/http.ts';

export const draftsRouter = Router();
draftsRouter.use(requireAuth);

export function serializeDraft(row: DraftsTable) {
  const { user_id: _userId, hashtags_json, ...rest } = row;
  return { ...rest, hashtags: JSON.parse(hashtags_json) as string[] };
}

const postText = z.string().trim().min(1, 'Post cannot be empty').max(3000, 'LinkedIn posts max out at 3,000 characters');

draftsRouter.get(
  '/recent',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const rows = await db
      .selectFrom('drafts')
      .selectAll()
      .where('user_id', '=', uid(req))
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
    res.json({ drafts: rows.map(serializeDraft) });
  }),
);

draftsRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await db
      .selectFrom('drafts')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('user_id', '=', uid(req))
      .where('created_at', '>=', since)
      .executeTakeFirstOrThrow();
    res.json({ last_7_days: Number(count) });
  }),
);

draftsRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const body = parseBody(
      z.object({ status: z.enum(['copied', 'discarded']), post_text: postText.optional() }),
      req.body,
    );

    let query = db
      .updateTable('drafts')
      .set(body.post_text ? { status: body.status, post_text: body.post_text } : { status: body.status })
      .where('id', '=', req.params.id)
      .where('user_id', '=', userId);
    // A copied draft was (probably) posted — never downgrade it to discarded.
    if (body.status === 'discarded') query = query.where('status', '=', 'generated');
    await query.execute();

    const row = await db
      .selectFrom('drafts')
      .selectAll()
      .where('id', '=', req.params.id)
      .where('user_id', '=', userId)
      .executeTakeFirst();
    if (!row) throw new HttpError(404, 'Draft not found');
    res.json({ draft: serializeDraft(row) });
  }),
);

draftsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const { post_text } = parseBody(z.object({ post_text: postText }), req.body);
    const result = await db
      .updateTable('drafts')
      .set({ post_text })
      .where('id', '=', req.params.id)
      .where('user_id', '=', userId)
      .executeTakeFirst();
    if (!result.numUpdatedRows) throw new HttpError(404, 'Draft not found');
    res.json({ ok: true });
  }),
);

// Bulk-discard drafts that were never copied (called when leaving the results
// screen, including via navigator.sendBeacon on tab close).
draftsRouter.post(
  '/discard',
  asyncHandler(async (req, res) => {
    const { ids } = parseBody(z.object({ ids: z.array(z.string()).max(20) }), req.body);
    if (ids.length) {
      await db
        .updateTable('drafts')
        .set({ status: 'discarded' })
        .where('user_id', '=', uid(req))
        .where('id', 'in', ids)
        .where('status', '=', 'generated')
        .execute();
    }
    res.json({ ok: true });
  }),
);
