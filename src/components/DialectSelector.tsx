'use client';

import React, { useState } from 'react';
import { DIALECT_PRESETS, DialectPreset, getDialectPreset } from '@/lib/phoneticPresets';

interface DialectSelectorProps {
  currentDialectId?: string;
  onSelectDialect: (preset: DialectPreset) => void;
  className?: string;
}

export const DialectSelector: React.FC<DialectSelectorProps> = ({
  currentDialectId = 'mexico_central',
  onSelectDialect,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentDialectId);
  const activePreset = getDialectPreset(selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const preset = getDialectPreset(id);
    onSelectDialect(preset);
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-zinc-100 ${className}`}
      data-testid="dialect-selector"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
              Calibración Fonética Dialectal
            </h4>
            <p className="text-[11px] text-zinc-400">
              Ajusta tempo y formantes según la variedad regional del español
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
          {activePreset.flag} {activePreset.region}
        </span>
      </div>

      {/* Selector de Chips de Dialecto */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.values(DIALECT_PRESETS).map((preset) => {
          const isSelected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200 shadow-sm'
                  : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="text-base">{preset.flag}</span>
              <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                {preset.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {preset.recommendedTempoBpm} BPM
              </span>
            </button>
          );
        })}
      </div>

      {/* Detalles del Preset Activo */}
      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <span>
            <strong className="text-zinc-200">Tempo sugerido:</strong> {activePreset.recommendedTempoBpm} BPM ({activePreset.syllablesPerSecond} síl/s)
          </span>
          <span className="font-mono text-emerald-400">
            Formante /a/: {activePreset.vowelFormants.a.f1} Hz (F1) / {activePreset.vowelFormants.a.f2} Hz (F2)
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          <strong className="text-cyan-300">Orientación fonoaudiológica:</strong> {activePreset.clinicalConsiderations}
        </p>
      </div>
    </div>
  );
};
