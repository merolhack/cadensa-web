-- ==============================================================================
-- Cadensa: Migración para Sistema de Feedback y Reporte de Errores (Zero Trust)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('video_issue', 'technique_issue', 'suggestion', 'other')),
  technique_id text,
  message text NOT NULL CHECK (length(message) >= 10 AND length(message) <= 1000),
  contact_email text CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'discarded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (Zero Trust RLS)
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Índices de consulta y auditoría
CREATE INDEX IF NOT EXISTS idx_feedback_reports_status ON public.feedback_reports(status);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_user_id ON public.feedback_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_category ON public.feedback_reports(category);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_created_at ON public.feedback_reports(created_at DESC);

-- Políticas RLS:
-- 1. Inserción protegida contra suplantación:
--    - Anónimos solo pueden insertar con user_id = NULL
--    - Usuarios autenticados pueden insertar con su propio user_id verificado
DROP POLICY IF EXISTS "Permitir insercion con verificacion de identidad o anonimo" ON public.feedback_reports;
CREATE POLICY "Permitir insercion con verificacion de identidad o anonimo"
ON public.feedback_reports
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
--    Solo usuarios autenticados pueden ver sus propios envíos. Los usuarios anónimos no pueden leer nada.
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver sus propios envios" ON public.feedback_reports;
CREATE POLICY "Usuarios autenticados pueden ver sus propios envios"
ON public.feedback_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Los usuarios anónimos tienen SELECT revocado/denegado por omisión (sin política permisiva)

