---
title: "Plan de Actividades y Hoja de Ruta para Cumplir el Objetivo de Cadensa"
category: "roadmap"
tags: [roadmap, planning, backlog, activities, milestones]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/clinical_foundations.md"
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/roadmap/product_evolution.md"
  - "wiki/architecture/overview.md"
  - "wiki/architecture/testing.md"
---

# Plan Maestro de Actividades: De PoC a Plataforma de Fluidez Integral

Este documento define la planificación detallada de actividades para transformar el PoC de infraestructura base de **Cadensa** en una plataforma de entrenamiento clínico interactivo del habla, lista para producción.

---

## 🎯 Objetivo Global
Proporcionar a personas con tartamudez y bloqueos del habla una plataforma web diaria, gamificada e interactiva basada en el método clínico de **Habla Rítmica Silábica (STS)**, garantizando una arquitectura de alto rendimiento, costo operativo casi nulo y seguridad Zero Trust.

---

## ⚙️ Reglas de Ejecución y Protocolo de Calidad
Cada actividad debe cumplir rigurosamente:
1. **Pruebas Unitarias Obligatorias:** Cobertura con Vitest y React Testing Library en `src/**/*.test.{ts,tsx}`.
2. **Pruebas BDD Obligatorias:** Especificaciones en Gherkin (`features/*.feature`) con Step Definitions en TypeScript (`features/step_definitions/*.ts`).
3. **Mantenimiento del LLM Wiki:** Actualizar las páginas afectadas en `wiki/` y registrar el progreso en `wiki/log.md`.
4. **Codebase Memory:** Validar rutas y contratos mediante `codebase-memory` (`home-merolhack-fl-cadensa-web`).
5. **Delegación a `ollama-local`:** Delegar tareas mecánicas a `consultar_modelo_local` (`gemma4:cloud` → `qwen3:8b-8k`).

---

## 🗓️ Desglose de Fases y Actividades

### FASE 1: Motor de Metrónomo y Pacing Multisensorial (Web Audio API)
*Objetivo: Proveer la señal isocrónica de temporización externa que sustituye el déficit de los ganglios basales.*

- [ ] **Actividad 1.1: Audio Engine con reloj Web Audio API de jitter cero.**
  - Implementar programador de tiempo lookahead basado en `AudioContext.currentTime` para pulsos de metrónomo sin desfase por el event loop de JavaScript.
  - Selección de sonidos suaves y nítidos (clicks de madera, senoidales modulados) para evitar fatiga acústica.
  - *Pruebas:* Unitarias en Vitest (cálculos de buffers y timing) y BDD (iniciar, pausar y ajustar BPM).
- [ ] **Actividad 1.2: Componente visual de pulso rítmico reactivo (`MetronomeVisual.tsx`).**
  - Orbe pulsante y anillo con gradientes esmeralda/cian sincronizado en el frame de animación con el pulso sonoro.
  - *Pruebas:* Unitarias de renderizado y BDD de feedback visual.
- [ ] **Actividad 1.3: Selector y calibrador de BPM.**
  - Controles accesibles para regular tempo de 60 a 160 BPM con preajustes clínicos (Principiante 70 BPM, Intermedio 95 BPM, Fluido 120 BPM).
  - *Pruebas:* Unitarias de validación y escenarios BDD de límites permitidos.

---

### FASE 2: Motor Fonético de Silabeo en Español (Syllabifier Engine)
*Objetivo: Permitir al usuario visualizar y pronunciar oraciones divididas en sílabas exactas al compás del pulso.*

- [ ] **Actividad 2.1: Algoritmo fonético de silabeo en TypeScript (`src/lib/syllables.ts`).**
  - Reglas ortográficas y fonéticas del español: separación de consonantes (ej. pr, bl, tr), diptongos (ia, ue), triptongos e hiatos acentuales (pa-ís).
  - *Pruebas:* Suite unitaria exhaustiva con más de 50 palabras complejas en español y escenarios BDD de división correcta.
- [ ] **Actividad 2.2: Componente interactivo de texto silábico (`SyllableReader.tsx`).**
  - Muestra la frase con las sílabas separadas visualmente (`Ca - den - sa`).
  - Resalta activamente la sílaba correspondiente en cada pulso del metrónomo.
  - *Pruebas:* Unitarias de sincronía temporal y BDD de navegación entre sílabas.
- [ ] **Actividad 2.3: Banco de frases clínicas graduadas.**
  - Catálogo de textos categorizados por nivel fonético (monosílabas, polisílabas, oraciones de longitud incremental).
  - *Pruebas:* Pruebas unitarias de integridad de datos y BDD de carga de ejercicios.

---

### FASE 3: Autenticación, Perfiles y Persistencia en Supabase
*Objetivo: Almacenar de forma segura el progreso, configuraciones y sesiones del usuario.*

- [ ] **Actividad 3.1: Migración del esquema relacional de entrenamiento.**
  - Crear tablas `public.exercises`, `public.training_sessions` y `public.user_streaks`.
  - Habilitar RLS estricto en cada una con políticas vinculadas a `auth.uid()`.
  - *Pruebas:* Verificación de migraciones y scripts de prueba en Supabase local.
- [ ] **Actividad 3.2: Regeneración de tipos TypeScript.**
  - Ejecutar `npm run supabase:gen-types` y actualizar contratos en `src/types/supabase.ts`.
  - *Pruebas:* `npx tsc --noEmit` sin errores de tipo.
- [ ] **Actividad 3.3: Vistas y flujo de Autenticación en cliente.**
  - Pantallas de Login, Registro y Magic Link con validación de formularios y feedback de error.
  - *Pruebas:* Unitarias de componentes con mocks de Supabase y escenarios BDD de registro e inicio de sesión.

---

### FASE 4: Captura de Voz y Evaluación de Precisión Rítmica
*Objetivo: Escuchar al usuario y verificar en tiempo real si emite el sonido sincronizado con el pulso.*

- [ ] **Actividad 4.1: Módulo de captura de micrófono con Web Audio API.**
  - `MediaStream` y detector de umbral de energía (VAD - Voice Activity Detection ligero).
  - *Pruebas:* Unitarias con AudioNode mockeado y BDD de permiso y activación de micrófono.
- [ ] **Actividad 4.2: Algoritmo de medición de desfase temporal (Voice Onset Offset).**
  - Comparar la marca de tiempo del inicio del sonido con el pulso ideal del metrónomo (ventana de tolerancia en ms).
  - Calificación de precisión: Perfecto (< ±50ms), Bueno (< ±100ms), Desfasado.
  - *Pruebas:* Unitarias matemáticas y BDD de puntuación rítmica.
- [ ] **Actividad 4.3: Retroalimentación multisensorial en vivo.**
  - Indicadores de color en la sílaba y vibración háptica en dispositivos móviles compatibles (`navigator.vibrate`).
  - *Pruebas:* Unitarias de disparadores de evento y BDD de feedback al usuario.

---

### FASE 5: Gamificación, Hábitos y Dashboard de Progreso
*Objetivo: Garantizar la adherencia a largo plazo al entrenamiento para generar neuroplasticidad.*

- [ ] **Actividad 5.1: Motor de cálculo de rachas diarias (Daily Streaks).**
  - Lógica de cálculo de racha actual, racha máxima y días de congelamiento (freeze days).
  - *Pruebas:* Unitarias de cambio de huso horario y fechas, escenarios BDD de cálculo de racha.
- [ ] **Actividad 5.2: Panel de usuario (`/dashboard`).**
  - Gráficos de evolución de tempo (BPM alcanzado a lo largo de las semanas) y minutos entrenados.
  - *Pruebas:* Unitarias de renderizado de estadísticas y BDD de visualización de progreso.
- [ ] **Actividad 5.3: Sistema de niveles e hitos terapéuticos.**
  - Reconocimientos de confianza comunicativa y metas cumplidas.
  - *Pruebas:* Unitarias de lógica de desbloqueo y BDD de asignación de logros.

---

### FASE 6: PWA Offline-First y Despliegue en Producción
*Objetivo: Permitir el uso de Cadensa en cualquier lugar sin conexión y optimizar el rendimiento al máximo.*

- [ ] **Actividad 6.1: Configuración PWA y Service Worker.**
  - Manifiesto web (`manifest.json`), iconos táctiles e instalación como app en iOS/Android.
  - Almacenamiento en caché de ejercicios y sonidos de metrónomo para práctica offline.
  - *Pruebas:* Unitarias de registro de SW y BDD de disponibilidad de contenido en offline.
- [ ] **Actividad 6.2: Auditoría Core Web Vitals y Accesibilidad WCAG 2.1 AA.**
  - LCP < 1.2s, CLS = 0, contraste accesible y soporte de navegación por teclado.
  - *Pruebas:* Lighthouse audit automatizado en CI.
- [ ] **Actividad 6.3: Validación de CI/CD a Cloudflare Pages y dominio personalizado.**
  - Despliegue productivo y verificación de headers de seguridad HTTP.
