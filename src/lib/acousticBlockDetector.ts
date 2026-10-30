/**
 * Cadensa Acoustic Block & Disfluency Detector (On-Device Zero Trust)
 * 
 * Hito 1 - Suite de Detección Acústica Clínica v2
 * Analiza en tiempo real los patrones espectro-temporales de la fonación
 * para identificar bloqueos tónicos, prolongaciones involuntarias y repeticiones clónicas.
 * 
 * Principio Zero Trust: Todo el procesamiento acústico se realiza localmente
 * en el navegador del paciente; ningún flujo de audio se transmite por red.
 */

export type DisfluencyType = 'NONE' | 'TONIC_BLOCK' | 'PROLONGATION' | 'CLONIC_REPETITION';

export interface AcousticAnalysisFrame {
  timestamp: number;
  rmsEnergy: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  isVoiced: boolean;
}

export interface DisfluencyEvent {
  id: string;
  type: DisfluencyType;
  durationMs: number;
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: number;
  message: string;
}

export interface AcousticDetectorConfig {
  noiseFloor: number;             // Umbral mínimo de energía RMS (0.0 a 1.0)
  voicedThreshold: number;        // Umbral de fonación activa
  blockMinDurationMs: number;     // Mínimo de duración para calificar bloqueo tónico (ej. 350ms)
  prolongationMinDurationMs: number; // Mínimo de duración para calificar prolongación (ej. 300ms)
  repetitionMaxIntervalMs: number;   // Intervalo máximo entre pulsos para repetición (ej. 200ms)
}

export const DEFAULT_ACOUSTIC_CONFIG: AcousticDetectorConfig = {
  noiseFloor: 0.015,
  voicedThreshold: 0.035,
  blockMinDurationMs: 350,
  prolongationMinDurationMs: 300,
  repetitionMaxIntervalMs: 220,
};

export class AcousticBlockDetector {
  private config: AcousticDetectorConfig;
  private recentFrames: AcousticAnalysisFrame[] = [];
  private consecutiveSilentVoicingMs = 0;
  private consecutiveVoicedMs = 0;
  private lastPulseTimestamp = 0;
  private pulseCount = 0;
  private isEffortDetected = false;

  constructor(customConfig?: Partial<AcousticDetectorConfig>) {
    this.config = { ...DEFAULT_ACOUSTIC_CONFIG, ...customConfig };
  }

  /**
   * Actualiza el estado de esfuerzo articulatorio del paciente (ej. retroalimentación háptica o botón de intento de habla).
   */
  public setArticulatoryEffort(isAttempting: boolean): void {
    this.isEffortDetected = isAttempting;
  }

  /**
   * Extrae características acústicas directas de una ventana de muestras temporales PCM (Float32Array).
   */
  public extractFrame(samples: Float32Array, sampleRate = 44100): AcousticAnalysisFrame {
    let sumSquares = 0;
    let zeroCrossings = 0;
    let weightedFrequencySum = 0;
    let totalMagnitude = 0;

    const length = samples.length;
    for (let i = 0; i < length; i++) {
      const val = samples[i];
      sumSquares += val * val;

      if (i > 0 && ((samples[i - 1] >= 0 && val < 0) || (samples[i - 1] < 0 && val >= 0))) {
        zeroCrossings++;
      }

      // Estimación de centroide espectral temporal
      const mag = Math.abs(val);
      totalMagnitude += mag;
      weightedFrequencySum += mag * (i / length) * (sampleRate / 2);
    }

    const rmsEnergy = Math.sqrt(sumSquares / (length || 1));
    const zeroCrossingRate = zeroCrossings / (length || 1);
    const spectralCentroid = totalMagnitude > 0 ? weightedFrequencySum / totalMagnitude : 0;
    const isVoiced = rmsEnergy > this.config.voicedThreshold;

    return {
      timestamp: Date.now(),
      rmsEnergy,
      zeroCrossingRate,
      spectralCentroid,
      isVoiced,
    };
  }

  /**
   * Procesa un cuadro acústico y evalúa en tiempo real si existe una disfluencia clínica.
   */
  public processFrame(frame: AcousticAnalysisFrame, frameDurationMs = 20): DisfluencyEvent | null {
    this.recentFrames.push(frame);
    if (this.recentFrames.length > 50) {
      this.recentFrames.shift();
    }

    // 1. Detección de Bloqueo Tónico (Laryngeal/Tonic Block)
    // Tensión articulatoria (intento de fonación) pero silencio o nivel subglótico congelado sin salida sonora
    if (this.isEffortDetected && !frame.isVoiced) {
      this.consecutiveSilentVoicingMs += frameDurationMs;
      if (this.consecutiveSilentVoicingMs >= this.config.blockMinDurationMs) {
        const duration = this.consecutiveSilentVoicingMs;
        this.consecutiveSilentVoicingMs = 0; // Reset para no duplicar

        return {
          id: `block_${Date.now()}`,
          type: 'TONIC_BLOCK',
          durationMs: duration,
          severity: duration > 800 ? 'severe' : duration > 500 ? 'moderate' : 'mild',
          timestamp: frame.timestamp,
          message: 'Bloqueo tónico detectado: tensión laríngea sin liberación acústica. Aplica inicio suave.',
        };
      }
    } else {
      this.consecutiveSilentVoicingMs = 0;
    }

    // 2. Detección de Prolongación Involuntaria (Prolonged Speech Sound)
    // Sonoridad continua (> 300ms) con mínima variación espectral (congelamiento de formantes/fricación)
    if (frame.isVoiced) {
      this.consecutiveVoicedMs += frameDurationMs;

      if (this.consecutiveVoicedMs >= this.config.prolongationMinDurationMs) {
        // Verificar si la energía se mantuvo excesivamente plana (desviación baja)
        const recentVoiced = this.recentFrames.slice(-15);
        const energies = recentVoiced.map((f) => f.rmsEnergy);
        const meanEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
        const variance = energies.reduce((a, b) => a + Math.pow(b - meanEnergy, 2), 0) / energies.length;

        if (variance < 0.001) {
          const duration = this.consecutiveVoicedMs;
          this.consecutiveVoicedMs = 0;

          return {
            id: `prolongation_${Date.now()}`,
            type: 'PROLONGATION',
            durationMs: duration,
            severity: duration > 700 ? 'severe' : duration > 450 ? 'moderate' : 'mild',
            timestamp: frame.timestamp,
            message: 'Prolongación fonética detectada. Utiliza ritmo silábico regular para transicionar.',
          };
        }
      }
    } else {
      this.consecutiveVoicedMs = 0;
    }

    // 3. Detección de Repeticiones Clónicas (Clonic Bursts)
    // Ráfagas rápidas de energía que se encienden y apagan en menos de 220ms
    if (frame.isVoiced && this.recentFrames.length > 2 && !this.recentFrames[this.recentFrames.length - 2].isVoiced) {
      const now = frame.timestamp;
      const interval = now - this.lastPulseTimestamp;

      if (interval < this.config.repetitionMaxIntervalMs && interval > 50) {
        this.pulseCount++;
        if (this.pulseCount >= 2) {
          this.pulseCount = 0;
          return {
            id: `repetition_${Date.now()}`,
            type: 'CLONIC_REPETITION',
            durationMs: interval * 2,
            severity: 'moderate',
            timestamp: now,
            message: 'Repetición clónica detectada. Conecta con el pulso del metrónomo para estabilizar.',
          };
        }
      } else {
        this.pulseCount = 1;
      }
      this.lastPulseTimestamp = now;
    }

    return null;
  }

  /**
   * Reinicia los acumuladores temporales del analizador.
   */
  public reset(): void {
    this.recentFrames = [];
    this.consecutiveSilentVoicingMs = 0;
    this.consecutiveVoicedMs = 0;
    this.lastPulseTimestamp = 0;
    this.pulseCount = 0;
    this.isEffortDetected = false;
  }
}
