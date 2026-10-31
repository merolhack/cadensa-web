'use client';

import React, { useState, useMemo } from 'react';
import { AcousticAiDetector, LaryngealTensionAnalysis } from '@/lib/acousticAiDetector';

interface AcousticBiofeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTechnique?: (techniqueId: string) => void;
}

export const AcousticBiofeedback: React.FC<AcousticBiofeedbackProps> = ({
  isOpen,
  onClose,
  onApplyTechnique,
}) => {
  const detector = useMemo(() => new AcousticAiDetector(), []);
  const [analysis, setAnalysis] = useState<LaryngealTensionAnalysis>({
    timestamp: Date.now(),
    tensionLevel: 0.15,
    riskLevel: 'low',
    metrics: { jitter: 0.05, spectralFlux: 0.1, hfRatio: 0.1 },
    clinicalRecommendation: 'Tensión óptima y relajada. Mantén el ritmo articulatorio y la respiración diafragmática fluida.',
    processingMode: 'DSP_CPU',
  });

  if (!isOpen) return null;

  const handleSimulateState = (type: 'relaxed' | 'moderate' | 'high') => {
    const buffer = new Float32Array(512);
    if (type === 'relaxed') {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(i * 0.1) * 0.2;
      }
    } else if (type === 'moderate') {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin(i * 0.3) * 0.5 + (Math.random() - 0.5) * 0.3;
      }
    } else {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = i % 2 === 0 ? 0.95 : -0.95;
      }
    }
    const result = detector.analyzeBuffer(buffer);
    setAnalysis(result);
  };

  const tensionPercent = Math.round(analysis.tensionLevel * 100);

  const getStatusBadge = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return {
          label: 'Fonación Óptima • Relajada',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          barColor: 'bg-emerald-500',
        };
      case 'moderate':
        return {
          label: 'Tensión Pre-Fonatoria Moderada',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          barColor: 'bg-amber-500',
        };
      case 'high':
        return {
          label: 'Hiperaducción • Bloqueo Inminente',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          barColor: 'bg-rose-500',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="acoustic-biofeedback-title"
    >
      <div className="relative w-full max-w-lg p-6 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl space-y-6 text-zinc-100 animate-in fade-in zoom-in duration-150">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
              🧠
            </div>
            <div>
              <h3 id="acoustic-biofeedback-title" className="text-lg font-bold text-zinc-50 flex items-center gap-2">
                <span>Biofeedback Acústico On-Device</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Inferencia de micro-tensión laríngea prefonatoria ({analysis.processingMode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de biofeedback"
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Indicador de Nivel de Tensión */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Nivel de Tensión Laringotraqueal
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${status.barColor}`}
                style={{ width: `${Math.max(tensionPercent, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0% Relajado</span>
              <span className="font-bold text-zinc-300">{tensionPercent}%</span>
              <span>100% Hiperaducción</span>
            </div>
          </div>
        </div>

        {/* Recomendación Clínica */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
            <span>💡</span> Guía de Desactivación Inmediata
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {analysis.clinicalRecommendation}
          </p>

          {analysis.riskLevel !== 'low' && onApplyTechnique && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onApplyTechnique('easy_onset');
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🍃</span>
                <span>Activar Técnica de Inicio Suave (Easy Onset)</span>
              </button>
            </div>
          )}
        </div>

        {/* Panel de Simulación para Paciente y Terapeuta */}
        <div className="space-y-2">
          <span className="text-[11px] text-zinc-400 font-medium">
            Simular patrones de emisión fonatoria:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulateState('relaxed')}
              className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              🍃 Fonación Suave
            </button>
            <button
              onClick={() => handleSimulateState('moderate')}
              className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-amber-400 font-medium transition-colors cursor-pointer"
            >
              ⚠️ Tensión Media
            </button>
            <button
              onClick={() => handleSimulateState('high')}
              className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-rose-400 font-medium transition-colors cursor-pointer"
            >
              🚨 Bloqueo Tónico
            </button>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Privacidad Zero Trust: 100% On-Device</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
