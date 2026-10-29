'use client';

import React, { useState, useEffect } from 'react';
import { trackClinicalEvent } from '@/lib/analytics';

interface QuickDailyRoutineProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFullPractice: () => void;
}

const ROUTINE_STEPS = [
  {
    title: 'Paso 1: Respiración Diafragmática (4-4-4-4)',
    duration: 60,
    badge: '1 Minuto • Relajación y Calma',
    description: 'Inhala en 4s inflando el abdomen, sostén 4s, exhala en 4s y pausa 4s para desactivar la tensión laríngea.',
    actionText: 'Comenzar Respiración',
    icon: '🌬️',
  },
  {
    title: 'Paso 2: Inicio Vocal Suave (Easy Onset)',
    duration: 120,
    badge: '2 Minutos • Ataque Glótico',
    description: 'Practica iniciar palabras con un suspiro tibio en rampa progresiva de volumen (10% a 100%) sin forzar las cuerdas vocales.',
    actionText: 'Comenzar Easy Onset',
    icon: '🌊',
  },
  {
    title: 'Paso 3: Habla Rítmica Silábica (STS)',
    duration: 120,
    badge: '2 Minutos • Isocronía',
    description: 'Emite frases divididas en sílabas al pulso del metrónomo (80 BPM) para fijar el patrón motor fluido.',
    actionText: 'Comenzar Ritmo STS',
    icon: '⏱️',
  },
];

export const QuickDailyRoutine: React.FC<QuickDailyRoutineProps> = ({
  isOpen,
  onClose,
  onStartFullPractice,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentStep = ROUTINE_STEPS[stepIndex] || ROUTINE_STEPS[0];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setStepIndex((curStep) => {
              if (curStep < ROUTINE_STEPS.length - 1) {
                return curStep + 1;
              }
              trackClinicalEvent('routine_5min_complete');
              return curStep;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const handleToggleTimer = () => {
    if (!isTimerRunning) {
      trackClinicalEvent('routine_5min_start', { routine_step: currentStep.title });
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleNextStep = () => {
    setIsTimerRunning(false);
    if (stepIndex < ROUTINE_STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      setTimerSeconds(ROUTINE_STEPS[nextIdx].duration);
    } else {
      onStartFullPractice();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentStep.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Rutina Guiada de 5 Minutos</h2>
              <span className="text-[10px] text-emerald-400 font-mono">Paso {stepIndex + 1} de 3</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl bg-zinc-800/60 cursor-pointer"
            aria-label="Cerrar rutina"
          >
            ✕
          </button>
        </div>

        {/* Indicador de Tiempo */}
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {currentStep.badge}
          </span>
          <div className="text-5xl font-black text-emerald-400 font-mono">
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <h3 className="text-base font-bold text-zinc-100 pt-1">{currentStep.title}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            {currentStep.description}
          </p>
        </div>

        {/* Controles de la Rutina */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleToggleTimer}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              isTimerRunning
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md'
            }`}
          >
            {isTimerRunning ? 'Pausar Temporizador' : currentStep.actionText}
          </button>

          <button
            onClick={handleNextStep}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
          >
            {stepIndex < ROUTINE_STEPS.length - 1 ? 'Siguiente Paso →' : 'Completar Rutina'}
          </button>
        </div>
      </div>
    </div>
  );
};
