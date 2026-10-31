import React from 'react';
import Link from 'next/link';
import { BrowserCompatibilityBanner } from './BrowserCompatibilityBanner';

const CLINICAL_TECHNIQUE_LINKS = [
  { id: 'sts', name: 'Habla Rítmica Silábica (STS)', href: '/tecnicas/sts', icon: '⏱️' },
  { id: 'easy_onset', name: 'Inicio Suave (Easy Onset)', href: '/tecnicas/easy_onset', icon: '🍃' },
  { id: 'light_contact', name: 'Contacto Articulador Ligero', href: '/tecnicas/light_contact', icon: '🪶' },
  { id: 'prolonged_speech', name: 'Habla Prolongada', href: '/tecnicas/prolonged_speech', icon: '🌊' },
  { id: 'box_breathing', name: 'Respiración Cuadrada (4-4-4-4)', href: '/tecnicas/box_breathing', icon: '🧘' },
  { id: 'pull_out', name: 'Modificación en Bloqueo (Pull-Out)', href: '/tecnicas/pull_out', icon: '🔓' },
  { id: 'cancellation', name: 'Cancelación Post-Bloqueo', href: '/tecnicas/cancellation', icon: '🔄' },
];

const PLATFORM_LINKS = [
  { name: 'Acerca de Cadensa', href: '/about', icon: 'ℹ️' },
  { name: 'Estadísticas de Uso', href: '/stats', icon: '📊' },
  { name: 'Política de Privacidad', href: '/privacy', icon: '🛡️' },
  { name: 'Términos y Aviso Clínico', href: '/terms', icon: '⚖️' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="max-w-5xl w-full pt-8 pb-10 border-t border-zinc-900 text-xs text-zinc-400 space-y-8" data-testid="global-footer">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {/* Columna 1: Guías Clínicas Fonoaudiológicas */}
        <div className="space-y-3">
          <h4 className="text-zinc-100 font-bold uppercase tracking-wider text-[11px] text-emerald-400">
            Técnicas Fonoaudiológicas
          </h4>
          <ul className="space-y-2">
            {CLINICAL_TECHNIQUE_LINKS.map((tech) => (
              <li key={tech.id}>
                <Link
                  href={tech.href}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-xs">{tech.icon}</span>
                  <span>{tech.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 2: Plataforma y Aspectos Clínicos / Legales */}
        <div className="space-y-3">
          <h4 className="text-zinc-100 font-bold uppercase tracking-wider text-[11px] text-cyan-400">
            Plataforma & Comunidad
          </h4>
          <ul className="space-y-2">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-xs">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://www.facebook.com/AMTTM/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-zinc-400"
              >
                <span>🌐</span>
                <span>Asociación Mexicana de la Tartamudez (AMTTM)</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Columna 3: Información Médica y Compatibilidad */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
              <span>⚠️</span> Aviso Fonoaudiológico YMYL
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Cadensa es un entorno de biofeedback motor del habla y entrenamiento complementario. No sustituye la evaluación, diagnóstico ni terapia fonoaudiológica personalizada.
            </p>
          </div>
          <BrowserCompatibilityBanner />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-zinc-500 text-[11px]">
        <p>
          © 2026 Cadensa — Plataforma de Fluidez del Habla. Diseñado con enfoque en fonoaudiología clínica y accesibilidad.
        </p>
        <p className="text-zinc-600 font-mono text-[10px]">
          Arquitectura Zero Trust • Web Audio API • Next.js
        </p>
      </div>
    </footer>
  );
};
