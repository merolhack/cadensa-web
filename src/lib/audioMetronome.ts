/**
 * Cadensa Web Audio Metronome Engine
 * Motor de metrónomo de precisión de jitter cero basado en AudioContext.currentTime,
 * algoritmo de lookahead scheduler, selector de compás y timbres sintéticos.
 */

export type TimeSignature = 2 | 3 | 4;
export type SoundPreset = 'clasico' | 'madera' | 'digital';

export interface MetronomeState {
  isPlaying: boolean;
  bpm: number;
  isMuted: boolean;
  currentBeat: number;
  timeSignature: TimeSignature;
  soundPreset: SoundPreset;
  fadingEnabled: boolean;
}

export type TickCallback = (beat: number, time: number) => void;

export class AudioMetronome {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private bpm = 80;
  private isMuted = false;
  private currentBeat = 0;
  private nextNoteTime = 0.0;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private onTickCallback: TickCallback | null = null;

  // Nuevas capacidades clínicas
  private timeSignature: TimeSignature = 4;
  private soundPreset: SoundPreset = 'clasico';
  private fadingEnabled = false;

  // Configuración del programador lookahead
  private readonly lookaheadMs = 25.0; // Frecuencia con la que se comprueba el reloj (ms)
  private readonly scheduleAheadTimeSec = 0.1; // Margen de programación anticipada en segundos

  constructor(initialBpm = 80, onTick?: TickCallback) {
    this.bpm = Math.max(40, Math.min(240, initialBpm));
    if (onTick) {
      this.onTickCallback = onTick;
    }
  }

  /**
   * Obtiene o crea perezosamente el contexto de audio tras interacción de usuario.
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setOnTick(callback: TickCallback): void {
    this.onTickCallback = callback;
  }

  public setBpm(newBpm: number): void {
    this.bpm = Math.max(40, Math.min(240, newBpm));
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setTimeSignature(sig: TimeSignature): void {
    this.timeSignature = sig;
  }

  public getTimeSignature(): TimeSignature {
    return this.timeSignature;
  }

  public setSoundPreset(preset: SoundPreset): void {
    this.soundPreset = preset;
  }

  public getSoundPreset(): SoundPreset {
    return this.soundPreset;
  }

  public setFadingEnabled(enabled: boolean): void {
    this.fadingEnabled = enabled;
  }

  public isFadingEnabled(): boolean {
    return this.fadingEnabled;
  }

  public getState(): MetronomeState {
    return {
      isPlaying: this.isPlaying,
      bpm: this.bpm,
      isMuted: this.isMuted,
      currentBeat: this.currentBeat,
      timeSignature: this.timeSignature,
      soundPreset: this.soundPreset,
      fadingEnabled: this.fadingEnabled,
    };
  }

  /**
   * Genera el pulso de audio con el timbre sintético seleccionado.
   */
  private scheduleNote(time: number, beat: number): void {
    // Notificar al hilo de UI para feedback visual sincronizado
    if (this.onTickCallback) {
      const delayMs = Math.max(0, (time - (this.audioCtx?.currentTime || time)) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onTickCallback) {
          this.onTickCallback(beat, time);
        }
      }, delayMs);
    }

    if (this.isMuted || !this.audioCtx) return;

    // Si fading está activo: 4 compases audibles, 2 silenciosos
    if (this.fadingEnabled) {
      const barIndex = Math.floor(beat / this.timeSignature);
      const isMutedBar = barIndex % 6 >= 4;
      if (isMutedBar) return;
    }

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      const isAccent = beat % this.timeSignature === 0;

      if (this.soundPreset === 'madera') {
        // Bloque de madera (woodblock / clave): onda triangular rápida
        osc.type = 'triangle';
        osc.frequency.value = isAccent ? 720 : 480;
        gainNode.gain.setValueAtTime(0.4, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
      } else if (this.soundPreset === 'digital') {
        // Digital suave: onda senoidal pura sin ataque cortante
        osc.type = 'sine';
        osc.frequency.value = isAccent ? 520 : 360;
        gainNode.gain.setValueAtTime(0.01, time);
        gainNode.gain.linearRampToValueAtTime(0.25, time + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      } else {
        // Clásico: senoide 880 / 587 Hz
        osc.type = 'sine';
        osc.frequency.value = isAccent ? 880 : 587.33;
        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      }

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(time);
      osc.stop(time + 0.07);
    } catch {
      // Fallback silencioso en entornos sin soporte de audio
    }
  }

  /**
   * Bucle lookahead que programa notas en el reloj de hardware.
   */
  private scheduler = (): void => {
    const ctx = this.getAudioContext();
    const currentTime = ctx ? ctx.currentTime : performance.now() / 1000;

    while (this.nextNoteTime < currentTime + this.scheduleAheadTimeSec) {
      this.scheduleNote(this.nextNoteTime, this.currentBeat);

      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat++;
    }

    if (this.isPlaying) {
      this.timerId = setTimeout(this.scheduler, this.lookaheadMs);
    }
  };

  public start(): void {
    if (this.isPlaying) return;

    const ctx = this.getAudioContext();
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = ctx ? ctx.currentTime + 0.05 : 0.05;

    this.scheduler();
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }
}
