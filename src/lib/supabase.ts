import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client.
// We prefer using the Service Role Key for backend uploads to bypass RLS,
// but fallback to Anon Key if not provided.
export const supabase = createClient(supabaseUrl, supabaseKey);
