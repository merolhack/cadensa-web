'use client';

import React, { useState, useEffect } from 'react';

interface LiveAudioVUMeterProps {
  isActive?: boolean;
}

export function LiveAudioVUMeter({ isActive = false }: LiveAudioVUMeterProps) {
  const [level, setLevel] = useState(25);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') {
      return;
    }

    let isMounted = true;
    const intervalId = setInterval(() => {
      if (isMounted) {
        // Nivel dinámico simulado entre 20% y 75% cuando está activo
        setLevel(Math.floor(20 + Math.random() * 55));
      }
    }, 150);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      data-testid="live-audio-vu-meter"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/40 text-xs shadow-inner"
    >
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-bold text-emerald-300">Voz en vivo</span>
      </div>

      {/* Mini barras de ecualizador VU */}
      <div className="flex items-end gap-0.5 h-3 w-12 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, idx) => {
          const isFilled = (level / 100) >= threshold;
          const barHeight = 20 + idx * 20;
          return (
            <div
              key={idx}
              className={`w-1.5 rounded-sm transition-all duration-100 ${
                isFilled
                  ? idx > 3
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                  : 'bg-zinc-800'
              }`}
              style={{ height: `${barHeight}%` }}
            />
          );
        })}
      </div>

      <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Zero Trust</span>
    </div>
  );
}
