'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flattenSentenceSyllables } from '@/lib/syllables';
import { supabase } from '@/lib/supabaseClient';
import {
  CustomPhraseItem,
  loadLocalCustomPhrases,
  saveLocalCustomPhrases,
  syncCustomPhrasesWithCloud,
} from '@/lib/customPhraseService';

export const PRESET_CHALLENGE_TEMPLATES = [
  {
    title: 'Pedir café',
    phrase: 'Un café con leche por favor',
    category: 'Cotidiano',
    suggestedBpm: 75,
  },
  {
    title: 'Llamada telefónica',
    phrase: 'Hola buenas tardes con quién hablo',
    category: 'Social',
    suggestedBpm: 70,
  },
  {
    title: 'Presentación laboral',
    phrase: 'Buenos días mi nombre es Carlos',
    category: 'Laboral',
    suggestedBpm: 65,
  },
  {
    title: 'Comprar en tienda',
    phrase: 'Cuánto cuesta este producto gracias',
    category: 'Comercial',
    suggestedBpm: 80,
  },
  {
    title: 'Preguntar dirección',
    phrase: 'Disculpe dónde queda la estación',
    category: 'Urbano',
    suggestedBpm: 70,
  },
];

interface CustomPhraseTrainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (phrase: string, bpm?: number) => void;
  currentBpm?: number;
}

export function CustomPhraseTrainer({
  isOpen,
  onClose,
  onSelectPhrase,
  currentBpm = 80,
}: CustomPhraseTrainerProps) {
  const [phrases, setPhrases] = useState<CustomPhraseItem[]>(loadLocalCustomPhrases);
  const [inputText, setInputText] = useState('');
  const [inputBpm, setInputBpm] = useState(currentBpm);
  const [syllables, setSyllables] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados de reproducción rítmica con Web Speech API (TTS)
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [activeTtsIndex, setActiveTtsIndex] = useState(-1);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar usuario autenticado para habilitar respaldo en la nube
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Recargar frases al abrir el modal de forma diferida
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setPhrases(loadLocalCustomPhrases());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Detener TTS si el modal se cierra o se desmonta
  const handleStopTts = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsTtsPlaying(false);
    setActiveTtsIndex(-1);
  }, []);

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Ejecuta la silabación de la frase en edición
  const handleSyllabify = () => {
    const clean = inputText.trim();
    if (!clean) {
      setSyllables([]);
      return;
    }
    const extracted = flattenSentenceSyllables(clean);
    setSyllables(extracted);
    handleStopTts();
  };

  // Vocaliza una sílaba individual mediante Web Speech API (100% on-device y offline)
  const speakSyllable = (syl: string, tempo: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(syl);
      utterance.lang = 'es-ES';
      // Ajustar la velocidad ligeramente acorde al BPM para articulación natural
      utterance.rate = Math.min(1.8, Math.max(0.7, tempo / 75));
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignorar excepciones en entornos sin soporte de audio
    }
  };

  // Reproducción secuencial de cada sílaba en sincronía estricta con el metrónomo
  const handlePlayTts = () => {
    const clean = inputText.trim();
    const targetSyllables = syllables.length > 0 ? syllables : flattenSentenceSyllables(clean);

    if (targetSyllables.length === 0) {
      setFeedbackMsg('Escribe una frase y pulsa "Silabizar" para escucharla.');
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }

    if (syllables.length === 0) {
      setSyllables(targetSyllables);
    }

    handleStopTts();
    setIsTtsPlaying(true);
    setActiveTtsIndex(0);
    speakSyllable(targetSyllables[0], inputBpm);

    const stepMs = Math.round((60 / inputBpm) * 1000);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep < targetSyllables.length) {
        setActiveTtsIndex(currentStep);
        speakSyllable(targetSyllables[currentStep], inputBpm);
      } else {
        clearInterval(timer);
        playbackTimerRef.current = null;
        setTimeout(() => {
          setIsTtsPlaying(false);
          setActiveTtsIndex(-1);
        }, stepMs);
      }
    }, stepMs);

    playbackTimerRef.current = timer;
  };

  const handleSavePhrase = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    const newItem: CustomPhraseItem = {
      id: `custom-${Date.now()}`,
      phrase: clean,
      bpm: inputBpm,
      category: 'personalizado',
      created_at: new Date().toISOString(),
    };

    const updated = [newItem, ...phrases];
    setPhrases(updated);
    saveLocalCustomPhrases(updated);

    setInputText('');
    setSyllables([]);
    handleStopTts();
    setFeedbackMsg('¡Frase guardada en tu repertorio personal!');
    setTimeout(() => setFeedbackMsg(null), 2500);

    // Auto-sincronizar con Supabase si está logueado
    if (userId) {
      syncCustomPhrasesWithCloud(updated, userId).then(({ syncedPhrases }) => {
        setPhrases(syncedPhrases);
      });
    }
  };

  const handleDeletePhrase = (id: string) => {
    const updated = phrases.filter((p) => p.id !== id);
    setPhrases(updated);
    saveLocalCustomPhrases(updated);
  };

  const handleApplyTemplate = (templatePhrase: string, bpm: number) => {
    handleStopTts();
    setInputText(templatePhrase);
    setInputBpm(bpm);
    const extracted = flattenSentenceSyllables(templatePhrase);
    setSyllables(extracted);
  };

  const handleTrainNow = (phrase: string, bpm: number) => {
    handleStopTts();
    onSelectPhrase(phrase, bpm);
    onClose();
  };

  const handleLoadAndPlayTts = (phrase: string, bpm: number) => {
    handleStopTts();
    setInputText(phrase);
    setInputBpm(bpm);
    const extracted = flattenSentenceSyllables(phrase);
    setSyllables(extracted);

    setTimeout(() => {
      setIsTtsPlaying(true);
      setActiveTtsIndex(0);
      speakSyllable(extracted[0], bpm);

      const stepMs = Math.round((60 / bpm) * 1000);
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep += 1;
        if (currentStep < extracted.length) {
          setActiveTtsIndex(currentStep);
          speakSyllable(extracted[currentStep], bpm);
        } else {
          clearInterval(timer);
          playbackTimerRef.current = null;
          setTimeout(() => {
            setIsTtsPlaying(false);
            setActiveTtsIndex(-1);
          }, stepMs);
        }
      }, stepMs);

      playbackTimerRef.current = timer;
    }, 50);
  };

  const handleManualSync = async () => {
    if (!userId) {
      setFeedbackMsg('Inicia sesión para sincronizar tus frases en la nube.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    setIsSyncing(true);
    const { syncedPhrases, syncedWithCloud } = await syncCustomPhrasesWithCloud(
      phrases,
      userId
    );
    setIsSyncing(false);

    if (syncedWithCloud) {
      setPhrases(syncedPhrases);
      setFeedbackMsg('☁️ ¡Frases sincronizadas con tu cuenta en la nube!');
    } else {
      setFeedbackMsg('No se pudo conectar con la nube. Se mantiene copia local.');
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-phrases-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="custom-phrases-title" className="text-base sm:text-lg font-bold text-zinc-100">
                  Mis Frases de Desafío
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  TTS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Entrena oraciones personalizadas con metrónomo y síntesis de voz silábica on-device.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopTts();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <span>✨</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Plantillas Situacionales */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Plantillas para Situaciones Reales</span>
            <span className="text-[10px] text-zinc-500">Pulsa una para autocompletar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_CHALLENGE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.phrase, tmpl.suggestedBpm)}
                className="p-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
                  <span className="font-mono uppercase">{tmpl.category}</span>
                  <span className="text-emerald-400 font-mono">{tmpl.suggestedBpm} BPM</span>
                </div>
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                  {tmpl.title}
                </div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">&quot;{tmpl.phrase}&quot;</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de Entrada y Silabación */}
        <form onSubmit={handleSavePhrase} className="space-y-3 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/60">
          <div>
            <label htmlFor="custom-phrase-input" className="block text-xs font-semibold text-zinc-300 mb-1">
              Escribe tu propia frase personalizada
            </label>
            <div className="flex gap-2">
              <input
                id="custom-phrase-input"
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (e.target.value.trim()) {
                    setSyllables(flattenSentenceSyllables(e.target.value.trim()));
                  } else {
                    setSyllables([]);
                  }
                }}
                placeholder="Ej: Quiero un café con leche por favor..."
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSyllabify}
                disabled={!inputText.trim()}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-emerald-300 border border-zinc-700 transition cursor-pointer shrink-0"
              >
                ✂️ Silabizar
              </button>
            </div>
          </div>

          {/* Cajas Visuales de Sílabas y Reproductor Rítmico TTS */}
          {syllables.length > 0 && (
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">
                  Cajas Visuales de Sílabas ({syllables.length} métricas)
                </span>
                {isTtsPlaying && (
                  <span className="text-emerald-400 font-mono font-bold animate-pulse text-[11px]">
                    ● Beat {activeTtsIndex + 1}/{syllables.length} ({inputBpm} BPM)
                  </span>
                )}
              </div>

              {/* Cajas visuales con renderizado y sombreado fonoaudiológico */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl min-h-[60px]">
                {syllables.map((syl, idx) => {
                  const isActive = isTtsPlaying && activeTtsIndex === idx;
                  return (
                    <React.Fragment key={`${syl}-${idx}`}>
                      <span
                        className={`px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-zinc-950 scale-110 shadow-[0_0_15px_rgba(52,211,153,0.7)] border-transparent'
                            : 'bg-zinc-950/80 text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {syl}
                      </span>
                      {idx < syllables.length - 1 && (
                        <span className="text-zinc-600 font-light select-none">·</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Controles de reproducción con metrónomo y Web Speech API */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Tempo:</span>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={inputBpm}
                    onChange={(e) => setInputBpm(Number(e.target.value))}
                    className="w-20 sm:w-28 accent-emerald-400"
                    aria-label="Ajustar tempo del metrónomo TTS"
                  />
                  <span className="text-emerald-400 font-mono font-bold">{inputBpm} BPM</span>
                </div>

                <div className="flex items-center gap-2">
                  {isTtsPlaying ? (
                    <button
                      type="button"
                      onClick={handleStopTts}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⏹</span>
                      <span>Detener</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlayTts}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔊</span>
                      <span>Reproducir con Metrónomo TTS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ajuste de velocidad y botones principales */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Velocidad:</span>
              <input
                type="number"
                min="50"
                max="160"
                value={inputBpm}
                onChange={(e) => setInputBpm(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 font-mono font-bold text-center"
              />
              <span>BPM</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleTrainNow(inputText.trim(), inputBpm)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs text-zinc-200 font-medium transition-colors cursor-pointer"
              >
                ▶ Practicar en Estación
              </button>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                💾 Guardar Frase
              </button>
            </div>
          </div>
        </form>

        {/* Lista de frases guardadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Repertorio Guardado ({phrases.length})</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">
                {userId ? '☁️ Sincronización en la nube lista' : '💾 Guardado local'}
              </span>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-cyan-300 border border-zinc-700 transition cursor-pointer"
                title="Sincronizar frases con tu cuenta"
              >
                {isSyncing ? 'Sincronizando...' : '☁️ Sincronizar'}
              </button>
            </div>
          </div>

          {phrases.length === 0 ? (
            <div className="text-center py-5 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-500">
              No tienes frases guardadas aún. Usa las plantillas o escribe tus propias oraciones para practicarlas con el metrónomo.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {phrases.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-zinc-200 font-medium break-words">
                      &quot;{item.phrase}&quot;
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                        {item.bpm} BPM
                      </span>
                      <span>•</span>
                      <span>{flattenSentenceSyllables(item.phrase).length} sílabas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoadAndPlayTts(item.phrase, item.bpm)}
                      className="px-2.5 py-1 text-xs rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/30 transition-colors cursor-pointer"
                      title="Escuchar sílabas con TTS"
                    >
                      🔊 TTS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrainNow(item.phrase, item.bpm)}
                      className="px-2.5 py-1 text-xs rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                      title="Entrenar esta frase en la estación"
                    >
                      ▶ Practicar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhrase(item.id)}
                      className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Eliminar de mi lista"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
