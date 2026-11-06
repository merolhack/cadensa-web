'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user?.email && typeof window !== 'undefined') {
        localStorage.setItem('cadensa_user_email', data.user.email);
        localStorage.setItem('cadensa_user_id', data.user.id);
      }

      setInfoMessage('¡Cuenta creada exitosamente! Redirigiendo a la estación de práctica...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Error al registrar usuario';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 transition-opacity"
          >
            Cadensa
          </Link>
          <h1 className="text-xl font-bold text-zinc-100">Crear Cuenta</h1>
          <p className="text-xs text-zinc-400">
            Regístrate para respaldar tus frases personalizadas y acceder a tu historial terapéutico en cualquier dispositivo.
          </p>
        </div>

        {/* Notificaciones */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
          >
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div
            role="status"
            className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
          >
            {infoMessage}
          </div>
        )}

        {/* Botón de Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
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
          Registrarme con Google
        </button>

        <div className="flex items-center gap-2 my-2 text-zinc-600 text-xs">
          <div className="flex-1 h-px bg-zinc-800" />
          <span>o con correo y contraseña</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="register-email" className="text-xs font-medium text-zinc-300">
              Correo Electrónico
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="register-password" className="text-xs font-medium text-zinc-300">
              Contraseña (mínimo 6 caracteres)
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="register-confirm-password" className="text-xs font-medium text-zinc-300">
              Confirmar Contraseña
            </label>
            <input
              id="register-confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}
          </button>
        </form>

        {/* Opciones adicionales */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400 text-center">
          <div>
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
          <div>
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 underline">
              Continuar como Invitado (Modo local sin cuenta)
            </Link>
          </div>
        </div>

        {/* Descargo de Privacidad */}
        <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-500 text-center leading-relaxed">
          🛡️ <strong>Garantía de Confidencialidad:</strong> Cadensa opera con arquitectura Zero Trust. Tus datos no se comparten con terceros.
        </div>
      </div>
    </div>
  );
}
