# Plan de Siguientes Pasos — Evolución Clínica y Analítica de Cadensa

> **Objetivo**: Elevar la plataforma Cadensa de un MVP funcional a una suite clínica de grado terapéutico con capacidades de exportación para terapeutas, banco expandido de ejercicios clínicos fonéticos y pipeline de análisis de audio en tiempo real.

---

## 1. Alcance de los Siguientes Pasos

1. **Banco Expandido de Ejercicios Clínicos Fonéticos (`src/lib/clinicalExercises.ts`)**:
   - Inclusión de ejercicios de diadococinesia oral (repetición rápida de sílabas opuestas: /pa-ta-ka/).
   - Frases fonéticamente balanceadas para español con dificultad progresiva (baja, media, alta).
   - Metadatos clínicos (objetivo fonético, recomendación de BPM, conteo silábico exacto).

2. **Módulo de Exportación de Informes Clínicos (`src/lib/clinicalReport.ts`)**:
   - Generación de informe clínico en formato JSON y resumen formateado para el terapeuta del lenguaje.
   - Métricas agregadas: precisión rítmica promedio, desviación estándar de latencia (jitter vocal en ms), tasa de éxito y racha máxima.

3. **Procesador de Entrada de Audio Web (`src/lib/audioWorkletHelper.ts`)**:
   - Detección de nivel de energía RMS de entrada de micrófono para calibración de umbrales vocales en tiempo real.

4. **Suite de Pruebas Unitarias y BDD**:
   - Pruebas unitarias para el banco de ejercicios y exportador de informes clínicos.
   - Escenarios Gherkin para la exportación de resultados y selección de ejercicios fonéticos.

5. **Integración UI y Despliegue**:
   - Botón de "Exportar Reporte Clínico" en el Dashboard.
   - Selector de categorías fonéticas en el panel principal.
   - Verificación continua con Vitest, Cucumber, Docker y Push al repositorio remoto.
