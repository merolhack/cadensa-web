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
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        setInfoMessage('¡Enlace de acceso enviado! Revisa tu correo o continúa en modo local sin interrupciones.');
        onSuccess(email);
        setTimeout(() => onClose(), 1500);
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user?.email) {
          onSuccess(data.user.email);
          onClose();
        } else {
          setInfoMessage('Registro iniciado. Puedes comenzar a practicar de inmediato.');
          onSuccess(email);
          setTimeout(() => onClose(), 1000);
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

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error al conectar con ${provider}`;
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    onSuccess('invitado@cadensa.local');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">
            {useMagicLink ? 'Acceso sin Contraseña' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Sincroniza tus rachas, minutos entrenados y precisión rítmica en la nube de Supabase.
        </p>

        {/* Notificaciones */}
        {errorMessage && (
          <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {infoMessage}
          </div>
        )}

        {/* Botones de OAuth Social */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="flex items-center gap-2 my-2 text-zinc-600 text-xs">
          <div className="flex-1 h-px bg-zinc-800" />
          <span>o con correo electrónico</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Formulario Tradicional o Magic Link */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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

          {!useMagicLink && (
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : useMagicLink
              ? 'Enviar Enlace Mágico'
              : isSignUp
              ? 'Registrarme'
              : 'Entrar a Cadensa'}
          </button>
        </form>

        {/* Mensaje de Confirmación Suave (Soft Confirmation) */}
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-tight">
          🛡️ <strong>Acceso Inmediato:</strong> No bloqueamos tu entrenamiento. Puedes comenzar a practicar al instante sin esperar la validación de tu correo.
        </div>

        {/* Opciones de Alternancia */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setUseMagicLink(false);
              }}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>

            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {useMagicLink ? 'Usar Contraseña' : 'Acceso con Magic Link'}
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
            >
              Continuar en Modo Invitado (Sin cuenta)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
