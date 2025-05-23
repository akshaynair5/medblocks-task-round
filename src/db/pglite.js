import { PGlite } from '@electric-sql/pglite';

const db = new PGlite('idb://patient-db');
await db.ready;

await db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    ailment TEXT
  );
`);

export default db;