'use client';

import React, { useState, useEffect } from 'react';

interface BreathingPacerProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathPhase = 'inhalar' | 'sostener' | 'exhalar' | 'pausa';

export const BreathingPacer: React.FC<BreathingPacerProps> = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState<BreathPhase>('inhalar');
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Cambiar fase cíclica 4-4-4-4
        setPhase((currentPhase) => {
          switch (currentPhase) {
            case 'inhalar':
              return 'sostener';
            case 'sostener':
              return 'exhalar';
            case 'exhalar':
              return 'pausa';
            case 'pausa':
              return 'inhalar';
          }
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const phaseConfig = {
    inhalar: { label: 'Inhala profundamente', color: 'from-cyan-400 to-blue-500', scale: 'scale-125' },
    sostener: { label: 'Mantén el aire con calma', color: 'from-blue-500 to-emerald-400', scale: 'scale-125' },
    exhalar: { label: 'Exhala lento y relajado', color: 'from-emerald-400 to-teal-500', scale: 'scale-90' },
    pausa: { label: 'Pausa en serenidad', color: 'from-zinc-500 to-zinc-400', scale: 'scale-90' },
  }[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>🌬️</span>
            <span>Respiración Diafragmática (4-4-4-4)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
            aria-label="Cerrar respiración"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Calma el diafragma y la tensión de las cuerdas vocales antes de iniciar tu práctica rítmica.
        </p>

        {/* Orbe de respiración expansivo */}
        <div className="relative flex items-center justify-center w-48 h-48">
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-tr ${phaseConfig.color} shadow-[0_0_40px_rgba(52,211,153,0.3)] transition-all duration-1000 flex flex-col items-center justify-center text-zinc-950 font-black ${phaseConfig.scale}`}
          >
            <span className="text-4xl">{secondsLeft}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
              segundos
            </span>
          </div>
        </div>

        <div className="text-sm font-bold text-emerald-400 tracking-wide">
          {phaseConfig.label}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
        >
          Listo para Practicar
        </button>
      </div>
    </div>
  );
};
