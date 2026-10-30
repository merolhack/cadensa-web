/**
 * Servicio de Administración Privada - Cadensa
 * 
 * Gestiona la verificación de roles administrativos (Zero Trust RLS),
 * consulta de usuarios registrados, moderación de reportes de calidad
 * y agregación de métricas de telemetría fonoaudiológica.
 */

import { supabase } from '@/lib/supabaseClient';

export interface AdminFeedbackReport {
  id: string;
  user_id: string | null;
  category: 'video_issue' | 'technique_issue' | 'suggestion' | 'other' | string;
  technique_id: string | null;
  message: string;
  contact_email: string | null;
  metadata: Record<string, unknown>;
  status: 'pending' | 'reviewed' | 'resolved' | 'discarded';
  created_at: string;
}

export interface AdminUserRow {
  id: string;
  username: string | null;
  full_name: string | null;
  current_streak: number;
  longest_streak: number;
  total_minutes: number;
  xp_points: number;
  last_activity_date: string | null;
}

export interface AdminExerciseItem {
  id: string;
  category: string;
  difficulty: string;
  phrase: string;
  bpm_recommended: number;
  created_at: string;
}

export interface AdminSummaryMetrics {
  totalUsers: number;
  totalTrainingMinutes: number;
  totalFeedbackReports: number;
  pendingFeedbackReports: number;
  resolvedFeedbackReports: number;
}

/**
 * Envoltorio con timeout rápido para evitar bloqueos por DNS o red en entornos CLI/offline.
 */
async function withNetworkTimeout<T>(fn: () => Promise<T>, fallback: T, ms = 1200): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });

  try {
    const result = await Promise.race([
      fn().then((res) => {
        if (timer) clearTimeout(timer);
        return res;
      }),
      timeoutPromise,
    ]);
    return result;
  } catch {
    if (timer) clearTimeout(timer);
    return fallback;
  }
}

/**
 * Verifica si el usuario con sesión activa cuenta con privilegios de administrador.
 */
export async function checkIsAdmin(): Promise<boolean> {
  return withNetworkTimeout(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return false;
    }

    // Consulta de la función RPC segura o de la tabla app_admins
    const { data, error } = await supabase.rpc('current_user_is_admin');
    if (!error && typeof data === 'boolean') {
      return data;
    }

    // Fallback: consulta directa a app_admins (permitida a nivel de fila para el propio usuario)
    const { data: adminRows, error: tableErr } = await supabase
      .from('app_admins')
      .select('role')
      .eq('user_id', sessionData.session.user.id)
      .limit(1);

    if (tableErr || !adminRows || adminRows.length === 0) {
      return false;
    }

    return true;
  }, false);
}

/**
 * Obtiene la lista completa de reportes de comentarios y fallas para moderación.
 */
export async function fetchAdminFeedbackReports(options?: {
  category?: string;
  status?: string;
}): Promise<AdminFeedbackReport[]> {
  return withNetworkTimeout(async () => {
    let query = supabase
      .from('feedback_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      category: row.category,
      technique_id: row.technique_id,
      message: row.message,
      contact_email: row.contact_email,
      metadata: (row.metadata as Record<string, unknown>) || {},
      status: row.status as AdminFeedbackReport['status'],
      created_at: row.created_at,
    }));
  }, []);
}

/**
 * Actualiza el estado de resolución de un reporte de calidad fonoaudiológica.
 */
export async function updateFeedbackReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved' | 'discarded'
): Promise<{ success: boolean; error?: string }> {
  return withNetworkTimeout(async () => {
    const { error } = await supabase
      .from('feedback_reports')
      .update({ status })
      .eq('id', reportId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, { success: true });
}

/**
 * Consulta la lista de usuarios registrados y su historial de adherencia clínica.
 */
export async function fetchAdminUsersList(): Promise<AdminUserRow[]> {
  return withNetworkTimeout(async () => {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, username, full_name');

    if (pErr || !profiles) {
      return [];
    }

    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('user_id, current_streak, longest_streak, total_minutes, xp_points, last_activity_date');

    const streaksMap = new Map<
      string,
      {
        user_id: string;
        current_streak: number;
        longest_streak: number;
        total_minutes: number;
        xp_points: number;
        last_activity_date: string | null;
      }
    >();
    if (streaks) {
      for (const s of streaks) {
        streaksMap.set(s.user_id, s);
      }
    }

    return profiles.map((p) => {
      const streakInfo = streaksMap.get(p.id);
      return {
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        current_streak: streakInfo?.current_streak ?? 0,
        longest_streak: streakInfo?.longest_streak ?? 0,
        total_minutes: streakInfo?.total_minutes ?? 0,
        xp_points: streakInfo?.xp_points ?? 0,
        last_activity_date: streakInfo?.last_activity_date ?? null,
      };
    });
  }, []);
}

/**
 * Calcula las métricas resumidas globales para el dashboard de administración.
 */
export async function fetchAdminSummary(): Promise<AdminSummaryMetrics> {
  try {
    const [reports, users] = await Promise.all([
      fetchAdminFeedbackReports(),
      fetchAdminUsersList(),
    ]);

    const totalMinutes = users.reduce((acc, u) => acc + (u.total_minutes || 0), 0);
    const pendingCount = reports.filter((r) => r.status === 'pending').length;
    const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

    return {
      totalUsers: users.length,
      totalTrainingMinutes: totalMinutes,
      totalFeedbackReports: reports.length,
      pendingFeedbackReports: pendingCount,
      resolvedFeedbackReports: resolvedCount,
    };
  } catch {
    return {
      totalUsers: 0,
      totalTrainingMinutes: 0,
      totalFeedbackReports: 0,
      pendingFeedbackReports: 0,
      resolvedFeedbackReports: 0,
    };
  }
}

/**
 * Consulta la lista de ejercicios clínicos almacenados en Supabase para el CMS administrativo.
 */
export async function fetchAdminExercises(): Promise<AdminExerciseItem[]> {
  return withNetworkTimeout(async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      category: item.category,
      difficulty: item.difficulty,
      phrase: item.phrase,
      bpm_recommended: item.bpm_recommended,
      created_at: item.created_at,
    }));
  }, []);
}

/**
 * Registra un nuevo ejercicio clínico en la base de datos desde el CMS.
 */
export async function createAdminExercise(exercise: {
  phrase: string;
  category: string;
  difficulty: string;
  bpm_recommended: number;
}): Promise<{ success: boolean; error?: string }> {
  return withNetworkTimeout(async () => {
    const { error } = await supabase.from('exercises').insert({
      phrase: exercise.phrase.trim(),
      category: exercise.category,
      difficulty: exercise.difficulty,
      bpm_recommended: exercise.bpm_recommended,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, { success: true });
}

/**
 * Elimina un ejercicio clínico de la base de datos mediante su ID.
 */
export async function deleteAdminExercise(
  exerciseId: string
): Promise<{ success: boolean; error?: string }> {
  return withNetworkTimeout(async () => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, { success: true });
}

/**
 * Convierte un arreglo de reportes de calidad clínica a formato CSV estándar.
 */
export function generateFeedbackCSV(reports: AdminFeedbackReport[]): string {
  const headers = ['ID', 'Fecha', 'Categoria', 'Tecnica', 'Estado', 'Email_Contacto', 'Mensaje'];
  const rows = reports.map((r) => [
    `"${r.id}"`,
    `"${new Date(r.created_at).toISOString()}"`,
    `"${r.category}"`,
    `"${r.technique_id || 'general'}"`,
    `"${r.status}"`,
    `"${r.contact_email || 'anonimo'}"`,
    `"${r.message.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export interface AdminClientErrorRow {
  id: string;
  user_id: string | null;
  event_name: string;
  error_message: string;
  stack_trace: string | null;
  component: string | null;
  url: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Consulta la lista de errores de telemetría de clientes reportados en Supabase.
 */
export async function fetchAdminClientErrors(limit = 50): Promise<AdminClientErrorRow[]> {
  return withNetworkTimeout(async () => {
    const { data, error } = await supabase
      .from('client_telemetry_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }
    return data as AdminClientErrorRow[];
  }, []);
}

/**
 * Convierte el directorio de usuarios y métricas de adherencia a formato CSV.
 */
export function generateUsersCSV(users: AdminUserRow[]): string {
  const headers = ['ID', 'Username', 'Nombre_Completo', 'Racha_Actual_Dias', 'Record_Racha', 'Minutos_Totales', 'XP_Puntos', 'Ultima_Actividad'];
  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${u.username || 'sin_alias'}"`,
    `"${u.full_name || 'Paciente Cadensa'}"`,
    u.current_streak,
    u.longest_streak,
    u.total_minutes,
    u.xp_points,
    `"${u.last_activity_date || 'sin_registro'}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
