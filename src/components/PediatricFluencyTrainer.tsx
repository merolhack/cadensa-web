'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PEDIATRIC_AVATARS,
  PEDIATRIC_CHALLENGES,
  calculatePediatricReward,
  playKidsSyllableTone,
  playKidsFanfare,
  playKidsApplauseSound,
} from '../lib/pediatricFluency';

export function PediatricFluencyTrainer() {
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<'tortuga' | 'castor' | 'colibri'>('tortuga');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [totalStars, setTotalStars] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState<number>(-1);
  const [sessionReward, setSessionReward] = useState<{ stars: number; cheerMessage: string } | null>(null);
  const [isDuoMode, setIsDuoMode] = useState(false);
  const [duoSparkle, setDuoSparkle] = useState<string | null>(null);

  const handleTriggerApplause = useCallback(() => {
    playKidsApplauseSound();
    setTotalStars((prev) => prev + 1);
    setDuoSparkle('👏 ¡Bravo! +1 Estrella de acompañamiento');
    setTimeout(() => {
      setDuoSparkle(null);
    }, 2000);
  }, []);

  const avatar = PEDIATRIC_AVATARS[selectedAvatarKey];
  const challenge = PEDIATRIC_CHALLENGES[challengeIndex];
  const syllables = challenge.phrase.split(' ');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPractice = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleNextChallenge = useCallback(() => {
    stopPractice();
    setActiveSyllableIndex(-1);
    setSessionReward(null);
    setChallengeIndex((prev) => (prev + 1) % PEDIATRIC_CHALLENGES.length);
  }, [stopPractice]);

  const handlePrevChallenge = useCallback(() => {
    stopPractice();
    setActiveSyllableIndex(-1);
    setSessionReward(null);
    setChallengeIndex((prev) => (prev - 1 + PEDIATRIC_CHALLENGES.length) % PEDIATRIC_CHALLENGES.length);
  }, [stopPractice]);

  const handleStartPractice = useCallback(() => {
    stopPractice();
    setSessionReward(null);
    setActiveSyllableIndex(0);
    setIsPlaying(true);

    // Calcular intervalo por sílaba a partir del BPM del avatar (ej. 60 BPM = 1000ms)
    const intervalMs = Math.round((60 / avatar.recommendedBpm) * 1000);

    // Reproducir primer sonido
    playKidsSyllableTone(0);

    let currentIndex = 0;
    timerRef.current = setInterval(() => {
      currentIndex += 1;
      if (currentIndex < syllables.length) {
        setActiveSyllableIndex(currentIndex);
        playKidsSyllableTone(currentIndex);
      } else {
        // Fin de la frase completa
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsPlaying(false);
        setActiveSyllableIndex(syllables.length);
        playKidsFanfare();
        const reward = calculatePediatricReward(95);
        setSessionReward(reward);
        setTotalStars((prev) => prev + reward.stars);
      }
    }, intervalMs);
  }, [avatar.recommendedBpm, stopPractice, syllables.length]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const progressPercent = activeSyllableIndex <= 0
    ? 0
    : Math.min(100, Math.round((activeSyllableIndex / syllables.length) * 100));

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-950 to-purple-950/70 border border-purple-500/30 p-6 shadow-2xl space-y-6 text-zinc-100">
      {/* Encabezado Infantil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs mb-1">
            <span>✨ Cadensa Kids • Fluidez y Diversión</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 flex items-center gap-2">
            <span>Aventura del Habla Suave</span>
          </h3>
          <p className="text-xs text-zinc-300 mt-0.5">
            Entrenamiento lúdico interactivo para niños: ritmo sin prisa y sin apretar la garganta.
          </p>
        </div>

        {/* Marcador de Estrellas Ganadas y Conmutador de Modo Dúo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDuoMode((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isDuoMode
                ? 'bg-pink-900/60 border-pink-400 text-pink-200 shadow-md shadow-pink-500/20'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Activar acompañamiento conjunto padre/madre o terapeuta"
          >
            <span>👥</span>
            <span>Modo Dúo</span>
            <span className={`w-2 h-2 rounded-full ${isDuoMode ? 'bg-pink-400 animate-ping' : 'bg-zinc-600'}`} />
          </button>

          <div className="flex items-center gap-2.5 bg-zinc-900/90 px-4 py-2 rounded-2xl border border-amber-400/50 shadow-inner">
            <span className="text-2xl animate-bounce">⭐</span>
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Cofre de Estrellas</span>
              <span className="text-lg font-black text-amber-300">{totalStars}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Amigos / Avatares */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-200">Elige a tu compañero de aventura:</span>
          <span className="text-[11px] text-zinc-400 font-medium">Tempo adaptado al ritmo infantil</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {(Object.keys(PEDIATRIC_AVATARS) as Array<'tortuga' | 'castor' | 'colibri'>).map((key) => {
            const av = PEDIATRIC_AVATARS[key];
            const isSelected = selectedAvatarKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  stopPractice();
                  setSelectedAvatarKey(key);
                  setSessionReward(null);
                  setActiveSyllableIndex(-1);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer transform hover:scale-102 ${
                  isSelected
                    ? 'bg-purple-900/60 border-amber-400 text-amber-200 shadow-lg shadow-purple-500/25 ring-2 ring-amber-400/30'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="text-3xl mb-1">{av.icon}</div>
                <div className="font-bold text-xs text-zinc-100">{av.name}</div>
                <div className="text-[10px] text-amber-300/90 font-mono font-semibold mt-0.5">{av.recommendedBpm} BPM</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-purple-200 italic bg-purple-950/50 p-3 rounded-xl border border-purple-800/40 flex items-center gap-2">
          <span className="text-base">💡</span>
          <span><strong>Consejo de {avatar.name}:</strong> &quot;{avatar.motto}&quot;</span>
        </p>
      </div>

      {/* Tarjeta del Desafío Infantil */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-purple-500/20 text-center space-y-5">
        {/* Encabezado y Navegador de Cuentos */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <button
            type="button"
            onClick={handlePrevChallenge}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
            title="Cuento anterior"
          >
            ◀ Anterior
          </button>
          <div>
            <span className="text-xs font-black text-amber-300 block">{challenge.funContext}</span>
            <span className="text-[10px] text-zinc-400 font-semibold">
              Cuento {challengeIndex + 1} de {PEDIATRIC_CHALLENGES.length} • {challenge.syllablesCount} sílabas
            </span>
          </div>
          <button
            type="button"
            onClick={handleNextChallenge}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
            title="Siguiente cuento"
          >
            Siguiente ▶
          </button>
        </div>

        {/* Camino de la Aventura (Barra de progreso lúdica) */}
        <div className="relative w-full bg-zinc-950/80 h-6 rounded-full border border-zinc-800 p-0.5 overflow-hidden flex items-center">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-black pointer-events-none">
            <span className="flex items-center gap-1">
              <span>{avatar.icon}</span>
              <span className="text-[10px] text-zinc-300 hidden sm:inline">Camino del ritmo</span>
            </span>
            <span className="text-lg">{challenge.goalEmoji}</span>
          </div>
        </div>

        {/* Sílabas animadas en tiempo real */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 py-4 min-h-[110px]">
          {syllables.map((syl, idx) => {
            const isActive = activeSyllableIndex === idx;
            const isCompleted = activeSyllableIndex > idx;

            return (
              <div
                key={`${challenge.id}-${idx}`}
                onClick={() => {
                  playKidsSyllableTone(idx);
                  setActiveSyllableIndex(idx);
                }}
                className={`relative px-4 py-3.5 rounded-2xl font-extrabold text-lg sm:text-xl font-mono shadow-md uppercase tracking-wider transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'scale-125 z-20 bg-gradient-to-t from-amber-400 to-amber-200 text-zinc-950 ring-4 ring-amber-300 shadow-2xl shadow-amber-400/50 -translate-y-1'
                    : isCompleted
                    ? 'bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 scale-98'
                    : 'bg-zinc-800/90 border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {/* Ícono flotante del avatar en la sílaba activa */}
                {isActive && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    {avatar.icon}
                  </span>
                )}
                {/* Marca de completado */}
                {isCompleted && (
                  <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-zinc-950 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
                <span>{syl}</span>
              </div>
            );
          })}
        </div>

        {/* Botones de acción infantil */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartPractice}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 hover:from-amber-300 hover:to-purple-400 text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-purple-900/40 transition transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>🎮</span>
              <span>¡Pronunciar como {avatar.name}!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopPractice}
              className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm sm:text-base shadow-xl transition transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>⏸️</span>
              <span>Pausar Aventura</span>
            </button>
          )}

          {/* Botón exclusivo de Modo Dúo (Padre / Terapeuta) */}
          {isDuoMode && (
            <button
              type="button"
              onClick={handleTriggerApplause}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-900/30 transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>👏</span>
              <span>¡Aplauso Motivador! (+1 ⭐)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNextChallenge}
            className="px-5 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm border border-zinc-700 transition cursor-pointer flex items-center gap-2"
          >
            <span>Siguiente Cuento</span>
            <span>➡️</span>
          </button>
        </div>

        {/* Notificación de Chispa en Modo Dúo */}
        {duoSparkle && (
          <div className="text-xs font-bold text-pink-300 bg-pink-950/60 border border-pink-500/40 py-2 px-4 rounded-xl animate-bounce mx-auto max-w-xs">
            {duoSparkle}
          </div>
        )}
      </div>

      {/* Celebración de Recompensa con estrellas y fanfarria */}
      {sessionReward && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-purple-950/70 to-pink-950/70 border border-amber-400/60 text-center space-y-2.5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
          <div className="text-4xl animate-pulse">{'⭐'.repeat(sessionReward.stars)}</div>
          <h4 className="text-lg font-black text-amber-300">{sessionReward.cheerMessage}</h4>
          <span className="text-xs text-amber-200/90 font-medium block">
            ¡Ganaste +{sessionReward.stars} estrellas para tu cofre mágico! 🏆
          </span>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNextChallenge}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs transition cursor-pointer"
            >
              ¡Jugar el siguiente cuento! 🌟
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
