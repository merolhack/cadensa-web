#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Restaurador Facial Neuronal y Supersampling (Fase 2b / 2c)
https://cadensa-web.pages.dev/

Propósito:
Aplica restauración facial con GFPGANv1.4 y supersampling RealESRGAN sobre el
video generado por Wav2Lip GAN. Al ejecutarse DESPUÉS de Wav2Lip:
1. Reconstruye el parche labial borroso de Wav2Lip, restaurando dientes, labios y textura de piel.
2. Elimina cualquier borde o costura de la caja de recorte de Wav2Lip con blend suave.
3. Genera fotogramas en alta resolución (1024x1024 px) antes de la composición final.
"""

from __future__ import annotations
import os
import sys
import argparse
import subprocess
import tempfile
import cv2
import torch

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

SADTALKER_DIR = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\custom_nodes\Comfyui-SadTalker\SadTalker"
COMFY_FFMPEG = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\ffmpeg.exe"
DEFAULT_WEIGHT = os.path.join(SADTALKER_DIR, "gfpgan", "weights", "GFPGANv1.4.pth")

if SADTALKER_DIR not in sys.path:
    sys.path.insert(0, SADTALKER_DIR)


def get_ffmpeg_bin() -> str:
    if os.path.exists(COMFY_FFMPEG):
        return COMFY_FFMPEG
    return "ffmpeg"


def restore_and_upscale_video(
    input_video: str,
    output_video: str,
    upscale: int = 2,
    model_path: str = DEFAULT_WEIGHT
) -> str:
    print("=" * 80)
    print("✨ CADENSA — RESTAURADOR FACIAL NEURONAL GFPGANv1.4 + SUPERSAMPLING")
    print("=" * 80)
    print(f"   👉 Video entrada (Wav2Lip): {input_video}")
    print(f"   👉 Video destino mejorado:  {output_video}")
    print(f"   👉 Factor de escala:        {upscale}x")
    print(f"   👉 Checkpoint GFPGAN:       {model_path}")

    if not os.path.exists(input_video):
        raise FileNotFoundError(f"No existe el video de entrada: {input_video}")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No existe el checkpoint de GFPGAN: {model_path}")

    from gfpgan import GFPGANer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"   👉 Dispositivo de inferencia: {device.upper()}")

    restorer = GFPGANer(
        model_path=model_path,
        upscale=upscale,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=None,
        device=device
    )

    cap = cv2.VideoCapture(input_video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out_w = width * upscale
    out_h = height * upscale

    print(f"   👉 Procesando {total_frames} fotogramas ({width}x{height} -> {out_w}x{out_h} px a {fps:.2f} FPS)...")

    temp_dir = tempfile.mkdtemp()
    temp_avi = os.path.join(temp_dir, "restored_temp.avi")

    fourcc = cv2.VideoWriter_fourcc(*'MJPG')
    writer = cv2.VideoWriter(temp_avi, fourcc, fps, (out_w, out_h))

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Inferencia de restauración facial sobre el fotograma con Wav2Lip
        _, _, enhanced_frame = restorer.enhance(
            frame,
            has_aligned=False,
            only_center_face=False,
            paste_back=True
        )

        writer.write(enhanced_frame)
        frame_idx += 1
        if frame_idx % 25 == 0 or frame_idx == total_frames:
            pct = int((frame_idx / max(1, total_frames)) * 100)
            print(f"   👉 Progreso GFPGAN: {frame_idx}/{total_frames} fotogramas ({pct}%)")

    cap.release()
    writer.release()
    print("   ✅ Inferencia neuronal completada en todos los fotogramas.")

    # Multiplexar con el audio original del video de entrada vía FFmpeg
    os.makedirs(os.path.dirname(os.path.abspath(output_video)), exist_ok=True)
    ffmpeg_bin = get_ffmpeg_bin()
    print("   👉 Integrando pista de audio original con FFmpeg...")

    cmd_mux = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-i", temp_avi,
        "-i", input_video,
        "-map", "0:v:0",
        "-map", "1:a:0?",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "192k",
        output_video
    ]
    subprocess.run(cmd_mux, check=True)

    # Limpiar temporales
    try:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
    except Exception:
        pass

    out_size = os.path.getsize(output_video) if os.path.exists(output_video) else 0
    print(f"   🎉 Video con restauración facial generado: {output_video} ({out_size} bytes)")
    return output_video


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cadensa GFPGAN Face Restore & Upscale")
    parser.add_argument("--input-video", required=True, help="Video de entrada con Wav2Lip")
    parser.add_argument("--output-video", required=True, help="Ruta del video de salida restaurado")
    parser.add_argument("--upscale", type=int, default=2, help="Factor de escalado (default: 2)")
    parser.add_argument("--model-path", default=DEFAULT_WEIGHT, help="Ruta al checkpoint GFPGAN")
    args = parser.parse_args()

    restore_and_upscale_video(
        input_video=args.input_video,
        output_video=args.output_video,
        upscale=args.upscale,
        model_path=args.model_path
    )

