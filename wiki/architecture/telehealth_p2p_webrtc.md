---
title: "Telesalud Fonoaudiológica P2P y Sincronización WebRTC DataChannel"
category: "architecture"
tags: [architecture, telehealth, webrtc, e2ee, p2p, datachannel, sync]
last_updated: "2026-10-28"
sources:
  - "src/lib/telehealthP2P.ts"
  - "src/components/TelehealthRoom.tsx"
related:
  - "wiki/architecture/audio_engine.md"
  - "wiki/concepts/zero_trust_rls.md"
---

# Telesalud Fonoaudiológica P2P y Sincronización WebRTC DataChannel

La práctica fonoaudiológica remota requiere una sincronización temporal en milisegundos para que las indicaciones rítmicas del terapeuta coincidan con la percepción del paciente sin retardos perceptibles.

---

## 1. Arquitectura P2P Cifrada de Extremo a Extremo (E2EE)

A diferencia de llamadas tradicionales que sufren 200-500 ms de latencia al enrutarse por servidores de conferencia:
* **WebRTC DataChannel**: Comunicación bidireccional punto a punto directa entre los navegadores del terapeuta y el paciente.
* **Latencia RTT Ultra-Baja**: Tiempos de ida y vuelta típicamente entre 15 ms y 35 ms.
* **Zero-Knowledge Backend**: El tráfico de sesión no se almacena ni se procesa en servidores intermedios; las señales de metrónomo y las métricas de precisión viajan encriptadas mediante DTLS/SCTP.

---

## 2. Protocolo de Mensajería Rítmica

El motor en `src/lib/telehealthP2P.ts` estructura paquetes binarios o JSON mínimos:
* `METRONOME_START` / `METRONOME_STOP`: Control remoto del reloj acústico por el terapeuta.
* `BEAT_PULSE`: Marca temporal del pulso maestro (`bpm`, `beatIndex`).
* `ACCURACY_FEEDBACK`: Envío reactivo del desfase temporal en milisegundos (`score`, `diffMs`) desde el paciente para monitoreo en vivo en la pantalla del clínico.
* `PING` / `PONG`: Medición continua de latencia de red (RTT).

