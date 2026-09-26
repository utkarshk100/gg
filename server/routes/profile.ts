import { Hono } from 'hono';
import type { Kysely } from 'kysely';
import { z } from 'zod';
import { newId, runBatch } from '../db/index.ts';
import type { Database } from '../db/schema.ts';
import type { AppEnv } from '../env.ts';
import { requireAuth } from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';

export const profileRouter = new Hono<AppEnv>();
profileRouter.use(requireAuth);

export async function loadProfile(db: Kysely<Database>, userId: string) {
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

profileRouter.get('/', async (c) => {
  const profile = await loadProfile(c.get('db'), c.get('userId'));
  if (!profile) throw new HttpError(404, 'User not found');
  return c.json({ user: profile });
});

profileRouter.put('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const body = await parseBody(c, profileUpdate);

  const updates: Record<string, string | number | null> = {};
  for (const key of ['name', 'role', 'industry'] as const) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed ? 1 : 0;

  const queries = [];
  if (Object.keys(updates).length) {
    queries.push(db.updateTable('users').set(updates).where('id', '=', userId));
  }
  if (body.content_pillars) {
    const unique = [...new Map(body.content_pillars.map((t) => [t.toLowerCase(), t])).values()];
    queries.push(db.deleteFrom('content_pillars').where('user_id', '=', userId));
    if (unique.length) {
      queries.push(
        db.insertInto('content_pillars').values(unique.map((topic) => ({ id: newId(), user_id: userId, topic }))),
      );
    }
  }
  await runBatch(c.env.DB, queries);

  return c.json({ user: await loadProfile(db, userId) });
});
