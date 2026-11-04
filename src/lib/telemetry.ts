/**
 * Cadensa Privacy-First Telemetry (Zero Trust)
 *
 * Registra métricas clínicas y de uso respetando la privacidad del paciente:
 * - CERO datos personales identificables (No PII: sin IPs, nombres, correos o historiales clínicos).
 * - Identificador de sesión efímero generado aleatoriamente en sessionStorage.
 * - Registro estructurado mediante eventos estandarizados.
 */

export type TelemetryEvent =
  | 'technique_viewed'
  | 'video_played'
  | 'practice_started'
  | 'video_playback_error'
  | 'runtime_error';

export interface TelemetryPayload {
  event: TelemetryEvent;
  timestamp: string;
  sessionId: string;
  properties?: Record<string, unknown>;
}

// Generador de ID de sesión anónimo efímero
function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'ssr-session';
  }

  try {
    const key = 'cadensa_anon_session_id';
    let sid = window.sessionStorage.getItem(key);
    if (!sid) {
      sid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      window.sessionStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return 'memory_session_' + Math.random().toString(36).substring(2, 9);
  }
}

// Limpiador defensivo de PII: elimina cualquier campo sospechoso
function sanitizeProperties(props?: Record<string, unknown>): Record<string, unknown> {
  if (!props) return {};
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    const isForbidden =
      lowerKey === 'name' ||
      lowerKey.includes('nombre') ||
      lowerKey.includes('first_name') ||
      lowerKey.includes('last_name') ||
      lowerKey.includes('apellido') ||
      lowerKey.includes('email') ||
      lowerKey.includes('mail') ||
      lowerKey === 'ip' ||
      lowerKey.includes('ip_address') ||
      lowerKey.includes('phone') ||
      lowerKey.includes('telefono') ||
      lowerKey.startsWith('user_') ||
      lowerKey.includes('password');

    if (!isForbidden) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeProperties(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

// Despachador principal de eventos
export function trackEvent(event: TelemetryEvent, properties?: Record<string, unknown>): TelemetryPayload {
  const payload: TelemetryPayload = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateAnonymousSessionId(),
    properties: sanitizeProperties(properties),
  };

  // 1. Registro en consola estructurada en modo desarrollo o diagnóstico clínico
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost') {
      // eslint-disable-next-line no-console
      console.info(`[Cadensa Telemetry] ${event}:`, payload);
    }
  }

  // 2. Envío desatendido no bloqueante vía sendBeacon si existe endpoint configurado
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const telemetryEndpoint = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT;
    if (telemetryEndpoint) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(telemetryEndpoint, blob);
      } catch {
        // Fallback silencioso sin interrumpir la experiencia de usuario
      }
    }
  }

  return payload;
}

// Helpers de alto nivel para eventos clínicos clave
export function trackTechniqueViewed(techniqueId: string, techniqueName: string, source: string = 'catalog') {
  return trackEvent('technique_viewed', { techniqueId, techniqueName, source });
}

export function trackVideoPlayed(techniqueId: string, techniqueName: string, isMuted: boolean) {
  return trackEvent('video_played', { techniqueId, techniqueName, isMuted });
}

export function trackPracticeStarted(techniqueId: string, techniqueName: string) {
  return trackEvent('practice_started', { techniqueId, techniqueName });
}

export function trackVideoPlaybackError(techniqueId: string, errorMessage?: string) {
  return trackEvent('video_playback_error', { techniqueId, errorMessage: errorMessage || 'Desconocido' });
}

export function trackRuntimeError(errorName: string, message: string, componentStack?: string) {
  return trackEvent('runtime_error', { errorName, message, componentStack });
}
