const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lhhutylzxdasaguduyzg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_So36LJZGMKtzR28IVNeouQ_q-0dYUh9';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase Warning] SUPABASE_URL or SUPABASE_KEY is not defined in environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const checkSupabaseConnection = async () => {
  try {
    // Quick test against Supabase Auth endpoint
    const { data, error } = await supabase.auth.getSession();
    if (error && error.status !== 400 && error.status !== 401) {
      console.warn(`[Supabase Status] Notice: ${error.message}`);
    } else {
      console.log(`[Supabase] Connected to project: ${supabaseUrl}`);
    }
    return { connected: true, url: supabaseUrl };
  } catch (err) {
    console.error(`[Supabase Error] Connection test failed: ${err.message}`);
    return { connected: false, error: err.message };
  }
};

module.exports = {
  supabase,
  checkSupabaseConnection,
};
