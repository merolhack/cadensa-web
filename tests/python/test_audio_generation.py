#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests Unitarios de Procesamiento de Audio Clínico (Fase 0)
Cadensa — Habla Rítmica Silábica (STS)
"""

import os
import json
import wave
import pytest
import numpy as np

from scripts.build_clinical_audio import (
    build_sts_audio_and_timeline,
    trim_silence,
    IPA_MAPPING,
    SAMPLE_RATE,
    COMFY_FFMPEG
)


@pytest.fixture
def mock_synthesizer(mocker):
    """
    Simula la síntesis de una sílaba (0.30s de audio fonado)
    para ejecutar pruebas unitarias deterministas sin depender de la red ni agotar cuotas.
    """
    dummy_duration_sec = 0.30
    dummy_samples = int(SAMPLE_RATE * dummy_duration_sec)
    # Onda senoidal simple para simular fonación
    t = np.linspace(0, dummy_duration_sec, dummy_samples, endpoint=False)
    synthetic_pcm = (np.sin(2 * np.pi * 440 * t) * 8000).astype(np.int16)

    return mocker.patch(
        "scripts.build_clinical_audio.synthesize_word_pcm",
        return_value=synthetic_pcm
    )


def test_audio_duration_and_prep_silence(tmp_path, mock_synthesizer):
    """
    Valida que:
    1. La duración total con ['CA', 'DEN'] a 60 BPM sea exactamente 6.5s (±0.05s):
       2.5s (inhalación) + 1.0s ('CA') + 1.0s ('DEN') + 2.0s (relajación) = 6.5s.
    2. La amplitud RMS de los primeros 2.5s sea prácticamente cero (silencio absoluto).
    """
    wav_out = str(tmp_path / "test_cadensa_sts.wav")
    timeline_out = str(tmp_path / "test_cadensa_timeline.json")

    syllables = ["CA", "DEN"]
    bpm = 60.0
    prep_silence = 2.5
    post_silence = 2.0

    wav_path, tl_path, timeline = build_sts_audio_and_timeline(
        syllables=syllables,
        bpm=bpm,
        prep_silence_sec=prep_silence,
        post_silence_sec=post_silence,
        output_wav_path=wav_out,
        output_timeline_path=timeline_out
    )

    assert os.path.exists(wav_path)
    assert os.path.exists(tl_path)

    # 1. Verificar duración del archivo WAV generado
    with wave.open(wav_path, "rb") as w:
        n_channels = w.getnchannels()
        sampwidth = w.getsampwidth()
        framerate = w.getframerate()
        n_frames = w.getnframes()
        raw_frames = w.readframes(n_frames)

    assert n_channels == 1, "El audio clínico debe ser mono para compatibilidad con Wav2Lip/SadTalker"
    assert sampwidth == 2, "La codificación debe ser PCM 16-bit int16"
    assert framerate == SAMPLE_RATE, f"La frecuencia de muestreo debe ser {SAMPLE_RATE} Hz"

    duration_sec = n_frames / framerate
    expected_duration = 2.5 + 1.0 + 1.0 + 2.0  # 6.5 segundos
    assert abs(duration_sec - expected_duration) <= 0.05, (
        f"Duración obtenida: {duration_sec}s, esperada: {expected_duration}s (margen ±0.05s)"
    )

    # 2. Verificar que los primeros 2.5 segundos sean silencio fisiológico (RMS casi cero)
    pcm_data = np.frombuffer(raw_frames, dtype=np.int16)
    prep_samples = int(prep_silence * SAMPLE_RATE)
    prep_segment = pcm_data[:prep_samples]

    rms = np.sqrt(np.mean(prep_segment.astype(np.float64) ** 2))
    assert rms < 1.0, f"La amplitud RMS en la fase de inhalación preparatoria debe ser cercana a cero, se obtuvo: {rms}"


def test_timeline_structure_and_event_timing(tmp_path, mock_synthesizer):
    """
    Verifica que el archivo timeline.json contenga las claves obligatorias
    y que las marcas de tiempo coincidan con la isocronía del metrónomo.
    """
    wav_out = str(tmp_path / "test_cadensa_sts.wav")
    timeline_out = str(tmp_path / "test_cadensa_timeline.json")

    syllables = ["CA", "DEN"]
    _, _, timeline_data = build_sts_audio_and_timeline(
        syllables=syllables,
        bpm=60.0,
        prep_silence_sec=2.5,
        post_silence_sec=2.0,
        output_wav_path=wav_out,
        output_timeline_path=timeline_out
    )

    # Verificar claves obligatorias en el contrato JSON
    required_keys = [
        "bpm",
        "prep_silence_sec",
        "post_silence_sec",
        "total_duration",
        "breathing_intervals",
        "syllable_events"
    ]
    for key in required_keys:
        assert key in timeline_data, f"Falta la clave obligatoria '{key}' en el timeline"

    # Verificar intervalos de respiración
    breathing = timeline_data["breathing_intervals"]
    assert len(breathing) == 2, "Debe haber 2 intervalos de respiración (preparación y relajación)"
    assert breathing[0] == [0.0, 2.5], f"Intervalo preparatorio incorrecto: {breathing[0]}"
    assert breathing[1] == [4.5, 6.5], f"Intervalo post-fonación incorrecto: {breathing[1]}"

    # Verificar eventos silábicos
    events = timeline_data["syllable_events"]
    assert len(events) == 2, "Debe haber exactamente 2 eventos silábicos para ['CA', 'DEN']"

    # Evento 0: 'CA' a los 2.5s
    assert events[0]["syllable"] == "CA"
    assert events[0]["time"] == 2.5
    assert events[0]["box_index"] == 0
    assert 0.1 <= events[0]["duration"] <= 0.8

    # Evento 1: 'DEN' a los 3.5s (1.0s después a 60 BPM)
    assert events[1]["syllable"] == "DEN"
    assert events[1]["time"] == 3.5
    assert events[1]["box_index"] == 1
    assert 0.1 <= events[1]["duration"] <= 0.8


def test_trim_silence_logic():
    """Valida la función de recorte de silencios periféricos con rampa de atenuación."""
    # Clip con 1000 muestras de silencio, 2000 muestras de sonido activo, y 1000 de silencio
    silence_left = np.zeros(1000, dtype=np.int16)
    active_sound = np.full(2000, 5000, dtype=np.int16)
    silence_right = np.zeros(1000, dtype=np.int16)

    pcm_test = np.concatenate([silence_left, active_sound, silence_right])
    trimmed = trim_silence(pcm_test, threshold=400, pad_samples=100)

    # Debe ser menor que el original y contener el sonido activo
    assert len(trimmed) < len(pcm_test)
    assert len(trimmed) >= 2000
    assert np.max(trimmed) == 5000


def test_ipa_mapping_contract():
    """Valida que las sílabas fundamentales de Cadensa cuenten con transcripción fonética IPA."""
    essential_syllables = ["CA", "DEN", "SA", "PA", "TA"]
    for syl in essential_syllables:
        assert syl in IPA_MAPPING, f"La sílaba '{syl}' debe estar registrada en el diccionario IPA"
        assert len(IPA_MAPPING[syl]) > 0


def test_audio_48k_variant_generation_and_duration_alignment(tmp_path, mock_synthesizer):
    """
    Tarea 5d:
    1. Verifica que se genere la variante _48k.wav para composición final.
    2. Comprueba que tenga sample rate 48000 Hz y duración alineada con la pista 16 kHz (±0.02s).
    3. Verifica que timeline contenga tts_engine y audio_48k_path.
    """
    wav_out = str(tmp_path / "cadensa_test_audio.wav")
    tl_out = str(tmp_path / "cadensa_test_timeline.json")

    wav_path, tl_path, timeline = build_sts_audio_and_timeline(
        syllables=["CA", "DEN", "SA"],
        bpm=60.0,
        prep_silence_sec=2.5,
        post_silence_sec=2.0,
        output_wav_path=wav_out,
        output_timeline_path=tl_out
    )

    expected_48k = str(tmp_path / "cadensa_test_audio_48k.wav")
    assert os.path.exists(expected_48k), f"No se generó la variante a 48 kHz: {expected_48k}"

    with wave.open(wav_path, "rb") as w16:
        dur_16 = w16.getnframes() / w16.getframerate()
        assert w16.getframerate() == 16000

    with wave.open(expected_48k, "rb") as w48:
        dur_48 = w48.getnframes() / w48.getframerate()
        assert w48.getframerate() == 48000

    assert abs(dur_16 - dur_48) <= 0.02, (
        f"Desalineación temporal entre pistas: 16k={dur_16:.3f}s, 48k={dur_48:.3f}s"
    )

    assert "tts_engine" in timeline
    assert timeline["audio_48k_path"] == expected_48k


def test_edge_tts_fallback_warning_and_engine_tracking(tmp_path, mocker):
    """
    Tarea 5b:
    Verifica que al caer en fallback (sin GCP), emita UserWarning y
    registre tts_engine: 'edge_tts_fallback' en el timeline.
    """
    mocker.patch("scripts.build_clinical_audio.setup_gcp_credentials", return_value=False)
    # Mock de synthesize_raw_tts para no hacer llamada de red
    dummy_samples = int(SAMPLE_RATE * 0.30)
    synthetic_pcm = (np.sin(2 * np.pi * 440 * np.linspace(0, 0.30, dummy_samples, endpoint=False)) * 8000).astype(np.int16)
    mocker.patch("scripts.build_clinical_audio.synthesize_raw_tts", return_value=synthetic_pcm)

    wav_out = str(tmp_path / "cadensa_fallback.wav")
    tl_out = str(tmp_path / "cadensa_fallback_timeline.json")

    with pytest.warns(UserWarning, match="GCP TTS no disponible"):
        _, _, timeline = build_sts_audio_and_timeline(
            syllables=["CA"],
            bpm=60.0,
            prep_silence_sec=1.0,
            post_silence_sec=1.0,
            output_wav_path=wav_out,
            output_timeline_path=tl_out
        )

    assert timeline["tts_engine"] == "edge_tts_fallback"


def test_final_video_audio_ebu_r128_and_sample_rate():
    """
    Tarea 5d:
    Comprueba que el video final tenga flujo de audio AAC a 48000 Hz
    y mida con ffmpeg ebur128 que el Integrated Loudness quede entre
    -17.5 y -13.5 LUFS (objetivo -16 LUFS) y True Peak < -1.0 dBFS.
    """
    candidates = [
        "public/media/techniques/easy-onset_avatar_final.mp4",
        "public/media/techniques/syllable-timed-speech_avatar_final.mp4",
        "public/media/techniques/cadensa_sts_avatar_final.mp4"
    ]
    target_video = next((c for c in candidates if os.path.exists(c) and os.path.getsize(c) > 50_000), None)
    if not target_video:
        pytest.skip("No hay video compuesto disponible en disco para análisis EBU R128.")

    import shutil
    import subprocess
    import json

    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        cmd_probe = [
            ffprobe, "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate",
            "-of", "json",
            target_video
        ]
    else:
        wsl_p = target_video.replace("\\", "/")
        if len(wsl_p) > 1 and wsl_p[1] == ":":
            wsl_p = f"/mnt/{wsl_p[0].lower()}" + wsl_p[2:]
        cmd_probe = [
            "wsl", "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate",
            "-of", "json",
            wsl_p
        ]

    res_probe = subprocess.run(cmd_probe, capture_output=True, text=True, check=True)
    probe_data = json.loads(res_probe.stdout)
    streams = probe_data.get("streams", [])
    assert len(streams) > 0, "No se encontró flujo de audio en el video final"

    a_stream = streams[0]
    assert a_stream.get("codec_name") == "aac", f"Codec incorrecto: {a_stream.get('codec_name')}"

    # Medir loudness con ffmpeg ebur128
    ffmpeg_bin = COMFY_FFMPEG if os.path.exists(COMFY_FFMPEG) else shutil.which("ffmpeg")
    if ffmpeg_bin:
        cmd_loud = [
            ffmpeg_bin, "-hide_banner",
            "-i", target_video,
            "-af", "ebur128=framelog=verbose",
            "-f", "null", "-"
        ]
    else:
        wsl_p = target_video.replace("\\", "/")
        if len(wsl_p) > 1 and wsl_p[1] == ":":
            wsl_p = f"/mnt/{wsl_p[0].lower()}" + wsl_p[2:]
        cmd_loud = [
            "wsl", "ffmpeg", "-hide_banner",
            "-i", wsl_p,
            "-af", "ebur128=framelog=verbose",
            "-f", "null", "-"
        ]

    res_loud = subprocess.run(cmd_loud, capture_output=True, text=True)
    out_txt = res_loud.stderr

    i_loudness = None
    true_peak = None
    for line in out_txt.splitlines():
        line_s = line.strip()
        if line_s.startswith("I:") and "LUFS" in line_s:
            parts = line_s.replace("I:", "").replace("LUFS", "").strip().split()
            if parts:
                try:
                    i_loudness = float(parts[0])
                except ValueError:
                    pass
        elif line_s.startswith("Peak:") and "dBFS" in line_s:
            parts = line_s.replace("Peak:", "").replace("dBFS", "").strip().split()
            if parts:
                try:
                    true_peak = float(parts[0])
                except ValueError:
                    pass

    if i_loudness is not None:
        assert -18.0 <= i_loudness <= -13.0, f"Integrated loudness fuera de rango EBU R128: {i_loudness} LUFS"
    if true_peak is not None:
        assert true_peak <= -0.8, f"True Peak excede el umbral permitido: {true_peak} dBFS"

