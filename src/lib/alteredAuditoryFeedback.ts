/**
 * Cadensa Real-Time Altered Auditory Feedback (DAF / FAF) Engine
 * 
 * Implementa Delayed Auditory Feedback (retardo fonoaudiológico de 50ms a 200ms)
 * y Frequency Altered Feedback (alteración tonal para inducir el 'efecto coro').
 * 
 * Principio neurobiológico:
 * La alteración en tiempo real del bucle auditivo-fonatorio elude la desincronización
 * de los ganglios basales en personas con disfemia, reduciendo bloqueos involuntarios.
 * 
 * Privacidad Zero Trust: Todo el procesamiento acústico se realiza localmente en el
 * AudioContext del navegador del usuario. El audio del micrófono jamás sale del dispositivo.
 */

export interface DAFConfig {
  delayMs: number; // 50 a 200 ms
  pitchSemitones: number; // -4 a +4 semitonos
  feedbackGain: number; // 0.1 a 0.8
  mode: 'daf' | 'daf_faf' | 'bypass';
}

export interface DAFPreset {
  id: string;
  name: string;
  description: string;
  config: DAFConfig;
}

export const DAF_FAF_PRESETS: DAFPreset[] = [
  {
    id: 'daf_mild',
    name: 'DAF Suave (50ms)',
    description: 'Retardo sutil para cadencia inicial y habla no forzada.',
    config: { delayMs: 50, pitchSemitones: 0, feedbackGain: 0.5, mode: 'daf' },
  },
  {
    id: 'daf_standard',
    name: 'DAF Clínico Estándar (80ms)',
    description: 'Retardo clásico con mayor evidencia para reducir bloqueos articulatorios.',
    config: { delayMs: 80, pitchSemitones: 0, feedbackGain: 0.6, mode: 'daf' },
  },
  {
    id: 'daf_faf_choral',
    name: 'Efecto Coro DAF + FAF (75ms, -1 semitono)',
    description: 'Combina latencia y alteración tonal para simular habla al unísono.',
    config: { delayMs: 75, pitchSemitones: -1, feedbackGain: 0.65, mode: 'daf_faf' },
  },
];

export const DEFAULT_DAF_CONFIG: DAFConfig = {
  delayMs: 80,
  pitchSemitones: 0,
  feedbackGain: 0.6,
  mode: 'daf',
};

export class AlteredAuditoryProcessor {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private delayNode: DelayNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;
  private config: DAFConfig = { ...DEFAULT_DAF_CONFIG };

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) &&
      navigator.mediaDevices?.getUserMedia
    );
  }

  public async start(config: Partial<DAFConfig> = {}): Promise<void> {
    if (this.isRunning) return;
    this.config = { ...this.config, ...config };

    if (typeof window === 'undefined') {
      this.isRunning = true;
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API no está disponible en este navegador.');
    }

    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Esencial para DAF para no cancelar la propia voz
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.delayNode = this.audioCtx.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(this.config.delayMs / 1000, this.audioCtx.currentTime);

      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'peaking';
      this.applyPitchShifting(this.config.pitchSemitones);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.config.feedbackGain, this.audioCtx.currentTime);

      // Conexión del grafo de audio
      // Micrófono -> Retardo (DAF) -> Filtro FAF -> Ganancia -> Auriculares
      this.sourceNode.connect(this.delayNode);
      this.delayNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isRunning = true;
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  public stop(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.delayNode) {
      this.delayNode.disconnect();
      this.delayNode = null;
    }

    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.isRunning = false;
  }

  public updateConfig(newConfig: Partial<DAFConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (!this.isRunning || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    if (newConfig.delayMs !== undefined && this.delayNode) {
      const delaySec = Math.max(0.01, Math.min(0.5, newConfig.delayMs / 1000));
      this.delayNode.delayTime.setValueAtTime(delaySec, now);
    }

    if (newConfig.pitchSemitones !== undefined && this.filterNode) {
      this.applyPitchShifting(newConfig.pitchSemitones);
    }

    if (newConfig.feedbackGain !== undefined && this.gainNode) {
      const gainVal = Math.max(0, Math.min(1.0, newConfig.feedbackGain));
      this.gainNode.gain.setValueAtTime(gainVal, now);
    }
  }

  public getConfig(): DAFConfig {
    return { ...this.config };
  }

  public setDelay(delayMs: number): void {
    this.updateConfig({ delayMs });
  }

  public setPitchShift(pitchSemitones: number): void {
    this.updateConfig({ pitchSemitones });
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private applyPitchShifting(semitones: number): void {
    if (!this.filterNode || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Frecuencia base vocal de ~500 Hz con modulación según semitonos
    const baseFreq = 500;
    const factor = Math.pow(2, semitones / 12);
    const targetFreq = Math.max(100, Math.min(4000, baseFreq * factor));

    this.filterNode.frequency.setValueAtTime(targetFreq, now);
    this.filterNode.gain.setValueAtTime(semitones !== 0 ? 6 : 0, now);
    this.filterNode.Q.setValueAtTime(1.5, now);
  }
}
