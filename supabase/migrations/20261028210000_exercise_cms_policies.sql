-- ==============================================================================
-- Cadensa: Migración para Políticas RLS del Gestor de Ejercicios (CMS Admin)
-- ==============================================================================

-- 1. Habilitar control administrativo completo sobre la tabla public.exercises
-- Permitir a usuarios verificados con is_admin() insertar, editar y eliminar ejercicios
DROP POLICY IF EXISTS "Admins pueden insertar y gestionar ejercicios" ON public.exercises;
CREATE POLICY "Admins pueden insertar y gestionar ejercicios"
ON public.exercises
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Mantener la política de lectura pública para todos los usuarios y visitantes
DROP POLICY IF EXISTS "Los ejercicios son visibles por todos los usuarios" ON public.exercises;
CREATE POLICY "Los ejercicios son visibles por todos los usuarios"
ON public.exercises
FOR SELECT
TO anon, authenticated
USING (true);

