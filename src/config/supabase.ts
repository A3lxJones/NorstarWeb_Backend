import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
	throw new Error(
		'Missing Supabase environment variables. Check your .env file.'
	);
}

// Public client — respects Row Level Security (RLS)
// Use this for operations on behalf of authenticated users
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — bypasses RLS
// Use this ONLY for admin operations (reports, user management)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Factory: create a fresh anon client per request for auth operations.
// The Supabase client is stateful (stores sessions internally), so sharing
// a single instance across concurrent server requests corrupts auth state.
export function createAnonClient() {
	return createClient(supabaseUrl!, supabaseAnonKey!);
}
