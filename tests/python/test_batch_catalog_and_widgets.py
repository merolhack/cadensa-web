#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests del Catálogo Maestro y Widgets Visuales Multimodales
Cadensa — Producción de las 7 Técnicas Clínicas
"""

import os
import json
import pytest
import numpy as np

from scripts.build_clinical_audio import (
    build_box_breathing_audio_and_timeline,
    build_guided_phrase_audio_and_timeline
)
from scripts.compose_cadensa_video import (
    compose_cadensa_frame,
    create_rounded_mask,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    COLOR_BG
)

CATALOG_PATH = "scripts/techniques_media_catalog.json"


def test_catalog_integrity_and_7_techniques():
    """Valida que el catálogo contenga exactamente las 7 técnicas fonoaudiológicas institucionales."""
    assert os.path.exists(CATALOG_PATH), f"El catálogo '{CATALOG_PATH}' no existe"

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    techniques = catalog.get("techniques", [])
    assert len(techniques) == 7, f"Se esperaban 7 técnicas, encontradas: {len(techniques)}"

    expected_ids = [
        "sts",
        "easy_onset",
        "light_contact",
        "prolonged_speech",
        "box_breathing",
        "pull_out",
        "cancellation"
    ]
    found_ids = [t.get("id") for t in techniques]

    for exp_id in expected_ids:
        assert exp_id in found_ids, f"Falta la técnica obligatoria '{exp_id}' en el catálogo"

    for tech in techniques:
        assert "name" in tech and len(tech["name"]) > 0
        assert "visual_widget" in tech
        assert "accent_color_hex" in tech
        assert "accent_color_bgr" in tech and len(tech["accent_color_bgr"]) == 3


def test_box_breathing_audio_and_timeline_structure(tmp_path, mocker):
    """Valida la generación de audio y timeline para el ciclo de Respiración Cuadrada (4-4-4-4 = 16s)."""
    # Mockear synthesize_phrase_pcm para rapidez
    mocker.patch(
        "scripts.build_clinical_audio.synthesize_phrase_pcm",
        return_value=np.full(16000, 2000, dtype=np.int16)
    )

    wav_out = str(tmp_path / "test_bb.wav")
    tl_out = str(tmp_path / "test_bb.json")

    _, _, timeline = build_box_breathing_audio_and_timeline(
        phase_duration_sec=4.0,
        output_wav_path=wav_out,
        output_timeline_path=tl_out,
        with_voice_cues=True
    )

    assert os.path.exists(wav_out)
    assert os.path.exists(tl_out)

    assert timeline["total_duration"] == 16.0
    assert len(timeline["phases"]) == 4
    phase_names = [p["name"] for p in timeline["phases"]]
    assert phase_names == ["INHALAR", "RETENER", "EXHALAR", "VACIAR"]


def test_guided_phrase_audio_structure(tmp_path, mocker):
    """Valida la generación de audio y timeline para frases clínicas guiadas."""
    dummy_duration_sec = 2.0
    mocker.patch(
        "scripts.build_clinical_audio.synthesize_phrase_pcm",
        return_value=np.full(int(16000 * dummy_duration_sec), 3000, dtype=np.int16)
    )

    wav_out = str(tmp_path / "test_phrase.wav")
    tl_out = str(tmp_path / "test_phrase.json")

    _, _, timeline = build_guided_phrase_audio_and_timeline(
        script_text="Inhala con calma y vocaliza suavemente.",
        prep_silence_sec=2.5,
        post_silence_sec=2.0,
        output_wav_path=wav_out,
        output_timeline_path=tl_out
    )

    expected_total = 2.5 + dummy_duration_sec + 2.0
    assert abs(timeline["total_duration"] - expected_total) <= 0.05
    assert len(timeline["breathing_intervals"]) == 2


def test_breathing_orb_composition_widget():
    """Valida el renderizado visual del orbe respiratorio en compose_cadensa_frame."""
    mask = create_rounded_mask(800, 44)
    dummy_avatar = np.full((512, 512, 3), 100, dtype=np.uint8)

    tech_meta = {
        "name": "Respiración Diafragmática (Box Breathing)",
        "clinical_objective": "Regulación neurovegetativa mediante nervio vago",
        "visual_widget": "breathing_orb",
        "accent_color_bgr": [212, 182, 6],
        "accent_glow_bgr": [235, 215, 80]
    }

    timeline_dummy = {
        "tts_mode": "breathing_cycle",
        "phase_duration_sec": 4.0,
        "total_duration": 16.0,
        "breathing_intervals": [[0.0, 16.0]],
        "phases": [
            {"name": "INHALAR", "start": 0.0, "end": 4.0, "action": "expand"}
        ]
    }

    # Renderizar en t=2.0s (mitad de inhalación)
    frame = compose_cadensa_frame(
        avatar_frame=dummy_avatar,
        rounded_mask=mask,
        t_seconds=2.0,
        timeline_data=timeline_dummy,
        technique_meta=tech_meta
    )

    assert frame.shape == (CANVAS_HEIGHT, CANVAS_WIDTH, 3)
    assert tuple(frame[10, 10]) == COLOR_BG


def test_all_specialized_widgets_composition():
    """Valida el renderizado correcto de todos los widgets especializados sin excepciones."""
    mask = create_rounded_mask(800, 44)
    dummy_avatar = np.full((512, 512, 3), 120, dtype=np.uint8)

    widgets_to_test = [
        ("amplitude_ramp", [248, 189, 56], "Inicio Vocal Suave"),
        ("pressure_gauge", [247, 85, 168], "Contacto Articular Suave"),
        ("legato_wave", [11, 158, 245], "Habla Prolongada"),
        ("decompression_gauge", [22, 115, 249], "Salida Suave Pull-Out"),
        ("pause_timer", [153, 72, 236], "Cancelación Post-Bloqueo")
    ]

    for widget_name, col_bgr, tech_name in widgets_to_test:
        meta = {
            "name": tech_name,
            "clinical_objective": f"Objetivo clínico de {tech_name}",
            "visual_widget": widget_name,
            "accent_color_bgr": col_bgr,
            "accent_glow_bgr": [200, 200, 200]
        }
        frame = compose_cadensa_frame(
            avatar_frame=dummy_avatar,
            rounded_mask=mask,
            t_seconds=1.5,
            syllables=["PA", "TA", "KA"],
            technique_meta=meta
        )
        assert frame.shape == (CANVAS_HEIGHT, CANVAS_WIDTH, 3)
        assert tuple(frame[10, 10]) == COLOR_BG


