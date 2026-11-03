#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Orquestador en Lote para Producción Masiva de Técnicas Fonoaudiológicas
https://cadensa-web.pages.dev/

Propósito:
Lee el catálogo maestro (scripts/techniques_media_catalog.json) y genera de forma
secuencial y automatizada el material audiovisual clínico de alta definición para
las técnicas fonoaudiológicas de Cadensa:
1. Audio Clínico foniátrico con pausas de respiración y fonemas IPA (Google Cloud TTS).
2. Animación facial neuronal con SadTalker en ComfyUI.
3. Purga inmediata de VRAM (/free) para prevenir saturación en la GPU RTX 4060.
4. Sincronización labial de alta precisión con Wav2Lip GAN.
5. Restauración facial neuronal con GFPGANv1.4 y 2x Supersampling.
6. Composición sobre lienzo 1920x1080 con el widget visual correspondiente (metrónomo,
   orbe de respiración diafragmática, rampa de inicio suave, cronómetro de pausa, etc.).
7. Ingesta modular en el LLM Wiki (wiki/raw/comfyui/history/ y wiki/log.md).
"""

from __future__ import annotations
import os
import sys

# Asegurar que la raíz del proyecto esté en sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if os.path.abspath(".") not in sys.path:
    sys.path.insert(0, os.path.abspath("."))

import json
import time
import argparse
import datetime
import urllib.request
import subprocess

# Configurar UTF-8 en consola
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from scripts.build_clinical_audio import build_technique_audio_from_catalog
from scripts.compose_cadensa_video import compose_video

DEFAULT_CATALOG_PATH = "scripts/techniques_media_catalog.json"
DEFAULT_AVATAR_IMAGE = "public/media/images/avatar-maestro.jpg"
DEFAULT_SERVER_URL = "http://127.0.0.1:8188"
DEFAULT_SADTALKER_SIZE = int(os.environ.get("SADTALKER_SIZE", 512))
DEFAULT_SADTALKER_BATCH = int(os.environ.get("SADTALKER_BATCH", 1))
DEFAULT_GFPGAN_UPSCALE = int(os.environ.get("GFPGAN_UPSCALE", 2))
OUTPUT_DIR = "public/media/techniques"
AUDIO_DIR = "public/media/audio"
HISTORY_DIR = "wiki/raw/comfyui/history"
WIKI_LOG_PATH = "wiki/log.md"

COMFY_BASE = r"C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI"
COMFY_INPUT_DIR = os.path.join(COMFY_BASE, "input")
COMFY_OUTPUT_DIR = os.path.join(COMFY_BASE, "output")
SADTALKER_PYTHON = os.path.join(COMFY_BASE, r"custom_nodes\Comfyui-SadTalker\.venv_sadtalker\Scripts\python.exe")
WORKFLOW_PATH = "wiki/raw/comfyui/video-avatar.json"


def purge_comfyui_vram(server_url: str = DEFAULT_SERVER_URL) -> bool:
    """Envía solicitud al endpoint /free de ComfyUI para vaciar modelos de la memoria de la GPU."""
    try:
        req = urllib.request.Request(
            f"{server_url}/free",
            data=json.dumps({"unload_models": True, "free_memory": True}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
        print("   ✅ VRAM purgada exitosamente en ComfyUI (/free).")
        return True
    except Exception as e:
        print(f"   ℹ️ Nota al purgar VRAM en ComfyUI: {e}")
        return False


def generate_sadtalker_video(
    workflow_path: str,
    image_path: str,
    audio_path: str,
    technique_slug: str,
    server_url: str = DEFAULT_SERVER_URL,
    sadtalker_size: int = DEFAULT_SADTALKER_SIZE,
    sadtalker_batch: int = DEFAULT_SADTALKER_BATCH
) -> str:
    """
    Despacha un trabajo de inferencia a ComfyUI (SadTalkerIsolated)
    usando la imagen del avatar y el audio específico de la técnica.
    """
    import shutil
    import uuid
    import websocket

    comfy_input_dir = os.path.join(COMFY_BASE, "input")
    comfy_output_dir = os.path.join(COMFY_BASE, "output")
    os.makedirs(comfy_input_dir, exist_ok=True)

    image_name = os.path.basename(image_path)
    shutil.copy2(image_path, os.path.join(comfy_input_dir, image_name))

    audio_name = f"{technique_slug}_audio.wav"
    shutil.copy2(audio_path, os.path.join(comfy_input_dir, audio_name))

    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    # Remover nodos de guardado redundantes incompatibles con SadTalkerIsolated
    to_remove = [nid for nid, nd in workflow.items() if nd.get("class_type") == "SaveVideo"]
    for nid in to_remove:
        workflow.pop(nid, None)

    for node_id, node_data in workflow.items():
        ctype = node_data.get("class_type")
        if ctype == "LoadImage":
            node_data.setdefault("inputs", {})["image"] = image_name
        elif ctype in ("LoadAudio", "VHS_LoadAudio"):
            node_data.setdefault("inputs", {})["audio"] = audio_name
        elif ctype == "SadTalkerIsolated":
            inputs = node_data.setdefault("inputs", {})
            inputs["size"] = sadtalker_size
            inputs["batch_size"] = sadtalker_batch
            inputs["enhancer"] = "none"

    client_id = str(uuid.uuid4())
    ws_host = server_url.replace("http://", "").replace("https://", "")
    ws_url = f"ws://{ws_host}/ws?clientId={client_id}"

    ws = websocket.WebSocket()
    ws.connect(ws_url, timeout=15)
    ws.settimeout(600.0)

    prompt_payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{server_url}/prompt",
        data=prompt_payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            prompt_id = resp_data.get("prompt_id")
            if not prompt_id and "node_errors" in resp_data:
                ws.close()
                raise RuntimeError(f"Error en nodos ComfyUI: {resp_data['node_errors']}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        ws.close()
        raise RuntimeError(f"HTTP Error {e.code} en /prompt: {err_body}")

    print(f"   👉 [SadTalker] Inferencia iniciada en ComfyUI. Prompt ID: {prompt_id}")

    while True:
        try:
            raw_msg = ws.recv()
        except (websocket.WebSocketTimeoutException, TimeoutError):
            print("   ⏳ [SadTalker] En espera de inferencia GPU...")
            continue
        if not raw_msg or not isinstance(raw_msg, str):
            continue
        msg = json.loads(raw_msg)
        mtype = msg.get("type")
        mdata = msg.get("data", {})

        if mtype == "executing" and mdata.get("prompt_id") == prompt_id:
            if mdata.get("node") is None:
                print("   ✅ [SadTalker] Inferencia de SadTalker finalizada.")
                break
        elif mtype in ("execution_error", "execution_failed"):
            ws.close()
            raise RuntimeError(f"Fallo en ComfyUI SadTalker: {mdata}")

    ws.close()

    output_video_path = None
    with urllib.request.urlopen(f"{server_url}/history/{prompt_id}", timeout=10) as h_resp:
        history = json.loads(h_resp.read().decode("utf-8")).get(prompt_id, {})
        outputs = history.get("outputs", {})
        for n_id, n_out in outputs.items():
            if "videos" in n_out:
                for v in n_out["videos"]:
                    fname = v.get("filename")
                    subf = v.get("subfolder", "")
                    cand = os.path.join(comfy_output_dir, subf, fname) if subf else os.path.join(comfy_output_dir, fname)
                    if os.path.exists(cand):
                        output_video_path = cand
                        break
            elif "video_path" in n_out:
                cand = n_out["video_path"]
                if isinstance(cand, list):
                    cand = cand[0] if cand else None
                if cand:
                    if os.path.exists(cand):
                        output_video_path = cand
                    else:
                        cand_out = os.path.join(comfy_output_dir, cand)
                        if os.path.exists(cand_out):
                            output_video_path = cand_out
                    if os.path.exists(cand_out):
                        output_video_path = cand_out

    if not output_video_path or not os.path.exists(output_video_path):
        raise FileNotFoundError(f"Video generado por SadTalker no encontrado en ComfyUI output (prompt {prompt_id})")

    print(f"   ✅ [SadTalker] Video facial base generado: {output_video_path}")
    return output_video_path


def run_full_neural_pipeline_for_technique(
    technique_meta: dict,
    audio_wav: str,
    server_url: str = DEFAULT_SERVER_URL,
    workflow_path: str = WORKFLOW_PATH,
    avatar_image: str = DEFAULT_AVATAR_IMAGE,
    sadtalker_size: int = DEFAULT_SADTALKER_SIZE,
    sadtalker_batch: int = DEFAULT_SADTALKER_BATCH,
    gfpgan_upscale: int = DEFAULT_GFPGAN_UPSCALE
) -> str:
    """
    Ejecuta el pipeline neuronal completo de 3 fases independientes para una técnica:
    1. SadTalkerIsolated en ComfyUI -> Video facial base animado con el audio específico.
    2. Wav2Lip GAN -> Sincronización labial de alta precisión fonemática.
    3. GFPGANv1.4 + Supersampling -> Restauración de textura de piel, dientes y labios.
    """
    slug = technique_meta.get("slug", technique_meta.get("id"))

    # FASE 1: SadTalker en ComfyUI
    print(f"\n[PIPELINE NEURONAL 1/3: SadTalker (Rostro Base y Parpadeo - {sadtalker_size}px, Batch {sadtalker_batch})]")
    sadtalker_video = generate_sadtalker_video(
        workflow_path=workflow_path,
        image_path=avatar_image,
        audio_path=audio_wav,
        technique_slug=slug,
        server_url=server_url,
        sadtalker_size=sadtalker_size,
        sadtalker_batch=sadtalker_batch
    )

    # Liberar memoria de GPU
    purge_comfyui_vram(server_url)

    # FASE 2: Sincronización Labial Precisa con Wav2Lip GAN
    print("\n[PIPELINE NEURONAL 2/3: Wav2Lip GAN (Sincronización Labial Fonética)]")
    from scripts.wav2lip_runner import run_wav2lip_inference
    wav2lip_output = os.path.join(OUTPUT_DIR, f"{slug}_wav2lip.mp4")
    run_wav2lip_inference(
        face_video_path=sadtalker_video,
        audio_path=audio_wav,
        output_video_path=wav2lip_output
    )

    # FASE 3: Restauración Facial Neuronal con GFPGANv1.4 + Supersampling
    print(f"\n[PIPELINE NEURONAL 3/3: GFPGANv1.4 (Restauración de Labios, Dientes y Piel - Upscale {gfpgan_upscale}x)]")
    restored_face_output = os.path.join(OUTPUT_DIR, f"{slug}_face_restored.mp4")
    restore_script = os.path.join("scripts", "restore_face_pipeline.py")

    cmd_restore = [
        SADTALKER_PYTHON,
        restore_script,
        "--input-video", wav2lip_output,
        "--output-video", restored_face_output,
        "--upscale", str(gfpgan_upscale)
    ]
    subprocess.run(cmd_restore, check=True)
    print(f"   ✅ [GFPGAN] Rostro restaurado en alta fidelidad: {restored_face_output}")

    return restored_face_output


def log_technique_to_wiki(
    technique_meta: dict,
    video_path: str,
    audio_path: str,
    timeline_path: str,
    status: str = "SUCCESS"
):
    """Registra la entrega de la técnica en un archivo modular de historia y en wiki/log.md."""
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    slug = technique_meta.get("slug", technique_meta.get("id", "technique"))
    name = technique_meta.get("name", "Técnica Clínica")
    file_id = f"{date_str}_{slug}_production"
    history_file = os.path.join(HISTORY_DIR, f"{file_id}.md")

    os.makedirs(HISTORY_DIR, exist_ok=True)

    status_badge = "✅ Éxito" if status == "SUCCESS" else "⚠️ Fallo / Validación"
    file_size = os.path.getsize(video_path) if os.path.exists(video_path) else 0

    content = f"""---
title: "Producción Multimedia en Lote: {name}"
category: "raw"
tags: [comfyui, batch-production, multimedia, {slug}]
last_updated: "{date_str}"
technique_id: "{slug}"
status: "{status}"
---

# Registro de Producción: {name}

- **Fecha y Hora:** {date_str} {time_str}
- **Estado:** {status_badge}
- **Familia:** `{technique_meta.get('family')}`
- **Widget Visual:** `{technique_meta.get('visual_widget')}`
- **Video Generado:** `{video_path}` ({file_size:,} bytes)
- **Pista de Audio:** `{audio_path}`
- **Timeline Clínico:** `{timeline_path}`

## Metadatos de la Técnica
```json
{json.dumps(technique_meta, indent=2, ensure_ascii=False)}
```
"""
    with open(history_file, "w", encoding="utf-8") as f:
        f.write(content)

    # Anexar en wiki/log.md
    if os.path.exists(WIKI_LOG_PATH):
        summary_line = f"- **[{date_str} {time_str}]** comfyui-batch | Técnica: `{slug}` ({name}) | Estado: {status_badge} | Detalle: [[{file_id}]] (ver [historial](raw/comfyui/history/{file_id}.md))\n"
        with open(WIKI_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(summary_line)


def run_batch_production(
    catalog_path: str = DEFAULT_CATALOG_PATH,
    selected_techniques: list[str] = None,
    face_video_source: str = None,
    dry_run: bool = False,
    server_url: str = DEFAULT_SERVER_URL,
    sadtalker_size: int = DEFAULT_SADTALKER_SIZE,
    sadtalker_batch: int = DEFAULT_SADTALKER_BATCH,
    gfpgan_upscale: int = DEFAULT_GFPGAN_UPSCALE
) -> list[dict]:
    """Orquesta la producción en lote para las técnicas seleccionadas del catálogo."""
    if not os.path.exists(catalog_path):
        raise FileNotFoundError(f"Catálogo maestro no encontrado en: {catalog_path}")

    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog_data = json.load(f)

    all_techniques = catalog_data.get("techniques", [])
    if selected_techniques:
        targets = [t.lower().replace("-", "_") for t in selected_techniques]
        techniques_to_run = [
            t for t in all_techniques
            if t.get("id", "").lower().replace("-", "_") in targets
            or t.get("slug", "").lower().replace("-", "_") in targets
        ]
    else:
        techniques_to_run = all_techniques

    print("=" * 80)
    print("🚀 CADENSA — ORQUESTADOR DE PRODUCCIÓN MASIVA DE TÉCNICAS FONOADIOLÓGICAS")
    print("=" * 80)
    print(f"   👉 Técnicas a procesar:   {len(techniques_to_run)}")
    print(f"   👉 SadTalker Size:        {sadtalker_size}px")
    print(f"   👉 SadTalker Batch:       {sadtalker_batch}")
    print(f"   👉 GFPGAN Upscale:        {gfpgan_upscale}x")
    print(f"   👉 Modo Dry-Run:          {'ACTIVO' if dry_run else 'Inactivo'}")
    if face_video_source:
        print(f"   👉 Video fuente de rostro: {face_video_source} (Modo composición directa)")

    results = []
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(AUDIO_DIR, exist_ok=True)

    for idx, tech in enumerate(techniques_to_run, start=1):
        slug = tech.get("slug", tech.get("id"))
        name = tech.get("name")
        widget = tech.get("visual_widget")
        out_filename = tech.get("output_filename", f"{slug}_avatar_final.mp4")
        final_video_path = os.path.join(OUTPUT_DIR, out_filename)

        print("\n" + "=" * 80)
        print(f"🌟 [{idx}/{len(techniques_to_run)}] PROCESANDO: {name} (ID: {slug})")
        print("=" * 80)
        print(f"   👉 Widget Visual:  {widget}")
        print(f"   👉 Color Acento:   {tech.get('accent_color_hex')}")
        print(f"   👉 Archivo Salida: {final_video_path}")

        start_time = time.time()
        audio_wav = os.path.join(AUDIO_DIR, f"{slug}_sample.wav")
        timeline_json = os.path.join(AUDIO_DIR, f"{slug}_timeline.json")

        try:
            # 1. Fase 0: Construcción de Audio Clínico
            print("\n[FASE 0: Generación de Audio Clínico Personalizado]")
            build_technique_audio_from_catalog(
                technique_id_or_dict=tech,
                output_wav_path=audio_wav,
                output_timeline_path=timeline_json
            )

            # 2. Pipeline Neuronal Real por Técnica (SadTalker -> Wav2Lip -> GFPGAN)
            if face_video_source and os.path.exists(face_video_source):
                face_input_video = face_video_source
                print(f"\n[FASE 1-2: Reutilizando video facial suministrado: {face_input_video}]")
            else:
                face_input_video = run_full_neural_pipeline_for_technique(
                    technique_meta=tech,
                    audio_wav=audio_wav,
                    server_url=server_url,
                    workflow_path=WORKFLOW_PATH,
                    avatar_image=DEFAULT_AVATAR_IMAGE,
                    sadtalker_size=sadtalker_size,
                    sadtalker_batch=sadtalker_batch,
                    gfpgan_upscale=gfpgan_upscale
                )

            # 3. Fase 3: Composición de Alta Fidelidad sobre Lienzo 1920x1080
            print(f"\n[FASE 3: Composición del Lienzo y Widget '{widget}']")
            compose_video(
                face_video_path=face_input_video,
                audio_path=audio_wav,
                output_path=final_video_path,
                timeline_path=timeline_json,
                bpm=tech.get("bpm", 60.0) or 60.0,
                technique_id=slug,
                catalog_path=catalog_path
            )

            # 4. Fase 4: Purga de VRAM e Ingesta en Wiki
            purge_comfyui_vram(server_url)
            log_technique_to_wiki(tech, final_video_path, audio_wav, timeline_json, status="SUCCESS")

            elapsed = round(time.time() - start_time, 2)
            file_size = os.path.getsize(final_video_path) if os.path.exists(final_video_path) else 0

            results.append({
                "id": slug,
                "name": name,
                "widget": widget,
                "status": "SUCCESS",
                "video_path": final_video_path,
                "size_bytes": file_size,
                "elapsed_sec": elapsed
            })
            print(f"\n✅ Técnica '{name}' completada en {elapsed}s ({file_size:,} bytes).")

        except Exception as e:
            print(f"\n❌ Error al procesar técnica '{name}': {e}")
            results.append({
                "id": slug,
                "name": name,
                "widget": widget,
                "status": f"FAILED: {e}",
                "video_path": None,
                "size_bytes": 0,
                "elapsed_sec": 0
            })

    # Resumen de Auditoría Final
    print("\n" + "=" * 80)
    print("🏁 RESUMEN DE PRODUCCIÓN EN LOTE")
    print("=" * 80)
    failed_count = 0
    for res in results:
        status_symbol = "✅" if res["status"] == "SUCCESS" else "❌"
        if res["status"] != "SUCCESS":
            failed_count += 1
        print(f" {status_symbol} {res['name']:<38} | Widget: {res['widget']:<18} | {res['size_bytes']:>10,} bytes | {res['elapsed_sec']:>6.1f}s")
    print("=" * 80)

    return results


def main():
    parser = argparse.ArgumentParser(description="Orquestador de Producción Masiva de Técnicas en Cadensa.")
    parser.add_argument("--catalog", type=str, default=DEFAULT_CATALOG_PATH, help="Ruta al catálogo maestro.")
    parser.add_argument("--techniques", nargs="+", default=None, help="Lista de técnicas a procesar (por id o slug).")
    parser.add_argument("--face-video-source", type=str, default=None, help="Video de rostro a reutilizar para acelerar renderizado.")
    parser.add_argument("--dry-run", action="store_true", help="Modo simulación sin invocar ComfyUI.")
    parser.add_argument("--server", type=str, default=DEFAULT_SERVER_URL, help="URL del servidor ComfyUI.")
    parser.add_argument("--sadtalker-size", type=int, default=DEFAULT_SADTALKER_SIZE, help="Resolución de inferencia de SadTalker (256 o 512).")
    parser.add_argument("--sadtalker-batch", type=int, default=DEFAULT_SADTALKER_BATCH, help="Batch size de SadTalker (1 o 2).")
    parser.add_argument("--gfpgan-upscale", type=int, default=DEFAULT_GFPGAN_UPSCALE, help="Factor de escalado GFPGAN (2 o 4).")
    args = parser.parse_args()

    results = run_batch_production(
        catalog_path=args.catalog,
        selected_techniques=args.techniques,
        face_video_source=args.face_video_source,
        dry_run=args.dry_run,
        server_url=args.server,
        sadtalker_size=args.sadtalker_size,
        sadtalker_batch=args.sadtalker_batch,
        gfpgan_upscale=args.gfpgan_upscale
    )

    # Requisito B2: Si alguna técnica falla, salir con código != 0
    if any(res.get("status") != "SUCCESS" for res in results):
        print("\n❌ Advertencia: Uno o más procesos del lote concluyeron en estado FAILED.")
        sys.exit(1)


if __name__ == "__main__":
    main()
