import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Migrator, type MigrationProvider } from 'kysely/migration';
import { env } from '../env.ts';
import { migrations } from './migrations.ts';
import type { Database } from './schema.ts';

// To move to Postgres later: swap this dialect for Kysely's PostgresDialect
// (with a `pg` Pool). Queries and migrations are written to stay portable.
function createDialect() {
  const file = path.resolve(env.databaseFile);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new SQLite(file);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return new SqliteDialect({ database: sqlite });
}

export const db = new Kysely<Database>({ dialect: createDialect() });

const provider: MigrationProvider = {
  getMigrations: async () => migrations,
};

export async function migrateToLatest() {
  const migrator = new Migrator({ db, provider });
  const { error, results } = await migrator.migrateToLatest();
  for (const r of results ?? []) {
    if (r.status === 'Success') console.log(`[db] applied migration ${r.migrationName}`);
    if (r.status === 'Error') console.error(`[db] failed migration ${r.migrationName}`);
  }
  if (error) throw error;
}

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();
