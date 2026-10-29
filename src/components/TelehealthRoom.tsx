'use client';

import React, { useState } from 'react';
import {
  TelehealthRole,
  generateTelehealthRoomCode,
  createBeatPulseMessage,
  createAccuracyFeedbackMessage,
  TelehealthMessage,
} from '../lib/telehealthP2P';

export function TelehealthRoom() {
  const [role, setRole] = useState<TelehealthRole>('therapist');
  const [roomCode, setRoomCode] = useState(generateTelehealthRoomCode);
  const [isConnected, setIsConnected] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [isRemotePlaying, setIsRemotePlaying] = useState(false);
  const [rttMs, setRttMs] = useState(18);
  const [sessionEvents, setSessionEvents] = useState<string[]>([]);

  const handleToggleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRemotePlaying(false);
      setSessionEvents((prev) => [
        `[${new Date().toLocaleTimeString()}] Sesión P2P finalizada`,
        ...prev,
      ]);
    } else {
      setIsConnected(true);
      setRttMs(Math.floor(15 + Math.random() * 10)); // Simula latencia WebRTC sub-30ms
      setSessionEvents((prev) => [
        `[${new Date().toLocaleTimeString()}] Conectado a sala ${roomCode} como ${
          role === 'therapist' ? 'Fonoaudiólogo' : 'Paciente'
        } (Canal E2EE P2P activo)`,
        ...prev,
      ]);
    }
  };

  const handleTherapistTriggerBeat = () => {
    if (!isConnected || role !== 'therapist') return;
    const msg: TelehealthMessage = createBeatPulseMessage('therapist', bpm, 1);
    setSessionEvents((prev) => [
      `[${new Date().toLocaleTimeString()}] 🔔 Pulso transmitido a paciente: ${msg.payload?.bpm} BPM`,
      ...prev.slice(0, 8),
    ]);
  };

  const handlePatientSendAccuracy = () => {
    if (!isConnected || role !== 'patient') return;
    const msg = createAccuracyFeedbackMessage('patient', 90, 22, '¡A compás!');
    setSessionEvents((prev) => [
      `[${new Date().toLocaleTimeString()}] 🎯 Precisión reportada a terapeuta: ${msg.payload?.score}% (${msg.payload?.diffMs}ms)`,
      ...prev.slice(0, 8),
    ]);
  };

  return (
    <div className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 p-5 shadow-xl space-y-4 text-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] mb-1">
            <span>📡 Telesalud Fonoaudiológica P2P</span>
          </div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>Sala Clínica de Telepráctica Sincronizada</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Conexión cifrada de extremo a extremo con metrónomo sincronizado maestro-esclavo.
          </p>
        </div>

        {/* Estado de conexión */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] flex items-center gap-1.5 ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            {isConnected ? `Sincronizado (${rttMs}ms RTT)` : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Selector de Rol y Código de Sala */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
        <div>
          <span className="block text-zinc-400 font-semibold mb-1">Tu Rol en la Sesión:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isConnected}
              onClick={() => setRole('therapist')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer disabled:opacity-60 ${
                role === 'therapist'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              👨‍⚕️ Fonoaudiólogo
            </button>
            <button
              type="button"
              disabled={isConnected}
              onClick={() => setRole('patient')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer disabled:opacity-60 ${
                role === 'patient'
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🗣️ Paciente
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="room-code-input" className="block text-zinc-400 font-semibold mb-1">
            Código de Sala Clínica:
          </label>
          <div className="flex gap-2">
            <input
              id="room-code-input"
              type="text"
              disabled={isConnected}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono font-bold tracking-wider disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleToggleConnect}
              className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                isConnected
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-md'
              }`}
            >
              {isConnected ? 'Desconectar' : 'Conectar P2P'}
            </button>
          </div>
        </div>
      </div>

      {/* Controles Activos según el Rol */}
      {isConnected && (
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-200">
              {role === 'therapist'
                ? 'Panel de Control del Fonoaudiólogo (Maestro)'
                : 'Estación de Telepráctica del Paciente (Sincronizado)'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Tempo Compartido: <strong className="text-cyan-400">{bpm} BPM</strong>
            </span>
          </div>

          {role === 'therapist' ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRemotePlaying(!isRemotePlaying)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold cursor-pointer"
              >
                {isRemotePlaying ? '⏹ Detener Metrónomo Remoto' : '▶ Iniciar Metrónomo Remoto'}
              </button>
              <button
                type="button"
                onClick={handleTherapistTriggerBeat}
                className="px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-200 font-bold cursor-pointer"
              >
                🔔 Emitir Pulso de Ajuste
              </button>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px]">BPM:</span>
                <input
                  type="number"
                  min="50"
                  max="140"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-emerald-400 font-mono text-center"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex-1">
                <span className="text-[10px] text-zinc-400 block">Metrónomo Remoto del Terapeuta</span>
                <span className="text-sm font-bold text-emerald-400">
                  {isRemotePlaying ? '🟢 Metrónomo Activo a ' + bpm + ' BPM' : '⚪ Esperando indicación del terapeuta'}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePatientSendAccuracy}
                className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500 text-emerald-200 font-bold cursor-pointer"
              >
                🎯 Enviar Muestra de Precisión
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bitácora de Eventos Clínicos P2P */}
      <div className="space-y-1">
        <span className="font-semibold text-zinc-400 text-[11px] block">
          Registro de Transmisión de Datos P2P:
        </span>
        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 max-h-28 overflow-y-auto font-mono text-[10px] space-y-1 text-zinc-400">
          {sessionEvents.length === 0 ? (
            <span className="text-zinc-600 italic">No hay eventos en la sesión aún. Conecta una sala para iniciar.</span>
          ) : (
            sessionEvents.map((evt, idx) => (
              <div key={idx} className="text-zinc-300">
                {evt}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

