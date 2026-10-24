import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TechniqueVisualizer } from './TechniqueVisualizer';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

describe('TechniqueVisualizer Component - Unit Tests', () => {
  it('debe renderizar la rampa de fonación progresiva para Inicio Vocal Suave (Easy Onset)', () => {
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.easy_onset}
        isPlaying={true}
        bpm={80}
      />
    );

    expect(screen.getByText(/rampa de fonación progresiva/i)).toBeInTheDocument();
    expect(screen.getByText(/0% suspiro/i)).toBeInTheDocument();
    expect(screen.getByText(/100% voz plena/i)).toBeInTheDocument();
  });

  it('debe renderizar el medidor de presión articular para Contacto Articular Suave', () => {
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.light_contact}
        isPlaying={false}
        bpm={80}
      />
    );

    expect(screen.getByText(/monitoreo de presión articular/i)).toBeInTheDocument();
    expect(screen.getByText(/tacto de pluma/i)).toBeInTheDocument();
  });

  it('debe renderizar el estiramiento vocálico para Habla Prolongada', () => {
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.prolonged_speech}
        isPlaying={false}
        bpm={80}
      />
    );

    expect(screen.getByText(/estiramiento vocálico y fonación continua/i)).toBeInTheDocument();
  });

  it('debe permitir iniciar la descompresión de 3 segundos en Pull-Out / Cancelación', () => {
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.pull_out}
        isPlaying={false}
        bpm={80}
      />
    );

    const button = screen.getByRole('button', { name: /iniciar pausa de 3 segundos/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    expect(screen.getByText(/suelta la tensión en mandíbula y cuello/i)).toBeInTheDocument();
  });

  it('debe renderizar el orbe de respiración cuadrada para Box Breathing', () => {
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.box_breathing}
        isPlaying={true}
        bpm={80}
      />
    );

    expect(screen.getByText(/orbe de respiración cuadrada/i)).toBeInTheDocument();
    expect(screen.getByText(/ciclo activo/i)).toBeInTheDocument();
  });

  it('debe permitir avanzar manualmente de vocal en Easy Onset', () => {
    let advanced = false;
    render(
      <TechniqueVisualizer
        technique={CLINICAL_TECHNIQUES.easy_onset}
        isPlaying={false}
        bpm={80}
        activeSyllableIndex={0}
        currentPhrase="A e i o u"
        onNextSyllable={() => { advanced = true; }}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /avanzar vocal/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(advanced).toBe(true);
  });
});
