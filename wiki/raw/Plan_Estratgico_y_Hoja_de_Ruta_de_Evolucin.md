# Plan Estratégico y Hoja de Ruta de Evolución de Producto: Cadensa (2026–2027)

## 1. Marco Estratégico y Fundamento Clínico de Cadensa

Cadensa se consolida como una plataforma web progresiva de biofeedback motor del habla y entrenamiento fonoaudiológico complementario para personas que tartamudean y profesionales de la comunicación humana. Su arquitectura clínica se fundamenta en la compensación neurobiológica del déficit temporal en los circuitos cortico-estriado-tálamo-corticales y los ganglios basales mediante la técnica de Habla Rítmica Silábica (*Syllable-Timed Speech - STS*), así como en estrategias de moldeamiento de la fluidez (*Fluency Shaping*) y modificación de la tartamudez (*Stuttering Modification*).

A fin de acelerar la adopción, la retención y la efectividad terapéutica sin la dependencia insostenible de pre-renderizar cientos de videos estáticos, Cadensa evolucionará su arquitectura mediante un Agente de Inteligencia Artificial Avatar Fonoaudiológico Fisiológicamente Realista (*Virtual SLP Agent*). Este agente actuará como un co-terapeuta virtual interactivo en tiempo real, modelando de manera hiperrealista la mecánica respiratoria, la fonación y los puntos de articulación necesarios para cada ejercicio clínico.

La siguiente hoja de ruta detalla la estrategia de liberaciones mensuales a lo largo de doce meses, asegurando que cada hito entregue un valor clínico medible, una mejora funcional en la plataforma y una experiencia de usuario enriquecida, todo bajo la alianza comunitaria con la Asociación Mexicana de la Tartamudez A.C. (AMTTM).

---

## 2. Arquitectura del Agente Avatar de IA Fonoaudiológico (Virtual SLP Agent)

El desarrollo del Agente Avatar de IA aborda la imposibilidad práctica de pre-grabar contenido en video para cada combinación de palabras, frases, dialectos y velocidades de metrónomo. El agente opera directamente en el navegador del usuario utilizando bibliotecas de renderizado 3D de alto rendimiento y modelos de visemas fisiológicos, manteniendo la filosofía Jamstack / MACH de ejecución client-side sin servidores dinámicos dinámicos adicionales.

### Subsistemas Integrantes del Agente Avatar
El agente combina tres subsistemas sincronizados a nivel de milisegundos con el motor de audio existente:

*   **Motor de Renderizado Facio-Articular 3D**: Construido sobre Three.js y WebGL/WebGPU en el cliente, el avatar modela la anatomía estomatognática humana, incluyendo movimiento labial, mandibular, lingual (anteriorización y elevación) y la expansión torácica visible durante la fase inspiratoria.
*   **Sincronizador de Visemas y Fonemas en Tiempo Real**: Traduce el texto de los ejercicios y los ritmos del metrónomo a combinaciones de BlendShapes de la norma ARKit / Facial Action Coding System (FACS). Esto garantiza una coincidencia exacta entre la sílaba producida y la configuración articulatoria mostrada.
*   **Controlador de Parámetros Clínicos**: Ajusta dinámicamente la velocidad del movimiento articulatorio en función de los latidos por minuto (BPM) configurados en el metrónomo (de 40 a 160 BPM) y modela de forma deliberada el gesto de inicio suave o el contacto articulador ligero.

| Componente de Arquitectura | Especificación Técnica | Función en la Plataforma |
| :--- | :--- | :--- |
| **Pipeline de Renderizado** | WebGL / WebGPU con Three.js | Dibujado tridimensional del rostro y torso del avatar a 60 FPS |
| **Sincronización de Audio** | AudioWorklet + SharedArrayBuffer | Latencia inferior a 5 ms sincronizada con el pulso del metrónomo |
| **Estándar de Visemas** | BlendShapes ARKit / FACS | Coincidencia fonema-visema de alta precisión articulatoria |
| **Procesamiento de Voz** | AnalyserNode FFT (2048 puntos) | Captura del micrófono en tiempo real para espejo motor |

---

## 3. Hoja de Ruta Detallada Mes a Mes (Roadmap de 12 Meses)

### Mes 1: Agente Avatar de IA Fonoaudiológico (Core Facio-Articular y Demostración de Inicios Suaves)
El primer mes sienta las bases del Agente Avatar en la arquitectura Jamstack de Cadensa. Se integra el motor de renderizado 3D en el cliente para guiar de manera realista las dos técnicas fundamentales de regulación: los Inicios Suaves (*Easy Onsets*) y la Respiración Cuadrada (4-4-4-4).

*   **Funcionalidades Liberadas**:
    *   Lanzamiento del módulo `VirtualSLPAvatarCore.tsx` renderizado mediante WebGL en el navegador sin servidor dinámico.
    *   Modelado fisiológico de la Respiración Cuadrada: El avatar demuestra visualmente la inhalación diafragmática (4s), la retención aireada (4s), la exhalación progresiva (4s) y la pausa de vacío (4s).
    *   Guía anatómica de Inicios Suaves: Representación visual del ataque vocal suave, mostrando la aproximación progresiva de las cuerdas vocales antes de la emisión fonatoria para prevenir el golpe glótico.
*   **Impacto Clínico y UX**:
    *   Sustituye la necesidad de videos pre-grabados por un modelo vectorial en tiempo real adaptable a cualquier velocidad de ejercicio.
    *   Reduce la ansiedad anticipatoria del usuario al observar el patrón respiratorio correcto antes de iniciar la fonación.

### Mes 2: Módulo Avatar para Técnicas de Modificación de Van Riper y Contactos Ligeros
En este periodo se amplía la capacidad articulatoria del avatar para modelar las técnicas avanzadas de modificación de la tartamudez y reducción de la sobrepresión articulatoria.

*   **Funcionalidades Liberadas**:
    *   Extensión del avatar para simular la técnica de *Pull-Out* (Modificación en Bloqueo): Demostración en vivo de la desaceleración del órgano articulatorio tenso para deslizarse suavemente fuera del espasmo.
    *   Guía visual de Cancelación Post-Bloqueo: Secuencia animada que ilustra la pausa reflexiva de 3 segundos, la exhalación relajada y la reemisión fonatoria con inicio suave.
    *   Modelado de Contactos Articuladores Ligeros: Animación detallada de la zona labial y lingual evitando el bloqueo con sobrepresión en consonantes oclusivas (/p/, /t/, /k/, /b/, /d/, /g/).
*   **Impacto Clínico y UX**:
    *   Aporta un modelo visual directo para la reestructuración del gesto motor durante los momentos de tensión crítica.
    *   Permite al usuario observar la diferencia entre un contacto hiper-tenso y un contacto suave mediante la superposición de gradientes cromáticos en la zona boca/labios del avatar.

### Mes 3: Generador Dinámico de Textos Fonéticamente Balanceados por Dialecto (Client-Side NLP)
Liberación de un motor de procesamiento de lenguaje natural en el cliente que genera y selecciona listas de ejercicios personalizadas según las consonantes o grupos fonéticos conflictivos declarados por el usuario.

*   **Funcionalidades Liberadas**:
    *   Módulo NLP ligero en TypeScript (`phoneticTextGenerator.ts`) que analiza la estructura métrica y fonética de las oraciones sin enviar datos al servidor.
    *   Categorización de dificultad por niveles: Sílabas aisladas → Bisílabas → Frases de complejidad creciente → Lectura en prosa fluida.
    *   Sincronización automática entre los textos generados y las variaciones del `DialectSelector.tsx` para las 5 regiones hispanohablantes (México Central, Cono Sur, Andino, Caribeño e Ibérico).
*   **Impacto Clínico y UX**:
    *   Elimina la monotonía de los ejercicios estáticos permitiendo entrenamientos infinitos y adaptados a la realidad lingüística del paciente.
    *   Permite un entrenamiento dirigido a fonemas específicos con sobrecarga oclusiva o fricativa.

### Mes 4: Sistema de Espejo Vocal Interactivo (Avatar Mirroring y Biofeedback de Micro-Tensión)
Integración del avatar con el motor de audio en tiempo real (`acousticAiDetector.ts`) para ofrecer un entorno de espejo motor en el que el avatar reacciona dinámicamente a la fonación del usuario.

*   **Funcionalidades Liberadas**:
    *   Feedback espejo en tiempo real: El avatar sincroniza sus movimientos con la señal capturada por el micrófono del usuario vía `AudioWorklet`.
    *   Visualización del nivel de micro-tensión: El semáforo de tensión (Verde: Fluido, Amarillo: Tensión en aumento, Rojo: Micro-tensión crítica) se proyecta como una aureola sutil alrededor del avatar.
    *   Alerta temprana prefonatoria: Si el detector acústico identifica anomalías en las bandas de formantes F1/F2 (F1: 200–800 Hz, F2: 800–2500 Hz) o rigidez espectral, el avatar realiza una pausa consciente e invita al usuario a ejecutar un inicio suave.
*   **Impacto Clínico y UX**:
    *   Fomenta la autorregulación mediante la retroalimentación inmediata antes de la aparición del bloqueo motor.
    *   Refuerza la conciencia propioceptiva del paciente sin interrupciones bruscas de audio.

### Mes 5: Módulo WebXR de Desensibilización Fóbica e Inmersión Virtual (Escenarios 3D)
Implementación de entornos inmersivos de realidad virtual navegable directamente desde el explorador utilizando el estándar WebXR y Three.js, orientados a la desensibilización sistemática de la ansiedad social al hablar.

*   **Funcionalidades Liberadas**:
    *   Tres escenarios virtuales 3D navegables:
        1.  *Simulación de Entrevista Laboral*: El usuario interactúa con un panel evaluador virtual.
        2.  *Presentación en Auditorio*: Discurso frente a una audiencia con reacciones de atención interactivas.
        3.  *Interacción Social Cotidiana*: Pedido en una cafetería o llamada telefónica simulada.
    *   El Agente Avatar actúa como interlocutor y moderador dentro de la escena WebXR, evaluando el mantenimiento del ritmo y el uso de técnicas.
*   **Impacto Clínico y UX**:
    *   Aplica el principio de transferencia de la fluidez desde el entorno clínico hacia contextos de alta demanda social.
    *   Permite la práctica segura y repetible reduciendo la evitación comunicativa.

### Mes 6: Biofeedback Fisiológico Remoto (rPPG vía Webcam) e Integración Web Bluetooth EMG
Introducción de la medición fisiológica no invasiva para monitorear el estado del sistema nervioso autónomo durante la práctica fonatoria.

*   **Funcionalidades Liberadas**:
    *   Algoritmo de fotopletismografía remota (rPPG) que estima variaciones en la frecuencia cardíaca mediante el análisis de micro-cambios de color en la piel captados por la webcam.
    *   Módulo `WebBluetoothEMG.ts` que utiliza la Web Bluetooth API para conectar sensores electromiográficos (EMG) superficiales comerciales o prototipos para medir la tensión de la musculatura suprahioidea.
    *   Integración de las constantes biométricas en el panel de control del ejercicio junto al avatar.
*   **Impacto Clínico y UX**:
    *   Aporta datos objetivos sobre la respuesta de estrés biológico durante el habla.
    *   Permite correlacionar la tensión muscular objetiva con los eventos de disfluencia y los picos de ritmo cardíaco.

### Mes 7: Rediseño de Cadensa Kids 2.0 con Avatar Lúdico Gamificado
Adaptación del Agente Avatar a un formato infantil e interactivo para mejorar el apego al tratamiento en pacientes pediátricos (de 3 a 10 años).

*   **Funcionalidades Liberadas**:
    *   Avatar infantil personalizado (personaje espacial / explorador) con expresiones empáticas y animaciones de celebración.
    *   Sistema de misiones diarias con narrativa lúdica: *"Viaje intergaláctico del ritmo"*.
    *   Recompensas visuales e insignias acumulables almacenadas en la base de datos segura mediante políticas RLS en Supabase.
*   **Impacto Clínico y UX**:
    *   Aumenta significativamente la adherencia terapéutica en la infancia mediante mecánicas de juego saludables.
    *   Facilita el trabajo guiado para padres bajo modelos indirectos y de contingencias verbales tipo Lidcombe.

### Mes 8: Modo Dúo Avanzado & Co-Terapeuta Avatar en Telesalud WebRTC E2EE
Evolución de las sesiones compartidas fonoaudiólogo-paciente o tutor-niño mediante la presencia del avatar como árbitro neutral de cadencia en videollamadas cifradas.

*   **Funcionalidades Liberadas**:
    *   Integración del avatar dentro de la sala de videollamada P2P WebRTC sin servidores intermedios de medios.
    *   Medición en paralelo de la cadencia de ambos participantes, señalando interrupciones, sobreposiciones o aceleraciones en el ritmo de habla.
    *   Panel de métricas compartidas en tiempo real (BPM de sincronía, porcentaje de habla fluida y pausas respiratorias).
*   **Impacto Clínico y UX**:
    *   Proporciona al profesional una herramienta objetiva para evaluar la interacción padre-hijo o la transferencia terapéutica en vivo.
    *   Garantiza privacidad total mediante cifrado de extremo a extremo (E2EE).

### Mes 9: Motor Fonético Multilingüe (Portugués e Inglés) con Adaptación Dialectal del Avatar
Expansión del alcance de la plataforma a nuevos idiomas, adaptando las calibraciones acústicas y el motor de visemas del avatar a las particularidades del portugués y del inglés.

*   **Funcionalidades Liberadas**:
    *   Inclusión de presets acústicos para Portugués (Brasil / Portugal) e Inglés (General American / RP British).
    *   Sintonización de formantes F1/F2 y visemas del avatar para vocales abiertas, nasalizadas y consonantes fricativas específicas de los nuevos idiomas.
    *   Traducción completa de la interfaz y guías de ejercicio del avatar.
*   **Impacto Clínico y UX**:
    *   Abre la plataforma a la comunidad internacional en América Latina, Europa y América del Norte.
    *   Ofrece soporte a usuarios bilingües que experimentan variaciones de disfluencia entre su lengua materna y su segunda lengua.

### Mes 10: Integración Clínica Hospitalaria SMART on FHIR y Portal Fonoaudiológico
Creación de la capa de interoperabilidad con expedientes clínicos electrónicos (EHR / HIS) de redes hospitalarias e instituciones de salud pública.

*   **Funcionalidades Liberadas**:
    *   Implementación del estándar de autenticación y autorización SMART on FHIR (OAuth 2.0 + OpenID Connect).
    *   Portal especializado para fonoaudiólogos con panel de control de múltiples pacientes, asignación de rutinas con avatar y seguimiento de telemetría DDK (Diadococinesia Oral).
    *   Mapeo automático de métricas de práctica a recursos FHIR R4 (`Observation`, `DiagnosticReport`, `CarePlan`).
*   **Impacto Clínico y UX**:
    *   Permite a clínicos de instituciones públicas (como el Instituto Nacional de Rehabilitación o el IMSS en México) e instituciones privadas prescribir el uso de Cadensa y monitorear el progreso directamente desde su sistema hospitalario.
    *   Asegura el cumplimiento normativo de intercambio de datos clínicos.

### Mes 11: Empaquetado Nativo Offline-First con Capacitor (iOS / iPadOS / Android) y Avatar On-Device
Distribución de Cadensa como aplicación nativa en tiendas móviles, garantizando que el Agente Avatar y el procesamiento de audio funcionen al 100% sin conexión a Internet.

*   **Funcionalidades Liberadas**:
    *   Empaquetado mediante Capacitor para las plataformas iOS, iPadOS y Android.
    *   Optimización de modelos 3D y visemas para ejecución fluida a 60 FPS en dispositivos móviles de gama media.
    *   Sincronización en segundo plano con Supabase una vez que el dispositivo recupera conectividad.
*   **Impacto Clínico y UX**:
    *   Permite la práctica diaria en zonas rurales o comunidades sin acceso a redes de datos de alta velocidad.
    *   Mejora la experiencia de uso táctil y el acceso mediante notificaciones locales para recordar las rutinas de ejercicio.

### Mes 12: Módulo de Evaluación Clínica Longitudinal Automatizada y Diplomas HL7 FHIR R4
Cierre del ciclo anual con un sistema integral de auditoría de progreso del paciente, reportes consolidados y certificación de logros de práctica.

*   **Funcionalidades Liberadas**:
    *   Generación automatizada de informes de evolución longitudinal que comparan la velocidad SPS en DDK, el control de formantes y la tasa de fluidez entre el Mes 1 y el Mes 12.
    *   Exportación de reportes clínicos en PDF vectorial estandarizado con el sello de la Asociación Mexicana de la Tartamudez A.C. (AMTTM) para usuarios destacados.
    *   Consolidación del expediente exportable en formato HL7 FHIR R4 completo.
*   **Impacto Clínico y UX**:
    *   Entrega una prueba tangible y objetiva de los avances alcanzados en el control motor del habla.
    *   Proporciona documentación detallada para revisiones fonoaudiológicas periódicas.

---

## 4. Matriz de Cobertura de Funcionalidades y Técnicas por Mes

La siguiente matriz sintetiza la alineación entre la planificación temporal, la técnica clínica atendida, el subsistema del avatar involucrado y el artefacto entregable en cada fase del producto.

| Mes | Funcionalidad / Hito Principal | Técnica o Módulo Clínico Atendido | Componente del Avatar / Sistema | Entregable Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Mes 1** | Agente Avatar Core & Breathing | Inicios Suaves / Respiración 4-4-4-4 | Motor WebGL 3D + Visemas | Módulo Avatar Base e Inicios Suaves |
| **Mes 2** | Avatar para Técnicas de Modificación | Pull-Out / Cancelación / Contacto Ligero | Simulación Articulatoria Laringea | Guía visual de desbloqueo en vivo |
| **Mes 3** | Generador NLP de Textos Balanceados | Habla Prolongada / Rítmica Silábica | Client-Side NLP + Presets Dialectales | Motor de texto adaptable por dialecto |
| **Mes 4** | Espejo Vocal & Biofeedback Acústico | Micro-tensión Prefonatoria / Formantes F1-F2 | Integración AudioWorklet + Avatar | Espejo motor con semáforo de tensión |
| **Mes 5** | Desensibilización WebXR Inmersiva | Transferencia y Manejo de Ansiedad | Entornos 3D (Auditorio, Entrevista) | Escenarios VR navegables con Avatar |
| **Mes 6** | Biofeedback rPPG y EMG Bluetooth | Regulación Ansiedad y Tensión Muscular | Web Bluetooth API + Fotopletismografía | Dashboard fisiológico en tiempo real |
| **Mes 7** | Cadensa Kids 2.0 Gamificado | Intervención Indirecta / Contingencias | Avatar Lúdico Espacial | Misiones infantiles y sistema de insignias |
| **Mes 8** | Modo Dúo & Co-Terapeuta en Telesalud | Sincronía Ritmo / Relación Padre-Hijo | WebRTC P2P E2EE + Avatar Árbitro | Videollamada compartida con biofeedback |
| **Mes 9** | Motor Fonético Multilingüe | Calibración Fonética Internacional | Presets Portugués e Inglés | Expansión de dialectos e idiomas |
| **Mes 10** | Conexión Hospitalaria SMART on FHIR | Interoperabilidad e Expediente Clínico | Portal Fonoaudiólogo + OAuth 2.0 | Conectividad con sistemas EHR/HIS |
| **Mes 11** | Empaquetado Nativo Capacitor | Accesibilidad Offline y Práctica Diaria | Runtime Capacitor iOS/Android | Apps nativas en App Store y Google Play |
| **Mes 12** | Evaluación Longitudinal FHIR R4 | Auditoría Motor / Progreso Anual | Motor PDF + Registros FHIR R4 | Reporte anual y diploma fonoaudiológico |

---

## 5. Gobernanza, Indicadores de Impacto (KPIs) y Mantenimiento

Para asegurar la sostenibilidad técnica y la validez clínica del roadmap, la ejecución se evaluará mensualmente bajo los siguientes parámetros de rendimiento e impacto:

*   **Rendimiento y Privacidad**: Mantenimiento estricto del procesamiento de audio y avatar al 100% en el cliente, preservando la arquitectura de cero servidores dinámicos en tiempo de ejecución (`output: 'export'`) y el despliegue perimetral en Cloudflare Pages.
*   **Seguridad Zero Trust**: Mantener cero incidentes en las auditorías continuas de GitGuardian y la protección absoluta de datos mediante Row Level Security en Supabase.
*   **Calidad de Pruebas**: Política de tolerancia cero a regresiones, conservando una cobertura superior a 280 pruebas unitarias en Vitest y más de 100 escenarios BDD en Cucumber.js pasados al 100%.
*   **Validación Comunitaria y YMYL**: Revisión periódica de contenidos y guías del avatar en coordinación con la Asociación Mexicana de la Tartamudez A.C. (AMTTM) para salvaguardar el rigor clínico y la transparencia ética.
