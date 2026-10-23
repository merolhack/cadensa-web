import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  generateClinicalReport,
  ClinicalReportPayload,
  CompletedSession,
  StreakSummary,
} from '../../src/lib/clinicalReport';

let mockSessions: CompletedSession[] = [];
let mockStreak: StreakSummary;
let generatedReport: ClinicalReportPayload;

Given('que un paciente ha completado {int} sesiones con precisión promedio de {int}%', function (numSessions: number, avgAccuracy: number) {
  mockSessions = Array.from({ length: numSessions }, (_, i) => ({
    id: `sess-test-${i}`,
    bpm: 80,
    duration_seconds: 300,
    syllable_count: 80,
    accuracy_score: avgAccuracy,
    completed_at: new Date().toISOString(),
  }));
});

Given('mantiene una racha activa de {int} días con {int} minutos acumulados', function (streakDays: number, totalMinutes: number) {
  mockStreak = {
    current_streak: streakDays,
    longest_streak: streakDays,
    last_activity_date: new Date().toISOString().split('T')[0],
    total_minutes: totalMinutes,
    xp_points: totalMinutes * 15,
  };
});

When('el sistema genera el informe clínico de seguimiento', function () {
  generatedReport = generateClinicalReport(mockSessions, mockStreak, 'paciente-bdd');
});

Then('el nivel de adherencia rítmica se clasifica como {string}', function (expectedLevel: string) {
  assert.strictEqual(generatedReport.metrics.rhythmAdherenceLevel, expectedLevel);
});

Then('el informe incluye recomendaciones para progresar el tempo hacia 95-100 BPM', function () {
  const hasProgression = generatedReport.metrics.clinicalRecommendations.some((rec) =>
    rec.includes('95-100 BPM')
  );
  assert.strictEqual(hasProgression, true);
});

Given('que un paciente ha registrado sesiones con precisión promedio de {int}%', function (avgAccuracy: number) {
  mockSessions = [
    {
      id: 'sess-low',
      bpm: 80,
      duration_seconds: 180,
      syllable_count: 50,
      accuracy_score: avgAccuracy,
      completed_at: new Date().toISOString(),
    },
  ];
  mockStreak = {
    current_streak: 1,
    longest_streak: 1,
    last_activity_date: new Date().toISOString().split('T')[0],
    total_minutes: 3,
    xp_points: 30,
  };
});

When('se evalúa el nivel de adherencia rítmica', function () {
  generatedReport = generateClinicalReport(mockSessions, mockStreak, 'paciente-low');
});

Then('el nivel se clasifica como {string}', function (expectedLevel: string) {
  assert.strictEqual(generatedReport.metrics.rhythmAdherenceLevel, expectedLevel);
});

Then('se recomienda desacelerar el tempo hacia 65-70 BPM con ejercicios de diadococinesia', function () {
  const hasDdkRec = generatedReport.metrics.clinicalRecommendations.some(
    (rec) => rec.includes('65-70 BPM') && rec.includes('diadococinesia')
  );
  assert.strictEqual(hasDdkRec, true);
});
