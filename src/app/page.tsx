'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AudioMetronome } from '@/lib/audioMetronome';
import { flattenSentenceSyllables } from '@/lib/syllables';
import { evaluateRhythmicAccuracy, AccuracyResult, triggerHapticFeedback } from '@/lib/voiceDetection';
import { recordTrainingSession, evaluateDailyStreak } from '@/lib/trainingService';
import { calculateSessionXP } from '@/lib/streaks';
import { MetronomeVisual } from '@/components/MetronomeVisual';
import { SyllableReader } from '@/components/SyllableReader';
import { Dashboard } from '@/components/Dashboard';
import { AuthModal } from '@/components/AuthModal';
import { EXPANDED_CLINICAL_CATALOG, ClinicalCategory, getExercisesByCategory } from '@/lib/clinicalExercises';

const TRAINING_PHRASES = [
  'Ca mi no des pa cio ca da ma ña na',
  'Encuentra el ritmo de tu voz',
  'Cadensa es ritmo y tranquilidad',
  'Hablar con calma y seguridad es posible',
];

export default function Home() {
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory | 'todas'>('todas');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);

  // Estados de Usuario, Sesión y Modales con inicialización perezosa segura
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('cadensa_user_email') : null;
  });
  const [streakDays, setStreakDays] = useState<number>(() => {
    return typeof window !== 'undefined' ? Number(localStorage.getItem('cadensa_streak_days') || '1') : 1;
  });
  const [totalMinutes, setTotalMinutes] = useState<number>(() => {
    return typeof window !== 'undefined' ? Number(localStorage.getItem('cadensa_total_minutes') || '5') : 5;
  });
  const [xpPoints, setXpPoints] = useState<number>(() => {
    return typeof window !== 'undefined' ? Number(localStorage.getItem('cadensa_xp_points') || '125') : 125;
  });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState<AccuracyResult | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [voiceModeActive, setVoiceModeActive] = useState(false);

  const metronomeRef = useRef<AudioMetronome | null>(null);
  const availableExercises = selectedCategory === 'todas'
    ? EXPANDED_CLINICAL_CATALOG
    : getExercisesByCategory(selectedCategory);

  const activeExercise = availableExercises[phraseIndex % availableExercises.length] || {
    id: 'default',
    phrase: TRAINING_PHRASES[0],
    clinicalObjective: 'Estabilización métrica silábica con ritmo isocrónico',
    category: 'fonetica_basica' as ClinicalCategory,
    bpm_recommended: 80,
    created_at: new Date().toISOString(),
    difficulty: 'facil',
    targetPhonemes: [],
  };

  const currentPhrase = activeExercise.phrase;
  const totalSyllables = flattenSentenceSyllables(currentPhrase).length;
  const totalSyllablesRef = useRef(totalSyllables);
  const lastBeatTimeRef = useRef(0);

  useEffect(() => {
    totalSyllablesRef.current = totalSyllables;
  }, [totalSyllables]);

  // Contador de duración de la sesión activa
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    // Instanciar el motor de metrónomo de precisión
    const metronome = new AudioMetronome(80, (beat, time) => {
      setCurrentBeat(beat);
      setIsPulsing(true);
      lastBeatTimeRef.current = time;

      // Calcular avance cíclico de la sílaba
      setActiveSyllableIndex((prev) => (prev + 1) % totalSyllablesRef.current);

      setTimeout(() => setIsPulsing(false), 120);
    });

    metronomeRef.current = metronome;

    return () => {
      metronome.stop();
    };
  }, []);

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.max(50, Math.min(180, newBpm));
    setBpm(clamped);
    if (metronomeRef.current) {
      metronomeRef.current.setBpm(clamped);
    }
  };

  const handleCategorySelect = (category: ClinicalCategory | 'todas') => {
    setSelectedCategory(category);
    setPhraseIndex(0);
    setActiveSyllableIndex(0);
    const exercises = category === 'todas' ? EXPANDED_CLINICAL_CATALOG : getExercisesByCategory(category);
    if (exercises.length > 0) {
      handleBpmChange(exercises[0].bpm_recommended);
    }
  };

  const handleTogglePlay = () => {
    if (!metronomeRef.current) return;
    const playing = metronomeRef.current.toggle();
    setIsPlaying(playing);
    if (!playing) {
      setIsPulsing(false);
    }
  };

  const handleToggleMute = () => {
    if (!metronomeRef.current) return;
    const muted = metronomeRef.current.toggleMute();
    setIsMuted(muted);
  };

  const nextPhrase = () => {
    setPhraseIndex((prev) => {
      const nextIdx = (prev + 1) % availableExercises.length;
      const nextEx = availableExercises[nextIdx];
      if (nextEx) {
        handleBpmChange(nextEx.bpm_recommended);
      }
      return nextIdx;
    });
    setActiveSyllableIndex(0);
  };

  // Simular o capturar pulsación vocal en sincronía con el compás
  const handleSimulateVoiceTap = () => {
    const now = performance.now() / 1000;
    const accuracy = evaluateRhythmicAccuracy(now * 1000, (lastBeatTimeRef.current || now) * 1000);
    setLastAccuracy(accuracy);
    setVoiceModeActive(true);
    setTimeout(() => setVoiceModeActive(false), 400);

    if (accuracy.grade === 'perfect') {
      triggerHapticFeedback([40]);
    }
  };

  // Finalizar sesión y guardar en Supabase / local
  const handleFinishSession = async () => {
    if (metronomeRef.current && isPlaying) {
      metronomeRef.current.stop();
      setIsPlaying(false);
    }

    const duration = Math.max(10, sessionSeconds);
    const score = lastAccuracy ? lastAccuracy.score : 95;
    const earnedXp = calculateSessionXP(duration, score);

    const result = await recordTrainingSession(
      {
        bpm,
        durationSeconds: duration,
        syllableCount: totalSyllables,
        accuracyScore: score,
        exercisePhrase: currentPhrase,
      },
      currentUserEmail || undefined
    );

    if (result.success) {
      const streakEval = evaluateDailyStreak(new Date().toISOString());
      const newStreak = streakDays + (streakEval.shouldIncrement ? 1 : 0);
      const newTotalMins = totalMinutes + Math.max(1, Math.round(duration / 60));
      const newXp = xpPoints + earnedXp;

      setStreakDays(newStreak);
      setTotalMinutes(newTotalMins);
      setXpPoints(newXp);
      setSessionSeconds(0);

      if (typeof window !== 'undefined') {
        localStorage.setItem('cadensa_streak_days', String(newStreak));
        localStorage.setItem('cadensa_xp_points', String(newXp));
      }

      setSaveSuccessMsg(`¡Sesión guardada! +${earnedXp} XP ganados. Racha de ${newStreak} días.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleAuthSuccess = (email: string) => {
    setCurrentUserEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cadensa_user_email', email);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 bg-zinc-950 text-zinc-50 selection:bg-emerald-500 selection:text-zinc-950">
      {/* Barra de Navegación Superior */}
      <nav className="w-full max-w-3xl flex items-center justify-between py-1.5 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Cadensa
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            v0.3.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <span>🔥</span>
            <span className="font-bold text-emerald-400">{streakDays}</span>
            <span className="text-zinc-400 hidden sm:inline">días</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            {currentUserEmail ? currentUserEmail.split('@')[0] : '👤 Iniciar Sesión'}
          </button>
        </div>
      </nav>

      {/* Header Compacto (Evita empujar los controles fuera de pantalla) */}
      <header className="max-w-xl w-full text-center space-y-1 pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Prueba de Concepto - Infraestructura Base
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Cadensa
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 font-light italic">
          Encuentra el ritmo de tu voz — Habla rítmica silábica (STS)
        </p>

        {saveSuccessMsg && (
          <div className="p-2.5 max-w-md mx-auto text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold animate-fade-in shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            {saveSuccessMsg}
          </div>
        )}
      </header>

      {/* Tarjeta de Práctica Rítmica Ergonomica (Botones Siempre Visibles) */}
      <section className="max-w-xl w-full my-2 sm:my-3 p-4 sm:p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl space-y-3.5">
        {/* Selector de Categorías Clínicas con conteos */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {[
            { id: 'todas', label: 'Todas', count: EXPANDED_CLINICAL_CATALOG.length },
            { id: 'fonetica_basica', label: 'Fonética', count: getExercisesByCategory('fonetica_basica').length },
            { id: 'diadococinesia', label: 'Diadococinesia', count: getExercisesByCategory('diadococinesia').length },
            { id: 'vocales', label: 'Vocales', count: getExercisesByCategory('vocales').length },
            { id: 'frases_complejas', label: 'Polisílabos', count: getExercisesByCategory('frases_complejas').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id as ClinicalCategory | 'todas')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
                  : 'bg-zinc-950/50 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Metrónomo Visual Compacto */}
        <MetronomeVisual
          isPlaying={isPlaying}
          bpm={bpm}
          currentBeat={currentBeat}
          isPulsing={isPulsing}
        />

        {/* Lector de Sílabas y Ejercicio Activo */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-between px-1 text-xs text-zinc-400 font-medium">
            <span>
              Ejercicio {phraseIndex + 1}/{availableExercises.length} ({activeExercise.difficulty})
            </span>
            <button
              onClick={nextPhrase}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer transition-colors"
            >
              Siguiente Ejercicio →
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 italic">
            🎯 {activeExercise.clinicalObjective}
          </div>

          <SyllableReader
            sentence={currentPhrase}
            activeSyllableIndex={activeSyllableIndex}
            isPlaying={isPlaying}
          />
        </div>

        {/* BOTONES DE ACCIÓN PRINCIPAL (Inmediatamente visibles en primer plano) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 border-t border-zinc-800/80">
          <button
            onClick={handleTogglePlay}
            className={`px-7 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
              isPlaying
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow-lg'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-102'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="w-2.5 h-2.5 bg-zinc-300 rounded-sm" />
                Pausar Entrenamiento
              </>
            ) : (
              <>
                <span className="w-0 h-0 border-y-5 border-y-transparent border-l-8 border-l-zinc-950 ml-0.5" />
                Comenzar Práctica Rítmica
              </>
            )}
          </button>

          <button
            onClick={handleToggleMute}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title={isMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
          >
            {isMuted ? '🔇 Silenciado' : '🔊 Audio'}
          </button>

          {sessionSeconds > 5 && (
            <button
              onClick={handleFinishSession}
              className="px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              💾 Guardar Sesión ({sessionSeconds}s)
            </button>
          )}
        </div>

        {/* Retroalimentación de Sincronía Vocal */}
        {isPlaying && (
          <div className="p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${voiceModeActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              <span className="text-zinc-300">
                {lastAccuracy ? lastAccuracy.label : 'Emite cada sílaba en sincronía con el golpe'}
              </span>
            </div>

            <button
              onClick={handleSimulateVoiceTap}
              className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium cursor-pointer transition-colors"
            >
              🎙️ Registrar Sílaba
            </button>
          </div>
        )}

        {/* Controles de Tempo Compactos */}
        <div className="space-y-2 pt-1 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-medium">Velocidad de Cadencia</span>
            <span className="font-mono text-emerald-400 text-sm font-bold bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800">
              {bpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBpmChange(bpm - 5)}
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
              title="Reducir 5 BPM"
            >
              -
            </button>

            <input
              type="range"
              min="60"
              max="160"
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />

            <button
              onClick={() => handleBpmChange(bpm + 5)}
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
              title="Aumentar 5 BPM"
            >
              +
            </button>
          </div>

          {/* Preajustes Clínicos */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {[
              { label: 'Calibración', val: 70, desc: 'Lento' },
              { label: 'Entrenamiento', val: 80, desc: 'Medio' },
              { label: 'Conversación', val: 95, desc: 'Fluido' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => handleBpmChange(preset.val)}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  bpm === preset.val
                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div>{preset.label}</div>
                <div className="text-[9px] opacity-70">{preset.val} BPM</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tarjetas Clínicas de Base Científica */}
      <section className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-left my-2">
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-emerald-400 text-sm font-bold">01. Isocronía</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Cada sílaba recibe la misma duración temporal compensando el déficit de los ganglios basales.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-cyan-400 text-sm font-bold">02. Neuroplasticidad</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            5 a 10 minutos diarios automatizan el patrón rítmico reduciendo los bloqueos en situaciones cotidianas.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-emerald-400 text-sm font-bold">03. Cero Frustración</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Entrenamiento local-first con gamificación clínica y seguimiento accesible para tu terapeuta.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-3xl text-center py-2 border-t border-zinc-900 text-xs text-zinc-500">
        Cadensa Web — Terapia Rítmica Silábica • Next.js 16 • Supabase • Cloudflare Pages
      </footer>

      {/* Modal de Dashboard / Métricas */}
      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        streakDays={streakDays}
        totalMinutes={totalMinutes}
        xpPoints={xpPoints}
        accuracy={lastAccuracy ? lastAccuracy.score : 88}
      />

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
