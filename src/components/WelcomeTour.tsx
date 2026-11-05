'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface WelcomeTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export function WelcomeTour({ forceOpen = false, onClose, onComplete }: WelcomeTourProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [step, setStep] = useState(1);

  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
  });

  const shouldShow = (() => {
    if (isDismissed) return false;
    if (forceOpen) return true;
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('cadensa_ftue_completed');
  })();

  const handleDismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cadensa_ftue_completed', 'true');
    }
    setIsDismissed(true);
    onClose?.();
  }, [onClose]);

  const handleFinish = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cadensa_ftue_completed', 'true');
    }
    setIsDismissed(true);
    onComplete?.();
  }, [onComplete]);

  // Soporte de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shouldShow) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldShow, handleDismiss]);

  if (!shouldShow) return null;

  const totalSteps = 4;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-tour-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-emerald-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-6 text-zinc-100 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera del Tour */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Bienvenida a Cadensa • Paso {step} de {totalSteps}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Saltar tour de bienvenida"
            className="text-zinc-400 hover:text-zinc-100 text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Saltar Tour ✕
          </button>
        </div>

        {/* Indicador de Progreso */}
        <div className="flex gap-1.5 w-full">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Contenido Dinámico por Paso */}
        <div className="space-y-4 py-2 min-h-[260px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner">
                🎙️
              </div>
              <h2 id="welcome-tour-title" className="text-xl sm:text-2xl font-black text-zinc-50">
                Encuentra el Ritmo de tu Voz
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Cadensa es un <strong>gimnasio digital de fluidez</strong> diseñado para ayudarte a hablar con calma y confianza. Mediante pulsos rítmicos suaves (técnica fonoaudiológica de <em>Habla Rítmica Silábica</em>), tu mente y tus cuerdas vocales coordinan cada sílaba, reduciendo los bloqueos y la tensión al hablar.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-400 font-medium">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-emerald-400 font-bold block mb-0.5">⏱️ Isocronía Rítmica</span>
                  Un marcapasos auditivo-motor que estabiliza la dicción.
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-cyan-400 font-bold block mb-0.5">🌱 Hábito Diario</span>
                  Prácticas breves de 3 a 5 minutos al día sin sobreesfuerzo.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-inner">
                🤖
              </div>
              <h2 id="welcome-tour-title" className="text-xl sm:text-2xl font-black text-zinc-50">
                Tu Metrónomo y el Avatar IA 1080p
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                El metrónomo marca el compás de cada palabra para que hables a un tempo constante sin angustia. Y si tienes dudas sobre cómo respirar, colocar los labios o iniciar una vocal suavemente, pulsa el botón <strong>🤖 Avatar IA 1080p</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span>🎬 Demostraciones Clínicas de Alta Fidelidad</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  7 videos de modelos anatómicos y biofeedback en tiempo real para dominar Respiración 4-4-4-4, Inicios Suaves, Contactos Ligeros y Salida de Bloqueos (Pull-Out).
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner">
                📱
              </div>
              <h2 id="welcome-tour-title" className="text-xl sm:text-2xl font-black text-zinc-50">
                Instala Cadensa en tu Celular (PWA)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Cadensa funciona como una aplicación nativa y es <strong>100% funcional sin conexión a internet (offline-first)</strong>. Todos los videos, metrónomos y ejercicios están precargados.
              </p>

              {isIOS ? (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <span>🍎</span>
                    <span>Instalación en iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 leading-relaxed">
                    <li>Pulsa el botón <strong>Compartir</strong> (icono del cuadrado con flecha hacia arriba ⎋).</li>
                    <li>Desplázate hacia abajo y selecciona <strong>&ldquo;Añadir a pantalla de inicio&rdquo; (➕)</strong>.</li>
                    <li>Ábrela desde tu pantalla principal para pantalla completa sin barras.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <span>🤖</span>
                    <span>Instalación en Android o Computadora (Chrome / Edge):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 leading-relaxed">
                    <li>Pulsa el menú de opciones de tu navegador (tres puntos ⋮ arriba a la derecha).</li>
                    <li>Selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o pulsa <strong>&ldquo;Instalar App&rdquo;</strong> en la barra superior.</li>
                    <li>Entrena donde quieras sin gastar tus datos móviles.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
                🛡️
              </div>
              <h2 id="welcome-tour-title" className="text-xl sm:text-2xl font-black text-zinc-50">
                Tus Datos son 100% Tuyos
              </h2>
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 leading-relaxed font-medium">
                &ldquo;Tus datos de voz y tus resultados de práctica nunca salen de tu dispositivo. No usamos la nube para almacenar tu voz. El reporte CSV es 100% local.&rdquo;
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Practica en un espacio seguro y sin juicios. Al terminar tus rutinas, puedes descargar tu informe fonoaudiológico con un solo clic para compartirlo con tu terapeuta del lenguaje.
              </p>
            </div>
          )}
        </div>

        {/* Botonera de Navegación del Tour */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
            >
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-zinc-950 font-extrabold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                🚀 ¡Comenzar mi práctica!
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
