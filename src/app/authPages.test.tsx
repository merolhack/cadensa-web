import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import LoginPage from './login/page';
import RegisterPage from './register/page';
import { supabase } from '@/lib/supabaseClient';

// Mock de useRouter de next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Authentication Pages (Login & Register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('LoginPage', () => {
    it('debe renderizar el título, campos de entrada y botón de Google', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Entrar a Cadensa/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continuar con Google/i })).toBeInTheDocument();
    });

    it('debe iniciar sesión con contraseña e invocar router.push', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: {
          user: { id: 'usr-123', email: 'paciente@cadensa.com' } as unknown as User,
          session: {} as unknown as Session,
        },
        error: null,
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'paciente@cadensa.com' },
      });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Entrar a Cadensa/i }));

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'paciente@cadensa.com',
          password: 'password123',
        });
        expect(localStorage.getItem('cadensa_user_email')).toBe('paciente@cadensa.com');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('debe mostrar mensaje de error si falla la autenticación', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Credenciales inválidas' } as unknown as AuthError,
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'error@cadensa.com' },
      });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), {
        target: { value: 'wrongpass' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Entrar a Cadensa/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
      });
    });

    it('debe permitir alternar a modo Magic Link y enviar OTP', async () => {
      vi.spyOn(supabase.auth, 'signInWithOtp').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: null,
      });

      render(<LoginPage />);

      fireEvent.click(screen.getByText(/Acceso con Magic Link/i));
      expect(screen.queryByLabelText(/Contraseña/i)).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'magic@cadensa.com' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Enviar Enlace Mágico/i }));

      await waitFor(() => {
        expect(supabase.auth.signInWithOtp).toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent(/Enlace mágico enviado/i);
      });
    });
  });

  describe('RegisterPage', () => {
    it('debe renderizar el formulario de registro con campos requeridos', () => {
      render(<RegisterPage />);

      expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Crear mi Cuenta/i })).toBeInTheDocument();
    });

    it('debe validar que las contraseñas coincidan antes de enviar', async () => {
      render(<RegisterPage />);

      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'nuevo@cadensa.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
        target: { value: 'pass123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
        target: { value: 'pass999' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Crear mi Cuenta/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
    });

    it('debe registrar exitosamente y guardar usuario en local', async () => {
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: {
          user: { id: 'usr-new-456', email: 'registro@cadensa.com' } as unknown as User,
          session: {} as unknown as Session,
        },
        error: null,
      });

      render(<RegisterPage />);

      fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
        target: { value: 'registro@cadensa.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
        target: { value: 'pass123456' },
      });
      fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), {
        target: { value: 'pass123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Crear mi Cuenta/i }));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'registro@cadensa.com',
          password: 'pass123456',
        });
        expect(localStorage.getItem('cadensa_user_email')).toBe('registro@cadensa.com');
        expect(screen.getByRole('status')).toHaveTextContent(/Cuenta creada exitosamente/i);
      });
    });
  });
});

