'use client';

import React, { useState, useEffect } from 'react';
import {
  submitFeedbackReport,
  checkFeedbackRateLimit,
  FeedbackCategory,
} from '@/lib/feedbackService';
import { CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: FeedbackCategory;
  defaultTechniqueId?: string | null;
}

interface FeedbackModalContentProps {
  onClose: () => void;
  defaultCategory: FeedbackCategory;
  defaultTechniqueId: string | null;
}

const FeedbackModalContent: React.FC<FeedbackModalContentProps> = ({
  onClose,
  defaultCategory,
  defaultTechniqueId,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [techniqueId, setTechniqueId] = useState<string>(defaultTechniqueId || '');
  const [message, setMessage] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejo de tecla Escape para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const charCount = message.trim().length;
  const isMessageValid = charCount >= 10 && charCount <= 1000;
  const rateLimit = checkFeedbackRateLimit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isMessageValid) {
      setErrorMessage('El mensaje debe tener entre 10 y 1,000 caracteres.');
      return;
    }

    setSubmitting(true);
    const result = await submitFeedbackReport({
      category,
      techniqueId: techniqueId || null,
      message,
      contactEmail: contactEmail.trim() || null,
      honeypot,
    });
    setSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold uppercase tracking-wider">
              Comunidad & Calidad Clínica
            </span>
            <h2 id="feedback-modal-title" className="text-lg sm:text-xl font-bold text-zinc-100 mt-1 flex items-center gap-2">
              <span>💬</span>
              <span>Enviar Comentarios o Reportar Error</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de comentarios"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submitSuccess ? (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                ¡Gracias por ayudarnos a mejorar Cadensa!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Tu reporte ha sido registrado de forma segura. Nuestro equipo clínico y técnico lo revisará para mantener la más alta calidad terapéutica.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
            >
              Entendido, volver a la práctica
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Aviso de límite si aplica */}
            {!rateLimit.allowed && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>Has alcanzado el límite de reportes por hora. Podrás enviar otro en {rateLimit.waitMinutes} min.</span>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>❌</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selector de Categoría */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Tipo de reporte o comentario:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCategory('video_issue')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    category === 'video_issue'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>🎬</span>
                    <span>Falla en Video o Audio</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Reproducción, audio o subtítulos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('technique_issue')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    category === 'technique_issue'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>📖</span>
                    <span>Duda o Técnica</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Instrucciones o ritmo silábico</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('suggestion')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    category === 'suggestion'
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-bold'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>💡</span>
                    <span>Sugerencia</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Ideas para nuevas funciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('other')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    category === 'other'
                      ? 'bg-zinc-700/40 border-zinc-500 text-zinc-200 font-bold'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <span>💬</span>
                    <span>General</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Otro comentario o feedback</span>
                </button>
              </div>
            </div>

            {/* Técnica Relacionada (Opcional) */}
            <div className="space-y-1">
              <label htmlFor="feedback-technique-select" className="text-xs font-semibold text-zinc-300 block">
                Técnica relacionada (opcional):
              </label>
              <select
                id="feedback-technique-select"
                value={techniqueId}
                onChange={(e) => setTechniqueId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">-- No específica / Aplicación general --</option>
                {Object.values(CLINICAL_TECHNIQUES).map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.icon} {tech.name} ({tech.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Mensaje */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="feedback-message" className="font-semibold text-zinc-300">
                  Descripción del reporte o sugerencia: <span className="text-emerald-400">*</span>
                </label>
                <span className={`text-[10px] ${charCount < 10 || charCount > 1000 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {charCount}/1000 caract. (mín. 10)
                </span>
              </div>
              <textarea
                id="feedback-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Por favor describe qué sucedió (ej. el video no cargó en Safari, la explicación del paso 2 es poco clara...)"
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Correo Electrónico Voluntario */}
            <div className="space-y-1">
              <label htmlFor="feedback-email" className="text-xs font-semibold text-zinc-300 block">
                Correo de contacto (opcional):
              </label>
              <input
                id="feedback-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com (solo si deseas respuesta)"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[10px] text-zinc-500">
                🔒 No compartimos tu correo con terceros. Puedes enviar tu reporte de forma anónima sin cuenta.
              </p>
            </div>

            {/* Campo Trampa Anti-Spam (Honeypot) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="feedback-website-hp">No llenar este campo si eres humano</label>
              <input
                id="feedback-website-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !isMessageValid || !rateLimit.allowed}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Enviando reporte...</span>
                  </>
                ) : (
                  <>
                    <span>✉️</span>
                    <span>Enviar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'video_issue',
  defaultTechniqueId = null,
}) => {
  if (!isOpen) return null;

  return (
    <FeedbackModalContent
      onClose={onClose}
      defaultCategory={defaultCategory}
      defaultTechniqueId={defaultTechniqueId}
    />
  );
};
