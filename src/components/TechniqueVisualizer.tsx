'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClinicalTechnique } from '@/lib/clinicalTechniques';

interface TechniqueVisualizerProps {
  technique: ClinicalTechnique;
  isPlaying: boolean;
  bpm: number;
}

export const TechniqueVisualizer: React.FC<TechniqueVisualizerProps> = ({
  technique,
  isPlaying,
  bpm,
}) => {
  const [rampProgress, setRampProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para Respiración Diafragmática (Box Breathing 4-4-4-4)
  const [breathPhase, setBreathPhase] = useState<'inhalar' | 'sostener' | 'exhalar' | 'pausa'>('inhalar');
  const [breathSeconds, setBreathSeconds] = useState(4);

  // Limpieza total del temporizador de descompresión al cambiar de técnica o desmontar
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdown(null);
    };
  }, [technique.id]);

  // Ciclo de Respiración Diafragmática 4-4-4-4
  useEffect(() => {
    if (technique.id !== 'box_breathing' || !isPlaying) {
      return;
    }

    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhase((curr) => {
          if (curr === 'inhalar') return 'sostener';
          if (curr === 'sostener') return 'exhalar';
          if (curr === 'exhalar') return 'pausa';
          return 'inhalar';
        });
        return 4;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setBreathSeconds(4);
      setBreathPhase('inhalar');
    };
  }, [technique.id, isPlaying]);

  // Animación de rampa suave para Easy Onset sincronizada con el tempo
  useEffect(() => {
    if (technique.id !== 'easy_onset' || !isPlaying) {
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    const stepTime = 30;
    const totalSteps = intervalMs / stepTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep = (currentStep + 1) % totalSteps;
      const progress = (currentStep / totalSteps) * 100;
      setRampProgress(progress);
    }, stepTime);

    return () => {
      clearInterval(timer);
      setRampProgress(0);
    };
  }, [technique.id, isPlaying, bpm]);

  const activeProgress = technique.id === 'easy_onset' && isPlaying ? rampProgress : 0;

  // Manejador del temporizador de descompresión para Cancelación y Pull-Out
  const handleStartDecompression = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Modalidad Inicio Vocal Suave (Easy Onset)
  if (technique.id === 'easy_onset') {
    const phaseLabel =
      activeProgress < 25
        ? 'Aspiración silenciosa previa (Suspiro tibio)'
        : activeProgress < 70
        ? 'Aproximación suave de cuerdas vocales'
        : 'Fonación plena y libre de tensión';

    const phaseColor =
      activeProgress < 25
        ? 'text-cyan-400'
        : activeProgress < 70
        ? 'text-emerald-400'
        : 'text-teal-300';

    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-cyan-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-cyan-300">
            <span>🌊</span>
            <span>Rampa de Fonación Progresiva</span>
          </span>
          <span className="font-mono text-cyan-400 text-xs">
            {Math.round(activeProgress)}% Intensidad
          </span>
        </div>

        {/* Barra de Rampa Visual */}
        <div className="relative w-full h-8 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 p-1 flex items-center">
          <div
            className="h-full rounded-xl bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 transition-all duration-75 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
            style={{ width: `${activeProgress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] text-zinc-400 font-mono pointer-events-none">
            <span>0% Suspiro</span>
            <span>50% Subida</span>
            <span>100% Voz Plena</span>
          </div>
        </div>

        {/* Indicador de fase actual */}
        <div className="text-xs py-1 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-zinc-400">Fase activa: </span>
          <span className={`font-bold ${phaseColor}`}>{phaseLabel}</span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          💡 Empieza la palabra con el aire saliendo antes de activar el sonido. Sube la voz con la rampa sin golpear la garganta.
        </p>
      </div>
    );
  }

  // 2. Modalidad Contacto Articular Suave (Light Contact)
  if (technique.id === 'light_contact') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-purple-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-purple-300">
            <span>🪶</span>
            <span>Monitoreo de Presión Articular</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono">
            /p, t, k, b, d, g/
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-semibold">Tacto de Pluma (≤ 30%)</span>
            <span className="text-amber-400 text-[11px]">Zona de Riesgo (&gt; 50%)</span>
          </div>
          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
            <div className="w-1/3 bg-emerald-500/80" title="Zona segura: toque suave" />
            <div className="w-1/3 bg-yellow-500/50" title="Precaución: ligera tensión" />
            <div className="w-1/3 bg-red-500/40" title="Exceso de fuerza / bloqueo" />
          </div>
        </div>

        <p className="text-[11px] text-zinc-300 leading-relaxed">
          🪶 <strong>Regla de oro:</strong> Los labios y la lengua deben rozarse como una pluma. No acumules presión de aire en la boca.
        </p>
      </div>
    );
  }

  // 3. Modalidad Habla Prolongada (Prolonged Speech)
  if (technique.id === 'prolonged_speech') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <span>〰️</span>
            <span>Estiramiento Vocálico y Fonación Continua</span>
          </span>
          <span className="font-mono text-amber-400 text-xs">Escala 2×</span>
        </div>

        <div className="py-2 flex items-center justify-center gap-1 overflow-hidden">
          <span className="text-zinc-500 text-xs">Palabra</span>
          <span className="w-12 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-pulse" />
          <span className="text-amber-300 font-bold text-sm">Vocal Estirada</span>
          <span className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full animate-pulse" />
          <span className="text-zinc-500 text-xs">Palabra</span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          〰️ Mantén el flujo de aire y sonido continuo entre palabras. No cortes la fonación como si tu voz fuera una cinta elástica.
        </p>
      </div>
    );
  }

  // 4. Modalidad Respiración Diafragmática (Box Breathing 4-4-4-4)

  if (technique.id === 'box_breathing') {
    const phaseData = {
      inhalar: { label: 'Inhala profundamente por la nariz (Abdomen)', color: 'from-cyan-400 to-blue-500', scale: 'scale-110' },
      sostener: { label: 'Sostén el aire sin tensión en el cuello', color: 'from-blue-500 to-emerald-400', scale: 'scale-110' },
      exhalar: { label: 'Exhala lento y tibio por la boca', color: 'from-emerald-400 to-teal-500', scale: 'scale-95' },
      pausa: { label: 'Pausa en calma antes del siguiente ciclo', color: 'from-zinc-500 to-zinc-400', scale: 'scale-95' },
    }[breathPhase];

    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-teal-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-teal-300">
            <span>🌬️</span>
            <span>Orbe de Respiración Cuadrada (4-4-4-4)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono">
            {isPlaying ? 'Ciclo Activo' : 'En Espera'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          <div className="relative flex items-center justify-center w-36 h-36">
            <div
              className={`w-28 h-28 rounded-full bg-gradient-to-tr ${phaseData.color} shadow-[0_0_35px_rgba(45,212,191,0.35)] transition-all duration-1000 flex flex-col items-center justify-center text-zinc-950 font-black ${
                isPlaying ? phaseData.scale : 'scale-100 opacity-80'
              }`}
            >
              <span className="text-3xl font-black">{isPlaying ? breathSeconds : '4'}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">
                segundos
              </span>
            </div>
          </div>

          <div className="text-xs font-bold text-teal-300">
            {isPlaying ? phaseData.label : 'Presiona "Iniciar Ciclo de Respiración" para comenzar'}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          🌬️ La respiración diafragmática estimula el nervio vago y previene la hipertonía laríngea antes del habla.
        </p>
      </div>
    );
  }

  // 5. Modalidad Salida Suave del Bloqueo (Pull-Out)
  if (technique.id === 'pull_out') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <span>🔄</span>
            <span>Rescate Activo en Bloqueo (Pull-Out)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">
            Tiempo Real
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 text-[10px]">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <div className="text-amber-400 font-bold mb-1">1. Congelar</div>
            <span>No empujar ni luchar</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <div className="text-emerald-400 font-bold mb-1">2. Aflojar</div>
            <span>Soltar tensión mandibular</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <div className="text-cyan-400 font-bold mb-1">3. Deslizar</div>
            <span>Transición suave a vocal</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-1">
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-300 animate-ping">
                {countdown}
              </div>
              <span className="text-xs text-amber-200 mt-2">Suelta la tensión en mandíbula y cuello...</span>
            </div>
          ) : (
            <button
              onClick={handleStartDecompression}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              🔄 Iniciar Pausa de 3 Segundos (Pull-Out)
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          🔄 <strong>Protocolo Van Riper:</strong> Al detectar un bloqueo, apaga el impulso de empujar. Suaviza el músculo y deslízate hacia la salida.
        </p>
      </div>
    );
  }

  // 6. Modalidad Cancelación Post-Bloqueo (Cancellation)
  if (technique.id === 'cancellation') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-rose-500/30 shadow-lg space-y-3 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-rose-300">
            <span>⏸️</span>
            <span>Cancelación Post-Bloqueo</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono">
            Pausa de 3s
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-rose-400 flex items-center justify-center text-2xl font-black text-rose-300 animate-ping">
                {countdown}
              </div>
              <span className="text-xs text-zinc-300 mt-2">Pausa consciente: Respira y suelta el cuello...</span>
            </div>
          ) : (
            <button
              onClick={handleStartDecompression}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              ⏸️ Iniciar Pausa Consciente de 3s
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          ⏸️ Tras el bloqueo, detén el habla inmediatamente. Cuenta 3 segundos en calma y repite la palabra usando Inicio Suave.
        </p>
      </div>
    );
  }

  // Modalidad por defecto (STS se apoya en MetronomeVisual)
  return null;
};
