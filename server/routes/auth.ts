import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, newId, nowIso } from '../db/index.ts';
import { clearSessionCookie, requireAuth, setSessionCookie, uid } from '../auth.ts';
import { asyncHandler, HttpError, parseBody } from '../lib/http.ts';
import { loadProfile } from './profile.ts';

export const authRouter = Router();

const credentials = z.object({
  email: z.email('Enter a valid email address').transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { email, password } = parseBody(credentials, req.body);
    const existing = await db.selectFrom('users').select('id').where('email', '=', email).executeTakeFirst();
    if (existing) throw new HttpError(409, 'An account with that email already exists');

    const id = newId();
    await db
      .insertInto('users')
      .values({
        id,
        email,
        password_hash: await bcrypt.hash(password, 12),
        name: null,
        role: null,
        industry: null,
        created_at: nowIso(),
      })
      .execute();

    setSessionCookie(res, id);
    res.status(201).json({ user: await loadProfile(id) });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = parseBody(
      credentials.extend({ password: z.string().min(1, 'Enter your password') }),
      req.body,
    );
    const user = await db
      .selectFrom('users')
      .select(['id', 'password_hash'])
      .where('email', '=', email)
      .executeTakeFirst();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, 'Incorrect email or password');
    }
    setSessionCookie(res, user.id);
    res.json({ user: await loadProfile(user.id) });
  }),
);

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await loadProfile(uid(req));
    if (!user) {
      clearSessionCookie(res);
      throw new HttpError(401, 'Not signed in');
    }
    res.json({ user });
  }),
);
