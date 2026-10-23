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
