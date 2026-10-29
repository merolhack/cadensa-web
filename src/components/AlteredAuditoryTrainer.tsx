'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlteredAuditoryProcessor, DAFConfig, DEFAULT_DAF_CONFIG } from '../lib/alteredAuditoryFeedback';

export function AlteredAuditoryTrainer() {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<DAFConfig>({ ...DEFAULT_DAF_CONFIG });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processorRef = useRef<AlteredAuditoryProcessor | null>(null);

  useEffect(() => {
    processorRef.current = new AlteredAuditoryProcessor();
    return () => {
      processorRef.current?.stop();
    };
  }, []);

  const handleToggle = useCallback(async () => {
    setErrorMsg(null);
    if (!processorRef.current) return;

    if (isActive) {
      processorRef.current.stop();
      setIsActive(false);
    } else {
      try {
        await processorRef.current.start(config);
        setIsActive(true);
      } catch {
        setErrorMsg('No se pudo acceder al micrófono. Por favor autoriza el permiso de audio.');
        setIsActive(false);
      }
    }
  }, [isActive, config]);

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const updated = { ...config, delayMs: val };
    setConfig(updated);
    processorRef.current?.updateConfig({ delayMs: val });
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const updated = { ...config, pitchSemitones: val };
    setConfig(updated);
    processorRef.current?.updateConfig({ pitchSemitones: val });
  };

  const handleGainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const updated = { ...config, feedbackGain: val };
    setConfig(updated);
    processorRef.current?.updateConfig({ feedbackGain: val });
  };

  return (
    <div className="w-full rounded-3xl bg-zinc-900/90 border border-purple-500/30 p-6 shadow-2xl space-y-6 text-zinc-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs mb-1">
            <span>🧠 Neuroacústica • Efecto Coro</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            Alteración Auditiva en Tiempo Real (DAF / FAF)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Retarda y modula tu propia voz en tus oídos para eludir bloqueos del habla y reducir la tensión motora.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] self-start sm:self-center">
          Zero Trust Local
        </span>
      </div>

      {/* Aviso mandatorio de Auriculares */}
      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">🎧</span>
        <p className="leading-relaxed">
          <strong>Requisito fonoaudiológico:</strong> Utiliza auriculares (con cable o Bluetooth de baja latencia) para escuchar el retardo claramente y evitar acoples o pitidos con los altavoces de tu equipo.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-xs text-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Panel de Controles Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800/80">
        {/* Slider 1: Retardo DAF */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-purple-300">Retardo (DAF):</span>
            <span className="text-amber-300 font-mono">{config.delayMs} ms</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={config.delayMs}
            onChange={handleDelayChange}
            aria-label="Retardo DAF en milisegundos"
            className="w-full accent-purple-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>50ms (Leve)</span>
            <span>100ms</span>
            <span>200ms (Intenso)</span>
          </div>
        </div>

        {/* Slider 2: Modulación FAF */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-pink-300">Tono / Frecuencia (FAF):</span>
            <span className="text-amber-300 font-mono">
              {config.pitchSemitones > 0 ? `+${config.pitchSemitones}` : config.pitchSemitones} st
            </span>
          </div>
          <input
            type="range"
            min="-4"
            max="4"
            step="1"
            value={config.pitchSemitones}
            onChange={handlePitchChange}
            aria-label="Alteración de frecuencia en semitonos"
            className="w-full accent-pink-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>-4 st (Grave)</span>
            <span>0 (Natural)</span>
            <span>+4 st (Agudo)</span>
          </div>
        </div>

        {/* Slider 3: Ganancia / Volumen */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-cyan-300">Volumen en retorno:</span>
            <span className="text-amber-300 font-mono">{Math.round(config.feedbackGain * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={config.feedbackGain}
            onChange={handleGainChange}
            aria-label="Volumen de retorno"
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>10%</span>
            <span>50%</span>
            <span>90%</span>
          </div>
        </div>
      </div>

      {/* Botón de Activación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-zinc-400">
          Estado del canal:{' '}
          <span className={`font-bold ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {isActive ? '● En Vivo (Efecto Coro Activo)' : '○ Detenido'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            isActive
              ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/50'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-400 hover:to-amber-300 text-zinc-950 shadow-purple-900/40'
          }`}
        >
          <span>{isActive ? '⏹ Detener Bucle DAF/FAF' : '▶ Iniciar Bucle Auditivo'}</span>
        </button>
      </div>
    </div>
  );
}
