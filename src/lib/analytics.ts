/**
 * Helper de telemetría de eventos clínicos para Google Analytics 4 (GA4).
 * Permite monitorear la adherencia terapéutica y uso real de técnicas.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type ClinicalEventName =
  | 'metronome_start'
  | 'metronome_stop'
  | 'technique_select'
  | 'voice_tap_recorded'
  | 'session_completed'
  | 'clinical_report_export'
  | 'simulator_scenario_start'
  | 'routine_5min_start'
  | 'routine_5min_complete';

export interface ClinicalEventParams {
  technique_id?: string;
  bpm?: number;
  accuracy_grade?: string;
  duration_seconds?: number;
  xp_earned?: number;
  scenario_id?: string;
  routine_step?: string;
  [key: string]: unknown;
}

export function trackClinicalEvent(eventName: ClinicalEventName, params: ClinicalEventParams = {}): void {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'clinical_telemetry',
        ...params,
      });
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        event_category: 'clinical_telemetry',
        ...params,
      });
    }
  } catch (err) {
    // Falla silenciosa para evitar interrumpir la práctica del paciente
    console.debug('Telemetry error:', err);
  }
}
