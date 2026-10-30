-- ==============================================================================
-- Cadensa: Migración para Telemetría de Errores en Cliente y Observabilidad
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.client_telemetry_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL DEFAULT 'javascript_error',
  error_message text NOT NULL,
  stack_trace text,
  component text,
  url text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (Zero Trust RLS)
ALTER TABLE public.client_telemetry_errors ENABLE ROW LEVEL SECURITY;

-- Índices de consulta para administración y auditoría forense
CREATE INDEX IF NOT EXISTS idx_client_telemetry_errors_created_at ON public.client_telemetry_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_telemetry_errors_event_name ON public.client_telemetry_errors(event_name);
CREATE INDEX IF NOT EXISTS idx_client_telemetry_errors_user_id ON public.client_telemetry_errors(user_id);

-- Políticas RLS:
-- 1. Inserción protegida contra suplantación:
--    - Anónimos solo pueden insertar con user_id = NULL
--    - Usuarios autenticados pueden insertar con su propio user_id verificado o NULL
DROP POLICY IF EXISTS "Permitir insercion de telemetria a anonimos y autenticados" ON public.client_telemetry_errors;
CREATE POLICY "Permitir insercion de telemetria a anonimos y autenticados"
ON public.client_telemetry_errors
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (user_id IS NULL AND auth.uid() IS NULL)
  OR
  (user_id IS NULL AND auth.uid() IS NOT NULL)
  OR
  (user_id = auth.uid())
);

-- 2. Lectura: Blind-Drop estricto.
--    Solo administradores (is_admin()) pueden consultar los errores reportados.
DROP POLICY IF EXISTS "Solo administradores pueden consultar errores de telemetria" ON public.client_telemetry_errors;
CREATE POLICY "Solo administradores pueden consultar errores de telemetria"
ON public.client_telemetry_errors
FOR SELECT
TO authenticated
USING (public.is_admin());

