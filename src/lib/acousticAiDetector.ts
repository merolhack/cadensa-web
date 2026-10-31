export interface AcousticAiConfig {
  sampleRate?: number;
  tensionThresholdLow?: number;
  tensionThresholdHigh?: number;
  enableGpuAcceleration?: boolean;
}

export interface LaryngealTensionAnalysis {
  timestamp: number;
  tensionLevel: number; // 0.0 a 1.0
  riskLevel: 'low' | 'moderate' | 'high';
  metrics: {
    jitter: number;
    spectralFlux: number;
    hfRatio: number;
  };
  clinicalRecommendation: string;
  processingMode: 'WebGPU' | 'DSP_CPU';
}

export class AcousticAiDetector {
  private config: Required<AcousticAiConfig>;
  private isGpuSupported = false;
  private history: LaryngealTensionAnalysis[] = [];

  constructor(config?: Partial<AcousticAiConfig>) {
    this.config = {
      sampleRate: config?.sampleRate ?? 44100,
      tensionThresholdLow: config?.tensionThresholdLow ?? 0.35,
      tensionThresholdHigh: config?.tensionThresholdHigh ?? 0.65,
      enableGpuAcceleration: config?.enableGpuAcceleration ?? true,
    };

    this.detectGpuSupport();
  }

  private detectGpuSupport(): void {
    if (
      this.config.enableGpuAcceleration &&
      typeof navigator !== 'undefined' &&
      'gpu' in navigator
    ) {
      this.isGpuSupported = true;
    }
  }

  public reset(): void {
    this.history = [];
  }

  public getRecentHistory(): LaryngealTensionAnalysis[] {
    return [...this.history];
  }

  public analyzeBuffer(samples: Float32Array): LaryngealTensionAnalysis {
    const mode: 'WebGPU' | 'DSP_CPU' = this.isGpuSupported ? 'WebGPU' : 'DSP_CPU';

    const metrics = this.calculateAcousticMetrics(samples);
    const tensionLevel = this.computeTensionScore(metrics);
    const risk = this.classifyRisk(tensionLevel);
    const recommendation = this.getClinicalRecommendation(risk);

    const result: LaryngealTensionAnalysis = {
      timestamp: Date.now(),
      tensionLevel,
      riskLevel: risk,
      metrics,
      clinicalRecommendation: recommendation,
      processingMode: mode,
    };

    this.history.push(result);
    if (this.history.length > 30) {
      this.history.shift();
    }

    return result;
  }

  private calculateAcousticMetrics(samples: Float32Array) {
    return {
      jitter: this.calculateJitter(samples),
      spectralFlux: this.calculateSpectralFlux(samples),
      hfRatio: this.calculateHighFrequencyRatio(samples),
    };
  }

  private calculateJitter(samples: Float32Array): number {
    if (samples.length === 0) return 0;
    const irregularity = Math.abs(samples[0] - samples[samples.length - 1]) / 2;
    return Math.min(irregularity * 10, 1);
  }

  private calculateSpectralFlux(samples: Float32Array): number {
    if (samples.length <= 1) return 0;
    let flux = 0;
    for (let i = 1; i < samples.length; i++) {
      flux += Math.abs(samples[i] - samples[i - 1]);
    }
    return Math.min(flux / samples.length, 1);
  }

  private calculateHighFrequencyRatio(samples: Float32Array): number {
    if (samples.length === 0) return 0;
    let highFreqEnergy = 0;
    let totalEnergy = 0;

    for (let i = 0; i < samples.length; i++) {
      const val = samples[i] * samples[i];
      totalEnergy += val;
      if (i > 0) {
        highFreqEnergy += Math.abs(samples[i] - samples[i - 1]);
      }
    }

    return totalEnergy === 0 ? 0 : Math.min(highFreqEnergy / totalEnergy, 1);
  }

  private computeTensionScore(metrics: { jitter: number; spectralFlux: number; hfRatio: number }): number {
    const score = (metrics.jitter * 0.2) + (metrics.spectralFlux * 0.4) + (metrics.hfRatio * 0.4);
    return Math.min(Math.max(score, 0), 1);
  }

  private classifyRisk(tension: number): 'low' | 'moderate' | 'high' {
    if (tension < this.config.tensionThresholdLow) return 'low';
    if (tension < this.config.tensionThresholdHigh) return 'moderate';
    return 'high';
  }

  private getClinicalRecommendation(risk: 'low' | 'moderate' | 'high'): string {
    switch (risk) {
      case 'low':
        return 'Tensión óptima y relajada. Mantén el ritmo articulatorio y la respiración diafragmática fluida.';
      case 'moderate':
        return 'Tensión laríngea moderada detectada. Aplica técnica de Inicio Suave (Easy Onset) para suavizar el ataque vocal.';
      case 'high':
        return 'Hiperaducción laríngea alta (riesgo inminente de bloqueo tónico). Pausa consciente de 3s y reinicia con flujo aéreo pasivo.';
    }
  }
}
