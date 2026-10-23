'use client';

import React from 'react';

interface MetronomeVisualProps {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  isPulsing: boolean;
}

export const MetronomeVisual: React.FC<MetronomeVisualProps> = ({
  isPlaying,
  bpm,
  currentBeat,
  isPulsing,
}) => {
  const beatInBar = (currentBeat % 4) + 1;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      {/* Orbe pulsante multisensorial */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Anillo de brillo exterior que se expande con el pulso */}
        <div
          className={`absolute rounded-full transition-all duration-150 pointer-events-none ${
            isPlaying && isPulsing
              ? 'w-48 h-48 bg-emerald-500/20 blur-xl scale-110 opacity-100'
              : 'w-40 h-40 bg-cyan-500/5 blur-md scale-95 opacity-40'
          }`}
        />

        {/* Anillo concéntrico */}
        <div
          className={`absolute rounded-full border transition-all duration-200 ${
            isPlaying && isPulsing
              ? 'w-40 h-40 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] scale-105'
              : 'w-36 h-36 border-zinc-800'
          }`}
        />

        {/* Núcleo del orbe */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center rounded-full transition-all duration-150 ${
            isPlaying && isPulsing
              ? 'w-28 h-28 bg-gradient-to-tr from-emerald-500 to-cyan-400 shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-105 text-zinc-950 font-black'
              : isPlaying
              ? 'w-26 h-26 bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold'
              : 'w-24 h-24 bg-zinc-900/80 border border-zinc-800 text-zinc-500 font-medium'
          }`}
        >
          <span className="text-3xl tracking-tight">
            {isPlaying ? beatInBar : bpm}
          </span>
          <span className="text-[10px] uppercase tracking-widest opacity-80">
            {isPlaying ? 'Compás' : 'BPM'}
          </span>
        </div>
      </div>

      {/* Indicadores de compás (4 tiempos) */}
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              isPlaying && beatInBar === beat
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-125'
                : 'bg-zinc-800 border border-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
