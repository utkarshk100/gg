import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './env.ts';

export const SESSION_COOKIE = 'postflow_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function setSessionCookie(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: SESSION_TTL_SECONDS });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad token');
    req.userId = payload.sub;
    next();
  } catch {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Session expired — please sign in again' });
  }
}

/** Use after requireAuth; narrows req.userId to a string. */
export const uid = (req: Request) => req.userId as string;
