/**
 * Servicio Clínico de Feedback y Reporte de Errores - Cadensa
 * 
 * Permite a usuarios registrados y visitantes enviar comentarios o reportes sobre
 * fallas en videos o dudas en técnicas clínicas bajo el modelo Zero Trust RLS.
 */

import { supabase } from '@/lib/supabaseClient';
import { trackClinicalEvent } from '@/lib/analytics';
import type { Json } from '@/types/supabase';

export type FeedbackCategory =
  | 'video_issue'
  | 'technique_issue'
  | 'suggestion'
  | 'other';

export interface FeedbackPayload {
  category: FeedbackCategory;
  message: string;
  techniqueId?: string | null;
  contactEmail?: string | null;
  honeypot?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackResult {
  success: boolean;
  message: string;
  rateLimited?: boolean;
  offline?: boolean;
}

export const RATE_LIMIT_STORAGE_KEY = 'cadensa_feedback_timestamps';
export const OFFLINE_FEEDBACK_STORAGE_KEY = 'cadensa_offline_feedback';
export const RATE_LIMIT_MAX_SUBMISSIONS = 3;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora en ms

/**
 * Guarda un reporte en la cola local para sincronización posterior si la red falla.
 */
export function saveOfflineFeedback(report: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const raw = window.localStorage.getItem(OFFLINE_FEEDBACK_STORAGE_KEY);
    const queue: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
    queue.push({
      ...report,
      savedAt: new Date().toISOString(),
    });
    window.localStorage.setItem(OFFLINE_FEEDBACK_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Silencioso en entornos con almacenamiento bloqueado
  }
}

/**
 * Obtiene la lista de reportes guardados en la cola local.
 */
export function getOfflineFeedbackQueue(): Record<string, unknown>[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(OFFLINE_FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Consulta el estado actual de límite de envíos en el navegador.
 */
export function checkFeedbackRateLimit(): { allowed: boolean; remainingSubmissions: number; waitMinutes?: number } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { allowed: true, remainingSubmissions: RATE_LIMIT_MAX_SUBMISSIONS };
  }

  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) {
      return { allowed: true, remainingSubmissions: RATE_LIMIT_MAX_SUBMISSIONS };
    }

    const timestamps: number[] = JSON.parse(raw);
    const now = Date.now();
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
      const oldestInWindow = Math.min(...recent);
      const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldestInWindow);
      const waitMinutes = Math.max(1, Math.ceil(waitMs / (60 * 1000)));
      return { allowed: false, remainingSubmissions: 0, waitMinutes };
    }

    return { allowed: true, remainingSubmissions: RATE_LIMIT_MAX_SUBMISSIONS - recent.length };
  } catch {
    return { allowed: true, remainingSubmissions: RATE_LIMIT_MAX_SUBMISSIONS };
  }
}

/**
 * Registra una marca de tiempo tras un envío exitoso.
 */
export function recordFeedbackSubmission(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // Silencioso en caso de storage lleno o modo privado restringido
  }
}

/**
 * Limpia el historial de rate limit (utilizado principalmente para pruebas unitarias).
 */
export function clearFeedbackRateLimit(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  }
}

/**
 * Envía un reporte de retroalimentación o falla a Supabase.
 */
export async function submitFeedbackReport(payload: FeedbackPayload): Promise<FeedbackResult> {
  // 1. Detección de trampa anti-spam (Honeypot)
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    // Si un bot llenó el campo trampa, simulamos éxito para evitar que intente contramedidas
    return {
      success: true,
      message: 'Comentario recibido. Muchas gracias por tu aporte a la comunidad.',
    };
  }

  // 2. Validación de longitud de mensaje en cliente
  const trimmedMessage = payload.message.trim();
  if (trimmedMessage.length < 10) {
    return {
      success: false,
      message: 'El mensaje debe tener al menos 10 caracteres para proporcionar suficiente contexto.',
    };
  }

  if (trimmedMessage.length > 1000) {
    return {
      success: false,
      message: 'El mensaje no debe exceder los 1,000 caracteres.',
    };
  }

  // 3. Validación de email opcional
  if (payload.contactEmail && payload.contactEmail.trim().length > 0) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(payload.contactEmail.trim())) {
      return {
        success: false,
        message: 'Por favor ingresa un correo electrónico válido o deja el campo vacío.',
      };
    }
  }

  // 4. Verificación de Rate Limit
  const rateLimitStatus = checkFeedbackRateLimit();
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      rateLimited: true,
      message: `Has alcanzado el límite de 3 reportes por hora. Por favor espera ${rateLimitStatus.waitMinutes} minutos antes de enviar otro.`,
    };
  }

  try {
    // 5. Detección de sesión activa de usuario (si existe)
    let currentUserId: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData?.session?.user?.id ?? null;
    } catch {
      currentUserId = null;
    }

    // 6. Construcción de metadatos de diagnóstico clínico
    const metadata: Record<string, unknown> = {
      ...payload.metadata,
      url: typeof window !== 'undefined' ? window.location.href : 'ssr',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
      screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
      timestamp: new Date().toISOString(),
    };

    const reportPayload = {
      user_id: currentUserId,
      category: payload.category,
      technique_id: payload.techniqueId || null,
      message: trimmedMessage,
      contact_email: payload.contactEmail?.trim() || null,
      metadata: metadata as unknown as Json,
      status: 'pending',
    };

    // 7. Inserción con Zero Trust RLS en Supabase
    const { error } = await supabase.from('feedback_reports').insert(reportPayload);

    if (error) {
      console.warn('Falla de red en Supabase, guardando en cola offline:', error.message);
      saveOfflineFeedback(reportPayload);
      recordFeedbackSubmission();
      return {
        success: true,
        offline: true,
        message: 'Tu reporte ha sido registrado localmente y se sincronizará automáticamente.',
      };
    }

    // 8. Registro de consumo de cuota local
    recordFeedbackSubmission();

    // 9. Emisión de evento analítico
    trackClinicalEvent('feedback_submitted', {
      category: payload.category,
      technique_id: payload.techniqueId || 'none',
    });

    return {
      success: true,
      message: '¡Gracias! Tu reporte ha sido recibido y será revisado por nuestro equipo fonoaudiológico.',
    };
  } catch (err) {
    console.warn('Excepción de conexión en submitFeedbackReport, modo offline:', err);
    saveOfflineFeedback({
      category: payload.category,
      technique_id: payload.techniqueId || null,
      message: trimmedMessage,
      contact_email: payload.contactEmail?.trim() || null,
    });
    recordFeedbackSubmission();
    return {
      success: true,
      offline: true,
      message: 'Tu reporte ha sido guardado en tu navegador y se enviará cuando haya conexión.',
    };
  }
}
