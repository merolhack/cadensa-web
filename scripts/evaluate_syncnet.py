#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadensa — Evaluación Objetiva de Lip-Sync Error (LSE-D y LSE-C) mediante SyncNet
https://cadensa-web.pages.dev/

Implementa el estándar de oro (Chung & Zisserman, Wav2Lip paper):
- LSE-D (Lip Sync Error - Distance): Distancia euclídea mínima entre embeddings de video y audio.
- LSE-C (Lip Sync Error - Confidence): Confianza del pico de sincronía sobre la mediana.
- Offset: Desfase temporal estimado en fotogramas y milisegundos.
"""

from __future__ import annotations
import sys
import os
import cv2
import torch
import numpy as np
import subprocess
import tempfile
from typing import Dict, Any, List

# Asegurar UTF-8 en salida estándar
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Asegurar import de SyncNet
SYNC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "syncnet")
if SYNC_DIR not in sys.path:
    sys.path.append(SYNC_DIR)

from SyncNetInstance import SyncNetInstance
import python_speech_features
from scipy.io import wavfile
import imageio_ffmpeg

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
MODEL_PATH = os.path.join(SYNC_DIR, "data", "syncnet_v2.model")


def evaluate_video_syncnet(
    video_path: str,
    model_path: str = MODEL_PATH,
    device: str | None = None,
    crop_face: bool = True
) -> Dict[str, Any]:
    """
    Evalúa un video utilizando SyncNet pre-entrenado (VGG Oxford).
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video no encontrado: {video_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Modelo SyncNet no encontrado en {model_path}")

    dev = device or ("cuda" if torch.cuda.is_available() else "cpu")
    s = SyncNetInstance(device=dev)
    s.loadParameters(model_path)
    s.eval()

    with tempfile.TemporaryDirectory() as tmp_dir:
        wav_path = os.path.join(tmp_dir, "audio.wav")
        cmd = [
            FFMPEG_PATH, "-y", "-loglevel", "error", "-i", video_path,
            "-vn", "-ac", "1", "-acodec", "pcm_s16le", "-ar", "16000",
            wav_path
        ]
        subprocess.run(cmd, check=True)

        sr, audio = wavfile.read(wav_path)
        mfcc = zip(*python_speech_features.mfcc(audio, sr))
        mfcc = np.stack([np.array(i) for i in mfcc])
        cc = np.expand_dims(np.expand_dims(mfcc, axis=0), axis=0)
        cct = torch.from_numpy(cc.astype(float)).float()

        cap = cv2.VideoCapture(video_path)
        images = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if crop_face and frame.shape[0] == 1080 and frame.shape[1] == 1920:
                # Avatar institucional en lienzo de 1920x1080: [140:940, 100:900]
                face = frame[140:940, 100:900]
            else:
                face = frame
            face_224 = cv2.resize(face, (224, 224))
            images.append(face_224)
        cap.release()

        im = np.stack(images, axis=3)
        im = np.expand_dims(im, axis=0)
        im = np.transpose(im, (0, 3, 4, 1, 2))
        imtv = torch.from_numpy(im.astype(float)).float()

        min_length = min(len(images), int(len(audio) // 640))
        lastframe = min_length - 5
        batch_size = 20
        vshift = 15

        im_feat = []
        cc_feat = []

        with torch.no_grad():
            for i in range(0, lastframe, batch_size):
                im_batch = [imtv[:, :, vf : vf + 5, :, :] for vf in range(i, min(lastframe, i + batch_size))]
                im_in = torch.cat(im_batch, 0)
                im_out = s.__S__.forward_lip(im_in.to(dev))
                im_feat.append(im_out.data.cpu())

                cc_batch = [cct[:, :, :, vf * 4 : vf * 4 + 20] for vf in range(i, min(lastframe, i + batch_size))]
                cc_in = torch.cat(cc_batch, 0)
                cc_out = s.__S__.forward_aud(cc_in.to(dev))
                cc_feat.append(cc_out.data.cpu())

        im_feat = torch.cat(im_feat, 0)
        cc_feat = torch.cat(cc_feat, 0)

        win_size = vshift * 2 + 1
        feat2p = torch.nn.functional.pad(cc_feat, (0, 0, vshift, vshift))
        dists = []
        for i in range(len(im_feat)):
            dists.append(torch.nn.functional.pairwise_distance(im_feat[[i], :].repeat(win_size, 1), feat2p[i : i + win_size, :]))

        mdist = torch.mean(torch.stack(dists, 1), 1)
        minval, minidx = torch.min(mdist, 0)
        offset = vshift - minidx
        conf = torch.median(mdist) - minval

        return {
            "lse_d": float(minval.item()),
            "lse_c": float(conf.item()),
            "offset_frames": int(offset.item()),
            "offset_ms": int(offset.item() * 40)
        }


def evaluate_all_techniques() -> List[Dict[str, Any]]:
    import json
    catalog_path = "scripts/techniques_media_catalog.json"
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    results = []
    for tech in catalog.get("techniques", []):
        slug = tech.get("slug", tech.get("id"))
        name = tech.get("name")
        vpath = f"public/media/techniques/{slug}_avatar_final.mp4"
        if not os.path.exists(vpath):
            results.append({"slug": slug, "name": name, "status": "MISSING"})
            continue

        try:
            scores = evaluate_video_syncnet(vpath)
            results.append({
                "slug": slug,
                "name": name,
                "status": "OK",
                **scores
            })
        except Exception as e:
            results.append({"slug": slug, "name": name, "status": f"ERROR: {e}"})

    return results


if __name__ == "__main__":
    print("=" * 85)
    print("🎯 EVALUACIÓN DE LIP-SYNC ERROR (LSE-D / LSE-C) — SYNCNET OFICIAL")
    print("=" * 85)
    res = evaluate_all_techniques()
    for r in res:
        if r["status"] == "OK":
            print(f"👉 {r['name']:<35} | LSE-D: {r['lse_d']:6.3f} | LSE-C: {r['lse_c']:6.3f} | Offset: {r['offset_frames']:+2d} f ({r['offset_ms']:+4d} ms)")
        else:
            print(f"👉 {r['name']:<35} | {r['status']}")
    print("=" * 85)
