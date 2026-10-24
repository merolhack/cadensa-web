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
      className="w-full max-w-3xl my-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-zinc-900/80 to-emerald-950/60 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs animate-fade-in"
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <span className="text-2xl p-1 rounded-xl bg-blue-500/10 border border-blue-500/30 flex-shrink-0">
          🤝
        </span>
        <div className="space-y-0.5 text-left">
          <div className="font-bold text-zinc-100 flex items-center gap-1.5 flex-wrap">
            <span>Asociación Mexicana de la Tartamudez A.C.</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono">
              Comunidad y Recursos
            </span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed max-w-xl">
            ¿Buscas acompañamiento y orientación? Conoce los canales oficiales de la <strong>AMTTM</strong> para personas que tartamudean, familias y profesionales:
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
        {/* Enlace oficial Facebook */}
        <a
          href="https://www.facebook.com/AMTTM/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar AMTTM en Facebook"
          className="px-3 py-1.5 rounded-xl font-semibold bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/50 text-blue-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-sm whitespace-nowrap group"
        >
          <svg className="w-3.5 h-3.5 fill-current text-[#1877F2] group-hover:text-blue-200 transition-colors" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
          <span className="text-[10px] text-zinc-400">↗</span>
        </a>

        {/* Enlace oficial Canal de YouTube */}
        <a
          href="https://www.youtube.com/@amtartamudez"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar canal de YouTube de la AMTTM"
          className="px-3 py-1.5 rounded-xl font-semibold bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-sm whitespace-nowrap group"
        >
          <svg className="w-3.5 h-3.5 fill-current text-red-500 group-hover:text-red-300 transition-colors" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube</span>
          <span className="text-[10px] text-zinc-400">↗</span>
        </a>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer text-xs ml-1"
          title="Ocultar banner"
          aria-label="Cerrar aviso de AMTTM"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};
