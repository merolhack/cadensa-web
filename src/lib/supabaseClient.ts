import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// En entornos de Node.js < 22 (como pruebas BDD en CLI), proveer polyfill para WebSocket
if (typeof window === 'undefined' && !(globalThis as unknown as { WebSocket: unknown }).WebSocket) {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = class WebSocket {
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Inicialización estricta con el tipo Database para tipado fuerte en cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
