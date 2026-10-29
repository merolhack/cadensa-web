'use client';

import React, { useState } from 'react';

interface BrowserInfo {
  name: string;
  icon: string;
  status: 'optimal' | 'compatible' | 'standard';
  badgeText: string;
  badgeColor: string;
  notes: string;
}

function detectBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'Navegador Web Estándar',
      icon: '🌐',
      status: 'standard',
      badgeText: 'Compatible',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      notes: 'Soporte estándar para Web Audio y técnicas de metrónomo rítmico.',
    };
  }

  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) {
    return {
      name: 'Microsoft Edge',
      icon: '🌊',
      status: 'optimal',
      badgeText: 'Compatibilidad Óptima 100%',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      notes: 'Soporte completo de AudioWorklet, Web Speech, WebRTC y aceleración gráfica.',
    };
  }
  if (ua.includes('OPR/') || ua.includes('Opera')) {
    return {
      name: 'Opera',
      icon: '🔴',
      status: 'optimal',
      badgeText: 'Compatibilidad Óptima 100%',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      notes: 'Motor Chromium con soporte nativo de baja latencia y Web Speech API.',
    };
  }
  if (ua.includes('Firefox')) {
    return {
      name: 'Mozilla Firefox',
      icon: '🦊',
      status: 'compatible',
      badgeText: 'Compatible (Modo Acústico)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      notes: 'AudioWorklet, Formantes F1/F2 y Telesalud al 100%. Web Speech en modo acústico de respaldo.',
    };
  }
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    return {
      name: 'Apple Safari',
      icon: '🧭',
      status: 'optimal',
      badgeText: 'Compatibilidad Óptima (WebKit)',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      notes: 'Requiere primer toque para activar audio. Soporte de WebRTC y Web Speech en iOS y macOS.',
    };
  }
  if (ua.includes('Chrome')) {
    return {
      name: 'Google Chrome',
      icon: '🚀',
      status: 'optimal',
      badgeText: 'Compatibilidad Óptima 100%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      notes: 'Soporte integral y máxima aceleración en todas las herramientas clínicas.',
    };
  }

  return {
    name: 'Navegador Web Estándar',
    icon: '🌐',
    status: 'standard',
    badgeText: 'Compatible',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    notes: 'Soporte estándar para Web Audio y técnicas de metrónomo rítmico.',
  };
}

export function BrowserCompatibilityBanner() {
  const [browserInfo] = useState<BrowserInfo>(() => detectBrowserInfo());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      {/* Píldora de estado de compatibilidad */}
      <div className="w-full bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-1.5 text-xs text-zinc-300 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-sm">{browserInfo.icon}</span>
          <span className="font-semibold text-zinc-200">{browserInfo.name}:</span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${browserInfo.badgeColor}`}>
            {browserInfo.badgeText}
          </span>
          <span className="hidden md:inline text-zinc-400 text-[11px] truncate">{browserInfo.notes}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold text-[11px] cursor-pointer"
          >
            Ver matriz de navegadores
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-1 cursor-pointer"
            title="Cerrar aviso"
          >
            ×
          </button>
        </div>
      </div>

      {/* Modal con la Matriz de Compatibilidad Cross-Browser */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-50">
                <span>🌐</span>
                <span>Matriz de Compatibilidad Multi-Navegador</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Cadensa está diseñada bajo el estándar <strong>Zero Trust</strong> y ejecuta algoritmos de audio y fonoaudiología 100% en el dispositivo del usuario. A continuación se detalla el soporte por navegador:
            </p>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Chrome / Edge / Opera */}
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                    <span>🚀</span> Google Chrome • Microsoft Edge • Opera
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    100% Óptimo
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  AudioWorklet de baja latencia (&lt; 5ms), Web Speech API, Telesalud WebRTC DataChannel y gráficos de formantes F1/F2 acelerados por hardware.
                </p>
              </div>

              {/* Safari macOS / iOS */}
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-blue-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <span>🧭</span> Apple Safari (macOS &amp; iOS WebKit)
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40 font-bold">
                    100% Óptimo
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Desbloqueador automático de AudioContext en el primer toque. WebRTC DataChannel y soporte de viewport dinámico (100dvh) para evitar solapes con la barra de gestos de iOS.
                </p>
              </div>

              {/* Firefox */}
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span>🦊</span> Mozilla Firefox (Gecko)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                    Compatible
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Metrónomo de alta precisión, formantes y telesalud totalmente funcionales. Si la API Web Speech no está habilitada por el sistema, Cadensa activa automáticamente el modo de práctica foniátrica acústica por VAD.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
              >
                Entendido, continuar practicando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
