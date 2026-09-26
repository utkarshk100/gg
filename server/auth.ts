import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import type { AppEnv } from './env.ts';
import { HttpError } from './lib/http.ts';

export const SESSION_COOKIE = 'postflow_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

// ---------------------------------------------------------------------------
// Password hashing: PBKDF2-SHA256 via Web Crypto (built into Workers).
// Workers caps PBKDF2 at 100,000 iterations.
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 100_000;
const encoder = new TextEncoder();

const toB64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, expected] = stored.split('$');
  if (scheme !== 'pbkdf2-sha256' || !iterations || !salt || !expected) return false;
  const actual = new Uint8Array(await pbkdf2(password, fromB64(salt), Number(iterations)));
  const want = fromB64(expected);
  return actual.byteLength === want.byteLength && crypto.subtle.timingSafeEqual(actual, want);
}

// ---------------------------------------------------------------------------
// Sessions: a signed JWT in an httpOnly cookie.
// ---------------------------------------------------------------------------

function jwtSecret(c: Context<AppEnv>) {
  const secret = c.env.JWT_SECRET;
  if (!secret) throw new HttpError(503, 'Server is missing JWT_SECRET. Set it with `npx wrangler secret put JWT_SECRET`.');
  return secret;
}

export async function setSessionCookie(c: Context<AppEnv>, userId: string) {
  const token = await sign(
    { sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS },
    jwtSecret(c),
    'HS256',
  );
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: new URL(c.req.url).protocol === 'https:',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export function clearSessionCookie(c: Context<AppEnv>) {
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return c.json({ error: 'Not signed in' }, 401);
  try {
    const payload = await verify(token, jwtSecret(c), 'HS256');
    if (typeof payload.sub !== 'string') throw new Error('bad token');
    c.set('userId', payload.sub);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    clearSessionCookie(c);
    return c.json({ error: 'Session expired — please sign in again' }, 401);
  }
  await next();
};

// ---------------------------------------------------------------------------
// Rate limiting via Cloudflare's rate limiting bindings.
// ---------------------------------------------------------------------------

export const rateLimit =
  (binding: 'AUTH_LIMITER' | 'AI_LIMITER', message: string): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const limiter = c.env[binding];
    if (limiter) {
      const key = binding === 'AI_LIMITER' ? c.get('userId') : (c.req.header('CF-Connecting-IP') ?? 'unknown');
      const { success } = await limiter.limit({ key });
      if (!success) return c.json({ error: message }, 429);
    }
    await next();
  };
