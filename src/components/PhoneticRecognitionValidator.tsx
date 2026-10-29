'use client';

import React, { useState } from 'react';
import {
  evaluatePhoneticMatch,
  PhoneticMatchResult,
} from '../lib/speechRecognitionHelper';

interface PhoneticRecognitionValidatorProps {
  targetPhrase: string;
  onValidationComplete?: (result: PhoneticMatchResult) => void;
}

export function PhoneticRecognitionValidator({
  targetPhrase,
  onValidationComplete,
}: PhoneticRecognitionValidatorProps) {
  const [spokenInput, setSpokenInput] = useState('');
  const [result, setResult] = useState<PhoneticMatchResult | null>(null);

  const handleValidate = (textToValidate: string) => {
    const evaluation = evaluatePhoneticMatch(targetPhrase, textToValidate);
    setResult(evaluation);
    onValidationComplete?.(evaluation);
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🎙️</span>
          <div>
            <h4 className="font-bold text-zinc-100">Validador Fonético On-Device</h4>
            <span className="text-[10px] text-zinc-400">Verifica la fidelidad acústica en tu navegador</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px]">
          Zero Trust
        </span>
      </div>

      <div className="space-y-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
        <span className="text-[10px] uppercase font-mono text-zinc-500 block">Frase Objetivo</span>
        <p className="text-zinc-200 font-medium text-sm">&quot;{targetPhrase}&quot;</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="spoken-input" className="block text-zinc-300 font-semibold">
          Articulación detectada / Frase emitida:
        </label>
        <div className="flex gap-2">
          <input
            id="spoken-input"
            type="text"
            value={spokenInput}
            onChange={(e) => setSpokenInput(e.target.value)}
            placeholder="Escribe o simula lo que pronunciaste..."
            className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={() => handleValidate(spokenInput)}
            disabled={!spokenInput.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 text-zinc-950 font-bold transition cursor-pointer"
          >
            Evaluar
          </button>
        </div>
      </div>

      {result && (
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-cyan-500/30 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-200">Resultado de Concordancia Fonética</span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                result.isAccurate
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {result.matchPercentage}% Coincidencia
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            💡 {result.clinicalFeedback}
          </p>

          {result.omittedTokens.length > 0 && (
            <div className="pt-1 border-t border-zinc-800 text-[11px]">
              <span className="text-amber-400 font-semibold">Palabras o fonemas omitidos:</span>{' '}
              <span className="text-zinc-300">{result.omittedTokens.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
