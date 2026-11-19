import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyChallengeModal } from './DailyChallengeModal';

describe('DailyChallengeModal Component - Unit Tests', () => {
  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <DailyChallengeModal
        isOpen={false}
        onClose={vi.fn()}
        streakDays={3}
        totalMinutes={12}
        xpPoints={200}
        onStartDailyChallenge={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar las métricas diarias, nivel y botón de inicio del reto cuando isOpen es true', () => {
    const onStartMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <DailyChallengeModal
        isOpen={true}
        onClose={onCloseMock}
        streakDays={4}
        totalMinutes={20}
        xpPoints={250}
        onStartDailyChallenge={onStartMock}
      />
    );

    expect(screen.getByText(/Reto Diario de Fluidez/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu Progreso de Hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/4 días/i)).toBeInTheDocument(); // Racha
    expect(screen.getByText(/250 XP/i)).toBeInTheDocument(); // XP
    expect(screen.getByText(/Aceptar Reto y Empezar \(60s\)/i)).toBeInTheDocument();

    const startBtn = screen.getByText(/Aceptar Reto y Empezar \(60s\)/i);
    fireEvent.click(startBtn);
    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe permitir cerrar el modal mediante el botón de cierre superior', () => {
    const onCloseMock = vi.fn();
    render(
      <DailyChallengeModal
        isOpen={true}
        onClose={onCloseMock}
        streakDays={2}
        totalMinutes={10}
        xpPoints={100}
        onStartDailyChallenge={vi.fn()}
      />
    );

    const closeBtn = screen.getByLabelText(/Cerrar Reto Diario/i);
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar la lista de insignias de gamificación', () => {
    render(
      <DailyChallengeModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={7}
        totalMinutes={60}
        xpPoints={500}
        onStartDailyChallenge={vi.fn()}
      />
    );

    expect(screen.getByText(/Insignias y Logros Clínicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Primer Pulso/i)).toBeInTheDocument();
    expect(screen.getByText(/Constancia de Acero/i)).toBeInTheDocument();
  });
});
