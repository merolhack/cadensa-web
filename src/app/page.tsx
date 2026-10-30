'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AudioMetronome, TimeSignature, SoundPreset } from '@/lib/audioMetronome';
import { flattenSentenceSyllables } from '@/lib/syllables';
import { evaluateRhythmicAccuracy, AccuracyResult, triggerHapticFeedback } from '@/lib/voiceDetection';
import { recordTrainingSession, evaluateDailyStreak, claimLocalSessions } from '@/lib/trainingService';
import { calculateSessionXP } from '@/lib/streaks';
import { supabase } from '@/lib/supabaseClient';
import { MetronomeVisual } from '@/components/MetronomeVisual';
import { SyllableReader, SyllableFontScale } from '@/components/SyllableReader';
import { Dashboard } from '@/components/Dashboard';
import { AuthModal } from '@/components/AuthModal';
import { CommunityBanner } from '@/components/CommunityBanner';
import { BreathingPacer } from '@/components/BreathingPacer';
import { FaqAndMethodology } from '@/components/FaqAndMethodology';
import { TechniqueSelector } from '@/components/TechniqueSelector';
import { TechniqueVisualizer } from '@/components/TechniqueVisualizer';
import { TechniquesCatalogHome } from '@/components/TechniquesCatalogHome';
import { TechniqueVideoModal } from '@/components/TechniqueVideoModal';
import { RealWorldSimulator } from '@/components/RealWorldSimulator';
import { QuickDailyRoutine } from '@/components/QuickDailyRoutine';
import { FeedbackModal } from '@/components/FeedbackModal';
import { FeedbackCategory } from '@/lib/feedbackService';
import { trackClinicalEvent } from '@/lib/analytics';
import { TechniqueId, CLINICAL_TECHNIQUES, ClinicalTechnique } from '@/lib/clinicalTechniques';
import { EXPANDED_CLINICAL_CATALOG, ClinicalCategory, ClinicalExercise, getExercisesByCategory } from '@/lib/clinicalExercises';
import { CustomPhraseTrainer } from '@/components/CustomPhraseTrainer';
import { AudioSelfMonitor } from '@/components/AudioSelfMonitor';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { DiadochokinesisTrainer } from '@/components/DiadochokinesisTrainer';
import { FormantBiofeedbackVisualizer } from '@/components/FormantBiofeedbackVisualizer';
import { TelehealthRoom } from '@/components/TelehealthRoom';
import { PediatricFluencyTrainer } from '@/components/PediatricFluencyTrainer';
import { AlteredAuditoryTrainer } from '@/components/AlteredAuditoryTrainer';
import { FluencyCertificateModal } from '@/components/FluencyCertificateModal';
import { PhoneticRecognitionValidator } from '@/components/PhoneticRecognitionValidator';
import { BrowserCompatibilityBanner } from '@/components/BrowserCompatibilityBanner';
import { LiveAudioVUMeter } from '@/components/LiveAudioVUMeter';
import { setupAudioContextUnlock } from '@/lib/audioUnlock';
import { initGlobalErrorTracking } from '@/lib/errorTracker';

const TRAINING_PHRASES = [
  'Ca mi no des pa cio ca da ma ña na',
  'Encuentra el ritmo de tu voz',
  'Cadensa es ritmo y tranquilidad',
  'Hablar con calma y seguridad es posible',
];

export default function Home({ initialView = 'home' }: { initialView?: 'home' | 'practice' } = {}) {
  // Vista actual: 'home' (Página de inicio y catálogo) o 'practice' (Estación de entrenamiento activo)
  const [currentView, setCurrentView] = useState<'home' | 'practice'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'practice') return 'practice';
    }
    return initialView;
  });

  // Estado para el modal de video explicativo de técnicas
  const [videoModalTechnique, setVideoModalTechnique] = useState<ClinicalTechnique | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isQuickRoutineOpen, setIsQuickRoutineOpen] = useState(false);
  const [isDDKOpen, setIsDDKOpen] = useState(false);
  const [isFormantsOpen, setIsFormantsOpen] = useState(false);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [isKidsOpen, setIsKidsOpen] = useState(false);
  const [isDafOpen, setIsDafOpen] = useState(false);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('other');
  const [feedbackTechniqueId, setFeedbackTechniqueId] = useState<string | null>(null);

  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory | 'todas'>('todas');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState(0);

  // Estados v2: Compás, timbres sonoros, fading de apoyo y accesibilidad
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(4);
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('clasico');
  const [fadingEnabled, setFadingEnabled] = useState(false);
  const [fontScale, setFontScale] = useState<SyllableFontScale>('normal');
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isCustomPhraseOpen, setIsCustomPhraseOpen] = useState(false);
  const [customExercises, setCustomExercises] = useState<ClinicalExercise[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cadensa_custom_phrases');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: { id?: string; phrase: string; bpm?: number; createdAt?: string }) => ({
              id: item.id || `custom-${Date.now()}`,
              category: 'fonetica_basica' as ClinicalCategory,
              difficulty: 'personalizado',
              phrase: item.phrase,
              bpm_recommended: item.bpm || 80,
              created_at: item.createdAt || new Date().toISOString(),
              clinicalObjective: 'Frase personalizada de desafío del paciente',
              targetPhonemes: [],
            }));
          }
        }
      } catch {
        // Ignorar error de lectura local
      }
    }
    return [];
  });
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<TechniqueId>('sts');

  const activeTechnique = CLINICAL_TECHNIQUES[selectedTechniqueId] || CLINICAL_TECHNIQUES.sts;

  // Estados de Usuario, Sesión y Modales con inicialización perezosa segura
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('cadensa_user_email') : null;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('cadensa_user_id') : null;
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

  const baseExercises = selectedCategory === 'todas'
    ? EXPANDED_CLINICAL_CATALOG
    : getExercisesByCategory(selectedCategory);

  const availableExercises = [...customExercises, ...baseExercises];

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

  // Sincronizar estado de sesión en tiempo real desde Supabase Auth
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const email = session.user.email || null;
        const uid = session.user.id;
        setCurrentUserEmail(email);
        setCurrentUserId(uid);
        if (typeof window !== 'undefined') {
          if (email) localStorage.setItem('cadensa_user_email', email);
          localStorage.setItem('cadensa_user_id', uid);
        }
        await claimLocalSessions(uid);
      } else {
        setCurrentUserEmail(null);
        setCurrentUserId(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cadensa_user_email');
          localStorage.removeItem('cadensa_user_id');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Desbloqueo universal de AudioContext para Safari / iOS en el primer gesto de usuario
  useEffect(() => {
    const cleanup = setupAudioContextUnlock(() => {
      return (metronomeRef.current as unknown as { audioCtx?: AudioContext })?.audioCtx || null;
    });
    return () => cleanup();
  }, []);

  // Observabilidad y telemetría global de errores en runtime (GA4 + Supabase)
  useEffect(() => {
    const cleanup = initGlobalErrorTracking();
    return () => cleanup();
  }, []);

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

  const handleTimeSignatureChange = (sig: TimeSignature) => {
    setTimeSignature(sig);
    if (metronomeRef.current) {
      metronomeRef.current.setTimeSignature(sig);
    }
  };

  const handleSoundPresetChange = (preset: SoundPreset) => {
    setSoundPreset(preset);
    if (metronomeRef.current) {
      metronomeRef.current.setSoundPreset(preset);
    }
  };

  const handleFadingToggle = () => {
    const nextVal = !fadingEnabled;
    setFadingEnabled(nextVal);
    if (metronomeRef.current) {
      metronomeRef.current.setFadingEnabled(nextVal);
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
    if (activeTechnique.isRhythmic) {
      if (!metronomeRef.current) return;
      const playing = metronomeRef.current.toggle();
      setIsPlaying(playing);
      if (playing) {
        trackClinicalEvent('metronome_start', { technique_id: activeTechnique.id, bpm });
      } else {
        trackClinicalEvent('metronome_stop', { technique_id: activeTechnique.id, bpm });
        setIsPulsing(false);
      }
    } else {
      // Técnica no rítmica: animación/temporizador especializado sin metrónomo sonoro invasivo
      if (metronomeRef.current && isPlaying) {
        metronomeRef.current.stop();
      }
      setIsPlaying((prev) => {
        const next = !prev;
        if (next) {
          trackClinicalEvent('metronome_start', { technique_id: activeTechnique.id, bpm });
        }
        return next;
      });
      setIsPulsing(false);
    }
  };

  const handleSelectTechnique = (tech: ClinicalTechnique) => {
    // Detener de inmediato la reproducción si la técnica previa estaba ejecutándose
    if (metronomeRef.current && isPlaying) {
      metronomeRef.current.stop();
    }
    setIsPlaying(false);
    setIsPulsing(false);
    setActiveSyllableIndex(0);
    setSelectedTechniqueId(tech.id);
    trackClinicalEvent('technique_select', { technique_id: tech.id });
    if (tech.recommendedCategory) {
      handleCategorySelect(tech.recommendedCategory);
    }
  };

  // Navegación fluida entre la Página de Inicio y la Estación de Práctica
  const handleSelectTechniqueFromHome = (tech: ClinicalTechnique) => {
    handleSelectTechnique(tech);
    setCurrentView('practice');
  };

  const handleBackToHome = () => {
    if (metronomeRef.current && isPlaying) {
      metronomeRef.current.stop();
    }
    setIsPlaying(false);
    setIsPulsing(false);
    setCurrentView('home');
  };

  const handleOpenVideoModal = (tech: ClinicalTechnique) => {
    setVideoModalTechnique(tech);
    setIsVideoModalOpen(true);
  };

  const handleStartPracticeFromVideoModal = (tech: ClinicalTechnique) => {
    handleSelectTechnique(tech);
    setCurrentView('practice');
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

  const handleSelectCustomPhrase = (phrase: string, newBpm?: number) => {
    const customEx: ClinicalExercise = {
      id: `custom-${Date.now()}`,
      category: 'fonetica_basica' as ClinicalCategory,
      difficulty: 'personalizado',
      phrase,
      bpm_recommended: newBpm || bpm,
      created_at: new Date().toISOString(),
      clinicalObjective: 'Entrenamiento personalizado de palabras y frases desafiantes',
      targetPhonemes: ['personalizado'],
    };

    setCustomExercises((prev) => [customEx, ...prev.filter((p) => p.phrase !== phrase)]);
    setPhraseIndex(0);
    setActiveSyllableIndex(0);
    if (newBpm) {
      handleBpmChange(newBpm);
    }
    setSaveSuccessMsg(`¡Frase "${phrase.slice(0, 25)}..." cargada para práctica!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Manejador memoizado y estable para el avance de sílaba a través de técnicas fonoaudiológicas
  const handleNextSyllable = useCallback(() => {
    setActiveSyllableIndex((prev) => (prev + 1) % (totalSyllablesRef.current || 1));
  }, []);

  // Simular o capturar pulsación vocal en sincronía con el compás
  const handleSimulateVoiceTap = () => {
    const now = performance.now() / 1000;
    const accuracy = evaluateRhythmicAccuracy(now * 1000, (lastBeatTimeRef.current || now) * 1000);
    setLastAccuracy(accuracy);
    setVoiceModeActive(true);
    setTimeout(() => setVoiceModeActive(false), 400);

    trackClinicalEvent('voice_tap_recorded', {
      accuracy_grade: accuracy.grade,
      technique_id: activeTechnique.id,
    });

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
      currentUserId || undefined
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
      trackClinicalEvent('session_completed', {
        duration_seconds: duration,
        xp_earned: earnedXp,
        technique_id: activeTechnique.id,
      });
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleAuthSuccess = async (email: string) => {
    setCurrentUserEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cadensa_user_email', email);
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const uid = data.session.user.id;
        setCurrentUserId(uid);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cadensa_user_id', uid);
        }
        await claimLocalSessions(uid);
      }
    } catch {
      // Ignorar error si no hay conexión
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorar error si no hay conexión
    }
    setCurrentUserEmail(null);
    setCurrentUserId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cadensa_user_email');
      localStorage.removeItem('cadensa_user_id');
    }
    setSaveSuccessMsg('Has cerrado sesión. Continuando en modo local.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const dailyProgressPercent = Math.min(100, Math.round((totalMinutes / 5) * 100));

  // 1. Vista de Inicio / Catálogo General de Técnicas
  if (currentView === 'home') {
    return (
      <>
        <TechniquesCatalogHome
          onSelectTechnique={handleSelectTechniqueFromHome}
          onOpenVideoModal={handleOpenVideoModal}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenQuickRoutine={() => setIsQuickRoutineOpen(true)}
          onOpenDDK={() => setIsDDKOpen(true)}
          onOpenFormants={() => setIsFormantsOpen(true)}
          onOpenTelehealth={() => setIsTelehealthOpen(true)}
          onOpenKids={() => setIsKidsOpen(true)}
          onOpenDAF={() => setIsDafOpen(true)}
          onOpenCertificates={() => setIsCertificatesOpen(true)}
          streakDays={streakDays}
          totalMinutes={totalMinutes}
          xpPoints={xpPoints}
          currentUserEmail={currentUserEmail}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
        />

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

        {/* Modal de Video Explicativo */}
        <TechniqueVideoModal
          technique={videoModalTechnique}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onStartPractice={handleStartPracticeFromVideoModal}
        />

        {/* Modal de Simulador de Situaciones Reales */}
        <RealWorldSimulator
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onSelectPracticePhrase={(phrase, newBpm, tech) => {
            const customEx = {
              id: `sim-${Date.now()}`,
              category: 'fonetica_basica' as ClinicalCategory,
              difficulty: 'personalizado',
              phrase,
              bpm_recommended: newBpm,
              created_at: new Date().toISOString(),
              clinicalObjective: `Simulador de situación real con ${tech.shortName}`,
              targetPhonemes: ['simulador'],
            };
            setCustomExercises((prev) => [customEx, ...prev]);
            setPhraseIndex(0);
            setActiveSyllableIndex(0);
            handleSelectTechnique(tech);
            handleBpmChange(newBpm);
            setCurrentView('practice');
          }}
        />

        {/* Modal de Rutina Guiada de 5 Minutos */}
        <QuickDailyRoutine
          isOpen={isQuickRoutineOpen}
          onClose={() => setIsQuickRoutineOpen(false)}
          onStartFullPractice={() => {
            setCurrentView('practice');
          }}
        />

        {/* Modal de Frases Personalizadas del Paciente */}
        <CustomPhraseTrainer
          isOpen={isCustomPhraseOpen}
          onClose={() => setIsCustomPhraseOpen(false)}
          onSelectPhrase={(phrase, newBpm) => {
            handleSelectCustomPhrase(phrase, newBpm);
            setCurrentView('practice');
          }}
          currentBpm={bpm}
        />

        {/* Modal de Diadococinesia Oral (/pa-ta-ka/) */}
        {isDDKOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
          >
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsDDKOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
                aria-label="Cerrar Diadococinesia"
              >
                ✕
              </button>
              <DiadochokinesisTrainer />
            </div>
          </div>
        )}

        {/* Modal de Biofeedback de Formantes F1/F2 */}
        {isFormantsOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
          >
            <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsFormantsOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
                aria-label="Cerrar Formantes"
              >
                ✕
              </button>
              <FormantBiofeedbackVisualizer />
            </div>
          </div>
        )}

        {/* Modal de Telesalud P2P */}
        {isTelehealthOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
          >
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsTelehealthOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
                aria-label="Cerrar Telesalud"
              >
                ✕
              </button>
              <TelehealthRoom />
            </div>
          </div>
        )}

        {/* Modal de Cadensa Kids (Fluidez Pediátrica) */}
        {isKidsOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
          >
            <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsKidsOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
                aria-label="Cerrar Cadensa Kids"
              >
                ✕
              </button>
              <PediatricFluencyTrainer />
            </div>
          </div>
        )}

        {/* Modal de Feedback Auditivo Alterado (DAF / FAF) */}
        {isDafOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
          >
            <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setIsDafOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
                aria-label="Cerrar Feedback DAF/FAF"
              >
                ✕
              </button>
              <AlteredAuditoryTrainer />
            </div>
          </div>
        )}

        {/* Modal de Diplomas y Certificados Clínicos */}
        <FluencyCertificateModal
          isOpen={isCertificatesOpen}
          onClose={() => setIsCertificatesOpen(false)}
        />
      </>
    );
  }

  // 2. Vista de Estación de Entrenamiento Activo (Práctica)
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 bg-zinc-950 text-zinc-50 selection:bg-emerald-500 selection:text-zinc-950 animate-fade-in">
      {/* Barra de Navegación Superior Homogénea (max-w-5xl) */}
      <nav className="w-full max-w-5xl flex items-center justify-between py-1.5 sm:py-2 border-b border-zinc-900 mb-2">
        <div className="flex items-center gap-2">
          {/* Botón para regresar al Catálogo de Técnicas / Inicio */}
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-xs text-emerald-300 font-semibold transition-all cursor-pointer shadow-sm"
            title="Regresar a la Página de Inicio y Catálogo de Técnicas"
          >
            <span>←</span>
            <span>Inicio</span>
          </button>

          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Cadensa
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            v0.4.0
          </span>
          <LiveAudioVUMeter isActive={isPlaying} />
        </div>

        <div className="flex items-center gap-2">
          {/* Botón para ver video explicativo de la técnica activa */}
          <button
            onClick={() => handleOpenVideoModal(activeTechnique)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            title={`Ver video explicativo de ${activeTechnique.shortName}`}
          >
            <span>🎥</span>
            <span className="hidden sm:inline">Video</span>
          </button>

          {/* Botón PWA Instalable */}
          <PwaInstallButton />

          {/* Enlace a Acerca de */}
          <Link
            href="/about"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Conoce el propósito del sitio, futuros pasos y autor"
          >
            <span>ℹ️</span>
            <span className="hidden sm:inline">Acerca de</span>
          </Link>

          {/* Menú Modular de Técnicas Fonoaudiológicas */}
          <TechniqueSelector
            currentTechniqueId={selectedTechniqueId}
            onSelectTechnique={handleSelectTechnique}
          />

          <button
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <span>🔥</span>
            <span className="font-bold text-emerald-400">{streakDays}</span>
            <span className="text-zinc-400 hidden sm:inline">días</span>
          </button>

          {currentUserEmail ? (
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-zinc-300 max-w-[120px] truncate">{currentUserEmail.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 transition-colors ml-1 cursor-pointer font-semibold"
                title="Cerrar Sesión"
              >
                ⎋ Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
            >
              👤 Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {/* Header Compacto Centrado (max-w-4xl) */}
      <header className="max-w-4xl w-full text-center space-y-1.5 pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Prueba de Concepto - Infraestructura Base
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Cadensa
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 font-light italic transition-colors">
          {activeTechnique.id === 'sts'
            ? 'Encuentra el ritmo de tu voz — Habla rítmica silábica (STS)'
            : `${activeTechnique.name} — ${activeTechnique.clinicalObjective}`}
        </p>

        {/* Anillo de Meta Diaria de Entrenamiento (5 min objetivo) */}
        <div className="max-w-xs mx-auto pt-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Meta de hoy ({totalMinutes}/5 min)</span>
            <span className="font-semibold text-emerald-400">{dailyProgressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-2 max-w-md mx-auto text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold animate-fade-in shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            {saveSuccessMsg}
          </div>
        )}
      </header>

      {/* Tarjeta de Práctica Rítmica Ergonómica Homogénea (max-w-4xl) */}
      <section className="max-w-4xl w-full my-2 sm:my-3 p-4 sm:p-7 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-md shadow-2xl space-y-4">
        {/* Selector de Categorías Clínicas con conteos */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {[
            { id: 'todas', label: 'Todas', count: availableExercises.length },
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

        {/* Metrónomo Visual solo para técnicas rítmicas (STS) */}
        {activeTechnique.isRhythmic && (
          <MetronomeVisual
            isPlaying={isPlaying}
            bpm={bpm}
            currentBeat={currentBeat}
            isPulsing={isPulsing}
            timeSignature={timeSignature}
          />
        )}

        {/* Visualizador Adaptativo de la Técnica Activa (ej. Rampa Easy Onset / Presión Articular / Box Breathing) */}
        <TechniqueVisualizer
          technique={activeTechnique}
          isPlaying={isPlaying}
          bpm={bpm}
          activeSyllableIndex={activeSyllableIndex}
          currentPhrase={currentPhrase}
          onNextSyllable={handleNextSyllable}
        />

        {/* Lector de Sílabas y Ejercicio Activo */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-between px-1 text-xs text-zinc-400 font-medium">
            <span>
              Ejercicio {phraseIndex + 1}/{availableExercises.length} ({activeExercise.difficulty})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomPhraseOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                + Mis Frases Desafío
              </button>
              <button
                onClick={nextPhrase}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-[10px] text-emerald-400 font-semibold">
              {activeTechnique.badge}: {activeTechnique.exerciseGoal}
            </span>
            <span className="text-[11px] text-zinc-400 italic">
              🎯 {activeExercise.clinicalObjective}
            </span>
          </div>

          <SyllableReader
            sentence={currentPhrase}
            activeSyllableIndex={activeSyllableIndex}
            isPlaying={isPlaying}
            fontScale={fontScale}
          />

          {/* Módulo de Auto-Escucha Fonoaudiológica Zero Trust */}
          <AudioSelfMonitor isPlaying={isPlaying} />

          {/* Validador Fonético On-Device Zero Trust */}
          <PhoneticRecognitionValidator targetPhrase={currentPhrase} />
        </div>

        {/* BOTONES DE ACCIÓN PRINCIPAL DIFERENCIADOS POR TÉCNICA */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-zinc-800/80">
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
                {activeTechnique.actionButton.stop}
              </>
            ) : (
              <>
                <span className="text-base">{activeTechnique.actionButton.icon}</span>
                {activeTechnique.actionButton.start}
              </>
            )}
          </button>

          <button
            onClick={handleToggleMute}
            className={`px-3.5 py-3 rounded-2xl border text-xs font-semibold transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title={isMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
          >
            {isMuted ? '🔇 Mute' : '🔊 Audio'}
          </button>

          <button
            onClick={() => setIsBreathingOpen(true)}
            className="px-3.5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Abrir ejercicio de respiración 4-4-4-4"
          >
            🌬️ Respirar
          </button>

          {sessionSeconds > 5 && (
            <button
              onClick={handleFinishSession}
              className="px-3.5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              💾 Guardar ({sessionSeconds}s)
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

        {/* Controles de Configuración de Audio & Compás (Pestañas Rápidas) */}
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

          {/* Opciones Avanzadas: Compás, Timbre y Tamaño */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
            {/* Selector de Compás */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-500">Compás:</span>
              {([2, 3, 4] as TimeSignature[]).map((sig) => (
                <button
                  key={sig}
                  onClick={() => handleTimeSignatureChange(sig)}
                  className={`px-2 py-0.5 rounded-lg border cursor-pointer ${
                    timeSignature === sig
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {sig}/4
                </button>
              ))}
            </div>

            {/* Selector de Timbre */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-500">Timbre:</span>
              {(['clasico', 'madera', 'digital'] as SoundPreset[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleSoundPresetChange(t)}
                  className={`px-2 py-0.5 rounded-lg border capitalize cursor-pointer ${
                    soundPreset === t
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Reto Silencio Rítmico Fading */}
            <button
              onClick={handleFadingToggle}
              className={`px-2 py-0.5 rounded-lg border cursor-pointer ${
                fadingEnabled
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Silencia 2 compases cada 4 compases para reto interno"
            >
              {fadingEnabled ? '🎯 Reto Activo' : '🎯 Fading'}
            </button>

            {/* Escala de Fuente */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-500">Texto:</span>
              {(['normal', 'grande', 'extragrande'] as SyllableFontScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setFontScale(scale)}
                  className={`px-1.5 py-0.5 rounded-lg border cursor-pointer ${
                    fontScale === scale
                      ? 'bg-zinc-700 border-zinc-500 text-zinc-100 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {scale === 'normal' ? 'A' : scale === 'grande' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tarjetas Clínicas de Base Científica (max-w-4xl) */}
      <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left my-2">
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-emerald-400 text-sm font-bold">01. {activeTechnique.badge}</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {activeTechnique.neurobiologicalBasis}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-cyan-400 text-sm font-bold">02. {activeTechnique.shortName}</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {activeTechnique.clinicalObjective}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
          <div className="text-emerald-400 text-sm font-bold">03. Respaldo AMTTM</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Acompañamiento integral y comunidad respaldada por la Asociación Mexicana de la Tartamudez.
          </p>
        </div>
      </section>

      {/* Guía Interactiva de Botones (FAQ) y Fundamento Clínico STS */}
      <FaqAndMethodology
        activeTechniqueId={selectedTechniqueId}
        onSelectTechnique={handleSelectTechnique}
      />

      {/* Banner Comunitario Oficial AMTTM */}
      <CommunityBanner />

      {/* Footer Homogéneo y Simétrico (max-w-4xl) */}
      <footer className="w-full max-w-4xl text-center pt-6 pb-6 border-t border-zinc-900 text-xs text-zinc-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400">
          <Link
            href="/about"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>ℹ️</span>
            <span>Acerca de</span>
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/stats"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>📊</span>
            <span>Estadísticas</span>
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
            Términos
          </Link>
          <span className="hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => {
              setFeedbackCategory('other');
              setFeedbackTechniqueId(null);
              setIsFeedbackOpen(true);
            }}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>💬</span>
            <span>Comentarios</span>
          </button>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/admin"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            title="Panel de Administración Zero Trust"
          >
            <span>🛡️</span>
            <span>Admin</span>
          </Link>
          <span className="hidden sm:inline">•</span>
          <span>Cadensa Web — Terapia Rítmica Silábica</span>
        </div>

        {/* Aviso discreto de compatibilidad para personas técnicas */}
        <BrowserCompatibilityBanner />

        <p className="text-[11px] text-zinc-600">Next.js 16 • Supabase • Cloudflare Pages</p>
      </footer>

      {/* Modal de Respiración Diafragmática */}
      <BreathingPacer
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

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

      {/* Modal de Video Explicativo de la Técnica Activa */}
      <TechniqueVideoModal
        technique={videoModalTechnique}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onStartPractice={handleStartPracticeFromVideoModal}
      />

      {/* Modal de Feedback Comunitario y Calidad Clínica */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        defaultCategory={feedbackCategory}
        defaultTechniqueId={feedbackTechniqueId}
      />

      {/* Modal de Frases Personalizadas del Paciente */}
      <CustomPhraseTrainer
        isOpen={isCustomPhraseOpen}
        onClose={() => setIsCustomPhraseOpen(false)}
        onSelectPhrase={handleSelectCustomPhrase}
        currentBpm={bpm}
      />

      {/* Modal de Diadococinesia Oral (/pa-ta-ka/) */}
      {isDDKOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsDDKOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm cursor-pointer"
              aria-label="Cerrar Diadococinesia"
            >
              ✕
            </button>
            <DiadochokinesisTrainer />
          </div>
        </div>
      )}
    </main>
  );
}
