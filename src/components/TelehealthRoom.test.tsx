import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelehealthRoom } from './TelehealthRoom';

describe('TelehealthRoom Component', () => {
  it('debe renderizar el título de telesalud y el selector de roles', () => {
    render(<TelehealthRoom />);

    expect(screen.getByText(/Sala Clínica de Telepráctica Sincronizada/i)).toBeInTheDocument();
    expect(screen.getByText(/👨‍⚕️ Fonoaudiólogo/i)).toBeInTheDocument();
    expect(screen.getByText(/🗣️ Paciente/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conectar P2P/i })).toBeInTheDocument();
  });

  it('debe conectar la sesión P2P y permitir emitir pulsos en rol de fonoaudiólogo', () => {
    render(<TelehealthRoom />);

    const connectBtn = screen.getByRole('button', { name: /Conectar P2P/i });
    fireEvent.click(connectBtn);

    expect(screen.getByText(/Desconectar/i)).toBeInTheDocument();
    expect(screen.getByText(/Panel de Control del Fonoaudiólogo/i)).toBeInTheDocument();

    const triggerBtn = screen.getByRole('button', { name: /Emitir Pulso de Ajuste/i });
    fireEvent.click(triggerBtn);

    expect(screen.getByText(/Pulso transmitido a paciente/i)).toBeInTheDocument();
  });
});
