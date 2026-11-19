'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CLINICAL_TECHNIQUES,
  ClinicalTechnique,
  TECHNIQUE_FAMILIES,
  TechniqueFamilyId,
  getSlugByTechniqueId,
} from '@/lib/clinicalTechniques';
import { PwaInstallButton } from './PwaInstallButton';
import { Footer } from './Footer';
import { Disclosure, Collapsible } from './ui';
import { FluencyPath, FluencyLevel } from './FluencyPath';

interface TechniquesCatalogHomeProps {
  onSelectTechnique: (technique: ClinicalTechnique) => void;
  onOpenVideoModal: (technique: ClinicalTechnique) => void;
  onOpenSimulator?: () => void;
  onOpenQuickRoutine?: () => void;
  onOpenDDK?: () => void;
  onOpenFormants?: () => void;
  onOpenTelehealth?: () => void;
  onOpenKids?: () => void;
  onOpenDAF?: () => void;
  onOpenCertificates?: () => void;
  onOpenAcousticAi?: () => void;
  onOpenAvatar?: () => void;
  onOpenCustomPhrases?: () => void;
  onOpenQuickStart?: () => void;
  onOpenDailyChallenge?: () => void;
  onStartFluencyLevel?: (level: FluencyLevel, technique: ClinicalTechnique) => void;
  streakDays: number;
  totalMinutes: number;
  xpPoints: number;
  currentUserEmail: string | null;
  onOpenAuthModal: () => void;
  onOpenDashboard: () => void;
  onLogout?: () => void;
}

export const TechniquesCatalogHome: React.FC<TechniquesCatalogHomeProps> = ({
  onSelectTechnique,
  onOpenVideoModal,
  onOpenSimulator,
  onOpenQuickRoutine,
  onOpenDDK,
  onOpenFormants,
  onOpenTelehealth,
  onOpenKids,
  onOpenDAF,
  onOpenCertificates,
  onOpenAcousticAi,
  onOpenAvatar,
  onOpenCustomPhrases,
  onOpenQuickStart,
  onOpenDailyChallenge,
  onStartFluencyLevel,
  streakDays,
  totalMinutes,
  xpPoints,
  currentUserEmail,
  onOpenAuthModal,
  onOpenDashboard,
  onLogout,
}) => {
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<TechniqueFamilyId | 'todas'>('todas');
  const [isLabOpen, setIsLabOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'achievements' | 'clinical'>('learn');
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleLevelStart = (level: FluencyLevel, technique: ClinicalTechnique) => {
    if (onStartFluencyLevel) {
      onStartFluencyLevel(level, technique);
    } else {
      onSelectTechnique(technique);
    }
  };

  const techniquesList = Object.values(CLINICAL_TECHNIQUES);

  const filteredTechniques = selectedFamilyFilter === 'todas'
    ? techniquesList
    : techniquesList.filter((tech) => tech.familyId === selectedFamilyFilter);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950"
      suppressHydrationWarning
    >
      {/* 1. Barra de Navegación Superior */}
      <header className="max-w-5xl w-full flex items-center justify-between py-2 sm:py-3 border-b border-zinc-900 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Cadensa
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            v2.5.0
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Métricas rápidas / Acceso a Reto Diario */}
          <button
            onClick={onOpenDailyChallenge}
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-xs transition-all cursor-pointer"
            title="Ver reto diario, racha e insignias de fluidez"
            aria-label="Ver Reto Diario y Logros"
            suppressHydrationWarning
          >
            <span className="text-amber-400 font-bold" suppressHydrationWarning>🔥 {streakDays}d</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-400 font-bold" suppressHydrationWarning>⭐ {xpPoints} XP</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-bold" suppressHydrationWarning>⏱️ {totalMinutes}m</span>
          </button>

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

          {/* Botón de Acceso / Perfil y Cerrar Sesión */}
          {mounted && currentUserEmail ? (
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs" suppressHydrationWarning>
              <button
                onClick={onOpenDashboard}
                className="text-emerald-300 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                title="Ver Dashboard"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[100px] truncate">{currentUserEmail.split('@')[0]}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-zinc-400 hover:text-red-400 transition-colors ml-1 cursor-pointer font-semibold"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  ⎋ Salir
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              suppressHydrationWarning
            >
              <span>👤</span>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Barra de Pestañas Estilo Duolingo (Ruta / Práctica / Logros / Modo Clínico) */}
      <nav
        aria-label="Pestañas Principales de Cadensa"
        className="w-full max-w-xl mx-auto flex items-center justify-between p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-6 shadow-xl sticky top-2 z-30 backdrop-blur-md"
      >
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'learn'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          aria-pressed={activeTab === 'learn'}
          id="tab-learn"
        >
          <span>🗺️</span>
          <span>Ruta</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          aria-pressed={activeTab === 'practice'}
          id="tab-practice"
        >
          <span>⚡</span>
          <span>Práctica</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          aria-pressed={activeTab === 'achievements'}
          id="tab-achievements"
        >
          <span>🏆</span>
          <span>Logros</span>
        </button>

        <button
          onClick={() => setActiveTab('clinical')}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'clinical'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          aria-pressed={activeTab === 'clinical'}
          aria-label="Laboratorio y Herramientas Clínicas"
          id="tab-clinical"
        >
          <span>🧰</span>
          <span>Laboratorio y Herramientas Clínicas</span>
        </button>
      </nav>

      {/* PESTAÑA 1: RUTA DE FLUIDEZ (DUOLINGO LEARNING PATH) */}
      <div
        role="tabpanel"
        aria-labelledby="tab-learn"
        className={activeTab === 'learn' ? 'w-full max-w-5xl flex flex-col items-center animate-fade-in' : 'hidden'}
      >
        <section className="w-full text-center space-y-4 my-2 sm:my-3">
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

          {/* Botón Principal Duolingo */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSelectTechnique(CLINICAL_TECHNIQUES.sts)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm sm:text-base shadow-[0_5px_0_rgb(6,95,70)] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Comenzar Práctica Guiada Directa</span>
            </button>
          </div>
        </section>

        {/* Árbol Interactivo de Niveles en Zigzag */}
        <FluencyPath
          onStartLesson={handleLevelStart}
          userXp={xpPoints}
        />
      </div>

      {/* PESTAÑA 2: GIMNASIO DE PRÁCTICA RÁPIDA Y RETOS */}
      <div
        role="tabpanel"
        aria-labelledby="tab-practice"
        className={activeTab === 'practice' ? 'w-full max-w-5xl flex flex-col items-center animate-fade-in space-y-6 my-4' : 'hidden'}
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-zinc-100 flex items-center justify-center gap-2">
            <span>⚡</span>
            <span>Gimnasio de Práctica Rápida</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Sesiones cortas de 1 a 5 minutos para calentar el ritmo vocal antes de una conversación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-stretch">
          {/* Tarjeta Práctica Rápida 60s */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 flex flex-col justify-between h-full hover:border-emerald-400 transition-all shadow-lg">
            <div className="flex-1 space-y-2 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-bold text-zinc-100">Práctica Rápida (60s)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Micro-sesión guiada de Habla Rítmica Silábica (STS) a 85 BPM con preparación diafragmática.</p>
            </div>
            {onOpenQuickStart && (
              <button
                onClick={onOpenQuickStart}
                className="mt-auto w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>Práctica Rápida (60s)</span>
              </button>
            )}
          </div>

          {/* Tarjeta Reto Diario */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-amber-500/30 flex flex-col justify-between h-full hover:border-amber-400 transition-all shadow-lg">
            <div className="flex-1 space-y-2 mb-4">
              <span className="text-2xl">🔥</span>
              <h3 className="text-lg font-bold text-zinc-100">Reto Diario</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Completa tu desafío del día para mantener tu racha activa y sumar +25 XP a tu nivel clínico.</p>
            </div>
            {onOpenDailyChallenge && (
              <button
                onClick={onOpenDailyChallenge}
                className="mt-auto w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔥</span>
                <span>Reto Diario</span>
              </button>
            )}
          </div>

          {/* Tarjeta Cadensa Kids */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-purple-500/30 flex flex-col justify-between h-full hover:border-purple-400 transition-all shadow-lg">
            <div className="flex-1 space-y-2 mb-4">
              <span className="text-2xl">✨</span>
              <h3 className="text-lg font-bold text-zinc-100">Cadensa Kids</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Módulo de fluidez pediátrica gamificada con personajes animales, marimba y cuentos interactivos.</p>
            </div>
            {onOpenKids && (
              <button
                onClick={onOpenKids}
                className="mt-auto w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✨</span>
                <span>Cadensa Kids</span>
              </button>
            )}
          </div>

          {/* Tarjeta Rutina 5 Minutos */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between h-full hover:border-cyan-500/40 transition-all shadow-lg">
            <div className="flex-1 space-y-2 mb-4">
              <span className="text-2xl">⏱️</span>
              <h3 className="text-lg font-bold text-zinc-100">Rutina Guiada (5 Min)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Secuencia paso a paso que combina respiración diafragmática, ritmo silábico y relajación vocal.</p>
            </div>
            {onOpenQuickRoutine && (
              <button
                onClick={onOpenQuickRoutine}
                className="mt-auto w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>⏱️</span>
                <span>Rutina 5 Min</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PESTAÑA 3: LOGROS, RACHAS Y MOTIVACIÓN */}
      <div
        role="tabpanel"
        aria-labelledby="tab-achievements"
        className={activeTab === 'achievements' ? 'w-full max-w-5xl flex flex-col items-center animate-fade-in space-y-6 my-4' : 'hidden'}
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-zinc-100 flex items-center justify-center gap-2">
            <span>🏆</span>
            <span>Tu Progreso y Logros</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Cada día de práctica transforma la memoria motora del habla.
          </p>
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center">
          <div className="space-y-1 py-2 sm:py-0">
            <span className="text-xs text-zinc-400">Racha Consecutiva</span>
            <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
              <span>🔥</span>
              <span>{streakDays} d</span>
            </div>
          </div>
          <div className="space-y-1 py-2 sm:py-0 sm:border-x border-zinc-800">
            <span className="text-xs text-zinc-400">Puntos Totales</span>
            <div className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-1">
              <span>⭐</span>
              <span>{xpPoints}</span>
            </div>
          </div>
          <div className="space-y-1 py-2 sm:py-0">
            <span className="text-xs text-zinc-400">Minutos Entrenados</span>
            <div className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
              <span>⏱️</span>
              <span>{totalMinutes} m</span>
            </div>
          </div>
        </div>

        {/* Acciones de Certificados y Reportes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full items-stretch">
          {onOpenCertificates && (
            <button
              onClick={onOpenCertificates}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-left flex flex-col justify-between h-full transition-all cursor-pointer shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span>📜</span>
                  <span>Diplomas y Certificados de Mérito</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Imprime o descarga tus reconocimientos clínicos alcanzados por constancia y fluidez.
                </p>
              </div>
            </button>
          )}

          <Link
            href="/stats"
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-left flex flex-col justify-between h-full transition-all cursor-pointer shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <span>📊</span>
                <span>Telemetría Global y Estadísticas</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Consulta el rendimiento global de la plataforma, sesiones registradas y métricas SEO.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* PESTAÑA 4: MODO CLÍNICO Y LABORATORIO */}
      <div
        role="tabpanel"
        aria-labelledby="tab-clinical"
        className={activeTab === 'clinical' ? 'w-full max-w-5xl flex flex-col items-center animate-fade-in' : 'hidden'}
      >
        {/* Encabezado del Modo Clínico */}
        <div className="w-full text-center space-y-2 my-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span>🧰</span>
            <span>Modo Clínico Fonoaudiológico y Especializado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Laboratorio de Investigación y Catálogo Completo
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">
            Herramientas diagnósticas, análisis acústico on-device y el catálogo de las 7 técnicas fonoaudiológicas con fundamentación neurobiológica.
          </p>
        </div>

        {/* Panel Colapsable de Herramientas Clínicas Especializadas */}
        <div className="w-full text-left pt-2 pb-6">
          <Collapsible
            title="Laboratorio Clínico y Herramientas Especializadas"
            subtitle="Simuladores, pruebas diagnósticas, telesalud y biofeedback acústico"
            icon="🧪"
            badge={<span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">9 Módulos</span>}
            isOpen={isLabOpen}
            onToggle={setIsLabOpen}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 w-full">
              {onOpenSimulator && (
                <button
                  onClick={onOpenSimulator}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <span className="text-base">🎭</span>
                  <span>Simulador Real</span>
                </button>
              )}

              {onOpenDDK && (
                <button
                  onClick={onOpenDDK}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <span className="text-base">⚡</span>
                  <span>Prueba DDK</span>
                </button>
              )}

              {onOpenFormants && (
                <button
                  onClick={onOpenFormants}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <span className="text-base">📊</span>
                  <span>Formantes F1/F2</span>
                </button>
              )}

              {onOpenTelehealth && (
                <button
                  onClick={onOpenTelehealth}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/40 text-indigo-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <span className="text-base">📡</span>
                  <span>Telesalud P2P</span>
                </button>
              )}

              {onOpenDAF && (
                <button
                  onClick={onOpenDAF}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-teal-500/40 hover:border-teal-500/70 text-teal-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                  aria-label="Abrir Feedback Auditivo Alterado DAF y FAF"
                >
                  <span className="text-base">🎧</span>
                  <span>Feedback DAF/FAF</span>
                </button>
              )}

              {onOpenCertificates && (
                <button
                  onClick={onOpenCertificates}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                  aria-label="Abrir Diplomas de Mérito y Fluidez"
                >
                  <span className="text-base">🏆</span>
                  <span>Diplomas</span>
                </button>
              )}

              {onOpenAcousticAi && (
                <button
                  onClick={onOpenAcousticAi}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-cyan-500/40 hover:border-cyan-500/70 text-cyan-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                  aria-label="Abrir Biofeedback Acústico On-Device"
                >
                  <span className="text-base">🧠</span>
                  <span>IA Acústica</span>
                </button>
              )}

              {onOpenAvatar && (
                <button
                  onClick={onOpenAvatar}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                  aria-label="Abrir Agente Avatar de IA Fonoaudiológico"
                >
                  <span className="text-base">🤖</span>
                  <span>Avatar IA</span>
                </button>
              )}

              {onOpenCustomPhrases && (
                <button
                  onClick={onOpenCustomPhrases}
                  className="h-14 min-h-[56px] px-3.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-cyan-500/40 hover:border-cyan-500/70 text-cyan-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2.5"
                  aria-label="Abrir Entrenador de Frases Personalizadas con TTS"
                >
                  <span className="text-base">🎯</span>
                  <span>Frases Desafío (TTS)</span>
                </button>
              )}
            </div>
          </Collapsible>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch w-full">
          {filteredTechniques.map((technique) => {
            const family = TECHNIQUE_FAMILIES.find((f) => f.id === technique.familyId);

            return (
              <article
                key={technique.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-between h-full"
              >
                {/* Cabecera y cuerpo de la tarjeta */}
                <div className="flex-1 flex flex-col space-y-3.5">
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
                      <Link
                        href={`/techniques/${getSlugByTechniqueId(technique.id)}`}
                        className="hover:text-emerald-400 transition-colors"
                        title={`Ver página oficial de ${technique.name}`}
                      >
                        {technique.name}
                      </Link>
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {technique.summary}
                  </p>

                  {/* Thumbnail de Video (si está disponible para la técnica) */}
                  {technique.thumbnailUrl && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenVideoModal(technique)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenVideoModal(technique);
                        }
                      }}
                      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800/80 group cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      title={`Reproducir video de ${technique.name}`}
                      aria-label={`Reproducir video demostrativo de ${technique.name}`}
                    >
                      <Image
                        src={technique.thumbnailUrl}
                        alt={`Portada de ${technique.name}`}
                        width={640}
                        height={360}
                        unoptimized
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-base font-black pl-0.5" aria-hidden="true">▶</span>
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-zinc-950/85 text-[10px] font-mono text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                        🎬 Video HD
                      </span>
                    </div>
                  )}

                  {/* Divulgación progresiva del objetivo clínico y base científica */}
                  <Disclosure
                    summary="Fundamento Clínico y Objetivo"
                    icon="💡"
                    badge={technique.badge}
                    className="text-xs mt-auto pt-1"
                  >
                    <div className="space-y-1 pt-1 text-xs">
                      <p className="text-zinc-300">
                        <strong className="text-emerald-400">Objetivo: </strong>
                        {technique.exerciseGoal}
                      </p>
                      <p className="text-zinc-400">
                        <strong className="text-cyan-400">Neurobiología: </strong>
                        {technique.neurobiologicalBasis}
                      </p>
                    </div>
                  </Disclosure>
                </div>

                {/* Botones de Acción de la Tarjeta anclados al fondo */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 w-full">
                  <Link
                    href={`/techniques/${getSlugByTechniqueId(technique.id)}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title={`Leer guía clínica completa y ver video de ${technique.name}`}
                  >
                    <span>📖</span>
                    <span>Guía & Video</span>
                  </Link>

                  <button
                    onClick={() => onOpenVideoModal(technique)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title={`Ver video explicativo de ${technique.shortName}`}
                    aria-label={`Ver video explicativo de ${technique.shortName}`}
                  >
                    <span aria-hidden="true">🎥</span>
                    <span>Ver Video</span>
                  </button>

                  <button
                    onClick={() => onSelectTechnique(technique)}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1"
                    aria-label={`Comenzar a entrenar técnica ${technique.name}`}
                  >
                    <span>Entrenar</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. Sección de Metodología y AMTTM (Homogénea en max-w-5xl) */}
      <section className="max-w-5xl w-full my-6 p-5 sm:p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 text-left">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span>🧠</span>
          <span>¿Por qué Cadensa se enfoca en sesiones de 3 a 5 minutos diarios?</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          La evidencia clínica demuestra que la neuroplasticidad del habla no se adquiere en sesiones largas y esporádicas, sino en la micro-práctica diaria y consistente. Cadensa elimina el cansancio motor y ayuda a reprogramar los circuitos del habla a tu propio ritmo.
        </p>
      </section>
      </div>

      {/* 6. Footer Homogéneo Global con Banner AMTTM y Enlaces Fonoaudiológicos SEO (max-w-5xl) */}
      <Footer />
    </div>
  );
};
