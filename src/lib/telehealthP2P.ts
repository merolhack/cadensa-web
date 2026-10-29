/**
 * Cadensa Peer-to-Peer Telehealth & Real-Time Sync Engine
 * Facilita sesiones de fonoaudiología remota encriptada de extremo a extremo (E2EE)
 * con metrónomo sincronizado maestro-esclavo y latencia sub-30ms vía WebRTC DataChannel.
 */

export type TelehealthRole = 'therapist' | 'patient';

export type TelehealthMessageType =
  | 'METRONOME_START'
  | 'METRONOME_STOP'
  | 'BEAT_PULSE'
  | 'ACCURACY_FEEDBACK'
  | 'PING'
  | 'PONG';

export interface TelehealthMessage {
  type: TelehealthMessageType;
  senderRole: TelehealthRole;
  timestamp: number;
  payload?: {
    bpm?: number;
    beatIndex?: number;
    score?: number;
    diffMs?: number;
    label?: string;
    rttMs?: number;
  };
}

export interface TelehealthRoomSession {
  roomCode: string;
  role: TelehealthRole;
  isConnected: boolean;
  rttMs: number;
  remoteBpm: number;
  isRemotePlaying: boolean;
}

/**
 * Genera un código de sala clínica fonoaudiológica formateado (ej: CAD-7482).
 */
export function generateTelehealthRoomCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CAD-${randomNum}`;
}

/**
 * Serializa un mensaje de sincronización para su transmisión por RTCDataChannel.
 */
export function serializeTelehealthMessage(message: TelehealthMessage): string {
  return JSON.stringify(message);
}

/**
 * Parsea y valida un mensaje entrante de telepráctica.
 */
export function parseTelehealthMessage(rawJson: string): TelehealthMessage | null {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed.type !== 'string' || !parsed.senderRole) {
      return null;
    }
    return parsed as TelehealthMessage;
  } catch {
    return null;
  }
}

/**
 * Procesa un paquete PING o PONG y calcula la latencia de ida y vuelta (RTT) en milisegundos.
 */
export function calculateRoundTripLatency(pingSendTimestamp: number, currentTimestamp: number): number {
  if (currentTimestamp <= pingSendTimestamp) return 0;
  return Math.round(currentTimestamp - pingSendTimestamp);
}

/**
 * Crea un mensaje de pulso rítmico para sincronizar al paciente en el compás del terapeuta.
 */
export function createBeatPulseMessage(
  role: TelehealthRole,
  bpm: number,
  beatIndex: number
): TelehealthMessage {
  return {
    type: 'BEAT_PULSE',
    senderRole: role,
    timestamp: Date.now(),
    payload: {
      bpm,
      beatIndex,
    },
  };
}

/**
 * Crea un mensaje de feedback de precisión silábica para monitoreo del terapeuta.
 */
export function createAccuracyFeedbackMessage(
  role: TelehealthRole,
  score: number,
  diffMs: number,
  label: string
): TelehealthMessage {
  return {
    type: 'ACCURACY_FEEDBACK',
    senderRole: role,
    timestamp: Date.now(),
    payload: {
      score,
      diffMs,
      label,
    },
  };
}
