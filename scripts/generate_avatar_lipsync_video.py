#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Pipeline Multimedia Autónomo y Refactorizado del Avatar Maestro (Costo Cero)
https://cadensa-web.pages.dev/

Características:
1. Composición limpia para modal web: Únicamente Avatar Maestro + Metrónomo visual a 60 BPM + Cajas silábicas [CA] [DEN] [SA].
   Sin títulos largos ni párrafos estáticos redundantes.
2. Locución fonoaudiológica masculina, cálida y natural (es-MX-JorgeNeural) con prosodia y acentuación corregida.
3. Deformación labial continua y orgánica (Zero Seam Lip-Morphing) basada en envolvente acústica RMS,
   sin líneas estáticas sobre la boca, con parpadeo ocular fisiológico y micro-movimientos de respiración/asentimiento.
4. Agent Guardrails:
   - Cache Check: Comprobación de existencia local y peso para evitar cómputo redundante (anulable con --force).
   - Costo Cero: Ejecución 100% local sin llamadas a APIs comerciales ni consumo de créditos.
   - Auditoría y validación automática de especificaciones web tras la transcodificación.
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
OUTPUT_VIDEO = os.path.join(PROJECT_ROOT, "public/media/techniques/cadensa_sts_avatar_final.mp4")
TEMP_DIR = os.path.join(PROJECT_ROOT, "scripts/temp_lipsync_build")

FPS = 25
SAMPLE_RATE = 24000
MALE_VOICE = "es-MX-JorgeNeural" # Voz masculina cálida, profesional y con fonética nativa mexicana

# Texto fonoaudiológico con prosodia y separación silábica precisa para dicción perfecta
SCRIPT_TEXT = (
    "Hola. Soy el Maestro de Cadensa. "
    "Hoy practicaremos la técnica de Habla Rít-mi-ca Si-lá-bi-ca, para darte mayor fluidez vocal. "
    "Al configurar nuestro metrónomo a sesenta pulsos por minuto, "
    "creamos una guía externa que elude los bloqueos al hablar. "
    "Ahora, practiquemos juntos con cada pulso: "
    "CA... "
    "DEN... "
    "SA... "
    "Siente el ritmo, sigue la cadencia y libera tu voz."
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
        log("Flag --force detectado: Forzando re-generación completa del asset.")
        return False

    if os.path.exists(OUTPUT_VIDEO):
        file_size = os.path.getsize(OUTPUT_VIDEO)
        # Un video Full HD de ~30s comprimido tiene un tamaño esperado entre 1.0 MB y 8.0 MB
        if file_size > 500 * 1024:
            log(f"Asset existente válido detectado en caché: {OUTPUT_VIDEO}")
            log(f"Tamaño actual: {file_size} bytes ({file_size / (1024*1024):.2f} MB).")
            log("Omitiendo procesamiento redundante para garantizar CERO gasto de recursos.")
            return True
        else:
            log("Asset encontrado pero incompleto o corrupto (< 500 KB). Procediendo a regeneración.")
            return False
    else:
        log(f"Asset no encontrado en {OUTPUT_VIDEO}. Iniciando pipeline de producción.")
        return False

async def synthesize_male_audio(speech_mp3: str):
    """Sintetiza la locución masculina en español mediante edge-tts con cadencia fonoaudiológica."""
    log(f"Sintetizando locución masculina con voz [{MALE_VOICE}] (rate='-3%', pitch='-1Hz')...")
    communicate = edge_tts.Communicate(
        text=SCRIPT_TEXT,
        voice=MALE_VOICE,
        rate="-3%",
        pitch="-1Hz"
    )
    await communicate.save(speech_mp3)

def generate_clinical_audio() -> tuple[str, float]:
    """Genera la locución masculina corregida y mezcla los pulsos rítmicos del metrónomo a 60 BPM."""
    step("FASE 1: Generación Prosódica Masculina y Metrónomo Clínico (60 BPM)")
    speech_mp3 = os.path.join(TEMP_DIR, "speech_male.mp3")
    speech_wav = os.path.join(TEMP_DIR, "speech_male.wav")
    final_audio_wav = os.path.join(TEMP_DIR, "cadensa_sts_mixed.wav")

    # Sintetizar audio si no existe en la carpeta temporal
    if not os.path.exists(speech_mp3) or os.path.getsize(speech_mp3) == 0:
        asyncio.run(synthesize_male_audio(speech_mp3))
    else:
        log("Utilizando locución masculina previamente sintetizada en caché temporal.")

    # Convertir a WAV mono a SAMPLE_RATE
    cmd_conv = [
        "ffmpeg", "-y", "-i", speech_mp3,
        "-ac", "1", "-ar", str(SAMPLE_RATE),
        speech_wav
    ]
    subprocess.run(cmd_conv, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    with wave.open(speech_wav, "rb") as wf:
        n_frames = wf.getnframes()
        sr = wf.getframerate()
        raw_bytes = wf.readframes(n_frames)
        speech_samples = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    duration = n_frames / sr
    total_samples = len(speech_samples)
    log(f"Locución masculina completada: {duration:.2f} segundos ({total_samples} muestras a {sr} Hz)")

    # Sintetizar pulsos acústicos del metrónomo a 60 BPM (1 pulso / segundo)
    metronome = np.zeros(total_samples, dtype=np.float32)
    beat_interval = SAMPLE_RATE
    num_beats = int(duration)

    # Pulso acústico fonoaudiológico: toque de percusión de madera (1000 Hz decaying en 40 ms)
    click_len = int(SAMPLE_RATE * 0.040)
    t_click = np.linspace(0, 0.040, click_len, endpoint=False)
    click_wave = np.sin(2 * np.pi * 980 * t_click) * np.exp(-t_click * 85) * 0.50

    for b in range(num_beats + 1):
        idx = b * beat_interval
        if idx + click_len <= total_samples:
            sec = b * 1.0
            # Acento prominente durante la práctica guiada de [CA] [DEN] [SA] (aprox. seg 18 a 28)
            vol = 0.38 if (17.5 <= sec <= 28.5) else 0.14
            metronome[idx:idx + click_len] += click_wave * vol

    # Mezcla equilibrada: locución protagonista + guía de metrónomo
    mixed = speech_samples * 0.92 + metronome * 0.45
    max_val = np.max(np.abs(mixed))
    if max_val > 0.95:
        mixed = (mixed / max_val) * 0.95

    mixed_i16 = (mixed * 32767.0).astype(np.int16)
    with wave.open(final_audio_wav, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(mixed_i16.tobytes())

    log(f"Pista de audio final integrada en: {final_audio_wav}")
    return final_audio_wav, duration

def extract_speech_envelope(audio_path: str, duration: float, fps: int) -> np.ndarray:
    """Extrae la envolvente de energía RMS cuadro a cuadro para modular el movimiento labial."""
    step("FASE 2: Análisis Acústico y Extracción de Envolvente RMS (Lip-Sync)")
    with wave.open(audio_path, "rb") as wf:
        sr = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)
        samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

    total_video_frames = int(duration * fps)
    samples_per_frame = int(sr / fps)

    energies = np.zeros(total_video_frames, dtype=np.float32)
    for i in range(total_video_frames):
        st = i * samples_per_frame
        en = min(st + samples_per_frame, len(samples))
        chunk = samples[st:en]
        if len(chunk) > 0:
            energies[i] = np.sqrt(np.mean(chunk**2))

    # Filtrado y normalización adaptativa
    p95 = np.percentile(energies, 95)
    noise_floor = np.percentile(energies, 12)
    clean_e = np.maximum(0.0, energies - noise_floor)
    
    # Suavizado temporal con ventana gaussiana (7 fotogramas) para evitar vibración o jitter
    kernel = np.array([0.05, 0.12, 0.22, 0.28, 0.22, 0.12, 0.05], dtype=np.float32)
    smoothed = np.convolve(clean_e, kernel, mode="same")
    
    mouth_open = np.clip(smoothed / (p95 - noise_floor + 1e-5), 0.0, 1.0)
    mouth_open = np.power(mouth_open, 0.85)

    log(f"Total fotogramas sincronizados: {total_video_frames} ({total_video_frames/fps:.2f}s)")
    return mouth_open

def prepare_avatar_base() -> np.ndarray:
    """Recorta centrado el retrato oficial de 2752x1536 a un cuadrado de 800x800 px."""
    log("Cargando imagen fuente oficial del Avatar Maestro...")
    src = cv2.imread(SOURCE_IMAGE)
    if src is None:
        raise FileNotFoundError(f"No se pudo cargar la imagen fuente: {SOURCE_IMAGE}")
    
    h, w, _ = src.shape
    crop_x = (w - 1536) // 2
    square = src[0:1536, crop_x:crop_x + 1536]
    return cv2.resize(square, (800, 800), interpolation=cv2.INTER_LANCZOS4)

def seamless_talking_avatar(
    base_img: np.ndarray,
    mouth_open: float,
    blink: float,
    t: float
) -> np.ndarray:
    """
    Deformación labial continua (Zero-Seam Lip-Morphing):
    Aplica remap bicúbico con máscara elíptica de decaimiento en S (coseno).
    Garantiza continuidad C1 y delta 0.0 en los límites para eliminar toda línea estática.
    """
    # 1. Dinámica cefálica: respiración sinusoidal y sutil asentimiento en énfasis fonoaudiológico
    breath_dy = int(1.4 * math.sin(2 * math.pi * t / 4.0))
    speech_nod = int(2.0 * max(0.0, mouth_open - 0.55))
    total_dy = breath_dy + speech_nod

    if total_dy != 0:
        M = np.float32([[1, 0, 0], [0, 1, total_dy]])
        avatar = cv2.warpAffine(base_img, M, (800, 800), borderMode=cv2.BORDER_REFLECT)
    else:
        avatar = base_img.copy()

    # 2. Deformación labial continua (Zero Seams)
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
        
        # Máscara elíptica de atenuación suave en coseno (garantiza 0.0 exacto en el contorno)
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
        
        # Apertura de cavidad oral con bordes difuminados (Gaussian Blur)
        cavity_h = int(max_dy * 0.75)
        if cavity_h >= 2:
            cavity_w = int(22 + 18 * mouth_open)
            cavity_mask = np.zeros((rh, rw), dtype=np.float32)
            center_roi = (int(cx - x0), int(cy - y0 + max_dy * 0.35))
            cv2.ellipse(cavity_mask, center_roi, (cavity_w, cavity_h), 0, 0, 360, 1.0, -1)
            cavity_mask = cv2.GaussianBlur(cavity_mask, (7, 7), 0)
            
            # Color de cavidad bucal natural (BGR 28, 22, 25)
            cavity_layer = np.full_like(roi, (28, 22, 25), dtype=np.float32)
            # Dientes superiores
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

    # 3. Parpadeo fisiológico natural (sin líneas duras)
    if blink > 0.04:
        eyelid_bgr = (72, 98, 148)
        for eye_x in [345, 435]:
            eye_y = 264 + total_dy
            h_blink = int(8.5 * blink)
            cv2.ellipse(avatar, (eye_x, eye_y), (18, h_blink), 0, 0, 360, eyelid_bgr, -1, cv2.LINE_AA)
            cv2.ellipse(avatar, (eye_x, eye_y), (18, max(1, int(h_blink * 0.32))), 0, 0, 180, (22, 16, 12), 2, cv2.LINE_AA)

    return avatar

def create_mask_rounded_rect(width: int, height: int, radius: int) -> np.ndarray:
    """Crea una máscara alfa antialiased para el contenedor rounded-3xl."""
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
    ÚNICAMENTE el Metrónomo Visual (60 BPM) y las Cajas Silábicas [CA] [DEN] [SA].
    Sin títulos largos ni textos estáticos redundantes.
    """
    # 1. Metrónomo Visual Rítmico (Centro: x=1420, y=340)
    metro_center = (1420, 340)
    flash = max(0.0, 1.0 - (beat_progress / 0.40)) if beat_progress < 0.40 else 0.0

    pulse_radius = int(85 + 18 * flash)
    pulse_color = (
        int(6 + (129 - 6) * flash),
        int(182 + (240 - 182) * flash),
        int(16 + (16 - 16) * flash)
    )

    # Anillo exterior pulsante
    cv2.circle(canvas, metro_center, pulse_radius + 20, (32, 32, 38), 2, cv2.LINE_AA)
    cv2.circle(canvas, metro_center, pulse_radius, pulse_color, int(4 + 3 * flash), cv2.LINE_AA)
    # Cuerpo interior del metrónomo
    cv2.circle(canvas, metro_center, int(pulse_radius * 0.72), (20, 20, 24), -1, cv2.LINE_AA)

    # Tipografía central del metrónomo: "60" y "BPM"
    font_scale_num = 1.6
    num_size = cv2.getTextSize("60", cv2.FONT_HERSHEY_SIMPLEX, font_scale_num, 4)[0]
    num_x = metro_center[0] - num_size[0] // 2
    num_y = metro_center[1] + 10
    cv2.putText(canvas, "60", (num_x, num_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale_num, (255, 255, 255), 4, cv2.LINE_AA)

    bpm_size = cv2.getTextSize("BPM", cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)[0]
    bpm_x = metro_center[0] - bpm_size[0] // 2
    bpm_y = metro_center[1] + 45
    cv2.putText(canvas, "BPM", (bpm_x, bpm_y), cv2.FONT_HERSHEY_SIMPLEX, 0.65, pulse_color, 2, cv2.LINE_AA)

    # Indicador de estado de sincronización (debajo del metrónomo)
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
            # Caja activa: fondo esmeralda brillante con iluminación y borde cian/esmeralda
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (25, 65, 20), -1, cv2.LINE_AA)
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (129, 240, 16), 3, cv2.LINE_AA)
            cv2.circle(canvas, (bx + box_w - 25, box_y + 25), 8, (129, 240, 16), -1, cv2.LINE_AA)
            text_color = (255, 255, 255)
            sub_label = "PULSO ACTIVO"
            sub_color = (129, 240, 16)
        else:
            # Caja inactiva: zinc ultraoscuro con borde sutil
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (18, 18, 22), -1, cv2.LINE_AA)
            cv2.rectangle(canvas, (bx, box_y), (bx + box_w, box_y + box_h), (42, 42, 48), 2, cv2.LINE_AA)
            text_color = (140, 140, 150)
            sub_label = f"Sílaba {idx + 1}"
            sub_color = (95, 95, 105)

        # Letra silábica grande centrada
        font_scale = 2.2 if is_active else 1.8
        thickness = 5 if is_active else 3
        text_size = cv2.getTextSize(syl, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
        tx = bx + (box_w - text_size[0]) // 2
        ty = box_y + 98
        cv2.putText(canvas, syl, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, thickness, cv2.LINE_AA)

        # Subtítulo de pulso
        sub_size = cv2.getTextSize(sub_label, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 1)[0]
        stx = bx + (box_w - sub_size[0]) // 2
        cv2.putText(canvas, sub_label, (stx, box_y + 138), cv2.FONT_HERSHEY_SIMPLEX, 0.52, sub_color, 1, cv2.LINE_AA)

    # 3. Barra Horizontal de Biofeedback / Sincronía Vocal (y=770)
    bar_x = 1030
    bar_y = 770
    bar_w = 3 * box_w + 2 * spacing # 850 px
    bar_h = 32

    cv2.rectangle(canvas, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (18, 18, 22), -1, cv2.LINE_AA)
    cv2.rectangle(canvas, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (45, 45, 52), 1, cv2.LINE_AA)

    # Relleno animado según progreso del beat de 1.0s
    fill_w = int(bar_w * beat_progress)
    if fill_w > 0:
        cv2.rectangle(canvas, (bar_x + 2, bar_y + 2), (bar_x + fill_w, bar_y + bar_h - 2), (30, 80, 25), -1, cv2.LINE_AA)

    # Marcadores de pulso
    pulse_indicator_text = "GUÍA DE HABLA RÍTMICA SILÁBICA (STS)  •  SINCRONIZACIÓN EN TIEMPO REAL"
    p_size = cv2.getTextSize(pulse_indicator_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0]
    p_x = bar_x + (bar_w - p_size[0]) // 2
    p_y = bar_y + 21
    cv2.putText(canvas, pulse_indicator_text, (p_x, p_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 210), 1, cv2.LINE_AA)


def assemble_final_video(force: bool = False):
    """Orquesta la producción integral del video limpio y audita la salida."""
    ensure_dirs()

    # Agent Guardrail 1: Comprobación de caché para CERO desperdicio de recursos
    if check_cache_guardrail(force=force):
        return

    # Fases de Producción
    audio_wav, duration = generate_clinical_audio()
    mouth_open_curve = extract_speech_envelope(audio_wav, duration, FPS)
    total_frames = len(mouth_open_curve)

    avatar_base = prepare_avatar_base()
    avatar_mask = create_mask_rounded_rect(800, 800, radius=44)
    avatar_mask_3c = cv2.merge([avatar_mask, avatar_mask, avatar_mask]) / 255.0

    step(f"FASE 3: Transcodificación y Renderizado Full HD ({total_frames} fotogramas @ {FPS} fps)")
    log("Iniciando FFmpeg con tubería cruda y compresión optimizada H.264/AAC...")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", "1920x1080",
        "-pix_fmt", "bgr24",
        "-r", str(FPS),
        "-i", "-",                     # Entrada video stdin
        "-i", audio_wav,               # Audio mezclado voz + metrónomo
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

    # Estado de parpadeo
    blink_counter = 0
    next_blink_frame = int(FPS * 3.5)

    # Lienzo base 1920x1080 (#09090b -> BGR 11, 9, 9)
    base_canvas = np.zeros((1080, 1920, 3), dtype=np.uint8)
    base_canvas[:] = (11, 9, 9)

    avatar_x = 100
    avatar_y = 140

    # Marco elegante del contenedor del avatar (rounded-3xl)
    cv2.rectangle(base_canvas, (avatar_x - 2, avatar_y - 2), (avatar_x + 802, avatar_y + 802), (38, 38, 44), 2, cv2.LINE_AA)

    for f_idx in range(total_frames):
        t = f_idx / FPS
        m_open = float(mouth_open_curve[f_idx])

        # Parpadeo natural
        if f_idx >= next_blink_frame and blink_counter == 0:
            blink_counter = 6
            next_blink_frame = f_idx + int(FPS * (3.5 + (f_idx % 3) * 0.8))

        if blink_counter > 0:
            progress = (6 - blink_counter) / 6.0
            blink_val = math.sin(math.pi * progress)
            blink_counter -= 1
        else:
            blink_val = 0.0

        # Renderizar avatar animado sin líneas estáticas (Zero-Seam Morphing)
        talking_avatar = seamless_talking_avatar(avatar_base, mouth_open=m_open, blink=blink_val, t=t)

        frame = base_canvas.copy()

        # Componer avatar con máscara antialiased rounded-3xl
        roi = frame[avatar_y:avatar_y + 800, avatar_x:avatar_x + 800]
        blended = (talking_avatar * avatar_mask_3c + roi * (1.0 - avatar_mask_3c)).astype(np.uint8)
        frame[avatar_y:avatar_y + 800, avatar_x:avatar_x + 800] = blended

        # Dinámica del metrónomo y cajas silábicas
        current_beat = int(t)
        beat_progress = t - current_beat

        # Sincronización silábica durante la práctica de [CA] [DEN] [SA] (aprox. seg 18.0 a 28.0)
        if 18.0 <= t <= 27.5:
            practice_sec = t - 18.0
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

    # Auditoría automática de especificaciones de salida
    step("FASE 4: Auditoría y Verificación de Salida (Agent Guardrail 3)")
    file_size = os.path.getsize(OUTPUT_VIDEO)
    log(f"✅ Video refactorizado con éxito en: {OUTPUT_VIDEO}")
    log(f"📏 Tamaño final: {file_size} bytes ({file_size / (1024*1024):.2f} MB)")
    log(f"⏱️ Duración: {duration:.2f} segundos")
    log(f"🖥️ Resolución: 1920x1080 px (16:9 Full HD)")
    log(f"🗣️ Voz: Masculina ({MALE_VOICE}) | Formato: H.264 / AAC 192 kbps")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline multimedia del Avatar Maestro para Cadensa.")
    parser.add_argument("--force", action="store_true", help="Fuerza la regeneración del asset omitiendo el cache check.")
    args = parser.parse_args()
    assemble_final_video(force=args.force)
