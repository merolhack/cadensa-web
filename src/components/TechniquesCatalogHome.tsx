'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CLINICAL_TECHNIQUES,
  ClinicalTechnique,
  TECHNIQUE_FAMILIES,
  TechniqueFamilyId,
} from '@/lib/clinicalTechniques';
import { CommunityBanner } from './CommunityBanner';
import { PwaInstallButton } from './PwaInstallButton';

interface TechniquesCatalogHomeProps {
  onSelectTechnique: (technique: ClinicalTechnique) => void;
  onOpenVideoModal: (technique: ClinicalTechnique) => void;
  onOpenSimulator?: () => void;
  onOpenQuickRoutine?: () => void;
  onOpenDDK?: () => void;
  streakDays: number;
  totalMinutes: number;
  xpPoints: number;
  currentUserEmail: string | null;
  onOpenAuthModal: () => void;
  onOpenDashboard: () => void;
}

export const TechniquesCatalogHome: React.FC<TechniquesCatalogHomeProps> = ({
  onSelectTechnique,
  onOpenVideoModal,
  onOpenSimulator,
  onOpenQuickRoutine,
  onOpenDDK,
  streakDays,
  totalMinutes,
  xpPoints,
  currentUserEmail,
  onOpenAuthModal,
  onOpenDashboard,
}) => {
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<TechniqueFamilyId | 'todas'>('todas');

  const techniquesList = Object.values(CLINICAL_TECHNIQUES);

  const filteredTechniques = selectedFamilyFilter === 'todas'
    ? techniquesList
    : techniquesList.filter((tech) => tech.familyId === selectedFamilyFilter);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* 1. Barra de Navegación Superior */}
      <header className="max-w-5xl w-full flex items-center justify-between py-2 sm:py-3 border-b border-zinc-900 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Cadensa
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            v0.4.0
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Métricas rápidas */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <span className="text-amber-400 font-bold">🔥 {streakDays}d</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-400 font-bold">⭐ {xpPoints} XP</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-bold">⏱️ {totalMinutes}m</span>
          </div>

          {/* Botón PWA Instalable */}
          <PwaInstallButton />

          {/* Enlace a Acerca de */}
          <Link
            href="/about"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Conoce el propósito del sitio, futuros pasos y autor"
          >
            <span>ℹ️</span>
            <span>Acerca de</span>
          </Link>

          {/* Enlace a Estadísticas Globales */}
          <Link
            href="/stats"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Ver estadísticas globales y telemetría"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Estadísticas</span>
          </Link>

          {/* Botón de Acceso / Perfil */}
          {currentUserEmail ? (
            <button
              onClick={onOpenDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[120px] truncate">{currentUserEmail.split('@')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>👤</span>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Sección Hero Principal */}
      <section className="max-w-4xl w-full text-center space-y-4 my-2 sm:my-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Gimnasio Digital de Fluidez del Habla</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Prueba de Concepto - Infraestructura Base</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight sm:leading-snug">
          Encuentra el ritmo de tu voz y{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            desactiva los bloqueos
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Cadensa reúne las 7 técnicas fonoaudiológicas con mayor respaldo clínico para la tartamudez y desregulación motriz. Elige la técnica adecuada para tu tipo de desafío o inicia tu entrenamiento guiado.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onSelectTechnique(CLINICAL_TECHNIQUES.sts)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:scale-102 cursor-pointer flex items-center gap-2"
          >
            <span>⚡</span>
            <span>Comenzar Práctica Guiada Directa</span>
          </button>

          {onOpenQuickRoutine && (
            <button
              onClick={onOpenQuickRoutine}
              className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⏱️</span>
              <span>Rutina 5 Min</span>
            </button>
          )}

          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🎭</span>
              <span>Simulador Real</span>
            </button>
          )}

          {onOpenDDK && (
            <button
              onClick={onOpenDDK}
              className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Prueba DDK</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Filtros por Familia Terapéutica */}
      <section className="max-w-5xl w-full my-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <span>📚</span>
              <span>Catálogo de Técnicas Clínicas</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Explora cada método, visualiza su video explicativo y entra directamente a su estación de práctica.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedFamilyFilter('todas')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedFamilyFilter === 'todas'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Todas (7)
            </button>
            {TECHNIQUE_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamilyFilter(fam.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFamilyFilter === fam.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{fam.icon}</span>
                <span>{fam.shortName} ({fam.techniques.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Parrilla de Tarjetas de Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechniques.map((technique) => {
            const family = TECHNIQUE_FAMILIES.find((f) => f.id === technique.familyId);

            return (
              <article
                key={technique.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between space-y-4"
              >
                {/* Cabecera de la tarjeta */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
                      {technique.icon}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider">
                        {technique.badge}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {technique.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-500 font-semibold block">
                      {family?.name}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                      {technique.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {technique.summary}
                  </p>

                  {/* Thumbnail de Video (si está disponible para la técnica) */}
                  {technique.thumbnailUrl && (
                    <div
                      onClick={() => onOpenVideoModal(technique)}
                      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 group cursor-pointer shadow-md"
                      title={`Reproducir video de ${technique.name}`}
                    >
                      <Image
                        src={technique.thumbnailUrl}
                        alt={`Portada de ${technique.name}`}
                        width={640}
                        height={360}
                        unoptimized
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-base font-black pl-0.5">▶</span>
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-zinc-950/85 text-[10px] font-mono text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                        🎬 Video HD
                      </span>
                    </div>
                  )}

                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-900 text-[11px] text-zinc-400">
                    <strong className="text-emerald-400">Objetivo: </strong>
                    {technique.exerciseGoal}
                  </div>
                </div>

                {/* Botones de Acción de la Tarjeta */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/tecnicas/${technique.id}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title={`Leer guía clínica completa de ${technique.name}`}
                  >
                    <span>📖</span>
                    <span>Guía</span>
                  </Link>

                  <button
                    onClick={() => onOpenVideoModal(technique)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title={`Ver video explicativo de ${technique.shortName}`}
                  >
                    <span>🎥</span>
                    <span>Ver Video</span>
                  </button>

                  <button
                    onClick={() => onSelectTechnique(technique)}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Entrenar</span>
                    <span>→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. Sección de Metodología y AMTTM */}
      <section className="max-w-4xl w-full my-6 p-5 sm:p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 text-left">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span>🧠</span>
          <span>¿Por qué Cadensa se enfoca en sesiones de 3 a 5 minutos diarios?</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          La evidencia clínica demuestra que la neuroplasticidad del habla no se adquiere en sesiones largas y esporádicas, sino en la micro-práctica diaria y consistente. Cadensa elimina el cansancio motor y ayuda a reprogramar los circuitos del habla a tu propio ritmo.
        </p>
      </section>

      {/* 6. Banner Oficial AMTTM */}
      <div className="max-w-4xl w-full my-2">
        <CommunityBanner />
      </div>

      {/* 7. Footer */}
      <footer className="max-w-5xl w-full pt-6 pb-2 border-t border-zinc-900 text-center text-xs text-zinc-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-zinc-400">
          <Link
            href="/about"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>ℹ️</span>
            <span>Acerca de Cadensa</span>
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/stats"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>📊</span>
            <span>Estadísticas de Uso</span>
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/privacy"
            className="hover:text-emerald-400 transition-colors font-medium"
          >
            Privacidad
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/terms"
            className="hover:text-emerald-400 transition-colors font-medium"
          >
            Términos y Aviso Clínico
          </Link>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://www.facebook.com/AMTTM/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Asociación Mexicana de la Tartamudez (Facebook)
          </a>
        </div>
        <p>© 2026 Cadensa — Plataforma de Fluidez del Habla. Diseñado con enfoque en fonoaudiología clínica y accesibilidad.</p>
      </footer>
    </div>
  );
};
