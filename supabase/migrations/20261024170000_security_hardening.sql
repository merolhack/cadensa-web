-- ==============================================================================
-- Cadensa: Migración de Endurecimiento de Seguridad (Security Hardening)
-- ==============================================================================

-- 1. Asegurar tabla de control de migraciones con RLS activo y acceso público revocado
CREATE TABLE IF NOT EXISTS public._schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS para eliminar la alerta CRÍTICA del Security Advisor de Supabase
ALTER TABLE public._schema_migrations ENABLE ROW LEVEL SECURITY;

-- Revocar cualquier acceso anónimo o autenticado directo vía PostgREST
REVOKE ALL ON TABLE public._schema_migrations FROM anon, authenticated;

-- 2. Mitigación de Vulnerabilidad de Búsqueda de Rutas (search_path) en SECURITY DEFINER
-- Al fijar 'set search_path = ''' evitamos posibles ataques de secuestro de ruta (search_path poisoning)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;
