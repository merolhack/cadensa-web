---
title: "Guía de Entrega y Mapa de Arquitectura para Desarrolladores (Developer Handoff)"
category: "operations"
tags: [operations, handoff, developer-guide, onboarding, architecture, scripts, testing]
last_updated: "2026-11-03"
sources:
  - "AGENTS.md"
  - "package.json"
  - "src/lib/clinicalTechniques.ts"
  - "scripts/generate_all_techniques.py"
  - "scripts/techniques_media_catalog.json"
related:
  - "wiki/index.md"
  - "wiki/SCHEMA.md"
  - "wiki/operations/deployment_runbook.md"
  - "wiki/architecture/video_generation_pipeline.md"
---

# Guía de Entrega y Mapa de Arquitectura para Desarrolladores (Developer Handoff)

> **"Si eres un nuevo desarrollador en Cadensa, este es el mapa del proyecto."**  
> Bienvenido a Cadensa. Este documento condensa el conocimiento operativo esencial para navegar el repositorio, comprender el stack tecnológico, ejecutar pruebas y modificar los activos clínicos y audiovisuales con confianza.

---

## 1. Misión Clínica y Concepto de Producto

- **Nombre:** Cadensa (Inspirado en la cadencia y el ritmo del habla).
- **Lema Institucional:** *"Encuentra el ritmo de tu voz."*
- **Técnica Central:** Habla Rítmica Silábica (*Syllable-Timed Speech - STS*), una intervención fonoaudiológica con validación empírica que utiliza pulsos isocrónicos para eludir el déficit de temporización en los ganglios basales de personas que tartamudean.
- **Enfoque Terapéutico Integral:** Combina técnicas de *Fluency Shaping* (STS, Inicio Suave, Contacto Ligero, Habla Prolongada), técnicas de *Modificación de la Tartamudez de Van Riper* (Pull-Out y Cancelación) y regulación neurovegetativa (*Box Breathing* 4-4-4-4).
- **Metáfora de Experiencia:** La gamificación accesible y el hábito diario estilo Duolingo aplicados a la seguridad comunicativa.

---

## 2. Mapa del Repositorio y Estructura de Directorios

```text
cadensa-web/
├── .github/
│   └── workflows/              # CI/CD: Pruebas unitarias, BDD y despliegue a Cloudflare Pages
├── features/                   # Escenarios BDD en Gherkin español (# language: es)
│   ├── step_definitions/       # Implementación TypeScript de pasos Cucumber
│   └── *.feature               # Casos de prueba de comportamiento clínico
├── public/
│   ├── media/
│   │   ├── audio/              # Audios clínicos generados (16 kHz TTS y 48 kHz HQ)
│   │   ├── images/             # Imagen base neutral del Avatar Maestro
│   │   └── techniques/         # Videos Full HD 1080p y portadas WebP/PNG
│   └── icons/                  # Iconos PWA y favicons
├── scripts/                    # Pipeline de automatización, audio y video con IA
│   ├── build_clinical_audio.py # Síntesis fonética GCP TTS con SSML / IPA
│   ├── generate_all_techniques.py # Orquestador maestro de lote (SadTalker + Wav2Lip + GFPGAN)
│   ├── compose_cadensa_video.py   # Compositor Full HD 1080p con widgets y sellado labial
│   ├── evaluate_syncnet.py        # Evaluador formal de Lip-Sync Error (LSE-D y LSE-C)
│   ├── submit_seo_changes.py      # Notificador automatizado post-despliegue (Google & Bing SEO)
│   └── techniques_media_catalog.json # Fuente de verdad clínica de textos y widgets
├── src/
│   ├── app/                    # Next.js 16 App Router (Rutas estáticas SPA)
│   │   ├── about/              # Página pública Acerca de (Sincronizada con ROADMAP)
│   │   ├── admin/              # Consola de gobierno clínico Zero Trust
│   │   ├── stats/              # Telemetría pública de rendimiento
│   │   └── tecnicas/[id]/      # Guías estáticas individuales por técnica
│   ├── components/             # Componentes React 19 (Modales, Biofeedback, Reproductores)
│   │   ├── TechniqueVideoModal.tsx # Modal de video optimizado con lazy loading y Façade
│   │   └── VirtualSLPAvatar.tsx    # Motor facio-articular interactivo en cliente
│   └── lib/                    # Lógica de dominio clínico y clientes BaaS
│       ├── clinicalTechniques.ts   # Catálogo maestro TypeScript y enlace a URLs de video
│       ├── rhythm.ts               # Motor de metrónomo Web Audio API de jitter cero
│       └── supabase.ts             # Cliente singleton Supabase con Zero Trust RLS
├── tests/
│   └── python/                 # Pruebas automatizadas Pytest para audio, video y lip-sync
├── wiki/                       # LLM Wiki persistente y modular (Patrón Karpathy)
│   ├── architecture/           # Documentación profunda de sistemas y pipelines
│   ├── concepts/               # Fundamentación clínica y patrones fonoaudiológicos
│   ├── operations/             # Runbooks de despliegue y guías de desarrollo
│   ├── index.md                # Catálogo global de navegación
│   └── log.md                  # Bitácora cronológica append-only
├── AGENTS.md                   # Reglas mandatorias para asistentes de IA y desarrolladores
├── package.json                # Dependencias y scripts npm
└── next.config.ts              # Configuración Next.js en modo 'export' estático
```

---

## 3. Vinculación Multimedia en el Frontend

La fuente de verdad de las técnicas fonoaudiológicas en la interfaz de usuario se ubica en **[`src/lib/clinicalTechniques.ts`](file:///home/merolhack/fl/cadensa-web/src/lib/clinicalTechniques.ts)**.

Cada técnica expone:
- `videoUrl`: Ruta relativa al video Full HD 1080p (`/media/techniques/{slug}_avatar_final.mp4`).
- `thumbnailUrl`: Ruta a la portada optimizada en WebP (`/media/techniques/{slug}_portada.webp`).
- `color`: Código hexadecimal para acentos visuales en la interfaz.
- Metadatos fonoaudiológicos: BPM sugerido, familia terapéutica, indicaciones paso a paso y descripción accesible.

El componente **[`src/components/TechniqueVideoModal.tsx`](file:///home/merolhack/fl/cadensa-web/src/components/TechniqueVideoModal.tsx)** consume esta información implementando:
- Atributos estándar: `preload="metadata"`, `playsInline`, `poster` con la versión WebP, y `muted` por defecto para prevenir reproducciones sorpresivas en navegadores móviles.
- **Façade Pattern / Carga Diferida:** El nodo `<video>` solo se monta al interactuar, asegurando que la carga inicial de la página sea inmediata (LCP < 1.0s).

---

## 4. Pipeline Audiovisual: Cómo Regenerar Videos

Si un fonoaudiólogo o desarrollador actualiza el guión clínico, los fonemas IPA o el tempo de una técnica:

### Paso 1: Modificar el Catálogo Clínico
Edita `scripts/techniques_media_catalog.json` localizando la técnica por su `slug`. Ajusta los campos necesarios:
- `syllables`: Lista de unidades fonéticas a articular.
- `ipa`: Transcripción fonética IPA para el motor SSML de Google Cloud TTS.
- `guided_phrase`: Frase clínica locutada.

### Paso 2: Ejecutar la Regeneración Neuronal
Asegúrate de que ComfyUI esté levantado localmente o inicia el entorno standalone en Windows PowerShell:

```powershell
# Regenerar una técnica específica (ejemplo: easy-onset)
C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe scripts/generate_all_techniques.py --technique easy-onset

# O regenerar el catálogo completo de las 7 técnicas desde cero
C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe scripts/generate_all_techniques.py
```

El script orquestará automáticamente:
1. Síntesis de audio clínico con GCP TTS Neural2 (`build_clinical_audio.py`).
2. Generación del rostro base con parpadeo a 512px en SadTalker.
3. Purga de memoria VRAM en GPU (`/free`).
4. Sincronización labial fonética milimétrica con Wav2Lip GAN.
5. Superresolución facial 2x con GFPGANv1.4.
6. Composición 1080p con widget especializado, sellado labial fonoaudiológico, normalización EBU R128 (-16 LUFS) y guardado automático de portadas WebP y PNG.

### Paso 3: Validar Sincronía Objetiva con SyncNet
```powershell
C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe scripts/evaluate_syncnet.py
```
Verifica que `LSE-D` se mantenga dentro de los límites clínicos (≤ 11.0) y la confianza `LSE-C` sea positiva (≥ 0.25).

---

## 5. Protocolo de Pruebas Automatizadas

Cadensa exige cobertura estricta antes de cada commit. Las suites se dividen en tres capas:

### 1. Pruebas Unitarias Frontend (Vitest + React Testing Library)
Valida componentes de React, lógica de AudioContext, almacenamiento local y manejo de estado:
```bash
npm test
```

### 2. Pruebas de Comportamiento Clínico BDD (Cucumber.js + Gherkin)
Valida los flujos de usuario desde una perspectiva clínica fonoaudiológica:
```bash
npm run test:bdd
```

### 3. Suite Completa Frontend (Unitarias + BDD)
```bash
npm run test:all
```

### 4. Pruebas Multimedia y Reposo Facial (Pytest en Standalone-Env)
Verifica la calidad acústica EBU R128, resolución de video Full HD 1080p, nitidez laplaciana, mediciones faciales iBUG 60-67 y métricas SyncNet:
```powershell
C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe -m pytest tests/python -v -rs
```

---

## 6. Reglas de Operación Mandatorias (AGENTS.md)

1. **Uso de Codebase Memory (`codebase-memory`):** El repositorio está indexado en el proyecto `home-merolhack-fl-cadensa-web`. Prefiere siempre las herramientas de grafo (`search_graph`, `get_code_snippet`) para descubrir dependencias antes de recurrir a búsquedas textuales ciegas.
2. **Sincronización Mandatoria de `/about`:** Cada vez que se altere un plan de desarrollo, TODO o ROADMAP, se **DEBE** actualizar inmediatamente la página pública `src/app/about/page.tsx` para reflejar el estado real del proyecto.
3. **LLM Wiki Modular:** Prohibido crear documentos monolíticos. Toda nueva capacidad técnica o arquitectónica debe documentarse en `wiki/` y registrarse en `wiki/log.md`.
4. **Cero LaTeX / MathJax:** En chats y documentación Markdown, Antigravity IDE no procesa LaTeX. Usa caracteres Unicode estándar (`→`, `≤`, `≥`, `±`, `×`, `✓`) y emojis para garantizar legibilidad absoluta.

