import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  submitFeedbackReport,
  checkFeedbackRateLimit,
  clearFeedbackRateLimit,
  RATE_LIMIT_STORAGE_KEY,
} from './feedbackService';
import { supabase } from '@/lib/supabaseClient';

vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

vi.mock('@/lib/analytics', () => ({
  trackClinicalEvent: vi.fn(),
}));

describe('feedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearFeedbackRateLimit();
  });

  it('rechaza mensajes con menos de 10 caracteres', async () => {
    const result = await submitFeedbackReport({
      category: 'video_issue',
      message: 'Corto',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('al menos 10 caracteres');
  });

  it('rechaza mensajes que excedan los 1000 caracteres', async () => {
    const longMessage = 'A'.repeat(1001);
    const result = await submitFeedbackReport({
      category: 'video_issue',
      message: longMessage,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('1,000 caracteres');
  });

  it('rechaza correos electrónicos con formato inválido', async () => {
    const result = await submitFeedbackReport({
      category: 'technique_issue',
      message: 'El metrónomo va a destiempo en el ejercicio 3.',
      contactEmail: 'correo-no-valido',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('correo electrónico válido');
  });

  it('detecta bots mediante honeypot y responde con éxito simulado sin llamar a Supabase', async () => {
    const result = await submitFeedbackReport({
      category: 'suggestion',
      message: 'Me gustaría sugerir un nuevo ejercicio de respiración diafragmática.',
      honeypot: 'http://spam-bot.site',
    });

    expect(result.success).toBe(true);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('envía un reporte exitoso como usuario anónimo (sin sesión activa)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const mockInsert = vi.fn().mockResolvedValueOnce({ error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await submitFeedbackReport({
      category: 'video_issue',
      techniqueId: 'sts',
      message: 'El video de habla rítmica silábica no reproduce audio en iOS.',
      contactEmail: 'paciente@ejemplo.com',
    });

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: null,
        category: 'video_issue',
        technique_id: 'sts',
        contact_email: 'paciente@ejemplo.com',
        status: 'pending',
      })
    );
  });

  it('envía un reporte exitoso asociando el ID de un usuario autenticado', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'usr-12345' },
        },
      },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

    const mockInsert = vi.fn().mockResolvedValueOnce({ error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as unknown as ReturnType<typeof supabase.from>);

    const result = await submitFeedbackReport({
      category: 'technique_issue',
      techniqueId: 'easy_onset',
      message: 'La transición al fonema vocálico no queda clara en la instrucción.',
    });

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'usr-12345',
        category: 'technique_issue',
        technique_id: 'easy_onset',
      })
    );
  });

  it('controla el límite de envíos (Rate Limiting) a un máximo de 3 por hora', async () => {
    // Simular 3 marcas de tiempo recientes en localStorage
    const now = Date.now();
    window.localStorage.setItem(
      RATE_LIMIT_STORAGE_KEY,
      JSON.stringify([now - 5000, now - 3000, now - 1000])
    );

    const limitCheck = checkFeedbackRateLimit();
    expect(limitCheck.allowed).toBe(false);
    expect(limitCheck.remainingSubmissions).toBe(0);

    const result = await submitFeedbackReport({
      category: 'other',
      message: 'Mensaje que intenta superar el límite por hora permitido.',
    });

    expect(result.success).toBe(false);
    expect(result.rateLimited).toBe(true);
    expect(result.message).toContain('límite de 3 reportes por hora');
  });
});
