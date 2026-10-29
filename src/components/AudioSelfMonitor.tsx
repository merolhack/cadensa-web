'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioSelfMonitorProps {
  isPlaying?: boolean;
}

export function AudioSelfMonitor({ isPlaying = false }: AudioSelfMonitorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage('Tu navegador no soporta captura de audio o requiere conexión segura (HTTPS).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);

        // Detener todos los tracks del stream para liberar el micrófono
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('No se pudo acceder al micrófono. Por favor verifica los permisos en tu navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTogglePlayback = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingBack(false);
      audioElementRef.current = audio;
    }

    if (isPlayingBack) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlayingBack(false);
    } else {
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.play().then(() => {
        setIsPlayingBack(true);
      }).catch(() => {
        setIsPlayingBack(false);
      });
    }
  };

  const handleDiscardAudio = () => {
    if (isPlayingBack && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlayingBack(false);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🎧</span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-200">
              Auto-Escucha Fonoaudiológica (Self-Monitoring)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Graba tu voz durante la práctica para evaluar propiocepción y cadencia silábica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Grabar Práctica</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg animate-pulse"
            >
              <span className="w-2.5 h-2.5 bg-white rounded-xs" />
              <span>Detener ({formatSeconds(recordingSeconds)})</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Reproductor de audio grabado */}
      {audioUrl && !isRecording && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900 border border-cyan-500/30 animate-fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlayback}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlayingBack
                  ? 'bg-cyan-500 text-zinc-950'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
              }`}
            >
              <span>{isPlayingBack ? '⏸️ Pausar' : '▶️ Escucharme'}</span>
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              Grabación lista ({formatSeconds(recordingSeconds)})
            </span>
          </div>

          <button
            onClick={handleDiscardAudio}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs border border-zinc-700 transition-colors cursor-pointer"
            title="Descartar grabación"
          >
            🗑️ Descartar
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
        <span>🔒</span>
        <span>
          <strong>Privacidad Zero Trust:</strong> Tu voz se graba y reproduce únicamente en la memoria local de tu dispositivo. Nunca se envía ni almacena en la nube.
        </span>
      </div>
    </div>
  );
}

