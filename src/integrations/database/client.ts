
import { Client } from 'pg';
import { Database } from '@replit/database';

const db = new Client({
  connectionString: process.env.REPLIT_DB_URL,
});

const kvDb = new Database(); // Replit KV store for simpler data

export { db, kvDb };
