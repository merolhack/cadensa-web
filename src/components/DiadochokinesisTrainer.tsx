'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DDKSequenceType,
  DDK_SEQUENCES,
  evaluateDDKTrial,
  DDKAssessmentResult,
} from '../lib/diadochokinesis';

export function DiadochokinesisTrainer() {
  const [selectedSequence, setSelectedSequence] = useState<DDKSequenceType>('pa-ta-ka');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [syllableTimestamps, setSyllableTimestamps] = useState<number[]>([]);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);
  const [result, setResult] = useState<DDKAssessmentResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sequenceInfo = DDK_SEQUENCES[selectedSequence];

  const handleStart = () => {
    setResult(null);
    setSyllableTimestamps([]);
    setTimeLeft(10);
    setActiveSyllableIndex(0);
    setIsActive(true);
  };

  const handleEnd = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSyllableTimestamps((current) => {
      const evaluation = evaluateDDKTrial(selectedSequence, current, 10);
      setResult(evaluation);
      return current;
    });
  }, [selectedSequence]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, handleEnd]);

  const handleRegisterSyllable = useCallback(() => {
    if (!isActive) return;
    const now = performance.now();
    setSyllableTimestamps((prev) => [...prev, now]);
    setActiveSyllableIndex((prev) => (prev + 1) % sequenceInfo.syllables.length);
  }, [isActive, sequenceInfo.syllables.length]);

  // Atajo de teclado (Barra espaciadora o Enter durante la prueba)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isActive) {
        e.preventDefault();
        handleRegisterSyllable();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleRegisterSyllable]);

  const currentRate = syllableTimestamps.length > 0 && timeLeft < 10
    ? (syllableTimestamps.length / (10 - timeLeft)).toFixed(1)
    : '0.0';

  return (
    <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-1">
            <span>⚡ Protocolo Fonoaudiológico DDK</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
            <span>Evaluación y Entrenamiento de Diadococinesia Oral</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mide la tasa motora articulatoria (sílabas/segundo) y la regularidad temporal inter-silábica.
          </p>
        </div>

        {/* Badge de norma clínica */}
        <div className="text-left sm:text-right bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60 text-xs">
          <span className="text-zinc-500 block text-[10px] uppercase font-mono">Norma Adultos</span>
          <span className="text-emerald-400 font-semibold">5.0 - 6.5 síl/seg (Regular)</span>
        </div>
      </div>

      {/* Selector de Secuencias */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-300">
          Selecciona la Secuencia Clínica Fonética:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DDK_SEQUENCES) as DDKSequenceType[]).map((key) => {
            const seq = DDK_SEQUENCES[key];
            const isSelected = selectedSequence === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!isActive) setSelectedSequence(key);
                }}
                disabled={isActive}
                className={`p-3 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 shadow-sm'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="font-bold text-sm font-mono">
                  /{seq.syllables.join('-')}/
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {seq.label.split('(')[1]?.replace(')', '') || 'Ejercicio'}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-400 italic bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/40">
          🎯 <strong>Objetivo terapéutico:</strong> {sequenceInfo.clinicalFocus}
        </p>
      </div>

      {/* Visualizador de Sílabas en Pantalla */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          {sequenceInfo.syllables.map((syl, idx) => {
            const isHighlighted = isActive && activeSyllableIndex === idx;
            return (
              <div
                key={idx}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-extrabold text-2xl sm:text-3xl font-mono uppercase transition-all duration-100 ${
                  isHighlighted
                    ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 text-zinc-950 scale-110 shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60'
                }`}
              >
                {syl}
              </div>
            );
          })}
        </div>

        {/* Medidores en vivo si la prueba está activa */}
        {isActive && (
          <div className="flex items-center justify-center gap-6 text-xs font-mono">
            <div>
              <span className="text-zinc-400 block">Tiempo restante</span>
              <span className="text-xl font-bold text-amber-400">{timeLeft}s</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Sílabas articuladas</span>
              <span className="text-xl font-bold text-emerald-400">{syllableTimestamps.length}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Tasa en tiempo real</span>
              <span className="text-xl font-bold text-cyan-400">{currentRate} síl/s</span>
            </div>
          </div>
        )}

        {/* Botón de Acción Principal */}
        <div className="pt-2">
          {!isActive ? (
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-zinc-950 font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
            >
              Iniciar Prueba de 10 Segundos
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRegisterSyllable}
                className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
              >
                ¡PULSA AL PRONUNCIAR! (O pulsa Barra Espaciadora)
              </button>
              <p className="text-[11px] text-zinc-400">
                Pronuncia cada sílaba en orden isocrónico y pulsa en cada impacto articulatorio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resultados de la Evaluación */}
      {result && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-cyan-500/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm sm:text-base">
              <span>📊</span>
              <span>Resultados Fonoaudiológicos — Diadococinesia</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                result.rateClassification === 'Óptima'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : result.rateClassification === 'Adecuada'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Tasa: {result.rateClassification}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Tasa Articulatoria</span>
              <span className="text-xl font-extrabold text-cyan-400">{result.rateSyllablesPerSecond}</span>
              <span className="text-[10px] text-zinc-500 block">sílabas / segundo</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Sílabas</span>
              <span className="text-xl font-extrabold text-emerald-400">{result.syllableCount}</span>
              <span className="text-[10px] text-zinc-500 block">en {result.durationSeconds}s</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Jitter Temporal</span>
              <span className="text-xl font-extrabold text-indigo-400">±{result.jitterMs} ms</span>
              <span className="text-[10px] text-zinc-500 block">{result.regularityClassification}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Intervalo Medio</span>
              <span className="text-xl font-extrabold text-zinc-200">{result.averageIntervalMs} ms</span>
              <span className="text-[10px] text-zinc-500 block">inter-silábico</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1">
            <span className="font-semibold text-zinc-300 block">Interpretación Clínica:</span>
            <p className="text-zinc-400 leading-relaxed">{result.clinicalSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
