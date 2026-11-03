#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Benchmark de Compresión Web: CRF 23 / 1200k vs CRF 20 / 2000k
Compara tamaño en bytes y nitidez laplaciana en fotogramas de movimiento rápido
sobre public/media/techniques/easy-onset_avatar_final.mp4.
"""

import os
import sys
import tempfile
import subprocess
import cv2
import numpy as np

# Configurar UTF-8
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass


def find_high_motion_frame_indices(video_path: str, top_k: int = 5) -> list[int]:
    """Encuentra los índices de fotogramas con mayor velocidad de cambio en la ROI bucal."""
    cap = cv2.VideoCapture(video_path)
    prev_gray = None
    diffs = []
    idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        mouth = frame[640:780, 420:540]
        gray = cv2.cvtColor(mouth, cv2.COLOR_BGR2GRAY)
        if prev_gray is not None:
            diff = float(np.mean(cv2.absdiff(gray, prev_gray)))
            diffs.append((diff, idx))
        prev_gray = gray
        idx += 1
    cap.release()

    # Ordenar por diferencia descendente
    diffs.sort(key=lambda x: x[0], reverse=True)
    return [d[1] for d in diffs[:top_k]]


def extract_frame_laplacian_variance(video_path: str, frame_indices: list[int]) -> list[float]:
    """Calcula la varianza del Laplaciano en la ROI facial/bucal para los fotogramas seleccionados."""
    cap = cv2.VideoCapture(video_path)
    variances = []
    idx = 0
    target_set = set(frame_indices)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if idx in target_set:
            # ROI facial institucional
            face_roi = frame[380:880, 260:760]
            gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            lap = cv2.Laplacian(gray, cv2.CV_64F).var()
            variances.append(float(lap))
        idx += 1
    cap.release()
    return variances


def run_compression_benchmark():
    input_video = "public/media/techniques/easy-onset_avatar_final.mp4"
    if not os.path.exists(input_video):
        print(f"Error: {input_video} no existe.")
        return

    high_motion_frames = find_high_motion_frame_indices(input_video, top_k=5)
    print(f"Fotogramas de mayor aceleración labial: {high_motion_frames}")

    try:
        import imageio_ffmpeg
        ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ffmpeg_bin = "ffmpeg"

    temp_dir = tempfile.mkdtemp()
    v23_path = os.path.join(temp_dir, "easy_onset_crf23.mp4")
    v20_path = os.path.join(temp_dir, "easy_onset_crf20.mp4")

    # Variante A: CRF 23, maxrate 1200k, bufsize 2400k (Actual default)
    cmd_a = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-i", input_video,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
        "-crf", "23", "-maxrate", "1200k", "-bufsize", "2400k",
        "-c:a", "copy",
        v23_path
    ]
    subprocess.run(cmd_a, check=True)
    size_a = os.path.getsize(v23_path)
    lap_a = extract_frame_laplacian_variance(v23_path, high_motion_frames)
    mean_lap_a = float(np.mean(lap_a)) if lap_a else 0.0

    # Variante B: CRF 20, maxrate 2000k, bufsize 4000k
    cmd_b = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-i", input_video,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium",
        "-crf", "20", "-maxrate", "2000k", "-bufsize", "4000k",
        "-c:a", "copy",
        v20_path
    ]
    subprocess.run(cmd_b, check=True)
    size_b = os.path.getsize(v20_path)
    lap_b = extract_frame_laplacian_variance(v20_path, high_motion_frames)
    mean_lap_b = float(np.mean(lap_b)) if lap_b else 0.0

    delta_size_pct = ((size_b - size_a) / size_a) * 100.0
    delta_lap_pct = ((mean_lap_b - mean_lap_a) / mean_lap_a) * 100.0 if mean_lap_a > 0 else 0.0

    print("=" * 80)
    print("🎬 BENCHMARK DE COMPRESIÓN H.264 EN EASY ONSET")
    print("=" * 80)
    print(f"👉 Variante A (CRF 23, 1200k): Tamaño = {size_a:,} bytes ({size_a/(1024*1024):.2f} MB) | Laplaciano = {mean_lap_a:.2f}")
    print(f"👉 Variante B (CRF 20, 2000k): Tamaño = {size_b:,} bytes ({size_b/(1024*1024):.2f} MB) | Laplaciano = {mean_lap_b:.2f}")
    print(f"👉 Diferencial Tamaño:        {delta_size_pct:+.1f}%")
    print(f"👉 Diferencial Nitidez Labial: {delta_lap_pct:+.2f}%")
    print("=" * 80)

    # Limpiar temporales
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    run_compression_benchmark()
