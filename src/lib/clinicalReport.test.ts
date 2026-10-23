import { describe, it, expect } from 'vitest';
import {
  computeClinicalMetrics,
  generateClinicalReport,
  formatClinicalNotesText,
  CompletedSession,
  StreakSummary,
} from './clinicalReport';

describe('clinicalReport generator', () => {
  const mockStreak: StreakSummary = {
    current_streak: 4,
    longest_streak: 7,
    last_activity_date: '2026-10-23',
    total_minutes: 25,
    xp_points: 350,
  };

  const mockSessions: CompletedSession[] = [
    {
      id: 'sess-1',
      bpm: 80,
      duration_seconds: 300,
      syllable_count: 80,
      accuracy_score: 92,
      completed_at: '2026-10-23T10:00:00Z',
    },
    {
      id: 'sess-2',
      bpm: 85,
      duration_seconds: 300,
      syllable_count: 85,
      accuracy_score: 88,
      completed_at: '2026-10-23T12:00:00Z',
    },
  ];

  it('calcula métricas clínicas agregadas correctamente con sesiones válidas', () => {
    const metrics = computeClinicalMetrics(mockSessions, mockStreak);
    expect(metrics.totalSessions).toBe(2);
    expect(metrics.totalSyllables).toBe(165);
    expect(metrics.averageAccuracy).toBe(90);
    expect(metrics.averageBpm).toBe(83);
    expect(metrics.rhythmAdherenceLevel).toBe('Óptimo');
    expect(metrics.activeStreakDays).toBe(4);
    expect(metrics.clinicalRecommendations.length).toBeGreaterThan(0);
  });

  it('maneja el caso de paciente nuevo sin sesiones previas', () => {
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
    expect(metrics.rhythmAdherenceLevel).toBe('En Desarrollo');
    expect(metrics.clinicalRecommendations.length).toBeGreaterThan(0);
  });

  it('clasifica la adherencia como Requiere Refuerzo si la precisión es inferior a 70%', () => {
    const lowAccuracySessions: CompletedSession[] = [
      {
        id: 'sess-low',
        bpm: 90,
        duration_seconds: 120,
        syllable_count: 30,
        accuracy_score: 62,
        completed_at: '2026-10-23T10:00:00Z',
      },
    ];
    const metrics = computeClinicalMetrics(lowAccuracySessions, mockStreak);
    expect(metrics.rhythmAdherenceLevel).toBe('Requiere Refuerzo');
    expect(metrics.clinicalRecommendations[0]).toContain('recomienda reducir la velocidad');
  });

  it('genera un payload de reporte completo en formato estructurado', () => {
    const report = generateClinicalReport(mockSessions, mockStreak, 'paciente-456');
    expect(report.patientId).toBe('paciente-456');
    expect(report.exportDate).toBeTruthy();
    expect(report.metrics.totalSessions).toBe(2);
    expect(report.recentSessions.length).toBe(2);
  });

  it('genera un formato de texto legible para notas foniátricas', () => {
    const report = generateClinicalReport(mockSessions, mockStreak, 'paciente-456');
    const textNotes = formatClinicalNotesText(report);
    expect(textNotes).toContain('INFORME CLÍNICO DE SEGUIMIENTO FONIÁTRICO');
    expect(textNotes).toContain('paciente-456');
    expect(textNotes).toContain('Precisión temporal media: 90%');
    expect(textNotes).toContain('Nivel de adherencia rítmica: Óptimo');
  });
});
