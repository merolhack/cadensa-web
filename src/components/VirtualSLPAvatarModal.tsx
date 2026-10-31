'use client';

import React from 'react';
import { VirtualSLPAvatar, AvatarClinicalMode } from './VirtualSLPAvatar';
import { DialectId } from '@/lib/phoneticPresets';

export interface VirtualSLPAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialectId?: DialectId;
  bpm?: number;
  onApplyTechnique?: (mode: AvatarClinicalMode) => void;
}

export function VirtualSLPAvatarModal({
  isOpen,
  onClose,
  dialectId = 'mx_central',
  bpm = 80,
  onApplyTechnique,
}: VirtualSLPAvatarModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="virtual-avatar-modal-title"
      data-testid="virtual-slp-avatar-modal"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 sm:p-7 space-y-6">
        {/* Header con botón de cerrar */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Co-Terapeuta Virtual 3D • Zero Trust</span>
            </div>
            <h2
              id="virtual-avatar-modal-title"
              className="text-xl sm:text-2xl font-black text-zinc-50"
            >
              Agente Avatar Fonoaudiológico
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Modelado fisiológico facio-articular, respiratorio y generador fonético adaptable en tiempo real.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center justify-center text-lg transition-colors cursor-pointer"
            aria-label="Cerrar Modal del Avatar"
          >
            ✕
          </button>
        </div>

        {/* Contenido principal: VirtualSLPAvatar */}
        <VirtualSLPAvatar
          dialectId={dialectId}
          bpm={bpm}
          onModeChange={(mode) => {
            if (onApplyTechnique) {
              onApplyTechnique(mode);
            }
          }}
        />

        {/* Footer con aviso ético YMYL y botón de cierre */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
          <p className="text-[11px] text-zinc-400 text-center sm:text-left">
            🔒 Procesamiento 100% en el dispositivo. En alianza con la Asociación Mexicana de la Tartamudez A.C. (AMTTM).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Entendido, volver a la práctica
          </button>
        </div>
      </div>
    </div>
  );
}
