---
title: "Hoja de Ruta Priorizada por Gemini Notebook (P0–P3)"
category: "roadmap"
tags: [roadmap, gemini-notebook, clinical, behavioral-design, p0, p1, p2, p3, webxr, fhir, act-cbt]
last_updated: "2026-11-19"
sources:
  - "Gemini Notebook: Cadensa: Fluidez y Terapia del Habla (015dcad0-c2a3-4512-97eb-59ac4293d8c0)"
related:
  - "wiki/roadmap/next_steps_plan.md"
  - "wiki/roadmap/strategic_roadmap_2026_2027.md"
  - "wiki/operations/gemini_notebook_integration.md"
  - "wiki/architecture/about_and_roadmap_sync.md"
---

# Hoja de Ruta Priorizada por Gemini Notebook (Horizontes P0–P3)

> **Origen:** Síntesis estratégica generada por el Gemini Notebook oficial de Cadensa (`015dcad0-c2a3-4512-97eb-59ac4293d8c0`) cruzando la LLM Wiki local (`v2.5.0`), telemetría real (GA4, GSC, Cloudflare) y 208 fuentes clínicas y de diseño conductual (Fogg Behavior Model, Octalysis ético, ACT/CBT, STS y Van Riper).  
> **Estado:** Planificado en el ROADMAP activo para ejecución progresiva (sincronizado con `/about`).

---

## Prioridad P0 — Corto Plazo Inmediato (Semanas 1 a 4)
*Foco: Retención del hábito diario móvil, cero penalización clínica y desbloqueo de autoridad de dominio.*

1. **Optimización del Core Loop Móvil sin Penalización Clínica (Fogg Behavior Model + Octalysis Ético)**
   - **Evidencia:** Telemetría GA4 confirma una recurrencia móvil de **3.76 sesiones/usuario** frente a 1.26 en escritorio.
   - **Acción:** Consolidar la **Práctica Rápida en 1 Toque (60s)** y los **Retos Diarios** (`DailyChallengeModal.tsx`) premiando exclusivamente la constancia, la respiración diafragmática y la aplicación técnica. Queda prohibido implementar penalizaciones por bloqueos o disfluencias (evitar mecánicas punitivas de "vidas" o "corazones" que elevan la ansiedad anticipatoria y detonan espasmos tónicos laríngeos).
   - **Implementación técnica:** Reforzar **Web App Manifest Shortcuts** persistentes y añadir recordatorios locales no intrusivos (notificaciones Web Push locales) en horarios pico de práctica.

2. **Migración a Dominio Canónico TLD Personalizado (Desbloqueo SEO, AdSense y YMYL)**
   - **Diagnóstico:** El subdominio `cadensa-web.pages.dev` mantiene en cero las impresiones orgánicas en Google Search Console y bloquea la aprobación de Google AdSense por no ser un dominio de segundo nivel (TLD).
   - **Acción:** Configurar un registro CNAME en Cloudflare DNS hacia un dominio TLD propio (ej. `cadensa.app`), heredando SSL automático, indexación canónica prioritaria en Google/Bing bajo criterios de salud YMYL y habilitación formal de monetización ética.

---

## Prioridad P1 — Corto a Mediano Plazo (Meses 2 a 4)
*Foco: Evolución del avatar fisiológico interactivo, personalización fonética por dialecto y regulación emocional.*

1. **Evolución del Agente Avatar Fonoaudiológico Fisiológico en Tiempo Real (WebGL/Three.js + Visemas ARKit/FACS)**
   - **Problema resuelto:** Escalar más allá de videos MP4 pre-renderizados (ComfyUI + SadTalker + Wav2Lip + GFPGAN) hacia miles de frases personalizadas y tempos dinámicos en tiempo real.
   - **Acción:** Evolucionar `VirtualSLPAvatarCore.tsx` con mallas anatómicas sincronizadas con `AudioWorklet` y `Web Speech API`, garantizando fidelidad fisiológica en:
     - Expansión torácica y diafragmática en **Respiración Cuadrada (4-4-4-4)**.
     - Aproximación glótica progresiva en **Inicios Suaves (*Easy Onset*)**.
     - Gradientes de calor labio-linguales para **Contacto Articular Ligero** (`/p, t, k, b, d, g/`).
     - Desaceleración consciente en **Pull-Out** y pausa reflexiva de 3 segundos en **Cancelación** de Van Riper.

2. **Expansión del Generador Dinámico de Textos Fonéticamente Balanceados por Dialecto (`phoneticTextGenerator.ts`)**
   - **Acción:** Adaptar dinámicamente las oraciones al perfil de fonemas diana de mayor bloqueo del usuario (oclusivas, fricativas, sinfones consonánticos), con progresión graduada (`monosílabas → bisílabas → oraciones compuestas`) calibrada para los 5 dialectos hispanohablantes soportados en `phoneticPresets.ts`.

3. **Módulo de Autorregistro Emocional y Defusión Cognitiva (ACT / CBT)**
   - **Acción:** Integrar al cierre de cada sesión una micro-escala subjetiva de 1 toque (**Nivel de Tensión Percibida 1–5** + registro opcional de **Situación Temida**) para apoyar la desensibilización sistemática y medir la reducción de la evitación comunicativa.

---

## Prioridad P2 — Mediano Plazo (Meses 5 a 8)
*Foco: Transferencia ecológica al mundo real, telepráctica fonoaudiológica e infancias.*

1. **Desensibilización Fóbica en Realidad Virtual WebXR (Exposición Social Gradual)**
   - **Fundamento clínico:** Cerrar la brecha entre la fluidez en consultorio/app y la transferencia bajo estrés social real.
   - **Acción:** Implementar 3 escenarios inmersivos en navegador con Three.js / WebXR manteniendo el biofeedback de metrónomo en segundo plano:
     1. Llamada telefónica simulada.
     2. Pedido en comercio o cafetería con presión de tiempo.
     3. Entrevista laboral o exposición en aula.

2. **Modo Dúo Fonoaudiólogo-Paciente en Telesalud WebRTC E2EE**
   - **Acción:** Potenciar `TelehealthRoom.tsx` para que especialista y paciente compartan en vivo el metrónomo maestro-esclavo, el analizador de formantes F1/F2 y la Diadococinesia Oral (`/pa-ta-ka/`) en una sala P2P cifrada sin servidores de medios intermedios.

3. **Cadensa Kids 2.0 y Protocolos Indirectos (Lidcombe / RESTART-DCM)**
   - **Acción:** Ampliar el módulo pediátrico con avatares lúdicos de tempo lento y una interfaz orientada a padres para registrar contingencias verbales positivas ("eso sonó muy suave", "qué bien hablaste") sin generar presión comunicativa en niños de 2 a 6 años.

---

## Prioridad P3 — Mediano a Largo Plazo (Meses 9 a 12)
*Foco: Interoperabilidad hospitalaria, distribución nativa offline y expansión multilingüe.*

1. **Conector Hospitalario SMART on FHIR y Piloto Clínico Institucional**
   - **Acción:** Implementar autorización OAuth 2.0 / SMART on FHIR mapeando observaciones de fluidez (`Observation`, `DiagnosticReport` con LOINC y SNOMED-CT) hacia expedientes clínicos electrónicos (EHR).
   - **Validación:** Formalizar un estudio piloto de telepráctica junto a la **Asociación Mexicana de la Tartamudez (AMTTM)** y especialistas del INR o IMSS respaldado por métricas objetivas de Diadococinesia (SPS y jitter motor).

2. **Empaquetado Nativo Offline-First con Capacitor (iOS / Android)**
   - **Acción:** Compilar la SPA estática con Capacitor para distribución en Apple App Store y Google Play Store garantizando operación 100% offline con latencia cero en motor de audio, avatar 3D y banco de ejercicios.

3. **Expansión Fonética Multilingüe (Portugués e Inglés)**
   - **Acción:** Extender formantes F1/F2, silabación y visemas del motor acústico hacia comunidades bilingües de Brasil, Estados Unidos y Europa.
