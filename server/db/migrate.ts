import { db, migrateToLatest } from './index.ts';

migrateToLatest()
  .then(() => console.log('[db] database is up to date'))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
