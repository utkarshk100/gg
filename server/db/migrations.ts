import { sql, type Kysely } from 'kysely';
import type { Migration } from 'kysely/migration';

// Migrations use only portable column types (text/integer) and string UUID
// primary keys so the same definitions run on SQLite and Postgres.
export const migrations: Record<string, Migration> = {
  '001_initial': {
    async up(db: Kysely<any>) {
      await db.schema
        .createTable('users')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('email', 'text', (c) => c.notNull().unique())
        .addColumn('password_hash', 'text', (c) => c.notNull())
        .addColumn('name', 'text')
        .addColumn('role', 'text')
        .addColumn('industry', 'text')
        .addColumn('onboarding_completed', 'integer', (c) => c.notNull().defaultTo(0))
        .addColumn('created_at', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('content_pillars')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('user_id', 'text', (c) => c.notNull().references('users.id').onDelete('cascade'))
        .addColumn('topic', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('voice_samples')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('user_id', 'text', (c) => c.notNull().references('users.id').onDelete('cascade'))
        .addColumn('sample_text', 'text', (c) => c.notNull())
        .addColumn('created_at', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('voice_profiles')
        .addColumn('user_id', 'text', (c) => c.primaryKey().references('users.id').onDelete('cascade'))
        .addColumn('traits_json', 'text', (c) => c.notNull())
        .addColumn('samples_hash', 'text', (c) => c.notNull())
        .addColumn('analyzed_at', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('inspirations')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('user_id', 'text', (c) => c.notNull().references('users.id').onDelete('cascade'))
        .addColumn('name', 'text', (c) => c.notNull())
        .addColumn('created_at', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('inspiration_samples')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('inspiration_id', 'text', (c) =>
          c.notNull().references('inspirations.id').onDelete('cascade'),
        )
        .addColumn('sample_text', 'text', (c) => c.notNull())
        .execute();

      await db.schema
        .createTable('drafts')
        .addColumn('id', 'text', (c) => c.primaryKey())
        .addColumn('user_id', 'text', (c) => c.notNull().references('users.id').onDelete('cascade'))
        .addColumn('one_liner', 'text', (c) => c.notNull())
        .addColumn('style_mode', 'text', (c) => c.notNull())
        .addColumn('post_text', 'text', (c) => c.notNull())
        .addColumn('hook_line', 'text', (c) => c.notNull())
        .addColumn('hashtags_json', 'text', (c) => c.notNull().defaultTo('[]'))
        .addColumn('status', 'text', (c) =>
          c.notNull().defaultTo('generated').check(sql`status in ('generated', 'copied', 'discarded')`),
        )
        .addColumn('created_at', 'text', (c) => c.notNull())
        .execute();

      await db.schema.createIndex('content_pillars_user_idx').on('content_pillars').column('user_id').execute();
      await db.schema.createIndex('voice_samples_user_idx').on('voice_samples').column('user_id').execute();
      await db.schema.createIndex('inspirations_user_idx').on('inspirations').column('user_id').execute();
      await db.schema
        .createIndex('inspiration_samples_insp_idx')
        .on('inspiration_samples')
        .column('inspiration_id')
        .execute();
      await db.schema.createIndex('drafts_user_created_idx').on('drafts').columns(['user_id', 'created_at']).execute();
    },
    async down(db: Kysely<any>) {
      for (const t of [
        'drafts',
        'inspiration_samples',
        'inspirations',
        'voice_profiles',
        'voice_samples',
        'content_pillars',
        'users',
      ]) {
        await db.schema.dropTable(t).ifExists().execute();
      }
    },
  },
};
