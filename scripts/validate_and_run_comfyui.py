#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Script Maestro Universal para Validación, Sanitización y Ejecución de ComfyUI
https://cadensa-web.pages.dev/

Propósito:
Script universal autónomo para validar, sanitizar y ejecutar flujos de trabajo generativos
(SadTalker, Wav2Lip y futuros pipelines) en ComfyUI Desktop local, con supervisión en tiempo
real vía WebSockets e ingesta modular en la LLM Wiki (wiki/raw/comfyui/history/ y wiki/log.md).

Características Principales:
1. Auto-sanación de dependencias (pre-flight checks con pip automático y ping a ComfyUI).
2. Interfaz CLI universal con argumentos (--workflow, --image, --audio, --force-fix, --server).
3. Sanitización inteligente del grafo basada en el catálogo /object_info (eliminación segura
   de nodos SaveVideo redundantes cuando el worker es nativamente un output_node).
4. Ingesta modular en la LLM Wiki: crea un archivo detallado por ejecución en
   wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md y agrega una sola línea de resumen en wiki/log.md.
"""

from __future__ import annotations
import os
import sys
import json
import uuid
import shutil
import datetime
import argparse
import subprocess
import urllib.request
import urllib.error
import wave
import struct

# ==============================================================================
# CONFIGURACIÓN DE CONSOLA Y ENTORNO
# ==============================================================================
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass


# ==============================================================================
# FASE 0: PRE-FLIGHT CHECKS Y AUTO-SANACIÓN DEL ENTORNO
# ==============================================================================
def ensure_dependencies():
    """Verifica e instala dependencias requeridas usando el intérprete Python activo."""
    required = ["websocket-client"]
    for pkg in required:
        try:
            __import__("websocket")
        except ImportError:
            print(f"   ⚠️ Dependencia '{pkg}' ausente. Instalando automáticamente con pip...", flush=True)
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
                print(f"   ✅ '{pkg}' instalado correctamente.", flush=True)
            except Exception as e:
                print(f"   ❌ Error al instalar '{pkg}': {e}", flush=True)
                sys.exit(1)

ensure_dependencies()
import websocket  # noqa: E402


def check_comfyui_health(server_url: str, timeout: float = 3.0) -> bool:
    """Verifica si el servidor ComfyUI está activo y respondiendo."""
    try:
        req = urllib.request.Request(
            f"{server_url}/object_info",
            headers={"User-Agent": "Cadensa-Comfy-PreFlight"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


# ==============================================================================
# RESOLUCIÓN INTELIGENTE DE RUTAS HÍBRIDAS (WINDOWS / WSL)
# ==============================================================================
DEFAULT_WORKFLOW_CANDIDATES = [
    r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\wiki\raw\comfyui\video-avatar.json",
    r"wiki\raw\comfyui\video-avatar.json",
    r"/home/merolhack/fl/cadensa-web/wiki/raw/comfyui/video-avatar.json",
    r"wiki/raw/comfyui/video-avatar.json"
]

DEFAULT_IMAGE_CANDIDATES = [
    r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\public\media\images\avatar-maestro.jpg",
    r"public\media\images\avatar-maestro.jpg",
    r"/home/merolhack/fl/cadensa-web/public/media/images/avatar-maestro.jpg",
    r"public/media/images/avatar-maestro.jpg"
]

DEFAULT_AUDIO_CANDIDATES = [
    r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\public\media\audio\cadensa_sts_sample.wav",
    r"public\media\audio\cadensa_sts_sample.wav",
    r"/home/merolhack/fl/cadensa-web/public/media/audio/cadensa_sts_sample.wav",
    r"public/media/audio/cadensa_sts_sample.wav",
    r"test_cadensa_tts.wav"
]

COMFY_INPUT_DIRS = [
    r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\input",
    os.path.expandvars(r"%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\input")
]

COMFY_OUTPUT_DIRS = [
    r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\output",
    os.path.expandvars(r"%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\output")
]

WIKI_LOG_CANDIDATES = [
    r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\wiki\log.md",
    r"wiki\log.md",
    r"/home/merolhack/fl/cadensa-web/wiki/log.md",
    r"wiki/log.md"
]

WIKI_HISTORY_DIRS = [
    r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\wiki\raw\comfyui\history",
    r"wiki\raw\comfyui\history",
    r"/home/merolhack/fl/cadensa-web/wiki/raw/comfyui/history",
    r"wiki/raw/comfyui/history"
]


def resolve_path(given_path: str | None, default_candidates: list[str]) -> str | None:
    """Resuelve una ruta dada o itera por los candidatos por defecto."""
    if given_path:
        if os.path.exists(given_path):
            return os.path.abspath(given_path)
        # Intentar normalización
        norm = os.path.normpath(given_path)
        if os.path.exists(norm):
            return os.path.abspath(norm)
        return None

    for candidate in default_candidates:
        if os.path.exists(candidate):
            return os.path.abspath(candidate)
    return None


def resolve_history_dir(default_candidates: list[str]) -> str:
    """Localiza o crea el directorio de historial modular de ComfyUI."""
    for candidate in default_candidates:
        parent = os.path.dirname(candidate)
        if os.path.exists(parent):
            os.makedirs(candidate, exist_ok=True)
            return os.path.abspath(candidate)
    fallback = os.path.abspath(default_candidates[0])
    os.makedirs(fallback, exist_ok=True)
    return fallback


def log(msg: str):
    print(f"   👉 {msg}", flush=True)


def step(title: str):
    print(f"\n[{title}]", flush=True)


# ==============================================================================
# FASE 1: VALIDACIÓN ESTRUCTURAL Y SANITIZACIÓN INTELIGENTE DEL GRAFO
# ==============================================================================
def validate_and_sanitize_graph(
    workflow: dict,
    server_url: str,
    force_fix: bool = False
) -> tuple[bool, list[str], dict, dict, list[str], str]:
    """
    Valida las clases de nodos contra /object_info, verifica compatibilidad de tipos
    y aplica sanitización inteligente:
    - Si un nodo generador (ej. SadTalker, Wav2Lip) es output_node=True y emite STRING,
      y está conectado a un nodo SaveVideo redundante que espera VIDEO:
      * Con force_fix=True: elimina de forma segura el nodo SaveVideo redundante.
      * Con force_fix=False: genera un error bloqueante solicitando usar --force-fix.
    - Si el nodo emisor no es un nodo de salida, valida que SaveVideo opere normalmente.
    """
    step("FASE 1: Validación Estructural y Sanitización Inteligente del Grafo")
    errors = []
    sanitization_actions = []
    generator_class_detected = "Generador Estándar"
    sanitized_workflow = json.loads(json.dumps(workflow))

    log(f"Consultando catálogo oficial de nodos en {server_url}/object_info...")
    try:
        req = urllib.request.Request(
            f"{server_url}/object_info",
            headers={"User-Agent": "Cadensa-Comfy-Master"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            object_info = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        errors.append(f"Fallo de conexión al consultar /object_info: {e}")
        return False, errors, {}, workflow, sanitization_actions, generator_class_detected

    log(f"Servidor activo. Nodos registrados disponibles: {len(object_info)}")

    # 1. Comprobar que todas las clases existan
    for node_id, node_data in workflow.items():
        class_type = node_data.get("class_type")
        if not class_type:
            errors.append(f"Nodo '{node_id}' carece de atributo 'class_type'.")
            continue
        if class_type not in object_info:
            errors.append(f"Nodo '{node_id}' [{class_type}]: Clase no instalada en el servidor ComfyUI.")
        else:
            if "sadtalker" in class_type.lower() or "wav2lip" in class_type.lower() or "generator" in class_type.lower():
                generator_class_detected = class_type
            log(f"Nodo '{node_id}' [{class_type}] validado correctamente.")

    if errors:
        return False, errors, object_info, workflow, sanitization_actions, generator_class_detected

    # 2. Análisis de enlaces, entradas obligatorias y discrepancias de tipo
    log("Inspeccionando compatibilidad de tipos entre nodos...")
    nodes_to_remove = set()

    for node_id, node_data in list(workflow.items()):
        class_type = node_data["class_type"]
        node_schema = object_info[class_type]
        required_inputs = node_schema.get("input", {}).get("required", {})
        inputs = node_data.get("inputs", {})

        for input_name, input_spec in required_inputs.items():
            expected_type = input_spec[0]
            if input_name not in inputs:
                errors.append(f"Nodo '{node_id}' [{class_type}]: Falta input obligatorio '{input_name}' ({expected_type}).")
                continue

            val = inputs[input_name]
            # Enlace de conexión ComfyUI: ["<node_id>", <output_index>]
            if isinstance(val, list) and len(val) == 2 and isinstance(val[0], str) and isinstance(val[1], int):
                src_id, out_idx = val[0], val[1]
                if src_id not in workflow:
                    errors.append(f"Nodo '{node_id}' [{class_type}]: Enlace hacia nodo inexistente '{src_id}'.")
                    continue

                src_class = workflow[src_id].get("class_type")
                src_schema = object_info.get(src_class, {})
                src_outputs = src_schema.get("output", [])
                src_is_output_node = src_schema.get("output_node", False)

                if out_idx < len(src_outputs):
                    actual_type = src_outputs[out_idx]
                    
                    # Chequeo de compatibilidad de tipos
                    if expected_type != "*" and actual_type != "*" and expected_type != actual_type:
                        mismatch_desc = (
                            f"Discrepancia de tipos: Nodo '{node_id}' [{class_type}] espera '{expected_type}' "
                            f"en input '{input_name}', pero nodo emisor '{src_id}' [{src_class}] emite '{actual_type}'."
                        )
                        log(f"⚠️ {mismatch_desc}")

                        # CONDICIÓN DE SANITIZACIÓN INTELIGENTE:
                        # Si el emisor es un output_node nativo (el worker ya guarda el archivo de salida)
                        # y el consumidor es un nodo de guardado secundario (como SaveVideo),
                        # SaveVideo es redundante.
                        is_redundant_save = (
                            src_is_output_node and (
                                class_type in ("SaveVideo", "SaveImage", "SaveAnimatedPNG", "SaveAudio") or
                                node_schema.get("output_node", False)
                            )
                        )

                        if is_redundant_save:
                            if force_fix:
                                msg = "Nodo de guardado redundante detectado y eliminado de forma segura. El worker ya guarda el archivo"
                                log(f"💡 {msg} (Removiendo nodo '{node_id}' [{class_type}]).")
                                nodes_to_remove.add(node_id)
                                sanitization_actions.append(f"{msg}: Nodo '{node_id}' [{class_type}] desconectado de '{src_id}' [{src_class}].")
                            else:
                                err_msg = (
                                    f"Discrepancia bloqueante detectada entre '{src_class}' y '{class_type}'. "
                                    f"El nodo '{src_class}' es terminal (output_node=True), haciendo que '{class_type}' sea redundante. "
                                    f"Ejecuta con --force-fix para permitir la sanitización automática del grafo."
                                )
                                errors.append(err_msg)
                        else:
                            # Discrepancia real no redundante
                            errors.append(mismatch_desc)

    # Aplicar remoción de nodos sanitizados
    for nid in nodes_to_remove:
        sanitized_workflow.pop(nid, None)

    if errors:
        log("Se detectaron errores en la estructura del grafo:")
        for err in errors:
            print(f"      ❌ {err}", flush=True)
        return False, errors, object_info, workflow, sanitization_actions, generator_class_detected

    log("✅ Grafo validado y sanitizado satisfactoriamente.")
    return True, [], object_info, sanitized_workflow, sanitization_actions, generator_class_detected


# ==============================================================================
# FASE 2: INYECCIÓN DINÁMICA DE PARÁMETROS
# ==============================================================================
def inject_dynamic_parameters(
    workflow: dict,
    image_path: str,
    audio_path: str | None,
    comfy_input_dir: str
) -> tuple[dict, str, str]:
    """
    Copia los recursos de imagen y audio a la carpeta input/ de ComfyUI
    e inyecta dinámicamente sus nombres en los nodos correspondientes.
    """
    step("FASE 2: Inyección Dinámica de Parámetros y Preparación de Entorno")
    os.makedirs(comfy_input_dir, exist_ok=True)

    # 1. Copia e inyección de Imagen
    image_filename = os.path.basename(image_path)
    dest_image_path = os.path.join(comfy_input_dir, image_filename)
    log(f"Aprovisionando imagen en input/: {image_filename}")
    shutil.copy2(image_path, dest_image_path)
    log(f"✅ Imagen verificada en input/ ({os.path.getsize(dest_image_path)} bytes).")

    for node_id, node_data in workflow.items():
        if node_data.get("class_type") == "LoadImage":
            node_data.setdefault("inputs", {})["image"] = image_filename
            log(f"Inyección: LoadImage (Nodo {node_id}) -> image = '{image_filename}'")

    # 2. Copia e inyección de Audio
    audio_filename = "example.wav"
    if audio_path and os.path.exists(audio_path):
        audio_filename = os.path.basename(audio_path)
        dest_audio_path = os.path.join(comfy_input_dir, audio_filename)
        log(f"Aprovisionando audio personalizado en input/: {audio_filename}")
        shutil.copy2(audio_path, dest_audio_path)
    else:
        dest_audio_path = os.path.join(comfy_input_dir, audio_filename)
        if not os.path.exists(dest_audio_path):
            log(f"Generando audio de prueba fonoaudiológico en input/{audio_filename}...")
            with wave.open(dest_audio_path, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)
                silence = struct.pack("<16000h", *([0] * 16000))
                wf.writeframes(silence)

    for node_id, node_data in workflow.items():
        if node_data.get("class_type") in ("LoadAudio", "VHS_LoadAudio"):
            node_data.setdefault("inputs", {})["audio"] = audio_filename
            log(f"Inyección: {node_data['class_type']} (Nodo {node_id}) -> audio = '{audio_filename}'")

    return workflow, image_filename, audio_filename


# ==============================================================================
# FASE 3: EJECUCIÓN Y SUPERVISIÓN ASÍNCRONA WEBSOCKET
# ==============================================================================
def execute_and_monitor_websocket(
    workflow: dict,
    client_id: str,
    server_url: str
) -> tuple[bool, str | None, str | None, list[str]]:
    """
    Envía el grafo a /prompt y escucha activamente el WebSocket en tiempo real.
    """
    step("FASE 3: Ejecución y Supervisión Asíncrona vía WebSockets")
    logs = []
    ws_host = server_url.replace("http://", "").replace("https://", "")
    ws_url = f"ws://{ws_host}/ws?clientId={client_id}"

    log(f"Estableciendo canal WebSocket con: {ws_url}...")
    ws = websocket.WebSocket()
    try:
        ws.connect(ws_url, timeout=15)
        # Configurar timeout generoso (10 minutos) para tolerar inferencias neuronales pesadas
        ws.settimeout(600.0)
        log("✅ Canal WebSocket conectado satisfactoriamente.")
    except Exception as e:
        err = f"No se pudo conectar al WebSocket de ComfyUI: {e}"
        log(f"❌ {err}")
        return False, None, None, [err]

    # Enviar payload a /prompt
    prompt_payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{server_url}/prompt",
        data=prompt_payload,
        headers={"Content-Type": "application/json"}
    )

    log(f"Despachando prompt a {server_url}/prompt...")
    prompt_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            prompt_id = resp_data.get("prompt_id")
            log(f"✅ Prompt aceptado en cola. Prompt ID: {prompt_id}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        err_msg = f"HTTP Error {e.code} en /prompt: {err_body}"
        log(f"❌ {err_msg}")
        ws.close()
        return False, None, None, [err_msg]
    except Exception as e:
        err_msg = f"Error de despacho en /prompt: {e}"
        log(f"❌ {err_msg}")
        ws.close()
        return False, None, None, [err_msg]

    # Monitoreo en tiempo real
    log(f"Monitoreando ciclo de vida para prompt_id={prompt_id}...")
    output_video_path = None
    execution_success = False

    try:
        while True:
            try:
                raw_msg = ws.recv()
            except (websocket.WebSocketTimeoutException, TimeoutError):
                log("⏳ En espera de finalización de inferencia en worker...")
                continue
            if not raw_msg:
                continue

            if isinstance(raw_msg, str):
                msg = json.loads(raw_msg)
                mtype = msg.get("type")
                mdata = msg.get("data", {})

                if mtype == "execution_start" and mdata.get("prompt_id") == prompt_id:
                    log("🚀 ComfyUI ha iniciado la ejecución del grafo.")

                elif mtype == "executing" and mdata.get("prompt_id") == prompt_id:
                    node = mdata.get("node")
                    if node is None:
                        log("🏁 Inferencia finalizada exitosamente (nodo activo: None).")
                        execution_success = True
                        break
                    else:
                        node_class = workflow.get(str(node), {}).get("class_type", "Desconocido")
                        log(f"Procesando Nodo {node} [{node_class}]...")

                elif mtype == "progress":
                    val = mdata.get("value")
                    max_v = mdata.get("max")
                    if max_v:
                        log(f"Progreso de inferencia: {val}/{max_v} ({val*100//max_v}%)")

                elif mtype in ("execution_error", "execution_failed"):
                    err_details = json.dumps(mdata, indent=2)
                    err_msg = f"Fallo en nodo ({mtype}): {err_details}"
                    log(f"❌ {err_msg}")
                    logs.append(err_msg)
                    execution_success = False
                    break

    except Exception as e:
        err_msg = f"Excepción durante supervisión WebSocket: {e}"
        log(f"⚠️ {err_msg}")
        logs.append(err_msg)
    finally:
        ws.close()

    # Consultar /history/{prompt_id} para obtener la salida
    if prompt_id:
        log(f"Consultando historial en {server_url}/history/{prompt_id}...")
        try:
            with urllib.request.urlopen(f"{server_url}/history/{prompt_id}", timeout=10) as h_resp:
                history = json.loads(h_resp.read().decode("utf-8")).get(prompt_id, {})
                outputs = history.get("outputs", {})
                for n_id, n_out in outputs.items():
                    if "videos" in n_out:
                        for v in n_out["videos"]:
                            fname = v.get("filename")
                            subf = v.get("subfolder", "")
                            rel_path = os.path.join(subf, fname) if subf else fname
                            resolved_v = None
                            for out_dir in COMFY_OUTPUT_DIRS:
                                cand = os.path.join(out_dir, rel_path)
                                if os.path.exists(cand):
                                    resolved_v = cand
                                    break
                            output_video_path = resolved_v if resolved_v else rel_path
                            log(f"🎬 Video detectado en historial: {output_video_path}")
                    elif "video_path" in n_out:
                        vpath = n_out["video_path"]
                        resolved_v = None
                        if os.path.exists(vpath):
                            resolved_v = vpath
                        else:
                            for out_dir in COMFY_OUTPUT_DIRS:
                                cand = os.path.join(out_dir, vpath)
                                if os.path.exists(cand):
                                    resolved_v = cand
                                    break
                        output_video_path = resolved_v if resolved_v else vpath
                        log(f"🎬 Video generado por worker: {output_video_path}")
        except Exception as e:
            log(f"No fue posible consultar /history: {e}")

    return execution_success, prompt_id, output_video_path, logs


def free_comfyui_vram(server_url: str):
    """Purga la memoria VRAM y descarga modelos en el servidor ComfyUI llamando al endpoint /free."""
    try:
        log("   👉 Purgando memoria VRAM en ComfyUI (/free)...")
        req = urllib.request.Request(
            f"{server_url}/free",
            data=json.dumps({"unload_models": True, "free_memory": True}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
        log("   ✅ VRAM purgada exitosamente en ComfyUI.")
    except Exception as e:
        log(f"   ⚠️ Nota al liberar VRAM en ComfyUI: {e}")


# ==============================================================================
# FASE 4: INGESTA MODULAR EN LLM WIKI
# ==============================================================================
def ingest_modular_wiki(
    history_dir: str,
    wiki_log_path: str,
    status: str,
    prompt_id: str | None,
    generator_class: str,
    workflow_path: str,
    image_name: str,
    audio_name: str,
    output_video: str | None,
    sanitization_actions: list[str],
    errors: list[str],
    pipeline_mode: str = "standard",
    pipeline_details: dict | None = None,
    timeline_data: dict | None = None
):
    """
    Crea un archivo modular en wiki/raw/comfyui/history/{YYYY-MM-DD}_{prompt_id}.md
    y anexa una sola línea de resumen en wiki/log.md con enlace de wikilink.
    Cumple estrictamente con la regla de CERO sintaxis LaTeX/MathJax.
    """
    step("FASE 4: Ingesta Modular en LLM Wiki")
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    now_full = f"{date_str} {time_str}"
    iso_timestamp = now.isoformat()

    pid = prompt_id if prompt_id else f"failed-{uuid.uuid4().hex[:8]}"
    file_id = f"{date_str}_{pid}"
    history_file_path = os.path.join(history_dir, f"{file_id}.md")

    status_badge = "✅ Éxito" if status == "SUCCESS" else "⚠️ Fallo / Validación"
    output_val = output_video if output_video else "Ninguno"

    # 1. Contenido del archivo modular
    sanitization_desc = (
        "\n".join([f"- {act}" for act in sanitization_actions])
        if sanitization_actions else "No se requirió sanitización (el grafo era compatible)."
    )

    diagnostics_desc = (
        "\n".join([f"- `{err}`" for err in errors])
        if errors else "Ejecución completada sin errores reportados."
    )

    pipeline_section = ""
    if pipeline_mode == "lipsync" and pipeline_details:
        sadtalker_v = pipeline_details.get("sadtalker_video", "N/A")
        wav2lip_v = pipeline_details.get("wav2lip_video", "N/A")
        restored_v = pipeline_details.get("restored_video", "N/A")
        composed_v = pipeline_details.get("composed_video", "N/A")
        pipeline_section = f"""
## 4. Pipeline Secuencial Automatizado de Producción (Orden Optimizado de Alta Fidelidad)
- **Modo:** Pipeline Integral LipSync (`--pipeline lipsync`)
- **Fase 1 (SadTalker en ComfyUI):** Generación de expresividad, parpadeo y balanceo facial 3DMM a 512x512 px (sin enhancer previo).
  - Video intermedio: `{sadtalker_v}`
- **Fase 2a (Wav2Lip GAN en GPU):** Sincronización labial milimétrica fonética con purga de VRAM previa (`/free`).
  - Checkpoint: `wav2lip_gan.pth`
  - Video refinado: `{wav2lip_v}`
- **Fase 2b (GFPGANv1.4 Face Restore + Supersampling):** Restauración neuronal facial sobre la salida de Wav2Lip. Erradica la borrosidad bucal y reconstruye dientes, labios y textura de piel a 2x de resolución.
  - Video restaurado: `{restored_v}`
- **Fase 3 (Compositor de Alta Fidelidad):** Composición sobre lienzo 1920x1080 px con OpenCV (Lanczos4 + Unsharp Mask) y multiplexación AAC FFmpeg.
  - Lienzo: Carbón `#0F0F13`
  - Avatar: 800x800 px con esquinas `rounded-3xl` (44px), micro-expansión diafragmática y borde esmeralda
  - Metrónomo clínico: Círculo `#10b981` pulsante a 60 BPM sincronizado con las sílabas reales
  - Biofeedback silábico: Cajas activas `[ CA ] [ DEN ] [ SA ]` iluminadas en fonación exacta
  - Video final de entrega: `{composed_v}`
"""

    timeline_section = ""
    if timeline_data:
        timeline_json_str = json.dumps(timeline_data, indent=2, ensure_ascii=False)
        timeline_section = f"""
## 5. Mapa Temporal Clínico y Pausas Fonoaudiológicas (Timeline)
```json
{timeline_json_str}
```
"""

    modular_content = f"""---
title: "ComfyUI Execution - {pid}"
date: "{date_str}"
timestamp: "{iso_timestamp}"
prompt_id: "{pid}"
status: "{status}"
generator_node: "{generator_class}"
pipeline_mode: "{pipeline_mode}"
workflow: "{os.path.basename(workflow_path)}"
image: "{image_name}"
audio: "{audio_name}"
output_video: "{output_val}"
sanitization_applied: {str(bool(sanitization_actions)).lower()}
---

# ComfyUI Execution Detail: {pid}

## 1. Resumen de Ejecución
- **Fecha y Hora:** {now_full}
- **Estado:** {status_badge}
- **Pipeline:** `{pipeline_mode}`
- **Prompt ID:** `{pid}`
- **Nodo Generador:** `{generator_class}`
- **Sanitización de Grafo:**
{sanitization_desc}

## 2. Parámetros y Recursos
- **Workflow Origen:** `{workflow_path}`
- **Imagen de Entrada:** `{image_name}`
- **Audio de Entrada:** `{audio_name}`
- **Video de Salida:** `{output_val}`

## 3. Registro de Eventos y Diagnósticos
{diagnostics_desc}
{pipeline_section}
{timeline_section}
"""

    log(f"Escribiendo reporte modular en: {history_file_path}...")
    try:
        with open(history_file_path, "w", encoding="utf-8") as f:
            f.write(modular_content)
        log(f"✅ Archivo modular creado: {os.path.basename(history_file_path)}")
    except Exception as e:
        print(f"   ❌ Error al escribir archivo modular de historial: {e}", flush=True)

    # 2. Ingesta de una sola línea en wiki/log.md
    pipeline_tag = f"Pipeline {pipeline_mode.upper()} 3-Fases" if pipeline_mode == "lipsync" else f"Nodo: `{generator_class}`"
    log_line = (
        f"- **[{now_full}]** comfyui | Prompt `{pid}` | Estado: {status_badge} | "
        f"{pipeline_tag} | Detalle: [[{file_id}]] "
        f"(ver [historial](raw/comfyui/history/{file_id}.md))\n"
    )

    log(f"Añadiendo línea de resumen en: {wiki_log_path}...")
    try:
        with open(wiki_log_path, "a", encoding="utf-8") as f:
            f.write(log_line)
        log("✅ Línea de resumen añadida a wiki/log.md.")
    except Exception as e:
        print(f"   ❌ Error al actualizar wiki/log.md: {e}", flush=True)


# ==============================================================================
# ORQUESTADOR PRINCIPAL CLI
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Script Maestro Universal para validación, sanitización y ejecución de ComfyUI (Cadensa)."
    )
    parser.add_argument("--workflow", type=str, default=None, help="Ruta al archivo JSON del flujo de trabajo ComfyUI.")
    parser.add_argument("--image", type=str, default=None, help="Ruta a la imagen de entrada (ej. avatar-maestro.jpg).")
    parser.add_argument("--audio", type=str, default=None, help="Ruta al archivo de audio de entrada (opcional).")
    parser.add_argument("--server", type=str, default="http://127.0.0.1:8188", help="URL base de ComfyUI (default: http://127.0.0.1:8188).")
    parser.add_argument("--force-fix", action="store_true", help="Aplica la sanitización inteligente del grafo eliminando nodos redundantes incompatibles.")
    parser.add_argument(
        "--pipeline",
        type=str,
        choices=["standard", "lipsync"],
        default="standard",
        help="Modo de ejecución: 'standard' (SadTalker único) o 'lipsync' (SadTalker -> Wav2Lip -> Compositor 1920x1080)."
    )
    parser.add_argument("--timeline", type=str, default=None, help="Ruta al archivo JSON de timeline fonoaudiológico.")
    parser.add_argument("--build-clinical-audio", action="store_true", help="Construye audio clínico fonoaudiológico con pausas de respiración diafragmática y silencios isocrónicos.")
    parser.add_argument("--syllables", nargs="+", default=["CA", "DEN", "SA"], help="Lista de sílabas para STS.")
    parser.add_argument("--bpm", type=float, default=60.0, help="Tempo en BPM para el metrónomo y la isocronía silábica.")

    args = parser.parse_args()

    print("=" * 80)
    print("🌟 CADENSA — SCRIPT MAESTRO UNIVERSAL DE COMFYUI")
    print("=" * 80)

    # 1. Pre-flight Check: Salud de ComfyUI
    log(f"Comprobando conectividad con el servidor ComfyUI en {args.server}...")
    if not check_comfyui_health(args.server):
        print(f"\n❌ Error: El servidor ComfyUI no responde en {args.server}.")
        print("   Por favor, inicia ComfyUI Desktop antes de ejecutar este script.")
        sys.exit(1)
    log("✅ Servidor ComfyUI activo y respondiendo a pre-flight checks.")

    # 2. Resolución de Recursos
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)

    timeline_path = args.timeline
    timeline_data = None

    # FASE 0: Pre-procesamiento de Audio Clínico Fonoaudiológico (Respiración e Isocronía STS)
    should_build_audio = args.build_clinical_audio or (args.pipeline == "lipsync" and not args.audio)
    if should_build_audio:
        step("FASE 0: Generación de Audio Clínico con Pausas y Respiración Diafragmática")
        try:
            from build_clinical_audio import build_sts_audio_and_timeline
            public_audio_dir = resolve_path(None, [
                r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\public\media\audio",
                r"public\media\audio",
                r"/home/merolhack/fl/cadensa-web/public/media/audio",
                r"public/media/audio"
            ])
            if not public_audio_dir:
                public_audio_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "media", "audio")
                os.makedirs(public_audio_dir, exist_ok=True)
            out_wav = os.path.join(public_audio_dir, "cadensa_sts_sample.wav")
            out_tl = os.path.join(public_audio_dir, "cadensa_sts_timeline.json")

            audio_res, tl_res, tl_data = build_sts_audio_and_timeline(
                syllables=args.syllables,
                bpm=args.bpm,
                prep_silence_sec=2.5,
                post_silence_sec=2.0,
                output_wav_path=out_wav,
                output_timeline_path=out_tl
            )
            audio_path = audio_res
            timeline_path = tl_res
            timeline_data = tl_data
            log(f"✅ Audio clínico y timeline fonoaudiológico generados en: {audio_path}")
        except Exception as e:
            log(f"⚠️ Error generando audio clínico en Fase 0: {e}")
            audio_path = resolve_path(args.audio, DEFAULT_AUDIO_CANDIDATES) if args.audio else resolve_path(None, DEFAULT_AUDIO_CANDIDATES)
    else:
        audio_path = resolve_path(args.audio, DEFAULT_AUDIO_CANDIDATES) if args.audio else resolve_path(None, DEFAULT_AUDIO_CANDIDATES)

    # Cargar timeline si existe en disco y aún no está en memoria
    if not timeline_data:
        potential_tl = timeline_path or (audio_path.replace(".wav", "_timeline.json") if audio_path else None)
        if potential_tl and os.path.exists(potential_tl):
            try:
                with open(potential_tl, "r", encoding="utf-8") as f:
                    timeline_data = json.load(f)
                timeline_path = potential_tl
                log(f"✅ Timeline fonoaudiológico cargado desde: {timeline_path}")
            except Exception:
                pass

    workflow_path = resolve_path(args.workflow, DEFAULT_WORKFLOW_CANDIDATES)
    image_path = resolve_path(args.image, DEFAULT_IMAGE_CANDIDATES)
    input_dir = resolve_path(None, COMFY_INPUT_DIRS)
    wiki_log_path = resolve_path(None, WIKI_LOG_CANDIDATES)
    history_dir = resolve_history_dir(WIKI_HISTORY_DIRS)

    if not workflow_path:
        print(f"❌ Error: No se localizó el archivo de workflow (especificado: {args.workflow}).")
        sys.exit(1)
    if not image_path:
        print(f"❌ Error: No se localizó la imagen de entrada (especificada: {args.image}).")
        sys.exit(1)
    if not input_dir:
        input_dir = COMFY_INPUT_DIRS[0]
        os.makedirs(input_dir, exist_ok=True)
    if not wiki_log_path:
        print("❌ Error: No se localizó el archivo 'wiki/log.md'.")
        sys.exit(1)

    log(f"Workflow origen:    {workflow_path}")
    log(f"Imagen oficial:     {image_path}")
    log(f"Audio especificado: {audio_path if audio_path else '(Predeterminado example.wav)'}")
    log(f"Modo de Pipeline:   {args.pipeline.upper()}")
    log(f"Carpeta ComfyUI:    {input_dir}")
    log(f"Historial modular:  {history_dir}")
    log(f"Modo Force-Fix:     {'ACTIVO' if args.force_fix else 'INACTIVO'}")

    # Cargar Workflow
    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    # FASE 1: Validación y Sanitización Inteligente
    is_valid, val_errors, obj_info, sanitized_wf, sanitization_actions, gen_class = validate_and_sanitize_graph(
        workflow=workflow,
        server_url=args.server,
        force_fix=args.force_fix
    )

    # FASE 2: Inyección de Parámetros
    image_name = os.path.basename(image_path)
    audio_name = os.path.basename(audio_path) if audio_path else "example.wav"
    if is_valid:
        sanitized_wf, image_name, audio_name = inject_dynamic_parameters(
            workflow=sanitized_wf,
            image_path=image_path,
            audio_path=audio_path,
            comfy_input_dir=input_dir
        )

    # FASE 3: Ejecución y Monitoreo WebSocket (SadTalker)
    exec_success = False
    prompt_id = None
    output_video = None
    exec_errors = []

    if is_valid:
        client_id = str(uuid.uuid4())
        exec_success, prompt_id, output_video, exec_errors = execute_and_monitor_websocket(
            workflow=sanitized_wf,
            client_id=client_id,
            server_url=args.server
        )
    else:
        log("⚠️ Ejecución abortada debido a discrepancias en el grafo.")
        exec_errors = val_errors

    # PIPELINE AVANZADO: LIPSYNC (Wav2Lip + Compositor 1920x1080)
    pipeline_details = {}
    if is_valid and exec_success and output_video and args.pipeline == "lipsync":
        step("PIPELINE FASE 2: Sincronización Labial Milimétrica (Wav2Lip GAN)")
        # 1. Purgar VRAM de ComfyUI para liberar los 8 GB para Wav2Lip
        free_comfyui_vram(args.server)

        # 2. Importar o cargar ejecutor de Wav2Lip
        scripts_dir = os.path.dirname(os.path.abspath(__file__))
        if scripts_dir not in sys.path:
            sys.path.insert(0, scripts_dir)
        try:
            if output_video and not os.path.exists(output_video):
                for out_dir in COMFY_OUTPUT_DIRS:
                    cand = os.path.join(out_dir, output_video)
                    if os.path.exists(cand):
                        output_video = cand
                        break

            from wav2lip_runner import run_wav2lip_inference
            actual_audio_path = audio_path if audio_path else os.path.join(input_dir, audio_name)

            public_media_dir = resolve_path(None, [
                r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\public\media\techniques",
                r"public\media\techniques",
                r"/home/merolhack/fl/cadensa-web/public/media/techniques",
                r"public/media/techniques"
            ])
            if not public_media_dir:
                public_media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "media", "techniques")
                os.makedirs(public_media_dir, exist_ok=True)

            wav2lip_output = os.path.join(public_media_dir, "cadensa_sts_wav2lip_refined.mp4")
            log(f"Ejecutando Wav2Lip GAN sobre video facial: {output_video}...")
            run_wav2lip_inference(
                face_video_path=output_video,
                audio_path=actual_audio_path,
                output_video_path=wav2lip_output
            )
            log(f"✅ Video refinado con Wav2Lip generado en: {wav2lip_output}")

            step("PIPELINE FASE 2b: Restauración Facial Neuronal Post-Wav2Lip (GFPGANv1.4 + Supersampling)")
            restored_face_output = os.path.join(public_media_dir, "cadensa_sts_face_restored.mp4")
            sadtalker_venv_python = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\Comfyui-SadTalker\.venv_sadtalker\Scripts\python.exe"
            restore_script = os.path.join(scripts_dir, "restore_face_pipeline.py")

            cmd_restore = [
                sadtalker_venv_python,
                restore_script,
                "--input-video", wav2lip_output,
                "--output-video", restored_face_output,
                "--upscale", "2"
            ]
            log(f"Ejecutando GFPGANv1.4 sobre video de Wav2Lip para restaurar nitidez de labios y piel...")
            subprocess.run(cmd_restore, check=True)
            log(f"✅ Video con rostro y labios restaurados generado en: {restored_face_output}")

            step("PIPELINE FASE 3: Compositor de Lienzo Limpio Institucional (1920x1080)")
            from compose_cadensa_video import compose_video
            final_output = os.path.join(public_media_dir, "cadensa_sts_avatar_final.mp4")
            log(f"Componiendo sobre lienzo 1920x1080 con metrónomo y cajas silábicas...")
            compose_video(
                face_video_path=restored_face_output,
                audio_path=actual_audio_path,
                output_path=final_output,
                timeline_path=timeline_path,
                bpm=args.bpm
            )
            log(f"🎉 Pipeline de 4 fases completado exitosamente: {final_output}")
            pipeline_details = {
                "sadtalker_video": output_video,
                "wav2lip_video": wav2lip_output,
                "restored_video": restored_face_output,
                "composed_video": final_output
            }
            output_video = final_output
        except Exception as e:
            log(f"❌ Error durante el pipeline avanzado: {e}")
            exec_errors.append(f"Pipeline avanzado error: {e}")
            exec_success = False

    # FASE 4: Ingesta Modular en LLM Wiki
    final_status = "SUCCESS" if (is_valid and exec_success) else "FAILED"
    all_errors = val_errors + exec_errors

    ingest_modular_wiki(
        history_dir=history_dir,
        wiki_log_path=wiki_log_path,
        status=final_status,
        prompt_id=prompt_id,
        generator_class=gen_class,
        workflow_path=workflow_path,
        image_name=image_name,
        audio_name=audio_name,
        output_video=output_video,
        sanitization_actions=sanitization_actions,
        errors=all_errors,
        pipeline_mode=args.pipeline,
        pipeline_details=pipeline_details,
        timeline_data=timeline_data
    )

    print("\n" + "=" * 80)
    print(f"🏁 PROCESO CONCLUIDO CON ESTADO: {final_status}")
    print("=" * 80)

    if final_status == "SUCCESS":
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
