
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

// Determine if we should use mock services
// We default to true if the URL is the placeholder
export const isMockMode = supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseKey);
