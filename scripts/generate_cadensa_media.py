#!/usr/bin/env python3
from __future__ import annotations
"""
Pipeline Automatizado de Generación Multimedia Local para Cadensa (Costo Cero).
Orquesta:
1. Ollama Local (gemma4:cloud / qwen3:8b-8k) para guion clínico y visual prompt.
2. ComfyUI REST API (Z-Image Turbo / Flux distilled) para síntesis de imagen.
3. FFmpeg Engine (con zoompan rítmico y fade in/out) para video MP4 H.264.
"""

import os
import sys
import json
import time
import shutil
import random
import urllib.request
import urllib.error
import subprocess
from pathlib import Path

OLLAMA_URL = "http://127.0.0.1:11434"
COMFYUI_URL = "http://127.0.0.1:8188"

PRIMARY_OLLAMA_MODEL = "gemma4:cloud"
FALLBACK_OLLAMA_MODEL = "qwen3:8b-8k"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PUBLIC_DIR = PROJECT_ROOT / "public"
OUTPUT_VIDEO_PATH = PUBLIC_DIR / "cadensa_automated_test.mp4"
TEMP_FRAME_PATH = SCRIPT_DIR / "temp_cadensa_frame.png"


def query_ollama(prompt: str, system_prompt: str = "") -> str:
    """Consulta Ollama con jerarquía: 1. gemma4:cloud, 2. qwen3:8b-8k."""
    for model in [PRIMARY_OLLAMA_MODEL, FALLBACK_OLLAMA_MODEL]:
        try:
            print(f"   👉 Intentando generación con Ollama [{model}]...")
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7
                }
            }
            if system_prompt:
                payload["system"] = system_prompt

            req = urllib.request.Request(
                f"{OLLAMA_URL}/api/generate",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data.get("response", "").strip()
                if text:
                    print(f"   ✅ Respuesta recibida exitosamente de [{model}].")
                    return text
        except Exception as e:
            print(f"   ⚠️ Falló modelo [{model}]: {e}")
            continue

    raise RuntimeError("No fue posible generar texto con ningún modelo de Ollama.")


def generate_clinical_script() -> tuple[str, str]:
    """Genera guion clínico en español y prompt visual en inglés para difusión."""
    print("\n[FASE 2.1] Generando Guion Clínico y Prompts con Ollama Local...")

    system_script = (
        "Eres un fonoaudiólogo clínico experto en tartamudez y fluidez verbal para la plataforma Cadensa. "
        "Redacta en español un guion breve (máximo 3 párrafos cortos) explicando la técnica de "
        "Habla Rítmica Silábica (Syllable-Timed Speech - STS), destacando cómo cada sílaba se emite a un pulso "
        "regular de metrónomo para eludir el déficit de temporización de los ganglios basales. "
        "Usa un tono clínico, motivador y profesional."
    )
    script_prompt = (
        "Escribe la guía breve de práctica clínica para la técnica de Habla Rítmica Silábica (STS) de Cadensa."
    )
    clinical_script = query_ollama(script_prompt, system_script)

    system_visual = (
        "You are an expert prompt engineer for advanced diffusion models (Z-Image Turbo, Flux, SDXL). "
        "Create a single-paragraph, highly detailed English visual prompt depicting smooth, elegant soundwaves "
        "flowing rhythmically. Focus on neon emerald (#10b981) and cyan (#06b6d4) bioluminescent curves undulating "
        "against a deep, minimalist dark zinc background (#09090b), symbolizing the human voice in perfect rhythm. "
        "Include keywords like: 8k, photorealistic, cinematic lighting, sharp focus, octane render, fluid dynamics, "
        "biomedical acoustic visualization. Do not include any text, letters, watermarks or borders."
    )
    visual_query = (
        "Generate the English visual diffusion prompt for Cadensa's rhythmic soundwave concept."
    )
    visual_prompt = query_ollama(visual_query, system_visual)

    return clinical_script, visual_prompt


def build_comfyui_workflow(visual_prompt: str) -> dict:
    """Construye el flujo de nodos en formato API para Z-Image Turbo / Flux en ComfyUI."""
    seed = random.randint(1, 1000000000)
    workflow = {
        "4": {
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "stable_cascade",
                "device": "default"
            },
            "class_type": "CLIPLoader",
            "_meta": {"title": "Load CLIP"}
        },
        "10": {
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default"
            },
            "class_type": "UNETLoader",
            "_meta": {"title": "Load Diffusion Model"}
        },
        "11": {
            "inputs": {
                "vae_name": "ae.safetensors"
            },
            "class_type": "VAELoader",
            "_meta": {"title": "Load VAE"}
        },
        "9": {
            "inputs": {
                "width": 1280,
                "height": 720,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {"title": "Empty Latent Image"}
        },
        "3": {
            "inputs": {
                "text": visual_prompt,
                "clip": ["4", 0]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {"title": "Positive Prompt"}
        },
        "12": {
            "inputs": {
                "text": "low quality, blurry, distorted, text, watermark, logo, deformed, noise, artifacts",
                "clip": ["4", 0]
            },
            "class_type": "CLIPTextEncode",
            "_meta": {"title": "Negative Prompt"}
        },
        "5": {
            "inputs": {
                "seed": seed,
                "steps": 8,
                "cfg": 1.0,
                "sampler_name": "res_multistep",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["10", 0],
                "positive": ["3", 0],
                "negative": ["12", 0],
                "latent_image": ["9", 0]
            },
            "class_type": "KSampler",
            "_meta": {"title": "KSampler"}
        },
        "8": {
            "inputs": {
                "samples": ["5", 0],
                "vae": ["11", 0]
            },
            "class_type": "VAEDecode",
            "_meta": {"title": "VAE Decode"}
        },
        "7": {
            "inputs": {
                "filename_prefix": "Cadensa_Pipeline",
                "images": ["8", 0]
            },
            "class_type": "SaveImage",
            "_meta": {"title": "Save Image"}
        }
    }
    return workflow


def execute_comfyui_render(workflow: dict, output_file: Path) -> Path:
    """Envía el flujo a ComfyUI via REST API, espera la finalización y descarga la imagen."""
    print("\n[FASE 2.2] Enviando Flujo de Renderizado a ComfyUI API (http://127.0.0.1:8188)...")

    submit_payload = json.dumps({"prompt": workflow}).encode("utf-8")
    req = urllib.request.Request(
        f"{COMFYUI_URL}/prompt",
        data=submit_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        submit_data = json.loads(resp.read().decode("utf-8"))

    prompt_id = submit_data.get("prompt_id")
    if not prompt_id:
        raise RuntimeError(f"Error al enviar flujo a ComfyUI: {submit_data}")

    print(f"   🚀 Tarea encolada con Prompt ID: {prompt_id}")
    print("   ⏳ Esperando renderizado de difusión en GPU...")

    start_time = time.time()
    max_wait = 180
    image_info = None

    while time.time() - start_time < max_wait:
        time.sleep(2)
        try:
            req_history = urllib.request.Request(f"{COMFYUI_URL}/history/{prompt_id}")
            with urllib.request.urlopen(req_history, timeout=10) as hist_resp:
                hist_data = json.loads(hist_resp.read().decode("utf-8"))
                if prompt_id in hist_data:
                    prompt_record = hist_data[prompt_id]
                    outputs = prompt_record.get("outputs", {})
                    if "7" in outputs and "images" in outputs["7"]:
                        image_info = outputs["7"]["images"][0]
                        break
        except Exception:
            pass

    if not image_info:
        raise TimeoutError("Tiempo de espera agotado al renderizar imagen en ComfyUI.")

    elapsed = round(time.time() - start_time, 1)
    filename = image_info["filename"]
    subfolder = image_info.get("subfolder", "")
    img_type = image_info.get("type", "output")

    print(f"   ✨ Imagen generada exitosamente en {elapsed}s: {filename}")
    print(f"   📥 Descargando imagen a: {output_file}...")

    view_url = f"{COMFYUI_URL}/view?filename={filename}&subfolder={subfolder}&type={img_type}"
    with urllib.request.urlopen(view_url, timeout=30) as view_resp:
        with open(output_file, "wb") as f_out:
            f_out.write(view_resp.read())

    print(f"   💾 Fotograma base guardado ({output_file.stat().st_size} bytes).")
    return output_file


def to_wsl_path(path_str: str) -> str:
    """Convierte rutas de Windows o WSL a formato de ruta interna de Linux/WSL."""
    p = path_str.replace("\\", "/")
    for prefix in ["//wsl$/Ubuntu-20.04", "//wsl.localhost/Ubuntu-20.04"]:
        if p.startswith(prefix):
            return p[len(prefix):]
    if len(p) >= 2 and p[1] == ":":
        drive = p[0].lower()
        return f"/mnt/{drive}{p[2:]}"
    return p


def render_video_with_ffmpeg(input_image: Path, output_video: Path, duration: float = 4.0):
    """Genera secuencia de video con zoompan y fade in/out utilizando FFmpeg."""
    print(f"\n[FASE 3] Ensamblando y Transcodificando Video de {duration}s con FFmpeg...")

    output_video.parent.mkdir(parents=True, exist_ok=True)
    fps = 25
    total_frames = int(duration * fps)

    filter_complex = (
        f"zoompan=z='min(zoom+0.002,1.2)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,"
        f"fade=t=in:st=0:d=0.5,fade=t=out:st={duration - 0.5}:d=0.5"
    )

    is_windows = sys.platform == "win32"
    has_native_ffmpeg = shutil.which("ffmpeg") is not None

    if is_windows and not has_native_ffmpeg:
        wsl_input = to_wsl_path(str(input_image.resolve()))
        wsl_output = to_wsl_path(str(output_video.resolve()))
        cmd = [
            "wsl", "ffmpeg", "-y", "-loop", "1", "-i", wsl_input,
            "-filter_complex", filter_complex,
            "-c:v", "libx264", "-t", str(duration), "-pix_fmt", "yuv420p",
            wsl_output
        ]
    else:
        cmd = [
            "ffmpeg", "-y", "-loop", "1", "-i", str(input_image.resolve()),
            "-filter_complex", filter_complex,
            "-c:v", "libx264", "-t", str(duration), "-pix_fmt", "yuv420p",
            str(output_video.resolve())
        ]

    print(f"   🎬 Ejecutando comando de codificación...")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"   ❌ Error en FFmpeg:\n{proc.stderr}")
        raise RuntimeError(f"FFmpeg falló con código {proc.returncode}")

    print(f"   ✅ Video transcodificado exitosamente en: {output_video}")


def main():
    print("=" * 70)
    print("🚀 PIPELINE MULTIMEDIA AUTÓNOMO PARA CADENSA (COSTO CERO)")
    print("=" * 70)

    # 1. Comprobación de conectividad previa
    print("\n[FASE 1] Comprobando Conectividad de Servicios Locales...")
    try:
        with urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5) as r:
            stats = json.loads(r.read().decode("utf-8"))
            gpu_name = stats.get("devices", [{}])[0].get("name", "Desconocida")
            print(f"   ✅ ComfyUI activo en {COMFYUI_URL} (GPU: {gpu_name}).")
    except Exception as e:
        print(f"   ❌ ComfyUI no responde en {COMFYUI_URL}: {e}")
        sys.exit(1)

    try:
        with urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=5) as r:
            print(f"   ✅ Ollama activo en {OLLAMA_URL}.")
    except Exception as e:
        print(f"   ❌ Ollama no responde en {OLLAMA_URL}: {e}")
        sys.exit(1)

    # 2. Generación de Guion y Prompt
    clinical_script, visual_prompt = generate_clinical_script()
    print("\n--- 📋 GUION CLÍNICO GENERADO (STS) ---")
    print(clinical_script)
    print("\n--- 🎨 PROMPT VISUAL EN INGLÉS ---")
    print(visual_prompt)

    # 3. Flujo ComfyUI
    workflow = build_comfyui_workflow(visual_prompt)
    execute_comfyui_render(workflow, TEMP_FRAME_PATH)

    # 4. Transcodificación FFmpeg (video de 4.0s)
    render_video_with_ffmpeg(TEMP_FRAME_PATH, OUTPUT_VIDEO_PATH, duration=4.0)

    # 5. Limpieza temporal
    if TEMP_FRAME_PATH.exists():
        TEMP_FRAME_PATH.unlink()
        print(f"   🧹 Fotograma temporal eliminado.")

    # 6. Estadísticas finales
    if OUTPUT_VIDEO_PATH.exists():
        size_bytes = OUTPUT_VIDEO_PATH.stat().st_size
        size_kb = round(size_bytes / 1024, 2)
        print("\n" + "=" * 70)
        print("🏆 PIPELINE COMPLETADO EXITOSAMENTE")
        print(f"   📁 Ubicación: {OUTPUT_VIDEO_PATH}")
        print(f"   📏 Tamaño: {size_bytes} bytes ({size_kb} KB)")
        print(f"   ⏱️ Duración: 4.0 segundos")
        print(f"   🌐 Disponible públicamente en: public/{OUTPUT_VIDEO_PATH.name}")
        print("=" * 70)
    else:
        print("❌ Error: No se encontró el video final generado.")
        sys.exit(1)


if __name__ == "__main__":
    main()
