import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { VirtualSLPAvatar } from './VirtualSLPAvatar';

// Mock requestAnimationFrame y cancelAnimationFrame para entorno jsdom
beforeAll(() => {
  window.requestAnimationFrame = vi.fn((cb) => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  });
  window.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
  });

  // Mock getContext de canvas
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    roundRect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    ellipse: vi.fn(),
  });
});

describe('VirtualSLPAvatar Component', () => {
  it('renderiza correctamente el componente y el canvas del avatar', () => {
    render(<VirtualSLPAvatar initialMode="breathing" />);
    expect(screen.getByTestId('virtual-slp-avatar')).toBeInTheDocument();
    expect(screen.getByText('Virtual SLP Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar Fonoaudiológico Fisiológico')).toBeInTheDocument();
  });

  it('permite alternar entre los modos clínicos fonoaudiológicos', () => {
    const handleModeChange = vi.fn();
    render(<VirtualSLPAvatar onModeChange={handleModeChange} />);

    // Cambiar a Inicios Suaves
    const easyOnsetBtn = screen.getByText(/Inicios Suaves/i);
    fireEvent.click(easyOnsetBtn);
    expect(handleModeChange).toHaveBeenCalledWith('easy_onset');

    // Cambiar a Pull-Out
    const pullOutBtn = screen.getByText(/Pull-Out/i);
    fireEvent.click(pullOutBtn);
    expect(handleModeChange).toHaveBeenCalledWith('pull_out');

    // Cambiar a Cancelación
    const cancelBtn = screen.getByText(/Cancelación/i);
    fireEvent.click(cancelBtn);
    expect(handleModeChange).toHaveBeenCalledWith('cancellation');

    // Cambiar a Espejo Vocal
    const mirrorBtn = screen.getByText(/Espejo Vocal Biofeedback/i);
    fireEvent.click(mirrorBtn);
    expect(handleModeChange).toHaveBeenCalledWith('mirroring');
  });

  it('permite pausar y reanudar la animación del avatar', () => {
    render(<VirtualSLPAvatar />);
    const pauseBtn = screen.getByLabelText('Pausar Avatar');
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    expect(screen.getByLabelText('Reanudar Avatar')).toBeInTheDocument();
  });

  it('muestra el ejercicio fonético balanceado y permite cambiar de grupo articulatorio', () => {
    render(<VirtualSLPAvatar dialectId="mx_central" />);
    expect(screen.getByLabelText('Grupo Fonético Diana')).toBeInTheDocument();
    expect(screen.getByText(/Densidad Fonética:/i)).toBeInTheDocument();

    // Cambiar a dentales
    const select = screen.getByLabelText('Grupo Fonético Diana');
    fireEvent.change(select, { target: { value: 'dental_stops' } });
    expect(select).toHaveValue('dental_stops');
  });
});
