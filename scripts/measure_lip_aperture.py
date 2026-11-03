#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Análisis Fonoaudiológico de Apertura Labial y Sincronía Audiovisual
https://cadensa-web.pages.dev/

Convención Canónica de Signo para Desfase Temporal (Lag):
- lag < 0 (Desfase Negativo / Anticipación Articulada Fisiológica):
  El avatar abre o modula la boca ANTES de la emisión sonora audible.
  Ejemplo: lag = -120 ms significa que la boca se abre 120 ms antes del sonido.
- lag > 0 (Desfase Positivo / Reacción Labial Retardada):
  El avatar modula la boca DESPUÉS de la señal acústica audible.
- lag = 0 (Sincronía Estricta):
  Coincidencia temporal directa fotograma a fotograma.
"""

from __future__ import annotations
import os
import sys
import json
import wave
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


def compute_dark_cavity_aperture(video_path: str, fps: float = 25.0) -> list[float]:
    """Calcula la apertura labial vertical basada en píxeles de cavidad oscura."""
    cap = cv2.VideoCapture(video_path)
    apertures = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Boca del avatar en lienzo institucional: [640:780, 420:540]
        mouth = frame[640:780, 420:540]
        gray = cv2.cvtColor(mouth, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY_INV)[1]
        center_cols = thresh[:, thresh.shape[1] // 4: 3 * thresh.shape[1] // 4]
        vert_open = float(np.sum(center_cols > 0) / max(1, center_cols.shape[1]))
        apertures.append(vert_open)
    cap.release()
    return apertures


def compute_landmark_mar_inner_series(video_path: str, fa_model=None) -> list[float] | None:
    """
    Calcula la serie temporal de apertura labial normalizada (MAR_inner) mediante
    landmarks faciales 2D (iBUG-68):
    - Puntos interiores 60-67 (borde bermellón interno).
    - Apertura vertical: ||p66 - p62|| (labio central inferior y superior).
    - Ancho de boca: ||p54 - p48|| (comisuras externas).
    MAR_inner = ||p66 - p62|| / ||p54 - p48|| (invariante a escala).
    """
    try:
        if fa_model is None:
            import face_alignment
            fa_model = face_alignment.FaceAlignment(face_alignment.LandmarksType.TWO_D, flip_input=False, device='cpu')
    except Exception as e:
        print(f"   ℹ️ face_alignment no inicializado en entorno local: {e}")
        return None

    cap = cv2.VideoCapture(video_path)
    mars = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Recorte facial para acelerar inferencia
        face_crop = frame[380:880, 260:760]
        rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
        preds = fa_model.get_landmarks(rgb)
        if preds and len(preds) > 0:
            pts = preds[0]
            # Landmarks iBUG: 48=comisura izq, 54=comisura der
            w_mouth = float(np.linalg.norm(pts[54] - pts[48]))
            # Landmarks interiores: 62=labio superior interno, 66=labio inferior interno
            h_inner = float(np.linalg.norm(pts[66] - pts[62]))
            mar = (h_inner / max(1.0, w_mouth))
            mars.append(float(mar))
        else:
            # Fallback al último valor o 0.0
            mars.append(mars[-1] if mars else 0.0)
    cap.release()
    return mars


def compute_lag_correlation_curve(
    audio_rms: list[float],
    mouth_series: list[float],
    fps: float = 25.0,
    max_lag_ms: int = 500
) -> tuple[float, int, dict[int, float]]:
    """
    Calcula la curva completa r(lag) para lags en el intervalo [-max_lag_ms, +max_lag_ms]
    con resolución de 1 frame (40 ms a 25 fps).

    Convención Canónica:
    - lag_frames < 0: boca adelantada respecto al sonido (mouth[t] vs audio[t + |lag|]).
    - lag_frames > 0: boca retrasada respecto al sonido (mouth[t + lag] vs audio[t]).
    """
    max_lag_frames = int(round((max_lag_ms / 1000.0) * fps))
    N = min(len(audio_rms), len(mouth_series))
    a = np.array(audio_rms[:N], dtype=np.float64)
    m = np.array(mouth_series[:N], dtype=np.float64)

    r_curve: dict[int, float] = {}
    best_r = -2.0
    best_lag_ms = 0

    for lag_f in range(-max_lag_frames, max_lag_frames + 1):
        lag_ms = int(round(lag_f * (1000.0 / fps)))
        if lag_f < 0:
            # Boca adelantada: mouth[t] correlacionada con audio en t + |lag_f|
            m_sub = m[:lag_f]
            a_sub = a[-lag_f:]
        elif lag_f > 0:
            # Boca retrasada: mouth en t + lag_f correlacionada con audio en t
            m_sub = m[lag_f:]
            a_sub = a[:-lag_f]
        else:
            m_sub = m
            a_sub = a

        if len(m_sub) < 10 or np.std(m_sub) < 1e-6 or np.std(a_sub) < 1e-6:
            r_val = 0.0
        else:
            r_val = float(np.corrcoef(a_sub, m_sub)[0, 1])

        r_curve[lag_ms] = r_val
        if r_val > best_r:
            best_r = r_val
            best_lag_ms = lag_ms

    return best_r, best_lag_ms, r_curve


def analyze_all_techniques():
    catalog_path = 'scripts/techniques_media_catalog.json'
    with open(catalog_path, 'r', encoding='utf-8') as f:
        cat = json.load(f)

    techniques = cat.get('techniques', [])
    results = []

    for tech in techniques:
        slug = tech.get('slug', tech.get('id'))
        name = tech.get('name')

        video_cands = [
            f'public/media/techniques/{slug}_avatar_final.mp4',
            f'public/media/techniques/cadensa_sts_avatar_final.mp4' if slug == 'syllable-timed-speech' else None
        ]
        video_path = next((v for v in video_cands if v and os.path.exists(v) and os.path.getsize(v) > 50000), None)

        audio_cands = [
            f'public/media/audio/{slug}_sample.wav',
            f'public/media/audio/cadensa_sts_sample.wav' if slug == 'syllable-timed-speech' else None,
            f'public/media/audio/cadensa_box_breathing.wav' if slug == 'box-breathing' else None
        ]
        audio_path = next((a for a in audio_cands if a and os.path.exists(a)), None)

        tl_cands = [
            f'public/media/audio/{slug}_timeline.json',
            f'public/media/audio/cadensa_sts_timeline.json' if slug == 'syllable-timed-speech' else None,
            f'public/media/audio/cadensa_box_breathing_timeline.json' if slug == 'box-breathing' else None
        ]
        tl_path = next((t for t in tl_cands if t and os.path.exists(t)), None)

        if not video_path or not audio_path or not tl_path:
            results.append({'slug': slug, 'name': name, 'status': 'MISSING_ASSETS'})
            continue

        try:
            wf = wave.open(audio_path, 'rb')
            rate = wf.getframerate()
            n_samples = wf.getnframes()
            raw = wf.readframes(n_samples)
            wf.close()
            audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

            fps = 25.0
            apertures = compute_dark_cavity_aperture(video_path, fps=fps)
            samples_per_frame = int(rate / fps)
            audio_rms = [
                float(np.sqrt(np.mean(audio[i * samples_per_frame:(i + 1) * samples_per_frame] ** 2)))
                for i in range(len(apertures))
            ]

            best_r, best_lag_ms, r_curve = compute_lag_correlation_curve(audio_rms, apertures, fps=fps, max_lag_ms=500)

            with open(tl_path, 'r', encoding='utf-8') as f:
                tl = json.load(f)

            if slug == 'box-breathing':
                # Métrica específica para Box Breathing:
                # Indicaciones de voz ocurren al inicio de cada bloque de 4s (aprox los primeros 1.4s de cada bloque).
                # Fuera de las indicaciones de voz, la boca debe estar cerrada.
                phase_dur = tl.get('phase_duration_sec', 4.0)
                closed_count = 0
                non_voice_count = 0
                max_rest_ap = 0.0

                for i, ap in enumerate(apertures):
                    t_sec = i / fps
                    # Tiempo dentro de la fase actual de 4s
                    t_in_phase = t_sec % phase_dur
                    is_voice_cue = (t_in_phase < 1.5)  # Cue de voz dura < 1.5s
                    if not is_voice_cue:
                        non_voice_count += 1
                        if ap <= 3.5:  # Umbral de boca cerrada en cavidad oscura
                            closed_count += 1
                        if ap > max_rest_ap:
                            max_rest_ap = ap

                pct_closed = (closed_count / max(1, non_voice_count)) * 100.0
                results.append({
                    'slug': slug,
                    'name': name,
                    'status': 'OK',
                    'r': best_r,
                    'lag_ms': best_lag_ms,
                    'pct_closed_non_voice': pct_closed,
                    'max_rest_aperture': max_rest_ap,
                    'r_curve': r_curve
                })
            else:
                b_int = tl.get('breathing_intervals', [[0.0, 2.5]])
                b_vals = [apertures[i] for i in range(len(apertures)) if any(b[0] <= i / fps <= b[1] for b in b_int)]
                p_vals = [apertures[i] for i in range(len(apertures)) if not any(b[0] <= i / fps <= b[1] for b in b_int)]

                mean_b = float(np.mean(b_vals)) if b_vals else 0.0
                mean_p = float(np.mean(p_vals)) if p_vals else 0.0
                max_b = float(np.max(b_vals)) if b_vals else 0.0
                ratio = mean_p / mean_b if mean_b > 0 else 1.0

                results.append({
                    'slug': slug,
                    'name': name,
                    'status': 'OK',
                    'r': best_r,
                    'lag_ms': best_lag_ms,
                    'ratio': ratio,
                    'mean_b': mean_b,
                    'mean_p': mean_p,
                    'max_b': max_b,
                    'r_curve': r_curve
                })
        except Exception as e:
            results.append({'slug': slug, 'name': name, 'status': f'ERROR: {e}'})

    return results


if __name__ == '__main__':
    res = analyze_all_techniques()
    print("\n" + "=" * 90)
    print("📊 RESULTADOS DE ANÁLISIS LABIAL CON VENTANA ±500 MS (CANÓNICO)")
    print("=" * 90)
    for r in res:
        if r['status'] == 'OK':
            if r['slug'] == 'box-breathing':
                print(f"👉 {r['name']:<35} | r={r['r']:+.3f} (lag {r['lag_ms']:+4d} ms) | Boca cerrada reposo: {r['pct_closed_non_voice']:.1f}% | Apertura máx reposo: {r['max_rest_aperture']:.2f} px")
            else:
                print(f"👉 {r['name']:<35} | r={r['r']:+.3f} (lag {r['lag_ms']:+4d} ms) | Ratio: {r['ratio']:.2f}x | b_mean: {r['mean_b']:.2f} px | b_max: {r['max_b']:.2f} px")
        else:
            print(f"👉 {r['name']:<35} | {r['status']}")
    print("=" * 90)
