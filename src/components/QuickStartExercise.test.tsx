import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuickStartExercise } from './QuickStartExercise';

describe('QuickStartExercise Component - Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const advanceToActivePhase = () => {
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  };

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <QuickStartExercise
        isOpen={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onGoToFullPractice={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el modal en fase de preparación cuando isOpen es true', () => {
    const onCloseMock = vi.fn();
    render(
      <QuickStartExercise
        isOpen={true}
        onClose={onCloseMock}
        onComplete={vi.fn()}
        onGoToFullPractice={vi.fn()}
      />
    );

    expect(screen.getByText(/Preparación Fonoaudiológica/i)).toBeInTheDocument();
    expect(screen.getByText(/Inhala profundamente/i)).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Cerrar Práctica Rápida/i);
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe transicionar a fase activa de entrenamiento después de que termine la cuenta regresiva de 3s', () => {
    render(
      <QuickStartExercise
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onGoToFullPractice={vi.fn()}
      />
    );

    advanceToActivePhase();

    expect(screen.getByText(/Terminar sesión/i)).toBeInTheDocument();
    expect(screen.getByText(/Pronuncia una sílaba exacta con cada pulso/i)).toBeInTheDocument();
  });

  it('debe permitir terminar la sesión anticipadamente, llamar onComplete y mostrar resumen de XP', () => {
    const onCompleteMock = vi.fn();
    render(
      <QuickStartExercise
        isOpen={true}
        onClose={vi.fn()}
        onComplete={onCompleteMock}
        onGoToFullPractice={vi.fn()}
      />
    );

    advanceToActivePhase();

    const finishBtn = screen.getByText(/Terminar sesión/i);
    fireEvent.click(finishBtn);

    expect(onCompleteMock).toHaveBeenCalledWith(25, expect.any(Number));
    expect(screen.getByText(/¡Excelente sesión!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+25 XP Ganados/i)).toBeInTheDocument();
  });

  it('debe permitir navegar a la práctica completa desde la fase finalizada', () => {
    const onGoToFullPracticeMock = vi.fn();
    render(
      <QuickStartExercise
        isOpen={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onGoToFullPractice={onGoToFullPracticeMock}
      />
    );

    advanceToActivePhase();

    const finishBtn = screen.getByText(/Terminar sesión/i);
    fireEvent.click(finishBtn);

    const fullPracticeBtn = screen.getByText(/Seguir a Práctica Completa/i);
    fireEvent.click(fullPracticeBtn);

    expect(onGoToFullPracticeMock).toHaveBeenCalledTimes(1);
  });
});
