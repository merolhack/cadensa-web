'use client';

import React, { useState } from 'react';
import {
  ClinicalTechnique,
  TechniqueId,
  getTechniquesByFamily,
  CLINICAL_TECHNIQUES,
} from '@/lib/clinicalTechniques';

interface TechniqueSelectorProps {
  currentTechniqueId: TechniqueId;
  onSelectTechnique: (technique: ClinicalTechnique) => void;
}

export const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({
  currentTechniqueId,
  onSelectTechnique,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTechnique = CLINICAL_TECHNIQUES[currentTechniqueId] || CLINICAL_TECHNIQUES.sts;
  const families = getTechniquesByFamily();

  const handleSelect = (tech: ClinicalTechnique) => {
    onSelectTechnique(tech);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón Disparador del Menú de Técnicas (Pill interactivo) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-emerald-400/80 text-xs text-zinc-100 transition-all cursor-pointer shadow-sm group"
        title="Cambiar técnica clínica de entrenamiento"
        aria-label={`Técnica actual: ${activeTechnique.name}. Haz clic para cambiar`}
      >
        <span className="text-sm">{activeTechnique.icon}</span>
        <span className="font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
          {activeTechnique.shortName}
        </span>
        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">▾</span>
      </button>

      {/* Modal / Menú Modular de Técnicas */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de Técnicas Fonoaudiológicas"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-5 text-left">
            {/* Cabecera del Menú */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-zinc-100">
                    Menú Modular de Técnicas Clínicas
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Selecciona la metodología fonoaudiológica que deseas entrenar en esta sesión
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer text-sm"
                aria-label="Cerrar selector de técnicas"
              >
                ✕
              </button>
            </div>

            {/* Listado Agrupado por Familias Terapéuticas */}
            <div className="space-y-5">
              {families.map((family) => (
                <div key={family.id} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{family.icon}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-200 uppercase tracking-wide">
                      {family.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    {family.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {family.techniqueItems.map((tech) => {
                      const isSelected = tech.id === currentTechniqueId;
                      return (
                        <div
                          key={tech.id}
                          onClick={() => handleSelect(tech)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 text-left ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                                {tech.icon}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-zinc-100">
                                  {tech.name}
                                </div>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {tech.badge}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                                tech.difficulty === 'Principiante'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : tech.difficulty === 'Intermedio'
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {tech.difficulty}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                            {tech.summary}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px]">
                            <span className="text-emerald-400 font-medium">
                              {isSelected ? '✓ Activa ahora' : 'Elegir técnica'}
                            </span>
                            <span className="text-zinc-500">
                              {tech.faqItems.length} FAQs
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
