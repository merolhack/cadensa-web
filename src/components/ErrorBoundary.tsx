'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackRuntimeError } from '@/lib/telemetry';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registro de error silencioso y respetuoso con la privacidad
    trackRuntimeError(
      error.name || 'ApplicationError',
      error.message || 'Error no capturado en componente',
      errorInfo.componentStack || undefined
    );
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-3xl">
              <span>🩺</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                Pausa Técnica Inesperada
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Ocurrió una interrupción temporal en la estación clínica de fluidez. Tus datos de sesión y configuración están a salvo.
              </p>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-left space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Diagnóstico del Sistema:
              </span>
              <p className="text-xs text-emerald-400 font-mono truncate">
                {this.state.error?.message || 'Error en ejecución de interfaz reactiva'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                aria-label="Reiniciar sesión y recargar estación de práctica"
              >
                🔄 Reiniciar Práctica
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
                aria-label="Volver a la página principal de Cadensa"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

