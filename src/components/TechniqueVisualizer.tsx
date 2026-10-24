'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClinicalTechnique } from '@/lib/clinicalTechniques';
import { flattenSentenceSyllables } from '@/lib/syllables';

interface TechniqueVisualizerProps {
  technique: ClinicalTechnique;
  isPlaying: boolean;
  bpm: number;
  activeSyllableIndex?: number;
  currentPhrase?: string;
  onNextSyllable?: () => void;
}

export const TechniqueVisualizer: React.FC<TechniqueVisualizerProps> = ({
  technique,
  isPlaying,
  activeSyllableIndex = 0,
  currentPhrase = '',
  onNextSyllable,
}) => {
  const [rampProgress, setRampProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para Respiración Diafragmática (Box Breathing 4-4-4-4)
  const [breathPhase, setBreathPhase] = useState<'inhalar' | 'sostener' | 'exhalar' | 'pausa'>('inhalar');
  const [breathSeconds, setBreathSeconds] = useState(4);

  // Estados de etapas interactivas para Pull-Out y Cancelación
  const [blockStage, setBlockStage] = useState<'idle' | 'frozen' | 'released'>('idle');

  // Mutable ref to guarantee timers never get destroyed by parent re-renders
  const onNextSyllableRef = useRef(onNextSyllable);
  useEffect(() => {
    onNextSyllableRef.current = onNextSyllable;
  }, [onNextSyllable]);

  // Obtener la sílaba y fonemas actuales del ejercicio
  const syllables = currentPhrase ? flattenSentenceSyllables(currentPhrase) : [];
  const currentSyllable = syllables[activeSyllableIndex % Math.max(1, syllables.length)] || 'A';

  // Limpieza total de temporizadores al cambiar de técnica o desmontar
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdown(null);
      setBlockStage('idle');
    };
  }, [technique.id]);

  // 1. Ciclo de Respiración Diafragmática 4-4-4-4
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
          if (curr === 'exhalar') {
            onNextSyllableRef.current?.();
            return 'pausa';
          }
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

  // 2. Rampa Fonoaudiológica Cadenciosa para Inicio Vocal Suave (3.0s por vocal con avance real)
  useEffect(() => {
    if (technique.id !== 'easy_onset' || !isPlaying) {
      return;
    }

    const durationMs = 3000; // 3.0 segundos por vocal (1s suspiro + 1s subida + 1s fonación plena)
    const stepMs = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += stepMs;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setRampProgress(progress);

      if (elapsed >= durationMs) {
        elapsed = 0;
        setRampProgress(0);
        onNextSyllableRef.current?.();
      }
    }, stepMs);

    return () => {
      clearInterval(timer);
      setRampProgress(0);
    };
  }, [technique.id, isPlaying]);

  // 3. Temporizador de avance cadencioso para Contacto Ligero (2.0s por sílaba)
  useEffect(() => {
    if (technique.id !== 'light_contact' || !isPlaying) return;

    const stepDuration = 2000;
    const timer = setInterval(() => {
      onNextSyllableRef.current?.();
    }, stepDuration);

    return () => clearInterval(timer);
  }, [technique.id, isPlaying]);

  // 4. Temporizador de avance cadencioso para Habla Prolongada (2.2s de fonación sostenida)
  useEffect(() => {
    if (technique.id !== 'prolonged_speech' || !isPlaying) return;

    const stepDuration = 2200;
    const timer = setInterval(() => {
      onNextSyllableRef.current?.();
    }, stepDuration);

    return () => clearInterval(timer);
  }, [technique.id, isPlaying]);

  const activeProgress = technique.id === 'easy_onset' && isPlaying ? rampProgress : 0;

  // Manejador del temporizador de descompresión (3 segundos)
  const handleStartDecompression = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(3);
    setBlockStage('frozen');
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setBlockStage('released');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // =========================================================================
  // 1. MODALIDAD INICIO VOCAL SUAVE (EASY ONSET)
  // =========================================================================
  if (technique.id === 'easy_onset') {
    // 3 etapas clínicas estables (Webster / Fluency Shaping)
    const activeStep = !isPlaying ? 1 : activeProgress < 33 ? 1 : activeProgress < 66 ? 2 : 3;

    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-cyan-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-cyan-300">
            <span>🌊</span>
            <span>Rampa de Fonación Progresiva</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-black font-mono shadow-sm">
              Vocal: {currentSyllable}
            </span>
            <span className="font-mono text-cyan-400 text-xs font-bold min-w-[58px] text-right">
              {isPlaying ? `${Math.round(activeProgress)}%` : 'Pausado'}
            </span>
          </div>
        </div>

        {/* 3 Etapas Clínicas Estables y Visibles Siempre (Sin saltos de diseño) */}
        <div className="grid grid-cols-3 gap-2 py-1 text-left">
          <div
            className={`p-2.5 rounded-2xl border transition-all duration-200 ${
              activeStep === 1
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-cyan-300">
              <span>🌬️</span>
              <span>1. Suspiro</span>
            </div>
            <div className="text-[10px] mt-1 leading-snug">
              Exhala tibio sin voz
            </div>
          </div>

          <div
            className={`p-2.5 rounded-2xl border transition-all duration-200 ${
              activeStep === 2
                ? 'bg-teal-500/15 border-teal-400 text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-teal-300">
              <span>📈</span>
              <span>2. Subida</span>
            </div>
            <div className="text-[10px] mt-1 leading-snug">
              Entra voz gradual
            </div>
          </div>

          <div
            className={`p-2.5 rounded-2xl border transition-all duration-200 ${
              activeStep === 3
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-102'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs text-emerald-300">
              <span>🗣️</span>
              <span>3. Fonación</span>
            </div>
            <div className="text-[10px] mt-1 leading-snug font-bold">
              Emite &quot;{currentSyllable}&quot;
            </div>
          </div>
        </div>

        {/* Barra de Rampa Visual Sincronizada */}
        <div className="relative w-full h-7 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 p-0.5 flex items-center">
          <div
            className="h-full rounded-lg bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(45,212,191,0.5)]"
            style={{ width: `${activeProgress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] text-zinc-300 font-mono pointer-events-none font-semibold">
            <span>0% Suspiro</span>
            <span>50% Subida</span>
            <span>100% Voz Plena</span>
          </div>
        </div>

        {/* Guía Explicativa de la Fase Activa - Altura Fija Libre de Saltos */}
        <div className="p-3 min-h-[58px] rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-left">
          <p className="text-xs text-zinc-200 font-medium leading-relaxed">
            {!isPlaying
              ? '👉 Presiona "Iniciar Rampa de Inicio Suave" abajo para comenzar el ejercicio vocal paso a paso.'
              : activeStep === 1
              ? '🌬️ Exhala un suspiro tibio por la boca sin voz, relajando la laringe.'
              : activeStep === 2
              ? '📈 Deja entrar el sonido suavemente sin golpear las cuerdas vocales.'
              : `🗣️ ¡Emite la vocal "${currentSyllable}" con voz plena y libre de tensión!`}
          </p>
        </div>

        {/* Botón para avanzar manualmente si el usuario va a su ritmo */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] text-zinc-400">
            {isPlaying ? 'Avanza automáticamente cada 3s' : 'Pausado'}
          </span>
          <button
            onClick={() => onNextSyllableRef.current?.()}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-800/60 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Avanzar Vocal ➡️
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODALIDAD CONTACTO ARTICULAR SUAVE (LIGHT CONTACT)
  // =========================================================================
  if (technique.id === 'light_contact') {
    const isOcclusive = /[ptkbdg]/i.test(currentSyllable);

    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-purple-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-purple-300">
            <span>🪶</span>
            <span>Monitoreo de Presión Articular</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold font-mono">
              Sílaba: {currentSyllable}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-purple-300 text-[10px] font-mono">
              /p, t, k, b, d, g/
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-semibold">Tacto de Pluma (≤ 30%)</span>
            <span className="text-amber-400 text-[11px]">Zona de Riesgo (&gt; 50%)</span>
          </div>
          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
            <div className="w-1/3 bg-emerald-500/80" title="Zona segura: toque suave" />
            <div className="w-1/3 bg-yellow-500/50" title="Precaución: ligera tensión" />
            <div className="w-1/3 bg-red-500/40" title="Exceso de fuerza / bloqueo" />
          </div>

          <div className="pt-1 min-h-[38px] flex items-center">
            {isOcclusive ? (
              <div className="text-xs text-purple-200">
                🎯 <strong>Consonante oclusiva en &quot;{currentSyllable}&quot;:</strong> Apenas roza los labios o lengua como pluma suave.
              </div>
            ) : (
              <div className="text-xs text-zinc-300">
                ✨ <strong>Sílaba &quot;{currentSyllable}&quot;:</strong> Articulación ligera y continua sin apretar la boca.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] text-zinc-400">
            {isPlaying ? 'Avanza automáticamente cada 2.0s' : 'Pausado'}
          </span>
          <button
            onClick={() => onNextSyllableRef.current?.()}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-800/60 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Siguiente Sílaba ➡️
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. MODALIDAD HABLA PROLONGADA (PROLONGED SPEECH)
  // =========================================================================
  if (technique.id === 'prolonged_speech') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <span>〰️</span>
            <span>Estiramiento Vocálico y Fonación Continua</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
              Sílaba: {currentSyllable}
            </span>
            <span className="font-mono text-amber-400 text-xs font-bold">Escala 2×</span>
          </div>
        </div>

        {/* Visualización de la cinta elástica vocal */}
        <div className="py-2 px-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center gap-2 overflow-hidden">
          <span className="text-zinc-500 text-xs">Voz ligada</span>
          <span className="w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-pulse" />
          <span className="text-amber-300 font-black text-base px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40">
            {currentSyllable}...
          </span>
          <span className="w-8 h-1 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full animate-pulse" />
          <span className="text-zinc-500 text-xs">Sin pausas</span>
        </div>

        <p className="text-xs text-zinc-300 text-left leading-relaxed min-h-[38px] flex items-center">
          👉 <strong>Instrucción:</strong> Alarga la vocal de &quot;{currentSyllable}&quot; al doble de su duración natural y enlázala de inmediato con la siguiente.
        </p>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] text-zinc-400">
            {isPlaying ? 'Avanza automáticamente cada 2.2s' : 'Pausado'}
          </span>
          <button
            onClick={() => onNextSyllableRef.current?.()}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-800/60 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Siguiente Sílaba ➡️
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. MODALIDAD RESPIRACIÓN DIAFRAGMÁTICA (BOX BREATHING 4-4-4-4)
  // =========================================================================
  if (technique.id === 'box_breathing') {
    const phaseData = {
      inhalar: { label: 'Inhala profundamente por la nariz inflando el abdomen', color: 'from-cyan-400 to-blue-500', scale: 'scale-110' },
      sostener: { label: 'Sostén el aire con el cuello y hombros totalmente relajados', color: 'from-blue-500 to-emerald-400', scale: 'scale-110' },
      exhalar: { label: 'Exhala lento y tibio por la boca vaciando el aire', color: 'from-emerald-400 to-teal-500', scale: 'scale-95' },
      pausa: { label: 'Pausa en serenidad con pulmones vacíos antes del ciclo', color: 'from-zinc-500 to-zinc-400', scale: 'scale-95' },
    }[breathPhase];

    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-teal-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-teal-300">
            <span>🌬️</span>
            <span>Orbe de Respiración Cuadrada (4-4-4-4)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
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

          <div className="text-xs font-bold text-teal-300 px-3">
            {isPlaying ? phaseData.label : 'Presiona "Iniciar Ciclo de Respiración" abajo para comenzar.'}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          🌬️ La respiración diafragmática estimula el nervio vago y previene la hipertonía laríngea antes del habla.
        </p>
      </div>
    );
  }

  // =========================================================================
  // 5. MODALIDAD SALIDA SUAVE DEL BLOQUEO (PULL-OUT - VAN RIPER)
  // =========================================================================
  if (technique.id === 'pull_out') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <span>🔄</span>
            <span>Rescate Activo en Bloqueo (Pull-Out)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">
            Tiempo Real
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 text-[10px]">
          <div className={`p-2 rounded-xl border text-left transition-colors ${
            blockStage === 'idle' ? 'bg-amber-500/10 border-amber-400 text-amber-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <div className="font-bold mb-0.5 text-amber-400">1. Congelar</div>
            <span>No empujar ni forzar la salida</span>
          </div>
          <div className={`p-2 rounded-xl border text-left transition-colors ${
            blockStage === 'frozen' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <div className="font-bold mb-0.5 text-emerald-400">2. Aflojar</div>
            <span>Soltar tensión mandibular</span>
          </div>
          <div className={`p-2 rounded-xl border text-left transition-colors ${
            blockStage === 'released' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <div className="font-bold mb-0.5 text-cyan-400">3. Deslizar</div>
            <span>Transición suave a la vocal</span>
          </div>
        </div>

        {/* Consola de acción paso a paso */}
        <div className="flex flex-col items-center justify-center py-1">
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-300 animate-ping">
                {countdown}
              </div>
              <span className="text-xs text-amber-200">Suelta la tensión en mandíbula y cuello...</span>
            </div>
          ) : blockStage === 'released' ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-cyan-300">
                ✅ ¡Salida suave lograda! Pronuncia &quot;{currentSyllable}&quot; relajadamente.
              </span>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setBlockStage('idle');
                    onNextSyllableRef.current?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Siguiente Palabra ➡️
                </button>
              </div>
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

        <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
          🔄 <strong>Protocolo Van Riper:</strong> Al notar una traba en &quot;{currentSyllable}&quot;, congela el empuje de fuerza. Suelta los músculos y deslízate suavemente hacia la salida.
        </p>
      </div>
    );
  }

  // =========================================================================
  // 6. MODALIDAD CANCELACIÓN POST-BLOQUEO (CANCELLATION - VAN RIPER)
  // =========================================================================
  if (technique.id === 'cancellation') {
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-3xl bg-zinc-950/80 border border-rose-500/30 shadow-lg space-y-3.5 text-center animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-rose-300">
            <span>⏸️</span>
            <span>Cancelación Post-Bloqueo</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
            Pausa de 3s
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          {countdown !== null ? (
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-16 h-16 rounded-full border-2 border-rose-400 flex items-center justify-center text-2xl font-black text-rose-300 animate-ping">
                {countdown}
              </div>
              <span className="text-xs text-zinc-300 mt-2">Pausa consciente: Respira y suelta el cuello...</span>
            </div>
          ) : blockStage === 'released' ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-300">
                ✅ ¡Pausa de 3s cumplida! Repite &quot;{currentSyllable}&quot; con Inicio Suave.
              </span>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setBlockStage('idle');
                    onNextSyllableRef.current?.();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Siguiente Palabra ➡️
                </button>
              </div>
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

        <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
          ⏸️ Tras el bloqueo en &quot;{currentSyllable}&quot;, detén el habla inmediatamente. Cuenta 3 segundos en calma y repite la palabra usando Inicio Suave.
        </p>
      </div>
    );
  }

  // Modalidad por defecto (STS se apoya en MetronomeVisual)
  return null;
};
