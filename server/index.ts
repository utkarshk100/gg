import path from 'node:path';
import fs from 'node:fs';
import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './env.ts';
import { migrateToLatest } from './db/index.ts';
import { HttpError } from './lib/http.ts';
import { authRouter } from './routes/auth.ts';
import { profileRouter } from './routes/profile.ts';
import { voiceProfileRouter, voiceSamplesRouter } from './routes/voice.ts';
import { inspirationsRouter } from './routes/inspirations.ts';
import { generateRouter } from './routes/generate.ts';
import { draftsRouter } from './routes/drafts.ts';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'You are generating very quickly — take a breath and try again in a minute.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/voice-samples', voiceSamplesRouter);
app.use('/api/voice-profile/analyze', aiLimiter);
app.use('/api/voice-profile', voiceProfileRouter);
app.use('/api/inspirations', inspirationsRouter);
app.use('/api/generate', aiLimiter, generateRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// In production, serve the built frontend from the same server.
const distDir = path.resolve('dist');
if (env.isProduction && fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON body' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

await migrateToLatest();
app.listen(env.port, () => {
  console.log(`[postflow] API listening on http://localhost:${env.port}`);
});
