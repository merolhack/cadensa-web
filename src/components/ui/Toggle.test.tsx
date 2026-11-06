import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';

describe('Toggle Component', () => {
  it('renderiza correctamente el switch y su etiqueta', () => {
    const handleChange = vi.fn();
    render(
      <Toggle
        checked={false}
        onChange={handleChange}
        label="Sonido del metrónomo"
        description="Emite un clic en cada pulso"
        icon="🔊"
      />
    );

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('Sonido del metrónomo')).toBeInTheDocument();
    expect(screen.getByText('Emite un clic en cada pulso')).toBeInTheDocument();
    expect(screen.getByText('🔊')).toBeInTheDocument();
  });

  it('permite alternar el estado mediante clic en el switch', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={false} onChange={handleChange} label="Vibración" />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('permite alternar el estado mediante clic en la etiqueta', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={true} onChange={handleChange} label="Reto Fading" />);

    fireEvent.click(screen.getByText('Reto Fading'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('permite alternar mediante teclado (Space y Enter)', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={false} onChange={handleChange} label="Teclado" />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.keyDown(switchBtn, { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(switchBtn, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('no dispara cambios si está deshabilitado', () => {
    const handleChange = vi.fn();
    render(<Toggle checked={false} onChange={handleChange} label="Deshabilitado" disabled={true} />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toBeDisabled();
    fireEvent.click(switchBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });
});

