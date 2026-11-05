---
title: "Arquitectura Frontend: Next.js & Tailwind CSS"
category: "architecture"
tags: [frontend, nextjs, react, tailwind, typescript]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/overview.md"
  - "wiki/concepts/static_spa_paradigm.md"
  - "wiki/entities/supabase.md"
---

# Arquitectura Frontend

El frontend de Cadensa es una aplicación web interactiva desarrollada con **Next.js 16**, **React 19** y **TypeScript 5**, estilizada con la versión moderna de **Tailwind CSS v4**.

---

## 1. Configuración de Exportación Estática

En `next.config.ts`, la aplicación está configurada explícitamente para compilar como un sitio estático puro:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Implicaciones de `output: 'export'`
- **Destino del Build:** La ejecución de `npm run build` genera la carpeta `out/` que contiene archivos `.html`, `.js` y `.css` listos para ser servidos por cualquier servidor web o CDN estático (Cloudflare Pages).
- **Imágenes:** Al no haber un runtime Node.js ejecutando `next/image` en servidor para optimizar dinámicamente imágenes WebP/AVIF, se requiere `images.unoptimized = true`.
- **Rutas de Servidor (API Routes / Server Actions):** No están permitidas en esta modalidad de exportación estática; toda interacción dinámica se hace directamente hacia el backend de Supabase.

---

## 2. Paradigma de Componentes: Client Components Obligatorios

Dado que la aplicación depende de estado interactivo (metrónomos de audio, captura de voz, autenticación y consultas a Supabase), los componentes deben marcarse explícitamente con `'use client'`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
```

---

## 3. Sistema de Estilos y Estética (Tailwind CSS v4)

La aplicación utiliza la versión 4 de Tailwind CSS con `@tailwindcss/postcss`.

### Principios de Diseño:
- **Dark Mode Primario:** Paleta oscura profunda (`bg-zinc-950`, `border-zinc-800`, textos en `text-zinc-50` y `text-zinc-400`).
- **Acentos Energéticos & Terapéuticos:** Gradientes de esmeralda a cian (`from-emerald-400 to-cyan-400`), aportando una sensación de modernidad, ritmo y calma clínica sin caer en la frialdad médica convencional.
- **Tipografía y Legibilidad:** Espaciado amplio y jerarquía tipográfica contrastada para reducir la carga cognitiva de los usuarios.

---

## 4. Estructura de Directorios Frontend (`src/`)

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css          # Estilos globales y directivas de Tailwind v4
│   ├── layout.tsx           # Shell HTML base y fuentes
│   └── page.tsx             # Landing / Vista inicial del PoC
├── lib/
│   └── supabaseClient.ts    # Instancia singleton tipada del cliente Supabase
└── types/
    └── supabase.ts          # Interfaces de base de datos autogeneradas
```


---

## 5. Arquitectura PWA v2.5.0, Capacidades Offline y Módulos Clínicos

La versión 2.5.0 consolida la aplicación como una Progressive Web App (PWA) optimizada para entornos clínicos, priorizando la disponibilidad offline de recursos multimedia pesados, la privacidad de los datos del paciente y la usabilidad móvil.

### 1. Consolidación de Versión
Se ha implementado un sistema de versionado unificado para garantizar la coherencia entre el despliegue y la ejecución:
- **`package.json` & `package-lock.json`:** Versión canónica `2.5.0`.
- **Badges Frontend:** Indicadores visuales en landing, header de práctica y página de información (`/about`).
- **Tipado Estricto:** Sincronización en TypeScript sin uso de `any` en utilitarios clínicos y exportadores.

### 2. Manifiesto y Adaptabilidad Móvil
Para garantizar una experiencia nativa en dispositivos móviles, se ha configurado el archivo `public/manifest.json`:
- **Iconos Adaptativos:** Soporte para resoluciones de 192x192px y 512x512px (incluyendo variantes maskable).
- **Display Mode:** Configurado como `standalone` con fondo `#09090b` para maximizar el área de trabajo clínica sin barras del navegador.

### 3. Estrategia de Service Worker (`public/sw.js` - v2.5.0)
El Service Worker (`cadensa-v2.5.0`) gestiona el ciclo de vida y la persistencia de activos críticos:
- **Precaching Multimedia:** Descarga anticipada y almacenamiento en caché de los 7 videos MP4 fonoaudiológicos y portadas WebP.
- **Estrategia Cache-First:** Para rutas `/media/techniques/*`, garantizando reproducción instantánea sin conexión ni consumo de datos móviles repetitivo.
- **Estrategia Network-First:** Con fallback offline para vistas HTML y navegación SPA.

### 4. Exportador de Progreso Local-First (CSV / Fonoaudiológico)
- **Formato CSV con BOM UTF-8 (`\uFEFF`):** Generado mediante Blob API en `src/lib/clinicalReport.ts`, garantizando compatibilidad con acentos y caracteres especiales en Excel y hojas de cálculo.
- **Privacidad Absoluta (Zero Trust):** Los datos se extraen de `localStorage` (`cadensa_sessions`) y se descargan localmente mediante el botón *"Descargar Reporte para mi Fonoaudiólogo"*, sin enviar información a servidores ni requerir cuenta activa.

### 5. Feedback Háptico en el Metrónomo
- **Vibration API:** Disparo de pulsos micro-táctiles (50 ms) sincronizados con cada pulso rítmico del metrónomo.
- **Toggle Configurable:** Control interactivo en la barra de opciones de práctica con persistencia en el dispositivo.

### 6. Navegación Unificada de Demostración Fonoaudiológica
- Se eliminó la duplicidad previa entre botones de "Video" y "Avatar IA".
- Se consolidó un único acceso interactivo destacado: **🤖 Avatar IA 1080p**, que despliega el modal de alta resolución con avatar fotorrealista y widgets de biofeedback sincronizados.

### 7. Experiencia de Primer Uso (FTUE) y Consentimiento de Hardware (Zero Trust)
- **Modal de Onboarding Empático (`src/components/WelcomeTour.tsx`):** Se despliega automáticamente a visitantes nuevos mediante flag local (`localStorage.getItem('cadensa_ftue_completed')`). Estructurado en 4 etapas:
  1. Propósito terapéutico de Cadensa (isocronía rítmica sin tecnicismos).
  2. Uso del metrónomo visual y botón Avatar IA 1080p con demostraciones clínicas.
  3. Guía interactiva de instalación PWA con detección dinámica de plataforma (instrucciones Safari/iOS ⎋ vs. Chrome/Android ⋮).
  4. Garantía de privacidad Zero Trust con botón directo "¡Comenzar mi práctica!".
- **Consentimiento Previo de Micrófono (`src/components/MicrophoneConsentModal.tsx`):** Antes de invocar `getUserMedia`, se despliega una advertencia transparente explicando que el micrófono se usa únicamente para biofeedback en memoria local sin transmisiones a la nube (`cadensa_mic_consent`).
- **Páginas Legales y Medical Disclaimer (`/privacy` y `/terms`):** Declaración explícita de privacidad local-first ("Tus datos de voz y tus resultados de práctica nunca salen de tu dispositivo...") y descargo fonoaudiológico formal YMYL ("Cadensa es una herramienta de apoyo y no sustituye el diagnóstico o tratamiento de un fonoaudiólogo certificado.").

### 8. Entrenador de Frases Personalizadas con Web Speech API On-Device (`CustomPhraseTrainer.tsx`)
- **Silabación Fonoaudiológica en Tiempo Real:** Entrada de texto libre (`<input>`) y botón de silabación asistida (`src/lib/syllables.ts`) que desglosa oraciones complejas respetando diptongos e hiatos.
- **Síntesis Vocal Rítmica (Web Speech API):** Articulación sonora de cada sílaba individual mediante `SpeechSynthesisUtterance` (`es-ES`) sincronizada al ritmo exacto del metrónomo configurable (50 a 160 BPM), 100% on-device y sin llamadas de red.
- **Cajas Visuales de Sílabas:** Contenedores dinámicos idénticos a los del lector y modal de video, iluminando la sílaba activa en cada beat con gradientes de alto contraste y sombra reactiva.
- **Persistencia Local Zero Trust y Nube Opcional:** Almacenamiento local en `localStorage['cadensa_custom_phrases']` con opción de respaldo autenticado en Supabase PostgreSQL Zero Trust RLS.

