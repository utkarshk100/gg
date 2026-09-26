import { Router } from 'express';
import { z } from 'zod';
import { db, newId } from '../db/index.ts';
import { requireAuth, uid } from '../auth.ts';
import { asyncHandler, HttpError, parseBody } from '../lib/http.ts';

export const profileRouter = Router();
profileRouter.use(requireAuth);

export async function loadProfile(userId: string) {
  const user = await db
    .selectFrom('users')
    .select(['id', 'email', 'name', 'role', 'industry', 'onboarding_completed', 'created_at'])
    .where('id', '=', userId)
    .executeTakeFirst();
  if (!user) return null;
  const pillars = await db
    .selectFrom('content_pillars')
    .select('topic')
    .where('user_id', '=', userId)
    .orderBy('topic')
    .execute();
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    industry: user.industry,
    onboarding_completed: Boolean(user.onboarding_completed),
    created_at: user.created_at,
    content_pillars: pillars.map((p) => p.topic),
  };
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable()
    .optional();

const profileUpdate = z.object({
  name: optionalText(100),
  role: optionalText(100),
  industry: optionalText(100),
  content_pillars: z.array(z.string().trim().min(1).max(60)).max(5, 'You can have at most 5 content pillars').optional(),
  onboarding_completed: z.boolean().optional(),
});

profileRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const profile = await loadProfile(uid(req));
    if (!profile) throw new HttpError(404, 'User not found');
    res.json({ user: profile });
  }),
);

profileRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const userId = uid(req);
    const body = parseBody(profileUpdate, req.body);

    await db.transaction().execute(async (trx) => {
      const updates: Record<string, unknown> = {};
      for (const key of ['name', 'role', 'industry'] as const) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed ? 1 : 0;
      if (Object.keys(updates).length) {
        await trx.updateTable('users').set(updates).where('id', '=', userId).execute();
      }

      if (body.content_pillars) {
        const unique = [...new Map(body.content_pillars.map((t) => [t.toLowerCase(), t])).values()];
        await trx.deleteFrom('content_pillars').where('user_id', '=', userId).execute();
        if (unique.length) {
          await trx
            .insertInto('content_pillars')
            .values(unique.map((topic) => ({ id: newId(), user_id: userId, topic })))
            .execute();
        }
      }
    });

    res.json({ user: await loadProfile(userId) });
  }),
);
