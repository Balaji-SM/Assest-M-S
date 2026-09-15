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
  const hashEnterprise = await bcrypt.hash('Admin@123456', 10);
  const hashAdmin123 = await bcrypt.hash('admin123', 10);

  await pool.query(`
    INSERT INTO public.users (id, name, email, password, role, department)
    VALUES 
      ('a0000000-0000-0000-0000-000000000002', 'BALAJI', 'admin@enterprise.com', $1, 'admin', 'IT Infrastructure'),
      ('a0000000-0000-0000-0000-000000000003', 'Enterprise User', 'user@enterprise.com', $1, 'employee', 'Engineering')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
  `, [hashEnterprise]);

  await pool.query(`
    UPDATE public.users SET password = $1 WHERE email = 'admin@assetflow.com';
  `, [hashAdmin123]);

  console.log('[Supabase] Added admin@enterprise.com (Password: Admin@123456) and user@enterprise.com');
  const res = await pool.query('SELECT id, email, name, role FROM public.users');
  console.log('[Supabase] Active users:', res.rows);
  await pool.end();
}

addUsers().catch(console.error);
