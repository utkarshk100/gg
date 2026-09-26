import type { Kysely } from 'kysely';
import type { Database } from './db/schema.ts';

/** Bindings configured in wrangler.jsonc, plus secrets set with `wrangler secret put`. */
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  AUTH_LIMITER?: RateLimit;
  AI_LIMITER?: RateLimit;
  ANTHROPIC_API_KEY?: string;
  JWT_SECRET?: string;
  ANTHROPIC_MODEL?: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    db: Kysely<Database>;
    userId: string;
  };
};
