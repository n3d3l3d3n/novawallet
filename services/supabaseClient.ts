
import { createClient } from '@supabase/supabase-js';

// Access environment variables
// Note: In a real production build, these should be in a .env file.
// For this environment, we assume they are injected or we provide placeholders to prevent crashing.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
