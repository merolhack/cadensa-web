'use client';

import React, { useEffect } from 'react';
import { ClinicalTechnique } from '@/lib/clinicalTechniques';

interface TechniqueVideoModalProps {
  technique: ClinicalTechnique | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (technique: ClinicalTechnique) => void;
}

export const TechniqueVideoModal: React.FC<TechniqueVideoModalProps> = ({
  technique,
  isOpen,
  onClose,
  onStartPractice,
}) => {
  // Manejador de tecla Escape para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !technique) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
              {technique.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider">
                  {technique.badge}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                  {technique.difficulty}
                </span>
              </div>
              <h2 id="video-modal-title" className="text-lg sm:text-xl font-bold text-zinc-100 mt-1">
                {technique.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal de video"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Reproductor o Contenedor de Video */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-video flex flex-col items-center justify-center text-center p-4">
          {technique.videoUrl ? (
            <video
              src={technique.videoUrl}
              controls
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="space-y-3 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-3xl animate-pulse">🎬</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-200">
                  Video Demostrativo de {technique.shortName}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El equipo clínico y audiovisual está produciendo la guía en video de alta definición para esta técnica. Puedes comenzar a entrenar de forma guiada con el visualizador interactivo ahora mismo.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-400 font-mono">
                <span>✓</span>
                <span>Visualizador interactivo 100% activo en la app</span>
              </div>
            </div>
          )}
        </div>

        {/* Pasos Prácticos de la Técnica */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2 text-left">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            📋 Protocolo Fisiológico Clave:
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {technique.practicalSteps.slice(0, 3).map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones del Modal */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onStartPractice(technique);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🚀</span>
            <span>Comenzar Práctica de {technique.shortName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
