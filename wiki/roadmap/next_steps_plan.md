# Plan de Siguientes Pasos — Evolución Clínica y Analítica de Cadensa

> **Objetivo**: Elevar la plataforma Cadensa de un MVP funcional a una suite clínica de grado terapéutico con capacidades de exportación para terapeutas, banco expandido de ejercicios clínicos fonéticos, pipeline de análisis de audio en tiempo real, sincronización en la nube, biofeedback acústico de formantes, validación fonética en el dispositivo, telesalud WebRTC y fluidez pediátrica gamificada.
> **Estado**: Frentes A a E e Hitos 1 a 4 completados y operativos en producción (Octubre 2026).

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

6. **Hito 1: Reconocimiento Fonético On-Device (`src/lib/speechRecognitionHelper.ts` & `src/components/PhoneticRecognitionValidator.tsx`)**: ✅
   - Validación acústica y fonética en el cliente mediante Web Speech API y matriz de distancia Levenshtein normalizada (0 a 100%).
   - Clasificación de precisión: Coincidencia Óptima (≥ 80%), Comprensible (60-79%) o Requiere Articulación (< 60%).
   - Zero Trust absoluto: transcripción local en el navegador del usuario sin enviar streaming de audio a servidores de terceros.

7. **Hito 2: Biofeedback Visual de Formantes F1/F2 en Tiempo Real (`src/lib/formantAnalyzer.ts` & `src/components/FormantBiofeedbackVisualizer.tsx`)**: ✅
   - Extracción espectral de picos de resonancia del tracto vocal mediante `AnalyserNode` FFT de 2048 muestras.
   - Cuadrilátero vocálico interactivo 2D (F1 apertura mandibular vs F2 retracción lingual) con mapa foniátrico para las vocales en español /a/, /e/, /i/, /o/, /u/.
   - Marcador en vivo y cálculo de distancia euclidiana hacia el target de vocalización con retroalimentación cromática.

8. **Hito 3: Modo Telesalud Fonoaudiológica P2P (`src/lib/telehealthP2P.ts` & `src/components/TelehealthRoom.tsx`)**: ✅
   - Conexión punto a punto mediante WebRTC DataChannel sin relay centralizado de audio ni almacenamiento de datos clínicos.
   - Intercambio de señalización por oferta/respuesta SDP codificada en Base64 para máxima compatibilidad y privacidad.
   - Sincronización instantánea de metrónomo clínico (BPM, estado de reproducción y técnica activa) entre el especialista fonoaudiólogo y el paciente en remoto.

9. **Hito 4: Módulo de Fluidez Pediátrica Gamificada (`src/lib/pediatricFluency.ts` & `src/components/PediatricFluencyTrainer.tsx`)**: ✅
   - Entrenador lúdico "Cadensa Kids" para niños con disfemia del desarrollo y dificultades de fluidez temprana.
   - Metáforas de fluidez validadas por fonoaudiología: Tortuga Zen (inicio suave y ritmo constante), Pajarito Melódico (entonación fluida) y Rana Saltarína (pausas estratégicas).
   - Sistema de recompensas en estrellas y barra de energía lúdica con refuerzo positivo continuo sin penalizaciones punitivas.

10. **Suite de Pruebas Unitarias y BDD**: ✅
    - 44 archivos Vitest / 209 pruebas unitarias pasando al 100%.
    - 86 escenarios Cucumber BDD / 333 pasos en español pasando al 100%.

---

## 2. Próximos Lanzamientos en la Hoja de Ruta Activa

1. **Motor de Alteración Auditiva en Tiempo Real (DAF / FAF)**:
   - Implementación de Delayed Auditory Feedback (50-200ms) y Frequency Altered Feedback (± 0.5 a 1 octava) en Audio Worklet para inducción neuroacústica de fluidez inmediata.
2. **Interoperabilidad Clínica HL7 / FHIR**:
   - Exportación de fichas foniátricas compatibles con estándares hospitalarios de salud electrónica (EHR) y perfiles fonoaudiológicos FHIR `DiagnosticReport`.
3. **Modelos Acústicos On-Device con WebGPU y ONNX Runtime**:
   - Detección precisa de bloqueos tónicos, prolongaciones y repeticiones involuntarias mediante micro-redes neuronales convolucionales ejecutadas localmente en GPU.
4. **Entornos de Exposición Social WebXR**:
   - Simulaciones de realidad virtual e inmersiva ligera en el navegador (entrevistas de trabajo, presentaciones en público, llamadas telefónicas) con biofeedback de ritmo.
