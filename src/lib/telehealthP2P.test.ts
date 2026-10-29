import { describe, it, expect } from 'vitest';
import {
  generateTelehealthRoomCode,
  serializeTelehealthMessage,
  parseTelehealthMessage,
  calculateRoundTripLatency,
  createBeatPulseMessage,
  createAccuracyFeedbackMessage,
} from './telehealthP2P';

describe('telehealthP2P engine', () => {
  it('debe generar códigos de sala con formato CAD-XXXX', () => {
    const code = generateTelehealthRoomCode();
    expect(code).toMatch(/^CAD-\d{4}$/);
  });

  it('debe serializar y deserializar mensajes de metrónomo sin pérdida', () => {
    const msg = createBeatPulseMessage('therapist', 85, 2);
    const json = serializeTelehealthMessage(msg);
    const parsed = parseTelehealthMessage(json);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('BEAT_PULSE');
    expect(parsed?.senderRole).toBe('therapist');
    expect(parsed?.payload?.bpm).toBe(85);
    expect(parsed?.payload?.beatIndex).toBe(2);
  });

  it('debe rechazar mensajes inválidos de forma segura', () => {
    expect(parseTelehealthMessage('invalid json string')).toBeNull();
    expect(parseTelehealthMessage('{}')).toBeNull();
    expect(parseTelehealthMessage('{"type": "METRONOME"}')).toBeNull();
  });

  it('debe calcular la latencia RTT de ida y vuelta en milisegundos', () => {
    const sendTime = 1000;
    const recvTime = 1024;
    const rtt = calculateRoundTripLatency(sendTime, recvTime);
    expect(rtt).toBe(24);
  });

  it('debe empaquetar feedback de precisión silábica correctamente', () => {
    const msg = createAccuracyFeedbackMessage('patient', 95, 25, '¡A compás perfecto!');
    expect(msg.type).toBe('ACCURACY_FEEDBACK');
    expect(msg.senderRole).toBe('patient');
    expect(msg.payload?.score).toBe(95);
    expect(msg.payload?.diffMs).toBe(25);
  });
});

