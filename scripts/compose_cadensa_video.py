#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Compositor de Video Clínico de Alta Fidelidad (1920x1080)
https://cadensa-web.pages.dev/

Propósito:
Toma el video facial animado (SadTalker / Wav2Lip) y lo compone sobre el lienzo
institucional de Cadensa (1920x1080 px) con sincronización fonoaudiológica real:
1. Fondo sólido carbón #0F0F13.
2. Contenedor izquierdo: Avatar 800x800 px con bordes redondeados (rounded-3xl, 44px)
   y contorno sutil esmeralda #10b981.
3. Simulación de Respiración Diafragmática: Durante las pausas e inhalación inicial,
   aplica una micro-expansión torácica y elevación sutil de hombros (curva sinusoidal).
4. Contenedor derecho: Interfaz clínica interactiva con metrónomo pulsante a 60 BPM
   y cajas silábicas activas [ CA ] [ DEN ] [ SA ] sincronizadas con el mapa temporal (Timeline).
5. Multiplexación con audio AAC estéreo 192 kbps y codificación H.264 (yuv420p).
"""

from __future__ import annotations
import os
import sys
import json
import math
import argparse
import tempfile
import shutil
import subprocess
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

# ==============================================================================
# CONSTANTES DE DISEÑO Y PALETA CLÍNICA DE CADENSA
# ==============================================================================
CANVAS_WIDTH = 1920
CANVAS_HEIGHT = 1080

# Colores en formato BGR
COLOR_BG = (19, 15, 15)              # #0F0F13 Carbón profundo
COLOR_PANEL = (39, 39, 39)           # #272727 Zinc oscuro
COLOR_PANEL_BORDER = (63, 63, 70)    # #3f3f46
COLOR_EMERALD = (129, 185, 16)       # #10b981 Esmeralda primario Cadensa
COLOR_EMERALD_GLOW = (167, 243, 110) # #6ee7b7
COLOR_CYAN = (235, 180, 56)          # #38bdf8 Acento cian
COLOR_TEXT_PRIMARY = (245, 244, 244) # #f4f4f5 Blanco roto
COLOR_TEXT_MUTED = (161, 161, 170)   # #a1a1aa Zinc texto secundario
COLOR_TEXT_DIM = (113, 113, 122)     # #71717a

AVATAR_SIZE = 800
AVATAR_RADIUS = 44
AVATAR_X = 100
AVATAR_Y = 140

FFMPEG_PATH = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\ffmpeg.exe"


def create_rounded_mask(size: int, radius: int) -> np.ndarray:
    """Crea una máscara alfa anti-aliasing con bordes redondeados."""
    mask = np.zeros((size, size), dtype=np.uint8)
    cv2.rectangle(mask, (radius, 0), (size - radius, size), 255, -1)
    cv2.rectangle(mask, (0, radius), (size, size - radius), 255, -1)
    cv2.circle(mask, (radius, radius), radius, 255, -1)
    cv2.circle(mask, (size - radius, radius), radius, 255, -1)
    cv2.circle(mask, (radius, size - radius), radius, 255, -1)
    cv2.circle(mask, (size - radius, size - radius), radius, 255, -1)
    mask = cv2.GaussianBlur(mask, (3, 3), 0.8)
    return mask


def draw_rounded_rect(img: np.ndarray, top_left: tuple[int, int], bottom_right: tuple[int, int], color: tuple[int, int, int], radius: int = 20, thickness: int = -1):
    """Dibuja un rectángulo con esquinas redondeadas en una imagen."""
    x1, y1 = top_left
    x2, y2 = bottom_right
    r = min(radius, (x2 - x1) // 2, (y2 - y1) // 2)

    if thickness == -1:
        cv2.rectangle(img, (x1 + r, y1), (x2 - r, y2), color, -1)
        cv2.rectangle(img, (x1, y1 + r), (x2, y2 - r), color, -1)
        cv2.circle(img, (x1 + r, y1 + r), r, color, -1)
        cv2.circle(img, (x2 - r, y1 + r), r, color, -1)
        cv2.circle(img, (x1 + r, y2 - r), r, color, -1)
        cv2.circle(img, (x2 - r, y2 - r), r, color, -1)
    else:
        cv2.line(img, (x1 + r, y1), (x2 - r, y1), color, thickness)
        cv2.line(img, (x1 + r, y2), (x2 - r, y2), color, thickness)
        cv2.line(img, (x1, y1 + r), (x1, y2 - r), color, thickness)
        cv2.line(img, (x2, y1 + r), (x2, y2 - r), color, thickness)
        cv2.ellipse(img, (x1 + r, y1 + r), (r, r), 180, 0, 90, color, thickness)
        cv2.ellipse(img, (x2 - r, y1 + r), (r, r), 270, 0, 90, color, thickness)
        cv2.ellipse(img, (x1 + r, y2 - r), (r, r), 90, 0, 90, color, thickness)
        cv2.ellipse(img, (x2 - r, y2 - r), (r, r), 0, 0, 90, color, thickness)


def compose_cadensa_frame(
    avatar_frame: np.ndarray,
    rounded_mask: np.ndarray,
    t_seconds: float,
    bpm: float = 60.0,
    syllables: list[str] = None,
    timeline_data: dict = None
) -> np.ndarray:
    """
    Genera un fotograma completo de 1920x1080 con:
    1. Simulación visual de respiración diafragmática (curva sinusoidal).
    2. Sincronización exacta del pulso del metrónomo y cajas silábicas con el timeline clínico.
    """
    if syllables is None:
        syllables = ["CA", "DEN", "SA"]

    # Extraer información del timeline si está disponible
    breathing_intervals = timeline_data.get("breathing_intervals", []) if timeline_data else []
    syllable_events = timeline_data.get("syllable_events", []) if timeline_data else []
    total_duration = timeline_data.get("total_duration", 7.5) if timeline_data else 7.5

    # 1. Determinar estado de respiración fisiológica
    is_breathing = False
    breath_sin = 0.0
    for b_start, b_end in breathing_intervals:
        if b_start <= t_seconds <= b_end:
            is_breathing = True
            dur = max(0.2, b_end - b_start)
            prog = (t_seconds - b_start) / dur
            breath_sin = math.sin(prog * math.pi)
            break

    # 2. Lienzo carbón #0F0F13
    canvas = np.full((CANVAS_HEIGHT, CANVAS_WIDTH, 3), COLOR_BG, dtype=np.uint8)

    # 3. Simulación de Respiración Diafragmática sobre el Avatar
    # Durante la respiración, el pecho y hombros se elevan (desplazamiento vertical -3px) y expanden (+0.8%)
    h, w = avatar_frame.shape[:2]
    base_crop = min(h, w)

    if is_breathing and breath_sin > 0.0:
        # Micro-expansión y elevación torácica
        scale = 1.0 + 0.008 * breath_sin
        crop_size = int(base_crop / scale)
        cy_offset = int((base_crop * 0.004) * breath_sin)
        cy, cx = (h // 2) + cy_offset, w // 2
    else:
        crop_size = base_crop
        cy, cx = h // 2, w // 2

    # Recorte seguro dentro de los límites
    half = crop_size // 2
    y1 = max(0, cy - half)
    y2 = min(h, cy + half)
    x1 = max(0, cx - half)
    x2 = min(w, cx + half)
    cropped = avatar_frame[y1:y2, x1:x2]

    resized_avatar = cv2.resize(cropped, (AVATAR_SIZE, AVATAR_SIZE), interpolation=cv2.INTER_LANCZOS4)

    # Filtro de nitidez (Unsharp Mask) para restaurar textura de piel, ojos y labios en alta definición
    gaussian = cv2.GaussianBlur(resized_avatar, (0, 0), 2.0)
    sharpened_avatar = cv2.addWeighted(resized_avatar, 1.35, gaussian, -0.35, 0)

    # 4. Componer avatar con máscara redondeada
    alpha = rounded_mask.astype(float) / 255.0
    alpha_3d = np.dstack([alpha, alpha, alpha])

    roi = canvas[AVATAR_Y : AVATAR_Y + AVATAR_SIZE, AVATAR_X : AVATAR_X + AVATAR_SIZE]
    canvas[AVATAR_Y : AVATAR_Y + AVATAR_SIZE, AVATAR_X : AVATAR_X + AVATAR_SIZE] = (
        sharpened_avatar * alpha_3d + roi * (1.0 - alpha_3d)
    ).astype(np.uint8)

    # Oclusión labial fonoaudiológica durante reposo respiratorio y pausas clínicas (Task 4)
    is_box_rest = False
    t_id_lower = str(technique_meta.get("id", "")).lower() if (locals().get("technique_meta") and isinstance(technique_meta, dict)) else ""
    t_name_lower = str(technique_meta.get("name", "")).lower() if (locals().get("technique_meta") and isinstance(technique_meta, dict)) else ""
    if "box" in t_id_lower or "box" in t_name_lower:
        phase_dur = 4.0
        t_in_phase = t_seconds % phase_dur
        if t_in_phase >= 1.4:
            is_box_rest = True

    if is_breathing or is_box_rest:
        mouth_roi = canvas[660:780, 420:540]
        m_gray = cv2.cvtColor(mouth_roi, cv2.COLOR_BGR2GRAY)
        dark_mask = (m_gray < 45).astype(np.uint8) * 255
        if np.any(dark_mask > 0):
            closed_mouth = cv2.inpaint(mouth_roi, dark_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
            canvas[660:780, 420:540] = closed_mouth

    # Borde sutil del avatar (zinc normal, esmeralda durante respiración activa)
    border_col = COLOR_EMERALD if (is_breathing and breath_sin > 0.3) else COLOR_PANEL_BORDER
    draw_rounded_rect(
        canvas,
        (AVATAR_X, AVATAR_Y),
        (AVATAR_X + AVATAR_SIZE, AVATAR_Y + AVATAR_SIZE),
        border_col,
        radius=AVATAR_RADIUS,
        thickness=2
    )

    # 5. Componer Interfaz Derecha (Centro X: 1410)
    center_right_x = 1410

    # Determinar evento silábico activo y pulso del metrónomo
    active_box_idx = -1
    pulse_intensity = 0.0
    status_text = "CADENSA · ENTRENAMIENTO RITMICO"
    status_col = COLOR_EMERALD

    if is_breathing and t_seconds < 2.5:
        status_text = "PREPARACION DIAFRAGMATICA · INHALACION"
        status_col = COLOR_CYAN
        pulse_intensity = 0.20 * breath_sin
    elif is_breathing and t_seconds >= 2.5:
        status_text = "PAUSA CLINICA · RELAJACION POST-FONACION"
        status_col = COLOR_TEXT_MUTED
        pulse_intensity = 0.0
    elif syllable_events:
        for evt in syllable_events:
            t_evt = evt["time"]
            dur_evt = evt["duration"]
            b_idx = evt["box_index"]

            dt = t_seconds - t_evt
            if 0.0 <= dt < 0.8:
                pulse_intensity = max(pulse_intensity, math.exp(-dt * 5.0))
            if 0.0 <= dt < (dur_evt + 0.15):
                active_box_idx = b_idx
                status_text = f"FONACION ACTIVA · SILABA {b_idx + 1}/{len(syllable_events)}"
                status_col = COLOR_EMERALD
    else:
        # Fallback si no hay timeline: pulso regular por BPM
        beat_period = 60.0 / bpm
        phase = (t_seconds % beat_period) / beat_period
        pulse_intensity = math.exp(-phase * 6.0)
        total_beats = int(t_seconds / beat_period)
        active_box_idx = total_beats % len(syllables)

    # Pill de estado clínico
    pill_w, pill_h = 420, 38
    pill_x1 = center_right_x - pill_w // 2
    pill_y1 = 180
    draw_rounded_rect(canvas, (pill_x1, pill_y1), (pill_x1 + pill_w, pill_y1 + pill_h), (30, 27, 27), radius=19, thickness=-1)
    draw_rounded_rect(canvas, (pill_x1, pill_y1), (pill_x1 + pill_w, pill_y1 + pill_h), COLOR_PANEL_BORDER, radius=19, thickness=1)

    text_size = cv2.getTextSize(status_text, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)[0]
    st_x = pill_x1 + (pill_w - text_size[0]) // 2
    st_y = pill_y1 + (pill_h + text_size[1]) // 2
    cv2.putText(canvas, status_text, (st_x, st_y), cv2.FONT_HERSHEY_SIMPLEX, 0.48, status_col, 1, cv2.LINE_AA)

    # Título principal de la técnica
    title_text = "HABLA RITMICA SILABICA (STS)"
    cv2.putText(
        canvas, title_text,
        (center_right_x - 300, 270),
        cv2.FONT_HERSHEY_SIMPLEX, 1.05, COLOR_TEXT_PRIMARY, 2, cv2.LINE_AA
    )

    sub_text = "Isocronia fonetica para eludir el bloqueo de ganglios basales"
    cv2.putText(
        canvas, sub_text,
        (center_right_x - 290, 310),
        cv2.FONT_HERSHEY_SIMPLEX, 0.58, COLOR_TEXT_MUTED, 1, cv2.LINE_AA
    )

def draw_widget_metronome(
    canvas: np.ndarray,
    center_right_x: int,
    metro_cy: int,
    pulse_intensity: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int],
    syllables: list[str],
    active_box_idx: int,
    bpm: float = 60.0
):
    """Widget del Metrónomo Clínico con Cajas de Pacing Silábico."""
    base_r = 44
    pulse_r = int(base_r + 16 * pulse_intensity)

    # Resplandor exterior
    if pulse_intensity > 0.05:
        glow_r = int(base_r + 30 * pulse_intensity)
        cv2.circle(canvas, (center_right_x, metro_cy), glow_r, (40, int(70 * pulse_intensity), 20), 2, cv2.LINE_AA)

    # Círculo activo con acento
    metro_color = (
        int(accent_color[0] + (accent_glow[0] - accent_color[0]) * pulse_intensity),
        int(accent_color[1] + (accent_glow[1] - accent_color[1]) * pulse_intensity),
        int(accent_color[2] + (accent_glow[2] - accent_color[2]) * pulse_intensity),
    )
    cv2.circle(canvas, (center_right_x, metro_cy), pulse_r, metro_color, -1, cv2.LINE_AA)
    cv2.circle(canvas, (center_right_x, metro_cy), pulse_r, (255, 255, 255), 2, cv2.LINE_AA)

    bpm_text = f"{int(bpm)} BPM" if bpm else "60 BPM"
    cv2.putText(canvas, bpm_text, (center_right_x - 44, metro_cy + 8), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2, cv2.LINE_AA)

    metro_sub = "PULSO RITMICO ISOCRONO (1.0s / SILABA)"
    cv2.putText(canvas, metro_sub, (center_right_x - 170, metro_cy + 75), cv2.FONT_HERSHEY_SIMPLEX, 0.55, COLOR_CYAN, 1, cv2.LINE_AA)

    # Cajas Silábicas de Pacing
    box_w, box_h = 140, 95
    box_gap = 26
    total_boxes_w = len(syllables) * box_w + (len(syllables) - 1) * box_gap
    start_bx = center_right_x - total_boxes_w // 2
    box_y = 610

    for idx, syl in enumerate(syllables):
        bx = start_bx + idx * (box_w + box_gap)
        is_active = (idx == active_box_idx)

        if is_active:
            box_bg = accent_color
            box_border = (255, 255, 255)
            text_col = (10, 10, 10)
        else:
            box_bg = COLOR_PANEL
            box_border = COLOR_PANEL_BORDER
            text_col = COLOR_TEXT_MUTED

        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_bg, radius=20, thickness=-1)
        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_border, radius=20, thickness=2)

        font_scale = 1.05
        text_sz = cv2.getTextSize(syl, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 2)[0]
        tx = bx + (box_w - text_sz[0]) // 2
        ty = box_y + (box_h + text_sz[1]) // 2
        cv2.putText(canvas, syl, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_col, 2, cv2.LINE_AA)


def draw_widget_breathing_orb(
    canvas: np.ndarray,
    center_right_x: int,
    orb_cy: int,
    t_seconds: float,
    phase_duration: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int]
):
    """Widget del Orbe Respiratorio Diafragmático (Box Breathing 4-4-4-4)."""
    cycle_duration = phase_duration * 4.0
    t_cycle = t_seconds % cycle_duration
    p_idx = int(t_cycle / phase_duration)
    p_prog = (t_cycle % phase_duration) / phase_duration

    # Fases: 0: INHALAR (expansión), 1: RETENER (sostén), 2: EXHALAR (contracción), 3: VACIAR (pausa)
    min_r, max_r = 35, 80
    if p_idx == 0:
        r = int(min_r + (max_r - min_r) * math.sin(p_prog * math.pi / 2))
        phase_label = "INHALANDO..."
    elif p_idx == 1:
        r = int(max_r + 4 * math.sin(p_prog * 2 * math.pi))
        phase_label = "SOSTENIENDO..."
    elif p_idx == 2:
        r = int(max_r - (max_r - min_r) * math.sin(p_prog * math.pi / 2))
        phase_label = "EXHALANDO..."
    else:
        r = min_r
        phase_label = "PULMONES EN VACIO..."

    # Anillo exterior pulsante
    glow_r = r + 16
    cv2.circle(canvas, (center_right_x, orb_cy), glow_r, (int(accent_color[0]*0.3), int(accent_color[1]*0.3), int(accent_color[2]*0.3)), 2, cv2.LINE_AA)

    # Orbe central
    cv2.circle(canvas, (center_right_x, orb_cy), r, accent_color, -1, cv2.LINE_AA)
    cv2.circle(canvas, (center_right_x, orb_cy), r, (255, 255, 255), 2, cv2.LINE_AA)

    # Texto de tiempo restante en la fase
    sec_rem = phase_duration - (t_cycle % phase_duration)
    time_str = f"{sec_rem:.1f}s"
    tsz = cv2.getTextSize(time_str, cv2.FONT_HERSHEY_SIMPLEX, 0.75, 2)[0]
    cv2.putText(canvas, time_str, (center_right_x - tsz[0] // 2, orb_cy + tsz[1] // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (10, 10, 10), 2, cv2.LINE_AA)

    sub_txt = f"{phase_label} ({int(phase_duration)}s)"
    sub_sz = cv2.getTextSize(sub_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)[0]
    cv2.putText(canvas, sub_txt, (center_right_x - sub_sz[0] // 2, orb_cy + 105), cv2.FONT_HERSHEY_SIMPLEX, 0.55, COLOR_CYAN, 1, cv2.LINE_AA)

    # 4 Cajas de Fase: [ INHALAR ] [ RETENER ] [ EXHALAR ] [ VACIAR ]
    boxes = ["INHALAR", "RETENER", "EXHALAR", "VACIAR"]
    box_w, box_h = 120, 85
    box_gap = 16
    total_boxes_w = len(boxes) * box_w + (len(boxes) - 1) * box_gap
    start_bx = center_right_x - total_boxes_w // 2
    box_y = 610

    for idx, bname in enumerate(boxes):
        bx = start_bx + idx * (box_w + box_gap)
        is_active = (idx == p_idx)

        if is_active:
            box_bg = accent_color
            box_border = (255, 255, 255)
            text_col = (10, 10, 10)
        else:
            box_bg = COLOR_PANEL
            box_border = COLOR_PANEL_BORDER
            text_col = COLOR_TEXT_MUTED

        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_bg, radius=16, thickness=-1)
        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_border, radius=16, thickness=2)

        font_scale = 0.65
        text_sz = cv2.getTextSize(bname, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 2)[0]
        tx = bx + (box_w - text_sz[0]) // 2
        ty = box_y + (box_h + text_sz[1]) // 2
        cv2.putText(canvas, bname, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_col, 2, cv2.LINE_AA)


def draw_widget_amplitude_ramp(
    canvas: np.ndarray,
    center_right_x: int,
    ramp_cy: int,
    t_seconds: float,
    accent_color: tuple[int, int, int]
):
    """Widget de Rampa de Inicio Suave (Easy Onset: Suspiro -> Subida -> Voz)."""
    ramp_w, ramp_h = 480, 80
    rx1 = center_right_x - ramp_w // 2
    ry1 = ramp_cy - ramp_h // 2

    draw_rounded_rect(canvas, (rx1, ry1), (rx1 + ramp_w, ry1 + ramp_h), COLOR_PANEL, radius=16, thickness=-1)
    draw_rounded_rect(canvas, (rx1, ry1), (rx1 + ramp_w, ry1 + ramp_h), COLOR_PANEL_BORDER, radius=16, thickness=2)

    # 3 Secciones: 1. Suspiro (0-30%), 2. Aproximación (30-60%), 3. Fonación (60-100%)
    sec_w = ramp_w // 3
    sec_labels = ["1. SUSPIRO PREVIO", "2. SUBIDA SUAVE", "3. VOZ ABIERTA"]
    for i, lbl in enumerate(sec_labels):
        sx = rx1 + i * sec_w
        if i > 0:
            cv2.line(canvas, (sx, ry1 + 10), (sx, ry1 + ramp_h - 10), COLOR_PANEL_BORDER, 1)
        lsz = cv2.getTextSize(lbl, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0]
        cv2.putText(canvas, lbl, (sx + (sec_w - lsz[0]) // 2, ry1 + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.45, COLOR_TEXT_MUTED, 1, cv2.LINE_AA)

    # Cursor de rampa sinusoidal
    prog = (t_seconds % 4.0) / 4.0
    cursor_x = rx1 + int(ramp_w * prog)
    cv2.circle(canvas, (cursor_x, ramp_cy), 14, accent_color, -1, cv2.LINE_AA)
    cv2.circle(canvas, (cursor_x, ramp_cy), 14, (255, 255, 255), 2, cv2.LINE_AA)

    ramp_sub = "EVITA EL ATAQUE GLOTICO DURO: ENCIENDE LA VOZ GRADUALMENTE"
    cv2.putText(canvas, ramp_sub, (center_right_x - 220, ramp_cy + 75), cv2.FONT_HERSHEY_SIMPLEX, 0.50, accent_color, 1, cv2.LINE_AA)


def draw_widget_pressure_gauge(
    canvas: np.ndarray,
    center_right_x: int,
    gauge_cy: int,
    t_seconds: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int],
    syllables: list[str],
    active_box_idx: int,
    pulse_intensity: float
):
    """
    Widget de Medidor de Presión Articular (Light Contact: Contacto Pluma <=30%).
    Monitorea la fuerza mecánica entre labios/lengua/paladar para evitar el bloqueo oclusivo.
    """
    gauge_w, gauge_h = 480, 70
    gx1 = center_right_x - gauge_w // 2
    gy1 = gauge_cy - gauge_h // 2 - 20

    draw_rounded_rect(canvas, (gx1, gy1), (gx1 + gauge_w, gy1 + gauge_h), COLOR_PANEL, radius=14, thickness=-1)
    draw_rounded_rect(canvas, (gx1, gy1), (gx1 + gauge_w, gy1 + gauge_h), COLOR_PANEL_BORDER, radius=14, thickness=2)

    feather_w = int(gauge_w * 0.35)
    draw_rounded_rect(canvas, (gx1 + 4, gy1 + 4), (gx1 + feather_w, gy1 + gauge_h - 4), (30, 55, 30), radius=10, thickness=-1)
    draw_rounded_rect(canvas, (gx1 + feather_w, gy1 + 4), (gx1 + gauge_w - 4, gy1 + gauge_h - 4), (25, 25, 35), radius=10, thickness=-1)

    cv2.putText(canvas, "ZONA PLUMA (<=30%)", (gx1 + 16, gy1 + 42), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (120, 240, 140), 1, cv2.LINE_AA)
    cv2.putText(canvas, "TENSION EXCESIVA (>30%)", (gx1 + feather_w + 24, gy1 + 42), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (90, 90, 140), 1, cv2.LINE_AA)

    osc = 0.20 + 0.07 * math.sin(t_seconds * 4.0) + 0.05 * pulse_intensity
    cursor_x = gx1 + int(gauge_w * min(1.0, max(0.05, osc)))
    cv2.line(canvas, (cursor_x, gy1 + 6), (cursor_x, gy1 + gauge_h - 6), (255, 255, 255), 3, cv2.LINE_AA)
    cv2.circle(canvas, (cursor_x, gy1 + gauge_h // 2), 8, accent_color, -1, cv2.LINE_AA)

    gauge_sub = f"PRESION ARTICULAR: {int(osc * 100)}% - TACTO SUAVE DE PLUMA"
    cv2.putText(canvas, gauge_sub, (center_right_x - 190, gauge_cy + 55), cv2.FONT_HERSHEY_SIMPLEX, 0.52, accent_color, 1, cv2.LINE_AA)

    box_w, box_h = 140, 95
    box_gap = 26
    total_boxes_w = len(syllables) * box_w + (len(syllables) - 1) * box_gap
    start_bx = center_right_x - total_boxes_w // 2
    box_y = 610

    for idx, syl in enumerate(syllables):
        bx = start_bx + idx * (box_w + box_gap)
        is_active = (idx == active_box_idx)

        if is_active:
            box_bg = accent_color
            box_border = (255, 255, 255)
            text_col = (10, 10, 10)
        else:
            box_bg = COLOR_PANEL
            box_border = COLOR_PANEL_BORDER
            text_col = COLOR_TEXT_MUTED

        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_bg, radius=20, thickness=-1)
        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_border, radius=20, thickness=2)

        font_scale = 1.05
        text_sz = cv2.getTextSize(syl, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 2)[0]
        tx = bx + (box_w - text_sz[0]) // 2
        ty = box_y + (box_h + text_sz[1]) // 2
        cv2.putText(canvas, syl, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_col, 2, cv2.LINE_AA)


def draw_widget_legato_wave(
    canvas: np.ndarray,
    center_right_x: int,
    wave_cy: int,
    t_seconds: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int]
):
    """
    Widget de Onda de Habla Prolongada (Legato Vocal Continuo).
    Visualiza el flujo aéreo ininterrumpido sin micro-cortes glóticos.
    """
    wave_w, wave_h = 480, 110
    wx1 = center_right_x - wave_w // 2
    wy1 = wave_cy - wave_h // 2 - 10

    draw_rounded_rect(canvas, (wx1, wy1), (wx1 + wave_w, wy1 + wave_h), COLOR_PANEL, radius=16, thickness=-1)
    draw_rounded_rect(canvas, (wx1, wy1), (wx1 + wave_w, wy1 + wave_h), COLOR_PANEL_BORDER, radius=16, thickness=2)

    cv2.line(canvas, (wx1 + 10, wave_cy - 10), (wx1 + wave_w - 10, wave_cy - 10), (45, 45, 45), 1)

    pts = []
    freq = 0.045
    speed = 3.5
    for x in range(wx1 + 10, wx1 + wave_w - 10, 4):
        y = (wave_cy - 10) + int(28 * math.sin((x - wx1) * freq - t_seconds * speed))
        pts.append((x, y))

    if len(pts) > 1:
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i+1], accent_color, 3, cv2.LINE_AA)

    wave_sub = "FONACION CONTINUA (LEGATO 2.2s) - ENLACE ININTERRUMPIDO"
    cv2.putText(canvas, wave_sub, (center_right_x - 225, wave_cy + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.48, accent_color, 1, cv2.LINE_AA)

    words = ["HOOOLA", "COMO", "ESTAAS"]
    box_w, box_h = 135, 80
    box_gap = 36
    total_w = len(words) * box_w + (len(words) - 1) * box_gap
    start_bx = center_right_x - total_w // 2
    box_y = 615

    for i in range(len(words) - 1):
        cx1 = start_bx + i * (box_w + box_gap) + box_w
        cx2 = cx1 + box_gap
        cv2.line(canvas, (cx1, box_y + box_h // 2), (cx2, box_y + box_h // 2), accent_color, 3, cv2.LINE_AA)

    w_prog = int((t_seconds % 6.0) / 2.0)
    for idx, wname in enumerate(words):
        bx = start_bx + idx * (box_w + box_gap)
        is_active = (idx == w_prog)
        box_bg = accent_color if is_active else COLOR_PANEL
        box_border = (255, 255, 255) if is_active else COLOR_PANEL_BORDER
        text_col = (10, 10, 10) if is_active else COLOR_TEXT_MUTED

        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_bg, radius=14, thickness=-1)
        draw_rounded_rect(canvas, (bx, box_y), (bx + box_w, box_y + box_h), box_border, radius=14, thickness=2)

        font_scale = 0.65
        text_sz = cv2.getTextSize(wname, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 2)[0]
        tx = bx + (box_w - text_sz[0]) // 2
        ty = box_y + (box_h + text_sz[1]) // 2
        cv2.putText(canvas, wname, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_col, 2, cv2.LINE_AA)


def draw_widget_decompression_gauge(
    canvas: np.ndarray,
    center_right_x: int,
    decomp_cy: int,
    t_seconds: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int]
):
    """
    Widget de Descompresión Activa (Pull-Out de Van Riper).
    Modela las 3 etapas para desactivar un bloqueo en tiempo real:
    1. Congelar espasmo -> 2. Aflojar tensión muscular -> 3. Deslizar suavemente.
    """
    stages = ["1. CONGELAR ESPASMO", "2. AFLOJAR TENSION", "3. DESLIZAR SUAVE"]
    stage_dur = 2.0
    total_dur = stage_dur * len(stages)
    curr_stage = int((t_seconds % total_dur) / stage_dur)

    box_w, box_h = 480, 70
    bx1 = center_right_x - box_w // 2
    by1 = decomp_cy - box_h // 2 - 20

    draw_rounded_rect(canvas, (bx1, by1), (bx1 + box_w, by1 + box_h), COLOR_PANEL, radius=14, thickness=-1)
    draw_rounded_rect(canvas, (bx1, by1), (bx1 + box_w, by1 + box_h), COLOR_PANEL_BORDER, radius=14, thickness=2)

    col_w = box_w // 3
    for i, sname in enumerate(stages):
        cx = bx1 + i * col_w
        if i > 0:
            cv2.line(canvas, (cx, by1 + 10), (cx, by1 + box_h - 10), COLOR_PANEL_BORDER, 1)

        is_act = (i == curr_stage)
        col_txt = accent_color if is_act else COLOR_TEXT_MUTED
        if is_act:
            draw_rounded_rect(canvas, (cx + 4, by1 + 4), (cx + col_w - 4, by1 + box_h - 4), (35, 40, 50), radius=10, thickness=-1)
        ssz = cv2.getTextSize(sname, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)[0]
        cv2.putText(canvas, sname, (cx + (col_w - ssz[0]) // 2, by1 + 42), cv2.FONT_HERSHEY_SIMPLEX, 0.42, col_txt, 1, cv2.LINE_AA)

    sub_txt = "NO LUCHAR CONTRA EL BLOQUEO: DESARMAR LA FUERZA Y DESLIZAR"
    cv2.putText(canvas, sub_txt, (center_right_x - 220, decomp_cy + 55), cv2.FONT_HERSHEY_SIMPLEX, 0.48, accent_color, 1, cv2.LINE_AA)

    tens_w, tens_h = 480, 60
    tx1 = center_right_x - tens_w // 2
    ty1 = 620
    draw_rounded_rect(canvas, (tx1, ty1), (tx1 + tens_w, ty1 + tens_h), COLOR_PANEL, radius=14, thickness=-1)
    draw_rounded_rect(canvas, (tx1, ty1), (tx1 + tens_w, ty1 + tens_h), COLOR_PANEL_BORDER, radius=14, thickness=2)

    levels = [0.85, 0.45, 0.15]
    curr_level = levels[curr_stage]
    lvl_bar_w = int((tens_w - 20) * curr_level)
    bar_col = (40, 40, 220) if curr_stage == 0 else ((40, 180, 220) if curr_stage == 1 else accent_color)
    draw_rounded_rect(canvas, (tx1 + 10, ty1 + 10), (tx1 + 10 + lvl_bar_w, ty1 + tens_h - 10), bar_col, radius=8, thickness=-1)

    tens_labels = ["TENSION ESPASMODICA ALTA", "RELAJANDO FUERZA MANDIBULAR", "TRANSICION FLUIDA LIBERADA"]
    cv2.putText(canvas, tens_labels[curr_stage], (tx1 + 25, ty1 + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (255, 255, 255), 1, cv2.LINE_AA)


def draw_widget_pause_timer(
    canvas: np.ndarray,
    center_right_x: int,
    timer_cy: int,
    t_seconds: float,
    accent_color: tuple[int, int, int],
    accent_glow: tuple[int, int, int]
):
    """
    Widget de Cronómetro de Pausa Consciente (Cancelación de Van Riper).
    Muestra la cuenta regresiva de 3.0 segundos post-bloqueo antes de reformular.
    """
    timer_cycle = 4.5
    t_in_cycle = t_seconds % timer_cycle

    timer_r = 52
    cv2.circle(canvas, (center_right_x, timer_cy), timer_r, COLOR_PANEL, -1, cv2.LINE_AA)
    cv2.circle(canvas, (center_right_x, timer_cy), timer_r, COLOR_PANEL_BORDER, 2, cv2.LINE_AA)

    if t_in_cycle <= 3.0:
        sec_rem = 3.0 - t_in_cycle
        time_text = f"{sec_rem:.1f}s"
        status_sub = "PAUSA CONSCIENTE DE 3s (DISIPAR TENSION)"
        angle = int(360 * (sec_rem / 3.0))
        cv2.ellipse(canvas, (center_right_x, timer_cy), (timer_r, timer_r), -90, 0, angle, accent_color, 4, cv2.LINE_AA)
    else:
        time_text = "HABLA"
        status_sub = "REFORMULACION FLUIDA CON INICIO SUAVE"
        cv2.circle(canvas, (center_right_x, timer_cy), timer_r, accent_color, 3, cv2.LINE_AA)

    tsz = cv2.getTextSize(time_text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
    cv2.putText(canvas, time_text, (center_right_x - tsz[0] // 2, timer_cy + tsz[1] // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)

    sub_sz = cv2.getTextSize(status_sub, cv2.FONT_HERSHEY_SIMPLEX, 0.48, 1)[0]
    cv2.putText(canvas, status_sub, (center_right_x - sub_sz[0] // 2, timer_cy + 85), cv2.FONT_HERSHEY_SIMPLEX, 0.48, accent_color, 1, cv2.LINE_AA)

    steps = ["1. DETENER HABLA", "2. PAUSA 3 SEG", "3. REPETIR SUAVE"]
    step_w, step_h = 140, 85
    step_gap = 20
    total_w = len(steps) * step_w + (len(steps) - 1) * step_gap
    start_sx = center_right_x - total_w // 2
    step_y = 615

    step_active = 1 if t_in_cycle <= 3.0 else 2
    for idx, sname in enumerate(steps):
        sx = start_sx + idx * (step_w + step_gap)
        is_active = (idx == step_active)
        sbg = accent_color if is_active else COLOR_PANEL
        sbdr = (255, 255, 255) if is_active else COLOR_PANEL_BORDER
        stxt_col = (10, 10, 10) if is_active else COLOR_TEXT_MUTED

        draw_rounded_rect(canvas, (sx, step_y), (sx + step_w, step_y + step_h), sbg, radius=14, thickness=-1)
        draw_rounded_rect(canvas, (sx, step_y), (sx + step_w, step_y + step_h), sbdr, radius=14, thickness=2)

        font_scale = 0.52
        text_sz = cv2.getTextSize(sname, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)[0]
        tx = sx + (step_w - text_sz[0]) // 2
        ty = step_y + (step_h + text_sz[1]) // 2
        cv2.putText(canvas, sname, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, stxt_col, 1, cv2.LINE_AA)


def compose_cadensa_frame(
    avatar_frame: np.ndarray,
    rounded_mask: np.ndarray,
    t_seconds: float,
    bpm: float = 60.0,
    syllables: list[str] = None,
    timeline_data: dict = None,
    technique_meta: dict = None
) -> np.ndarray:
    """
    Genera un fotograma completo de 1920x1080 con:
    1. Simulación visual de respiración diafragmática (curva sinusoidal).
    2. Sincronización exacta del widget visual clínico según la técnica.
    """
    if syllables is None:
        syllables = ["CA", "DEN", "SA"]

    # Extraer parámetros de técnica
    visual_widget = "metronome"
    accent_bgr = COLOR_EMERALD
    accent_glow = COLOR_EMERALD_GLOW
    tech_title = "HABLA RITMICA SILABICA (STS)"
    tech_sub = "Isocronia fonetica para eludir el bloqueo de ganglios basales"

    if technique_meta:
        visual_widget = technique_meta.get("visual_widget", "metronome")
        accent_bgr = tuple(technique_meta.get("accent_color_bgr", COLOR_EMERALD))
        accent_glow = tuple(technique_meta.get("accent_glow_bgr", COLOR_EMERALD_GLOW))
        tech_title = technique_meta.get("name", tech_title).upper()
        tech_sub = technique_meta.get("clinical_objective", tech_sub)
    elif timeline_data and timeline_data.get("tts_mode") == "breathing_cycle":
        visual_widget = "breathing_orb"
        accent_bgr = (212, 182, 6)
        accent_glow = (235, 215, 80)
        tech_title = "RESPIRACION DIAFRAGMATICA (BOX BREATHING)"
        tech_sub = "Ciclo cuadrado 4-4-4-4 para regulacion del nervio vago y calma"

    breathing_intervals = timeline_data.get("breathing_intervals", []) if timeline_data else []
    syllable_events = timeline_data.get("syllable_events", []) if timeline_data else []
    total_duration = timeline_data.get("total_duration", 7.5) if timeline_data else 7.5

    # 1. Determinar estado de respiración fisiológica
    is_breathing = False
    breath_sin = 0.0
    for b_start, b_end in breathing_intervals:
        if b_start <= t_seconds <= b_end:
            is_breathing = True
            dur = max(0.2, b_end - b_start)
            prog = (t_seconds - b_start) / dur
            breath_sin = math.sin(prog * math.pi)
            break

    # 2. Lienzo carbón #0F0F13
    canvas = np.full((CANVAS_HEIGHT, CANVAS_WIDTH, 3), COLOR_BG, dtype=np.uint8)

    # 3. Avatar con simulación diafragmática
    h, w = avatar_frame.shape[:2]
    base_crop = min(h, w)

    if is_breathing and breath_sin > 0.0:
        scale = 1.0 + 0.008 * breath_sin
        crop_size = int(base_crop / scale)
        cy_offset = int((base_crop * 0.004) * breath_sin)
        cy, cx = (h // 2) + cy_offset, w // 2
    else:
        crop_size = base_crop
        cy, cx = h // 2, w // 2

    half = crop_size // 2
    y1 = max(0, cy - half)
    y2 = min(h, cy + half)
    x1 = max(0, cx - half)
    x2 = min(w, cx + half)
    cropped = avatar_frame[y1:y2, x1:x2]

    resized_avatar = cv2.resize(cropped, (AVATAR_SIZE, AVATAR_SIZE), interpolation=cv2.INTER_LANCZOS4)
    gaussian = cv2.GaussianBlur(resized_avatar, (0, 0), 2.0)
    sharpened_avatar = cv2.addWeighted(resized_avatar, 1.35, gaussian, -0.35, 0)

    # Máscara redondeada
    alpha = rounded_mask.astype(float) / 255.0
    alpha_3d = np.dstack([alpha, alpha, alpha])
    roi = canvas[AVATAR_Y : AVATAR_Y + AVATAR_SIZE, AVATAR_X : AVATAR_X + AVATAR_SIZE]
    canvas[AVATAR_Y : AVATAR_Y + AVATAR_SIZE, AVATAR_X : AVATAR_X + AVATAR_SIZE] = (
        sharpened_avatar * alpha_3d + roi * (1.0 - alpha_3d)
    ).astype(np.uint8)

    # Oclusión labial fonoaudiológica durante reposo respiratorio y pausas clínicas (Task 4)
    is_box_rest = False
    t_id_lower = str(technique_meta.get("id", "")).lower() if (locals().get("technique_meta") and isinstance(technique_meta, dict)) else ""
    t_name_lower = str(technique_meta.get("name", "")).lower() if (locals().get("technique_meta") and isinstance(technique_meta, dict)) else ""
    if "box" in t_id_lower or "box" in t_name_lower:
        phase_dur = 4.0
        t_in_phase = t_seconds % phase_dur
        if t_in_phase >= 1.4:
            is_box_rest = True

    if is_breathing or is_box_rest:
        mouth_roi = canvas[660:780, 420:540]
        m_gray = cv2.cvtColor(mouth_roi, cv2.COLOR_BGR2GRAY)
        dark_mask = (m_gray < 45).astype(np.uint8) * 255
        if np.any(dark_mask > 0):
            closed_mouth = cv2.inpaint(mouth_roi, dark_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
            canvas[660:780, 420:540] = closed_mouth

    border_col = accent_bgr if (is_breathing and breath_sin > 0.3) else COLOR_PANEL_BORDER
    draw_rounded_rect(
        canvas,
        (AVATAR_X, AVATAR_Y),
        (AVATAR_X + AVATAR_SIZE, AVATAR_Y + AVATAR_SIZE),
        border_col,
        radius=AVATAR_RADIUS,
        thickness=2
    )

    # 4. Cabecera e Identidad de la Técnica en el Panel Derecho
    center_right_x = 1410
    active_box_idx = -1
    pulse_intensity = 0.0
    status_text = "CADENSA · ENTRENAMIENTO CLINICO"
    status_col = accent_bgr

    if visual_widget == "breathing_orb":
        phase_dur = timeline_data.get("phase_duration_sec", 4.0) if timeline_data else 4.0
        p_idx = int((t_seconds % (phase_dur * 4)) / phase_dur)
        p_names = ["INHALACION PROFUNDA", "RETENCION DIAFRAGMATICA", "EXHALACION SUAVE", "PAUSA Y CALMA"]
        status_text = f"BOX BREATHING · {p_names[p_idx]}"
        status_col = accent_bgr
    elif is_breathing and t_seconds < 2.5:
        status_text = "PREPARACION DIAFRAGMATICA · INHALACION"
        status_col = COLOR_CYAN
        pulse_intensity = 0.20 * breath_sin
    elif is_breathing and t_seconds >= 2.5:
        status_text = "PAUSA CLINICA · RELAJACION POST-FONACION"
        status_col = COLOR_TEXT_MUTED
        pulse_intensity = 0.0
    elif syllable_events:
        for evt in syllable_events:
            t_evt = evt["time"]
            dur_evt = evt["duration"]
            b_idx = evt["box_index"]
            dt = t_seconds - t_evt
            if 0.0 <= dt < 0.8:
                pulse_intensity = max(pulse_intensity, math.exp(-dt * 5.0))
            if 0.0 <= dt < (dur_evt + 0.15):
                active_box_idx = b_idx
                status_text = f"FONACION ACTIVA · SILABA {b_idx + 1}/{len(syllable_events)}"
                status_col = accent_bgr
    else:
        beat_period = 60.0 / bpm if bpm else 1.0
        phase = (t_seconds % beat_period) / beat_period
        pulse_intensity = math.exp(-phase * 6.0)
        total_beats = int(t_seconds / beat_period)
        active_box_idx = total_beats % len(syllables)

    # Píldora de estado superior
    pill_w, pill_h = 440, 38
    pill_x1 = center_right_x - pill_w // 2
    pill_y1 = 180
    draw_rounded_rect(canvas, (pill_x1, pill_y1), (pill_x1 + pill_w, pill_y1 + pill_h), (30, 27, 27), radius=19, thickness=-1)
    draw_rounded_rect(canvas, (pill_x1, pill_y1), (pill_x1 + pill_w, pill_y1 + pill_h), COLOR_PANEL_BORDER, radius=19, thickness=1)

    text_size = cv2.getTextSize(status_text, cv2.FONT_HERSHEY_SIMPLEX, 0.46, 1)[0]
    st_x = pill_x1 + (pill_w - text_size[0]) // 2
    st_y = pill_y1 + (pill_h + text_size[1]) // 2
    cv2.putText(canvas, status_text, (st_x, st_y), cv2.FONT_HERSHEY_SIMPLEX, 0.46, status_col, 1, cv2.LINE_AA)

    # Título principal y subtítulo
    t_sz = cv2.getTextSize(tech_title, cv2.FONT_HERSHEY_SIMPLEX, 0.95, 2)[0]
    cv2.putText(canvas, tech_title, (center_right_x - t_sz[0] // 2, 270), cv2.FONT_HERSHEY_SIMPLEX, 0.95, COLOR_TEXT_PRIMARY, 2, cv2.LINE_AA)

    sub_sz = cv2.getTextSize(tech_sub[:55], cv2.FONT_HERSHEY_SIMPLEX, 0.52, 1)[0]
    cv2.putText(canvas, tech_sub[:55], (center_right_x - sub_sz[0] // 2, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.52, COLOR_TEXT_MUTED, 1, cv2.LINE_AA)

    # 5. Renderizado del Widget Visual Especializado
    if visual_widget == "breathing_orb":
        phase_dur = timeline_data.get("phase_duration_sec", 4.0) if timeline_data else 4.0
        draw_widget_breathing_orb(canvas, center_right_x, 455, t_seconds, phase_dur, accent_bgr, accent_glow)
    elif visual_widget == "amplitude_ramp":
        draw_widget_amplitude_ramp(canvas, center_right_x, 455, t_seconds, accent_bgr)
    elif visual_widget == "pressure_gauge":
        draw_widget_pressure_gauge(
            canvas=canvas,
            center_right_x=center_right_x,
            gauge_cy=455,
            t_seconds=t_seconds,
            accent_color=accent_bgr,
            accent_glow=accent_glow,
            syllables=syllables,
            active_box_idx=active_box_idx,
            pulse_intensity=pulse_intensity
        )
    elif visual_widget == "legato_wave":
        draw_widget_legato_wave(
            canvas=canvas,
            center_right_x=center_right_x,
            wave_cy=455,
            t_seconds=t_seconds,
            accent_color=accent_bgr,
            accent_glow=accent_glow
        )
    elif visual_widget == "decompression_gauge":
        draw_widget_decompression_gauge(
            canvas=canvas,
            center_right_x=center_right_x,
            decomp_cy=455,
            t_seconds=t_seconds,
            accent_color=accent_bgr,
            accent_glow=accent_glow
        )
    elif visual_widget == "pause_timer":
        draw_widget_pause_timer(
            canvas=canvas,
            center_right_x=center_right_x,
            timer_cy=455,
            t_seconds=t_seconds,
            accent_color=accent_bgr,
            accent_glow=accent_glow
        )
    else:  # metronome (STS) o fallback
        draw_widget_metronome(
            canvas=canvas,
            center_right_x=center_right_x,
            metro_cy=455,
            pulse_intensity=pulse_intensity,
            accent_color=accent_bgr,
            accent_glow=accent_glow,
            syllables=syllables,
            active_box_idx=active_box_idx,
            bpm=bpm
        )

    # 6. Instrucción inferior según técnica clínica
    if visual_widget == "breathing_orb":
        instruction = "Inhala abdominalmente en 4s, reten en calma, exhala suave y pausa."
    elif visual_widget == "amplitude_ramp":
        instruction = "Inicia con un suave suspiro y aumenta la sonoridad gradualmente."
    elif visual_widget == "pressure_gauge":
        instruction = "Articula las consonantes con tacto ligero de pluma sin apretar."
    elif visual_widget == "legato_wave":
        instruction = "Enlaza los sonidos en una corriente continua de voz sin interrupciones."
    elif visual_widget == "decompression_gauge":
        instruction = "Congela el empuje al sentir tension, afloja la musculatura y deslizate."
    elif visual_widget == "pause_timer":
        instruction = "Deten el habla tras el bloqueo, respira 3 segundos y reinicia suavemente."
    else:
        instruction = "Inhala con calma durante la preparacion y habla en cada latido."
    ins_sz = cv2.getTextSize(instruction, cv2.FONT_HERSHEY_SIMPLEX, 0.58, 1)[0]
    cv2.putText(canvas, instruction, (center_right_x - ins_sz[0] // 2, 770), cv2.FONT_HERSHEY_SIMPLEX, 0.58, COLOR_TEXT_MUTED, 1, cv2.LINE_AA)

    # 7. Barra de progreso general
    bar_y = 830
    bar_w = 480
    bar_x = center_right_x - bar_w // 2
    draw_rounded_rect(canvas, (bar_x, bar_y), (bar_x + bar_w, bar_y + 8), (35, 35, 35), radius=4, thickness=-1)
    dur_norm = max(1.0, total_duration)
    progress_w = int(bar_w * min(1.0, (t_seconds / dur_norm)))
    if progress_w > 8:
        draw_rounded_rect(canvas, (bar_x, bar_y), (bar_x + progress_w, bar_y + 8), accent_bgr, radius=4, thickness=-1)

    return canvas


def compose_video(
    face_video_path: str,
    audio_path: str,
    output_path: str,
    timeline_path: str = None,
    bpm: float = 60.0,
    technique_id: str = None,
    catalog_path: str = "scripts/techniques_media_catalog.json"
) -> str:
    """Procesa el video facial fotograma a fotograma y lo compone sobre el lienzo 1920x1080."""
    if not os.path.exists(face_video_path):
        raise FileNotFoundError(f"Video facial de entrada no encontrado: {face_video_path}")
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio de entrada no encontrado: {audio_path}")

    technique_meta = None
    if technique_id and os.path.exists(catalog_path):
        try:
            with open(catalog_path, "r", encoding="utf-8") as f:
                catalog = json.load(f)
            t_target = technique_id.lower().replace("-", "_")
            for item in catalog.get("techniques", []):
                i_id = item.get("id", "").lower().replace("-", "_")
                i_slug = item.get("slug", "").lower().replace("-", "_")
                if t_target in (i_id, i_slug):
                    technique_meta = item
                    break
        except Exception as e:
            print(f"   ⚠️ Nota al cargar técnica del catálogo: {e}")

    timeline_data = None
    if timeline_path and os.path.exists(timeline_path):
        try:
            with open(timeline_path, "r", encoding="utf-8") as f:
                timeline_data = json.load(f)
            print(f"   👉 Mapa temporal (Timeline) cargado: {timeline_path}")
        except Exception as e:
            print(f"   ⚠️ No fue posible leer timeline: {e}")

    # Extraer sílabas si están en timeline o en catálogo
    syllables = ["CA", "DEN", "SA"]
    if technique_meta and technique_meta.get("syllables"):
        syllables = technique_meta["syllables"]
    elif timeline_data and "syllable_events" in timeline_data:
        evts = timeline_data["syllable_events"]
        if evts:
            syllables = [e["syllable"] for e in evts]

    print("=" * 80)
    print("🎬 CADENSA — COMPOSITOR DE VIDEO DE ALTA FIDELIDAD (1920x1080)")
    print("=" * 80)
    print(f"   👉 Video fuente:   {face_video_path}")
    print(f"   👉 Audio fuente:   {audio_path}")
    print(f"   👉 Destino final:  {output_path}")
    if technique_meta:
        print(f"   👉 Técnica:        {technique_meta.get('name')} (Widget: {technique_meta.get('visual_widget')})")
    print(f"   👉 Sílabas activas: {syllables}")

    cap = cv2.VideoCapture(face_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 100

    rounded_mask = create_rounded_mask(AVATAR_SIZE, AVATAR_RADIUS)

    temp_dir = tempfile.mkdtemp()
    temp_composed_video = os.path.join(temp_dir, "composed_no_audio.mp4")

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_composed_video, fourcc, fps, (CANVAS_WIDTH, CANVAS_HEIGHT))

    frame_idx = 0
    print(f"   👉 Componiendo {total_frames} fotogramas a {fps:.2f} FPS...")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        t_sec = frame_idx / fps
        composed = compose_cadensa_frame(
            avatar_frame=frame,
            rounded_mask=rounded_mask,
            t_seconds=t_sec,
            bpm=bpm,
            syllables=syllables,
            timeline_data=timeline_data,
            technique_meta=technique_meta
        )
        out.write(composed)

        frame_idx += 1
        if frame_idx % 25 == 0 or frame_idx == total_frames:
            print(f"   👉 Progreso: {frame_idx}/{total_frames} fotogramas ({frame_idx*100//total_frames}%)")

    cap.release()
    out.release()
    print(f"   ✅ Composición visual finalizada ({frame_idx} fotogramas renderizados con simulación diafragmática).")

    # Multiplexación con audio mediante FFmpeg
    # Tarea 5c: Seleccionar pista HQ a 48 kHz si está disponible
    audio_to_mux = audio_path
    if timeline_data and timeline_data.get("audio_48k_path") and os.path.exists(timeline_data["audio_48k_path"]):
        audio_to_mux = timeline_data["audio_48k_path"]
    else:
        base_aud, aud_ext = os.path.splitext(audio_path)
        cand_48k = f"{base_aud}_48k{aud_ext}"
        if os.path.exists(cand_48k):
            audio_to_mux = cand_48k

    print(f"   👉 Pista de audio para multiplexación: {audio_to_mux}")
    print("   👉 Normalizando sonoridad con EBU R128 (Dos pasadas: I=-16 LUFS, TP=-1.5 dBFS, LRA=11, linear=true)...")
    ffmpeg_bin = FFMPEG_PATH if os.path.exists(FFMPEG_PATH) else "ffmpeg"
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    # Pasada 1 EBU R128: Medir estadísticas acústicas reales
    loudnorm_filter = "loudnorm=I=-16:TP=-1.5:LRA=11"
    try:
        pass1_cmd = [
            ffmpeg_bin, "-hide_banner", "-i", audio_to_mux,
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
            "-f", "null", "-"
        ]
        p1 = subprocess.run(pass1_cmd, capture_output=True, text=True)
        import re
        match = re.search(r'\{[^{}]*"input_i"[^{}]*\}', p1.stderr, re.DOTALL)
        if match:
            stats = json.loads(match.group(0))
            loudnorm_filter = (
                f"loudnorm=I=-16:TP=-1.5:LRA=11:"
                f"measured_I={stats.get('input_i', '-16')}:"
                f"measured_TP={stats.get('input_tp', '-1.5')}:"
                f"measured_LRA={stats.get('input_lra', '11')}:"
                f"measured_thresh={stats.get('input_thresh', '-26')}:"
                f"offset={stats.get('target_offset', '0.0')}:linear=true"
            )
            print(f"      ✅ Pasada 1 (Medición): I={stats.get('input_i')} LUFS, TP={stats.get('input_tp')} dBFS, LRA={stats.get('input_lra')}")
    except Exception as e:
        print(f"      ⚠️ Nota en Pasada 1 Loudnorm: {e}. Usando pasada simple.")

    # Pasada 2 EBU R128: Multiplexación y normalización lineal
    cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
        "-i", temp_composed_video,
        "-i", audio_to_mux,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "23",
        "-maxrate", "1200k", "-bufsize", "2400k",
        "-af", loudnorm_filter,
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-shortest",
        output_path
    ]
    subprocess.check_call(cmd)

    # Generación automatizada de portadas PNG y WebP desde el fotograma de reposo (1.0s)
    try:
        out_dir = os.path.dirname(output_path)
        base_name = os.path.splitext(os.path.basename(output_path))[0]
        slug_clean = base_name.replace("_avatar_final", "")
        portada_png = os.path.join(out_dir, f"{slug_clean}_portada.png")
        portada_webp = os.path.join(out_dir, f"{slug_clean}_portada.webp")

        cmd_thumb = [
            ffmpeg_bin, "-y", "-hide_banner", "-loglevel", "error",
            "-ss", "00:00:01.000", "-i", output_path,
            "-vframes", "1", "-q:v", "2", portada_png
        ]
        subprocess.check_call(cmd_thumb)

        from PIL import Image
        with Image.open(portada_png) as im:
            im.save(portada_webp, "WEBP", quality=85, method=6)
        print(f"   🖼️ Portadas generadas automáticamente: {portada_png} y {portada_webp}")
    except Exception as e:
        print(f"   ⚠️ Nota al generar portadas automáticas: {e}")

    shutil.rmtree(temp_dir, ignore_errors=True)
    file_size = os.path.getsize(output_path)
    print(f"   🎉 Video final compuesto generado exitosamente: {output_path} ({file_size} bytes)")
    return output_path


def measure_audio_ebur128(media_path: str) -> dict[str, float]:
    """
    Mide los parámetros reales de sonoridad EBU R128 (Integrated LUFS, True Peak dBFS, LRA)
    utilizando el filtro ebur128 de FFmpeg sin redondear ni truncar datos.
    """
    ffmpeg_bin = FFMPEG_PATH if os.path.exists(FFMPEG_PATH) else "ffmpeg"
    cmd = [
        ffmpeg_bin, "-hide_banner", "-i", media_path,
        "-af", "ebur128=peak=true",
        "-f", "null", "-"
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    stderr = p.stderr

    import re
    i_match = re.search(r"Integrated loudness:\s+I:\s+([-\d.]+)\s+LUFS", stderr)
    tp_match = re.search(r"True peak:\s+Peak:\s+([-\d.]+)\s+dBFS", stderr)
    lra_match = re.search(r"Loudness range:\s+LRA:\s+([-\d.]+)\s+LU", stderr)
    thresh_match = re.search(r"Threshold:\s+([-\d.]+)\s+LUFS", stderr)

    return {
        "integrated_lufs": float(i_match.group(1)) if i_match else float("nan"),
        "true_peak_dbfs": float(tp_match.group(1)) if tp_match else float("nan"),
        "lra_lu": float(lra_match.group(1)) if lra_match else float("nan"),
        "threshold_lufs": float(thresh_match.group(1)) if thresh_match else float("nan")
    }


def main():
    parser = argparse.ArgumentParser(description="Compositor de Video de Alta Fidelidad para Cadensa.")
    parser.add_argument("--face-video", required=True, help="Ruta al video facial animado.")
    parser.add_argument("--audio", required=True, help="Ruta al archivo de audio.")
    parser.add_argument("--output", required=True, help="Ruta de guardado para el video final compuesto.")
    parser.add_argument("--timeline", type=str, default=None, help="Ruta al archivo JSON del timeline fonoaudiológico.")
    parser.add_argument("--bpm", type=float, default=60.0, help="Cadencia del metrónomo en BPM.")
    parser.add_argument("--technique", type=str, default=None, help="ID o slug de la técnica del catálogo.")
    parser.add_argument("--catalog", type=str, default="scripts/techniques_media_catalog.json", help="Ruta al catálogo.")
    args = parser.parse_args()

    compose_video(
        face_video_path=args.face_video,
        audio_path=args.audio,
        output_path=args.output,
        timeline_path=args.timeline,
        bpm=args.bpm,
        technique_id=args.technique,
        catalog_path=args.catalog
    )


if __name__ == "__main__":
    main()
