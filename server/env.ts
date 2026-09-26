import 'dotenv/config';
import crypto from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production.');
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[postflow] JWT_SECRET is not set — using a random secret. Sessions will reset when the server restarts.',
  );
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[postflow] ANTHROPIC_API_KEY is not set — AI generation endpoints will return an error until you add it to .env.',
  );
}

export const env = {
  isProduction,
  port: Number(process.env.PORT ?? 3001),
  jwtSecret,
  databaseFile: process.env.DATABASE_FILE ?? './data/postflow.db',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
};
