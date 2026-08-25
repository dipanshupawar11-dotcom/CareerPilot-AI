const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing in backend .env");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY is missing in backend .env");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

module.exports = supabase;