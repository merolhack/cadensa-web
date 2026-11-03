---
title: "Pipeline de Producción Multimedia Secuencial (Audio Clínico GCP TTS + SadTalker + Wav2Lip + GFPGAN 2x + Compositor 1920x1080)"
category: "architecture"
tags: [architecture, multimedia, comfyui, sadtalker, wav2lip, gfpgan, opencv, ffmpeg, lipsync, pipeline, breathing, sts, gcp-tts]
last_updated: "2026-11-02"
sources:
  - "scripts/build_clinical_audio.py"
  - "scripts/validate_and_run_comfyui.py"
  - "scripts/wav2lip_runner.py"
  - "scripts/restore_face_pipeline.py"
  - "scripts/compose_cadensa_video.py"
  - "wiki/raw/comfyui/video-avatar.json"
related:
  - "wiki/architecture/comfyui_workflow_validator_and_runner.md"
  - "wiki/architecture/video_generation_pipeline.md"
  - "wiki/entities/comfyui_local_environment.md"
  - "wiki/entities/google_cloud_tts.md"
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/clinical_techniques_overview.md"
  - "wiki/concepts/custom_phrases_training.md"
---

# Pipeline de Producción Multimedia Secuencial (Audio Clínico GCP TTS + SadTalker + Wav2Lip + GFPGAN 2x + Compositor 1920x1080)

## 1. Visión General y Necesidad Clínica

El objetivo del pipeline multimedia en Cadensa es generar material audiovisual clínico de máxima naturalidad para personas que tartamudean. En técnicas terapéuticas como el **Habla Rítmica Silábica (STS)** y el **Inicio Vocal Suave (Easy Onset)**, un avatar que habla sin respirar o sin pausas preparatorias genera rechazo cognitivo e invalida el modelo fonoaudiológico.

Dado que los modelos de visión neuronal y sincronización labial (SadTalker y Wav2Lip) son estrictamente reactivos a la señal de audio, si la locución no contiene silencios fisiológicos, los modelos nunca producirán descansos ni preparación. Asimismo, si la síntesis de voz deletrea las sílabas aisladas (como `"SA"` pronunciado `"S... A"`), la cadencia foniátrica se destruye.

Para solventar estas limitaciones fonoaudiológicas y garantizar una calidad visual fotorrealista sin borrosidad ni parches peribucales, el pipeline de Cadensa se estructura en **5 fases secuenciales automatizadas (Fase 0 a Fase 3b) más la auditoría modular (Fase 4)**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE MULTIMEDIA CLÍNICO COMPLETO EN CADENSA (ALTA FIDELIDAD)               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

 [FASE 0: Pre-procesamiento de Audio Clínico (build_clinical_audio.py)]
   • Motor Primario: Google Cloud Text-to-Speech (es-US-Neural2-B / es-ES-Neural2-B) con marcado
     SSML y fonemas IPA (<phoneme alphabet="ipa" ph="sa">SA</phoneme>), evitando el deletreo de siglas.
   • Inhalación Preparatoria: Inserta 2.5s de silencio absoluto al inicio.
   • Isocronía Silábica STS: Separa cada sílaba fonada en intervalos exactos de 1.0s (60 BPM).
   • Pausa Relajatoria: Inserta 2.0s de silencio post-fonación.
   • Salida: Audio WAV 16kHz LINEAR16 mono + 'timeline.json' con marcas temporales exactas.
          │
          ▼
 [FASE 1: SadTalker en ComfyUI vía WebSockets (Inferencia Rápida 512px)]
   • Entrada: Imagen 'avatar-maestro.jpg' + Audio con pausas clínicas.
   • Configuración: size=512, enhancer="none" (generación ágil sin cuello de botella).
   • Comportamiento: Durante los 2.5s de silencio inicial, SadTalker simula la fase preparatoria
     con parpadeo ocular natural y micro-gestos faciales sin movimiento bucal prematuro.
   • Salida: Video facial 512x512 con movimiento 3DMM expresivo.
          │
          ▼
 [CONTROL DE MEMORIA VRAM: Purga de GPU]
   • Despacho HTTP POST al endpoint /free de ComfyUI (libera ~5 GB de VRAM en la RTX 4060).
          │
          ▼
 [FASE 2a: Refinamiento Labial Fonético con Wav2Lip GAN (wav2lip_runner.py)]
   • Entrada: Video facial animado de SadTalker + Audio clínico con pausas.
   • Inferencia: Sincronización labial de precisión milimétrica frame a frame en GPU CUDA.
   • Checkpoint: wav2lip_gan.pth.
   • Salida: Video con articulación labial perfecta en las sílabas y reposo absoluto en los silencios.
          │
          ▼
 [FASE 2b: Restauración Facial Neuronal Post-Wav2Lip (restore_face_pipeline.py)]
   • Problema erradicado: Wav2Lip reconstruye el área peribucal con parches de menor definición.
     Al aplicar GFPGAN DESPUÉS de Wav2Lip, se reconstruyen fotorrealistamente los dientes, labios,
     ojos y poros de la piel, fundiendo cualquier costura o artefacto peribucal.
   • Inferencia: scripts/restore_face_pipeline.py con GFPGANer (upscale=2, GFPGANv1.4.pth en CUDA).
   • Salida: Video de rostro restaurado y supersampleado a 1024x1024 px.
          │
          ▼
 [FASE 3: Compositor de Alta Fidelidad (1920x1080) con Respiración Diafragmática (compose_cadensa_video.py)]
   • Simulación Diafragmática: Durante los intervalos de respiración del timeline (0 a 2.5s),
     aplica una micro-expansión torácica (+0.8%) y elevación vertical (-3px en Y) mediante curva sinusoidal.
   • Interpolación Lanczos-4: cv2.INTER_LANCZOS4 para proyectar el rostro nítido a 800x800 px.
   • Enfoque Unsharp Mask: cv2.addWeighted para realzar el contraste de bordes y mirada.
   • Sincronización Dinámica de UI:
       - Metrónomo esmeralda (#10b981) pulsa con decaimiento elástico en el milisegundo exacto de la sílaba.
       - Cajas silábicas [ CA ] [ DEN ] [ SA ] se iluminan al fonarse cada sílaba correspondiente.
       - Pill institucional muestra: 'PREPARACION DIAFRAGMATICA · INHALACION' -> 'FONACION ACTIVA'.
   • Multiplexación: Codificación H.264 (yuv420p, CRF 18) y audio AAC mono 16kHz vía FFmpeg.
          │
          ▼
 [FASE 4: Entrega y Auditoría Modular en LLM Wiki]
   • Archivo de Entrega: public/media/techniques/cadensa_sts_avatar_final.mp4
   • Historial Detallado: wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md (con JSON del Timeline)
   • Bitácora Operativa: Entrada de una sola línea en wiki/log.md
```

---

## 2. Desglose Técnico de las Fases

### Fase 0: Pre-procesamiento de Audio Clínico (`scripts/build_clinical_audio.py`)
- **Motor de Voz Primario:** `google-cloud-texttospeech` con voces neuronales (`es-US-Neural2-B` / `es-ES-Neural2-B`).
- **Mapeo SSML IPA:** Cada sílaba se encapsula en `<speak><phoneme alphabet="ipa" ph="{ipa}">{syl}</phoneme></speak>` para forzar la articulación fonética exacta (`CA` → `ka`, `DEN` → `den`, `SA` → `sa`), evitando deletreos erróneos.
- **Formato Nativo:** PCM LINEAR16 a 16 kHz Mono.
- **Estructuración Temporal:**
  - `prep_silence_sec = 2.5`: Genera un colchón de silencio para la toma de aire diafragmática.
  - `interval_sec = 60.0 / bpm`: Para 60 BPM, cada ciclo dura exactamente 1.0 segundo.
  - `trim_silence`: Recorta el aire previo y posterior de la síntesis silábica para garantizar que la fonación inicie exactamente en el golpe de metrónomo.
  - `timeline.json`: Exporta los rangos de `breathing_intervals` y la lista de `syllable_events` (`time`, `duration`, `box_index`).
- **Resiliencia:** Fallback automático a `edge-tts` (`es-MX-JorgeNeural`) con filtros fonéticos en minúsculas en caso de indisponibilidad de credenciales de GCP.

### Fase 1: SadTalker en ComfyUI Desktop (512x512 px sin cuello de botella)
- **Resolución Nativa 512x512:** Configuración estándar de `size: 512` y `batch_size: 1` en el nodo `SadTalkerIsolated` con el checkpoint `SadTalker_V0.0.2_512.safetensors`, cuadruplicando la densidad de píxeles respecto al modo base de 256px.
- **Inferencia Rápida (`enhancer: "none"`):** Se desactiva el mejorador facial dentro del nodo de ComfyUI para acelerar la generación de la malla 3DMM y evitar sobrecarga en la VRAM de la GPU.
- **Ventaja de las Pausas de Audio:** Al recibir 2.5 segundos de silencio inicial, la red neuronal de SadTalker no fuerza articulación labial vacía. En su lugar, el módulo 3DMM mantiene los labios cerrados y reproduce el parpadeo fisiológico relajado del avatar antes de hablar.
- **Benchmark Empírico de Hardware (RTX 4060 Laptop 8 GB - Auditoría 2026-11-02):**
  - Consumo de VRAM Pico: **6,981 MiB / 8,188 MiB (85.3% de capacidad)**.
  - Paginación compartida (Host RAM Swapping): **0 MiB (Cero OOM ni degradación de latencia)**.
  - Varianza Laplaciana (agudeza visual): **15.77 (512px nativo) vs 2.72 (256px escalado)**, representando un incremento de **+478.6%** en preservación de microtextura cutánea y nitidez peribucal.
  - Factor de escalado GFPGANv1.4: **2x** (de 512×512 a 1024×1024 px).

### Mitigación de VRAM: Purga Asíncrona con `/free`
- Invocación al endpoint `http://127.0.0.1:8188/free` con `{"unload_models": true, "free_memory": true}` para prevenir errores de memoria en tarjetas gráficas de 8 GB (RTX 4060).

### Fase 2a: Sincronización Labial con Wav2Lip GAN (`scripts/wav2lip_runner.py`)
- Utiliza el checkpoint `wav2lip_gan.pth` en GPU CUDA, generando sincronización labial precisa frame a frame.
- Procesa el video de SadTalker sobreescribiendo el área peribucal según los paquetes espectrales mel del audio clínico. En los silencios de respiración, los labios se mantienen en reposo natural.

### Fase 2b: Restauración Facial Neuronal Post-Wav2Lip (`scripts/restore_face_pipeline.py`)
- **Arquitectura de Reordenamiento:** Al situar `GFPGANv1.4` *después* de Wav2Lip, el mejorador facial toma los fotogramas modificados por Wav2Lip y reconstruye completamente los labios, encías, dientes y poros de la piel con un factor de escalado 2× (`upscale=2`), eliminando cualquier parche borroso o discontinuidad en la mandíbula.
- **Salida:** Archivo `cadensa_sts_face_restored.mp4` a resolución 1024×1024 px.

### Fase 3: Compositor de Lienzo Limpio (OpenCV + FFmpeg en `scripts/compose_cadensa_video.py`)
- **Escalado de Alta Definición y Enfoque:**
  - El recorte facial de 1024×1024 px se proyecta a 800×800 px utilizando interpolación de alta calidad `cv2.INTER_LANCZOS4`.
  - Se aplica un filtro de nitidez (*Unsharp Mask*) mediante desenfoque gaussiano y suma ponderada (`cv2.addWeighted(resized, 1.35, gaussian, -0.35, 0)`), resaltando la mirada, contornos labiales y dientes en el modal web.
- **Simulación Visual de Respiración:**
  Durante los intervalos de respiración definidos en `timeline.json`:
  ```python
  prog = (t_seconds - b_start) / (b_end - b_start)
  breath_sin = math.sin(prog * math.pi)
  scale = 1.0 + 0.008 * breath_sin    # Expansión sutil (+0.8%)
  cy_offset = int(base_crop * 0.004 * breath_sin) # Elevación torácica (-3px)
  ```
- **Sincronización Dinámica de Metrónomo y Cajas:**
  - El metrónomo pulsa exactamente cuando `t_seconds >= event["time"]`.
  - Las cajas silábicas (`[ CA ] [ DEN ] [ SA ]`) se iluminan en verde esmeralda (`#10b981`) exclusivamente durante `event["time"] <= t_seconds < event["time"] + event["duration"]`.
  - La píldora superior conmuta dinámicamente entre `PREPARACION DIAFRAGMATICA · INHALACION`, `FONACION ACTIVA · SILABA X/N` y `PAUSA CLINICA · RELAJACION POST-FONACION`.

---

## 3. Guía de Uso del CLI y Parámetros

El script maestro universal [`scripts/validate_and_run_comfyui.py`](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/scripts/validate_and_run_comfyui.py) integra todas las fases:

```powershell
& "C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe" scripts\validate_and_run_comfyui.py `
  --pipeline lipsync `
  --build-clinical-audio `
  --syllables CA DEN SA `
  --bpm 60 `
  --image public\media\images\avatar-maestro.jpg `
  --force-fix
```

### Tabla de Parámetros

| Argumento | Tipo | Predeterminado | Propósito |
|---|---|---|---|
| `--pipeline` | `str` | `standard` | `standard` (SadTalker) o `lipsync` (Audio Clínico GCP TTS → SadTalker → Wav2Lip GAN → GFPGAN 2x → Compositor 1920x1080). |
| `--build-clinical-audio` | `flag` | Inactivo | Dispara la Fase 0 para construir el audio con Google Cloud TTS, SSML IPA y pausas de respiración. |
| `--syllables` | `list[str]` | `["CA", "DEN", "SA"]` | Sílabas fonadas para el ejercicio de Habla Rítmica Silábica (STS). |
| `--bpm` | `float` | `60.0` | Cadencia fonoaudiológica del metrónomo (60 BPM = 1.0s de compás). |
| `--timeline` | `str` | Auto-detectado | Ruta al archivo JSON con el mapa temporal fonoaudiológico. |
| `--image` | `str` | `avatar-maestro.jpg` | Imagen de alta definición del Avatar Maestro. |
| `--force-fix` | `flag` | Inactivo | Auto-remediación desacoplando nodos de guardado redundantes en grafos directos. |

