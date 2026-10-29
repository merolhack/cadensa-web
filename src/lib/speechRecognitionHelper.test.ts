import { describe, it, expect } from 'vitest';
import {
  normalizePhoneticText,
  calculateLevenshteinDistance,
  evaluatePhoneticMatch,
  isSpeechRecognitionSupported,
} from './speechRecognitionHelper';

describe('speechRecognitionHelper', () => {
  it('debe normalizar texto eliminando tildes, signos de puntuación y mayúsculas', () => {
    const raw = '¡El camión llegó rápido, sí!';
    const norm = normalizePhoneticText(raw);
    expect(norm).toBe('el camion llego rapido si');
  });

  it('debe calcular la distancia de Levenshtein con exactitud', () => {
    expect(calculateLevenshteinDistance('hola', 'hola')).toBe(0);
    expect(calculateLevenshteinDistance('casa', 'caza')).toBe(1);
    expect(calculateLevenshteinDistance('gato', 'pato')).toBe(1);
    expect(calculateLevenshteinDistance('sol', 'luna')).toBe(4);
  });

  it('debe evaluar coincidencia óptima cuando la frase hablada coincide con el objetivo', () => {
    const target = 'Camino despacio cada mañana';
    const spoken = 'camino despacio cada mañana';
    const result = evaluatePhoneticMatch(target, spoken);

    expect(result.isAccurate).toBe(true);
    expect(result.matchPercentage).toBe(100);
    expect(result.omittedTokens).toHaveLength(0);
    expect(result.clinicalFeedback).toContain('óptima');
  });

  it('debe tolerar ligeras variaciones dialectales o fonéticas cercanas', () => {
    const target = 'Un cafe con leche por favor';
    const spoken = 'un cafe con lexe por favor'; // error de 1 caracter en leche
    const result = evaluatePhoneticMatch(target, spoken);

    expect(result.isAccurate).toBe(true);
    expect(result.matchPercentage).toBeGreaterThanOrEqual(80);
  });

  it('debe identificar omisiones significativas por bloqueo o silencio', () => {
    const target = 'Hablar con calma y seguridad es posible';
    const spoken = 'hablar con calma'; // omitió la mitad
    const result = evaluatePhoneticMatch(target, spoken);

    expect(result.isAccurate).toBe(false);
    expect(result.matchPercentage).toBeLessThan(70);
    expect(result.omittedTokens).toContain('seguridad');
    expect(result.clinicalFeedback).toContain('omisiones o bloqueos');
  });

  it('debe reportar de forma segura si la API de reconocimiento está soportada', () => {
    // En JSDOM no existe SpeechRecognition nativo
    expect(typeof isSpeechRecognitionSupported()).toBe('boolean');
  });
});

