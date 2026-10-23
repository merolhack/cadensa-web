export interface CompletedSession {
  id?: string;
  bpm: number;
  duration_seconds: number;
  syllable_count: number;
  accuracy_score: number | null;
  completed_at: string;
}

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_minutes: number;
  xp_points: number;
}

export interface ClinicalMetricsSummary {
  totalSessions: number;
  totalMinutes: number;
  totalSyllables: number;
  averageAccuracy: number;
  averageBpm: number;
  rhythmAdherenceLevel: 'Óptimo' | 'En Desarrollo' | 'Requiere Refuerzo';
  activeStreakDays: number;
  xpPoints: number;
  clinicalRecommendations: string[];
}

export interface ClinicalReportPayload {
  exportDate: string;
  patientId: string;
  metrics: ClinicalMetricsSummary;
  recentSessions: CompletedSession[];
}

export function computeClinicalMetrics(
  sessions: CompletedSession[],
  streakData: StreakSummary
): ClinicalMetricsSummary {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: streakData.total_minutes || 0,
      totalSyllables: 0,
      averageAccuracy: 0,
      averageBpm: 80,
      rhythmAdherenceLevel: 'En Desarrollo',
      activeStreakDays: streakData.current_streak || 0,
      xpPoints: streakData.xp_points || 0,
      clinicalRecommendations: [
        'Iniciar práctica diaria de al menos 5 minutos con ejercicios de diadococinesia a 70-80 BPM.',
        'Mantener regularidad diaria para consolidar la racha rítmica neuromotora.',
      ],
    };
  }

  const totalSyllables = sessions.reduce((acc, s) => acc + (s.syllable_count || 0), 0);
  const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalMinutes = Math.max(streakData.total_minutes, Math.round(totalDurationSeconds / 60));

  const validAccuracySessions = sessions.filter((s) => s.accuracy_score !== null && s.accuracy_score !== undefined);
  const averageAccuracy = validAccuracySessions.length > 0
    ? Math.round(validAccuracySessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) / validAccuracySessions.length)
    : 85;

  const averageBpm = Math.round(sessions.reduce((acc, s) => acc + s.bpm, 0) / sessions.length);

  let rhythmAdherenceLevel: 'Óptimo' | 'En Desarrollo' | 'Requiere Refuerzo' = 'En Desarrollo';
  if (averageAccuracy >= 85) {
    rhythmAdherenceLevel = 'Óptimo';
  } else if (averageAccuracy < 70) {
    rhythmAdherenceLevel = 'Requiere Refuerzo';
  }

  const clinicalRecommendations: string[] = [];
  if (averageAccuracy >= 85) {
    clinicalRecommendations.push('Excelente sincronización temporal. Progresar gradualmente de 80 BPM hacia 95-100 BPM en frases complejas.');
  } else if (averageAccuracy >= 70) {
    clinicalRecommendations.push('Sincronización rítmica adecuada. Mantener el metrónomo a 75-80 BPM enfatizando el ataque silábico simultáneo al pulso.');
  } else {
    clinicalRecommendations.push('Se recomienda reducir la velocidad del metrónomo a 65-70 BPM y priorizar ejercicios de diadococinesia (/pa-ta-ka/).');
  }

  if (streakData.current_streak >= 3) {
    clinicalRecommendations.push('Consistencia positiva demostrada en el entrenamiento diario continuo.');
  } else {
    clinicalRecommendations.push('Reforzar la adherencia terapéutica practicando en el mismo horario cada día.');
  }

  return {
    totalSessions: sessions.length,
    totalMinutes,
    totalSyllables,
    averageAccuracy,
    averageBpm,
    rhythmAdherenceLevel,
    activeStreakDays: streakData.current_streak,
    xpPoints: streakData.xp_points,
    clinicalRecommendations,
  };
}

export function generateClinicalReport(
  sessions: CompletedSession[],
  streakData: StreakSummary,
  patientId: string = 'paciente-anonimo'
): ClinicalReportPayload {
  const metrics = computeClinicalMetrics(sessions, streakData);
  return {
    exportDate: new Date().toISOString(),
    patientId,
    metrics,
    recentSessions: sessions.slice(-10),
  };
}

export function formatClinicalNotesText(report: ClinicalReportPayload): string {
  const { metrics, exportDate, patientId } = report;
  const dateFormatted = new Date(exportDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return [
    `=== INFORME CLÍNICO DE SEGUIMIENTO FONIÁTRICO / TERAPIA DEL HABLA ===`,
    `Fecha de Emisión: ${dateFormatted}`,
    `Identificador de Paciente: ${patientId}`,
    `----------------------------------------------------------------------`,
    `1. RESUMEN DE ADHERENCIA Y VOLUMEN TERAPÉUTICO:`,
    `   - Sesiones registradas: ${metrics.totalSessions}`,
    `   - Tiempo acumulado de entrenamiento: ${metrics.totalMinutes} minutos`,
    `   - Sílabas métricas articuladas: ${metrics.totalSyllables}`,
    `   - Racha actual de días consecutivos: ${metrics.activeStreakDays} días`,
    `   - Puntos de experiencia (XP): ${metrics.xpPoints}`,
    ``,
    `2. MÉTRICAS DE FLUIDEZ Y RITMO (Syllable-Timed Speech):`,
    `   - Precisión temporal media: ${metrics.averageAccuracy}%`,
    `   - Nivel de adherencia rítmica: ${metrics.rhythmAdherenceLevel}`,
    `   - Tempo medio de trabajo: ${metrics.averageBpm} BPM`,
    ``,
    `3. PAUTAS Y OBSERVACIONES CLÍNICAS:`,
    ...metrics.clinicalRecommendations.map((r, i) => `   ${i + 1}. ${r}`),
    `======================================================================`,
  ].join('\n');
}
