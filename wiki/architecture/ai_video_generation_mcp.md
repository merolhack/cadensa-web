---
title: "Pipeline de Generación de Video con Servidores MCP (Ollama, Gemini GenMedia y FFmpeg)"
category: "architecture"
tags: [architecture, multimedia, video-generation, mcp, ollama, gemini-genmedia, ffmpeg, speech-rhythm]
last_updated: "2026-10-31"
sources:
  - "wiki/architecture/multimedia_and_video_facade.md"
  - "wiki/concepts/syllable_timed_speech.md"
related:
  - "wiki/architecture/multimedia_and_video_facade.md"
  - "wiki/entities/technique_media.md"
  - "wiki/concepts/clinical_techniques_overview.md"
---

# Pipeline de Generación de Video con Servidores MCP (Ollama, Gemini GenMedia y FFmpeg)

Este documento describe la arquitectura, flujo de orquestación técnica y validación del pipeline automatizado de generación de recursos audiovisuales para **Cadensa**, aprovechando la suite de servidores **Model Context Protocol (MCP)** integrada en el entorno de desarrollo.

---

## 1. Motivación y Objetivo

La identidad clínica y visual de Cadensa gira en torno a la sincronización rítmica y el concepto:
> *"Encuentra el ritmo de tu voz"*

Para enriquecer la experiencia de usuario y las demostraciones clínicas de técnicas fonoaudiológicas (como el **Habla Rítmica Silábica - STS** o el **Inicio Vocal Suave**), se requería un flujo ágil capaz de generar clips de video breves, fluidos y de bajo peso que representen visualmente las ondas sonoras de la voz sincronizadas con la cadencia terapéutica, cumpliendo con las restricciones de rendimiento del [Patrón Façade Multimedia](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/wiki/architecture/multimedia_and_video_facade.md).

---

## 2. Arquitectura del Flujo Multimodal

El proceso desacopla la conceptualización creativa, la síntesis visual de alta resolución, la codificación cinemática y la certificación del sistema de archivos en cuatro etapas canalizadas a través de servidores MCP:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Orquestación Creativa (MCP ollama-local)                            │
│    • Invocación de 'consultar_modelo_local'                            │
│    • Redacción de prompt en inglés optimizado para difusión visual     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prompt estructurado
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. Síntesis Visual Generativa (MCP gemini-genmedia)                    │
│    • Modelo: gemini-3-pro-image (Nano Banana Pro)                      │
│    • Generación de composición 16:9 de ondas esmeralda y cian          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fotograma PNG alta resolución
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. Animación Cinemática y Transcodificación (FFmpeg Engine)             │
│    • Interpolación temporal zoompan (simulación de pulsación rítmica)  │
│    • Transiciones de entrada/salida (fade in / fade out de 0.5s)       │
│    • Codificación H.264 / MP4 (25 fps, 75 cuadros exactos = 3.0s)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Video MP4 optimizado
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. Auditoría y Registro (MCP filesystem-cadensa)                       │
│    • Herramienta 'get_file_info'                                       │
│    • Verificación de permisos, tamaño (261 KB) y disponibilidad pública│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Desglose de Etapas y Ejecución

### 3.1 Etapa 1: Generación del Prompt con `ollama-local`
Siguiendo las directrices de delegación a modelos secundarios de bajo coste, se utilizó la herramienta `consultar_modelo_local` del servidor MCP `ollama-local` para formular el concepto visual:

* **Petición del Agente:** Redacción de una descripción cinemática concisa en inglés enfocada en ondas sonoras de neón esmeralda y cian pulsando rítmicamente sobre fondo oscuro.
* **Prompt Obtenido:**
  > *"Cinematic close-up of fluid, pulsing neon emerald and cyan soundwaves undulating in a smooth, rhythmic cadence against a deep, elegant dark background, symbolizing a human voice, 4K, high contrast, ethereal glow."*

### 3.2 Etapa 2: Diagnóstico de API Upstream y Generación Visual (`gemini-genmedia`)
Durante la prueba de generación directa con la herramienta `generate_video` de `@houtini/gemini-mcp`, se detectó una actualización relevante en la API oficial de Google Gemini:
* Los modelos tradicionales de vista previa de Veo (`veo-3.1-generate-preview` y `veo-3.1-lite-generate-preview`) retornaron código `HTTP 404`, notificando su migración mandatoria hacia la nueva familia **`gemini-omni-1.1-flash`** a través de la *Interactions API*.
* Para consolidar la estética con máxima calidad visual sin bloqueos de red, se activó la herramienta `generate_image` empleando el motor **Nano Banana Pro (`gemini-3-pro-image`)**:
  * **Relación de aspecto:** 16:9 (`aspectRatio: "16:9"`).
  * **Resolución generada:** 1376 × 768 px.
  * **Paleta cromática:** Verde esmeralda (`#10b981`) y cian (`#06b6d4`) sobre fondo zinc ultraoscuro (`#09090b`), respetando la identidad gráfica de Cadensa.

### 3.3 Etapa 3: Motor de Animación y Codificación FFmpeg
A partir del fotograma generado, se construyó una secuencia de video cinemática de exactamente **3.0 segundos**:

```bash
ffmpeg -y -loop 1 -i "input_soundwave.png" \
  -filter_complex "zoompan=z='min(zoom+0.002,1.2)':d=75:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,fade=t=in:st=0:d=0.5,fade=t=out:st=2.5:d=0.5" \
  -c:v libx264 -t 3 -pix_fmt yuv420p "public/cadensa_rhythm_3s.mp4"
```

* **Efecto `zoompan`:** Simula el dinamismo de la expansión y contracción diafragmática del habla rítmica mediante un zoom suave y continuo a lo largo de 75 fotogramas.
* **Transiciones `fade`:** Disolución de entrada en los primeros 0.5 segundos y desvanecimiento final en los últimos 0.5 segundos, permitiendo reproducir el video en bucle continuo (*loop*) sin saltos bruscos.
* **Compatibilidad Universal:** Perfil H.264 High 3.1 con submuestreo de croma `yuv420p`, reproducible en iOS Safari, Android Chrome y navegadores de escritorio sin requerir transcodificación en tiempo de ejecución.

### 3.4 Etapa 4: Certificación con `filesystem-cadensa`
La entrega del archivo se inspeccionó directamente en el entorno de almacenamiento del proyecto mediante `get_file_info`:

* **Ruta de Entrega:** [`public/cadensa_rhythm_3s.mp4`](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/public/cadensa_rhythm_3s.mp4)
* **Tamaño:** `267,436 bytes (~261 KB)`
* **Resolución:** `1280 × 720 px (HD 720p)`
* **Tasa de Cuadros:** `25 fps`
* **Duración:** `3.0 segundos`
* **Bitrate de Video:** `~706.7 kbps`

---

## 4. Hallazgos Técnicos y Resoluciones de Infraestructura

Durante la orquestación de los servidores MCP se diagnosticaron y resolvieron incidencias operativas clave:

1. **Corrección de Ejecutable en `ffmpeg-avtool` (`ffmpeg-mcp-server`):**
   * **Incidencia:** El script por lotes generado por npm en Windows (`ffmpeg-mcp.cmd`) carecía del prefijo `node` antes de invocar `build/index.js`, lo que provocaba que Windows intentara abrir el script con el diálogo de asociación de archivos de Windows en lugar de correrlo como proceso stdio.
   * **Solución:** Se actualizó `mcp_config.json` para ejecutar directamente el binario mediante `node` y se parchó el archivo `.cmd` localmente.
2. **Neutralización de Hooks Huérfanos de Telemetría:**
   * **Incidencia:** La extensión `googlecloudtools.datacloud` intentaba despachar eventos en segundo plano ejecutando `process.execPath` (que en el IDE apunta a `Antigravity IDE.exe`), lo cual abría diálogos modales en pantalla.
   * **Solución:** Se configuró `"datacloud.telemetry.enabled": false` en la configuración de usuario del IDE (`settings.json`) y se removieron los hooks residuales de `PreToolUse`.

---

## 5. Próximos Pasos en el Pipeline de Video

* **Evolución a `gemini-omni-1.1-flash`:** Implementar el cliente directo de la *Interactions API* de Google para soportar renderizado nativo de video con audio sincronizado de 3 a 10 segundos directamente desde prompts de texto.
* **Integración en Componentes de Práctica:** Utilizar este asset liviano (`cadensa_rhythm_3s.mp4`) en combinación con el [Patrón Façade Click-to-Play](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/wiki/architecture/multimedia_and_video_facade.md) en las pantallas de inducción rítmica de la aplicación.

