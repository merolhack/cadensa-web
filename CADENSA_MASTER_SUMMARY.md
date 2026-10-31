# Cadensa — Resumen Maestro Integral del Proyecto (Master Summary)

> **Documento Fuente para Gemini Notebook / NotebookLM**  
> **Fecha de Actualización:** Octubre 2026  
> **URL de Producción:** https://cadensa-web.pages.dev/  
> **Repositorio:** [cadensa-web](file:////wsl$/Ubuntu-20.04/home/merolhack/fl/cadensa-web)  
> **Autor y Arquitecto:** Lenin Meza (Autor del *Playbook de Arquitectura MACH*)  
> **Alianza Comunitaria:** Asociación Mexicana de la Tartamudez A.C. (AMTTM)

---

## 1. Identidad, Misión y Fundamento Clínico

### 1.1 ¿Qué es Cadensa?
**Cadensa** es una plataforma web progresiva (PWA / SPA) de biofeedback motor del habla y entrenamiento fonoaudiológico complementario para personas que tartamudean y profesionales de la comunicación humana. Su nombre proviene de la *cadencia* rítmica natural de la locución y su lema oficial es:

> **"Encuentra el ritmo de tu voz."**

### 1.2 Base Neurobiológica y Mecanismo Terapéutico
El núcleo terapéutico de Cadensa se fundamenta en la técnica de **Habla Rítmica Silábica** (*Syllable-Timed Speech - STS*), respaldada por la literatura científica contemporánea en fonoaudiología y neurociencias:
- **Déficit Neurobiológico Primario:** La tartamudez se asocia con una disfunción funcional y temporal en los circuitos cortico-estriado-tálamo-corticales y los ganglios basales, los cuales fallan en generar los pulsos internos necesarios para la temporización continua del habla.
- **Mecanismo de Compensación (Bypass Temporal):** Al proporcionar un marcapasos rítmico externo (auditivo y visual sincronizado), Cadensa permite al cerebro puentear la red de los ganglios basales a través del sistema premotor lateral y auditivo-motor parietal, logrando una reducción inmediata y drástica de disfluencias (bloqueos, prolongaciones y repeticiones).

### 1.3 Alianza con la Comunidad Fonoaudiológica y AMTTM
Cadensa integra formalmente la vinculación con la **Asociación Mexicana de la Tartamudez A.C. (AMTTM)**, incorporando banners de orientación, recursos de acompañamiento para personas con disfemia y sus familias, y enlaces directos a sus canales oficiales de YouTube y Facebook.

### 1.4 Aviso Clínico y Declaración YMYL (Your Money Your Life)
La plataforma opera bajo estrictos estándares éticos de salud digital:
- Cadensa es un entorno complementario de biofeedback y entrenamiento guiado; **no sustituye la evaluación, diagnóstico fonoaudiológico ni la terapia clínica personalizada**.
- Cumple con las directrices de calidad de Google Search para contenidos de salud (YMYL), brindando transparencia en su autoría, fuentes científicas y descargos de responsabilidad médica en todas sus páginas.

---

## 2. Arquitectura de Software y Patrones de Ingeniería

Cadensa implementa una arquitectura moderna **Jamstack / MACH** de alto rendimiento, privacidad por diseño y tolerancia a fallos:

```
[ Cliente Navegador (SPA Next.js 16) ]
  ├── Web Audio API + AudioWorklet (< 5 ms latencia)
  ├── AnalyserNode FFT 2048 (Formantes F1/F2, Pitch, VAD)
  ├── AcousticAiDetector (DSP + WebGPU Inferencia Local de Tensión)
  ├── WebRTC P2P (Telesalud E2EE sin servidores de medios)
  └── Web Storage Seguro (Offline First)
         │ (Zero Trust RLS vía HTTPS / WSS)
         ▼
[ Cloudflare Global Anycast CDN / Pages ] ──> HTTP/2, HSTS, CSP Estricta, Zero-CLS
         │ (REST / Realtime)
         ▼
[ Supabase Backend (PostgreSQL + Auth PKCE) ] ──> Zero Trust RLS (Solo anon key, Cero service_role)
```

### 2.1 Frontend Jamstack (Next.js 16 App Router)
- **Exportación Estática Obligatoria (`output: 'export'`):** La aplicación compila a HTML5/JS/CSS pre-renderizado puro, eliminando dependencias de servidores Node.js dinámicos en tiempo de ejecución.
- **Alojamiento en Cloudflare Pages:** Despliegue global a través de la red perimetral Anycast de Cloudflare, ofreciendo tiempos de carga ultrarrápidos (TTFB < 50 ms), compresión Brotli y certificados SSL automáticos.
- **Diseño Visual y UX:** Tailwind CSS v4 con dark mode profundo (`bg-zinc-950`), paleta de acentos esmeralda/cian (`from-emerald-400 to-cyan-400`), tipografía monoespaciada para mediciones y respeto riguroso de accesibilidad WCAG 2.1 AA (targets táctiles ≥ 44×44 px, contraste de color alto, Zero-CLS).

### 2.2 Motor de Audio en Tiempo Real (Client-Side Audio Engine)
Todo el procesamiento de audio ocurre **100% en el dispositivo del usuario**, garantizando latencia ultra-baja y privacidad absoluta:
- **AudioWorklet dedicado:** Procesamiento de señal con latencia inferior a 5 milisegundos, evitando caídas de frames en el hilo principal de la interfaz.
- **AnalyserNode (FFT de 2048 puntos):** Análisis frecuencial continuo, extracción de envolventes de volumen, detección de actividad vocal (VAD) y seguimiento de tono fundamental (F0).
- **Inferencia Acústica de Micro-Tensión Prefonatoria (`acousticAiDetector.ts`):** Algoritmo on-device que monitorea cociente espectral, energía en bandas críticas de formantes (F1: 200-800 Hz, F2: 800-2500 Hz) y variabilidad armónica (jitter) para alertar al paciente antes de que ocurra un bloqueo laringeo.
- **Calibración Fonética Dialectal (`phoneticPresets.ts`):** Ajustes automáticos de formantes y umbrales acústicos para 5 dialectos del español: México Central, Cono Sur, Andino, Caribeño e Ibérico.
- **Feedback Auditivo Alterado (DAF / FAF):** Búferes circulares en memoria para retraso configurable (50 a 200 ms) y transposición frecuencial (+/- 2 a 4 semitonos) en tiempo real.

### 2.3 Backend y Seguridad Zero Trust (Supabase PostgreSQL)
- **Zero Trust Row Level Security (RLS):** Cada fila en la base de datos está protegida por políticas PostgreSQL RLS. El cliente interactúa únicamente mediante `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Cero Exposición de `service_role`:** Ningún secreto administrativo reside en el código cliente.
- **Autenticación PKCE:** Flujo seguro de inicio de sesión con Email o Google OAuth 2.0 mediante `flowType: 'pkce'`.
- **Esquema de Base de Datos Clínico:**
  - `profiles`: Datos de usuario, dialecto preferido, metas diarias de fluidez y rol.
  - `practice_sessions`: Registro de técnicas practicadas, duración, BPM promedio y porcentaje de fluidez.
  - `feedback_reports`: Evaluaciones cualitativas y reportes de calidad del paciente.
  - `clinical_telemetry`: Eventos anónimos de rendimiento, errores acústicos y latencia.

### 2.4 Contenedorización e Infraestructura
- **Docker Multi-Stage:** `node:20-slim` para compilación estática Next.js Turbopack y `nginx:alpine` para runtime SPA con cabeceras de seguridad CSP, HSTS, X-Frame-Options y soporte de SPA routing (`try_files $uri $uri/ /index.html`).
- **CI/CD con GitHub Actions:**
  - `deploy.yml`: Flujo de integración continua que ejecuta pruebas unitarias (Vitest), pruebas BDD (Cucumber), compilación estática y despliegue directo a Cloudflare Pages con verificación estricta de éxito al 100%.
  - `health-check.yml`: Auditoría periódica automatizada que verifica 15 endpoints en vivo y consulta el API REST de GitGuardian para monitoreo continuo de seguridad y credenciales.

---

## 3. Catálogo Completo de Capacidades Desarrolladas

### 3.1 Las 7 Técnicas Fonoaudiológicas Clínicas
1. **Habla Rítmica Silábica (STS):**
   - Metrónomo visual (orbe palpitante y barras de pulso) y auditivo ajustable (40 a 160 BPM).
   - Modo de sílaba por golpe con conteo en tiempo real y cálculo de fluidez continua.
2. **Inicio Suave (Easy Onset):**
   - Modulación vocal de ataque suave para evitar el golpe glótico brusco en vocales iniciales.
   - Curva de intensidad exponencial/sigmoidea en pantalla para sincronizar la exhalación gradual previa a la fonación.
3. **Contacto Articulador Ligero (Light Articulatory Contact):**
   - Reducción de sobrepresión labial, lingual y dental en consonantes oclusivas (/p/, /t/, /k/, /b/, /d/, /g/).
   - Biofeedback de presión acústica con umbral dinámico de aviso de sobretensión.
4. **Habla Prolongada (Prolonged Speech):**
   - Elongación rítmica controlada de vocales (200 a 400 ms) para mantener la ligadura acústica y continuidad del flujo fonatorio.
5. **Respiración Cuadrada (Box Breathing 4-4-4-4):**
   - Pacer visual guiado en 4 fases: Inhalar (4s) → Retener con aire (4s) → Exhalar (4s) → Retener vacío (4s).
   - Activación del sistema nervioso parasimpático y reducción de la taquicardia/ansiedad anticipatoria.
6. **Modificación en Bloqueo (Pull-Out / Técnica de Van Riper):**
   - Detección activa del espasmo durante el habla; guía paso a paso para ralentizar el órgano articulatorio tenso y deslizarse suavemente hacia la salida de la palabra.
7. **Cancelación Post-Bloqueo (Cancellation):**
   - Protocolo post-evento: Detención voluntaria inmediata tras un bloqueo, pausa reflexiva de 3 segundos con exhalación, y reemisión de la palabra con técnica de inicio suave.

### 3.2 Herramientas de Diagnóstico y Biofeedback Avanzado
- **Evaluador Motor Diadococinesia Oral (DDK /pa-ta-ka/):**
  - Mide automáticamente las repeticiones rápidas alternantes y sucesivas.
  - Calcula Sílabas Por Segundo (SPS, valor normativo: 5.0 a 7.5 SPS), desviación estándar de intervalos (Regularidad motora) y fatiga articulatoria.
- **Cuadrilátero Vocálico y Formantes F1/F2 en Tiempo Real:**
  - Detección FFT de los primeros dos formantes acústicos (F1: apertura de mandíbula / altura de lengua; F2: posición anteroposterior lingual).
  - Graficación 2D interactiva que sitúa la voz del paciente en las regiones canónicas de las vocales /a/, /e/, /i/, /o/, /u/.
- **Feedback Auditivo Alterado (DAF / FAF):**
  - Desincronización auditiva con retardo seleccionable (50 ms a 200 ms) y modulación de frecuencia (+/- 2 a 4 semitonos) para inducir el Efecto Lee y promover fluidez inmediata.
- **Biofeedback Acústico On-Device (`AcousticBiofeedback.tsx`):**
  - Indicador de semáforo (Verde: Fluido / Amarillo: Tensión en aumento / Rojo: Micro-tensión crítica).
  - Alerta de micro-tensión laringea prefonatoria en tiempo real sin salir del navegador.
- **Calibrador Fonético Dialectal Panhispánico (`DialectSelector.tsx`):**
  - Permite seleccionar 5 variantes fonéticas del español, adaptando dinámicamente los umbrales de energía y formantes.

### 3.3 Experiencia de Usuario, Gamificación y Telesalud
- **Cadensa Kids:** Interfaz adaptada con temática espacial/lúdica, estrellas, retroalimentación positiva y mecánicas de juego para pacientes pediátricos.
- **Modo Dúo:** Soporte para prácticas simultáneas fonoaudiólogo-paciente o padre-hijo, evaluando cadencia y sincronía en tiempo real.
- **Telesalud WebRTC P2P:** Videollamada y sesión compartida de biofeedback punto a punto encriptada de extremo a extremo, sin servidores intermedios de video.
- **Exportación Clínica HL7 FHIR R4 y Diplomas PDF:**
  - Exportación de resultados a especificación formal HL7 FHIR (`Observation`, `DiagnosticReport`).
  - Generación en cliente de diplomas de honor fonoaudiológico en PDF vectorial descargable.
- **Pie de Página Canónico Universal (`Footer.tsx`):**
  - Homologado en todas las páginas (Inicio, Técnicas, Detalle, Acerca de, Estadísticas, Privacidad, Términos, Admin).
  - Incluye banner oficial AMTTM, directorio de las 7 técnicas, aviso médico YMYL y comprobador de compatibilidad de navegador en tiempo real.

---

## 4. Métricas Reales de Uso, Visitantes y Plataforma

*Datos consolidados a partir de telemetría real en vivo (Google Analytics 4, Google Search Console, Bing Webmaster Tools, Google AdSense y GitGuardian).*

### 4.1 Resumen de Audiencia (Últimos 30 Días)
| Métrica | Valor Registrado | Observación Clínica / Operativa |
| :--- | :--- | :--- |
| **Usuarios Activos Semanales** | **34 usuarios** | Crecimiento orgánico en población hispanohablante |
| **Vistas Totales de Página** | **110 páginas vistas** | Promedio de ~1.7 vistas por sesión |
| **Sesiones Totales** | **65 sesiones** | Sesiones repetidas orientadas a práctica motora |
| **Duración Media de Sesión** | **277 segundos (4.6 min)** | Tiempo elevado y consistente con rutinas de ejercicio de habla |
| **Tasa de Engagement** | **36.9%** | Usuarios completando interacciones con metrónomo y audio |
| **Tasa de Rebote** | **63.1%** | Visitantes exploratorios de landing page |

### 4.2 Alcance Geográfico Internacional (10 Países)
| País | Bandera | Usuarios | Vistas de Página | Participación (%) |
| :--- | :---: | :---: | :---: | :---: |
| **México** | 🇲🇽 | **16** | **62** | 47.1% (Principal foco clínico y sede AMTTM) |
| **Perú** | 🇵🇪 | **4** | **31** | 11.8% (Alta recurrencia de páginas vistas) |
| **Estados Unidos** | 🇺🇸 | **3** | **3** | 8.8% (Comunidad hispanohablante en EE. UU.) |
| **Argentina** | 🇦🇷 | **2** | **4** | 5.9% |
| **Ecuador** | 🇪🇨 | **2** | **3** | 5.9% |
| **Francia** | 🇫🇷 | **2** | **2** | 5.9% |
| **Suecia** | 🇸🇪 | **2** | **2** | 5.9% |
| **Irlanda** | 🇮🇪 | **1** | **1** | 2.9% |
| **España** | 🇪🇸 | **1** | **1** | 2.9% |
| **Reino Unido** | 🇬🇧 | **1** | **1** | 2.9% |
| **Total Global** | 🌐 | **34** | **110** | **100.0%** |

### 4.3 Estatus de Canales de Búsqueda, Indexación y Monetización
- **Google Search Console:**
  - Propiedad de dominio: `https://cadensa-web.pages.dev/`
  - Estado: **Verificado**.
  - Sitemap XML: `https://cadensa-web.pages.dev/sitemap.xml` enviado e indexado con éxito (0 errores, 0 advertencias).
  - Páginas canónicas: En proceso de absorción de impresiones orgánicas para términos como "tartamudez", "habla ritmica silabica", "ejercicios fluidez habla".
- **Bing Webmaster Tools:**
  - Estado: **Titularidad verificada**.
  - Protocolo **IndexNow**: Activo con respuestas HTTP 202 (Aceptado) para reindexación instantánea ante nuevos despliegues.
  - Sitemap procesado y demanda de consulta identificada para palabras clave fonoaudiológicas.
- **Google AdSense:**
  - Publisher ID: `ca-pub-2700240339792942`
  - Archivo `ads.txt`: Servido en raíz HTTP 200, validado y enlazado.
- **GitGuardian Security Audit:**
  - API REST de GitGuardian auditada: **0 incidentes de seguridad abiertos** en el repositorio. Cero fugas de secretos o claves privadas.

---

## 5. Garantía de Calidad y Cobertura de Pruebas

El repositorio mantiene una política de pruebas de tolerancia cero a fallos:

| Tipo de Prueba | Framework / Herramienta | Archivos / Módulos | Cantidad | Resultado |
| :--- | :--- | :--- | :--- | :---: |
| **Pruebas Unitarias** | Vitest + React Testing Library | 64 suites de prueba | **287 pruebas** | **100% Pasadas (Verde)** |
| **Pruebas BDD** | Cucumber.js + Gherkin en español | 12 archivos de características | **101 escenarios (391 pasos)** | **100% Pasadas (Verde)** |
| **Pruebas E2E** | Playwright Cross-Browser | Navegadores Chromium, Firefox, WebKit | Flujos críticos | **Aprobado** |
| **Análisis Estático** | ESLint + TypeScript | Código fuente completo (`src/`) | 0 errores | **Aprobado** |
| **Despliegue CI/CD** | GitHub Actions Turbopack | Workflow `deploy.yml` y `health-check.yml` | 15 endpoints en vivo | **100% Verde (Success)** |

---

## 6. Estado del TODO y Hoja de Ruta Estratégica (Roadmap)

A continuación se detalla la planificación estratégica clasificada por fases, diseñada para orientar el análisis de próximos pasos en **Gemini Notebook**:

### 6.1 Fase Actual: Consolidada y en Producción (Hitos Concluidos)
- [x] Arquitectura Next.js 16 Static Export en Cloudflare Pages con Zero Trust RLS Supabase.
- [x] Motor de Audio Web Audio API con AudioWorklet y AnalyserNode en tiempo de ejecución.
- [x] Implementación de las 7 técnicas fonoaudiológicas clínicas con metrónomo y guías visuales.
- [x] Módulo Diadococinesia Oral (/pa-ta-ka/) con cálculo automatizado de SPS y regularidad motora.
- [x] Biofeedback acústico on-device de micro-tensión prefonatoria (`acousticAiDetector.ts`).
- [x] Selector y motor de presets dialectales para 5 regiones hispanohablantes.
- [x] Cuadrilátero vocálico F1/F2 interactivo y módulo de Feedback Auditivo Alterado (DAF/FAF).
- [x] Cadensa Kids, Modo Dúo y módulo de Telesalud P2P WebRTC E2EE.
- [x] Exportación formal HL7 FHIR R4 de observaciones clínicas y diplomas fonoaudiológicos en PDF.
- [x] Observabilidad forense de errores del cliente con alertas proactivas webhook.
- [x] Homologación universal del pie de página canónico con banner oficial AMTTM en todas las rutas.
- [x] Verificación en Google Search Console, Bing Webmaster Tools (IndexNow), AdSense (`ads.txt`) y GitGuardian (0 incidentes).

---

### 6.2 Fase 1 Inmediata: Próximos Pasos Prioritarios (Siguientes Pasos Clave)
- [ ] **Desensibilización Fóbica en Realidad Virtual WebXR (VR Inmersiva):**
  - Desarrollo de escenarios 3D interactivos en el navegador (usando Three.js / WebXR) para exposición gradual:
    1. Entrevista de trabajo virtual frente a un panel.
    2. Presentación en auditorio o aula universitaria.
    3. Simulación de llamada telefónica o pedido en cafetería.
  - Medición simultánea de la frecuencia cardiaca estimada (vía cámara/webcam con fotopletismografía remota rPPG) y micro-tensión vocal.
- [ ] **Generador Dinámico de Textos Fonéticamente Balanceados (Client-Side NLP):**
  - Algoritmo en cliente que genere o seleccione textos adaptados al nivel del usuario según consonantes conflictivas específicas (ej. sobrecarga de oclusivas bilabiales /p/, /b/ o linguodentales /t/, /d/).
  - Niveles de dificultad graduados: sílabas aisladas → palabras bisílabas → frases de complejidad métrica creciente → lectura espontánea.
- [ ] **Integración de Biofeedback EMG Superficial y Wearables Bluetooth (Web Bluetooth API):**
  - Conexión directa desde el navegador mediante Web Bluetooth API con sensores comerciales o prototipos EMG superficiales (electromiografía) para monitorizar la tensión muscular suprahioidea y laringea en reposo y fonación.

---

### 6.3 Fase 2 Expansión: Integración Clínica Hospitalaria y Móvil
- [ ] **Conexión Formal con Sistemas Hospitalarios (SMART on FHIR):**
  - Implementación del protocolo de autenticación y autorización SMART on FHIR para permitir que fonoaudiólogos y clínicas vinculen directamente los resultados de Cadensa en expedientes médicos electrónicos (EHR / HIS como Epic, Cerner o plataformas locales).
- [ ] **Empaquetado Nativo Offline-First con Capacitor (iOS / iPadOS / Android):**
  - Empaquetado de la SPA estática mediante Capacitor para distribución en App Store y Google Play Store, garantizando funcionamiento 100% offline en zonas rurales o clínicas sin acceso continuo a Internet.
- [ ] **Expansión Fonética Multilingüe:**
  - Adaptación del motor de calibración acústica a portugués brasileño/europeo y a inglés, expandiendo el impacto en América Latina y mercados globales.

---

## 7. Preguntas Guía para Análisis en Gemini Notebook

Para aprovechar al máximo este resumen al ser cargado en **Gemini Notebook / NotebookLM**, se sugieren las siguientes consultas estratégicas:

1. **Priorización de Desarrollo:** *Basándote en el perfil clínico y técnico de Cadensa, ¿cuál de los 3 hitos de la Fase 1 (WebXR, Textos Balanceados, o Wearables BLE) ofrece el mayor ratio de impacto terapéutico frente a complejidad de implementación en una SPA estática?*
2. **Estrategia de Retención y Engagement:** *Con una duración media de sesión de 4.6 minutos y un engagement de 36.9% en 10 países, ¿qué mecánicas de gamificación clínica o micro-hábitos diarios podrían duplicar la recurrencia semanal de los usuarios?*
3. **Escalamiento Fonoaudiológico:** *¿Cómo estructurar un programa piloto formal de validación clínica con la AMTTM y fonoaudiólogos certificados utilizando las herramientas existentes de exportación FHIR y DDK?*
4. **Optimización SEO Orgánico:** *Considerando la demanda identificada en Bing y Google para 'tartamudez' y 'ejercicios de fluidez', ¿qué arquitectura de contenidos educativos o glosario fonoaudiológico interactivo potenciaría el tráfico orgánico sin comprometer el estándar YMYL?*

---
*Fin del Resumen Maestro — Cadensa 2026.*

