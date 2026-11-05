'use client';

import React from 'react';

export interface MicrophoneConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MicrophoneConsentModal({
  isOpen,
  onConfirm,
  onCancel,
}: MicrophoneConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mic-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-emerald-500/40 p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] space-y-5 text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
            🎙️
          </div>
          <div>
            <h2 id="mic-consent-title" className="text-base font-bold text-zinc-50">
              Permiso de Micrófono
            </h2>
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
              Privacidad Zero Trust • Procesamiento Local
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>
            Cadensa solicita acceso a tu micrófono únicamente para <strong>medir el volumen y la precisión rítmica de tu voz</strong> durante la práctica de auto-escucha fonoaudiológica.
          </p>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <span>🔒</span>
              <span>Garantía de Privacidad Absoluta:</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Tu audio se procesa en tiempo real dentro de tu navegador y nunca se envía a internet ni se almacena en ningún servidor.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Entendido, activar micrófono
          </button>
        </div>
      </div>
    </div>
  );
}

