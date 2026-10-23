import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyllableReader } from './SyllableReader';

describe('SyllableReader Component - Unit Tests', () => {
  it('debe descomponer una oración y mostrar cada sílaba', () => {
    render(
      <SyllableReader
        sentence="Cadensa es ritmo"
        activeSyllableIndex={0}
        isPlaying={false}
      />
    );

    expect(screen.getByText('ca')).toBeInTheDocument();
    expect(screen.getByText('den')).toBeInTheDocument();
    expect(screen.getByText('sa')).toBeInTheDocument();
    expect(screen.getByText('es')).toBeInTheDocument();
    expect(screen.getByText('rit')).toBeInTheDocument();
    expect(screen.getByText('mo')).toBeInTheDocument();
  });

  it('debe resaltar la sílaba activa cuando isPlaying es true', () => {
    render(
      <SyllableReader
        sentence="Cadensa es ritmo"
        activeSyllableIndex={1} // "den"
        isPlaying={true}
      />
    );

    const activeEl = screen.getByText('den');
    expect(activeEl.className).toContain('from-emerald-500');
  });
});
