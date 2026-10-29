import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveAudioVUMeter } from './LiveAudioVUMeter';

describe('LiveAudioVUMeter Component', () => {
  it('no debe renderizar nada si isActive es false', () => {
    const { container } = render(<LiveAudioVUMeter isActive={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el indicador de voz en vivo y Zero Trust cuando isActive es true', () => {
    render(<LiveAudioVUMeter isActive={true} />);
    expect(screen.getByTestId('live-audio-vu-meter')).toBeInTheDocument();
    expect(screen.getByText(/Voz en vivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Trust/i)).toBeInTheDocument();
  });
});

