import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from './AuthModal';

describe('AuthModal Component - Unit Tests', () => {
  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el formulario cuando isOpen es true', () => {
    render(
      <AuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tu@correo.com/i)).toBeInTheDocument();
  });

  it('debe permitir continuar en modo invitado disparando onSuccess', () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <AuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    const guestButton = screen.getByText(/modo invitado/i);
    fireEvent.click(guestButton);

    expect(onSuccess).toHaveBeenCalledWith('invitado@cadensa.local');
    expect(onClose).toHaveBeenCalled();
  });
});
