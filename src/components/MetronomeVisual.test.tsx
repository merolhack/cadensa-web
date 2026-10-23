import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetronomeVisual } from './MetronomeVisual';

describe('MetronomeVisual Component - Unit Tests', () => {
  it('debe renderizar el BPM cuando el metrónomo está detenido', () => {
    render(
      <MetronomeVisual
        isPlaying={false}
        bpm={80}
        currentBeat={0}
        isPulsing={false}
      />
    );

    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
  });

  it('debe mostrar el número de compás activo cuando está en reproducción', () => {
    render(
      <MetronomeVisual
        isPlaying={true}
        bpm={100}
        currentBeat={2} // Beat 3 (2 % 4 + 1 = 3)
        isPulsing={true}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Compás')).toBeInTheDocument();
  });
});
