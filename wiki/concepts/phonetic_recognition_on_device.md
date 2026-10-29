---
title: "Reconocimiento Fonético On-Device y Verificación Acústica"
category: "concepts"
tags: [clinical, phonetic-recognition, zero-trust, speech-therapy, levenshtein]
last_updated: "2026-10-28"
sources:
  - "src/lib/speechRecognitionHelper.ts"
  - "src/components/PhoneticRecognitionValidator.tsx"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/diadochokinesis_assessment.md"
  - "wiki/architecture/frontend.md"
---

# Reconocimiento Fonético On-Device y Verificación Acústica

El **Validador Fonético On-Device** (`src/lib/speechRecognitionHelper.ts`) evalúa la concordancia acústica y fonemática entre la oración objetivo prescrita para el paciente y la emisión verbal real registrada por el micrófono.

---

## 1. Principio Zero Trust Acústico

A diferencia de las soluciones convencionales que transmiten flujos de audio a servidores en la nube (planteando riesgos de privacidad HIPAA/GDPR y latencias elevadas):
1. **Procesamiento 100% Local**: Opera a través de Web Speech API nativa del navegador o inferencia local en memoria.
2. **Cero Retención en Servidores**: Ningún paquete de voz se transfiere a APIs externas; la comparación fonemática ocurre en el cliente.

---

## 2. Motor de Comparación y Métrica Combinada

La función `evaluatePhoneticMatch` normaliza el texto (eliminando diacríticos y puntuación) y evalúa:
* **Token-Level Matching**: Identifica palabras articuladas exactamente, palabras sustituidas y omisiones causadas por bloqueos silábicos.
* **Distancia Levenshtein Fonética**: Mide la deformación articulatoria a nivel de caracteres fonéticos.
* **Puntaje Ponderado**:
  - `≥ 90%`: Articulación fonética óptima y nítida.
  - `70% - 89%`: Comprensible con variaciones menores en puntos de articulación.
  - `< 70%`: Omisiones o bloqueos prolongados que requieren ralentizar el metrónomo.

