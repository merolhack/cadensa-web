import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluencyPath } from './FluencyPath';

describe('FluencyPath Component - Unit Tests', () => {
  it('debe renderizar el encabezado de la Ruta de Fluidez y los niveles iniciales', () => {
    render(<FluencyPath onStartLesson={vi.fn()} userXp={100} />);

    expect(screen.getByText(/Ruta de Fluidez Verbal/i)).toBeInTheDocument();
    expect(screen.getByText(/El Primer Compás/i)).toBeInTheDocument();
    expect(screen.getByText(/Cofre XP/i)).toBeInTheDocument();
  });

  it('debe abrir el modal de lección al hacer clic en un nodo desbloqueado y permitir iniciar la práctica', () => {
    const onStartMock = vi.fn();
    render(<FluencyPath onStartLesson={onStartMock} userXp={0} />);

    // El Nivel 1 está siempre desbloqueado
    const level1Btn = screen.getByLabelText(/Nivel 1: El Primer Compás/i);
    fireEvent.click(level1Btn);

    expect(screen.getByText(/Lección Guiada • 2 Minutos/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Empezar Lección!/i)).toBeInTheDocument();

    const startBtn = screen.getByText(/¡Empezar Lección!/i);
    fireEvent.click(startBtn);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onStartMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, bpm: 75 }),
      expect.objectContaining({ id: 'sts' })
    );
  });

  it('los niveles superiores al nivel desbloqueado deben estar deshabilitados', () => {
    render(<FluencyPath onStartLesson={vi.fn()} userXp={0} />);

    // El Nivel 7 debe estar bloqueado para un usuario nuevo
    const level7Btn = screen.getByLabelText(/Nivel 7: Maestría y Seguridad - Bloqueado/i);
    expect(level7Btn).toBeDisabled();
  });
});
