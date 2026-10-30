import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportAppError, initGlobalErrorTracking } from './errorTracker';

describe('ErrorTracker - Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.dataLayer = [];
      delete window.gtag;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe despachar el error a window.gtag y Supabase client si están disponibles', async () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    const res = await reportAppError(
      {
        message: 'Error de prueba en botón',
        component: 'TestButton',
        eventName: 'button_click_error',
        fatal: false,
      },
      mockClient as never
    );

    expect(res.reportedToGA4).toBe(true);
    expect(res.reportedToSupabase).toBe(true);
    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'exception',
      expect.objectContaining({
        description: 'TestButton: Error de prueba en botón',
        fatal: false,
      })
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        component: 'TestButton',
        error_message: 'Error de prueba en botón',
        event_name: 'button_click_error',
      })
    );
  });

  it('debe utilizar window.dataLayer como fallback si window.gtag no está definido', async () => {
    window.dataLayer = [];

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    const res = await reportAppError(
      {
        message: 'Falla con fallback dataLayer',
        component: 'AuthModal',
      },
      mockClient as never
    );

    expect(res.reportedToGA4).toBe(true);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer[0]).toMatchObject({
      event: 'exception',
      description: 'AuthModal: Falla con fallback dataLayer',
    });
  });

  it('debe deduplicar errores idénticos sucesivos para prevenir saturación', async () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockClient = {
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
      }),
    };

    const payload = {
      message: 'Loop error repetido',
      component: 'LoopComponent',
      eventName: 'loop_error',
    };

    const first = await reportAppError(payload, mockClient as never);
    expect(first.reportedToGA4).toBe(true);

    // Segundo llamado con firma idéntica debe ser ignorado por deduplicación
    const second = await reportAppError(payload, mockClient as never);
    expect(second.reportedToGA4).toBe(false);
    expect(second.reportedToSupabase).toBe(false);
  });

  it('initGlobalErrorTracking debe registrar escuchadores de error y unhandledrejection y permitir cleanup', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const cleanup = initGlobalErrorTracking();

    expect(addEventSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    cleanup();

    expect(removeEventSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });
});

