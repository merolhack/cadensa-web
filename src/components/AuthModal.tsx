'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user?.email) {
          onSuccess(data.user.email);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user?.email) {
          onSuccess(data.user.email);
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar autenticación';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    onSuccess('invitado@cadensa.local');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Sincroniza tus rachas, minutos entrenados y precisión rítmica en la nube de Supabase.
        </p>

        {errorMessage && (
          <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarme' : 'Entrar a Cadensa'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>

          <button
            onClick={handleGuestContinue}
            className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
          >
            Modo Invitado
          </button>
        </div>
      </div>
    </div>
  );
};
