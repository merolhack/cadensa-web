import { describe, it, expect } from 'vitest';
import {
  SPANISH_VOWEL_FORMANTS,
  classifyVowelFromFormants,
  analyzeVocalTractKinematics,
  estimateFormantsFromSpectrum,
} from './formantAnalyzer';

describe('formantAnalyzer engine', () => {
  it('debe tener definidos los formantes de las 5 vocales del español', () => {
    expect(SPANISH_VOWEL_FORMANTS.a.f1).toBe(800);
    expect(SPANISH_VOWEL_FORMANTS.i.f2).toBe(2250);
    expect(SPANISH_VOWEL_FORMANTS.u.f2).toBe(800);
  });

  it('debe clasificar correctamente las vocales según sus frecuencias F1 y F2', () => {
    expect(classifyVowelFromFormants(810, 1340)).toBe('a');
    expect(classifyVowelFromFormants(290, 2200)).toBe('i');
    expect(classifyVowelFromFormants(310, 820)).toBe('u');
    expect(classifyVowelFromFormants(520, 1780)).toBe('e');
    expect(classifyVowelFromFormants(490, 990)).toBe('o');
  });

  it('debe diagnosticar la cinemática mandibular y lingual del paciente', () => {
    // Vocal /a/: apertura mandibular abierta, posición central
    const resA = analyzeVocalTractKinematics(820, 1360);
    expect(resA.mandibularAperture).toBe('Abierta');
    expect(resA.lingualPosition).toBe('Central');
    expect(resA.closestVowel).toBe('a');

    // Vocal /i/: mandíbula cerrada, posición anterior
    const resI = analyzeVocalTractKinematics(280, 2300);
    expect(resI.mandibularAperture).toBe('Cerrada');
    expect(resI.lingualPosition).toBe('Anterior');
  });

  it('debe estimar picos F1 y F2 desde el espectro de magnitudes', () => {
    // FFT de 512 puntos a 44100 Hz -> binWidth = 44100 / 1024 = 43.06 Hz
    const spectrum = new Float32Array(512);
    // Simular pico F1 en bin 18 (~775 Hz)
    spectrum[18] = 0.9;
    // Simular pico F2 en bin 42 (~1808 Hz)
    spectrum[42] = 0.8;

    const { f1, f2 } = estimateFormantsFromSpectrum(spectrum, 44100);
    expect(f1).toBeGreaterThanOrEqual(700);
    expect(f1).toBeLessThanOrEqual(850);
    expect(f2).toBeGreaterThanOrEqual(1700);
    expect(f2).toBeLessThanOrEqual(1900);
  });
});
