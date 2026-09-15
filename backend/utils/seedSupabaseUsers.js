const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Balaji%40151606@db.lhhutylzxdasaguduyzg.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function addUsers() {
  const hashBalaji = await bcrypt.hash('Balaji@151606', 10);
  const hashEnterprise = await bcrypt.hash('Admin@123456', 10);

  // Personalized Administrator accounts
  await pool.query(`
    INSERT INTO public.users (id, name, email, password, role, department, phone)
    VALUES 
      ('a0000000-0000-0000-0000-000000000010', 'Balaji S', 'balaji@assetflow.tech', $1, 'admin', 'Management / Architecture', '+91 98765 43210'),
      ('a0000000-0000-0000-0000-000000000011', 'Balaji S', 'balaji@assetflow.com', $1, 'admin', 'Management / Architecture', '+91 98765 43210'),
      ('a0000000-0000-0000-0000-000000000002', 'Balaji S', 'admin@enterprise.com', $2, 'admin', 'IT Infrastructure', '+91 98765 43210')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name;
  `, [hashBalaji, hashEnterprise]);

  console.log('[Supabase] Added valid personalized accounts for Balaji!');
  const res = await pool.query('SELECT id, email, name, role FROM public.users ORDER BY created_at DESC');
  console.log('[Supabase] Current Active Users in Database:');
  console.table(res.rows);
  await pool.end();
}

addUsers().catch(console.error);
