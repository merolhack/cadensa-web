#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Ejecutor de Refinamiento Labial con Wav2Lip
https://cadensa-web.pages.dev/
"""

from __future__ import annotations
import os
import sys
import shutil
import tempfile
import cv2
import numpy as np

# Configurar UTF-8 en consola
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Rutas estándar de ComfyUI y Wav2Lip en Windows
COMFY_BASE = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI"
WAV2LIP_DIR = os.path.join(COMFY_BASE, r"custom_nodes\ComfyUI_wav2lip\Wav2Lip")
CHECKPOINT_PATH = os.path.join(WAV2LIP_DIR, r"checkpoints\wav2lip_gan.pth")
FFMPEG_EXE = os.path.join(COMFY_BASE, "ffmpeg.exe")


def run_wav2lip_inference(
    face_video_path: str,
    audio_path: str,
    output_video_path: str,
    checkpoint_path: str = CHECKPOINT_PATH,
    face_detect_batch: int = 8
) -> str:
    """
    Ejecuta el refinamiento labial de Wav2Lip sobre un video facial existente
    y un archivo de audio WAV.
    """
    if not os.path.exists(face_video_path):
        raise FileNotFoundError(f"Video facial no encontrado: {face_video_path}")
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio no encontrado: {audio_path}")
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Modelo Wav2Lip GAN no encontrado: {checkpoint_path}")

    # Asegurar que el paquete padre de Wav2Lip esté en sys.path para importaciones relativas
    node_parent = os.path.join(COMFY_BASE, r"custom_nodes\ComfyUI_wav2lip")
    if node_parent not in sys.path:
        sys.path.insert(0, node_parent)

    import torch
    from Wav2Lip.wav2lip_node import wav2lip_

    print(f"   👉 [Wav2Lip] Cargando video facial de entrada: {face_video_path}")
    cap = cv2.VideoCapture(face_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    if not frames:
        raise ValueError("No se pudieron leer fotogramas del video facial de entrada.")

    print(f"   👉 [Wav2Lip] {len(frames)} fotogramas leídos a {fps:.2f} FPS.")
    print("   👉 [Wav2Lip] Ejecutando sincronización labial milimétrica en GPU...")

    # Ejecutar wav2lip_
    refined_frames = wav2lip_(
        images=frames,
        audio_path=audio_path,
        face_detect_batch=face_detect_batch,
        mode="sequential",
        model_path=checkpoint_path
    )

    if not refined_frames:
        raise RuntimeError("Wav2Lip no retornó fotogramas procesados.")

    # Guardar video temporal sin audio
    os.makedirs(os.path.dirname(os.path.abspath(output_video_path)), exist_ok=True)
    temp_dir = tempfile.mkdtemp()
    temp_video = os.path.join(temp_dir, "temp_no_audio.mp4")

    h, w = refined_frames[0].shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_video, fourcc, fps, (w, h))
    for f in refined_frames:
        out.write(f)
    out.release()

    # Mux con audio usando ffmpeg
    print("   👉 [Wav2Lip] Multiplexando video refinado con pista de audio vía FFmpeg...")
    ffmpeg_bin = FFMPEG_EXE if os.path.exists(FFMPEG_EXE) else "ffmpeg"
    cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-i", temp_video,
        "-i", audio_path,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_video_path
    ]
    import subprocess
    subprocess.check_call(cmd)

    shutil.rmtree(temp_dir, ignore_errors=True)
    print(f"   ✅ [Wav2Lip] Video refinado generado con éxito en: {output_video_path}")
    return output_video_path


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python wav2lip_runner.py <face_video> <audio> <output_video>")
        sys.exit(1)
    run_wav2lip_inference(sys.argv[1], sys.argv[2], sys.argv[3])
