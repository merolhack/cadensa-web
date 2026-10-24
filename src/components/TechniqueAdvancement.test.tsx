import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useState } from 'react';
import { TechniqueVisualizer } from './TechniqueVisualizer';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';
import { SyllableReader } from './SyllableReader';

describe('Verificación Automatizada de Avance Silábico en Técnicas Fonoaudiológicas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Easy Onset: debe avanzar de vocal automáticamente tras completar el ciclo de 3.0s (A -> e -> i)', () => {
    const nextFn = vi.fn();

    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.easy_onset}
        isPlaying={true}
        bpm={80}
        activeSyllableIndex={0}
        currentPhrase="A e i o u"
        onNextSyllable={nextFn}
      />
    );

    // Al inicio no se ha invocado
    expect(nextFn).toHaveBeenCalledTimes(0);

    // Avanzar 3000ms (ciclo completo de 1s suspiro + 1s subida + 1s fonación)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(nextFn).toHaveBeenCalledTimes(1);

    // Avanzar otros 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(nextFn).toHaveBeenCalledTimes(2);
  });

  it('Easy Onset: es inmune a re-renders continuos del padre (como el cronómetro de sesión) y NO reinicia el progreso a 0', () => {
    const nextFn = vi.fn();

    const ParentSimulator = () => {
      const [, setSeconds] = useState(0);
      return (
        <div>
          <button data-testid="tick" onClick={() => setSeconds((s) => s + 1)}>
            Tick
          </button>
          <TechniqueVisualizer
            technique={CLINICAL_TECHNIQUES.easy_onset}
            isPlaying={true}
            bpm={80}
            activeSyllableIndex={0}
            currentPhrase="A e i o u"
            onNextSyllable={nextFn}
          />
        </div>
      );
    };

    const { getByTestId } = render(<ParentSimulator />);

    // Simular que el padre re-renderiza cada segundo (como el cronómetro de sesión)
    act(() => {
      vi.advanceTimersByTime(1000);
      fireEvent.click(getByTestId('tick'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
      fireEvent.click(getByTestId('tick'));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
      fireEvent.click(getByTestId('tick'));
    });

    // En total pasaron 3000ms con re-renders en medio; el temporizador debió culminar e invocar nextFn
    expect(nextFn).toHaveBeenCalledTimes(1);
  });

  it('Easy Onset: permite avance manual inmediato con el botón "Avanzar Vocal ➡️"', () => {
    const nextFn = vi.fn();

    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.easy_onset}
        isPlaying={false}
        bpm={80}
        activeSyllableIndex={0}
        currentPhrase="A e i o u"
        onNextSyllable={nextFn}
      />
    );

    const advanceBtn = screen.getByRole('button', { name: /avanzar vocal/i });
    fireEvent.click(advanceBtn);

    expect(nextFn).toHaveBeenCalledTimes(1);
  });

  it('Contacto Articular Suave (Light Contact): avanza de sílaba automáticamente cada 2.0s', () => {
    const nextFn = vi.fn();

    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.light_contact}
        isPlaying={true}
        bpm={80}
        activeSyllableIndex={0}
        currentPhrase="pa ta ka pa ta ka"
        onNextSyllable={nextFn}
      />
    );

    expect(nextFn).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(nextFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(nextFn).toHaveBeenCalledTimes(2);
  });

  it('Habla Prolongada (Prolonged Speech): avanza de sílaba automáticamente cada 2.2s', () => {
    const nextFn = vi.fn();

    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.prolonged_speech}
        isPlaying={true}
        bpm={80}
        activeSyllableIndex={0}
        currentPhrase="Sa le el sol"
        onNextSyllable={nextFn}
      />
    );

    expect(nextFn).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(nextFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(nextFn).toHaveBeenCalledTimes(2);
  });

  it('Integración visual: El lector de sílabas SyllableReader refleja el avance dinámico sin quedarse en la letra "A"', () => {
    const InteractiveExercise = () => {
      const [idx, setIdx] = useState(0);
      const phrase = 'a e i o u';

      return (
        <div>
          <TechniqueVisualizer
            technique={CLINICAL_TECHNIQUES.easy_onset}
            isPlaying={true}
            bpm={80}
            activeSyllableIndex={idx}
            currentPhrase={phrase}
            onNextSyllable={() => setIdx((prev) => (prev + 1) % 5)}
          />
          <SyllableReader
            sentence={phrase}
            activeSyllableIndex={idx}
            isPlaying={true}
          />
        </div>
      );
    };

    const { container } = render(<InteractiveExercise />);

    // Verificar que al inicio la sílaba activa tiene el efecto brillante
    const activeElementsInitial = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsInitial.length).toBeGreaterThan(0);
    expect(activeElementsInitial[0]?.textContent).toBe('a');

    // Avanzar 3000ms -> debe ser 'e'
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const activeElementsStep2 = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsStep2[0]?.textContent).toBe('e');

    // Avanzar 3000ms -> debe ser 'i'
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const activeElementsStep3 = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsStep3[0]?.textContent).toBe('i');

    // Avanzar 3000ms -> debe ser 'o'
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const activeElementsStep4 = container.querySelectorAll('.from-emerald-500');
    expect(activeElementsStep4[0]?.textContent).toBe('o');
  });
});
