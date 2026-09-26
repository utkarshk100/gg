import { Kysely, type Compilable } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from './schema.ts';

export const createDb = (d1: D1Database) => new Kysely<Database>({ dialect: new D1Dialect({ database: d1 }) });

/**
 * Runs several Kysely queries atomically. D1 has no interactive transactions,
 * but a batch executes as a single all-or-nothing transaction.
 */
export async function runBatch(d1: D1Database, queries: Compilable[]) {
  if (!queries.length) return;
  await d1.batch(
    queries.map((q) => {
      const { sql, parameters } = q.compile();
      return d1.prepare(sql).bind(...parameters);
    }),
  );
}

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();
