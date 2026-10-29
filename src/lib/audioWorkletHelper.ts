/**
 * Cadensa Ultra-Low Latency Audio Worklet & VAD Helper
 * Procesa la señal de audio del micrófono en un hilo dedicado de baja latencia (< 5ms)
 * fuera del hilo principal de JavaScript para garantizar precisión foniátrica.
 */

export interface AudioWorkletConfig {
  sampleRate?: number;
  vadThreshold?: number; // Nivel RMS umbral para detectar inicio de fonación
  onVoiceOnset?: (timestampMs: number, rms: number) => void;
  onVolumeUpdate?: (rms: number) => void;
}

export interface AudioDetectorInstance {
  stop: () => void;
  isWorkletActive: boolean;
}

/**
 * Código fuente del procesador AudioWorklet empaquetado como módulo seguro.
 */
export const AUDIO_WORKLET_CODE = `
class CadensaVADProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 128;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input[0]) {
      const channel = input[0];
      let sum = 0;
      for (let i = 0; i < channel.length; i++) {
        sum += channel[i] * channel[i];
      }
      const rms = Math.sqrt(sum / channel.length);
      this.port.postMessage({ type: 'audio-frame', rms, timestamp: currentTime * 1000 });
    }
    return true;
  }
}
registerProcessor('cadensa-vad-processor', CadensaVADProcessor);
`;

/**
 * Comprueba si el entorno actual soporta AudioWorklet de forma nativa.
 */
export function supportsAudioWorklet(): boolean {
  if (typeof window === 'undefined') return false;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return false;
  return 'audioWorklet' in AudioCtx.prototype;
}

/**
 * Calcula la variabilidad / jitter temporal fonoaudiológico en milisegundos
 * respecto al intervalo rítmico objetivo (BPM).
 */
export function calculateVoiceJitter(
  onsetTimestampsMs: number[],
  targetIntervalMs: number
): { jitterMs: number; isRegular: boolean } {
  if (onsetTimestampsMs.length < 2 || targetIntervalMs <= 0) {
    return { jitterMs: 0, isRegular: true };
  }

  const intervals: number[] = [];
  for (let i = 1; i < onsetTimestampsMs.length; i++) {
    intervals.push(onsetTimestampsMs[i] - onsetTimestampsMs[i - 1]);
  }

  const deviations = intervals.map((intv) => Math.abs(intv - targetIntervalMs));
  const meanDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
  const jitterMs = Math.round(meanDeviation);

  // Consideramos regular un jitter foniátrico ≤ 45 ms en el compás del metrónomo
  return {
    jitterMs,
    isRegular: jitterMs <= 45,
  };
}

/**
 * Inicializa el detector de fonación con AudioWorklet o fallback a AnalyserNode.
 */
export async function setupUltraLowLatencyVoiceDetector(
  stream: MediaStream,
  config: AudioWorkletConfig = {}
): Promise<AudioDetectorInstance> {
  const threshold = config.vadThreshold ?? 0.035;
  let isWorkletActive = false;
  let isStopped = false;
  let wasActive = false;

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API no disponible en este navegador');
  }

  const audioContext = new AudioCtx({ latencyHint: 'interactive' });
  const sourceNode = audioContext.createMediaStreamSource(stream);

  let workletNode: AudioNode | null = null;
  let analyserNode: AnalyserNode | null = null;
  let fallbackInterval: ReturnType<typeof setInterval> | null = null;

  const handleRMS = (rms: number, timestampMs: number) => {
    if (isStopped) return;
    config.onVolumeUpdate?.(rms);

    if (rms >= threshold && !wasActive) {
      wasActive = true;
      config.onVoiceOnset?.(timestampMs, rms);
    } else if (rms < threshold * 0.7) {
      wasActive = false;
    }
  };

  // Intentar cargar AudioWorklet si está disponible
  if (supportsAudioWorklet() && audioContext.audioWorklet) {
    try {
      const blob = new Blob([AUDIO_WORKLET_CODE], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await audioContext.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      // Instanciar AudioWorkletNode
      const WorkletNodeConstructor = window.AudioWorkletNode;
      if (WorkletNodeConstructor) {
        const node = new WorkletNodeConstructor(audioContext, 'cadensa-vad-processor');
        node.port.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'audio-frame') {
            handleRMS(event.data.rms, event.data.timestamp);
          }
        };
        sourceNode.connect(node);
        workletNode = node;
        isWorkletActive = true;
      }
    } catch {
      // Fallback si falla addModule (por ejemplo políticas estrictas de CSP o Blob)
      isWorkletActive = false;
    }
  }

  // Fallback con AnalyserNode en tiempo real
  if (!isWorkletActive) {
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    sourceNode.connect(analyserNode);

    const buffer = new Float32Array(analyserNode.fftSize);
    fallbackInterval = setInterval(() => {
      if (isStopped || !analyserNode) return;
      analyserNode.getFloatTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sum / buffer.length);
      handleRMS(rms, performance.now());
    }, 20);
  }

  const stop = () => {
    isStopped = true;
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
      fallbackInterval = null;
    }
    try {
      workletNode?.disconnect();
      analyserNode?.disconnect();
      sourceNode.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    } catch {
      // Ignorar errores al cerrar
    }
  };

  return {
    stop,
    isWorkletActive,
  };
}

