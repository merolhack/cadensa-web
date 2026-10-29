'use client';

import React, { useState } from 'react';
import {
  SPANISH_VOWEL_FORMANTS,
  analyzeVocalTractKinematics,
} from '../lib/formantAnalyzer';

interface FormantBiofeedbackVisualizerProps {
  initialF1?: number;
  initialF2?: number;
}

export function FormantBiofeedbackVisualizer({
  initialF1 = 800,
  initialF2 = 1350,
}: FormantBiofeedbackVisualizerProps) {
  const [f1, setF1] = useState(initialF1);
  const [f2, setF2] = useState(initialF2);

  const analysis = analyzeVocalTractKinematics(f1, f2);

  // Mapeo normalizado a coordenadas SVG (F2 en eje X: 2500Hz a 700Hz; F1 en eje Y: 200Hz a 900Hz)
  const mapCoords = (curF1: number, curF2: number) => {
    const x = Math.max(20, Math.min(280, 20 + ((2500 - curF2) / (2500 - 700)) * 260));
    const y = Math.max(20, Math.min(180, 20 + ((curF1 - 200) / (900 - 200)) * 160));
    return { x, y };
  };

  const userPoint = mapCoords(f1, f2);

  const handleSelectVowelPreset = (v: 'a' | 'e' | 'i' | 'o' | 'u') => {
    const target = SPANISH_VOWEL_FORMANTS[v];
    setF1(target.f1);
    setF2(target.f2);
  };

  return (
    <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 shadow-xl space-y-4 text-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] mb-1">
            <span>📊 Biofeedback Acústico</span>
          </div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>Mapa del Espacio Vocálico (Formantes F1 / F2)</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            F1 indica apertura mandibular (tensión laríngea); F2 indica posición lingual.
          </p>
        </div>

        {/* Diagnóstico biomecánico */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold">
            Vocal: /{analysis.closestVowel}/
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-300 font-mono text-[11px]">
            {analysis.mandibularAperture} • {analysis.lingualPosition}
          </span>
        </div>
      </div>

      {/* Gráfico 2D del Cuadrilátero Vocálico */}
      <div className="relative w-full h-56 bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-2 flex items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full h-full">
          {/* Ejes y cuadrícula guía */}
          <line x1="20" y1="20" x2="280" y2="20" stroke="#3f3f46" strokeDasharray="2,2" />
          <line x1="20" y1="180" x2="280" y2="180" stroke="#3f3f46" strokeDasharray="2,2" />
          <line x1="20" y1="20" x2="20" y2="180" stroke="#3f3f46" strokeDasharray="2,2" />
          <line x1="280" y1="20" x2="280" y2="180" stroke="#3f3f46" strokeDasharray="2,2" />

          {/* Rótulos de ejes */}
          <text x="25" y="15" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Anterior (i)</text>
          <text x="230" y="15" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Posterior (u)</text>
          <text x="5" y="185" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Abierta (a)</text>

          {/* Zonas de referencia de vocales del español */}
          {Object.values(SPANISH_VOWEL_FORMANTS).map((target) => {
            const pos = mapCoords(target.f1, target.f2);
            return (
              <g key={target.vowel}>
                <circle cx={pos.x} cy={pos.y} r="16" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeOpacity="0.3" />
                <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  /{target.vowel}/
                </text>
              </g>
            );
          })}

          {/* Punto activo del usuario */}
          <circle cx={userPoint.x} cy={userPoint.y} r="7" fill="#06b6d4" className="animate-pulse" />
          <circle cx={userPoint.x} cy={userPoint.y} r="12" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>

      {/* Controles interactivos y selector de vocales */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-semibold text-zinc-300">Entrenamiento por Vocal Objetivo:</span>
          <div className="flex gap-1.5">
            {(['a', 'e', 'i', 'o', 'u'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleSelectVowelPreset(v)}
                className={`w-8 h-8 rounded-xl font-bold font-mono transition cursor-pointer ${
                  analysis.closestVowel === v
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                    : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                /{v}/
              </button>
            ))}
          </div>
        </div>

        {/* Sliders manuales de ajuste fino de formantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">F1 (Mandíbula):</span>
              <span className="font-mono text-cyan-300">{f1} Hz</span>
            </div>
            <input
              type="range"
              min="200"
              max="900"
              value={f1}
              onChange={(e) => setF1(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">F2 (Lengua):</span>
              <span className="font-mono text-emerald-300">{f2} Hz</span>
            </div>
            <input
              type="range"
              min="700"
              max="2500"
              value={f2}
              onChange={(e) => setF2(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

