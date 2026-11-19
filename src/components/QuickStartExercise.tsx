'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface QuickStartExerciseProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (earnedXp: number, durationSeconds?: number) => void;
  onCompleteSession?: (earnedXp: number, durationSeconds: number) => void;
  onGoToFullPractice?: () => void;
}

const QUICK_PHRASE_SYLLABLES = [
  'Hoy',
  'mi',
  'voz',
  'flu',
  'ye',
  'en',
  'cal',
  'ma',
  'y',
  'con',
  'rit',
  'mo',
];

export const QuickStartExercise: React.FC<QuickStartExerciseProps> = ({
  isOpen,
  onClose,
  onComplete,
  onCompleteSession,
  onGoToFullPractice,
}) => {
  const [phase, setPhase] = useState<'prep' | 'active' | 'finished'>('prep');
  const [prepSeconds, setPrepSeconds] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setPhase('prep');
      setPrepSeconds(3);
      setRemainingSeconds(60);
      setActiveSyllableIndex(0);
      setIsPaused(false);
    }
  }

  const audioCtxRef = useRef<AudioContext | null>(null);

  const notifyComplete = useCallback((xp: number, duration: number) => {
    if (onComplete) onComplete(xp, duration);
    if (onCompleteSession) onCompleteSession(xp, duration);
  }, [onComplete, onCompleteSession]);

  // Fase 1: Cuenta regresiva de preparación (3 segundos)
  useEffect(() => {
    if (!isOpen || phase !== 'prep') return;

    if (prepSeconds > 0) {
      const timer = setTimeout(() => {
        setPrepSeconds((prev) => {
          if (prev <= 1) {
            setPhase('active');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, phase, prepSeconds]);

  // Fase 2: Temporizador activo de 60 segundos
  useEffect(() => {
    if (!isOpen || phase !== 'active' || isPaused) return;

    if (remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setPhase('finished');
            notifyComplete(25, 60);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, phase, remainingSeconds, isPaused, notifyComplete]);

  // Fase 2: Beat rítmico isocrónico (~85 BPM = ~705 ms)
  useEffect(() => {
    if (!isOpen || phase !== 'active' || isPaused) return;

    const intervalMs = Math.round((60 / 85) * 1000); // 705 ms

    const beatInterval = setInterval(() => {
      // Disparar pulso visual
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 180);

      // Avanzar sílaba cíclicamente
      setActiveSyllableIndex((prev) => (prev + 1) % QUICK_PHRASE_SYLLABLES.length);

      // Sonido de clic sutil si AudioContext está disponible
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.06);
        }
      } catch {
        // Audio ignorado silenciosamente si no hay permisos
      }

      // Vibración háptica en móviles si está soportada
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {
          // Ignorar
        }
      }
    }, intervalMs);

    return () => clearInterval(beatInterval);
  }, [isOpen, phase, isPaused]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((60 - remainingSeconds) / 60) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-start-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6 text-center">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm transition-colors cursor-pointer"
          aria-label="Cerrar Práctica Rápida"
        >
          ✕
        </button>

        {/* FASE 1: PREPARACIÓN */}
        {phase === 'prep' && (
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span>🌬️</span>
              <span>Preparación Fonoaudiológica</span>
            </div>

            <div className="space-y-2">
              <h2 id="quick-start-title" className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
                Inhala profundamente
              </h2>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                Relaja los hombros y prepárate para sincronizar cada sílaba con el pulso.
              </p>
            </div>

            {/* Contador de preparación */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 rounded-full bg-emerald-950/60 border-2 border-emerald-500/50 flex items-center justify-center animate-pulse">
                <span className="text-4xl font-black text-emerald-300">{prepSeconds}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-zinc-400 font-mono">
                  Cadencia STS objetivo: <strong className="text-emerald-400">85 BPM</strong>
                </span>
                <span className="text-[11px] text-emerald-400/90 font-semibold">
                  ⭐ +25 XP al completar los 60 segundos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FASE 2: ACTIVA (60 SEGUNDOS) */}
        {phase === 'active' && (
          <div className="space-y-6 py-2 animate-fade-in">
            {/* Cabecera y Tiempo Restante */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Práctica Rítmica STS • 85 BPM
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200 bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                <span>⏱️</span>
                <span>{remainingSeconds}s</span>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Orbe de Pulso Isocrónico */}
            <div className="flex items-center justify-center py-2">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isPulsing
                    ? 'scale-115 bg-emerald-400/30 border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                    : 'scale-100 bg-zinc-800/80 border border-zinc-700/60'
                }`}
              >
                <span className="text-2xl">{isPulsing ? '⚡' : '🎵'}</span>
              </div>
            </div>

            {/* Frase Rítmica Silábica */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 font-medium">Pronuncia una sílaba exacta con cada pulso:</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-sm mx-auto">
                {QUICK_PHRASE_SYLLABLES.map((syl, idx) => {
                  const isCurrent = idx === activeSyllableIndex;
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-150 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 scale-110 shadow-lg shadow-emerald-500/30'
                          : 'bg-zinc-800/70 text-zinc-300 border border-zinc-700/40'
                      }`}
                    >
                      {syl}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Controles de Pausa / Reanudar / Terminar */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}</span>
              </button>
              <button
                onClick={() => {
                  setPhase('finished');
                  notifyComplete(25, 60 - remainingSeconds);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>✓ Terminar sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* FASE 3: COMPLETADO */}
        {phase === 'finished' && (
          <div className="space-y-6 py-4 animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              🎉
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
                ¡Excelente sesión!
              </h2>
              <p className="text-zinc-300 text-sm max-w-sm mx-auto">
                Completaste tu micro-entrenamiento de 60 segundos de Habla Rítmica Silábica (STS).
              </p>
            </div>

            {/* Recompensa de Gamificación */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-800/80 border border-emerald-500/40 text-emerald-300 text-sm font-bold shadow-sm">
              <span>⭐ +25 XP Ganados</span>
              <span className="text-zinc-600">|</span>
              <span>🔥 Racha Activa</span>
            </div>

            {/* Acciones Finales */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onGoToFullPractice && (
                <button
                  onClick={() => {
                    onClose();
                    onGoToFullPractice();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm transition-all shadow-md cursor-pointer"
                >
                  Seguir a Práctica Completa ➡️
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                Listo por hoy ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
