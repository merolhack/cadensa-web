#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Generador y Pre-procesador de Audio Clínico Fonoaudiológico
https://cadensa-web.pages.dev/

Propósito:
Pre-procesa o sintetiza audio terapéutico para las técnicas de fluidez de Cadensa
(Habla Rítmica Silábica - STS y Fluency Shaping). Inserta silencios fisiológicos:
1. Inhalación Preparatoria: 2.5s de silencio inicial para permitir respiración diafragmática.
2. Pausas Inter-frase: 1.5 a 2.0s de reposo fonoaudiológico.
3. Isocronía Silábica (STS): Espaciado exacto a 60 BPM (1.0s por compás) entre sílabas fonadas.
4. Exporta un archivo timeline.json con coordenadas temporales exactas para el compositor.
"""

from __future__ import annotations
import os
import sys
import json
import wave
import argparse
import subprocess
import tempfile
import warnings
import numpy as np

# Configurar UTF-8 en consola
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

SAMPLE_RATE = 16000
HQ_SAMPLE_RATE = 48000
COMFY_FFMPEG = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\ffmpeg.exe"

IPA_MAPPING = {
    "CA": "ka",
    "DEN": "den",
    "SA": "sa",
    "PA": "pa",
    "TA": "ta",
    "LA": "la",
    "MA": "ma",
    "SO": "so",
    "SI": "si",
    "SE": "se",
    "SU": "su",
    "NO": "no",
    "DO": "do",
    "MI": "mi",
    "FA": "fa",
    "SOL": "sol",
    "TRA": "tɾa",
    "TRE": "tɾe",
    "TRI": "tɾi",
    "TRO": "tɾo",
    "TRU": "tɾu",
}


def get_ffmpeg_bin() -> str:
    """Devuelve la ruta ejecutable de FFmpeg."""
    if os.path.exists(COMFY_FFMPEG):
        return COMFY_FFMPEG
    return "ffmpeg"


def setup_gcp_credentials() -> bool:
    """Configura la variable GOOGLE_APPLICATION_CREDENTIALS si no está definida."""
    if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") and os.path.exists(os.environ["GOOGLE_APPLICATION_CREDENTIALS"]):
        return True

    candidates = [
        os.path.join(os.getcwd(), "google_credentials.json"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "google_credentials.json"),
        r"\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\google_credentials.json",
        r"/home/merolhack/fl/cadensa-web/google_credentials.json",
    ]
    for cand in candidates:
        if os.path.exists(cand):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(cand)
            return True
    return False


LAST_USED_TTS_ENGINE = "gcp_neural2"


def resample_wav_to_48k(input_wav_path: str, output_48k_path: str = None) -> str:
    """
    Re-muestrea el archivo WAV a 48 kHz (HQ) utilizando el algoritmo sinc/soxr
    de FFmpeg de alta precisión, garantizando duración idéntica (±0.001s).
    """
    if output_48k_path is None:
        base, ext = os.path.splitext(input_wav_path)
        output_48k_path = f"{base}_48k{ext}"

    ffmpeg_bin = get_ffmpeg_bin()
    cmd = [
        ffmpeg_bin, "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", input_wav_path,
        "-af", "aresample=48000:resampler=soxr:precision=28",
        "-ar", "48000",
        output_48k_path
    ]
    subprocess.run(cmd, check=True)
    return output_48k_path


def synthesize_gcloud_tts(syllable: str, voice_name: str = "es-US-Neural2-B") -> np.ndarray | None:
    """
    Sintetiza una sílaba clínica usando Google Cloud Text-to-Speech con SSML y fonemas IPA.
    Garantiza que fonemas como 'SA' se articulen como sílaba y no como letras aisladas.
    """
    try:
        from google.cloud import texttospeech
    except ImportError:
        return None

    if not setup_gcp_credentials():
        return None

    try:
        import io
        client = texttospeech.TextToSpeechClient()
        clean_syl = syllable.strip().upper()
        ipa_phoneme = IPA_MAPPING.get(clean_syl, clean_syl.lower())

        # Construcción SSML obligatoria con <phoneme>
        ssml = f'<speak><phoneme alphabet="ipa" ph="{ipa_phoneme}">{syllable.strip()}</phoneme></speak>'
        synthesis_input = texttospeech.SynthesisInput(ssml=ssml)

        lang_code = "-".join(voice_name.split("-")[:2])
        voice = texttospeech.VoiceSelectionParams(
            language_code=lang_code,
            name=voice_name
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            sample_rate_hertz=SAMPLE_RATE
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        with wave.open(io.BytesIO(response.audio_content), "rb") as w:
            raw_frames = w.readframes(w.getnframes())
            pcm_data = np.frombuffer(raw_frames, dtype=np.int16)

        trimmed = trim_silence(pcm_data)
        dur = len(trimmed) / SAMPLE_RATE
        print(f"      ✅ [Google Cloud TTS] Sílaba '{syllable}' sintetizada con SSML IPA '{ipa_phoneme}' ({dur:.3f}s)")
        return trimmed
    except Exception as e:
        print(f"      ⚠️ Google Cloud TTS no disponible ({e}), utilizando fallback edge-tts...")
        return None


def synthesize_raw_tts(text: str, voice: str = "es-MX-JorgeNeural") -> np.ndarray:
    """Sintetiza audio crudo con edge-tts y retorna PCM 16kHz mono int16."""
    temp_dir = tempfile.mkdtemp()
    tmp_mp3 = os.path.join(temp_dir, "speech.mp3")
    tmp_wav = os.path.join(temp_dir, "speech.wav")
    try:
        cmd_tts = [
            sys.executable, "-m", "edge_tts",
            "--voice", voice,
            "--text", text,
            "--write-media", tmp_mp3
        ]
        subprocess.run(cmd_tts, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        cmd_ffmpeg = [
            get_ffmpeg_bin(), "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
            "-i", tmp_mp3,
            "-ar", str(SAMPLE_RATE),
            "-ac", "1",
            tmp_wav
        ]
        subprocess.run(cmd_ffmpeg, check=True)

        with wave.open(tmp_wav, "rb") as w:
            raw_frames = w.readframes(w.getnframes())
            pcm_data = np.frombuffer(raw_frames, dtype=np.int16)
        return pcm_data
    finally:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


def trim_silence(pcm: np.ndarray, threshold: int = 400, pad_samples: int = 600) -> np.ndarray:
    """Elimina el silencio inicial y final del clip de audio con margen de suavizado."""
    active = np.where(np.abs(pcm) > threshold)[0]
    if len(active) == 0:
        return pcm
    start_idx = max(0, active[0] - pad_samples)
    end_idx = min(len(pcm), active[-1] + pad_samples)
    return pcm[start_idx:end_idx]


def synthesize_word_pcm(
    text: str,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B"
) -> np.ndarray:
    """
    Sintetiza una palabra o sílaba clínica.
    1. Prioridad: Google Cloud Text-to-Speech con SSML y fonemas IPA.
    2. Fallback: Edge TTS con transformaciones fonéticas.
    """
    global LAST_USED_TTS_ENGINE

    # 1. Intentar Google Cloud TTS con SSML
    gcp_pcm = synthesize_gcloud_tts(text, voice_name=gcp_voice)
    if gcp_pcm is not None and len(gcp_pcm) > 0:
        LAST_USED_TTS_ENGINE = "gcp_neural2"
        return gcp_pcm

    # 2. Fallback: Edge-TTS
    LAST_USED_TTS_ENGINE = "edge_tts_fallback"
    warnings.warn(
        f"GCP TTS no disponible para la sílaba '{text}'. Utilizando fallback edge-tts.",
        UserWarning,
        stacklevel=2
    )

    raw_syl = text.strip()
    candidates = [
        raw_syl.capitalize(),             # Ej: 'Sa', 'Ca', 'Den'
        raw_syl.lower(),                  # Ej: 'sa', 'ca', 'den'
        f"¡{raw_syl.capitalize()}!",      # Ej: '¡Sa!'
    ]
    if raw_syl.upper() == "SA":
        candidates.insert(2, "ssa")
        candidates.insert(3, "za")

    best_pcm = None
    best_dur = 999.0

    for cand in candidates:
        try:
            pcm = synthesize_raw_tts(cand, voice=voice)
            trimmed = trim_silence(pcm)
            dur = len(trimmed) / SAMPLE_RATE

            if 0.09 <= dur <= 0.45:
                print(f"      ✅ [Edge-TTS Fallback] Fonética validada: '{raw_syl}' -> '{cand}' ({dur:.3f}s)")
                return trimmed

            if dur < best_dur and dur >= 0.08:
                best_dur = dur
                best_pcm = trimmed
        except Exception:
            continue

    if best_pcm is not None:
        print(f"      ⚠️ Usando mejor aproximación fonética para '{raw_syl}' ({best_dur:.3f}s)")
        return best_pcm

    pcm = synthesize_raw_tts(raw_syl.capitalize(), voice=voice)
    return trim_silence(pcm)


def build_sts_audio_and_timeline(
    syllables: list[str] = None,
    bpm: float = 60.0,
    prep_silence_sec: float = 2.5,
    post_silence_sec: float = 2.0,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B",
    output_wav_path: str = "public/media/audio/cadensa_sts_sample.wav",
    output_timeline_path: str = "public/media/audio/cadensa_sts_timeline.json"
) -> tuple[str, str, dict]:
    """
    Construye el audio clínico isocrónico para STS y genera el timeline correspondiente.
    Utiliza Google Cloud Text-to-Speech con SSML fonético como motor principal de alta fidelidad.
    """
    if syllables is None:
        syllables = ["CA", "DEN", "SA"]

    interval_sec = 60.0 / bpm
    interval_samples = int(interval_sec * SAMPLE_RATE)
    prep_samples = int(prep_silence_sec * SAMPLE_RATE)
    post_samples = int(post_silence_sec * SAMPLE_RATE)

    print("=" * 80)
    print("🎙️ CADENSA — GENERADOR DE AUDIO CLÍNICO FONOADIOLÓGICO (STS)")
    print("=" * 80)
    print(f"   👉 Sílabas:             {syllables}")
    print(f"   👉 Tempo Clínico (BPM): {bpm} ({interval_sec:.2f} s por sílaba)")
    print(f"   👉 Pausa Inhalatoria:   {prep_silence_sec:.2f} s")
    print(f"   👉 Pausa Relajatoria:   {post_silence_sec:.2f} s")
    print(f"   👉 Motor Primario:      Google Cloud Text-to-Speech (Neural2 / SSML / IPA)")
    print(f"   👉 Voz GCP:             {gcp_voice}")
    print(f"   👉 Voz Fallback:        {voice}")

    # 1. Silencio preparatorio inicial (inhalación diafragmática)
    full_audio = [np.zeros(prep_samples, dtype=np.int16)]
    events = []
    breathing_intervals = [[0.0, prep_silence_sec]]

    current_sec = prep_silence_sec

    # 2. Generar y ensamblar cada sílaba
    for idx, syl in enumerate(syllables):
        print(f"   👉 Sintetizando sílaba {idx+1}/{len(syllables)}: '{syl}'...")
        raw_pcm = synthesize_word_pcm(syl, voice=voice, gcp_voice=gcp_voice)
        trimmed_pcm = trim_silence(raw_pcm)

        syl_dur = len(trimmed_pcm) / SAMPLE_RATE
        events.append({
            "syllable": syl.upper(),
            "time": round(current_sec, 3),
            "duration": round(syl_dur, 3),
            "box_index": idx
        })

        # Si la sílaba es más corta que el intervalo, rellenar silencio hasta completar el compás
        pad_len = interval_samples - len(trimmed_pcm)
        if pad_len > 0:
            block = np.concatenate([trimmed_pcm, np.zeros(pad_len, dtype=np.int16)])
        else:
            block = trimmed_pcm[:interval_samples]

        full_audio.append(block)
        current_sec += interval_sec

    # 3. Silencio post-fonación (relajación)
    post_start = current_sec
    post_end = current_sec + post_silence_sec
    breathing_intervals.append([round(post_start, 3), round(post_end, 3)])
    full_audio.append(np.zeros(post_samples, dtype=np.int16))

    # 4. Consolidar audio completo
    final_pcm = np.concatenate(full_audio)
    total_duration = round(len(final_pcm) / SAMPLE_RATE, 3)

    # 5. Guardar archivo WAV (16 kHz para inferencia)
    os.makedirs(os.path.dirname(os.path.abspath(output_wav_path)), exist_ok=True)
    with wave.open(output_wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2) # 16 bits
        w.setframerate(SAMPLE_RATE)
        w.writeframes(final_pcm.tobytes())

    # Variante de alta fidelidad 48 kHz para composición final
    audio_48k_path = f"{os.path.splitext(output_wav_path)[0]}_48k.wav"
    try:
        resample_wav_to_48k(output_wav_path, audio_48k_path)
    except Exception as e:
        print(f"   ⚠️ No fue posible generar variante 48 kHz: {e}")
        audio_48k_path = None

    # 6. Guardar timeline JSON
    timeline_data = {
        "bpm": bpm,
        "prep_silence_sec": prep_silence_sec,
        "post_silence_sec": post_silence_sec,
        "total_duration": total_duration,
        "breathing_intervals": breathing_intervals,
        "syllable_events": events,
        "tts_engine": LAST_USED_TTS_ENGINE,
        "audio_48k_path": audio_48k_path
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_timeline_path)), exist_ok=True)
    with open(output_timeline_path, "w", encoding="utf-8") as f:
        json.dump(timeline_data, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Audio clínico generado:    {output_wav_path} ({len(final_pcm)} muestras, {total_duration}s)")
    print(f"   ✅ Mapa temporal (Timeline):  {output_timeline_path}")
    return output_wav_path, output_timeline_path, timeline_data


def synthesize_phrase_pcm(
    phrase: str,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B"
) -> np.ndarray:
    """
    Sintetiza una locución clínica completa (frase o guía) usando GCP TTS
    o fallback a edge-tts. Retorna PCM LINEAR16 a 16kHz mono int16.
    """
    global LAST_USED_TTS_ENGINE
    try:
        from google.cloud import texttospeech
        if setup_gcp_credentials():
            import io
            client = texttospeech.TextToSpeechClient()
            synthesis_input = texttospeech.SynthesisInput(text=phrase)
            lang_code = "-".join(gcp_voice.split("-")[:2])
            voice_params = texttospeech.VoiceSelectionParams(
                language_code=lang_code,
                name=gcp_voice
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                sample_rate_hertz=SAMPLE_RATE
            )
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice_params,
                audio_config=audio_config
            )
            with wave.open(io.BytesIO(response.audio_content), "rb") as w:
                raw_frames = w.readframes(w.getnframes())
                pcm = np.frombuffer(raw_frames, dtype=np.int16)
            trimmed = trim_silence(pcm)
            dur = len(trimmed) / SAMPLE_RATE
            LAST_USED_TTS_ENGINE = "gcp_neural2"
            print(f"      ✅ [Google Cloud TTS] Frase sintetizada: '{phrase[:30]}...' ({dur:.2f}s)")
            return trimmed
    except Exception as e:
        print(f"      ⚠️ GCP TTS no disponible ({e}), usando edge-tts fallback...")

    LAST_USED_TTS_ENGINE = "edge_tts_fallback"
    warnings.warn(
        "GCP TTS no disponible para la locución clínica. Utilizando fallback edge-tts.",
        UserWarning,
        stacklevel=2
    )
    pcm = synthesize_raw_tts(phrase, voice=voice)
    return trim_silence(pcm)


def build_guided_phrase_audio_and_timeline(
    script_text: str,
    prep_silence_sec: float = 2.5,
    post_silence_sec: float = 2.0,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B",
    output_wav_path: str = "public/media/audio/cadensa_phrase_sample.wav",
    output_timeline_path: str = "public/media/audio/cadensa_phrase_timeline.json"
) -> tuple[str, str, dict]:
    """Construye audio clínico para frases terapéuticas con pausas fisiológicas."""
    print("=" * 80)
    print("🎙️ CADENSA — GENERADOR DE AUDIO DE FRASE CLÍNICA GUIADA")
    print("=" * 80)
    print(f"   👉 Texto de Guía:       {script_text}")
    print(f"   👉 Inhalación Inicial:  {prep_silence_sec:.2f}s")
    print(f"   👉 Pausa Relajatoria:   {post_silence_sec:.2f}s")

    phrase_pcm = synthesize_phrase_pcm(script_text, voice=voice, gcp_voice=gcp_voice)
    phrase_dur = len(phrase_pcm) / SAMPLE_RATE

    prep_samples = int(prep_silence_sec * SAMPLE_RATE)
    post_samples = int(post_silence_sec * SAMPLE_RATE)

    full_audio = [
        np.zeros(prep_samples, dtype=np.int16),
        phrase_pcm,
        np.zeros(post_samples, dtype=np.int16)
    ]
    final_pcm = np.concatenate(full_audio)
    total_duration = round(len(final_pcm) / SAMPLE_RATE, 3)

    breathing_intervals = [
        [0.0, round(prep_silence_sec, 3)],
        [round(prep_silence_sec + phrase_dur, 3), total_duration]
    ]

    syllable_events = [
        {
            "syllable": script_text[:20] + "...",
            "time": round(prep_silence_sec, 3),
            "duration": round(phrase_dur, 3),
            "box_index": 0
        }
    ]

    os.makedirs(os.path.dirname(os.path.abspath(output_wav_path)), exist_ok=True)
    with wave.open(output_wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(final_pcm.tobytes())

    # Variante de alta fidelidad 48 kHz para composición final
    audio_48k_path = f"{os.path.splitext(output_wav_path)[0]}_48k.wav"
    try:
        resample_wav_to_48k(output_wav_path, audio_48k_path)
    except Exception as e:
        print(f"   ⚠️ No fue posible generar variante 48 kHz: {e}")
        audio_48k_path = None

    timeline_data = {
        "bpm": None,
        "tts_mode": "guided_phrase",
        "prep_silence_sec": prep_silence_sec,
        "post_silence_sec": post_silence_sec,
        "total_duration": total_duration,
        "breathing_intervals": breathing_intervals,
        "syllable_events": syllable_events,
        "script_text": script_text,
        "tts_engine": LAST_USED_TTS_ENGINE,
        "audio_48k_path": audio_48k_path
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_timeline_path)), exist_ok=True)
    with open(output_timeline_path, "w", encoding="utf-8") as f:
        json.dump(timeline_data, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Audio clínico generado:    {output_wav_path} ({total_duration}s)")
    print(f"   ✅ Mapa temporal (Timeline):  {output_timeline_path}")
    return output_wav_path, output_timeline_path, timeline_data


def build_box_breathing_audio_and_timeline(
    phase_duration_sec: float = 4.0,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B",
    output_wav_path: str = "public/media/audio/cadensa_box_breathing.wav",
    output_timeline_path: str = "public/media/audio/cadensa_box_breathing_timeline.json",
    with_voice_cues: bool = True
) -> tuple[str, str, dict]:
    """
    Construye audio y timeline para el ciclo de Respiración Cuadrada (4-4-4-4).
    Fases: INHALAR (4s) -> RETENER (4s) -> EXHALAR (4s) -> VACIAR (4s) = 16s.
    """
    print("=" * 80)
    print("🌬️ CADENSA — GENERADOR DE AUDIO Y TIMELINE BOX BREATHING (4-4-4-4)")
    print("=" * 80)
    print(f"   👉 Duración por fase:   {phase_duration_sec:.1f}s")
    total_duration = round(phase_duration_sec * 4.0, 3)

    phase_cues = [
        ("INHALAR", "Inhala profundamente"),
        ("RETENER", "Sostén el aire"),
        ("EXHALAR", "Exhala con calma"),
        ("VACIAR", "Mantén el vacío")
    ]

    phase_samples = int(phase_duration_sec * SAMPLE_RATE)
    audio_blocks = []
    phases_meta = []
    events_meta = []

    for idx, (p_name, p_text) in enumerate(phase_cues):
        t_start = round(idx * phase_duration_sec, 3)
        t_end = round(t_start + phase_duration_sec, 3)

        phases_meta.append({
            "name": p_name,
            "cue": p_text,
            "start": t_start,
            "end": t_end,
            "action": ["expand", "hold", "contract", "pause"][idx]
        })
        events_meta.append({
            "syllable": p_name,
            "time": t_start,
            "duration": phase_duration_sec,
            "box_index": idx
        })

        if with_voice_cues:
            try:
                cue_pcm = synthesize_phrase_pcm(p_text, voice=voice, gcp_voice=gcp_voice)
                cue_pcm = trim_silence(cue_pcm)
                if len(cue_pcm) > phase_samples:
                    cue_pcm = cue_pcm[:phase_samples]
                silence_fill = phase_samples - len(cue_pcm)
                block = np.concatenate([cue_pcm, np.zeros(silence_fill, dtype=np.int16)])
            except Exception:
                block = np.zeros(phase_samples, dtype=np.int16)
        else:
            block = np.zeros(phase_samples, dtype=np.int16)

        audio_blocks.append(block)

    final_pcm = np.concatenate(audio_blocks)
    os.makedirs(os.path.dirname(os.path.abspath(output_wav_path)), exist_ok=True)
    with wave.open(output_wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(final_pcm.tobytes())

    # Variante de alta fidelidad 48 kHz para composición final
    audio_48k_path = f"{os.path.splitext(output_wav_path)[0]}_48k.wav"
    try:
        resample_wav_to_48k(output_wav_path, audio_48k_path)
    except Exception as e:
        print(f"   ⚠️ No fue posible generar variante 48 kHz: {e}")
        audio_48k_path = None

    timeline_data = {
        "bpm": None,
        "tts_mode": "breathing_cycle",
        "phase_duration_sec": phase_duration_sec,
        "total_duration": total_duration,
        "breathing_intervals": [[0.0, total_duration]],
        "phases": phases_meta,
        "syllable_events": events_meta,
        "tts_engine": LAST_USED_TTS_ENGINE,
        "audio_48k_path": audio_48k_path
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_timeline_path)), exist_ok=True)
    with open(output_timeline_path, "w", encoding="utf-8") as f:
        json.dump(timeline_data, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Audio Box Breathing generado: {output_wav_path} ({total_duration}s)")
    print(f"   ✅ Mapa temporal (Timeline):     {output_timeline_path}")
    return output_wav_path, output_timeline_path, timeline_data


def build_technique_audio_from_catalog(
    technique_id_or_dict: str | dict,
    catalog_path: str = "scripts/techniques_media_catalog.json",
    output_wav_path: str = None,
    output_timeline_path: str = None,
    voice: str = "es-MX-JorgeNeural",
    gcp_voice: str = "es-US-Neural2-B"
) -> tuple[str, str, dict]:
    """Genera audio y timeline clínicos leyendo la entrada del catálogo maestro de técnicas."""
    if isinstance(technique_id_or_dict, str):
        if not os.path.exists(catalog_path):
            raise FileNotFoundError(f"Catálogo maestro no encontrado en: {catalog_path}")
        with open(catalog_path, "r", encoding="utf-8") as f:
            catalog = json.load(f)
        matched = None
        target_id = technique_id_or_dict.lower().replace("-", "_")
        for item in catalog.get("techniques", []):
            item_id = item.get("id", "").lower().replace("-", "_")
            item_slug = item.get("slug", "").lower().replace("-", "_")
            if target_id in (item_id, item_slug):
                matched = item
                break
        if not matched:
            raise ValueError(f"Técnica '{technique_id_or_dict}' no encontrada en el catálogo")
        tech = matched
    else:
        tech = technique_id_or_dict

    slug = tech.get("slug", tech.get("id", "technique"))
    wav_out = output_wav_path or f"public/media/audio/{slug}_sample.wav"
    tl_out = output_timeline_path or f"public/media/audio/{slug}_timeline.json"

    tts_mode = tech.get("tts_mode", "sts_syllables")
    prep_silence = tech.get("prep_silence_sec", 2.5)
    post_silence = tech.get("post_silence_sec", 2.0)

    if tts_mode == "sts_syllables":
        syllables = tech.get("syllables", ["CA", "DEN", "SA"])
        bpm = tech.get("bpm", 60.0) or 60.0
        return build_sts_audio_and_timeline(
            syllables=syllables,
            bpm=bpm,
            prep_silence_sec=prep_silence,
            post_silence_sec=post_silence,
            voice=voice,
            gcp_voice=gcp_voice,
            output_wav_path=wav_out,
            output_timeline_path=tl_out
        )
    elif tts_mode == "breathing_cycle":
        phase_dur = tech.get("phase_duration_sec", 4.0)
        return build_box_breathing_audio_and_timeline(
            phase_duration_sec=phase_dur,
            voice=voice,
            gcp_voice=gcp_voice,
            output_wav_path=wav_out,
            output_timeline_path=tl_out
        )
    else:  # guided_phrase o prolonged_vowel
        script_text = tech.get("script_text", "Inhala con calma y vocaliza suavemente.")
        return build_guided_phrase_audio_and_timeline(
            script_text=script_text,
            prep_silence_sec=prep_silence,
            post_silence_sec=post_silence,
            voice=voice,
            gcp_voice=gcp_voice,
            output_wav_path=wav_out,
            output_timeline_path=tl_out
        )


def main():
    parser = argparse.ArgumentParser(description="Generador de Audio Clínico Fonoaudiológico para Cadensa.")
    parser.add_argument("--technique", type=str, default=None, help="ID o slug de la técnica del catálogo.")
    parser.add_argument("--catalog", type=str, default="scripts/techniques_media_catalog.json", help="Ruta al catálogo.")
    parser.add_argument("--syllables", nargs="+", default=["CA", "DEN", "SA"], help="Lista de sílabas para STS.")
    parser.add_argument("--bpm", type=float, default=60.0, help="Tempo de compás en BPM.")
    parser.add_argument("--prep-silence", type=float, default=2.5, help="Segundos de inhalación preparatoria inicial.")
    parser.add_argument("--post-silence", type=float, default=2.0, help="Segundos de silencio post-ejercicio.")
    parser.add_argument("--voice", type=str, default="es-MX-JorgeNeural", help="Voz TTS en español (fallback).")
    parser.add_argument("--gcp-voice", type=str, default="es-US-Neural2-B", help="Voz Google Cloud TTS con SSML.")
    parser.add_argument("--output-wav", type=str, default=None, help="Ruta WAV de salida.")
    parser.add_argument("--output-timeline", type=str, default=None, help="Ruta JSON del timeline.")

    args = parser.parse_args()

    if args.technique:
        build_technique_audio_from_catalog(
            technique_id_or_dict=args.technique,
            catalog_path=args.catalog,
            output_wav_path=args.output_wav,
            output_timeline_path=args.output_timeline,
            voice=args.voice,
            gcp_voice=args.gcp_voice
        )
    else:
        out_wav = args.output_wav or "public/media/audio/cadensa_sts_sample.wav"
        out_tl = args.output_timeline or "public/media/audio/cadensa_sts_timeline.json"
        build_sts_audio_and_timeline(
            syllables=args.syllables,
            bpm=args.bpm,
            prep_silence_sec=args.prep_silence,
            post_silence_sec=args.post_silence,
            voice=args.voice,
            gcp_voice=args.gcp_voice,
            output_wav_path=out_wav,
            output_timeline_path=out_tl
        )


if __name__ == "__main__":
    main()

