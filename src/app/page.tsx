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
  'Encuentra el ritmo de tu voz',
  'Cadensa es ritmo y tranquilidad',
  'Cadensa entrena tu fluidez cada día',
  'Hablar con calma y seguridad es posible',
  'La comunicación fluye cuando el compás es constante',
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
    clinicalObjective: 'Entrenamiento rítmico general de temporización silábica',
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
    setPhraseIndex((prev) => (prev + 1) % availableExercises.length);
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
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-zinc-950 text-zinc-50 selection:bg-emerald-500 selection:text-zinc-950">
      {/* Barra de Navegación Superior */}
      <nav className="w-full max-w-4xl flex items-center justify-between py-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Cadensa
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            v0.2.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <span>🔥</span>
            <span className="font-bold text-emerald-400">{streakDays}</span>
            <span className="text-zinc-400 hidden sm:inline">días</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            {currentUserEmail ? currentUserEmail.split('@')[0] : '👤 Iniciar Sesión'}
          </button>
        </div>
      </nav>

      {/* Header y Mensaje de Bienvenida */}
      <header className="max-w-3xl w-full text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium tracking-wide text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Prueba de Concepto - Infraestructura Base
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Cadensa
        </h1>

        <p className="text-xl text-zinc-400 font-light italic">
          Encuentra el ritmo de tu voz.
        </p>

        <p className="text-zinc-300 leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
          Una plataforma diaria que entrena tu ritmo al hablar para superar bloqueos y comunicarte con total seguridad. 
          Basada en el habla rítmica silábica.
        </p>

        {saveSuccessMsg && (
          <div className="p-3 max-w-md mx-auto text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold animate-fade-in shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            {saveSuccessMsg}
          </div>
        )}
      </header>

      {/* Tarjeta de Práctica Rítmica */}
      <section className="max-w-2xl w-full my-6 p-6 sm:p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
        {/* Metrónomo Visual */}
        <MetronomeVisual
          isPlaying={isPlaying}
          bpm={bpm}
          currentBeat={currentBeat}
          isPulsing={isPulsing}
        />

        {/* Selector de Categorías Clínicas */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'diadococinesia', label: 'Diadococinesia' },
            { id: 'vocales', label: 'Vocales' },
            { id: 'fonetica_basica', label: 'Fonética Básica' },
            { id: 'frases_complejas', label: 'Polisílabos' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as ClinicalCategory | 'todas');
                setPhraseIndex(0);
                setActiveSyllableIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lector de Sílabas */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-between px-2 text-xs text-zinc-400 font-medium">
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

        {/* Retroalimentación de Sincronía Vocal */}
        {isPlaying && (
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${voiceModeActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              <span className="text-zinc-300">
                {lastAccuracy ? lastAccuracy.label : 'Emite cada sílaba en sincronía con el golpe'}
              </span>
            </div>

            <button
              onClick={handleSimulateVoiceTap}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium cursor-pointer transition-colors"
            >
              🎙️ Registrar Sílaba
            </button>
          </div>
        )}

        {/* Controles de Tempo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span className="font-medium">Velocidad de Cadencia</span>
            <span className="font-mono text-emerald-400 text-base font-bold bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
              {bpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleBpmChange(bpm - 5)}
              className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
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
              className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
              title="Aumentar 5 BPM"
            >
              +
            </button>
          </div>

          {/* Preajustes Clínicos */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Calibración', val: 70, desc: 'Lento' },
              { label: 'Entrenamiento', val: 95, desc: 'Medio' },
              { label: 'Conversación', val: 125, desc: 'Fluido' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => handleBpmChange(preset.val)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  bpm === preset.val
                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div>{preset.label}</div>
                <div className="text-[10px] opacity-70">{preset.val} BPM ({preset.desc})</div>
              </button>
            ))}
          </div>
        </div>

        {/* Botones de Control Principal */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-zinc-800/80">
          <button
            onClick={handleTogglePlay}
            className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center gap-3 cursor-pointer ${
              isPlaying
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow-lg'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-102'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="w-3 h-3 bg-zinc-300 rounded-sm" />
                Pausar Entrenamiento
              </>
            ) : (
              <>
                <span className="w-0 h-0 border-y-6 border-y-transparent border-l-10 border-l-zinc-950 ml-1" />
                Comenzar Práctica Rítmica
              </>
            )}
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-2xl border transition-colors cursor-pointer ${
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
              className="px-5 py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              💾 Guardar Sesión ({sessionSeconds}s)
            </button>
          )}
        </div>
      </section>

      {/* Tarjetas Clínicas de Base Científica */}
      <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left my-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="text-emerald-400 text-xl font-bold">01. Isocronía</div>
          <h3 className="text-zinc-200 font-semibold text-sm">Habla Rítmica Silábica</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Cada sílaba se emite en un intervalo temporal idéntico, reduciendo la tensión motora fonatoria.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="text-cyan-400 text-xl font-bold">02. Neuroplasticidad</div>
          <h3 className="text-zinc-200 font-semibold text-sm">Compensación Cerebral</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            El estímulo rítmico externo elude el circuito de los ganglios basales para evitar bloqueos.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="text-emerald-400 text-xl font-bold">03. Hábitos Diarios</div>
          <h3 className="text-zinc-200 font-semibold text-sm">Práctica Gamificada</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Sesiones cortas de 3 a 5 minutos al día para automatizar la fluidez en situaciones reales.
          </p>
        </div>
      </section>

      {/* Modales Interactivos */}
      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        streakDays={streakDays}
        totalMinutes={totalMinutes}
        xpPoints={xpPoints}
        accuracy={lastAccuracy ? lastAccuracy.score : 95}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 py-4 border-t border-zinc-900 w-full max-w-4xl">
        Cadensa Web © 2026 · Plataforma de Terapia Rítmica Silábica · Jamstack en Edge
      </footer>
    </main>
  );
}
