---
title: "Entorno Local y Topología de Rutas de ComfyUI"
category: "entities"
tags: [entities, comfyui, local-environment, windows, wsl, custom-nodes, sadtalker, wav2lip, gfpgan, rtx4060]
last_updated: "2026-11-02"
sources:
  - "wiki/raw/comfyui/video-avatar.json"
  - "scripts/generate_all_techniques.py"
  - "scripts/restore_face_pipeline.py"
related:
  - "wiki/architecture/comfyui_production_pipeline.md"
  - "wiki/architecture/video_generation_pipeline.md"
  - "wiki/entities/google_cloud_tts.md"
---

# Entorno Local y Topología de Rutas de ComfyUI

## 1. Visión General

Este documento consolida la topología completa de rutas, entornos de ejecución híbridos (Windows nativo y WSL Ubuntu), nodos personalizados y endpoints de red que sustentan la infraestructura de generación multimedia y animación de avatares clínicos para Cadensa a costo cero.

### Perfil de Hardware Certificado (Auditoría 2026-11-02)
- **GPU:** NVIDIA GeForce RTX 4060 Laptop (8,188 MiB VRAM dedicada, Driver WDDM 617.42, CUDA 13.4 / cu128).
- **SadTalker Resolution Standard:** `size=512`, `batch_size=1`, `enhancer="none"`.
- **Consumo de Memoria GPU:** VRAM Pico registrada de **6,981 MiB / 8,188 MiB (85.3%)**, con **0 MiB** de paginación compartida (sin saturación ni swapping a host RAM).
- **GFPGANv1.4:** Inferencia en CUDA con `upscale=2` (de 512×512 a 1024×1024 px), logrando una ganancia de nitidez laplaciana de **+478.6%** frente a escalados 4x desde 256px.
- **Purga de VRAM:** Invocación inmediata a `POST http://127.0.0.1:8188/free` tras SadTalker para liberar los ~5.5 GB y dejar la GPU en 0 MiB para Wav2Lip y GFPGAN.

---

## 2. Entorno de ComfyUI Desktop (Windows)

La estación de trabajo local ejecuta ComfyUI Desktop como contenedor de escritorio sobre Windows 11 con aceleración por hardware NVIDIA GeForce RTX 4060 Laptop GPU.

| Componente | Ruta en Sistema Local | Descripción y Notas |
|---|---|---|
| **Aplicación Base (Electron)** | `C:\Program Files\Comfy Desktop` | Binario y runtime principal de la aplicación de escritorio. |
| **Instalaciones (Workspaces)** | `C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\` | Carpeta raíz contenedora de instancias de ComfyUI. |
| **Instalación Activa** | `...\ComfyUI-Installs\ComfyUI\` | Instancia en producción donde operan los nodos y scripts. |
| **Instalación de Respaldo** | `...\ComfyUI-Installs\ComfyUI (1)\` | Copia de seguridad del workspace. |
| **Python Standalone** | `...\ComfyUI\standalone-env\python.exe` | Entorno Python 3.13.12 con PyTorch 2.11.0+cu128 y soporte CUDA. Utilizado para orquestación y scripts CLI. |
| **Núcleo de ComfyUI** | `...\ComfyUI\ComfyUI\` | Repositorio central del core de ComfyUI. |
| **Directorio de Entrada (`input`)** | `...\ComfyUI\ComfyUI\input\` | Directorio de origen donde se copian `avatar-maestro.jpg` y audios fonoaudiológicos. |
| **Directorio de Salida (`output`)** | `...\ComfyUI\ComfyUI\output\` | Almacén de renders generados (videos MP4 de SadTalker/Wav2Lip). |
| **Requerimientos Core** | `...\ComfyUI\ComfyUI\requirements.txt` | Dependencias base del motor ComfyUI. |

---

## 3. Nodos Personalizados (`custom_nodes`)

Los plugins y nodos de inferencia se encuentran alojados en:  
`C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\`

### A. ComfyUI-Manager
- **Ruta:** `...\custom_nodes\ComfyUI-Manager\`
- **Función:** Administrador de extensiones, instalación de dependencias y actualización de modelos de ComfyUI.
- **Documentación oficial:** [docs.comfy.org/manager/overview](https://docs.comfy.org/manager/overview)

### B. SadTalker Isolated (Animación Facial 3DMM)
- **Ruta:** `...\custom_nodes\Comfyui-SadTalker\`
- **Repositorio Git de origen:** `https://github.com/sonukkc1312/comfyui-sadtalker.git`
- **Entorno Virtual Aislado (Python 3.10):**  
  `...\Comfyui-SadTalker\.venv_sadtalker\Scripts\python.exe`  
  *(SadTalker requiere Python 3.10 debido a dependencias C++ y Torchvision pre-compiladas incompatibles con Python 3.13).*
- **Directorio de Modelos / Checkpoints:**  
  `...\Comfyui-SadTalker\checkpoints\`  
  *(Alberga `sadtalker_checkpoints`, `mapping_00229-model.pth.tar`, `epoch_20.pth`, etc.).*
- **Comportamiento del Nodo:** El nodo `SadTalkerIsolated` es terminal (`output_node: true`), renderiza internamente el archivo de video en `output/sadtalker/...` y retorna una cadena `STRING` con la ruta del archivo generado.

### C. Wav2Lip (Sincronización Labial Directa)
- **Ruta:** `...\custom_nodes\ComfyUI_wav2lip\`
- **Repositorio Git de origen:** `https://github.com/ShmuelRonen/ComfyUI_wav2lip.git`
- **Directorio de Checkpoints:**  
  `...\custom_nodes\ComfyUI_wav2lip\Wav2Lip\checkpoints\`
- **Checkpoint Modelo GAN:** Instalado satisfactoriamente (435.8 MB) desde HuggingFace:  
  `https://huggingface.co/Nekochu/Wav2Lip/resolve/main/wav2lip_gan.pth`
- **Estado de Carga:** Operativo en ComfyUI con 0 fallos de importación.

### D. ComfyUI-Ollama (Integración LLM)
- **Ruta:** `...\custom_nodes\comfyui-ollama\`
- **Dependencia:** Paquete `ollama` instalado en `standalone-env` (`python.exe -m pip install ollama`).
- **Estado de Carga:** Operativo con 0 fallos de importación.

### E. Binario FFmpeg para Workers de Video
- **Rutas Aprovisionadas:**
  - `...\custom_nodes\Comfyui-SadTalker\.venv_sadtalker\Scripts\ffmpeg.exe`
  - `...\custom_nodes\Comfyui-SadTalker\SadTalker\ffmpeg.exe`
  - `...\standalone-env\Scripts\ffmpeg.exe`
  - `...\ComfyUI\ffmpeg.exe`
- **Función:** Permite que los scripts de ensamblaje de video (`videoio.py` en SadTalker) ejecuten la multiplexación de audio/video (`save_video_with_watermark`) de forma transparente sin depender de la variable PATH del sistema.

---

## 4. Proyecto Cadensa en WSL (Ubuntu 20.04)

Rutas del entorno Linux accesibles de forma transparente desde Windows y scripts mediante la red UNC:

| Recurso | Ruta UNC / Linux | Función en la Plataforma |
|---|---|---|
| **Raíz del Repositorio** | `\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\` | Código fuente, configuración y activos de Cadensa. |
| **Workflow ComfyUI (API JSON)** | `...\wiki\raw\comfyui\video-avatar.json` | Definición de grafo modular para generación del avatar. |
| **Imagen Oficial del Avatar** | `...\public\media\images\avatar-maestro.jpg` | Imagen fija de alta fidelidad (2.13 MB) del Avatar Maestro. |
| **Bitácora de la Wiki** | `...\wiki\log.md` | Registro histórico append-only de ejecuciones y auditorías. |
| **Script Validador y Runner** | `...\scripts\validate_and_run_comfyui.py` | Orquestador de validación, auto-remediación y WebSockets. |
| **Script de Avatar Natural** | `...\scripts\generate_natural_avatar_video.py` | Generador autónomo con respiración, parpadeo y lip-morphing. |
| **Video Final Oficial** | `...\public\media\techniques\cadensa_sts_avatar_final.mp4` | Video para modal interactivo de la técnica STS. |
| **Video Fisiológico Natural** | `...\public\media\techniques\cadensa_sts_avatar_natural.mp4` | Video optimizado con pausas fonoaudiológicas (27.4s, 1.68 MB). |

---

## 5. Endpoints de Red, APIs y URLs

### Endpoints Locales del Servidor ComfyUI (`http://127.0.0.1:8188`)
- **Interfaz Gráfica Web:** `http://127.0.0.1:8188/`
- **Canal WebSocket en Vivo:** `ws://127.0.0.1:8188/ws?clientId={id}` (Escucha de eventos de ejecución, errores y progreso).
- **Encolado de Prompts:** `POST http://127.0.0.1:8188/prompt` (Envío de grafos de ejecución).
- **Inspección de Historial:** `GET http://127.0.0.1:8188/history/{prompt_id}` (Consulta de resultados y salidas).
- **Catálogo de Nodos del Sistema:** `GET http://127.0.0.1:8188/object_info` (Esquemas, tipos y restricciones de nodos).
- **Métricas de Hardware y GPU:** `GET http://127.0.0.1:8188/system_stats` (VRAM libre, CUDA y PyTorch).

### URLs de Producción y Recursos Externos
- **Sitio Web en Producción:** `https://cadensa-web.pages.dev/`
- **Repositorio de SadTalker:** `https://github.com/sonukkc1312/comfyui-sadtalker.git`
- **Repositorio de Wav2Lip:** `https://github.com/ShmuelRonen/ComfyUI_wav2lip.git`
- **Descarga de Pesos Wav2Lip GAN:** `https://huggingface.co/Nekochu/Wav2Lip/resolve/main/wav2lip_gan.pth`
- **Ruedas PyTorch CUDA Utilizadas:**
  - `cu121` (Incompatible con dependencias runtime en esta instalación).
  - `cu128` (Instalada y operativa con soporte RTX 4060 en `https://download.pytorch.org/whl/cu128`).

---

## 6. Rutas de Sistema y Entornos de Soporte en Windows

- **Directorio de Usuario:** `C:\Users\lenin\`
- **Binarios del Sistema:** `C:\Windows\System32`
- **Servidor Web y Base de Datos Local:** `C:\xampp\`
- **Entorno Python Temporal gestionado por `uv`:**  
  `C:\Users\lenin\AppData\Roaming\uv\python\cpython-3.10-windows-x86_64-none\`

