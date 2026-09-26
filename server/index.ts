import { Hono } from 'hono';
import { createDb } from './db/index.ts';
import type { AppEnv } from './env.ts';
import { HttpError } from './lib/http.ts';
import { authRouter } from './routes/auth.ts';
import { profileRouter } from './routes/profile.ts';
import { voiceProfileRouter, voiceSamplesRouter } from './routes/voice.ts';
import { inspirationsRouter } from './routes/inspirations.ts';
import { generateRouter } from './routes/generate.ts';
import { draftsRouter } from './routes/drafts.ts';

// Handles /api/* only. Everything else is served from the static React build
// (see "assets" in wrangler.jsonc).
const app = new Hono<AppEnv>().basePath('/api');

app.use(async (c, next) => {
  c.set('db', createDb(c.env.DB));
  await next();
});

app.get('/health', (c) => c.json({ ok: true }));
app.route('/auth', authRouter);
app.route('/profile', profileRouter);
app.route('/voice-samples', voiceSamplesRouter);
app.route('/voice-profile', voiceProfileRouter);
app.route('/inspirations', inspirationsRouter);
app.route('/generate', generateRouter);
app.route('/drafts', draftsRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Something went wrong. Please try again.' }, 500);
});

export default app;
