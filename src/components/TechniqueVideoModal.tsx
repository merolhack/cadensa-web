'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ClinicalTechnique, CLINICAL_TECHNIQUES } from '@/lib/clinicalTechniques';
import { FeedbackModal } from '@/components/FeedbackModal';

interface TechniqueVideoModalProps {
  technique: ClinicalTechnique | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (technique: ClinicalTechnique) => void;
  onReportIssue?: (technique: ClinicalTechnique) => void;
}

export const TechniqueVideoModal: React.FC<TechniqueVideoModalProps> = ({
  technique,
  isOpen,
  onClose,
  onStartPractice,
  onReportIssue,
}) => {
  // Estado para la técnica actualmente visualizada (permite alternar entre las 7 técnicas dentro del modal)
  const [currentTechnique, setCurrentTechnique] = useState<ClinicalTechnique | null>(technique);
  const [playingTechniqueId, setPlayingTechniqueId] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  // Audio directo: por defecto el audio se activa al presionar Play
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sincronizar técnica si cambia desde las props
  useEffect(() => {
    if (technique) {
      setCurrentTechnique(technique);
      setPlayingTechniqueId(null);
      setIsMuted(false);
    }
  }, [technique]);

  const activeTech = currentTechnique || technique;
  const isPlayingVideo = Boolean(isOpen && activeTech && playingTechniqueId === activeTech.id);

  // Lazy loading mediante IntersectionObserver: suspende la reproducción si el modal sale de la vista
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInViewport(entry.isIntersecting);
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  // Reproducción defensiva con audio directo (gesto de usuario) y fallback a muted si el navegador lo restringe
  useEffect(() => {
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
            // Si el navegador bloquea la reproducción con sonido, caemos a silenciado defensivo
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          }
        });
      }
    }
  }, [isPlayingVideo, isMuted, activeTech?.id]);

  const handleStartPlay = () => {
    if (!activeTech) return;
    setIsMuted(false);
    setPlayingTechniqueId(activeTech.id);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleSelectTechnique = (t: ClinicalTechnique) => {
    setCurrentTechnique(t);
    setPlayingTechniqueId(t.id);
    setIsMuted(false);
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPlayingTechniqueId(null);
    setIsMuted(false);
    onClose();
  };

  // Manejador de tecla Escape para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setPlayingTechniqueId(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeTech) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
              {activeTech.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Avatar IA Maestro</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                  {activeTech.difficulty}
                </span>
                {activeTech.videoUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium font-mono">
                    HD 1080p
                  </span>
                )}
              </div>
              <h2 id="video-modal-title" className="text-lg sm:text-xl font-bold text-zinc-100 mt-1">
                {activeTech.name}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Cerrar modal de video"
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Selector interactivo de las 7 técnicas fonoaudiológicas del Avatar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-0.5">
            <span>TÉCNICAS DISPONIBLES EN EL AVATAR IA:</span>
            <span className="text-emerald-400 font-mono">7 Técnicas Clínicas</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {Object.values(CLINICAL_TECHNIQUES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTechnique(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTech.id === t.id
                    ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reproductor o Contenedor de Video (Façade Pattern + Lazy Loading) */}
        <div
          ref={containerRef}
          className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-video flex flex-col items-center justify-center text-center"
        >
          {activeTech.videoUrl ? (
            isPlayingVideo && isInViewport ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={activeTech.videoUrl}
                  poster={activeTech.thumbnailUrl}
                  preload="metadata"
                  autoPlay
                  controls
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-contain bg-black rounded-2xl"
                />
                {/* Control interactivo de audio */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all cursor-pointer z-10 ${
                    isMuted
                      ? 'bg-zinc-950/85 hover:bg-zinc-900 border border-amber-500/60 text-amber-300'
                      : 'bg-zinc-950/85 hover:bg-zinc-900 border border-emerald-500/60 text-emerald-300'
                  }`}
                  aria-label={isMuted ? 'Activar audio del video' : 'Silenciar audio del video'}
                >
                  <span>{isMuted ? '🔇' : '🔊'}</span>
                  <span>{isMuted ? 'Activar audio' : 'Audio activo'}</span>
                </button>
              </div>
            ) : (
              <div
                onClick={handleStartPlay}
                className="relative w-full h-full cursor-pointer group overflow-hidden"
              >
                {activeTech.thumbnailUrl ? (
                  <Image
                    src={activeTech.thumbnailUrl}
                    alt={`Portada del video demostrativo de ${activeTech.name}`}
                    width={960}
                    height={540}
                    unoptimized
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                    <span>Sin imagen de portada</span>
                  </div>
                )}

                {/* Overlay oscuro para contraste y foco visual */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent group-hover:bg-zinc-950/20 transition-colors" />

                {/* Badge de video demostrativo */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 text-[11px] font-medium text-emerald-300 flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Avatar IA • Video Demostrativo de {activeTech.shortName}</span>
                  </span>
                </div>

                {/* Botón de reproducción central perfectamente centrado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleStartPlay}
                    aria-label={`Reproducir video demostrativo de ${activeTech.name}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.6)] group-hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950 pl-1">▶</span>
                  </button>
                </div>

                {/* Instrucción inferior */}
                <div className="absolute bottom-3 inset-x-0 text-center px-4 pointer-events-none">
                  <span className="inline-block text-xs font-semibold text-zinc-200 bg-zinc-950/85 backdrop-blur-sm border border-zinc-800/80 px-3.5 py-1.5 rounded-full shadow-sm">
                    ▶ Clic para reproducir video con audio directo
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3 max-w-md p-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-3xl animate-pulse">🎬</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-200">
                  Video Demostrativo de {activeTech.shortName}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El equipo clínico y audiovisual está produciendo la guía en video de alta definición para esta técnica. Puedes comenzar a entrenar de forma guiada con el visualizador interactivo ahora mismo.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-400 font-mono">
                <span>✓</span>
                <span>Visualizador interactivo 100% activo en la app</span>
              </div>
            </div>
          )}
        </div>

        {/* Pasos Prácticos de la Técnica */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2 text-left">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            📋 Protocolo Fisiológico Clave:
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {activeTech.practicalSteps.slice(0, 3).map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones del Modal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              if (onReportIssue && activeTech) {
                onReportIssue(activeTech);
              } else {
                setIsFeedbackOpen(true);
              }
            }}
            className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span>💬</span>
            <span>Reportar falla o duda en este video</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onStartPractice(activeTech);
                handleClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>Comenzar Práctica de {activeTech.shortName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Feedback Inyectado para Reportes Contextuales */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        defaultCategory="video_issue"
        defaultTechniqueId={activeTech.id}
      />
    </div>
  );
};
