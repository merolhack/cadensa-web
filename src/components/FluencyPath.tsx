'use client';

import React, { useState, useEffect } from 'react';
import { ClinicalTechnique, CLINICAL_TECHNIQUES, TechniqueId } from '@/lib/clinicalTechniques';

export interface FluencyLevel {
  id: number;
  title: string;
  subtitle: string;
  techniqueId: TechniqueId;
  phrase: string;
  bpm: number;
  xpReward: number;
  icon: string;
  isChest?: boolean;
}

export const FLUENCY_LEVELS: FluencyLevel[] = [
  {
    id: 1,
    title: 'Nivel 1: El Primer Compás',
    subtitle: 'Sincroniza cada sílaba con un ritmo suave y constante.',
    techniqueId: 'sts',
    phrase: 'Ca mi no des pa cio ca da ma ña na',
    bpm: 75,
    xpReward: 15,
    icon: '🎵',
  },
  {
    id: 2,
    title: 'Nivel 2: Respiración y Sonido',
    subtitle: 'Coordina la inhalación diafragmática con la emisión vocal.',
    techniqueId: 'box_breathing',
    phrase: 'El sol bri lla fuer te en el cie lo a zul',
    bpm: 80,
    xpReward: 20,
    icon: '🌬️',
  },
  {
    id: 3,
    title: 'Nivel 3: Inicios Vocales Suaves',
    subtitle: 'Aproxima las cuerdas vocales con aire continuo sin golpe glótico.',
    techniqueId: 'easy_onset',
    phrase: 'A ho ra em pie zo a ha blar con cal ma',
    bpm: 80,
    xpReward: 25,
    icon: '🌊',
  },
  {
    id: 4,
    title: 'Nivel 4: Cofre de la Constancia',
    subtitle: '¡Misión especial! Supera el desafío rítmico para ganar estrellas extras.',
    techniqueId: 'sts',
    phrase: 'Mi voz flu ye li bre fuer te y tran qui la',
    bpm: 85,
    xpReward: 50,
    icon: '🎁',
    isChest: true,
  },
  {
    id: 5,
    title: 'Nivel 5: Contacto Articular Ligero',
    subtitle: 'Reduce la presión excesiva en labios y lengua al articular consonantes.',
    techniqueId: 'light_contact',
    phrase: 'To co sua ve men te con la len gua y la bios',
    bpm: 85,
    xpReward: 30,
    icon: '🪶',
  },
  {
    id: 6,
    title: 'Nivel 6: Fluidez en el Día a Día',
    subtitle: 'Aplica el ritmo de habla en situaciones cotidianas simuladas.',
    techniqueId: 'prolonged_speech',
    phrase: 'Bue nos dí as qui sie ra un ca fé por fa vor',
    bpm: 90,
    xpReward: 35,
    icon: '☕',
  },
  {
    id: 7,
    title: 'Nivel 7: Maestría y Seguridad',
    subtitle: 'Modifica cualquier tensión en tiempo real con control autónomo.',
    techniqueId: 'pull_out',
    phrase: 'Pue do con tro lar mi voz cuan do lo de ci do',
    bpm: 90,
    xpReward: 45,
    icon: '👑',
  },
];

interface FluencyPathProps {
  onStartLesson: (level: FluencyLevel, technique: ClinicalTechnique) => void;
  userXp: number;
}

export const FluencyPath: React.FC<FluencyPathProps> = ({
  onStartLesson,
  userXp,
}) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<FluencyLevel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cadensa_fluency_level');
        if (stored) {
          setUnlockedLevel(Math.max(1, parseInt(stored, 10)));
        } else {
          // Si no hay nivel guardado pero tiene XP acumulados, calcular nivel proporcional
          const calculated = Math.min(7, Math.max(1, Math.floor(userXp / 60) + 1));
          setUnlockedLevel(calculated);
        }
      } catch {
        setUnlockedLevel(1);
      }
    }
  }, [userXp]);

  const handleSelectNode = (level: FluencyLevel) => {
    setSelectedLevel(level);
  };

  const handleLaunchLevel = (level: FluencyLevel) => {
    const tech = CLINICAL_TECHNIQUES[level.techniqueId] || CLINICAL_TECHNIQUES['sts'];
    onStartLesson(level, tech);
    setSelectedLevel(null);
  };

  // Posicionamiento horizontal en zigzag estilo Duolingo
  const getOffsetClass = (index: number) => {
    const pattern = [0, -32, 0, 32, 0, -28, 28];
    const offset = pattern[index % pattern.length];
    if (offset < 0) return `sm:-translate-x-8 -translate-x-4`;
    if (offset > 0) return `sm:translate-x-8 translate-x-4`;
    return 'translate-x-0';
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4 flex flex-col items-center">
      {/* Banner Motivacional de Nivel Activo */}
      <div className="w-full mb-8 p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/60 border border-emerald-500/30 text-center shadow-lg animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
          <span>🗺️</span>
          <span>Ruta de Fluidez Verbal</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-zinc-100">
          Nivel {unlockedLevel}: {FLUENCY_LEVELS[unlockedLevel - 1]?.title.split(': ')[1] || 'Práctica Guiada'}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Avanza lección por lección para reentrenar tu ritmo natural sin bloqueos.
        </p>
      </div>

      {/* Árbol de Nodos Conectados */}
      <div className="relative flex flex-col items-center gap-8 w-full">
        {FLUENCY_LEVELS.map((level, idx) => {
          const isCompleted = level.id < unlockedLevel;
          const isCurrent = level.id === unlockedLevel;
          const isLocked = level.id > unlockedLevel;
          const offsetClass = getOffsetClass(idx);

          return (
            <div
              key={level.id}
              className={`relative flex flex-col items-center transition-all ${offsetClass}`}
            >
              {/* Conector punteado con el nodo siguiente */}
              {idx < FLUENCY_LEVELS.length - 1 && (
                <div
                  className="absolute top-16 left-1/2 -translate-x-1/2 w-1 h-12 border-l-2 border-dashed border-emerald-500/20 -z-0"
                  aria-hidden="true"
                />
              )}

              {/* Indicador Flotante '¡CONTINÚA AQUÍ!' en el nodo actual */}
              {isCurrent && (
                <div className="absolute -top-9 z-20 animate-bounce">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 text-[11px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                    <span>👉</span>
                    <span>¡Toca Aquí!</span>
                  </div>
                </div>
              )}

              {/* Nodo Botón 3D Estilo Duolingo */}
              <button
                onClick={() => handleSelectNode(level)}
                disabled={isLocked}
                aria-label={`${level.title} - ${isCompleted ? 'Completado' : isCurrent ? 'En Curso' : 'Bloqueado'}`}
                className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 border-b-6 border-emerald-700 text-zinc-950 shadow-[0_0_30px_rgba(52,211,153,0.5)] transform scale-110 active:border-b-2 active:translate-y-1'
                    : isCompleted
                    ? 'bg-gradient-to-b from-teal-500 to-emerald-600 border-b-5 border-emerald-800 text-zinc-950 shadow-md hover:scale-105 active:border-b-2 active:translate-y-1'
                    : 'bg-zinc-800/80 border-b-4 border-zinc-900 text-zinc-500 opacity-60 cursor-not-allowed'
                }`}
              >
                <span className="text-2xl sm:text-3xl leading-none">
                  {isLocked ? '🔒' : level.icon}
                </span>

                {/* Estrellas de logro en nodos completados */}
                {isCompleted && (
                  <span className="text-[10px] text-amber-300 font-bold mt-1">
                    ⭐⭐⭐
                  </span>
                )}
              </button>

              {/* Título Breve Debajo del Nodo */}
              <span className={`text-xs font-bold mt-2 text-center max-w-[120px] ${
                isCurrent ? 'text-emerald-300 font-extrabold' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                {level.isChest ? '🎁 Cofre XP' : level.title.split(': ')[1]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal / Popover Emergente al Tocar un Nodo */}
      {selectedLevel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <button
              onClick={() => setSelectedLevel(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm cursor-pointer"
              aria-label="Cerrar detalle de lección"
            >
              ✕
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-3xl shadow-md">
              {selectedLevel.icon}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Lección Guiada • 2 Minutos
              </span>
              <h3 className="text-xl font-black text-zinc-100">
                {selectedLevel.title}
              </h3>
              <p className="text-xs text-zinc-400 px-2 leading-relaxed">
                {selectedLevel.subtitle}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-around text-xs font-medium">
              <div>
                <span className="text-zinc-500 block text-[10px]">Ritmo Recomendado</span>
                <span className="text-cyan-300 font-mono font-bold">{selectedLevel.bpm} BPM</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Recompensa</span>
                <span className="text-amber-400 font-bold">+{selectedLevel.xpReward} XP</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleLaunchLevel(selectedLevel)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm shadow-[0_4px_0_rgb(6,95,70)] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>{selectedLevel.id < unlockedLevel ? 'Repasar Lección (+5 XP)' : '¡Empezar Lección!'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
