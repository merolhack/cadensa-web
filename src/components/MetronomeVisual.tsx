'use client';

import React from 'react';

interface MetronomeVisualProps {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  isPulsing: boolean;
  timeSignature?: 2 | 3 | 4;
}

export const MetronomeVisual: React.FC<MetronomeVisualProps> = ({
  isPlaying,
  bpm,
  currentBeat,
  isPulsing,
  timeSignature = 4,
}) => {
  const beatInBar = (currentBeat % timeSignature) + 1;
  const beatsArray = Array.from({ length: timeSignature }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-3 space-y-2.5">
      {/* Orbe pulsante multisensorial optimizado y compacto */}
      <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40">
        {/* Anillo de brillo exterior que se expande con el pulso */}
        <div
          className={`absolute rounded-full transition-all duration-150 pointer-events-none ${
            isPlaying && isPulsing
              ? 'w-36 h-36 sm:w-40 sm:h-40 bg-emerald-500/25 blur-lg scale-110 opacity-100'
              : 'w-28 h-28 sm:w-32 sm:h-32 bg-cyan-500/5 blur-sm scale-95 opacity-30'
          }`}
        />

        {/* Anillo concéntrico */}
        <div
          className={`absolute rounded-full border transition-all duration-200 ${
            isPlaying && isPulsing
              ? 'w-30 h-30 sm:w-34 sm:h-34 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105'
              : 'w-26 h-26 sm:w-30 sm:h-30 border-zinc-800/90'
          }`}
        />

        {/* Núcleo del orbe */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center rounded-full transition-all duration-150 ${
            isPlaying && isPulsing
              ? 'w-22 h-22 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-500 to-cyan-400 shadow-[0_0_25px_rgba(16,185,129,0.8)] scale-105 text-zinc-950 font-black'
              : isPlaying
              ? 'w-20 h-20 sm:w-22 sm:h-22 bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold'
              : 'w-18 h-18 sm:w-20 sm:h-20 bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-medium'
          }`}
        >
          <span className="text-2xl sm:text-3xl tracking-tight">
            {isPlaying ? beatInBar : bpm}
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-80">
            {isPlaying ? 'Compás' : 'BPM'}
          </span>
        </div>
      </div>

      {/* Indicadores de compás dinámico */}
      <div className="flex items-center space-x-2">
        {beatsArray.map((beat) => (
          <div
            key={beat}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
              isPlaying && beatInBar === beat
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] scale-125'
                : 'bg-zinc-800 border border-zinc-700/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
