import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneticRecognitionValidator } from './PhoneticRecognitionValidator';

describe('PhoneticRecognitionValidator Component', () => {
  it('debe renderizar la frase objetivo y el campo de entrada', () => {
    render(<PhoneticRecognitionValidator targetPhrase="Encuentra el ritmo de tu voz" />);

    expect(screen.getByText(/Validador Fonético On-Device/i)).toBeInTheDocument();
    expect(screen.getByText('"Encuentra el ritmo de tu voz"')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escribe o simula lo que pronunciaste/i)).toBeInTheDocument();
  });

  it('debe evaluar la concordancia fonética y disparar el callback al hacer clic en Evaluar', () => {
    const onValidation = vi.fn();
    render(
      <PhoneticRecognitionValidator
        targetPhrase="Cadensa es ritmo"
        onValidationComplete={onValidation}
      />
    );

    const input = screen.getByPlaceholderText(/Escribe o simula lo que pronunciaste/i);
    fireEvent.change(input, { target: { value: 'Cadensa es ritmo' } });

    const evalBtn = screen.getByRole('button', { name: /evaluar/i });
    fireEvent.click(evalBtn);

    expect(screen.getByText(/100% Coincidencia/i)).toBeInTheDocument();
    expect(onValidation).toHaveBeenCalledTimes(1);
    expect(onValidation.mock.calls[0][0].isAccurate).toBe(true);
  });
});

