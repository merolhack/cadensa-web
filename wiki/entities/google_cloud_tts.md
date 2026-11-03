---
title: "Google Cloud Text-to-Speech (GCP TTS) & Esquema SSML IPA"
category: "entities"
tags: [entities, gcp, tts, ssml, ipa, audio, speech-synthesis, phonetics]
last_updated: "2026-11-02"
sources:
  - "scripts/build_clinical_audio.py"
  - "google_credentials.json"
  - ".env.example"
related:
  - "wiki/architecture/comfyui_production_pipeline.md"
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/custom_phrases_training.md"
---

# Google Cloud Text-to-Speech (GCP TTS) & Esquema SSML IPA

## 1. Propósito y Fundamento Clínico

En la rehabilitación de la tartamudez mediante el **Habla Rítmica Silábica (Syllable-Timed Speech - STS)**, el ejercicio requiere que las sílabas aisladas (por ejemplo: `CA`, `DEN`, `SA`) se pronuncien con una cadencia regular y una articulación natural fónica.

### El Problema del Deletreo en Motores Convencionales (Edge-TTS / gTTS)
Los sintetizadores de texto convencionales (como `edge-tts`) aplican heurísticas de Procesamiento de Lenguaje Natural (NLP) que interpretan cadenas cortas aisladas en mayúsculas o con puntuación (como `"SA."` o `"SA"`) como siglas o abreviaturas gramaticales (ej. *Sociedad Anónima* o las letras separadas `"Ese... A"`). Esto genera audios deformados de más de 0.8s con dos golpes fonéticos, destruyendo por completo la isocronía del metrónomo a 60 BPM.

### Solución: Síntesis Fonética Estricta con Google Cloud TTS
Google Cloud Text-to-Speech permite el control fónico a nivel espectral mediante **SSML (Speech Synthesis Markup Language)** y la especificación del **Alfabeto Fonético Internacional (IPA)** a través de la etiqueta `<phoneme>`:

```xml
<speak>
  <phoneme alphabet="ipa" ph="sa">SA</phoneme>
</speak>
```

Esto obliga al sintetizador neuronal a eludir cualquier heurística semántica y fonar exactamente el sonido consonántico alveolar fricativo sordo `/s/` seguido de la vocal abierta `/a/` en una duración controlada de ~0.36 segundos.

---

## 2. Infraestructura y Seguridad en Google Cloud

### Datos de Configuración
* **Proyecto GCP:** `cadensa-web-dev` (Project Number: `1014778372980`)
* **API Habilitada:** `texttospeech.googleapis.com` (Cloud Text-to-Speech API)
* **Cuenta de Servicio:** `cadensa-tts-service@cadensa-web-dev.iam.gserviceaccount.com`
* **Rol IAM Mínimo:** `roles/serviceusage.serviceUsageConsumer` (Zero Trust Least Privilege)
* **Archivo de Llave:** `google_credentials.json` en la raíz del repositorio

### Respaldo de Variables de Entorno (Regla 6)
Las credenciales se respaldan localmente en `.env` (excluido en `.gitignore` y protegido contra fugas en repositorios Git):

```bash
# Google Cloud Platform (TTS & Cloud Speech)
GOOGLE_APPLICATION_CREDENTIALS=google_credentials.json
GCP_PROJECT_ID=cadensa-web-dev
```

La plantilla pública [`\.env.example`](file://///wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web/.env.example) documenta los nombres de las variables sin exponer secretos.

---

## 3. Implementación en `scripts/build_clinical_audio.py`

### Mapeo Fonético IPA Institucional
El script maestro de audio cuenta con un diccionario fonético especializado para el repertorio de técnicas de Cadensa:

| Sílaba Ortográfica | Fonema IPA (`ph`) | Transcripción Fonética | Duración Típica |
|---|---|---|---|
| `CA` | `ka` | Oclusiva velar sorda + vocal abierta | 0.273s |
| `DEN` | `den` | Oclusiva dental sonora + vocal + nasal | 0.399s |
| `SA` | `sa` | Fricativa alveolar sorda + vocal abierta | 0.366s |
| `PA` | `pa` | Oclusiva bilabial sorda + vocal abierta | 0.260s |
| `TA` | `ta` | Oclusiva alveolar sorda + vocal abierta | 0.255s |
| `KA` | `ka` | Oclusiva velar sorda + vocal abierta | 0.270s |

Si una sílaba ingresada por el usuario no está en el diccionario predefinido, el motor aplica una regla heurística fonética en minúsculas limpias para evitar abreviaciones.

### Configuración de Voz Neuronal y Dualidad 16 kHz / 48 kHz
* **Voz Primaria:** `es-US-Neural2-B` (Modelo DeepMind Neural2, voz masculina fonoaudiológica de alta definición y formantes claros).
* **Voz Alternativa:** `es-ES-Neural2-B` o `es-ES-Wavenet-B`.
* **Audio de Inferencia (16,000 Hz LINEAR16 Mono):**
  - Mantiene el contrato exacto requerido por los modelos neuronales reactivos SadTalker y Wav2Lip GAN.
* **Audio HQ para Composición Final (48,000 Hz Sinc/Soxr):**
  - Generado de forma síncrona mediante el re-muestreador `soxr` de alta precisión de FFmpeg (`precision=28`), preservando exactamente la misma duración y mapa temporal de silencios diafragmáticos.
  - Al multiplexarse en el video final institucional (1920×1080), se normaliza mediante el filtro `loudnorm=I=-16:TP=-1.5:LRA=11` (EBU R128 a 48 kHz y 192 kbps AAC), garantizando cumplimiento estricto de estándares clínicos y de radiodifusión web.
* **Trazabilidad de Motor (`tts_engine`):**
  - El archivo `timeline.json` registra explícitamente `"tts_engine": "gcp_neural2"` (o `"edge_tts_fallback"` si se activa la degradación secundaria con aviso `UserWarning`).

---

## 4. Arquitectura de Resiliencia y Fallback

```
                     ┌──────────────────────────────────────────────┐
                     │   Solicitud de Síntesis Silábica (syl, bpm)   │
                     └──────────────────────┬───────────────────────┘
                                            │
                             ¿GOOGLE_APPLICATION_CREDENTIALS?
                                            │
                       ┌────────────────────┴────────────────────┐
                       │ SÍ                                      │ NO
                       ▼                                         ▼
         ┌───────────────────────────┐             ┌───────────────────────────┐
         │ Google Cloud TTS          │             │ Fallback Secundario:      │
         │ (es-US-Neural2-B / SSML)  │             │ edge-tts (es-MX-Jorge)    │
         └─────────────┬─────────────┘             │ con fonetización sintética│
                       │                           └─────────────┬─────────────┘
                  ¿Éxito API?                                    │
                       │                                         │
              ┌────────┴────────┐                                │
              │ SÍ              │ ERROR                          │
              ▼                 ▼                                │
     ┌─────────────────┐  ┌─────────────────────────┐            │
     │ PCM LINEAR16    │  │ Degradar a edge-tts     ├────────────┘
     │ (Audio Nativo)  │  └─────────────────────────┘
     └────────┬────────┘
              │
              ▼
     ┌─────────────────────────────────────────────────────────────┐
     │ Recorte Dinámico de Silencios (trim_silence)                │
     │ e Inserción en Matriz Temporal Isócrona (Timeline 60 BPM)   │
     └─────────────────────────────────────────────────────────────┘
```

Esta arquitectura garantiza que si el pipeline se ejecuta en un entorno sin conexión o sin credenciales configuradas, el sistema no se detiene, sino que conmuta limpiamente a `edge-tts` aplicando filtros fonéticos preventivos.

