'use client';

import React from 'react';
import { evaluateUserBadges, getUserLevelTitle } from '@/lib/streaks';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  xpPoints: number;
  totalMinutes: number;
  onStartChallenge?: () => void;
  onStartDailyChallenge?: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  xpPoints,
  totalMinutes,
  onStartChallenge,
  onStartDailyChallenge,
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    onClose();
    if (onStartDailyChallenge) {
      onStartDailyChallenge();
    } else if (onStartChallenge) {
      onStartChallenge();
    }
  };

  const levelTitle = getUserLevelTitle(xpPoints);
  const badges = evaluateUserBadges(streakDays, totalMinutes);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-challenge-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm transition-colors cursor-pointer"
          aria-label="Cerrar Reto Diario"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-1">
            <span>🔥</span>
            <span>Reto Diario de Fluidez</span>
          </div>
          <h2 id="daily-challenge-title" className="text-xl sm:text-2xl font-black text-zinc-100">
            Tu Progreso de Hoy
          </h2>
          <p className="text-xs text-zinc-400">
            La constancia diaria reconfigura los circuitos motores del habla y reduce los bloqueos.
          </p>
        </div>

        {/* Tarjeta de Racha y Nivel */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Racha Activa</span>
            <div className="flex items-center gap-1.5 text-xl font-black text-amber-400">
              <span>🔥</span>
              <span>{streakDays} {streakDays === 1 ? 'día' : 'días'}</span>
            </div>
            <span className="text-[10px] text-zinc-500">Práctica consecutiva</span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Nivel Clínico</span>
            <div className="text-sm font-bold text-cyan-300 truncate">
              {levelTitle}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">⭐ {xpPoints} XP</span>
          </div>
        </div>

        {/* Misión del Día */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🎯</span>
              <span>Misión de Hoy</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              +25 XP
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-100">
              Micro-Sesión Rítmica (60 segundos)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Completa 60 segundos de Habla Rítmica Silábica (STS) a 85 BPM para mantener tu racha activa y el ritmo basal.
            </p>
          </div>
        </div>

        {/* Insignias Desbloqueadas */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            Insignias y Logros Clínicos
          </span>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                  b.unlocked
                    ? 'bg-zinc-800/80 border-emerald-500/40 text-zinc-200'
                    : 'bg-zinc-950/40 border-zinc-800/40 text-zinc-500 opacity-60'
                }`}
              >
                <span className="text-lg">{b.icon}</span>
                <div className="overflow-hidden">
                  <div className="font-bold truncate text-[11px]">{b.title}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{b.unlocked ? 'Desbloqueado' : 'Pendiente'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Aceptar Reto y Empezar (60s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
