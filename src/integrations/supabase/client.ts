
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = "https://wgbbaxvuuinubkgffpiq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnYmJheHZ1dWludWJrZ2ZmcGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MTc4NjgsImV4cCI6MjA1NTM5Mzg2OH0.B_LIb8OHoe5C08YoyS9Lw5NvUlCPJB5zYP6h4klpTuk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
