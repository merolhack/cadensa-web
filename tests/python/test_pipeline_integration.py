#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tests de Integración del Pipeline de Producción (Fase 1 a Fase 4)
Cadensa — Habla Rítmica Silábica (STS)
"""

import os
import shutil
import subprocess
import json
import pytest

from scripts.compose_cadensa_video import (
    compose_video,
    AVATAR_X,
    AVATAR_Y,
    AVATAR_SIZE
)

# Coordenadas derivadas canónicamente del layout del lienzo institucional (1920x1080)
LIP_ROI_Y_MIN = AVATAR_Y + int(0.60 * AVATAR_SIZE)   # 140 + 480 = 620
LIP_ROI_Y_MAX = AVATAR_Y + int(0.825 * AVATAR_SIZE)  # 140 + 660 = 800
LIP_ROI_X_MIN = AVATAR_X + int(0.35 * AVATAR_SIZE)   # 100 + 280 = 380
LIP_ROI_X_MAX = AVATAR_X + int(0.60 * AVATAR_SIZE)   # 100 + 480 = 580

TEST_VIDEO_SAMPLE = "public/cadensa_rhythm_3s.mp4"
AUDIO_SAMPLE = "public/media/audio/syllable-timed-speech_sample.wav" if os.path.exists("public/media/audio/syllable-timed-speech_sample.wav") else "public/media/audio/cadensa_sts_sample.wav"
TIMELINE_SAMPLE = "public/media/audio/syllable-timed-speech_timeline.json" if os.path.exists("public/media/audio/syllable-timed-speech_timeline.json") else "public/media/audio/cadensa_sts_timeline.json"


def probe_streams(video_path: str) -> list[dict]:
    """Inspecciona todos los flujos (video y audio) contenidos en el archivo multimedia."""
    ffprobe_cmd = shutil.which("ffprobe")
    if ffprobe_cmd:
        cmd = [
            ffprobe_cmd,
            "-v", "error",
            "-show_streams",
            "-of", "json",
            video_path
        ]
    else:
        wsl_path = video_path.replace("\\", "/")
        if len(wsl_path) > 1 and wsl_path[1] == ":":
            drive = wsl_path[0].lower()
            wsl_path = f"/mnt/{drive}" + wsl_path[2:]
        cmd = [
            "wsl",
            "ffprobe",
            "-v", "error",
            "-show_streams",
            "-of", "json",
            wsl_path
        ]

    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(res.stdout).get("streams", [])


def test_composer_pipeline_integration(tmp_path):
    """
    Prueba de integración rápida (Fase 3):
    Toma un clip corto de prueba (3 segundos), lo ensambla sobre el lienzo 1920x1080
    con el audio clínico y el timeline, y valida:
    1. Que el video final sea creado exitosamente en el destino.
    2. Que el archivo tenga un tamaño representativo (> 50 KB).
    3. Que contenga tanto flujo de video H.264 (1920x1080) como flujo de audio AAC.
    """
    if not os.path.exists(TEST_VIDEO_SAMPLE):
        pytest.skip(f"Video corto de prueba '{TEST_VIDEO_SAMPLE}' no disponible.")
    if not os.path.exists(AUDIO_SAMPLE):
        pytest.skip(f"Audio clínico de prueba '{AUDIO_SAMPLE}' no disponible.")

    output_video = str(tmp_path / "cadensa_test_integration.mp4")

    # Ejecutar compositor clínico
    result_path = compose_video(
        face_video_path=TEST_VIDEO_SAMPLE,
        audio_path=AUDIO_SAMPLE,
        output_path=output_video,
        timeline_path=TIMELINE_SAMPLE if os.path.exists(TIMELINE_SAMPLE) else None,
        bpm=60.0
    )

    # 1. Validar existencia y tamaño
    assert os.path.exists(result_path), f"El archivo resultante no fue creado: {result_path}"
    file_size = os.path.getsize(result_path)
    assert file_size > 50_000, f"El archivo resultante es sospechosamente pequeño: {file_size} bytes"

    # 2. Validar flujos de audio y video mediante ffprobe
    streams = probe_streams(result_path)
    codec_types = [s.get("codec_type") for s in streams]

    assert "video" in codec_types, "El archivo compuesto carece de flujo de video"
    assert "audio" in codec_types, "El archivo compuesto carece de flujo de audio multiplexado"

    video_stream = next(s for s in streams if s.get("codec_type") == "video")
    assert video_stream.get("width") == 1920
    assert video_stream.get("height") == 1080

    audio_stream = next(s for s in streams if s.get("codec_type") == "audio")
    assert audio_stream.get("codec_name") == "aac", f"Codec de audio no esperado: {audio_stream.get('codec_name')}"


def test_orchestrator_pipeline_flow_mocked(tmp_path, mocker):
    """
    Prueba de integración simulada del orquestador masivo (scripts/generate_all_techniques.py).
    Verifica con mocks rigurosos:
    1. El orden estricto de ejecución de las 5 fases:
       Audio Clínico -> SadTalker -> Purga VRAM -> Wav2Lip -> GFPGAN -> Compositor -> Purga VRAM -> Wiki Log.
    2. El paso encadenado de artefactos entre fases:
       SadTalker produce base_video -> Wav2Lip recibe base_video -> GFPGAN recibe wav2lip_output -> Compositor recibe restored_face.
    3. Que se use el audio específico de la técnica ({slug}_sample.wav) en todas las fases.
    """
    from scripts.generate_all_techniques import run_batch_production

    call_history = []

    # Aislar directorios de salida en tmp_path para no contaminar archivos de producción
    tmp_out = str(tmp_path / "techniques")
    tmp_audio = str(tmp_path / "audio")
    os.makedirs(tmp_out, exist_ok=True)
    os.makedirs(tmp_audio, exist_ok=True)
    mocker.patch("scripts.generate_all_techniques.OUTPUT_DIR", tmp_out)
    mocker.patch("scripts.generate_all_techniques.AUDIO_DIR", tmp_audio)

    # Mock Fase 0: Audio Builder
    def mock_build_audio(technique_id_or_dict, output_wav_path, output_timeline_path):
        call_history.append(("build_audio", output_wav_path, output_timeline_path))
        with open(output_wav_path, "wb") as f:
            f.write(b"RIFF_MOCK_WAV")
        with open(output_timeline_path, "w", encoding="utf-8") as f:
            json.dump({"breathing_intervals": [[0.0, 2.5]], "syllable_events": []}, f)
        return output_wav_path, output_timeline_path

    # Mock Fase 1: SadTalker en ComfyUI
    def mock_sadtalker(workflow_path, image_path, audio_path, technique_slug, **kwargs):
        call_history.append(("sadtalker", audio_path, technique_slug))
        fake_sadtalker_video = str(tmp_path / f"{technique_slug}_sadtalker_mock.mp4")
        with open(fake_sadtalker_video, "wb") as f:
            f.write(b"MOCK_SADTALKER_VIDEO")
        return fake_sadtalker_video

    # Mock Purga de VRAM
    def mock_purge_vram(server_url="http://127.0.0.1:8188"):
        call_history.append(("purge_vram", server_url))
        return True

    # Mock Fase 2: Wav2Lip GAN
    def mock_wav2lip(face_video_path, audio_path, output_video_path):
        call_history.append(("wav2lip", face_video_path, audio_path, output_video_path))
        with open(output_video_path, "wb") as f:
            f.write(b"MOCK_WAV2LIP_VIDEO")
        return output_video_path

    # Mock Fase 3: GFPGAN (ejecutado vía subprocess.run)
    def mock_subprocess_run(cmd, check=True, **kwargs):
        call_history.append(("gfpgan_subprocess", cmd))
        out_idx = cmd.index("--output-video") + 1
        out_path = cmd[out_idx]
        with open(out_path, "wb") as f:
            f.write(b"MOCK_RESTORED_FACE_VIDEO")
        return mocker.MagicMock(returncode=0)

    # Mock Fase 4: Compositor final (compose_cadensa_video.py)
    def mock_compose(face_video_path, audio_path, output_path, **kwargs):
        call_history.append(("compose_video", face_video_path, audio_path, output_path))
        with open(output_path, "wb") as f:
            f.write(b"MOCK_FINAL_VIDEO_1920X1080")
        return output_path

    # Mock Ingesta en Wiki
    def mock_log_wiki(technique_meta, video_path, audio_path, timeline_path, status="SUCCESS"):
        call_history.append(("log_wiki", technique_meta.get("id"), status))

    mocker.patch("scripts.generate_all_techniques.build_technique_audio_from_catalog", side_effect=mock_build_audio)
    mocker.patch("scripts.generate_all_techniques.generate_sadtalker_video", side_effect=mock_sadtalker)
    mocker.patch("scripts.generate_all_techniques.purge_comfyui_vram", side_effect=mock_purge_vram)
    mocker.patch("scripts.wav2lip_runner.run_wav2lip_inference", side_effect=mock_wav2lip)
    mocker.patch("subprocess.run", side_effect=mock_subprocess_run)
    mocker.patch("scripts.generate_all_techniques.compose_video", side_effect=mock_compose)
    mocker.patch("scripts.generate_all_techniques.log_technique_to_wiki", side_effect=mock_log_wiki)

    # Ejecutar sólo para la técnica easy-onset
    results = run_batch_production(
        catalog_path="scripts/techniques_media_catalog.json",
        selected_techniques=["easy-onset"],
        dry_run=False
    )

    assert len(results) == 1, "Se esperaba exactamente un resultado para easy-onset"
    assert results[0]["status"] == "SUCCESS", f"La ejecución falló: {results[0]}"

    # 1. Verificar orden estricto de fases
    stage_names = [c[0] for c in call_history]
    expected_sequence = [
        "build_audio",
        "sadtalker",
        "purge_vram",
        "wav2lip",
        "gfpgan_subprocess",
        "compose_video",
        "purge_vram",
        "log_wiki"
    ]
    assert stage_names == expected_sequence, f"Secuencia de fases incorrecta: {stage_names}"

    # 2. Verificar encadenamiento de rutas
    sadtalker_out = [c[0] for c in call_history if c[0] == "sadtalker"]
    wav2lip_call = next(c for c in call_history if c[0] == "wav2lip")
    gfpgan_call = next(c for c in call_history if c[0] == "gfpgan_subprocess")
    compose_call = next(c for c in call_history if c[0] == "compose_video")

    # Wav2Lip recibe el video que produjo SadTalker
    assert "easy-onset_sadtalker_mock.mp4" in wav2lip_call[1]

    # GFPGAN recibe el video que produjo Wav2Lip
    cmd_gfpgan = gfpgan_call[1]
    in_idx = cmd_gfpgan.index("--input-video") + 1
    assert "easy-onset_wav2lip.mp4" in cmd_gfpgan[in_idx]

    # Compositor recibe el video que produjo GFPGAN
    out_idx = cmd_gfpgan.index("--output-video") + 1
    restored_face_path = cmd_gfpgan[out_idx]
    assert compose_call[1] == restored_face_path

    # 3. Verificar que se usa el audio específico de la técnica en todas las fases
    assert "easy-onset_sample.wav" in wav2lip_call[2]
    assert "easy-onset_sample.wav" in compose_call[2]


def test_orchestrator_resilience_on_phase_failure(tmp_path, mocker):
    """
    Requisito B2: Verifica que si una fase del pipeline lanza excepción (ej. fallo GPU en Wav2Lip):
    1. El orquestador capture limpiamente el error y marque la técnica como FAILED.
    2. NO componga ni publique un video parcial.
    3. Si existía un video previo intacto, este NO sea sobrescrito ni destruido.
    4. El orquestador continúe procesando las técnicas restantes del lote.
    """
    from scripts.generate_all_techniques import run_batch_production

    tmp_out = str(tmp_path / "techniques")
    tmp_audio = str(tmp_path / "audio")
    os.makedirs(tmp_out, exist_ok=True)
    os.makedirs(tmp_audio, exist_ok=True)
    mocker.patch("scripts.generate_all_techniques.OUTPUT_DIR", tmp_out)
    mocker.patch("scripts.generate_all_techniques.AUDIO_DIR", tmp_audio)

    # Crear un archivo previo preexistente para simular video anterior intacto
    prior_video = os.path.join(tmp_out, "easy-onset_avatar_final.mp4")
    with open(prior_video, "wb") as f:
        f.write(b"ORIGINAL_INTACT_VIDEO_CONTENT")

    mocker.patch("scripts.generate_all_techniques.build_technique_audio_from_catalog")
    mocker.patch("scripts.generate_all_techniques.generate_sadtalker_video", return_value="mock_sadtalker.mp4")
    mocker.patch("scripts.generate_all_techniques.purge_comfyui_vram")
    mock_compose = mocker.patch("scripts.generate_all_techniques.compose_video")

    # Simular fallo solo en easy-onset y éxito en la siguiente técnica
    def mock_wav2lip(*args, **kwargs):
        audio_file = kwargs.get("audio_path") or (args[1] if len(args) > 1 else "")
        output_video = kwargs.get("output_video_path") or (args[2] if len(args) > 2 else "mock_wav2lip.mp4")
        if "easy-onset" in audio_file:
            raise RuntimeError("CUDA Out of Memory in Wav2Lip for easy-onset")
        with open(output_video, "wb") as f:
            f.write(b"MOCK_WAV2LIP")
        return output_video

    mocker.patch("scripts.wav2lip_runner.run_wav2lip_inference", side_effect=mock_wav2lip)
    mocker.patch("subprocess.run")  # Mock GFPGAN subprocess

    results = run_batch_production(
        catalog_path="scripts/techniques_media_catalog.json",
        selected_techniques=["easy-onset", "syllable-timed-speech"],
        dry_run=False
    )

    assert len(results) == 2
    by_id = {r["id"]: r for r in results}

    # Requisito B2: easy-onset falló con su excepción capturada
    assert "easy-onset" in by_id
    assert "FAILED:" in by_id["easy-onset"]["status"]
    assert "CUDA Out of Memory" in by_id["easy-onset"]["status"]

    # Requisito B2: El archivo original previo se preservó intacto
    with open(prior_video, "rb") as f:
        assert f.read() == b"ORIGINAL_INTACT_VIDEO_CONTENT"

    # Requisito B2: NO se llamó al compositor para la técnica que falló
    for c in mock_compose.call_args_list:
        assert "easy-onset" not in str(c)

    # Requisito B2: El lote continuó y procesó la otra técnica exitosamente
    assert "syllable-timed-speech" in by_id
    assert by_id["syllable-timed-speech"]["status"] == "SUCCESS"


def test_easy_onset_and_sts_videos_are_distinct():
    """Valida que los videos de Easy Onset y STS tengan hashes y tamaños distintos."""
    sts_path = "public/media/techniques/syllable-timed-speech_avatar_final.mp4"
    if not os.path.exists(sts_path):
        sts_path = "public/media/techniques/cadensa_sts_avatar_final.mp4"
    easy_path = "public/media/techniques/easy-onset_avatar_final.mp4"

    if not os.path.exists(sts_path) or not os.path.exists(easy_path):
        pytest.skip("Videos de STS o Easy Onset no generados aún en disco.")

    import hashlib
    def get_md5(p):
        h = hashlib.md5()
        with open(p, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()

    sts_hash = get_md5(sts_path)
    easy_hash = get_md5(easy_path)
    assert sts_hash != easy_hash, "Los videos de STS y Easy Onset son idénticos a nivel binario."
    assert os.path.getsize(sts_path) != os.path.getsize(easy_path), "Los tamaños de archivo son idénticos."


def test_mouth_movement_variance_between_techniques():
    """
    Valida con OpenCV que la región de los labios difiera significativamente
    entre el video de STS y el de Easy Onset en el momento de fonación activa (t = 3.5s).
    Las coordenadas labiales derivan canónicamente del lienzo (AVATAR_X, AVATAR_Y, AVATAR_SIZE).
    """
    sts_path = "public/media/techniques/syllable-timed-speech_avatar_final.mp4"
    if not os.path.exists(sts_path):
        sts_path = "public/media/techniques/cadensa_sts_avatar_final.mp4"
    easy_path = "public/media/techniques/easy-onset_avatar_final.mp4"

    if not os.path.exists(sts_path) or not os.path.exists(easy_path):
        pytest.skip("Videos de STS o Easy Onset no generados aún en disco.")

    import cv2
    import numpy as np

    def get_frame_at_sec(vpath, sec):
        cap = cv2.VideoCapture(vpath)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        target_frame = int(sec * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, frame = cap.read()
        cap.release()
        return frame if ret else None

    frame_sts = get_frame_at_sec(sts_path, 3.5)
    frame_easy = get_frame_at_sec(easy_path, 3.5)

    assert frame_sts is not None, "No se pudo extraer frame de STS"
    assert frame_easy is not None, "No se pudo extraer frame de Easy Onset"

    # Región orofacial derivada canónicamente
    mouth_sts = frame_sts[LIP_ROI_Y_MIN:LIP_ROI_Y_MAX, LIP_ROI_X_MIN:LIP_ROI_X_MAX]
    mouth_easy = frame_easy[LIP_ROI_Y_MIN:LIP_ROI_Y_MAX, LIP_ROI_X_MIN:LIP_ROI_X_MAX]

    diff = cv2.absdiff(mouth_sts, mouth_easy)
    mean_diff = float(np.mean(diff))

    assert mean_diff > 4.0, f"La región labial no muestra diferencia motora suficiente: mean_diff={mean_diff:.2f}"


def compute_vertical_mouth_aperture_series(video_path: str) -> list[float]:
    """
    Calcula la serie temporal de apertura vertical de la cavidad labial a 25 fps.
    Compensa el movimiento global de la cabeza midiendo la altura interna efectiva
    de la hendidura oral (thresholding de cavidad interna oscura) en la ROI labial.
    """
    import cv2
    import numpy as np

    cap = cv2.VideoCapture(video_path)
    apertures = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # ROI labial en el lienzo institucional (y: 640..780, x: 420..540)
        mouth = frame[LIP_ROI_Y_MIN + 20:LIP_ROI_Y_MAX - 20, LIP_ROI_X_MIN + 40:LIP_ROI_X_MAX - 40]
        gray = cv2.cvtColor(mouth, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY_INV)[1]
        center_cols = thresh[:, thresh.shape[1] // 4: 3 * thresh.shape[1] // 4]
        vert_open = float(np.sum(center_cols > 0) / max(1, center_cols.shape[1]))
        apertures.append(vert_open)
    cap.release()
    return apertures


def find_best_lag_pearson_correlation(audio_rms: list[float], mouth_aperture: list[float], fps: float = 25.0, max_lag_ms: int = 500) -> tuple[float, int]:
    """
    Evalúa la correlación de Pearson entre la envolvente RMS del audio y la apertura labial,
    explorando desfases temporales (lags) en [-max_lag_ms, +max_lag_ms] con resolución de 1 frame.

    Convención Canónica de Signo:
    - lag_frames < 0: boca adelantada al audio (anticipación fisiológica).
    - lag_frames > 0: boca retrasada respecto al audio (reacción tardía).
    - lag_frames = 0: coincidencia síncrona exacta.
    Retorna (mejor_r, mejor_lag_ms).
    """
    import numpy as np

    max_lag_frames = int(round((max_lag_ms / 1000.0) * fps))
    best_r = -2.0
    best_lag_ms = 0
    N = min(len(audio_rms), len(mouth_aperture))
    a = np.array(audio_rms[:N], dtype=np.float64)
    m = np.array(mouth_aperture[:N], dtype=np.float64)

    for lag_f in range(-max_lag_frames, max_lag_frames + 1):
        if lag_f < 0:
            m_sub = m[:lag_f]
            a_sub = a[-lag_f:]
        elif lag_f > 0:
            m_sub = m[lag_f:]
            a_sub = a[:-lag_f]
        else:
            m_sub = m
            a_sub = a
        if len(a_sub) < 10 or np.std(a_sub) < 1e-6 or np.std(m_sub) < 1e-6:
            continue
        r = float(np.corrcoef(a_sub, m_sub)[0, 1])
        if r > best_r:
            best_r = r
            best_lag_ms = int(round(lag_f * (1000.0 / fps)))

    return best_r, best_lag_ms


def test_objective_lipsync_energy_correlation_and_quiescence():
    """
    Test objetivo de Lip-Sync y reposo fisiológico sobre Easy Onset (Fase A3/A5):
    Aplica criterios clínicos honestos:
    1. Correlación de Pearson r >= +0.30 con desfase temporal óptimo [-200ms, +200ms].
    2. Apertura media en respiración diafragmática <= 3.5 px (reposo bucal efectivo).
    3. Cociente fonación / reposo >= 1.80x (apertura claramente mayor al fonar).
    4. Apertura máxima en inhalación <= 8.0 px (ausencia de muecas o apertura prematura).
    """
    video_path = "public/media/techniques/easy-onset_avatar_final.mp4"
    audio_path = "public/media/audio/easy-onset_sample.wav"
    timeline_path = "public/media/audio/easy-onset_timeline.json"

    if not os.path.exists(video_path) or not os.path.exists(audio_path) or not os.path.exists(timeline_path):
        pytest.skip("Archivos multimedia de Easy Onset no encontrados en disco para análisis de lip-sync.")

    import wave
    import numpy as np

    # 1. Envolvente RMS del audio
    wf = wave.open(audio_path, "rb")
    rate = wf.getframerate()
    n_samples = wf.getnframes()
    raw = wf.readframes(n_samples)
    wf.close()
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

    fps = 25.0
    samples_per_frame = int(rate / fps)
    apertures = compute_vertical_mouth_aperture_series(video_path)
    audio_rms = [
        float(np.sqrt(np.mean(audio[i * samples_per_frame:(i + 1) * samples_per_frame] ** 2)))
        for i in range(len(apertures))
    ]

    best_r, best_lag_ms = find_best_lag_pearson_correlation(audio_rms, apertures, fps=fps, max_lag_ms=200)

    with open(timeline_path, "r", encoding="utf-8") as f:
        timeline = json.load(f)

    b_intervals = timeline.get("breathing_intervals", [[0.0, 2.5]])
    b_vals = [apertures[i] for i in range(len(apertures)) if any(b[0] <= i / fps <= b[1] for b in b_intervals)]
    p_vals = [apertures[i] for i in range(len(apertures)) if not any(b[0] <= i / fps <= b[1] for b in b_intervals)]

    mean_b = float(np.mean(b_vals)) if b_vals else 0.0
    mean_p = float(np.mean(p_vals)) if p_vals else 0.0
    max_b = float(np.max(b_vals)) if b_vals else 0.0
    ratio = mean_p / mean_b if mean_b > 0 else 1.0

    # Aserciones clínicas estrictas
    assert best_r >= 0.30, f"Correlación r insuficiente: {best_r:.3f} (lag {best_lag_ms} ms, umbral >= 0.30)"
    assert mean_b <= 3.5, f"Boca excesivamente abierta en reposo inhalatorio: {mean_b:.2f} px (umbral <= 3.5 px)"
    assert ratio >= 1.80, f"Cociente fonación/reposo insuficiente: {ratio:.2f}x (umbral >= 1.80x)"
    assert max_b <= 8.0, f"Apertura máxima espasmódica en reposo: {max_b:.2f} px (umbral <= 8.0 px)"


@pytest.mark.parametrize("slug,name", [
    ("syllable-timed-speech", "Habla Rítmica Silábica (STS)"),
    ("light-contact", "Contacto Articular Suave"),
    ("prolonged-speech", "Habla Prolongada"),
    ("box-breathing", "Respiración Cuadrada (Box Breathing)"),
    ("pull-out", "Salida Suave (Pull-Out)"),
    ("cancellation", "Cancelación Post-Bloqueo"),
])
def test_all_techniques_honest_clinical_benchmark(slug, name):
    """
    Evaluación de las 6 técnicas en producción regeneradas a 512px con oclusión labial neutra.
    Aplica los umbrales clínicos rigurosos (Fase C) de forma estricta (0 xfail):
    1. Correlación acústico-labial r >= +0.30 con desfase temporal óptimo en ventana [-500ms, +500ms].
    2. Apertura media en reposo diafragmático <= 3.5 px.
    3. Cociente fonación / reposo >= 1.80x.
    4. Apertura máxima en reposo <= 8.0 px.
    5. Para Box Breathing: >= 80% de fotogramas con boca cerrada fuera de guías vocales.
    """
    video_cands = [
        f"public/media/techniques/{slug}_avatar_final.mp4",
        "public/media/techniques/cadensa_sts_avatar_final.mp4" if slug == "syllable-timed-speech" else None
    ]
    video_path = next((v for v in video_cands if v and os.path.exists(v) and os.path.getsize(v) > 50000), None)

    audio_cands = [
        f"public/media/audio/{slug}_sample.wav",
        "public/media/audio/cadensa_sts_sample.wav" if slug == "syllable-timed-speech" else None,
        "public/media/audio/cadensa_box_breathing.wav" if slug == "box-breathing" else None
    ]
    audio_path = next((a for a in audio_cands if a and os.path.exists(a)), None)

    tl_cands = [
        f"public/media/audio/{slug}_timeline.json",
        "public/media/audio/cadensa_sts_timeline.json" if slug == "syllable-timed-speech" else None,
        "public/media/audio/cadensa_box_breathing_timeline.json" if slug == "box-breathing" else None
    ]
    tl_path = next((t for t in tl_cands if t and os.path.exists(t)), None)

    if not video_path or not audio_path or not tl_path:
        pytest.skip(f"Activos de '{slug}' incompletos en disco.")

    import wave
    import numpy as np

    wf = wave.open(audio_path, "rb")
    rate = wf.getframerate()
    n_samples = wf.getnframes()
    raw = wf.readframes(n_samples)
    wf.close()
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

    fps = 25.0
    samples_per_frame = int(rate / fps)
    apertures = compute_vertical_mouth_aperture_series(video_path)
    audio_rms = [
        float(np.sqrt(np.mean(audio[i * samples_per_frame:(i + 1) * samples_per_frame] ** 2)))
        for i in range(len(apertures))
    ]

    best_r, best_lag_ms = find_best_lag_pearson_correlation(audio_rms, apertures, fps=fps, max_lag_ms=500)

    with open(tl_path, "r", encoding="utf-8") as f:
        timeline = json.load(f)

    b_intervals = timeline.get("breathing_intervals", [[0.0, 2.5]])
    b_vals = [apertures[i] for i in range(len(apertures)) if any(b[0] <= i / fps <= b[1] for b in b_intervals)]
    p_vals = [apertures[i] for i in range(len(apertures)) if not any(b[0] <= i / fps <= b[1] for b in b_intervals)]

    mean_b = float(np.mean(b_vals)) if b_vals else 0.0
    mean_p = float(np.mean(p_vals)) if p_vals else 0.0
    max_b = float(np.max(b_vals)) if b_vals else 0.0
    ratio = mean_p / mean_b if mean_b > 0 else 1.0

    if slug == "box-breathing":
        # Métrica específica para Box Breathing:
        # Fases de 4s con voz en [0, 1.5s). Fuera de voz (1.5s a 4.0s de cada fase), boca cerrada.
        phase_dur = timeline.get("phase_duration_sec", 4.0)
        closed_count = 0
        non_voice_count = 0
        max_rest_ap = 0.0
        for i, ap in enumerate(apertures):
            t_sec = i / fps
            t_in_phase = t_sec % phase_dur
            if t_in_phase >= 1.5:
                non_voice_count += 1
                if ap <= 3.5:
                    closed_count += 1
                if ap > max_rest_ap:
                    max_rest_ap = ap
        pct_closed = (closed_count / max(1, non_voice_count)) * 100.0

        assert pct_closed >= 80.0, f"Box Breathing boca cerrada insuficiente: {pct_closed:.1f}%"
        assert max_rest_ap <= 8.0, f"Apertura máxima en reposo excesiva: {max_rest_ap:.2f} px"
        return

    # Aserciones clínicas estrictas y permanentes (sin xfail)
    assert best_r >= 0.30, f"Correlación r insuficiente: {best_r:.3f} (lag {best_lag_ms} ms, umbral >= 0.30)"
    assert ratio >= 1.80, f"Cociente fonación/reposo insuficiente: {ratio:.2f}x (umbral >= 1.80x)"
    assert mean_b <= 3.5, f"Boca excesivamente abierta en reposo: {mean_b:.2f} px (umbral <= 3.5 px)"
    assert max_b <= 8.0, f"Apertura máxima espasmódica en reposo: {max_b:.2f} px (umbral <= 8.0 px)"


def test_syncnet_lse_confidence_and_distance():
    """
    Evaluación formal Lip-Sync Error (LSE-C y LSE-D) vía SyncNet (Fase C).
    Verifica sobre Easy Onset que:
    1. LSE-D (distancia de error) sea acotada (<= 11.0).
    2. LSE-C (confianza de sincronía) sea positiva (>= 0.25).
    3. Desfase temporal esté acotado dentro de la ventana de búsqueda (|offset| <= 15 fotogramas).
    """
    from scripts.evaluate_syncnet import evaluate_video_syncnet

    video_path = "public/media/techniques/easy-onset_avatar_final.mp4"
    if not os.path.exists(video_path):
        pytest.skip(f"Video {video_path} no encontrado para prueba SyncNet.")

    scores = evaluate_video_syncnet(video_path)
    assert scores["lse_d"] <= 11.0, f"LSE-D excesivo: {scores['lse_d']:.3f} (umbral <= 11.0)"
    assert scores["lse_c"] >= 0.25, f"LSE-C insuficiente: {scores['lse_c']:.3f} (umbral >= 0.25)"
    assert abs(scores["offset_frames"]) <= 15, f"Offset fuera de rango: {scores['offset_frames']} frames"


