-- ==============================================================================
-- Cadensa: Migración para Roles de Administrador, Métricas y Dashboard Privado
-- ==============================================================================

-- 1. Tabla de Administradores Autorizados
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'clinical_director')),
  granted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Política en app_admins: Evita recursividad y bloquea cualquier modificación pública
DROP POLICY IF EXISTS "Solo lectura del propio estado de admin" ON public.app_admins;
CREATE POLICY "Solo lectura del propio estado de admin"
ON public.app_admins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Función de Seguridad Zero Trust para verificación de privilegios
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.app_admins
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Función RPC invocable desde cliente para verificar rol de sesión actual
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

-- 3. Tabla de Snapshots Históricos de Métricas de Plataforma (GA4, GSC, Bing, CF)
CREATE TABLE IF NOT EXISTS public.platform_metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT current_date UNIQUE,
  ga4_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  gsc_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  bing_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  cloudflare_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_metrics_snapshot_date ON public.platform_metrics_snapshots(snapshot_date DESC);

-- Políticas RLS para snapshots de métricas:
-- Solo administradores pueden consultar el historial completo
DROP POLICY IF EXISTS "Admins pueden consultar snapshots de metricas" ON public.platform_metrics_snapshots;
CREATE POLICY "Admins pueden consultar snapshots de metricas"
ON public.platform_metrics_snapshots FOR SELECT
TO authenticated
USING (public.is_admin());

-- Inserción / Actualización permitida para administradores y service_role
DROP POLICY IF EXISTS "Admins pueden insertar snapshots de metricas" ON public.platform_metrics_snapshots;
CREATE POLICY "Admins pueden insertar snapshots de metricas"
ON public.platform_metrics_snapshots FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Extensión de Políticas RLS para Gestión de Feedback
-- Los administradores pueden leer TODOS los reportes de retroalimentación
DROP POLICY IF EXISTS "Admins pueden ver todos los reportes de feedback" ON public.feedback_reports;
CREATE POLICY "Admins pueden ver todos los reportes de feedback"
ON public.feedback_reports FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

-- Los administradores pueden actualizar el estado de los reportes (pending, reviewed, resolved, discarded)
DROP POLICY IF EXISTS "Admins pueden actualizar estado de reportes" ON public.feedback_reports;
CREATE POLICY "Admins pueden actualizar estado de reportes"
ON public.feedback_reports FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Extensión de Políticas RLS para Monitoreo de Perfiles y Actividad de Usuarios
DROP POLICY IF EXISTS "Admins pueden consultar todos los perfiles de usuario" ON public.profiles;
CREATE POLICY "Admins pueden consultar todos los perfiles de usuario"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = id);

-- Acceso de lectura a estadísticas agregadas de entrenamiento para administradores
DROP POLICY IF EXISTS "Admins pueden consultar todas las sesiones de entrenamiento" ON public.training_sessions;
CREATE POLICY "Admins pueden consultar todas las sesiones de entrenamiento"
ON public.training_sessions FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins pueden consultar rachas de todos los usuarios" ON public.user_streaks;
CREATE POLICY "Admins pueden consultar rachas de todos los usuarios"
ON public.user_streaks FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);
