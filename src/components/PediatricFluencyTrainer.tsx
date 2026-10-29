'use client';

import React, { useState } from 'react';
import {
  PEDIATRIC_AVATARS,
  PEDIATRIC_CHALLENGES,
  calculatePediatricReward,
} from '../lib/pediatricFluency';

export function PediatricFluencyTrainer() {
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<'tortuga' | 'castor' | 'colibri'>('tortuga');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [totalStars, setTotalStars] = useState(12);
  const [sessionReward, setSessionReward] = useState<{ stars: number; cheerMessage: string } | null>(null);

  const avatar = PEDIATRIC_AVATARS[selectedAvatarKey];
  const challenge = PEDIATRIC_CHALLENGES[challengeIndex];
  const syllables = challenge.phrase.split(' ');

  const handleSimulatePractice = () => {
    const reward = calculatePediatricReward(92);
    setSessionReward(reward);
    setTotalStars((prev) => prev + reward.stars);
  };

  const handleNextChallenge = () => {
    setSessionReward(null);
    setChallengeIndex((prev) => (prev + 1) % PEDIATRIC_CHALLENGES.length);
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-950 to-purple-950/70 border border-purple-500/30 p-6 shadow-2xl space-y-5 text-zinc-100">
      {/* Encabezado Infantil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs mb-1">
            <span>✨ Cadensa Kids • Fluidez y Diversión</span>
          </div>
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 flex items-center gap-2">
            <span>Aventura del Habla Suave</span>
          </h3>
          <p className="text-xs text-zinc-300 mt-0.5">
            Entrenamiento lúdico para niños: ritmo sin prisa y sin apretar la garganta.
          </p>
        </div>

        {/* Marcador de Estrellas Ganadas */}
        <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-amber-400/40 shadow-inner">
          <span className="text-2xl">⭐</span>
          <div>
            <span className="text-[10px] text-zinc-400 block font-bold uppercase">Estrellas</span>
            <span className="text-lg font-black text-amber-300">{totalStars}</span>
          </div>
        </div>
      </div>

      {/* Selector de Amigos / Avatares */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-purple-200 block">Elige a tu compañero de aventura:</span>
        <div className="grid grid-cols-3 gap-2.5">
          {(Object.keys(PEDIATRIC_AVATARS) as Array<'tortuga' | 'castor' | 'colibri'>).map((key) => {
            const av = PEDIATRIC_AVATARS[key];
            const isSelected = selectedAvatarKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedAvatarKey(key);
                  setSessionReward(null);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer transform hover:scale-102 ${
                  isSelected
                    ? 'bg-purple-900/50 border-amber-400 text-amber-200 shadow-lg shadow-purple-500/20'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-3xl mb-1">{av.icon}</div>
                <div className="font-bold text-xs text-zinc-100">{av.name}</div>
                <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">{av.recommendedBpm} BPM</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-purple-200 italic bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/40">
          💡 <strong>Consejo de {avatar.name}:</strong> &quot;{avatar.motto}&quot;
        </p>
      </div>

      {/* Tarjeta del Desafío Infantil */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-4">
        <span className="text-xs font-semibold text-zinc-400 block">{challenge.funContext}</span>

        {/* Sílabas estilo bloques infantiles */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          {syllables.map((syl, idx) => (
            <div
              key={idx}
              className="px-4 py-3 rounded-2xl bg-gradient-to-t from-zinc-800 to-zinc-700 border border-zinc-600/80 text-amber-300 font-extrabold text-lg sm:text-xl font-mono shadow-md uppercase tracking-wider"
            >
              {syl}
            </div>
          ))}
        </div>

        {/* Acciones de práctica */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSimulatePractice}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 hover:from-amber-300 hover:to-purple-400 text-zinc-950 font-black text-sm shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            🎮 ¡Pronunciar como {avatar.name}!
          </button>
          <button
            type="button"
            onClick={handleNextChallenge}
            className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition cursor-pointer"
          >
            Siguiente Cuento ➡️
          </button>
        </div>
      </div>

      {/* Celebración de Recompensa */}
      {sessionReward && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-400/50 text-center space-y-2 animate-in fade-in duration-200">
          <div className="text-3xl">{'⭐'.repeat(sessionReward.stars)}</div>
          <h4 className="text-base font-extrabold text-amber-300">{sessionReward.cheerMessage}</h4>
          <span className="text-xs text-amber-200/80 block">
            ¡Ganaste +{sessionReward.stars} estrellas para tu cofre mágico!
          </span>
        </div>
      )}
    </div>
  );
}
