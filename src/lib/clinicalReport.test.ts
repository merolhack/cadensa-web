import { describe, it, expect, vi } from 'vitest';
import {
  computeClinicalMetrics,
  generateClinicalReport,
  formatClinicalNotesText,
  generatePrintableClinicalHtml,
  downloadClinicalReport,
  CompletedSession,
  StreakSummary,
} from './clinicalReport';

describe('clinicalReport generator', () => {
  const dummyStreak: StreakSummary = {
    current_streak: 5,
    longest_streak: 7,
    last_activity_date: '2026-10-23',
    total_minutes: 25,
    xp_points: 350,
  };

  const dummySessions: CompletedSession[] = [
    {
      id: 'sess-1',
      bpm: 80,
      duration_seconds: 60,
      syllable_count: 80,
      accuracy_score: 92,
      completed_at: '2026-10-23T10:00:00Z',
    },
    {
      id: 'sess-2',
      bpm: 85,
      duration_seconds: 120,
      syllable_count: 170,
      accuracy_score: 88,
      completed_at: '2026-10-23T10:05:00Z',
    },
  ];

  it('debe calcular métricas correctas con sesiones registradas incluyendo jitter vocal', () => {
    const metrics = computeClinicalMetrics(dummySessions, dummyStreak);

    expect(metrics.totalSessions).toBe(2);
    expect(metrics.totalSyllables).toBe(250);
    expect(metrics.averageBpm).toBe(83);
    expect(metrics.averageAccuracy).toBe(90);
    expect(metrics.vocalJitterMs).toBeGreaterThan(0);
    expect(metrics.vocalJitterMs).toBeLessThanOrEqual(60);
    expect(metrics.rhythmAdherenceLevel).toBe('Óptimo');
    expect(metrics.activeStreakDays).toBe(5);
    expect(metrics.clinicalRecommendations.length).toBeGreaterThan(0);
  });

  it('debe generar valores por defecto seguros cuando no hay sesiones', () => {
    const emptyStreak: StreakSummary = {
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      total_minutes: 0,
      xp_points: 0,
    };
    const metrics = computeClinicalMetrics([], emptyStreak);

    expect(metrics.totalSessions).toBe(0);
    expect(metrics.totalSyllables).toBe(0);
    expect(metrics.averageAccuracy).toBe(0);
    expect(metrics.rhythmAdherenceLevel).toBe('En Desarrollo');
    expect(metrics.clinicalRecommendations).toContain(
      'Iniciar práctica diaria de al menos 5 minutos con ejercicios de diadococinesia a 70-80 BPM.'
    );
  });

  it('debe estructurar el payload del reporte clínico fonoaudiológico con notas del clínico', () => {
    const report = generateClinicalReport(
      dummySessions,
      dummyStreak,
      'paciente-42',
      'Progreso notable en técnica Easy Onset'
    );

    expect(report.patientId).toBe('paciente-42');
    expect(report.clinicianNotes).toBe('Progreso notable en técnica Easy Onset');
    expect(report.metrics.totalSessions).toBe(2);
    expect(report.recentSessions.length).toBe(2);
    expect(typeof report.exportDate).toBe('string');
  });

  it('debe formatear texto fonoaudiológico legible con recomendaciones y notas', () => {
    const report = generateClinicalReport(
      dummySessions,
      dummyStreak,
      'test-user',
      'Paciente muestra reducción de tensión laríngea'
    );
    const text = formatClinicalNotesText(report);

    expect(text).toContain('=== INFORME CLÍNICO DE SEGUIMIENTO FONIÁTRICO');
    expect(text).toContain('Identificador de Paciente: test-user');
    expect(text).toContain('Jitter vocal inter-silábico');
    expect(text).toContain('4. NOTAS DEL TERAPEUTA TRATANTE:');
    expect(text).toContain('Paciente muestra reducción de tensión laríngea');
  });

  it('debe generar un documento HTML estético listo para imprimir/PDF con diseño fonoaudiológico', () => {
    const report = generateClinicalReport(
      dummySessions,
      dummyStreak,
      'paciente-99',
      'Excelente respuesta al ritmo auditivo'
    );
    const html = generatePrintableClinicalHtml(report);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Cadensa — Informe Clínico Fonoaudiológico');
    expect(html).toContain('paciente-99');
    expect(html).toContain('Excelente respuesta al ritmo auditivo');
    expect(html).toContain('@media print');
    expect(html).toContain('Jitter: ±');
  });

  it('debe permitir la descarga en formatos json, txt y pdf sin romper el entorno', () => {
    const report = generateClinicalReport(dummySessions, dummyStreak, 'paciente-demo');

    // Simular createElement y open
    const openMock = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: vi.fn(),
    });
    vi.stubGlobal('open', openMock);

    // PDF
    const resultPdf = downloadClinicalReport(report, 'pdf');
    expect(resultPdf).toBe(true);

    // TXT y JSON (en JSDOM crean Blobs)
    const resultTxt = downloadClinicalReport(report, 'txt');
    expect(resultTxt).toBe(true);

    const resultJson = downloadClinicalReport(report, 'json');
    expect(resultJson).toBe(true);

    vi.unstubAllGlobals();
  });
});
