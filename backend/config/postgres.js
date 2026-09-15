const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

const checkPostgresConnection = async () => {
  if (!pool) {
    return { connected: false, message: 'DATABASE_URL not set or contains password placeholder' };
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('[PostgreSQL] Connected to Supabase DB successfully at', result.rows[0].now);
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.warn(`[PostgreSQL Warning] Connection attempt failed: ${error.message}`);
    return { connected: false, error: error.message };
  }
};

module.exports = {
  pool,
  query: (text, params) => (pool ? pool.query(text, params) : Promise.reject(new Error('PostgreSQL pool not initialized'))),
  checkPostgresConnection,
};
