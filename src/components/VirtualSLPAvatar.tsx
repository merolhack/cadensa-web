'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  generatePhoneticExercises,
  PhoneticTargetGroup,
} from '@/lib/phoneticTextGenerator';
import { DialectId } from '@/lib/phoneticPresets';

export type AvatarClinicalMode =
  | 'breathing'     // Respiración Cuadrada 4-4-4-4 diafragmática
  | 'easy_onset'    // Inicios Suaves y aproximación de cuerdas vocales
  | 'pull_out'      // Modificación en Bloqueo (Van Riper) y desaceleración
  | 'cancellation'  // Cancelación Post-Bloqueo con pausa de 3s
  | 'light_contact' // Contactos Articuladores Ligeros con gradiente de presión
  | 'mirroring';    // Espejo Vocal en Tiempo Real con aureola de micro-tensión

export interface VirtualSLPAvatarProps {
  initialMode?: AvatarClinicalMode;
  dialectId?: DialectId;
  bpm?: number;
  onModeChange?: (mode: AvatarClinicalMode) => void;
  className?: string;
}

export function VirtualSLPAvatar({
  initialMode = 'breathing',
  dialectId = 'mx_central',
  bpm = 80,
  onModeChange,
  className = '',
}: VirtualSLPAvatarProps) {
  const [mode, setMode] = useState<AvatarClinicalMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [cyclePhase, setCyclePhase] = useState<string>('Inhalar (4s)');
  const [tensionLevel, setTensionLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [selectedGroup, setSelectedGroup] = useState<PhoneticTargetGroup>('bilabial_stops');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stateTimerRef = useRef<number>(0);

  // Sincronizar ejercicio generado con el grupo seleccionado de forma reactiva
  const currentExercise = useMemo(() => {
    const exercises = generatePhoneticExercises({
      level: 'sentences',
      targetGroup: selectedGroup,
      dialectId,
      count: 1,
    });
    return exercises.length > 0 ? exercises[0] : null;
  }, [selectedGroup, dialectId]);

  // Manejar cambio de modo
  const handleModeChange = (newMode: AvatarClinicalMode) => {
    setMode(newMode);
    stateTimerRef.current = 0;
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  // Motor de renderizado en Canvas a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000; // segundos
      const width = canvas.width;
      const height = canvas.height;

      // 1. Limpiar fondo
      ctx.clearRect(0, 0, width, height);

      // Fondo oscuro elegante
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(1, '#18181b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Parámetros de animación según el modo clínico
      let chestExpansion = 0; // 0 a 1
      let mouthOpen = 0.1; // 0 a 1
      let vocalCordsGap = 0.5; // 0 a 1
      let contactTensionColor = '#10b981'; // Verde fluido
      let auraColor = 'rgba(16, 185, 129, 0.25)'; // Esmeralda suave

      // 2. Lógica por Modo Clínico
      if (mode === 'breathing') {
        // Ciclo 4-4-4-4: 16 segundos totales
        const breathTime = elapsed % 16;
        if (breathTime < 4) {
          chestExpansion = breathTime / 4;
          mouthOpen = 0.2;
          setCyclePhase('Inhalar por la nariz (4s)');
          auraColor = 'rgba(56, 189, 248, 0.35)'; // Cyan
        } else if (breathTime < 8) {
          chestExpansion = 1.0;
          mouthOpen = 0.05;
          setCyclePhase('Retener con calma (4s)');
          auraColor = 'rgba(45, 212, 191, 0.35)'; // Teal
        } else if (breathTime < 12) {
          chestExpansion = 1 - (breathTime - 8) / 4;
          mouthOpen = 0.35;
          setCyclePhase('Exhalar suavemente (4s)');
          auraColor = 'rgba(16, 185, 129, 0.35)'; // Emerald
        } else {
          chestExpansion = 0;
          mouthOpen = 0.05;
          setCyclePhase('Pausa de relajación (4s)');
          auraColor = 'rgba(99, 102, 241, 0.25)'; // Indigo
        }
      } else if (mode === 'easy_onset') {
        // Ciclo de 3 segundos: Ataque suave gradual
        const onsetTime = elapsed % 3;
        if (onsetTime < 1.0) {
          chestExpansion = onsetTime;
          vocalCordsGap = 0.8;
          mouthOpen = 0.15;
          setCyclePhase('1. Exhalación previa (Voz relajada)');
        } else if (onsetTime < 2.0) {
          // Aproximación suave de cuerdas vocales
          vocalCordsGap = 0.8 - (onsetTime - 1.0) * 0.6; // se cierran suavemente
          mouthOpen = 0.2 + (onsetTime - 1.0) * 0.4;
          setCyclePhase('2. Ataque vocal suave (Sin golpe glótico)');
          auraColor = 'rgba(16, 185, 129, 0.4)';
        } else {
          vocalCordsGap = 0.2;
          mouthOpen = 0.4;
          setCyclePhase('3. Fonación continua y fluida');
          auraColor = 'rgba(52, 211, 153, 0.3)';
        }
      } else if (mode === 'pull_out') {
        // Modificación en Bloqueo: Bloqueo -> Ralentización -> Deslizamiento
        const pullTime = elapsed % 4;
        if (pullTime < 1.5) {
          mouthOpen = 0.05;
          contactTensionColor = '#ef4444'; // Rojo tensión
          auraColor = 'rgba(239, 68, 68, 0.4)';
          setCyclePhase('1. Detección del espasmo (No forzar)');
        } else if (pullTime < 2.8) {
          mouthOpen = 0.1 + (pullTime - 1.5) * 0.2;
          contactTensionColor = '#f59e0b'; // Amarillo transición
          auraColor = 'rgba(245, 158, 11, 0.4)';
          setCyclePhase('2. Desaceleración y relajación lingual');
        } else {
          mouthOpen = 0.45;
          contactTensionColor = '#10b981'; // Verde salida
          auraColor = 'rgba(16, 185, 129, 0.4)';
          setCyclePhase('3. Deslizamiento suave hacia la vocal');
        }
      } else if (mode === 'cancellation') {
        // Cancelación: Parada voluntaria 3s -> Nuevo inicio suave
        const cancelTime = elapsed % 5;
        if (cancelTime < 1.2) {
          mouthOpen = 0.1;
          contactTensionColor = '#f59e0b';
          auraColor = 'rgba(245, 158, 11, 0.3)';
          setCyclePhase('1. Detención consciente tras el bloqueo');
        } else if (cancelTime < 3.2) {
          mouthOpen = 0.05;
          chestExpansion = 0.7;
          auraColor = 'rgba(56, 189, 248, 0.35)';
          setCyclePhase('2. Pausa reflexiva (3s) y respiración');
        } else {
          mouthOpen = 0.4;
          contactTensionColor = '#10b981';
          auraColor = 'rgba(16, 185, 129, 0.4)';
          setCyclePhase('3. Reemisión suave y controlada');
        }
      } else if (mode === 'light_contact') {
        // Oscilación de contacto ligero
        const beatSec = 60 / bpm;
        const phase = (elapsed % beatSec) / beatSec;
        mouthOpen = Math.sin(phase * Math.PI) * 0.4;
        contactTensionColor = '#10b981'; // Contacto siempre suave < 40%
        setCyclePhase('Contacto ligero en labios y lengua');
        auraColor = 'rgba(16, 185, 129, 0.3)';
      } else {
        // Mirroring: Espejo interactivo simulado
        const wave = Math.sin(elapsed * 4);
        mouthOpen = 0.2 + wave * 0.15;
        if (tensionLevel === 'low') {
          auraColor = 'rgba(16, 185, 129, 0.4)';
          setCyclePhase('Espejo Activo: Emisión Suave y Fluida');
        } else if (tensionLevel === 'medium') {
          auraColor = 'rgba(245, 158, 11, 0.4)';
          setCyclePhase('Espejo Activo: Tensión Articulatoria Moderada');
        } else {
          auraColor = 'rgba(239, 68, 68, 0.45)';
          setCyclePhase('Espejo Activo: Alerta de Micro-Tensión Prefonatoria');
        }
      }

      const centerX = width / 2;
      const headY = 95;
      const headRadius = 45;

      // 3. Aureola de Biofeedback de Tensión (Glow)
      ctx.save();
      const glow = ctx.createRadialGradient(
        centerX,
        headY + 30,
        headRadius * 0.8,
        centerX,
        headY + 30,
        headRadius * 2.2
      );
      glow.addColorStop(0, auraColor);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, headY + 30, headRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Torso y Expansión Torácica / Diafragmática
      const torsoY = headY + headRadius + 45;
      const chestWidth = 110 + chestExpansion * 20;
      const chestHeight = 70;

      ctx.save();
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(
          centerX - chestWidth / 2,
          torsoY,
          chestWidth,
          chestHeight,
          [16, 16, 8, 8]
        );
      } else {
        ctx.rect(centerX - chestWidth / 2, torsoY, chestWidth, chestHeight);
      }
      ctx.fill();
      ctx.stroke();

      // Indicador diafragmático interno (Pulmones esquemáticos)
      const lungGrad = ctx.createRadialGradient(
        centerX,
        torsoY + 30,
        5,
        centerX,
        torsoY + 30,
        35
      );
      lungGrad.addColorStop(0, `rgba(56, 189, 248, ${0.15 + chestExpansion * 0.45})`);
      lungGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lungGrad;
      ctx.beginPath();
      ctx.arc(centerX, torsoY + 30, 30 + chestExpansion * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Cuello y Cuerdas Vocales
      const neckWidth = 28;
      const neckHeight = 45;
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(centerX - neckWidth / 2, headY + headRadius - 5, neckWidth, neckHeight);

      // Cuerdas vocales esquemáticas visibles en el cuello
      if (mode === 'easy_onset' || mode === 'breathing') {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        const cordOffset = vocalCordsGap * 10;
        // Cuerda izquierda
        ctx.beginPath();
        ctx.moveTo(centerX - cordOffset - 2, headY + headRadius + 10);
        ctx.lineTo(centerX - 2, headY + headRadius + 26);
        ctx.stroke();
        // Cuerda derecha
        ctx.beginPath();
        ctx.moveTo(centerX + cordOffset + 2, headY + headRadius + 10);
        ctx.lineTo(centerX + 2, headY + headRadius + 26);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Cabeza / Rostro del Avatar
      ctx.save();
      const faceGrad = ctx.createLinearGradient(
        centerX - headRadius,
        headY - headRadius,
        centerX + headRadius,
        headY + headRadius
      );
      faceGrad.addColorStop(0, '#f4f4f5');
      faceGrad.addColorStop(1, '#e4e4e7');
      ctx.fillStyle = faceGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ojos empáticos con pestañeo periódico
      const isBlinking = elapsed % 4.5 < 0.15;
      ctx.fillStyle = '#18181b';
      const eyeSpacing = 16;
      const eyeY = headY - 6;

      if (isBlinking) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(centerX - eyeSpacing - 5, eyeY);
        ctx.lineTo(centerX - eyeSpacing + 5, eyeY);
        ctx.moveTo(centerX + eyeSpacing - 5, eyeY);
        ctx.lineTo(centerX + eyeSpacing + 5, eyeY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.arc(centerX + eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Brillo en los ojos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing - 1, eyeY - 1, 1.2, 0, Math.PI * 2);
        ctx.arc(centerX + eyeSpacing - 1, eyeY - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Boca y Aparato Fonoarticular Dinámico
      const mouthY = headY + 22;
      const mouthW = 24;
      const currentOpening = Math.max(3, mouthOpen * 22);

      ctx.save();
      // Labios con gradiente de tensión
      ctx.strokeStyle = contactTensionColor;
      ctx.lineWidth = 3;
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.ellipse(centerX, mouthY, mouthW / 2, currentOpening / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lengua esquemática
      if (currentOpening > 8) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(centerX, mouthY + currentOpening / 4, 6, 0, Math.PI);
        ctx.fill();
      }
      ctx.restore();

      // 8. Solicitar siguiente frame si sigue activo
      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, isPlaying, bpm, tensionLevel]);

  return (
    <div
      className={`rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-5 text-zinc-100 shadow-xl ${className}`}
      data-testid="virtual-slp-avatar"
    >
      {/* 1. Header con Badge de IA Co-Terapeuta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-zinc-50 flex items-center gap-2">
              <span>Virtual SLP Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                IA Co-Terapeuta 3D
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Guía fisiológica facio-articular en tiempo real (Zero Trust)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
          }`}
          aria-label={isPlaying ? 'Pausar Avatar' : 'Reanudar Avatar'}
        >
          {isPlaying ? '⏸ Pausar' : '▶ Reanudar'}
        </button>
      </div>

      {/* 2. Visualizador Central: Canvas 2D/WebGL del Avatar */}
      <div className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={320}
          height={260}
          className="rounded-lg shadow-inner max-w-full h-auto"
          aria-label="Avatar Fonoaudiológico Fisiológico"
        />

        {/* Indicador de Fase Clínica */}
        <div className="absolute bottom-4 inset-x-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs font-mono font-medium text-emerald-300 shadow-md">
            {cyclePhase}
          </span>
        </div>
      </div>

      {/* 3. Selector de Modos Clínicos del Avatar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          Técnica Fisiológica en Demostración:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleModeChange('breathing')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'breathing'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🫁 Respiración 4-4-4-4
          </button>
          <button
            onClick={() => handleModeChange('easy_onset')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'easy_onset'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🌊 Inicios Suaves
          </button>
          <button
            onClick={() => handleModeChange('pull_out')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'pull_out'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🔓 Pull-Out (Van Riper)
          </button>
          <button
            onClick={() => handleModeChange('cancellation')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'cancellation'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🔄 Cancelación
          </button>
          <button
            onClick={() => handleModeChange('light_contact')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'light_contact'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🪶 Contacto Ligero
          </button>
          <button
            onClick={() => handleModeChange('mirroring')}
            className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
              mode === 'mirroring'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            🪞 Espejo Vocal Biofeedback
          </button>
        </div>
      </div>

      {/* 4. Módulo de Textos Balanceados Fonéticamente (NLP Client-Side) */}
      <div className="pt-2 border-t border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">
            Ejercicio Fonético Adaptado ({dialectId.toUpperCase()}):
          </span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value as PhoneticTargetGroup)}
            className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 cursor-pointer"
            aria-label="Grupo Fonético Diana"
          >
            <option value="bilabial_stops">Oclusivas Bilabiales (/p, b, m/)</option>
            <option value="dental_stops">Oclusivas Dentales (/t, d/)</option>
            <option value="velar_stops">Oclusivas Velares (/k, g/)</option>
            <option value="fricatives">Fricativas (/f, s, j/)</option>
            <option value="vowel_onsets">Inicios Vocálicos (/a, e, i, o, u/)</option>
            <option value="balanced">Equilibrado General</option>
          </select>
        </div>

        {currentExercise && (
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <p className="text-sm font-semibold text-zinc-100 italic">
              &ldquo;{currentExercise.text}&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
              <span>Densidad Fonética: <strong className="text-emerald-400">{currentExercise.phoneticAnalysis.targetDensity}%</strong></span>
              <span>•</span>
              <span>Dificultad: <strong className="text-cyan-400">{currentExercise.phoneticAnalysis.difficultyScore}/100</strong></span>
              <span>•</span>
              <span>BPM Sugerido: <strong className="text-zinc-200">{currentExercise.phoneticAnalysis.recommendedBpm}</strong></span>
            </div>
            <p className="text-xs text-emerald-400/90 pt-1">
              💡 {currentExercise.tips}
            </p>
          </div>
        )}
      </div>

      {/* 5. Simulación de Tensión para Modo Espejo */}
      {mode === 'mirroring' && (
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Nivel de Tensión Prefonatoria:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTensionLevel('low')}
              className={`px-2 py-1 rounded-md text-[11px] ${
                tensionLevel === 'low'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Baja (Verde)
            </button>
            <button
              onClick={() => setTensionLevel('medium')}
              className={`px-2 py-1 rounded-md text-[11px] ${
                tensionLevel === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Media (Ámbar)
            </button>
            <button
              onClick={() => setTensionLevel('high')}
              className={`px-2 py-1 rounded-md text-[11px] ${
                tensionLevel === 'high'
                  ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Alerta (Roja)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
