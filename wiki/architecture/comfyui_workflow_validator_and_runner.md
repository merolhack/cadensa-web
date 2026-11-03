---
title: "Validador, Ejecutor y Auditor de Workflows ComfyUI (Script Maestro Universal)"
category: "architecture"
tags: [architecture, comfyui, automation, python, websocket, validation, testing, cli]
last_updated: "2026-11-01"
sources:
  - "wiki/raw/comfyui/video-avatar.json"
  - "scripts/validate_and_run_comfyui.py"
related:
  - "wiki/architecture/video_generation_pipeline.md"
  - "wiki/entities/comfyui_local_environment.md"
---

# Validador, Ejecutor y Auditor de Workflows ComfyUI (Script Maestro Universal)

## 1. Visión General y Propósito

El script autónomo [`validate_and_run_comfyui.py`](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/scripts/validate_and_run_comfyui.py) opera como el **Script Maestro Universal** de automatización para pipelines multimedia en ComfyUI dentro de Cadensa.

Fue diseñado para soportar flujos heterogéneos (SadTalker, Wav2Lip y futuros nodos de avatar) eliminando el acoplamiento rígido de rutas hardcodeadas y garantizando una ejecución resiliente y trazable a costo cero.

### Principales Capacidades
1. **Auto-Sanación del Entorno (Pre-flight checks):** Comprobación e instalación automática de dependencias (`websocket-client`) mediante `sys.executable` y verificación de salud de ComfyUI (`/object_info`) antes de procesar el grafo.
2. **CLI Universal Parametrizado:** Parámetros configurables `--workflow`, `--image`, `--audio`, `--server` y `--force-fix`.
3. **Sanitización Inteligente del Grafo:** En lugar de parches estáticos, inspecciona los metadatos de `/object_info`. Si el nodo generador es un `output_node: true` que emite `STRING` (como `SadTalkerIsolated`), detecta que los nodos de guardado posteriores (como `SaveVideo`) son redundantes y los desacopla de forma segura solo si se especifica `--force-fix`.
4. **Ingesta Modular en LLM Wiki:** Cada ejecución genera un informe detallado con Frontmatter YAML en `wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md` y agrega una única línea de resumen en `wiki/log.md` con enlaces cruzados wikilink (`[[...]]`).

---

## 2. Arquitectura del Script en 5 Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ARQUITECTURA DEL SCRIPT MAESTRO                      │
└────────────────────────────────────────────────────────────────────────┘

  [0. PRE-FLIGHT CHECKS & AUTO-SANACIÓN]
          │
          ├── Verifica dependencias Python (websocket-client) -> pip install si falta
          └── Ping de salud a ComfyUI /object_info (3s) -> Aborta si está inactivo
          │
  [1. VALIDACIÓN ESTRUCTURAL & SANITIZACIÓN INTELIGENTE]
          │
          ├── Consulta catálogo /object_info (980+ nodos registrados)
          ├── Valida existencia de class_type y conexiones requeridas
          └── Sanitización Inteligente:
                • Si generador tiene output_node=True y tipo incompatible con SaveVideo:
                    - Con --force-fix: Desacopla y elimina SaveVideo de forma segura.
                    - Sin --force-fix: Falla con error descriptivo solicitando flag.
                • Si generador NO es output_node: Valida que SaveVideo sea funcional.
          │
  [2. INYECCIÓN DINÁMICA DE PARÁMETROS]
          │
          ├── Aprovisiona imagen (--image) en ComfyUI\input\
          ├── Aprovisiona audio (--audio) en ComfyUI\input\ (o genera tono foniátrico)
          └── Inyecta nombres en memoria en LoadImage y LoadAudio
          │
  [3. EJECUCIÓN Y SUPERVISIÓN WEBSOCKET]
          │
          ├── Canal WebSocket en vivo: ws://{host}/ws?clientId={uuid}
          ├── Despacho HTTP POST /prompt
          ├── Monitoreo asíncrono no bloqueante (progress, executing, status)
          └── Extracción de video final en /history/{prompt_id}
          │
  [4. INGESTA MODULAR EN LLM WIKI]
          │
          ├── Crea wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md (Detalle completo)
          └── Anexa 1 sola línea en wiki/log.md con wikilink [[{YYYY-MM-DD}_{prompt_id}]]
```

---

## 3. Guía de Uso del CLI Universal

El script puede ejecutarse desde PowerShell usando el intérprete Python standalone de ComfyUI Desktop:

### Parámetros Disponibles

| Argumento | Tipo | Descripción |
|---|---|---|
| `--workflow` | String | Ruta al archivo JSON del flujo de trabajo ComfyUI. |
| `--image` | String | Ruta a la imagen de entrada (ej. `avatar-maestro.jpg`). |
| `--audio` | String | Ruta al archivo de audio de entrada (ej. fonética o locución). |
| `--server` | String | URL base de ComfyUI (Predeterminada: `http://127.0.0.1:8188`). |
| `--force-fix` | Flag | Aplica sanitización inteligente del grafo eliminando nodos redundantes. |

### Ejemplos de Invocación

#### A. Ejecución de Producción con Sanitización (Flujo SadTalker)
```powershell
& "C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe" scripts\validate_and_run_comfyui.py `
  --workflow wiki\raw\comfyui\video-avatar.json `
  --image public\media\images\avatar-maestro.jpg `
  --force-fix
```

#### B. Modo Auditoría Estricta (Detección de Discrepancias)
```powershell
& "C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe" scripts\validate_and_run_comfyui.py `
  --workflow wiki\raw\comfyui\video-avatar.json `
  --image public\media\images\avatar-maestro.jpg
```
*Comportamiento:* Al detectar que `SaveVideo` es redundante pero no contar con `--force-fix`, aborta controladamente indicando la solución al desarrollador.

---

## 4. Estructura de la Ingesta Modular

### A. Archivo Detallado de Ejecución
Ubicado en `wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md`:

```markdown
---
title: "ComfyUI Execution - {prompt_id}"
date: "YYYY-MM-DD"
timestamp: "ISO_TIMESTAMP"
prompt_id: "{prompt_id}"
status: "SUCCESS | FAILED"
generator_node: "SadTalkerIsolated"
workflow: "video-avatar.json"
image: "avatar-maestro.jpg"
audio: "example.wav"
output_video: "sadtalker/24f20797.../video.mp4"
sanitization_applied: true
---

# ComfyUI Execution Detail: {prompt_id}
...
```

### B. Resumen en Bitácora Central (`wiki/log.md`)
Cada ejecución genera **estrictamente una sola línea**, preservando la legibilidad de la bitácora:

```markdown
- **[2026-11-01 14:39:58]** comfyui | Prompt `8cb0b7e1-f28c-4114-a9dc-5b005de7999e` | Estado: ✅ Éxito | Nodo: `SadTalkerIsolated` | Detalle: [[2026-11-01_8cb0b7e1-f28c-4114-a9dc-5b005de7999e]] (ver [historial](raw/comfyui/history/2026-11-01_8cb0b7e1-f28c-4114-a9dc-5b005de7999e.md))
```
