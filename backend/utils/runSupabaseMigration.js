const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Balaji%40151606@db.lhhutylzxdasaguduyzg.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const schemaPath = path.join(__dirname, '../../supabase-schema.sql');
  console.log(`[Migration] Reading schema from: ${schemaPath}`);
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('[Migration] Executing SQL migration on Supabase PostgreSQL...');
    await client.query(sql);
    console.log('[Migration] Schema executed successfully!');

    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('[Migration] Public tables now available:', tableRes.rows.map(r => r.table_name));

    const userCount = await client.query('SELECT COUNT(*) FROM public.users');
    const assetCount = await client.query('SELECT COUNT(*) FROM public.assets');
    const employeeCount = await client.query('SELECT COUNT(*) FROM public.employees');

    console.log(`[Migration Stats] Users: ${userCount.rows[0].count}, Employees: ${employeeCount.rows[0].count}, Assets: ${assetCount.rows[0].count}`);
  } catch (err) {
    console.error('[Migration Error]:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
