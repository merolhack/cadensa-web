import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackEvent,
  trackTechniqueViewed,
  trackVideoPlayed,
  trackPracticeStarted,
  trackVideoPlaybackError,
  trackRuntimeError,
} from './telemetry';

describe('Telemetry Service - Privacy-First & Zero Trust', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('registra un evento estructurado con sessionId anónimo y timestamp', () => {
    const payload = trackEvent('technique_viewed', { techniqueId: 'easy_onset' });

    expect(payload.event).toBe('technique_viewed');
    expect(payload.timestamp).toBeDefined();
    expect(payload.sessionId).toMatch(/^anon_/);
    expect(payload.properties?.techniqueId).toBe('easy_onset');
  });

  it('mantiene el mismo sessionId anónimo durante la sesión de navegación', () => {
    const event1 = trackEvent('technique_viewed', { techniqueId: 'sts' });
    const event2 = trackEvent('video_played', { techniqueId: 'sts' });

    expect(event1.sessionId).toBe(event2.sessionId);
  });

  it('elimina estrictamente cualquier información personal identificable (No PII)', () => {
    const payload = trackEvent('technique_viewed', {
      techniqueId: 'easy_onset',
      user_email: 'paciente@ejemplo.com',
      ip_address: '192.168.1.1',
      nombre_completo: 'Juan Pérez',
      safeData: '1080p',
    });

    expect(payload.properties?.safeData).toBe('1080p');
    expect(payload.properties?.user_email).toBeUndefined();
    expect(payload.properties?.ip_address).toBeUndefined();
    expect(payload.properties?.nombre_completo).toBeUndefined();
  });

  it('helper trackTechniqueViewed genera el formato esperado', () => {
    const res = trackTechniqueViewed('sts', 'Ritmo STS', 'navbar');
    expect(res.event).toBe('technique_viewed');
    expect(res.properties).toEqual({
      techniqueId: 'sts',
      techniqueName: 'Ritmo STS',
      source: 'navbar',
    });
  });

  it('helper trackVideoPlayed registra el estado del audio', () => {
    const res = trackVideoPlayed('easy_onset', 'Inicio Vocal Suave', false);
    expect(res.event).toBe('video_played');
    expect(res.properties).toEqual({
      techniqueId: 'easy_onset',
      techniqueName: 'Inicio Vocal Suave',
      isMuted: false,
    });
  });

  it('helper trackPracticeStarted registra el inicio de sesión', () => {
    const res = trackPracticeStarted('light_contact', 'Contacto Ligero');
    expect(res.event).toBe('practice_started');
    expect(res.properties).toEqual({
      techniqueId: 'light_contact',
      techniqueName: 'Contacto Ligero',
    });
  });

  it('helper trackVideoPlaybackError registra el error de forma segura', () => {
    const res = trackVideoPlaybackError('box_breathing', 'Format not supported');
    expect(res.event).toBe('video_playback_error');
    expect(res.properties?.errorMessage).toBe('Format not supported');
  });

  it('helper trackRuntimeError registra errores para diagnóstico', () => {
    const res = trackRuntimeError('TypeError', 'Cannot read properties of undefined', 'at Component.render');
    expect(res.event).toBe('runtime_error');
    expect(res.properties?.errorName).toBe('TypeError');
  });
});

