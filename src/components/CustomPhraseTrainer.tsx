'use client';

import React, { useState, useEffect } from 'react';
import { flattenSentenceSyllables } from '@/lib/syllables';

export interface CustomPhraseItem {
  id: string;
  phrase: string;
  bpm: number;
  createdAt: string;
  syllables: string[];
}

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

const STORAGE_KEY = 'cadensa_custom_phrases';

function loadStoredPhrases(): CustomPhraseItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

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
  const [phrases, setPhrases] = useState<CustomPhraseItem[]>(loadStoredPhrases);
  const [inputText, setInputText] = useState('');
  const [inputBpm, setInputBpm] = useState(currentBpm);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Recargar frases al abrir el modal de forma diferida
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setPhrases(loadStoredPhrases());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculo en tiempo real de sílabas para la frase que se escribe
  const liveSyllables = inputText.trim() ? flattenSentenceSyllables(inputText.trim()) : [];

  const handleSavePhrase = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    const syllables = flattenSentenceSyllables(clean);
    const newItem: CustomPhraseItem = {
      id: `custom-${Date.now()}`,
      phrase: clean,
      bpm: inputBpm,
      createdAt: new Date().toISOString(),
      syllables,
    };

    const updated = [newItem, ...phrases];
    setPhrases(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    setInputText('');
    setFeedbackMsg('¡Frase guardada en tu repertorio personal!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleDeletePhrase = (id: string) => {
    const updated = phrases.filter((p) => p.id !== id);
    setPhrases(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleApplyTemplate = (templatePhrase: string, bpm: number) => {
    setInputText(templatePhrase);
    setInputBpm(bpm);
  };

  const handleTrainNow = (phrase: string, bpm: number) => {
    onSelectPhrase(phrase, bpm);
    onClose();
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
              <h2 id="custom-phrases-title" className="text-base sm:text-lg font-bold text-zinc-100">
                Mis Frases de Desafío
              </h2>
              <p className="text-xs text-zinc-400">
                Personaliza palabras temidas o situaciones reales con silabación automática.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center animate-fade-in">
            {feedbackMsg}
          </div>
        )}

        {/* Plantillas cotidianas rápidas */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-zinc-400">Plantillas de Situaciones Cotidianas:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CHALLENGE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.phrase, tmpl.suggestedBpm)}
                className="px-2.5 py-1 text-xs rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>💬 {tmpl.title}</span>
                <span className="text-[10px] text-zinc-500">({tmpl.suggestedBpm} BPM)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de entrada y silabación en tiempo real */}
        <form onSubmit={handleSavePhrase} className="space-y-3 bg-zinc-950/50 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80">
          <div className="space-y-1.5">
            <label htmlFor="custom-phrase-input" className="text-xs font-semibold text-zinc-300">
              Escribe tu propia frase o palabra desafiante:
            </label>
            <textarea
              id="custom-phrase-input"
              rows={2}
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej. 'Quiero pedir un café con leche y azúcar por favor'"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {/* Previsualización en vivo del silabeo */}
          {liveSyllables.length > 0 && (
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>⚡ Silabación Fonoaudiológica ({liveSyllables.length} sílabas):</span>
                <span>Ritmo STS</span>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                {liveSyllables.map((syl, idx) => (
                  <span
                    key={`${syl}-${idx}`}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30"
                  >
                    {syl}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
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
                Entrenar Ya
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
            <span className="text-[10px] text-zinc-500">Almacenado localmente en tu dispositivo</span>
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
                      <span>{item.syllables?.length || flattenSentenceSyllables(item.phrase).length} sílabas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTrainNow(item.phrase, item.bpm)}
                      className="px-2.5 py-1 text-xs rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                      title="Entrenar esta frase"
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
