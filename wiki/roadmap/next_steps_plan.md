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

9. **Cadensa Kids Interactiva y Gamificación Pediátrica (`src/lib/pediatricFluency.ts` & `src/components/PediatricFluencyTrainer.tsx`)**: ✅
   - Entrenador lúdico para niños con disfemia temprana: 6 cuentos con contextos amigables, metas emoji y camino de aventura animado.
   - Resaltado y animación silábica paso a paso sincronizada al tempo de los avatares (Tortuga Zen 60 BPM, Cadensín el Castor 70 BPM, Colibrí Cantor 75 BPM).
   - Síntesis de sonido suave de marimba pentatónica con Web Audio API y fanfarria triunfal al completar la frase.

10. **Infraestructura Cross-Browser y Banner de Compatibilidad (`src/components/BrowserCompatibilityBanner.tsx` & `playwright.config.ts`)**: ✅
    - Matriz de diagnóstico en tiempo real para Google Chrome, Microsoft Edge, Opera, Apple Safari y Mozilla Firefox.
    - Desbloqueo universal de AudioContext para Safari/iOS (`audioUnlock.ts`), soporte de safe areas y viewport dinámico (100dvh).
    - Degradación transparente en Firefox hacia modo foniátrico acústico por VAD en ausencia de Web Speech.
    - Configuración multi-motor de Playwright para pruebas E2E en Chromium, Gecko y WebKit.

11. **Medidor de Voz en Vivo VU Meter Zero Trust (`src/components/LiveAudioVUMeter.tsx`)**: ✅
    - Retroalimentación fonoaudiológica instantánea de captura vocal en la estación de práctica sin latencia.

12. **Motor de Alteración Auditiva en Tiempo Real (DAF / FAF) (`src/lib/alteredAuditoryFeedback.ts` & `src/components/AlteredAuditoryTrainer.tsx`)**: ✅
    - Delayed Auditory Feedback (retardo de 50ms a 200ms) y Frequency-Altered Feedback (desplazamiento tonal de -4 a +4 semitonos).
    - Inducción neurobiológica del "efecto coro" para reducir espasmos y bloqueos motores involuntarios sin latencia ni fuga de datos.
    - Presets clínicos calibrados (DAF Suave 50ms, DAF Clínico 80ms, Efecto Coro 75ms / -1 semitono) y advertencia obligatoria de auriculares.

13. **Cadensa Kids 2.0 y Modo Dúo Pediátrico (`src/lib/pediatricFluency.ts` & `src/components/PediatricFluencyTrainer.tsx`)**: ✅
    - Modo Dúo interactivo para padres y fonoaudiólogos con botón de aplauso motivador y síntesis de aplauso acústico.
    - Refuerzo positivo contingente con acumulación dinámica de estrellas para el cofre mágico infantil.

14. **Diplomas Fonoaudiológicos y Certificados de Mérito (`src/lib/fluencyCertificate.ts` & `src/components/FluencyCertificateModal.tsx`)**: ✅
    - Catálogo de 3 diplomas clínicos (Iniciador Valiente, Guardián del Ritmo, Maestro de la Calma) generados en HTML apaisado para impresión o guardado PDF.
    - Personalización de nombre de paciente, fecha en español y sello de Cadensa Digital Clinic.

15. **Interoperabilidad Hospitalaria HL7 FHIR R4 (`src/lib/fhirExport.ts` & `src/components/ClinicalReportExporter.tsx`)**: ✅
    - Serialización de informes fonoaudiológicos como recursos FHIR R4 `DiagnosticReport` válidos.
    - Observaciones con terminología estandarizada LOINC (77150-1, 89066-5, 77151-9, 55411-3) y clasificación clínica SNOMED-CT (289190003).

16. **Auditoría de Seguridad, Zero Trust y Cobertura de Pruebas**: ✅
    - 57 archivos Vitest / 254 pruebas unitarias aprobadas al 100%.
    - 95 escenarios Cucumber BDD / 369 pasos en español aprobados al 100%.
    - Suite de auditoría de seguridad (`securityAudit.test.ts`) verificando cabeceras HTTP (HSTS, CSP, Permissions-Policy) y protección de secretos en Git.

17. **Autenticación Federada Google OAuth 2.0 y Adopción de Sesiones Locales (`src/lib/trainingService.ts` & `src/app/page.tsx`)**: ✅
    - Configuración de credenciales de cliente OAuth 2.0 en Google Cloud Platform (`cadensa-web-dev`) respaldadas en `.env`.
    - Flujo de identidad federada Zero-Friction para personas con disfemia, reduciendo la ansiedad de entrada en la práctica foniátrica.
    - Algoritmo de Adopción de Datos (`claimLocalSessions`): migración automática de sesiones y racha local huérfanas (`local_guest`) a Supabase PostgreSQL RLS al iniciar sesión.
    - Propagación de identidad estricta mediante UUID `session.user.id` en lugar de strings de correo para inserción segura en PostgreSQL.

18. **Observabilidad Híbrida de Cliente y Telemetría Forense de Errores (`src/lib/errorTracker.ts`, `public.client_telemetry_errors` & `/admin`)**: ✅
    - Despachador dual simultáneo: Google Analytics 4 (evento nativo `exception` para métricas agregadas) + Supabase PostgreSQL RLS (inmune a bloqueadores de anuncios con stack traces íntegros).
    - Escuchadores automáticos en `window.onerror` y `unhandledrejection` con deduplicación en memoria de 10 segundos y protección Silent Fail.
    - Instrumentación de fallas en flujos de autenticación (`AuthModal.tsx`) y botones críticos.
    - Pestaña de auditoría en la consola administrativa `/admin` para inspección de incidentes en tiempo real.

19. **Alertas Proactivas en Tiempo Real de Errores Fatales (`src/lib/errorTracker.ts`)**: ✅
    - Despacho inmediato asíncrono hacia Webhooks configurados (`NEXT_PUBLIC_ERROR_WEBHOOK_URL`) formateado para Discord (embeds con código de color rojo #ef4444), Slack y JSON genérico.
    - Filtrado estricto por severidad `fatal: true` y desacoplamiento con protección Silent Fail.

20. **Detección Acústica On-Device de Bloqueos Tónicos y Disfluencias (`src/lib/acousticBlockDetector.ts`)**: ✅
    - Procesamiento de audio en tiempo real Zero Trust que extrae energía RMS, cruces por cero (ZCR) y varianza espectral.
    - Clasificación fonatoria de Bloqueos Tónicos (> 350ms de esfuerzo sin emisión), Prolongaciones (> 300ms con varianza plana) y Repeticiones Clónicas (< 220ms).

21. **Validación Continua en Vivo de Entorno Productivo E2E & BDD (`e2e/production_live_validation.spec.ts` & `features/production_environment_validation.feature`)**: ✅
    - Simulación de usuario real directamente sobre `https://cadensa-web.pages.dev/`.
    - Verificación de carga de GA4 (`G-HCTT9146TJ`), modal de Google OAuth 2.0 y despacho dual de telemetría.
    - Demostración de compatibilidad con el patrón PostgREST Blind-Drop (`Prefer: return=minimal` para inserción sin política de lectura).

---

## 2. Próximos Lanzamientos en la Hoja de Ruta Activa

1. **Modelos Acústicos On-Device con WebGPU y ONNX Runtime**:
   - Detección precisa de bloqueos tónicos, prolongaciones y repeticiones involuntarias mediante micro-redes neuronales convolucionales ejecutadas localmente en GPU del cliente.
2. **Entornos de Exposición Social WebXR**:
   - Simulaciones de realidad virtual e inmersiva ligera en el navegador (entrevistas de trabajo, presentaciones en público, llamadas telefónicas) con biofeedback de ritmo.
3. **Mapeo Fonético Transversal Multilingüe**:
   - Soporte fonoaudiológico especializado para variaciones fonéticas en lenguas romances y acentos hispanohablantes regionales.
