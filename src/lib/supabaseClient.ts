import { createClient } from '@supabase/supabase-js';
// Importamos los tipos generados automáticamente, los cuales crearemos más adelante
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Inicialización estricta con el tipo Database para tipado fuerte en cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
