'use client';

import React, { useState } from 'react';
import { REAL_WORLD_SCENARIOS, SimulationScenario } from '@/lib/realWorldScenarios';
import { CLINICAL_TECHNIQUES, ClinicalTechnique } from '@/lib/clinicalTechniques';
import { trackClinicalEvent } from '@/lib/analytics';

interface RealWorldSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPracticePhrase: (phrase: string, bpm: number, technique: ClinicalTechnique) => void;
}

export const RealWorldSimulator: React.FC<RealWorldSimulatorProps> = ({
  isOpen,
  onClose,
  onSelectPracticePhrase,
}) => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(REAL_WORLD_SCENARIOS[0]);

  if (!isOpen) return null;

  const recommendedTech = CLINICAL_TECHNIQUES[activeScenario.recommendedTechniqueId] || CLINICAL_TECHNIQUES.sts;

  const handleStartResponse = (phrase: string) => {
    trackClinicalEvent('simulator_scenario_start', {
      scenario_id: activeScenario.id,
      technique_id: recommendedTech.id,
      bpm: activeScenario.recommendedBpm,
    });
    onSelectPracticePhrase(phrase, activeScenario.recommendedBpm, recommendedTech);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
              <span>🎭</span>
              <span>Simulador de Situaciones Reales de Habla</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Entrena tu respuesta serena ante escenarios de presión social y llamadas reales.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl bg-zinc-800/60 cursor-pointer"
            aria-label="Cerrar simulador"
          >
            ✕
          </button>
        </div>

        {/* Selector de Escenarios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REAL_WORLD_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => setActiveScenario(scen)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                activeScenario.id === scen.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="text-2xl">{scen.icon}</span>
              <span className="text-xs font-bold text-zinc-200 leading-tight">{scen.title}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded w-max ${
                scen.pressureLevel === 'Alta' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {scen.pressureLevel}
              </span>
            </button>
          ))}
        </div>

        {/* Tarjeta del Contexto e Interlocutor */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-emerald-400">Mensaje del Interlocutor:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              Técnica recomendada: {recommendedTech.shortName} ({activeScenario.recommendedBpm} BPM)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 text-sm sm:text-base text-zinc-100 italic">
            &ldquo;{activeScenario.contextPrompt}&rdquo;
          </div>
        </div>

        {/* Respuestas Guiadas para Practicar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Elige una respuesta para entrar a la estación de práctica con ritmo:
          </h3>
          <div className="space-y-2">
            {activeScenario.targetResponses.map((resp, idx) => (
              <button
                key={idx}
                onClick={() => handleStartResponse(resp)}
                className="w-full p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-emerald-500/40 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-200 group-hover:text-emerald-300 transition-colors">
                    {resp}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Practicar →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

