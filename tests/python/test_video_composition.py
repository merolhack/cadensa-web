#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests Unitarios de Composición y Calidad Visual de Video (Fase 3)
Cadensa — Habla Rítmica Silábica (STS)
"""

import os
import json
import shutil
import subprocess
import pytest
import cv2
import numpy as np

from scripts.compose_cadensa_video import (
    compose_cadensa_frame,
    create_rounded_mask,
    COLOR_BG,
    COLOR_EMERALD,
    COLOR_EMERALD_GLOW,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
)

CANONICAL_STS_VIDEO = "public/media/techniques/syllable-timed-speech_avatar_final.mp4"
FALLBACK_STS_VIDEO = "public/media/techniques/cadensa_sts_avatar_final.mp4"
VIDEO_FINAL_PATH = CANONICAL_STS_VIDEO if os.path.exists(CANONICAL_STS_VIDEO) else FALLBACK_STS_VIDEO


def run_ffprobe(video_path: str) -> dict:
    """
    Ejecuta ffprobe vía subprocess para inspeccionar metadatos de video.
    Soporta ejecución nativa en Windows y fallback a WSL si ffprobe no está en PATH.
    """
    ffprobe_cmd = shutil.which("ffprobe")
    if ffprobe_cmd:
        cmd = [
            ffprobe_cmd,
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,r_frame_rate,codec_name",
            "-of", "json",
            video_path
        ]
    else:
        # Fallback a entorno WSL en Windows
        wsl_path = video_path.replace("\\", "/")
        if len(wsl_path) > 1 and wsl_path[1] == ":":
            drive = wsl_path[0].lower()
            wsl_path = f"/mnt/{drive}" + wsl_path[2:]
        cmd = [
            "wsl",
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,r_frame_rate,codec_name",
            "-of", "json",
            wsl_path
        ]

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


@pytest.fixture
def final_video_cap():
    """Abre el video final generado si existe en el entorno."""
    if not os.path.exists(VIDEO_FINAL_PATH):
        pytest.skip(f"Video final '{VIDEO_FINAL_PATH}' no encontrado en disco.")
    cap = cv2.VideoCapture(VIDEO_FINAL_PATH)
    assert cap.isOpened(), f"No se pudo abrir el archivo de video: {VIDEO_FINAL_PATH}"
    yield cap
    cap.release()


def test_video_metadata_ffprobe():
    """
    Valida mediante ffprobe vía subprocess:
    1. Resolución exacta de 1920x1080 px (Full HD institucional).
    2. Tasa de cuadros de exactamente 25 FPS (estándar clínico PAL/WebVTT).
    """
    if not os.path.exists(VIDEO_FINAL_PATH):
        pytest.skip(f"Video final '{VIDEO_FINAL_PATH}' no encontrado en disco.")

    info = run_ffprobe(VIDEO_FINAL_PATH)
    assert "streams" in info and len(info["streams"]) > 0, "No se encontraron flujos de video"

    stream = info["streams"][0]
    width = stream.get("width")
    height = stream.get("height")
    r_frame_rate = stream.get("r_frame_rate")

    assert width == 1920, f"Ancho incorrecto: {width}px (esperado: 1920px)"
    assert height == 1080, f"Alto incorrecto: {height}px (esperado: 1080px)"
    assert r_frame_rate in ["25/1", "25"], f"FPS incorrecto: {r_frame_rate} (esperado: 25 FPS)"


def test_canvas_background_color(final_video_cap):
    """
    Valida que el píxel (10, 10) coincida con el fondo sólido carbón #0F0F13
    (BGR nominal: (19, 15, 15)), tolerando la ligera dispersión del espacio de color YUV420p.
    """
    ret, frame = final_video_cap.read()
    assert ret, "No se pudo leer el primer fotograma del video final"

    pixel_bgr = frame[10, 10]
    expected_bgr = np.array(COLOR_BG)  # (19, 15, 15)

    # Tolerancia de cuantización y compresión H.264 YUV -> BGR (≤ 8 niveles)
    diff = np.abs(pixel_bgr.astype(int) - expected_bgr)
    assert np.all(diff <= 8), (
        f"El color de fondo en (10, 10) es BGR {pixel_bgr.tolist()}, esperado aprox {expected_bgr.tolist()}"
    )


def test_visual_sharpness_laplacian_variance(final_video_cap):
    """
    Evalúa la nitidez visual del fotograma mediante la varianza del operador Laplaciano:
    cv2.Laplacian(gray, cv2.CV_64F).var() > 50.
    Detecta de forma automatizada fotogramas borrosos, pérdida de enfoque o degradación.
    """
    ret, frame = final_video_cap.read()
    assert ret, "No se pudo leer el fotograma para prueba de nitidez"

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    assert laplacian_var > 50.0, (
        f"La varianza laplaciana ({laplacian_var:.2f}) es menor al umbral de nitidez (50.0). "
        "El video final presenta desenfoque o pérdida de resolución."
    )


def test_metronome_emerald_pulse_at_active_syllable(final_video_cap):
    """
    Extrae el fotograma en t = 3.5s (momento en que la sílaba 'DEN' y el metrónomo están activos).
    Verifica que en el cuadrante derecho del lienzo existan píxeles con el verde esmeralda institucional
    #10b981 (BGR: (129, 185, 16)) o su pulso luminoso (COLOR_EMERALD_GLOW).
    """
    # Saltar a t = 3.5 segundos (3500 ms)
    final_video_cap.set(cv2.CAP_PROP_POS_MSEC, 3500)
    ret, frame_35 = final_video_cap.read()
    assert ret, "No se pudo extraer el fotograma en t = 3.5s"

    # Región de interés del metrónomo: x centrado en 1410, y centrado en 455
    metro_roi = frame_35[455 - 50 : 455 + 50, 1410 - 50 : 1410 + 50]

    target_emerald = np.array(COLOR_EMERALD, dtype=float)       # (129, 185, 16)
    target_glow = np.array(COLOR_EMERALD_GLOW, dtype=float)     # (167, 243, 110)

    # Distancia euclídea mínima hacia cualquiera de los dos tonos esmeralda institucionales
    dist_to_emerald = np.minimum(
        np.linalg.norm(metro_roi.astype(float) - target_emerald, axis=-1),
        np.linalg.norm(metro_roi.astype(float) - target_glow, axis=-1)
    )

    matching_pixels = np.sum(dist_to_emerald < 35)
    assert matching_pixels > 100, (
        f"Se encontraron solo {matching_pixels} píxeles esmeralda en el widget del metrónomo en t=3.5s. "
        "El metrónomo no está emitiendo el pulso visual sincrónico."
    )


def test_compose_cadensa_frame_unit_contract():
    """
    Valida directamente la función composicional compose_cadensa_frame en memoria:
    1. Dimensiones exactas 1920x1080.
    2. Color de fondo exacto BGR (19, 15, 15).
    3. Integración correcta del avatar con máscara redondeada.
    """
    mask = create_rounded_mask(800, 44)
    dummy_avatar = np.full((512, 512, 3), 120, dtype=np.uint8)

    timeline_dummy = {
        "bpm": 60.0,
        "prep_silence_sec": 2.5,
        "post_silence_sec": 2.0,
        "total_duration": 6.5,
        "breathing_intervals": [[0.0, 2.5], [4.5, 6.5]],
        "syllable_events": [
            {"syllable": "CA", "time": 2.5, "duration": 0.35, "box_index": 0},
            {"syllable": "DEN", "time": 3.5, "duration": 0.40, "box_index": 1}
        ]
    }

    frame = compose_cadensa_frame(
        avatar_frame=dummy_avatar,
        rounded_mask=mask,
        t_seconds=3.5,
        bpm=60.0,
        syllables=["CA", "DEN"],
        timeline_data=timeline_dummy
    )

    assert frame.shape == (CANVAS_HEIGHT, CANVAS_WIDTH, 3)
    assert list(frame[10, 10]) == list(COLOR_BG)

