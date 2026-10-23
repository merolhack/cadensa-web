'use client';

import React from 'react';
import { evaluateUserBadges, getUserLevelTitle } from '@/lib/streaks';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  totalMinutes: number;
  xpPoints: number;
  accuracy: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isOpen,
  onClose,
  streakDays,
  totalMinutes,
  xpPoints,
  accuracy,
}) => {
  if (!isOpen) return null;

  const level = getUserLevelTitle(xpPoints);
  const badges = evaluateUserBadges(streakDays, totalMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Panel de Progreso y Fluidez
            </h2>
            <p className="text-xs text-zinc-400">
              Nivel actual: <span className="font-semibold text-emerald-400">{level}</span> ({xpPoints} XP)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl bg-zinc-800/60 cursor-pointer"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
            <span className="text-2xl">🔥</span>
            <div className="text-xl font-black text-zinc-100">{streakDays}</div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400">Días Racha</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
            <span className="text-2xl">⏱️</span>
            <div className="text-xl font-black text-zinc-100">{totalMinutes}</div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400">Minutos</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
            <span className="text-2xl">🎯</span>
            <div className="text-xl font-black text-emerald-400">{accuracy}%</div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400">Precisión</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
            <span className="text-2xl">⚡</span>
            <div className="text-xl font-black text-cyan-400">{xpPoints}</div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400">Puntos XP</div>
          </div>
        </div>

        {/* Insignias Clínicas de Hábitos */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-200">Insignias y Logros Terapéuticos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  badge.unlocked
                    ? 'bg-zinc-950/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-950/30 border-zinc-800/60 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  {badge.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    {badge.title}
                    {badge.unlocked && <span className="text-emerald-400 text-[10px]">✓</span>}
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-tight">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consejo Terapéutico y Exportación */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
          💡 <strong>Recordatorio Clínico:</strong> Mantener una cadencia constante de 5 minutos al día reconfigura los circuitos de temporización del habla en el cerebro, brindándote mayor confianza en situaciones cotidianas.
        </div>

        {/* Exportación para Fonoaudiólogos / Terapeutas */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <span className="text-xs text-zinc-400">
            Exporta tu progreso para compartirlo con tu terapeuta del lenguaje.
          </span>
          <button
            onClick={() => {
              const summaryText = `=== INFORME CLÍNICO CADENSA ===\nFecha: ${new Date().toLocaleDateString('es-ES')}\nRacha: ${streakDays} días\nMinutos: ${totalMinutes} min\nPrecisión Rítmica: ${accuracy}%\nXP: ${xpPoints}\nNivel: ${level}\n================================`;
              navigator.clipboard?.writeText(summaryText);
              alert('¡Resumen clínico copiado al portapapeles!');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            📋 Copiar Informe para Terapeuta
          </button>
        </div>
      </div>
    </div>
  );
};
