---
title: "Evolución de Producto: Del PoC al MVP Interactivo"
category: "roadmap"
tags: [roadmap, product, mvp, audio, speech-recognition, gamification]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/clinical_foundations.md"
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/architecture/overview.md"
---

# Evolución de Producto: Del PoC al MVP Interactivo

Este documento consolida la visión técnica y funcional para la transición de Cadensa desde su estado actual (**PoC de Infraestructura Base**) hacia un **Producto Mínimo Viable (MVP)** completamente funcional.

---

## 1. Estado Actual: PoC de Infraestructura Base (v0.1)

Actualmente, el repositorio cuenta con los cimientos técnicos validados:
- [x] Aplicación Next.js 16 con React 19 configurada con `output: 'export'`.
- [x] Estilos base con Tailwind CSS v4 en modo oscuro (`bg-zinc-950`).
- [x] Cliente Supabase tipado (`src/lib/supabaseClient.ts`).
- [x] Migración inicial con tabla `public.profiles`, triggers y políticas RLS.
- [x] Pipeline CI/CD en GitHub Actions para despliegue automatizado a Cloudflare Pages.

---

## 2. Fase MVP 1: Módulo Interactivo de Ritmo y Habla Silábica

El primer hito funcional requiere desarrollar las herramientas de entrenamiento en cliente:

### 2.1 Metrónomo Visual y Sonoro (Web Audio API)
- Generación de pulsos auditivos precisos y libres de jitter mediante el reloj nativo del navegador (`AudioContext.currentTime`).
- Señal visual sincronizada (círculo pulsante con gradientes esmeralda/cian) para apoyo multisensorial.
- Control de tempo ajustable en tiempo real (60 BPM a 140 BPM).

### 2.2 Segmentador Silábico en Español (Syllabifier Engine)
- Módulo en TypeScript para dividir oraciones en sílabas fonéticas respetando diptongos, hiatos y acentuación.
- Ejemplo visual en pantalla:
  ```
  [ Ca ] ── [ den ] ── [ sa ]
    ●          ●          ●   (Pulso rítmico sincronizado)
  ```

---

## 3. Fase MVP 2: Persistencia, Sesiones y Gamificación

Para lograr el modelo "Duolingo del ritmo":

### 3.1 Esquema de Base de Datos para Entrenamiento
Nuevas tablas a incorporar en `supabase/migrations/`:
- `public.exercises`: Catálogo de textos, frases y niveles de dificultad (sílabas aisladas → palabras → oraciones complejas).
- `public.training_sessions`: Registro de sesiones completadas (duración, tempo BPM utilizado, fecha, usuario).
- `public.user_streaks`: Cálculo de rachas diarias para fomentar la constancia terapéutica.

### 3.2 Interfaz de Autenticación
- Vistas de inicio de sesión y registro mediante Supabase Auth (correo y contraseña / Magic Link).
- Panel de perfil de usuario (`/profile` o `/dashboard`) con gráfico de actividad semanal.

---

## 4. Fase MVP 3: Detección y Análisis de Voz (Web Speech API / Audio Worklet)

- Captura de audio en tiempo real desde el micrófono del usuario.
- Análisis de sincronía: Medir si el usuario emite sonido en sincronía con el golpe del metrónomo.
- Reporte de precisión rítmica al finalizar cada micro-sesión diaria.
