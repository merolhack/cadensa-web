'use client';

import React, { useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const CommunityBanner: React.FC = () => {
  const storedDismissed = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem('cadensa_amttm_banner_dismissed') === 'true';
      } catch {
        return false;
      }
    },
    () => false
  );

  const [dismissedLocally, setDismissedLocally] = useState(false);

  const handleDismiss = () => {
    setDismissedLocally(true);
    try {
      localStorage.setItem('cadensa_amttm_banner_dismissed', 'true');
    } catch {
      // Manejo seguro en entornos restringidos
    }
  };

  if (storedDismissed || dismissedLocally) return null;

  return (
    <aside
      aria-label="Apoyo Comunitario"
      className="w-full max-w-3xl my-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-zinc-900/80 to-emerald-950/60 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in"
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <span className="text-2xl p-1 rounded-xl bg-blue-500/10 border border-blue-500/30">
          🤝
        </span>
        <div className="space-y-0.5 text-left">
          <div className="font-bold text-zinc-100 flex items-center gap-1.5">
            <span>Asociación Mexicana de la Tartamudez A.C.</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 font-mono">
              Comunidad
            </span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed max-w-xl">
            ¿Buscas apoyo y orientación? Conoce a la <strong>AMTTM</strong>, un espacio de acompañamiento, comprensión y respaldo para personas que tartamudean y sus familias.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <a
          href="https://www.facebook.com/AMTTM/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-md whitespace-nowrap"
        >
          <span>Visitar AMTTM</span>
          <span>↗</span>
        </a>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-xs"
          title="Ocultar banner"
          aria-label="Cerrar aviso de AMTTM"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};
