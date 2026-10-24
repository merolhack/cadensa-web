'use client';

import React, { useState } from 'react';
import {
  TechniqueId,
  CLINICAL_TECHNIQUES,
  TECHNIQUE_FAMILIES,
  ClinicalTechnique,
} from '@/lib/clinicalTechniques';

interface GlobalFaqItem {
  id: string;
  category: string;
  question: string;
  badge?: string;
  answer: React.ReactNode;
}

const GLOBAL_BUTTON_FAQS: GlobalFaqItem[] = [
  {
    id: 'controles-principales',
    category: 'Controles Principales',
    question: '¿Para qué sirven los botones de reproducción, audio, respiración y guardado?',
    badge: 'Básicos',
    answer: (
      <ul className="space-y-2.5 text-zinc-300">
        <li>
          <strong className="text-emerald-400">▶️ Comenzar Práctica Rítmica / ⏸️ Pausar Entrenamiento:</strong>{' '}
          Inicia o detiene el metrónomo sonoro y visual. Al activarlo, cada sílaba del ejercicio se iluminará de forma sincronizada al ritmo configurado.
        </li>
        <li>
          <strong className="text-cyan-400">🔊 Audio / 🔇 Mute:</strong>{' '}
          Activa o silencia el pulso acústico del metrónomo. Si prefieres practicar guiándote únicamente por el orbe visual, activa el modo silencioso.
        </li>
        <li>
          <strong className="text-blue-400">🌬️ Respirar:</strong>{' '}
          Abre el marcapasos de respiración diafragmática (técnica 4-4-4-4 Box Breathing: Inhalar, Sostener, Exhalar, Pausa) para relajar las cuerdas vocales y calmar la tensión corporal antes de articular palabras.
        </li>
        <li>
          <strong className="text-emerald-300">💾 Guardar (tiempo):</strong>{' '}
          Aparece automáticamente cuando tu práctica supera los 5 segundos continuos. Registra la duración, tempo y precisión en tu historial local y en la nube.
        </li>
      </ul>
    ),
  },
  {
    id: 'sincronia-vocal',
    category: 'Evaluación Rítmica',
    question: '¿Qué hace el botón "🎙️ Registrar Sílaba" y cómo mide la precisión?',
    badge: 'Evaluación',
    answer: (
      <div className="space-y-2 text-zinc-300">
        <p>
          Aparece únicamente cuando el metrónomo está en reproducción. Puedes pulsarlo en el momento exacto en que emites cada sílaba en voz alta. El sistema calcula en milisegundos tu desfase frente al pulso del reloj:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li><span className="text-emerald-400 font-semibold">¡A compás perfecto! (diferencia ≤ 60ms):</span> 100 puntos y micro-vibración háptica de confirmación en móviles.</li>
          <li><span className="text-cyan-400 font-semibold">Buen ritmo (diferencia ≤ 120ms):</span> 80 puntos de precisión.</li>
          <li><span className="text-amber-400 font-semibold">Desfasado (&gt; 120ms):</span> 40 puntos; te indica que la pronunciación fue adelantada o retrasada.</li>
        </ul>
        <p className="text-xs text-zinc-400">
          Esta métrica se promedia en tu sesión y otorga puntos de experiencia (XP) para desbloquear insignias clínicas en tu perfil.
        </p>
      </div>
    ),
  },
  {
    id: 'fading-reto',
    category: 'Desafíos Clínicos',
    question: '¿Qué significa el botón "🎯 Reto Activo / Fading"?',
    badge: 'Avanzado',
    answer: (
      <div className="space-y-2 text-zinc-300">
        <p>
          Es el <strong className="text-purple-300">desafío de atenuación rítmica progresiva</strong>. Al encenderlo, el metrónomo reproduce <strong>4 compases sonoros seguidos de 2 compases en absoluto silencio</strong>.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Su objetivo terapéutico es entrenar tu cerebro para que internalice la cadencia y mantenga el ritmo mentalmente sin volverse dependiente de un sonido continuo, facilitando la transferencia a conversaciones reales.
        </p>
      </div>
    ),
  },
  {
    id: 'categorias-frases',
    category: 'Catálogo de Ejercicios',
    question: '¿Qué representan las categorías (Todas, Fonética, Diadococinesia, Vocales, Polisílabos) y el botón "+ Mi Frase"?',
    badge: 'Terapéutica',
    answer: (
      <ul className="space-y-2 text-zinc-300">
        <li>
          <strong className="text-zinc-100">Fonética:</strong> Ejercicios de estabilización silábica con oraciones cotidianas para ganar fluidez natural.
        </li>
        <li>
          <strong className="text-zinc-100">Diadococinesia:</strong> Práctica motriz veloz coordinando labios y lengua (ej. secuencias <em>Pa-ta-ka</em>) para fortalecer el control orofacial.
        </li>
        <li>
          <strong className="text-zinc-100">Vocales:</strong> Coordinación de aire y fonación suave evitando bloqueos en sonidos vocálicos abiertos.
        </li>
        <li>
          <strong className="text-zinc-100">Polisílabos:</strong> Articulación precisa de palabras largas y complejas estructuradas en compases isocrónicos.
        </li>
        <li>
          <strong className="text-cyan-400">+ Mi Frase:</strong> Te permite escribir cualquier oración o palabra que te cueste trabajo en tu día a día (tu nombre, ciudad, trabajo); Cadensa la silabificará automáticamente para que la practiques.
        </li>
      </ul>
    ),
  },
  {
    id: 'tempo-compas-timbre',
    category: 'Parámetros Musicales y Accesibilidad',
    question: '¿Cómo funcionan los controles de BPM, Compás (4/4, 3/4, 2/4), Timbres y Tamaño de Texto?',
    badge: 'Ajustes',
    answer: (
      <ul className="space-y-2 text-zinc-300 text-xs sm:text-sm">
        <li>
          <strong className="text-emerald-400">Velocidad (BPM) con slider y botones - / +:</strong> Determina las pulsaciones por minuto (de 60 a 160 BPM). Lo recomendado para iniciar es entre 70 y 85 BPM.
        </li>
        <li>
          <strong className="text-zinc-100">Compás (4/4, 3/4, 2/4):</strong> Define cuántos tiempos tiene cada compás y dónde recae el acento. 4/4 es el estándar equilibrado, 3/4 para ritmo ternario y 2/4 para oraciones cortas binarias.
        </li>
        <li>
          <strong className="text-zinc-100">Timbres (Clásico, Madera, Digital):</strong> Selecciona el sonido sintético del pulso: onda senoidal clásica, percusión orgánica de madera (woodblock) o pulso digital suave sin ataque cortante para evitar fatiga auditiva.
        </li>
        <li>
          <strong className="text-zinc-100">Texto (A / A+ / A++):</strong> Ajusta la escala visual de las sílabas entre tamaño normal, grande o extra-grande para lectura descansada.
        </li>
      </ul>
    ),
  },
  {
    id: 'perfil-sesion',
    category: 'Progreso y Cuentas',
    question: '¿Qué información muestra la racha 🔥 y el botón de inicio de sesión?',
    badge: 'Perfil',
    answer: (
      <div className="space-y-2 text-zinc-300">
        <p>
          El botón <strong className="text-emerald-400">🔥 Racha</strong> abre tu panel con estadísticas: días consecutivos entrenando, minutos diarios (meta recomendada: 5 minutos al día), puntos XP e insignias obtenidas.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          El botón <strong className="text-zinc-100">👤 Iniciar Sesión</strong> te permite vincular tu cuenta con Google OAuth o correo para respaldar tus estadísticas en la nube de Supabase. Si no inicias sesión, puedes practicar sin problemas como invitado: todo se guarda en la memoria local de tu dispositivo.
        </p>
      </div>
    ),
  },
];

interface FaqAndMethodologyProps {
  activeTechniqueId?: TechniqueId;
  onSelectTechnique?: (technique: ClinicalTechnique) => void;
}

export const FaqAndMethodology: React.FC<FaqAndMethodologyProps> = ({
  activeTechniqueId,
  onSelectTechnique,
}) => {
  const [userSelectedTab, setUserSelectedTab] = useState<'general' | TechniqueId | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>('controles-principales');

  const selectedTab = userSelectedTab ?? activeTechniqueId ?? 'general';

  const selectTab = (tab: 'general' | TechniqueId) => {
    setUserSelectedTab(tab);
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const currentTechnique = selectedTab !== 'general' ? CLINICAL_TECHNIQUES[selectedTab] : null;

  return (
    <div className="w-full max-w-3xl space-y-6 my-4 animate-fade-in text-left">
      {/* SECCIÓN 1: FAQ - GUÍA DE BOTONES Y TÉCNICAS */}
      <section
        aria-label="Preguntas Frecuentes y Guía de Uso"
        className="p-4 sm:p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <span>❓</span>
              <span>Preguntas Frecuentes y Guía de Botones</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Consulta las respuestas de uso general o selecciona una técnica clínica para ver su guía especializada
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            Guía Interactiva
          </span>
        </div>

        {/* Pestañas de Navegación por Técnica y General */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              selectTab('general');
              setOpenFaqId('controles-principales');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedTab === 'general'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            📋 Botones Globales
          </button>

          {Object.values(CLINICAL_TECHNIQUES).map((tech) => {
            const isTabActive = selectedTab === tech.id;
            return (
              <button
                key={tech.id}
                onClick={() => {
                  selectTab(tech.id);
                  setOpenFaqId(tech.faqItems[0]?.id || null);
                  if (onSelectTechnique) {
                    onSelectTechnique(tech);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTabActive
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{tech.icon}</span>
                <span>{tech.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta explicativa de la técnica seleccionada si no está en 'general' */}
        {currentTechnique && (
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentTechnique.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{currentTechnique.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">{currentTechnique.badge} • Dificultad {currentTechnique.difficulty}</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                🎯 {currentTechnique.clinicalObjective}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentTechnique.summary}
            </p>

            {/* Pasos de ejecución paso a paso */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Instrucciones prácticas de ejecución:
              </span>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-300">
                {currentTechnique.practicalSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Listado de Acordeón según pestaña activa */}
        <div className="space-y-2">
          {selectedTab === 'general' ? (
            GLOBAL_BUTTON_FAQS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? 'bg-zinc-950/80 border-emerald-500/30 shadow-md'
                      : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 whitespace-nowrap">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        {item.question}
                      </span>
                    </div>
                    <span
                      className={`text-zinc-400 text-xs transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm border-t border-zinc-900 leading-relaxed text-zinc-300">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            currentTechnique?.faqItems.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? 'bg-zinc-950/80 border-emerald-500/30 shadow-md'
                      : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-3 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {faq.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 whitespace-nowrap">
                          {faq.badge}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        {faq.question}
                      </span>
                    </div>
                    <span
                      className={`text-zinc-400 text-xs transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm border-t border-zinc-900 leading-relaxed text-zinc-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECCIÓN 2: FUNDAMENTO CLÍNICO - QUÉ ES HABLA RÍTMICA SILÁBICA (STS) Y FAMILIAS DE TRATAMIENTO */}
      <section
        aria-label="Fundamento Clínico de Habla Rítmica Silábica"
        className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-emerald-950/30 border border-emerald-500/20 shadow-xl space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
          <span className="text-2xl p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            🧠
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-zinc-100">
              ¿Qué es el Habla Rítmica Silábica (STS)?
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              Bases neurobiológicas, evidencia empírica y cómo apoya a las personas con tartamudez
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>
            El <strong>Habla Rítmica Silábica</strong> (conocido en la literatura científica internacional como <em>Syllable-Timed Speech</em> o técnica de ritmo isocrónico) es una intervención fonoaudiológica con amplio respaldo empírico en la que la persona <strong>asigna conscientemente a cada sílaba la misma duración temporal</strong>, apoyándose en una cadencia auditiva o visual regular.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
              <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <span>⚡</span>
                <span>¿Por qué funciona en el cerebro?</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                En la tartamudez existe un desfase funcional en los circuitos cortico-estriado-tálamo-corticales y ganglios basales encargados del reloj interno y temporización del habla. El pulso externo del metrónomo actúa como un <strong>marcapasos neural alternativo</strong>, activando las redes auditivo-motoras suplementarias que circunvalan la vía afectada y previenen el bloqueo antes de que ocurra.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
              <div className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Alivio de la ansiedad anticipatoria</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Al tener una referencia temporal predecible para cada sonido, se reduce la incertidumbre motriz de las cuerdas vocales y la lengua. Esto disminuye notablemente el miedo anticipatorio al bloqueo y ayuda a emitir las palabras con suavidad (<em>easy onset</em>).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-emerald-500/20 space-y-2">
            <div className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
              <span>📈</span>
              <span>Neuroplasticidad y transferencia a la vida diaria</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              La práctica deliberada de <strong>5 a 10 minutos diarios</strong> ayuda a consolidar patrones neuromotores más estables. Mediante el desafío de atenuación rítmica (fading), el objetivo no es hablar siempre como robot, sino internalizar una cadencia serena y controlada que puedas evocar cuando sientas tensión en situaciones cotidianas, laborales o sociales.
            </p>
          </div>

          {/* Resumen de las 3 Familias Fonoaudiológicas */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            <span className="font-bold text-xs text-zinc-200">
              Ecosistema Integral de Técnicas en Cadensa:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {TECHNIQUE_FAMILIES.map((fam) => (
                <div key={fam.id} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <span>{fam.icon}</span>
                    <span className="text-[11px]">{fam.name.split('(')[0]}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {fam.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
