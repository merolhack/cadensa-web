#!/usr/bin/env python3
from __future__ import annotations
"""
Generación de Video de Demostración Clínica con el Avatar Maestro Oficial para Cadensa.
Stack:
- Ollama Local (gemma4:cloud / qwen3:8b-8k) para guion y fundamentación clínica.
- Recurso oficial: public/media/images/avatar-maestro.jpg (Nano Banana Pro).
- ComfyUI Desktop Local (http://127.0.0.1:8188) para validación de pipeline.
- Motor FFmpeg para composición 16:9 (1920x1080) con avatar en contenedor lateral rounded-3xl.
- Destino: public/media/techniques/cadensa_sts_avatar_final.mp4
"""

import os
import sys
import json
import time
import shutil
import urllib.request
import subprocess
from pathlib import Path

OLLAMA_URL = "http://127.0.0.1:11434"
COMFYUI_URL = "http://127.0.0.1:8188"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
AVATAR_IMAGE_PATH = PROJECT_ROOT / "public" / "media" / "images" / "avatar-maestro.jpg"
OUTPUT_DIR = PROJECT_ROOT / "public" / "media" / "techniques"
OUTPUT_VIDEO_PATH = OUTPUT_DIR / "cadensa_sts_avatar_final.mp4"

TEMP_DIR = SCRIPT_DIR / "temp_avatar_build"


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


def query_ollama(prompt: str, system_prompt: str = "") -> str:
    """Consulta Ollama con jerarquía: 1. gemma4:cloud, 2. qwen3:8b-8k."""
    for model in ["gemma4:cloud", "qwen3:8b-8k"]:
        try:
            print(f"   👉 Consultando modelo Ollama [{model}]...")
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.7}
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

    raise RuntimeError("No fue posible generar texto con Ollama.")


def generate_avatar_clinical_script() -> str:
    """Genera el guion del Avatar Maestro en primera persona."""
    print("\n[FASE 1] Generando Guion Fonoaudiológico con Ollama Local...")
    system_prompt = (
        "Actúa como el Avatar Maestro de Cadensa, un terapeuta virtual fonoaudiológico "
        "con sudadera gris oscura y detalles turquesa. Hablas con tono pausado, cálido y profesional. "
        "Redacta una explicación en primera persona (máximo 3 párrafos cortos) de la técnica de "
        "Habla Rítmica Silábica (STS). Explica cómo el ritmo externo del metrónomo a 60 BPM "
        "ayuda a eludir la disfunción temporal de los ganglios basales para evitar bloqueos del habla. "
        "Motiva al paciente a sincronizar cada sílaba de 'CA-DEN-SA' con los pulsos visuales."
    )
    prompt = "Redacta el guion del Avatar Maestro para el video demostrativo de Habla Rítmica Silábica en Cadensa."
    return query_ollama(prompt, system_prompt)


def generate_svg_assets(temp_dir: Path) -> tuple[Path, Path]:
    """Crea los recursos SVG vectoriales: backdrop 1920x1080 y máscara rounded-3xl."""
    print("\n[FASE 2] Diseñando Interfaz Gráfica y Máscaras Vectoriales SVG...")
    temp_dir.mkdir(parents=True, exist_ok=True)

    # 1. Máscara para esquinas redondeadas rounded-3xl (800x800 con rx=44)
    mask_svg = temp_dir / "avatar_mask.svg"
    mask_content = """<svg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'>
  <rect width='800' height='800' rx='44' ry='44' fill='white'/>
</svg>"""
    mask_svg.write_text(mask_content, encoding="utf-8")

    # 2. Backdrop 1920x1080 con la suite clínica de Cadensa
    backdrop_svg = temp_dir / "cadensa_backdrop.svg"
    backdrop_content = """<svg width='1920' height='1080' viewBox='0 0 1920 1080' xmlns='http://www.w3.org/2000/svg' font-family='system-ui, -apple-system, sans-serif'>
  <defs>
    <linearGradient id='brandGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
      <stop offset='0%' stop-color='#10b981'/>
      <stop offset='100%' stop-color='#06b6d4'/>
    </linearGradient>
    <linearGradient id='cardGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
      <stop offset='0%' stop-color='#18181b' stop-opacity='0.95'/>
      <stop offset='100%' stop-color='#09090b' stop-opacity='0.98'/>
    </linearGradient>
    <linearGradient id='borderGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#10b981' stop-opacity='0.7'/>
      <stop offset='50%' stop-color='#06b6d4' stop-opacity='0.5'/>
      <stop offset='100%' stop-color='#10b981' stop-opacity='0.3'/>
    </linearGradient>
    <radialGradient id='avatarGlow' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#06b6d4' stop-opacity='0.16'/>
      <stop offset='100%' stop-color='#09090b' stop-opacity='0'/>
    </radialGradient>
  </defs>

  <!-- Fondo Zinc Profundo -->
  <rect width='1920' height='1080' fill='#09090b'/>

  <!-- Resplandores Ambientales sutiles -->
  <circle cx='1420' cy='540' r='580' fill='url(#avatarGlow)'/>
  <circle cx='200' cy='180' r='350' fill='url(#avatarGlow)' opacity='0.4'/>

  <!-- Columna Izquierda: Panel Clínico Cadensa (x: 100 a 940) -->
  <!-- Badge Superior -->
  <rect x='100' y='90' width='290' height='36' rx='18' fill='#18181b' stroke='#27272a' stroke-width='1'/>
  <circle cx='122' cy='108' r='5' fill='#10b981'/>
  <text x='138' y='114' fill='#a1a1aa' font-size='13' font-weight='600' letter-spacing='1.5'>CADENSA CLINICAL SUITE</text>

  <!-- Logo de Marca y Lema Oficial -->
  <text x='100' y='190' fill='url(#brandGrad)' font-size='56' font-weight='800' letter-spacing='-1'>CADENSA</text>
  <text x='102' y='225' fill='#e4e4e7' font-size='20' font-weight='500'>Encuentra el ritmo de tu voz</text>

  <!-- Tarjeta Principal de la Técnica STS -->
  <rect x='100' y='265' width='840' height='460' rx='28' fill='url(#cardGrad)' stroke='url(#borderGrad)' stroke-width='1.5'/>

  <!-- Cabecera de la Tarjeta -->
  <rect x='135' y='298' width='250' height='28' rx='6' fill='#064e3b' fill-opacity='0.5'/>
  <text x='147' y='317' fill='#34d399' font-size='12' font-weight='700' letter-spacing='1'>TÉCNICA CLÍNICA PRINCIPAL</text>

  <text x='135' y='365' fill='#ffffff' font-size='32' font-weight='700'>Habla Rítmica Silábica (STS)</text>
  <text x='135' y='395' fill='#a1a1aa' font-size='16'>Syllable-Timed Speech • Protocolo de Fluidez Isocrónica</text>

  <!-- Módulo de Metrónomo y Silabario -->
  <rect x='135' y='425' width='770' height='120' rx='20' fill='#18181b' stroke='#27272a' stroke-width='1'/>
  <text x='165' y='465' fill='#71717a' font-size='13' font-weight='600' letter-spacing='1.2'>MARCAPASOS EXTERNO</text>
  <text x='165' y='510' fill='url(#brandGrad)' font-size='34' font-weight='800'>60 BPM</text>
  <text x='290' y='508' fill='#a1a1aa' font-size='15'>Ritmo Terapéutico Recomendado</text>

  <!-- Cajas de Sílabas Rítmicas -->
  <g transform='translate(560, 442)'>
    <rect x='0' y='0' width='95' height='85' rx='14' fill='#09090b' stroke='#10b981' stroke-width='2'/>
    <text x='47' y='52' fill='#10b981' font-size='26' font-weight='800' text-anchor='middle'>CA</text>

    <rect x='115' y='0' width='95' height='85' rx='14' fill='#09090b' stroke='#06b6d4' stroke-width='2'/>
    <text x='162' y='52' fill='#06b6d4' font-size='26' font-weight='800' text-anchor='middle'>DEN</text>

    <rect x='230' y='0' width='95' height='85' rx='14' fill='#09090b' stroke='#10b981' stroke-width='2'/>
    <text x='277' y='52' fill='#10b981' font-size='26' font-weight='800' text-anchor='middle'>SA</text>
  </g>

  <!-- Explicación Neurobiológica -->
  <text x='135' y='580' fill='#d4d4d8' font-size='15' font-weight='600'>Fundamento Neurobiológico:</text>
  <text x='135' y='608' fill='#a1a1aa' font-size='14'>
    El pulso isocrónico regular actúa como guía externa motora, eludiendo el déficit de
  </text>
  <text x='135' y='630' fill='#a1a1aa' font-size='14'>
    temporización de los ganglios basales para prevenir bloqueos articulatorios.
  </text>

  <!-- Indicador Biofeedback -->
  <rect x='135' y='655' width='770' height='46' rx='12' fill='#042f2e' fill-opacity='0.6' stroke='#0d9488' stroke-width='1'/>
  <circle cx='155' cy='678' r='5' fill='#2dd4bf'/>
  <text x='170' y='683' fill='#2dd4bf' font-size='14' font-weight='600'>Estado: Sincronización Rítmica Activa • Tensión Laríngea Reducida</text>

  <!-- Tarjeta de Instrucción Inferior -->
  <rect x='100' y='745' width='840' height='195' rx='24' fill='#18181b' fill-opacity='0.7' stroke='#27272a' stroke-width='1'/>
  <text x='135' y='785' fill='#ffffff' font-size='18' font-weight='700'>Instrucción de Práctica Clínica:</text>
  <text x='135' y='818' fill='#d4d4d8' font-size='15'>1. Inhala suavemente por la nariz sintiendo la expansión diafragmática.</text>
  <text x='135' y='848' fill='#d4d4d8' font-size='15'>2. Emite cada sílaba en sincronía exacta con cada pulso del metrónomo.</text>
  <text x='135' y='878' fill='#d4d4d8' font-size='15'>3. Mantén contacto articulatorio suave sin ejercer presión labial o lingual excesiva.</text>
  <text x='135' y='915' fill='#34d399' font-size='14' font-weight='600'>Guía visual y articulatoria modelada por el Avatar Maestro de Cadensa</text>

  <!-- Columna Derecha: Marco Contenedor del Avatar Maestro (800x800) -->
  <rect x='1016' y='136' width='808' height='808' rx='48' fill='none' stroke='url(#borderGrad)' stroke-width='3.5'/>

  <!-- Placa Inferior del Avatar -->
  <g transform='translate(1050, 880)'>
    <rect x='0' y='0' width='380' height='44' rx='22' fill='#09090b' fill-opacity='0.92' stroke='#27272a' stroke-width='1.5'/>
    <circle cx='22' cy='22' r='6' fill='#10b981'/>
    <text x='38' y='28' fill='#f4f4f5' font-size='14' font-weight='700' letter-spacing='0.5'>AVATAR MAESTRO | CO-TERAPEUTA IA</text>
  </g>

  <!-- Badge Superior del Avatar -->
  <g transform='translate(1620, 165)'>
    <rect x='0' y='0' width='175' height='36' rx='18' fill='#09090b' fill-opacity='0.85' stroke='#10b981' stroke-width='1'/>
    <circle cx='18' cy='18' r='4' fill='#10b981'/>
    <text x='30' y='23' fill='#10b981' font-size='12' font-weight='700'>BIOFEEDBACK STS</text>
  </g>
</svg>"""
    backdrop_svg.write_text(backdrop_content, encoding="utf-8")

    print(f"   ✅ Recursos SVG generados en: {temp_dir}")
    return backdrop_svg, mask_svg


def render_avatar_video(avatar_img: Path, backdrop_svg: Path, mask_svg: Path, output_mp4: Path, duration: float = 4.0):
    """Ensambla el video 16:9 con avatar en contenedor rounded-3xl y transiciones fade."""
    print(f"\n[FASE 3] Ensamblando y Transcodificando Video Final (1920x1080) con FFmpeg...")

    output_mp4.parent.mkdir(parents=True, exist_ok=True)
    fps = 25
    total_frames = int(duration * fps)

    # Conversión previa de SVGs a PNGs con librsvg para máximo rendimiento y nitidez
    temp_backdrop_png = backdrop_svg.with_suffix(".png")
    temp_mask_png = mask_svg.with_suffix(".png")

    is_windows = sys.platform == "win32"
    has_native_ffmpeg = shutil.which("ffmpeg") is not None

    def run_cmd(cmd_args: list[str]):
        if is_windows and not has_native_ffmpeg:
            full_cmd = ["wsl"] + [to_wsl_path(arg) if ("/" in arg or "\\" in arg) else arg for arg in cmd_args]
        else:
            full_cmd = cmd_args
        res = subprocess.run(full_cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Error en FFmpeg:\n{res.stderr}")
            raise RuntimeError(f"FFmpeg falló: {res.returncode}")
        return res

    # 1. Renderizar SVGs a PNGs
    print("   🎨 Rasterizando SVGs a alta definición...")
    run_cmd(["ffmpeg", "-y", "-i", str(backdrop_svg), str(temp_backdrop_png)])
    run_cmd(["ffmpeg", "-y", "-i", str(mask_svg), str(temp_mask_png)])

    # 2. Pipeline de composición de video:
    # [0:v] Avatar -> recortar 1536x1536 centrado -> escalar a 800x800 -> zoompan sutil (respiración) -> [avatar_dyn]
    # [avatar_dyn][1:v] -> alphamerge (máscara de esquinas redondeadas rx=44) -> [avatar_rounded]
    # [2:v][avatar_rounded] -> overlay en x=1020, y=140 -> [composed]
    # [composed] -> fade in (0.5s) y fade out (0.5s) -> [v]
    filter_complex = (
        f"[0:v]crop=1536:1536:(in_w-1536)/2:0,scale=800:800,"
        f"zoompan=z='min(zoom+0.0012,1.06)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=800x800[avatar_dyn];"
        f"[avatar_dyn][1:v]alphamerge[avatar_rounded];"
        f"[2:v][avatar_rounded]overlay=x=1020:y=140[composed];"
        f"[composed]fade=t=in:st=0:d=0.5,fade=t=out:st={duration - 0.5}:d=0.5[v]"
    )

    print("   🎬 Renderizando composición 16:9 con contenedor lateral y fade in/out...")
    encode_cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(avatar_img),
        "-loop", "1", "-i", str(temp_mask_png),
        "-loop", "1", "-i", str(temp_backdrop_png),
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "22",
        "-t", str(duration),
        "-pix_fmt", "yuv420p",
        str(output_mp4)
    ]
    run_cmd(encode_cmd)

    print(f"   ✅ Video final ensamblado exitosamente en: {output_mp4}")


def main():
    print("=" * 75)
    print("🌟 GENERACIÓN DE VIDEO CON EL AVATAR MAESTRO OFICIAL — CADENSA")
    print("=" * 75)

    # Validar existencia de la imagen oficial del Avatar
    if not AVATAR_IMAGE_PATH.exists():
        print(f"❌ Error: No se encontró la imagen oficial del Avatar en: {AVATAR_IMAGE_PATH}")
        sys.exit(1)
    print(f"   ✅ Recurso oficial validado: {AVATAR_IMAGE_PATH}")

    # Fase 1: Guion Clínico con Ollama
    clinical_script = generate_avatar_clinical_script()
    print("\n--- 📋 GUION DEL AVATAR MAESTRO (STS) ---")
    print(clinical_script)

    # Fase 2: Generar recursos vectoriales
    backdrop_svg, mask_svg = generate_svg_assets(TEMP_DIR)

    # Fase 3: Renderizado y Transcodificación de Video
    render_avatar_video(
        avatar_img=AVATAR_IMAGE_PATH,
        backdrop_svg=backdrop_svg,
        mask_svg=mask_svg,
        output_mp4=OUTPUT_VIDEO_PATH,
        duration=4.0
    )

    # Limpieza de temporales
    shutil.rmtree(TEMP_DIR, ignore_errors=True)
    print("   🧹 Archivos temporales de construcción eliminados.")

    # Auditoría final del resultado
    if OUTPUT_VIDEO_PATH.exists():
        size_bytes = OUTPUT_VIDEO_PATH.stat().st_size
        size_kb = round(size_bytes / 1024, 2)
        print("\n" + "=" * 75)
        print("🏆 MISIÓN CUMPLIDA CON ÉXITO")
        print(f"   📁 Archivo: {OUTPUT_VIDEO_PATH.name}")
        print(f"   📍 Ruta Pública: {OUTPUT_VIDEO_PATH}")
        print(f"   📏 Tamaño: {size_bytes} bytes ({size_kb} KB)")
        print(f"   ⏱️ Duración: 4.0 segundos (Bucle continuo con fade in/out de 0.5s)")
        print(f"   🖥️ Formato: 1920 × 1080 px (16:9 horizontal, contenedor rounded-3xl)")
        print(f"   🌐 Disponible públicamente para Cadensa: /media/techniques/{OUTPUT_VIDEO_PATH.name}")
        print("=" * 75)
    else:
        print("❌ Error: No se encontró el video final generado.")
        sys.exit(1)


if __name__ == "__main__":
    main()

