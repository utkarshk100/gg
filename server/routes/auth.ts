import { Hono } from 'hono';
import { z } from 'zod';
import { newId, nowIso } from '../db/index.ts';
import type { AppEnv } from '../env.ts';
import {
  clearSessionCookie,
  hashPassword,
  rateLimit,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from '../auth.ts';
import { HttpError, parseBody } from '../lib/http.ts';
import { loadProfile } from './profile.ts';

export const authRouter = new Hono<AppEnv>();

const credentials = z.object({
  email: z.email('Enter a valid email address').transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

const authLimit = rateLimit('AUTH_LIMITER', 'Too many attempts. Wait a minute and try again.');

authRouter.post('/signup', authLimit, async (c) => {
  const db = c.get('db');
  const { email, password } = await parseBody(c, credentials);
  const existing = await db.selectFrom('users').select('id').where('email', '=', email).executeTakeFirst();
  if (existing) throw new HttpError(409, 'An account with that email already exists');

  const id = newId();
  await db
    .insertInto('users')
    .values({
      id,
      email,
      password_hash: await hashPassword(password),
      name: null,
      role: null,
      industry: null,
      created_at: nowIso(),
    })
    .execute();

  await setSessionCookie(c, id);
  return c.json({ user: await loadProfile(db, id) }, 201);
});

authRouter.post('/login', authLimit, async (c) => {
  const db = c.get('db');
  const { email, password } = await parseBody(
    c,
    credentials.extend({ password: z.string().min(1, 'Enter your password') }),
  );
  const user = await db
    .selectFrom('users')
    .select(['id', 'password_hash'])
    .where('email', '=', email)
    .executeTakeFirst();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password');
  }
  await setSessionCookie(c, user.id);
  return c.json({ user: await loadProfile(db, user.id) });
});

authRouter.post('/logout', (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (c) => {
  const user = await loadProfile(c.get('db'), c.get('userId'));
  if (!user) {
    clearSessionCookie(c);
    throw new HttpError(401, 'Not signed in');
  }
  return c.json({ user });
});
