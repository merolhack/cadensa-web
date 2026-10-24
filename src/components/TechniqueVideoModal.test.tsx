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
    expect(screen.getByText(/video demostrativo/i)).toBeInTheDocument();
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
});
