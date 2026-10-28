import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackClinicalEvent } from './analytics';

describe('analytics.ts - Telemetría Clínica GA4', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  });

  it('debe llamar a window.gtag si está disponible', () => {
    const mockGtag = vi.fn();
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    trackClinicalEvent('metronome_start', { technique_id: 'sts', bpm: 80 });

    expect(mockGtag).toHaveBeenCalledWith('event', 'metronome_start', {
      event_category: 'clinical_telemetry',
      technique_id: 'sts',
      bpm: 80,
    });
  });

  it('debe empujar a window.dataLayer si gtag no es función pero dataLayer existe', () => {
    const dataLayer: unknown[] = [];
    (window as unknown as { dataLayer: typeof dataLayer }).dataLayer = dataLayer;

    trackClinicalEvent('technique_select', { technique_id: 'easy_onset' });

    expect(dataLayer.length).toBe(1);
    expect(dataLayer[0]).toEqual({
      event: 'technique_select',
      event_category: 'clinical_telemetry',
      technique_id: 'easy_onset',
    });
  });

  it('no debe lanzar excepción si window.gtag o dataLayer no están inicializados', () => {
    expect(() => {
      trackClinicalEvent('session_completed', { duration_seconds: 60 });
    }).not.toThrow();
  });
});
