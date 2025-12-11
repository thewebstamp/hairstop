// lib/db.ts
import { Pool } from 'pg';

// PostgreSQL pool for raw queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = async () => {
  const client = await pool.connect();
  return {
    query: (text: string, params?: any[]) => client.query(text, params),
    release: () => client.release()
  };
};

export default {
  query,
  getClient,
  pool
};