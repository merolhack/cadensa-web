import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TechniqueVideoModal } from './TechniqueVideoModal';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

describe('TechniqueVideoModal Component - Unit Tests', () => {
  const technique = CLINICAL_TECHNIQUES.easy_onset;

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={false}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el título de la técnica y el contenedor de video cuando isOpen es true', () => {
    render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Inicio Vocal Suave (Easy Onset)')).toBeInTheDocument();
    expect(screen.getByText(/Avatar IA Maestro/i)).toBeInTheDocument();
  });

  it('invoca onClose al hacer clic en el botón de cerrar', () => {
    const onClose = vi.fn();
    render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={true}
        onClose={onClose}
        onStartPractice={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar modal de video/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invoca onStartPractice y onClose al hacer clic en comenzar práctica', () => {
    const onStartPractice = vi.fn();
    const onClose = vi.fn();
    render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={true}
        onClose={onClose}
        onStartPractice={onStartPractice}
      />
    );

    const startBtn = screen.getByRole('button', { name: /comenzar práctica de/i });
    fireEvent.click(startBtn);
    expect(onStartPractice).toHaveBeenCalledWith(technique);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renderiza la portada interactiva y monta el video con audio directo al hacer clic en reproducir para la técnica STS', () => {
    const stsTechnique = CLINICAL_TECHNIQUES.sts;
    render(
      <TechniqueVideoModal
        technique={stsTechnique}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    // Debe mostrar la imagen de portada y el botón de play
    const posterImg = screen.getByAltText(/portada del video demostrativo/i);
    expect(posterImg).toBeInTheDocument();
    expect(posterImg).toHaveAttribute('src', stsTechnique.thumbnailUrl);

    const playBtn = screen.getByRole('button', { name: /reproducir video demostrativo/i });
    expect(playBtn).toBeInTheDocument();

    // Al hacer clic en play, se monta el elemento video con audio directo (muted: false)
    fireEvent.click(playBtn);

    const videoEl = screen.getByRole('dialog').querySelector('video');
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute('src', stsTechnique.videoUrl);
    expect(videoEl).toHaveAttribute('poster', stsTechnique.thumbnailUrl);
    expect(videoEl).toHaveAttribute('preload', 'metadata');
    expect(videoEl).toHaveProperty('muted', false);

    // Debe mostrar el botón de alternar audio (Audio activo) y permitir silenciar / reactivar
    const audioToggleBtn = screen.getByRole('button', { name: /silenciar audio del video/i });
    expect(audioToggleBtn).toBeInTheDocument();
    fireEvent.click(audioToggleBtn);
    expect(videoEl).toHaveProperty('muted', true);
    expect(screen.getByRole('button', { name: /activar audio del video/i })).toBeInTheDocument();
  });

  it('permite alternar entre las 7 técnicas fonoaudiológicas dentro del modal', () => {
    render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    // Debe listar las técnicas disponibles
    expect(screen.getByText('TÉCNICAS DISPONIBLES EN EL AVATAR IA:')).toBeInTheDocument();

    // Al pulsar la técnica de Respiración Diafragmática
    const bbBtn = screen.getByRole('button', { name: /Respiración/i });
    fireEvent.click(bbBtn);

    expect(screen.getByText('Respiración Diafragmática (Box Breathing)')).toBeInTheDocument();
  });

  it('permite reportar falla o duda en el video mediante onReportIssue o modal integrado', () => {
    const onReportIssue = vi.fn();
    render(
      <TechniqueVideoModal
        technique={technique}
        isOpen={true}
        onClose={vi.fn()}
        onStartPractice={vi.fn()}
        onReportIssue={onReportIssue}
      />
    );

    const reportBtn = screen.getByRole('button', { name: /reportar falla o duda en este video/i });
    expect(reportBtn).toBeInTheDocument();
    fireEvent.click(reportBtn);
    expect(onReportIssue).toHaveBeenCalledWith(technique);
  });
});
