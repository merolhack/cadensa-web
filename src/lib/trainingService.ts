/**
 * Cadensa Training & Persistence Service
 * Gestiona el almacenamiento de sesiones clínicas, el cálculo de rachas diarias
 * y el catálogo de ejercicios, con soporte para Supabase y fallback offline.
 */

import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

export type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
export type TrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
export type UserStreakRow = Database['public']['Tables']['user_streaks']['Row'];

export interface SessionResult {
  bpm: number;
  durationSeconds: number;
  syllableCount: number;
  accuracyScore: number;
  exercisePhrase: string;
}

export const FALLBACK_EXERCISES: ExerciseRow[] = [
  {
    id: 'f1e1-1111',
    category: 'frases_cortas',
    difficulty: 'facil',
    phrase: 'Encuentra el ritmo de tu voz',
    bpm_recommended: 70,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f1e1-2222',
    category: 'frases_cortas',
    difficulty: 'facil',
    phrase: 'Cadensa es ritmo y tranquilidad',
    bpm_recommended: 75,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f1e1-3333',
    category: 'conversacion',
    difficulty: 'medio',
    phrase: 'Cadensa entrena tu fluidez cada día',
    bpm_recommended: 95,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f1e1-4444',
    category: 'conversacion',
    difficulty: 'medio',
    phrase: 'Hablar con calma y seguridad es posible',
    bpm_recommended: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f1e1-5555',
    category: 'conversacion',
    difficulty: 'avanzado',
    phrase: 'La comunicación fluye cuando el compás es constante',
    bpm_recommended: 120,
    created_at: new Date().toISOString(),
  },
];

/**
 * Calcula el avance de la racha diaria evaluando la fecha de la última sesión.
 */
export function evaluateDailyStreak(
  lastDateStr: string | null,
  currentDate = new Date()
): { newStreak: number; shouldIncrement: boolean; wasReset: boolean } {
  if (!lastDateStr) {
    return { newStreak: 1, shouldIncrement: true, wasReset: false };
  }

  const todayIso = currentDate.toISOString().slice(0, 10);
  const lastDateIso = lastDateStr.slice(0, 10);

  if (todayIso === lastDateIso) {
    // Ya entrenó hoy, mantiene la racha sin doble conteo
    return { newStreak: 1, shouldIncrement: false, wasReset: false };
  }

  const today = new Date(todayIso);
  const last = new Date(lastDateIso);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Entrenó ayer: racha incrementa consecutivamente
    return { newStreak: 2, shouldIncrement: true, wasReset: false };
  }

  // Pasó más de un día sin entrenar: la racha se reinicia a 1
  return { newStreak: 1, shouldIncrement: true, wasReset: true };
}

/**
 * Guarda una sesión de entrenamiento completada.
 */
export async function recordTrainingSession(
  session: SessionResult,
  userId?: string
): Promise<{ success: boolean; offline: boolean; error?: string }> {
  try {
    // Siempre persistir localmente en localStorage para disponibilidad offline
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cadensa_sessions');
      const sessions = stored ? JSON.parse(stored) : [];
      sessions.push({
        ...session,
        id: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        userId: userId || 'local_guest',
      });
      localStorage.setItem('cadensa_sessions', JSON.stringify(sessions));

      // Actualizar minutos acumulados locales
      const prevMinutes = Number(localStorage.getItem('cadensa_total_minutes') || '0');
      const addMinutes = Math.max(1, Math.round(session.durationSeconds / 60));
      localStorage.setItem('cadensa_total_minutes', String(prevMinutes + addMinutes));
    }

    // Si el usuario está autenticado, sincronizar con Supabase
    if (userId && userId !== 'local_guest') {
      const { error } = await supabase.from('training_sessions').insert({
        user_id: userId,
        bpm: session.bpm,
        duration_seconds: session.durationSeconds,
        syllable_count: session.syllableCount,
        accuracy_score: session.accuracyScore,
      });

      if (error) {
        return { success: true, offline: true, error: error.message };
      }
    }

    return { success: true, offline: !userId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, offline: true, error: errorMsg };
  }
}

/**
 * Adopta y sincroniza en Supabase las sesiones locales huérfanas creadas en modo invitado.
 */
export async function claimLocalSessions(
  userId: string,
  client = supabase
): Promise<{ claimedCount: number; success: boolean; error?: string }> {
  if (!userId || userId === 'local_guest' || typeof window === 'undefined') {
    return { claimedCount: 0, success: true };
  }

  try {
    const stored = localStorage.getItem('cadensa_sessions');
    if (!stored) {
      return { claimedCount: 0, success: true };
    }

    const sessions: Array<{
      id?: string;
      bpm: number;
      durationSeconds: number;
      syllableCount: number;
      accuracyScore: number;
      exercisePhrase?: string;
      completedAt?: string;
      userId?: string;
    }> = JSON.parse(stored);

    const orphanSessions = sessions.filter(
      (s) => !s.userId || s.userId === 'local_guest' || s.userId.includes('@')
    );

    if (orphanSessions.length === 0) {
      return { claimedCount: 0, success: true };
    }

    const payload = orphanSessions.map((s) => ({
      user_id: userId,
      bpm: s.bpm,
      duration_seconds: s.durationSeconds,
      syllable_count: s.syllableCount,
      accuracy_score: s.accuracyScore,
      completed_at: s.completedAt || new Date().toISOString(),
    }));

    const { error } = await client.from('training_sessions').insert(payload);
    if (error) {
      return { claimedCount: 0, success: false, error: error.message };
    }

    const updatedSessions = sessions.map((s) => {
      if (!s.userId || s.userId === 'local_guest' || s.userId.includes('@')) {
        return { ...s, userId };
      }
      return s;
    });
    localStorage.setItem('cadensa_sessions', JSON.stringify(updatedSessions));

    return { claimedCount: orphanSessions.length, success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { claimedCount: 0, success: false, error: errorMsg };
  }
}

/**
 * Obtiene el catálogo de ejercicios clínicos.
 */
export async function getExerciseCatalog(): Promise<ExerciseRow[]> {
  try {
    const fetchPromise = supabase
      .from('exercises')
      .select('*')
      .order('bpm_recommended', { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Network timeout') }), 600)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const data = result.data;
    const error = result.error;

    if (error || !data || (data as unknown[]).length === 0) {
      return FALLBACK_EXERCISES;
    }
    return data as ExerciseRow[];
  } catch {
    return FALLBACK_EXERCISES;
  }
}
