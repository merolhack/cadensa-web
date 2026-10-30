/**
 * Cadensa Error Telemetry & Client Observability
 * Arquitectura Híbrida: Google Analytics 4 (GA4) + Supabase Zero Trust RLS.
 * Captura excepciones en tiempo de ejecución, promesas no controladas y fallas funcionales en botones/auth.
 */

import { supabase } from './supabaseClient';
import type { Json } from '@/types/supabase';

export interface ErrorReportPayload {
  message: string;
  eventName?: string;
  component?: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  fatal?: boolean;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

// Buffer de deduplicación en memoria para evitar saturación ante loops
const recentErrorSignatures = new Set<string>();

/**
 * Despacha una alerta proactiva hacia un Webhook (Discord, Slack o endpoint genérico)
 * cuando se detecta un incidente de severidad fatal o crítica.
 */
export async function sendFatalWebhookAlert(
  payload: ErrorReportPayload,
  customWebhookUrl?: string
): Promise<boolean> {
  const url =
    customWebhookUrl ||
    (typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_ERROR_WEBHOOK_URL
      : undefined);

  if (!url) {
    return false;
  }

  try {
    let body: string;

    if (url.includes('discord.com/api/webhooks')) {
      body = JSON.stringify({
        content: '🚨 **Alerta Proactiva de Incidente Crítico — Cadensa Web**',
        embeds: [
          {
            title: `Error Fatal: ${payload.eventName || 'uncaught_exception'}`,
            description: payload.message.slice(0, 500) || 'Sin descripción',
            color: 0xef4444, // Rojo clínico de alerta
            fields: [
              { name: 'Componente', value: payload.component || 'global', inline: true },
              { name: 'URL', value: payload.url || (typeof window !== 'undefined' && window?.location?.href ? window.location.href : 'Desconocida'), inline: true },
              { name: 'Usuario', value: payload.userId || 'Anónimo / Invitado', inline: true },
              ...(payload.stack
                ? [{ name: 'Stack Trace', value: `\`\`\`${payload.stack.slice(0, 800)}\`\`\`` }]
                : []),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else if (url.includes('slack.com/services') || url.includes('hooks.slack.com')) {
      body = JSON.stringify({
        text: `🚨 *Alerta Proactiva Crítica — Cadensa Web*\n*Evento:* ${payload.eventName || 'uncaught_exception'}\n*Mensaje:* ${payload.message}\n*Componente:* ${payload.component || 'global'}\n*URL:* ${payload.url || 'Desconocida'}`,
      });
    } else {
      body = JSON.stringify({
        level: 'fatal',
        source: 'cadensa-web',
        timestamp: new Date().toISOString(),
        error: {
          eventName: payload.eventName || 'fatal_error',
          message: payload.message,
          component: payload.component,
          url: payload.url,
          userId: payload.userId,
          stack: payload.stack,
        },
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    return res.ok;
  } catch (err) {
    console.debug('Falla silenciosa al enviar webhook de alerta fatal:', err);
    return false;
  }
}

/**
 * Reporta un error de forma simultánea a GA4 y a Supabase PostgreSQL.
 * Diseñado con protección Silent Fail para que la telemetría nunca interrumpa al paciente.
 */
export async function reportAppError(
  payload: ErrorReportPayload,
  client = supabase
): Promise<{ reportedToSupabase: boolean; reportedToGA4: boolean; reportedToWebhook?: boolean }> {
  if (typeof window === 'undefined') {
    return { reportedToSupabase: false, reportedToGA4: false, reportedToWebhook: false };
  }

  const message = payload.message || 'Error desconocido';
  const eventName = payload.eventName || 'javascript_error';
  const component = payload.component || 'global';
  const signature = `${eventName}:${component}:${message.slice(0, 100)}`;

  // Deduplicación por 10 segundos
  if (recentErrorSignatures.has(signature)) {
    return { reportedToSupabase: false, reportedToGA4: false, reportedToWebhook: false };
  }
  recentErrorSignatures.add(signature);
  setTimeout(() => recentErrorSignatures.delete(signature), 10000);

  let reportedToGA4 = false;
  let reportedToSupabase = false;
  let reportedToWebhook = false;

  // 1. Canal Google Analytics 4 (GA4 - Evento exception)
  try {
    const gaParams = {
      description: `${component}: ${message}`.slice(0, 150),
      fatal: !!payload.fatal,
      event_category: 'client_observability',
      error_component: component,
      ...(payload.metadata || {}),
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exception', gaParams);
      reportedToGA4 = true;
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'exception',
        ...gaParams,
      });
      reportedToGA4 = true;
    }
  } catch (gaErr) {
    console.debug('Falla silenciosa al enviar a GA4:', gaErr);
  }

  // 2. Canal Supabase PostgreSQL (Inmune a adblockers, persistencia forense)
  try {
    // Si no se proveyó userId, verificar si hay un UUID autenticado en localStorage
    let effectiveUserId: string | null = payload.userId || null;
    if (!effectiveUserId && typeof localStorage !== 'undefined') {
      try {
        const storedUid = localStorage.getItem('cadensa_user_id');
        if (storedUid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storedUid)) {
          effectiveUserId = storedUid;
        }
      } catch {
        // Ignorar error de acceso a storage
      }
    }

    const { error } = await client.from('client_telemetry_errors').insert({
      user_id: effectiveUserId,
      event_name: eventName,
      error_message: message,
      stack_trace: payload.stack || null,
      component,
      url: payload.url || (typeof window !== 'undefined' && window?.location?.href ? window.location.href : null),
      user_agent: payload.userAgent || (typeof navigator !== 'undefined' && navigator?.userAgent ? navigator.userAgent : null),
      metadata: (payload.metadata as Json) || {},
    });

    if (!error) {
      reportedToSupabase = true;
    }
  } catch (sbErr) {
    console.debug('Falla silenciosa al enviar telemetría a Supabase:', sbErr);
  }

  // 3. Canal Webhook de Alerta Proactiva (solo para incidentes fatales)
  if (payload.fatal) {
    try {
      reportedToWebhook = await sendFatalWebhookAlert(payload);
    } catch {
      reportedToWebhook = false;
    }
  }

  return { reportedToSupabase, reportedToGA4, reportedToWebhook };
}

/**
 * Inicializa los escuchadores globales de errores no capturados en el navegador.
 * Retorna una función para remover los escuchadores (cleanup).
 */
export function initGlobalErrorTracking(client = supabase): () => void {
  if (typeof window === 'undefined') return () => {};

  const errorHandler = (event: ErrorEvent) => {
    reportAppError(
      {
        message: event.message,
        eventName: 'uncaught_exception',
        component: 'window',
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        fatal: true,
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
        },
      },
      client
    ).catch(() => {});
  };

  const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg =
      typeof reason === 'object' && reason !== null
        ? reason.message || JSON.stringify(reason)
        : String(reason);

    reportAppError(
      {
        message: `Unhandled Rejection: ${msg}`,
        eventName: 'unhandled_promise_rejection',
        component: 'promise',
        stack: reason?.stack,
        fatal: false,
      },
      client
    ).catch(() => {});
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', unhandledRejectionHandler);

  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
  };
}

