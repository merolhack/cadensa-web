#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Automatización de Video con Avatar Natural (Respiración, Parpadeo y Lip-Sync)
https://cadensa-web.pages.dev/

Características:
1. Ciclo de respiración preparatoria inicial (inhalación suave con elevación de hombros/pecho en t=0.2s..1.4s).
2. Parpadeo fisiológico regular cada 3.5 a 4.0 segundos.
3. Sincronización labial dinámica (Zero-Seam Lip-Morphing) gobernada por la energía RMS del audio.
4. Pausas clínicas entre frases para procesamiento cognitivo y ritmo respiratorio.
5. Lienzo limpio para modal web: Fondo sólido carbón (#0F0F13), Avatar 800x800 (izq) y Metrónomo 60 BPM + Cajas [CA][DEN][SA] (der).
6. Guardrails de gasto cero ($0 USD) con Cache Check y auditoría automática.
"""

from __future__ import annotations
import os
import sys
import math
import subprocess
import wave
import asyncio
import argparse
import numpy as np
import cv2
import edge_tts

# Rutas del Proyecto
PROJECT_ROOT = "/home/merolhack/fl/cadensa-web"
SOURCE_IMAGE = os.path.join(PROJECT_ROOT, "public/media/images/avatar-maestro.jpg")
OUTPUT_VIDEO = os.path.join(PROJECT_ROOT, "public/media/techniques/cadensa_sts_avatar_natural.mp4")
TEMP_DIR = os.path.join(PROJECT_ROOT, "scripts/temp_natural_build")

FPS = 25
SAMPLE_RATE = 24000
MALE_VOICE = "es-MX-JorgeNeural"
INHALATION_PREP_SEC = 1.8 # Silencio e inhalación preparatoria fonoaudiológica

# Guion clínico con pausas deliberadas y separación silábica para prosodia natural
SCRIPT_TEXT = (
    "Hola. Soy el Maestro de Cadensa. "
    "Hoy practicaremos el Habla Rít-mi-ca Si-lá-bi-ca, para darte mayor fluidez vocal. "
    "Al usar nuestro metrónomo a sesenta pulsos por minuto, eludimos los bloqueos al hablar. "
    "Respira conmigo y practiquemos juntos con cada pulso: "
    "CA... "
    "DEN... "
    "SA... "
    "Sigue el ritmo y libera tu voz."
)

def log(msg: str):
    print(f"   👉 {msg}", flush=True)

def step(title: str):
    print(f"\n[{title}]", flush=True)

def ensure_dirs():
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)

def check_cache_guardrail(force: bool = False) -> bool:
    """Agent Guardrail 1: Comprobación de Existencia Local (Cache Check)."""
    step("GUARDRAIL 1: Comprobación de Existencia Local (Cache Check)")
    if force:
        log("Flag --force activado: Forzando re-generación completa del video natural.")
        return False

    if os.path.exists(OUTPUT_VIDEO):
        file_size = os.path.getsize(OUTPUT_VIDEO)
        if file_size > 500 * 1024:
            log(f"Asset existente válido detectado en caché: {OUTPUT_VIDEO}")
            log(f"Tamaño: {file_size} bytes ({file_size / (1024*1024):.2f} MB).")
            log("Omitiendo procesamiento redundante para garantizar CERO gasto de recursos.")
            return True
        else:
            log("Asset encontrado pero incompleto (< 500 KB). Regenerando...")
            return False
    else:
        log(f"Asset no encontrado en {OUTPUT_VIDEO}. Iniciando pipeline de producción...")
        return False

async def synthesize_voice(output_mp3: str):
    """Sintetiza la voz fonoaudiológica con edge-tts."""
    log(f"Sintetizando locución fonoaudiológica masculina [{MALE_VOICE}]...")
    comm = edge_tts.Communicate(
        text=SCRIPT_TEXT,
        voice=MALE_VOICE,
        rate="-2%",
        pitch="-1Hz"
    )
    await comm.save(output_mp3)

def generate_natural_audio() -> tuple[str, float]:
    """Genera audio con respiración preparatoria inicial y metrónomo a 60 BPM."""
    step("FASE 1: Síntesis Prosódica y Ensamble Acústico con Preparación")
    raw_mp3 = os.path.join(TEMP_DIR, "natural_speech.mp3")
    raw_wav = os.path.join(TEMP_DIR, "natural_speech.wav")
    final_wav = os.path.join(TEMP_DIR, "final_natural_mixed.wav")

    if not os.path.exists(raw_mp3) or os.path.getsize(raw_mp3) == 0:
        asyncio.run(synthesize_voice(raw_mp3))
    else:
        log("Utilizando locución previa en caché temporal.")

    # Convertir a WAV mono
    cmd_conv = [
        "ffmpeg", "-y", "-i", raw_mp3,
        "-ac", "1", "-ar", str(SAMPLE_RATE),
        raw_wav
    ]
    subprocess.run(cmd_conv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    with wave.open(raw_wav, "rb") as wf:
        n_frames = wf.getnframes()
        sr = wf.getframerate()
        raw_bytes = wf.readframes(n_frames)
        speech_samples = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    # 1. Preceder con 1.8 segundos de silencio preparatorio para el ciclo de respiración nasal inicial
    prep_samples = int(INHALATION_PREP_SEC * sr)
    silence_prep = np.zeros(prep_samples, dtype=np.float32)
    extended_speech = np.concatenate([silence_prep, speech_samples])

    total_samples = len(extended_speech)
    total_duration = total_samples / sr
    log(f"Audio extendido con preparación: {total_duration:.2f}s (Inhalación inicial: {INHALATION_PREP_SEC}s)")

    # 2. Pulsos de metrónomo a 60 BPM (1 pulso / segundo)
    metronome = np.zeros(total_samples, dtype=np.float32)
    beat_interval = sr
    num_beats = int(total_duration)

    # Pulso acústico cálido (toque de madera fonoaudiológico)
    click_len = int(sr * 0.040)
    t_click = np.linspace(0, 0.040, click_len, endpoint=False)
    click_wave = np.sin(2 * np.pi * 980 * t_click) * np.exp(-t_click * 85) * 0.50

    for b in range(num_beats + 1):
        idx = b * beat_interval
        if idx + click_len <= total_samples:
            sec = b * 1.0
            # Acento prominente durante la práctica silábica guiada
            vol = 0.38 if (17.0 <= sec <= 26.5) else 0.12
            metronome[idx:idx + click_len] += click_wave * vol

    # Mezcla equilibrada
    mixed = extended_speech * 0.92 + metronome * 0.45
    max_val = np.max(np.abs(mixed))
    if max_val > 0.95:
        mixed = (mixed / max_val) * 0.95

    mixed_i16 = (mixed * 32767.0).astype(np.int16)
    with wave.open(final_wav, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(mixed_i16.tobytes())

    log(f"Pista de audio clínica final: {final_wav}")
    return final_wav, total_duration

def extract_speech_envelope(audio_path: str, duration: float, fps: int) -> np.ndarray:
    """Extrae la curva de apertura labial a partir de la energía acústica RMS."""
    step("FASE 2: Extracción de Envolvente RMS y Detección de Pausas Clínicas")
    with wave.open(audio_path, "rb") as wf:
        sr = wf.getframerate()
        n_frames = wf.getnframes()
        samples = np.frombuffer(wf.readframes(n_frames), dtype=np.int16).astype(np.float32) / 32768.0

    total_frames = int(duration * fps)
    samples_per_frame = int(sr / fps)

    energies = np.zeros(total_frames, dtype=np.float32)
    for i in range(total_frames):
        st = i * samples_per_frame
        en = min(st + samples_per_frame, len(samples))
        chunk = samples[st:en]
        if len(chunk) > 0:
            energies[i] = np.sqrt(np.mean(chunk**2))

    p95 = np.percentile(energies, 95)
    noise_floor = np.percentile(energies, 10)
    clean = np.maximum(0.0, energies - noise_floor)

    # Suavizado gaussiano temporal para transiciones fluidas de fonación
    kernel = np.array([0.05, 0.12, 0.22, 0.28, 0.22, 0.12, 0.05], dtype=np.float32)
    smoothed = np.convolve(clean, kernel, mode="same")

    mouth_curve = np.clip(smoothed / (p95 - noise_floor + 1e-5), 0.0, 1.0)
    mouth_curve = np.power(mouth_curve, 0.85)

    log(f"Fotogramas calculados: {total_frames} ({total_frames / fps:.2f}s a {fps} fps)")
    return mouth_curve

def prepare_avatar_base() -> np.ndarray:
    """Carga y recorta la imagen oficial del Avatar Maestro a 800x800 px."""
    log("Cargando imagen oficial del Avatar Maestro...")
    src = cv2.imread(SOURCE_IMAGE)
    if src is None:
        raise FileNotFoundError(f"No se encontró la imagen oficial: {SOURCE_IMAGE}")
    h, w, _ = src.shape
    crop_x = (w - 1536) // 2
    square = src[0:1536, crop_x:crop_x + 1536]
    return cv2.resize(square, (800, 800), interpolation=cv2.INTER_LANCZOS4)

def render_natural_avatar_frame(
    base_img: np.ndarray,
    mouth_open: float,
    blink: float,
    t: float
) -> np.ndarray:
    """
    Renderiza el avatar con comportamiento fisiológico natural:
    1. Ciclo de respiración preparatoria nasal (t=0.2s a 1.4s).
    2. Respiración cíclica suave y asentimientos de habla.
    3. Deformación labial continua Zero-Seam (delta_boundary = 0.0).
    4. Parpadeo fisiológico orgánico.
    """
    # 1. Dinámica de Respiración y Hombros/Pecho
    if t < INHALATION_PREP_SEC:
        # En los primeros segundos: inhalación preparatoria nasal
        # Eleva el pecho y hombros suavemente ~4 píxeles durante 1.0s y se asienta
        if 0.2 <= t <= 1.4:
            inhalation_progress = (t - 0.2) / 1.2
            # Curva sinusoidal de inhalación profunda: se eleva y relaja
            breath_dy = -int(4.0 * math.sin(math.pi * inhalation_progress))
        else:
            breath_dy = 0
        speech_nod = 0
    else:
        # Durante el habla: respiración sinusoidal continua (ciclo de 4.2s)
        breath_dy = int(1.4 * math.sin(2 * math.pi * t / 4.2))
        speech_nod = int(2.0 * max(0.0, mouth_open - 0.55))

    total_dy = breath_dy + speech_nod

    if total_dy != 0:
        M = np.float32([[1, 0, 0], [0, 1, total_dy]])
        avatar = cv2.warpAffine(base_img, M, (800, 800), borderMode=cv2.BORDER_REFLECT)
    else:
        avatar = base_img.copy()

    # 2. Deformación Labial Continua (Zero-Seam Lip-Morphing)
    cx, cy = 392, 395 + total_dy
    rx, ry = 72, 52

    if mouth_open > 0.015:
        x0, x1 = max(0, cx - rx), min(800, cx + rx)
        y0, y1 = max(0, cy - ry), min(800, cy + ry)

        roi = avatar[y0:y1, x0:x1].astype(np.float32)
        rh, rw, _ = roi.shape

        Y, X = np.ogrid[:rh, :rw]
        nx = (X - (cx - x0)) / float(rx)
        ny = (Y - (cy - y0)) / float(ry)
        r2 = nx**2 + ny**2

        # Atenuación coseno S-curve en la frontera elíptica (garantiza delta 0.0)
        falloff = np.clip(1.0 - r2, 0.0, 1.0)
        falloff = 0.5 * (1.0 - np.cos(np.pi * falloff))

        max_dy = 14.5 * mouth_open
        disp_y = np.zeros_like(ny, dtype=np.float32)
        pos_mask = ny >= 0
        disp_y[pos_mask] = max_dy * (ny[pos_mask] ** 0.82)
        disp_y[~pos_mask] = -2.2 * mouth_open * ((-ny[~pos_mask]) ** 0.82)
        disp_y = disp_y * falloff

        map_x = np.broadcast_to(X, (rh, rw)).astype(np.float32)
        map_y = np.clip(Y - disp_y, 0, rh - 1).astype(np.float32)
        warped_roi = cv2.remap(roi, map_x, map_y, cv2.INTER_CUBIC)

        # Cavidad oral y dientes
        cavity_h = int(max_dy * 0.75)
        if cavity_h >= 2:
            cavity_w = int(22 + 18 * mouth_open)
            cavity_mask = np.zeros((rh, rw), dtype=np.float32)
            center_roi = (int(cx - x0), int(cy - y0 + max_dy * 0.35))
            cv2.ellipse(cavity_mask, center_roi, (cavity_w, cavity_h), 0, 0, 360, 1.0, -1)
            cavity_mask = cv2.GaussianBlur(cavity_mask, (7, 7), 0)

            cavity_layer = np.full_like(roi, (28, 22, 25), dtype=np.float32)
            if cavity_h >= 4:
                teeth_h = max(2, int(cavity_h * 0.35))
                teeth_w = int(cavity_w * 0.70)
                teeth_center = (center_roi[0], center_roi[1] - int(cavity_h * 0.25))
                teeth_mask = np.zeros((rh, rw), dtype=np.float32)
                cv2.ellipse(teeth_mask, teeth_center, (teeth_w, teeth_h), 0, 0, 180, 1.0, -1)
                teeth_mask = cv2.GaussianBlur(teeth_mask, (3, 3), 0)
                cavity_layer = cavity_layer * (1.0 - teeth_mask[:, :, None]) + np.array([195, 190, 185], dtype=np.float32) * teeth_mask[:, :, None]

            warped_roi = warped_roi * (1.0 - cavity_mask[:, :, None]) + cavity_layer * cavity_mask[:, :, None]

        blend_mask = falloff[:, :, None]
        avatar[y0:y1, x0:x1] = (warped_roi * blend_mask + roi * (1.0 - blend_mask)).astype(np.uint8)

    # 3. Parpadeo Fisiológico
    if blink > 0.04:
        eyelid_bgr = (72, 98, 148)
        for eye_x in [345, 435]:
            eye_y = 264 + total_dy
            h_blink = int(8.5 * blink)
            cv2.ellipse(avatar, (eye_x, eye_y), (18, h_blink), 0, 0, 360, eyelid_bgr, -1, cv2.LINE_AA)
            cv2.ellipse(avatar, (eye_x, eye_y), (18, max(1, int(h_blink * 0.32))), 0, 0, 180, (22, 16, 12), 2, cv2.LINE_AA)

    return avatar

def create_mask_rounded_rect(width: int, height: int, radius: int) -> np.ndarray:
    """Máscara alfa antialiased para esquinas rounded-3xl."""
    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.rectangle(mask, (radius, 0), (width - radius, height), 255, -1)
    cv2.rectangle(mask, (0, radius), (width, height - radius), 255, -1)
    cv2.circle(mask, (radius, radius), radius, 255, -1)
    cv2.circle(mask, (width - radius, radius), radius, 255, -1)
    cv2.circle(mask, (radius, height - radius), radius, 255, -1)
    cv2.circle(mask, (width - radius, height - radius), radius, 255, -1)
    return mask

def draw_clean_modal_interface(
    canvas: np.ndarray,
    t: float,
    current_beat: int,
    beat_progress: float,
    active_syllable: int
):
    """
    Renderiza la interfaz limpia para el modal web:
    Únicamente el Metrónomo a 60 BPM y las Cajas Silábicas [CA] [DEN] [SA].
    Cero textos largos ni subtítulos estáticos redundantes.
    """
    # 1. Metrónomo Visual (x=1420, y=340)
    metro_center = (1420, 340)
    flash = max(0.0, 1.0 - (beat_progress / 0.40)) if beat_progress < 0.40 else 0.0

    pulse_radius = int(85 + 18 * flash)
    pulse_color = (
        int(6 + (129 - 6) * flash),
        int(182 + (240 - 182) * flash),
        int(16 + (16 - 16) * flash)
    )

    cv2.circle(canvas, metro_center, pulse_radius + 20, (35, 30, 30), 2, cv2.LINE_AA)
    cv2.circle(canvas, metro_center, pulse_radius, pulse_color, int(4 + 3 * flash), cv2.LINE_AA)
    cv2.circle(canvas, metro_center, int(pulse_radius * 0.72), (25, 20, 20), -1, cv2.LINE_AA)

    font_scale_num = 1.6
    num_size = cv2.getTextSize("60", cv2.FONT_HERSHEY_SIMPLEX, font_scale_num, 4)[0]
    num_x = metro_center[0] - num_size[0] // 2
    num_y = metro_center[1] + 10
    cv2.putText(canvas, "60", (num_x, num_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale_num, (255, 255, 255), 4, cv2.LINE_AA)

    bpm_size = cv2.getTextSize("BPM", cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)[0]
    bpm_x = metro_center[0] - bpm_size[0] // 2
    bpm_y = metro_center[1] + 45
    cv2.putText(canvas, "BPM", (bpm_x, bpm_y), cv2.FONT_HERSHEY_SIMPLEX, 0.65, pulse_color, 2, cv2.LINE_AA)

    status_text = "RITMO BASAL COMPENSATORIO  •  1 PULSO / SEGUNDO"
    st_size = cv2.getTextSize(status_text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)[0]
    st_x = metro_center[0] - st_size[0] // 2
    cv2.putText(canvas, status_text, (st_x, 485), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (161, 161, 170), 1, cv2.LINE_AA)

    # 2. Cajas Silábicas de Pacing: [ CA ] [ DEN ] [ SA ]
    syllables = ["CA", "DEN", "SA"]
    box_w = 260
    box_h = 160
    box_y = 540
    start_x = 1030
    spacing = 35

    for idx, syl in enumerate(syllables):
        bx = start_x + idx * (box_w + spacing)
        is_active = (idx == active_syllable)

        if is_active:
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (25, 65, 20), -1, cv2.LINE_AA)
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (129, 240, 16), 3, cv2.LINE_AA)
            cv2.circle(canvas, (bx + box_w - 25, box_y + 25), 8, (129, 240, 16), -1, cv2.LINE_AA)
            text_color = (255, 255, 255)
            sub_label = "PULSO ACTIVO"
            sub_color = (129, 240, 16)
        else:
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (24, 20, 20), -1, cv2.LINE_AA)
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (48, 40, 40), 2, cv2.LINE_AA)
            text_color = (140, 140, 150)
            sub_label = f"Sílaba {idx + 1}"
            sub_color = (95, 95, 105)

        font_scale = 2.2 if is_active else 1.8
        thickness = 5 if is_active else 3
        text_size = cv2.getTextSize(syl, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
        tx = bx + (box_w - text_size[0]) // 2
        ty = box_y + 98
        cv2.putText(canvas, syl, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, thickness, cv2.LINE_AA)

        sub_size = cv2.getTextSize(sub_label, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 1)[0]
        stx = bx + (box_w - sub_size[0]) // 2
        cv2.putText(canvas, sub_label, (stx, box_y + 138), cv2.FONT_HERSHEY_SIMPLEX, 0.52, sub_color, 1, cv2.LINE_AA)

    # 3. Barra Horizontal de Biofeedback / Sincronía Vocal (y=770)
    bar_x = 1030
    bar_y = 770
    bar_w = 3 * box_w + 2 * spacing
    bar_h = 32

    cv2.rectangle(canvas, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (24, 20, 20), -1, cv2.LINE_AA)
    cv2.rectangle(canvas, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (50, 45, 45), 1, cv2.LINE_AA)

    fill_w = int(bar_w * beat_progress)
    if fill_w > 0:
        cv2.rectangle(canvas, (bar_x + 2, bar_y + 2), (bar_x + fill_w, bar_y + bar_h - 2), (30, 80, 25), -1, cv2.LINE_AA)

    pulse_indicator_text = "GUÍA DE HABLA RÍTMICA SILÁBICA (STS)  •  SINCRONIZACIÓN EN TIEMPO REAL"
    p_size = cv2.getTextSize(pulse_indicator_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0]
    p_x = bar_x + (bar_w - p_size[0]) // 2
    p_y = bar_y + 21
    cv2.putText(canvas, pulse_indicator_text, (p_x, p_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 210), 1, cv2.LINE_AA)

def assemble_natural_video(force: bool = False):
    """Pipeline de transcodificación y renderizado del video con avatar natural."""
    ensure_dirs()

    # Guardrail 1: Comprobación de caché
    if check_cache_guardrail(force=force):
        return

    audio_wav, duration = generate_natural_audio()
    mouth_open_curve = extract_speech_envelope(audio_wav, duration, FPS)
    total_frames = len(mouth_open_curve)

    avatar_base = prepare_avatar_base()
    avatar_mask = create_mask_rounded_rect(800, 800, radius=44)
    avatar_mask_3c = cv2.merge([avatar_mask, avatar_mask, avatar_mask]) / 255.0

    step(f"FASE 3: Transcodificación y Renderizado Full HD ({total_frames} fotogramas @ {FPS} fps)")
    log("Iniciando FFmpeg con tubería stdin y compresión H.264/AAC...")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", "1920x1080",
        "-pix_fmt", "bgr24",
        "-r", str(FPS),
        "-i", "-",                     # Entrada video stdin
        "-i", audio_wav,               # Audio mezclado
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    # Variables de parpadeo
    blink_counter = 0
    next_blink_frame = int(FPS * 3.8)

    # Fondo estrictamente en color sólido carbón #0F0F13 -> BGR (19, 15, 15)
    base_canvas = np.zeros((1080, 1920, 3), dtype=np.uint8)
    base_canvas[:] = (19, 15, 15)

    avatar_x = 100
    avatar_y = 140

    # Borde sutil del contenedor del avatar
    cv2.rectangle(base_canvas, (avatar_x - 2, avatar_y - 2), (avatar_x + 802, avatar_y + 802), (45, 38, 38), 2, cv2.LINE_AA)

    for f_idx in range(total_frames):
        t = f_idx / FPS
        m_open = float(mouth_open_curve[f_idx])

        # Parpadeo fisiológico regular cada 3.5 a 4.0 segundos
        if f_idx >= next_blink_frame and blink_counter == 0:
            blink_counter = 6
            next_blink_frame = f_idx + int(FPS * (3.6 + (f_idx % 3) * 0.4))

        if blink_counter > 0:
            progress = (6 - blink_counter) / 6.0
            blink_val = math.sin(math.pi * progress)
            blink_counter -= 1
        else:
            blink_val = 0.0

        # Renderizar avatar animado (con ciclo de inhalación inicial y lip-morphing)
        talking_avatar = render_natural_avatar_frame(avatar_base, mouth_open=m_open, blink=blink_val, t=t)

        frame = base_canvas.copy()

        # Componer avatar con máscara antialiased rounded-3xl
        roi = frame[avatar_y:avatar_y + 800, avatar_x:avatar_x + 800]
        blended = (talking_avatar * avatar_mask_3c + roi * (1.0 - avatar_mask_3c)).astype(np.uint8)
        frame[avatar_y:avatar_y + 800, avatar_x:avatar_x + 800] = blended

        # Dinámica del metrónomo y cajas silábicas
        current_beat = int(t)
        beat_progress = t - current_beat

        # Sincronización silábica durante la práctica activa
        if 17.0 <= t <= 25.5:
            practice_sec = t - 17.0
            active_syl = int(practice_sec / 1.0) % 3
        else:
            active_syl = int(t / 1.5) % 3

        draw_clean_modal_interface(frame, t, current_beat, beat_progress, active_syl)

        # Transiciones de entrada y salida (0.5s fade in/out)
        fade_duration = 0.5
        if t < fade_duration:
            alpha = t / fade_duration
            frame = (frame * alpha).astype(np.uint8)
        elif t > (duration - fade_duration):
            alpha = (duration - t) / fade_duration
            frame = (frame * alpha).astype(np.uint8)

        proc.stdin.write(frame.tobytes())

        if f_idx % 100 == 0:
            log(f"Progreso de renderizado: {f_idx}/{total_frames} ({f_idx * 100 // total_frames}%)...")

    proc.stdin.close()
    stderr_output = proc.stderr.read().decode()
    proc.wait()

    if proc.returncode != 0:
        raise RuntimeError(f"Error en FFmpeg: {stderr_output}")

    step("FASE 4: Auditoría y Verificación de Salida (Agent Guardrail 3)")
    file_size = os.path.getsize(OUTPUT_VIDEO)
    log(f"✅ Video natural generado con éxito en: {OUTPUT_VIDEO}")
    log(f"📏 Tamaño final: {file_size} bytes ({file_size / (1024*1024):.2f} MB)")
    log(f"⏱️ Duración: {duration:.2f} segundos")
    log(f"🖥️ Resolución: 1920x1080 px (16:9 Full HD)")
    log(f"🎨 Fondo: Sólido carbón #0F0F13")
    log(f"🗣️ Voz: Masculina ({MALE_VOICE}) | Formato: H.264 / AAC 192 kbps")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline del Avatar Natural para Cadensa.")
    parser.add_argument("--force", action="store_true", help="Fuerza la regeneración del asset omitiendo el cache check.")
    args = parser.parse_args()
    assemble_natural_video(force=args.force)

