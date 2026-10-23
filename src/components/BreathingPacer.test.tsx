import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreathingPacer } from './BreathingPacer';

describe('BreathingPacer Component - Unit Tests', () => {
  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(<BreathingPacer isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título de respiración diafragmática cuando isOpen es true', () => {
    render(<BreathingPacer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /respiración diafragmática/i })).toBeInTheDocument();
    expect(screen.getByText(/inhala profundamente/i)).toBeInTheDocument();
  });
});
