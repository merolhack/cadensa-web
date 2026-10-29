# Plan de Siguientes Pasos — Evolución Clínica y Analítica de Cadensa

> **Objetivo**: Elevar la plataforma Cadensa de un MVP funcional a una suite clínica de grado terapéutico con capacidades de exportación para terapeutas, banco expandido de ejercicios clínicos fonéticos, pipeline de análisis de audio en tiempo real y sincronización en la nube.
> **Estado**: Frentes A a E completados y operativos en producción (Octubre 2026).

---

## 1. Alcance de los Hitos Ejecutados y Operativos

1. **Banco Expandido de Ejercicios Clínicos Fonéticos (`src/lib/clinicalExercises.ts`)**: ✅
   - Inclusión de ejercicios de diadococinesia oral (repetición rápida de sílabas opuestas: /pa-ta-ka/, /ba-da-ga/, /tra-kla-pra/).
   - Frases fonéticamente balanceadas para español con dificultad progresiva (baja, media, alta).
   - Metadatos clínicos (objetivo fonético, recomendación de BPM, conteo silábico exacto).

2. **Módulo de Exportación de Informes Clínicos en PDF (`src/lib/clinicalReport.ts`)**: ✅
   - Generación de informe clínico en formato PDF imprimible, JSON raw y notas de texto foniátrico.
   - Métricas agregadas: precisión rítmica promedio, desviación estándar de latencia (jitter vocal en ms), tasa de éxito, adherencia terapéutica y tabla de sesiones.
   - Componente interactivo `src/components/ClinicalReportExporter.tsx` integrado en `Dashboard.tsx`.

3. **Procesador de Audio Worklet de Baja Latencia (`src/lib/audioWorkletHelper.ts`)**: ✅
   - Detección de nivel de energía RMS de entrada de micrófono en hilo desacoplado (< 5ms) para calibración de umbrales vocales VAD en tiempo real.
   - Cálculo de jitter fonoaudiológico con fallback transparente a `AnalyserNode`.

4. **Entrenador de Diadococinesia Oral (/pa-ta-ka/) (`src/components/DiadochokinesisTrainer.tsx`)**: ✅
   - Protocolo foniátrico de 10 segundos con cálculo automático de Tasa Articulatoria (sílabas/segundo), jitter temporal y clasificación según normas de adultos en español.

5. **Sincronización Multi-Dispositivo con Supabase Zero Trust RLS (`src/lib/customPhraseService.ts`)**: ✅
   - Migración `supabase/migrations/20261029050000_user_custom_phrases_sync.sql` con políticas RLS de usuario.
   - Sincronización y unificación bidireccional entre `localStorage` y la nube.

6. **Suite de Pruebas Unitarias y BDD**: ✅
   - 40 archivos Vitest / 192 pruebas pasando al 100%.
   - 82 escenarios Cucumber BDD / 318 pasos en español pasando al 100%.

---

## 2. Próximos Lanzamientos en la Hoja de Ruta Activa

1. **Reconocimiento Fonético On-Device (WebAssembly)**:
   - Transcripción y alineamiento fonético local en el navegador (Zero Trust) sin llamadas a servicios de terceros.
2. **Biofeedback Visual de Formantes F1/F2 en Tiempo Real**:
   - Espectrograma interactivo para visualizar la apertura mandibular y resonancia del tracto vocal durante la fonación.
3. **Modo Telesalud Fonoaudiológica P2P (WebRTC)**:
   - Sala cifrada de extremo a extremo para sesiones guiadas remotas con metrónomo sincronizado entre terapeuta y paciente.
4. **Módulo de Fluidez Pediátrica Gamificada**:
   - Entrenador con avatares acústicos interactivos y dinámicas de refuerzo positivo para niños con disfemia temprana.
