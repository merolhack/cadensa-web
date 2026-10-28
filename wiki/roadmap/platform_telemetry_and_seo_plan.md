---
title: "Auditoría Multi-Plataforma y Plan de Remediación (GA4, GSC, AdSense, Bing)"
category: "roadmap"
tags: [roadmap, analytics, ga4, gsc, adsense, bing, seo, remediation]
last_updated: "2026-10-28"
sources:
  - "scripts/fetch_platform_metrics.cjs"
  - "src/data/platform_stats.json"
  - "src/app/stats/page.tsx"
related:
  - "wiki/index.md"
  - "wiki/roadmap/next_steps_plan.md"
  - "wiki/architecture/about_and_roadmap_sync.md"
---

# Auditoría Multi-Plataforma y Plan de Remediación (GA4, GSC, AdSense y Bing)

> **Fecha de extracción y diagnóstico:** 28 de octubre de 2026  
> **Dominio objetivo:** `https://cadensa-web.pages.dev/`  
> **Propiedad GA4:** `560646502` (`G-HCTT9146TJ`)  
> **Publisher ID AdSense (Ecosistema Autor):** `ca-pub-2700240339792942`

---

## 1. Estadísticas, Errores y Diagnósticos Descargados

### 1.1 Google Analytics 4 (`analyticsdata.googleapis.com`)
- **Métricas Globales (Últimos 30 días):**
  - **Usuarios Activos:** `21` (100% usuarios nuevos, crecimiento de +133% respecto a los 9 usuarios del corte anterior).
  - **Sesiones Totales:** `37` (`12` sesiones con interacción / *engaged sessions*).
  - **Vistas de Pantalla (`screenPageViews`):** `61`.
  - **Duración Media de Sesión:** `222.13 segundos` (~3 min 42 seg en ventana de 30 días; `105 seg` en últimos 7 días).
  - **Tasa de Interacción (`engagementRate`):** `32.43%`.
  - **Tasa de Rebote (`bounceRate`):** `67.57%`.
  - **Eventos Totales:** `162` (`page_view`: 61, `session_start`: 36, `first_visit`: 21, `user_engagement`: 19, `scroll`: 14, `click`: 6, `form_start`: 5).
- **Alcance Geográfico (7 países / 17 localidades):**
  - 🇲🇽 **México:** 9 usuarios / 29 vistas (Santiago de Querétaro: 5 usuarios/20 vistas; Aguascalientes: 2/4; León: 1/3; Córdoba: 1/1; Piedras Negras: 1/1).
  - 🇵🇪 **Perú:** 3 usuarios / 23 vistas (Paucarpata: 1 usuario/13 vistas; José Luis Bustamante: 1/1; otros: 9 vistas; **1 usuario activo en Realtime**).
  - 🇦🇷 **Argentina:** 2 usuarios / 2 vistas (Lanús, Manuel B. Gonnet).
  - 🇪🇨 **Ecuador:** 2 usuarios / 2 vistas (Cuenca, Quito).
  - 🇫🇷 **Francia:** 2 usuarios / 2 vistas (París).
  - 🇺🇸 **Estados Unidos:** 2 usuarios / 2 vistas (Forest City, Prineville).
  - 🇸🇪 **Suecia:** 1 usuario / 1 vista (Luleå).
- **Dispositivos y Canales:**
  - **Desktop:** Windows Chrome (7 usuarios, 18 sesiones), Linux Chrome (2), Windows Firefox (1), Windows Opera (1).
  - **Mobile:** Android Chrome (7 usuarios, 12 sesiones), iOS Safari (3 usuarios, 3 sesiones, 66.7% engagement).
  - **Adquisición:** Direct (18 usuarios / 33 sesiones), Organic Social vía `facebook.com` y `m.facebook.com` (3 usuarios / 3 sesiones desde el enlace comunitario AMTTM), Unassigned (2).
- **Issues Detectados en GA4:**
  - **Issue GA4-1 (Rutas 404 y Sondas de Bots):** Se registró tráfico hacia la ruta inexistente `/🐛` devolviendo título `"404: This page could not be found."` con 100% de rebote. No existe una página `src/app/not-found.tsx` personalizada que redirija al usuario al catálogo de técnicas.
  - **Issue GA4-2 (Ausencia de Telemetría Clínica Personalizada):** GA4 solo registra eventos automáticos de navegación. No se emiten eventos personalizados cuando un paciente inicia el metrónomo (`metronome_start`), selecciona una técnica fonoaudiológica (`technique_select`), registra sílabas (`voice_tap_accuracy`) o exporta su reporte clínico (`clinical_report_export`).
  - **Issue GA4-3 (Mapeo de Banderas en `/stats`):** El nuevo país activo `Sweden` (Suecia) no figura en `COUNTRY_FLAGS` dentro de `src/app/stats/page.tsx`.

---

### 1.2 Google Search Console (`webmasters/v3` & `searchconsole/v1`)
- **Estado de Propiedad:** Verificada (`siteRestrictedUser` para la Service Account en `https://cadensa-web.pages.dev/`).
- **Rendimiento de Búsqueda (`searchAnalytics/query`):** `0` clics, `0` impresiones en los últimos días (días registrados en API: 2026-10-24 a 2026-10-26).
- **Sitemaps Registrados (`sitemaps.list`):** Vacío (`{}`).
- **Inspección de URLs en Vivo (`urlInspection/index:inspect`):**
  - `https://cadensa-web.pages.dev/`: **PASS** (`Enviada e indexada`, rastreada como `MOBILE` el `2026-10-24T23:48:29Z`, `pageFetchState: SUCCESSFUL`).
  - `https://cadensa-web.pages.dev/about`: **NEUTRAL** (`Google no reconoce esta URL` — No descubierta ni indexada).
  - `https://cadensa-web.pages.dev/stats`: **NEUTRAL** (`Google no reconoce esta URL` — No descubierta ni indexada).
- **Issues Detectados en GSC:**
  - **Issue GSC-1 (Error 404 en `/sitemap.xml`):** El sitio devuelve **HTTP 404** al solicitar `https://cadensa-web.pages.dev/sitemap.xml` y ninguna ruta ha sido enviada mediante API a Google Search Console.
  - **Issue GSC-2 (`robots.txt` Genérico sin Directiva Sitemap):** Al no existir `public/robots.txt` ni `src/app/robots.ts`, Cloudflare inyecta un `robots.txt` por defecto de directivas de IA que **no incluye** `Sitemap: https://cadensa-web.pages.dev/sitemap.xml`.
  - **Issue GSC-3 (Rutas Secundarias Huérfanas para el Crawler):** Debido a que la página de inicio (`src/app/page.tsx`) es un Client Component y carecía de Sitemap, Googlebot no ha descubierto `/about`, `/stats` ni páginas individuales por técnica clínica.

---

### 1.3 Google AdSense (`adsense.googleapis.com/v2` & Auditoría de Sitio)
- **Estado de API en GCP (`cadensa-web-dev`):**
  - **Hallazgo:** La API `adsense.googleapis.com` estaba **DESHABILITADA** en el proyecto GCP `1014778372980` (`cadensa-web-dev`), arrojando `HTTP 403 SERVICE_DISABLED`.
  - **Acción Ejecutada en Auditoría:** Se habilitó inmediatamente mediante `gcloud services enable adsense.googleapis.com --project=cadensa-web-dev`, pasando a responder **HTTP 200 OK**.
  - **Nota de Permisos de AdSense API:** Google AdSense Management API v2 no permite agregar cuentas de servicio (`*.iam.gserviceaccount.com`) como usuarios directos de consola AdSense, por lo que la consulta con Service Account retorna `{}` y requiere OAuth2 de usuario o validación estática en sitio con el Publisher ID del autor (`ca-pub-2700240339792942`).
- **Issues Detectados en el Sitio para AdSense:**
  - **Issue ADS-1 (Error 404 en `/ads.txt`):** `https://cadensa-web.pages.dev/ads.txt` devuelve **HTTP 404**. Falta el archivo `public/ads.txt` con el registro `google.com, pub-2700240339792942, DIRECT, f08c47fec0942fa0`.
  - **Issue ADS-2 (Ausencia de Meta Tag y Script de Verificación):** `src/app/layout.tsx` no incluye `<meta name="google-adsense-account" content="ca-pub-2700240339792942" />`.
  - **Issue ADS-3 (Bloqueo por Content-Security-Policy en `public/_headers`):** La política CSP actual bloquea `https://pagead2.googlesyndication.com` y `https://googleads.g.doubleclick.net`, además de tener `frame-src 'none'`, lo que impediría la verificación o renderizado de AdSense si se activa.
  - **Issue ADS-4 (Páginas Legales y YMYL Faltantes):** Al ser una aplicación de salud y fonoaudiología (*Your Money or Your Life - YMYL*), Google exige páginas explícitas de **Política de Privacidad (`/privacy`)**, **Términos de Uso (`/terms`)** y un **Descargo de Responsabilidad Médica (Medical Disclaimer)** visible que aclare que Cadensa es una herramienta de apoyo práctico y no sustituye el diagnóstico de un fonoaudiólogo o logopeda certificado.

---

### 1.4 Bing Webmaster Tools (`ssl.bing.com/webmaster/api.svc`)
- **Estado de Propiedad (`GetUserSites`):** Sitio `https://cadensa-web.pages.dev/` **Verificado (`IsVerified: true`)** junto con los otros 7 sitios de la red del autor (`dqro.mx`, `freelancemexico.com.mx`, `mach-playbook.github.io`, `merolhack.github.io`, etc.).
- **Diagnóstico de URL (`GetUrlInfo`):**
  - `IsPage: true`, `AnchorCount: 0`, `TotalChildUrlCount: 0`, `DocumentSize: 0`, `HttpStatus: 0`.
  - `GetFeeds` (Sitemaps en Bing): Vacío (`[]`).
  - `GetCrawlIssues`: `[]` (0 errores de rastreo reportados porque aún no ha indexado subpáginas).
- **Investigación de Keywords (`GetKeywordStats` para `"tartamudez"` en `es-MX`):**
  - Demanda constante y activa en Bing México para consultas de tartamudez y ejercicios del habla.
- **Issues Detectados en Bing:**
  - **Issue BING-1 (Falta de Sitemap e IndexNow):** Aunque la UI en `/stats` menciona `"IndexNow & API"`, no existe el archivo de clave de verificación IndexNow en `public/` ni un script que notifique automáticamente a `https://api.indexnow.org/indexnow` cada vez que se despliega contenido nuevo.
  - **Issue BING-2 (`AnchorCount: 0` y `TotalChildUrlCount: 0`):** Bingbot no detecta páginas hijas ni datos estructurados JSON-LD (`MedicalWebPage` / `SoftwareApplication`) en el HTML estático inicial.

---

## 2. Plan Maestro para Corregir Issues y Agregar Nuevas Funcionalidades

| Fase | Tarea / Entregable | Archivos Involucrados | Prioridad | Criterio de Aceptación (Vitest + Cucumber) |
| :--- | :--- | :--- | :--- | :--- |
| **Fase A: SEO Técnico, Indexación & IndexNow** | 1. Generación nativa de `sitemap.xml` y `robots.txt` en Next.js Export.<br>2. Registro automático del Sitemap en GSC y Bing API.<br>3. Integración de protocolo **IndexNow** para Bing.<br>4. Marcado **JSON-LD** (`WebApplication` + `MedicalWebPage` + `Person`) en `layout.tsx`.<br>5. Página **404 personalizada (`not-found.tsx`)** para capturar rutas inválidas (ej. `/🐛`). | `src/app/sitemap.ts`<br>`src/app/robots.ts`<br>`src/app/not-found.tsx`<br>`src/app/layout.tsx`<br>`public/856757614ffc2c5582fbcb81b1b4e4ca.txt`<br>`scripts/submit_seo_index.cjs` | **Alta (P0)** | • `/sitemap.xml` y `/robots.txt` generados en `out/` con todas las rutas.<br>• Envío HTTP 200 de Sitemap a GSC y Bing API.<br>• Pruebas unitarias y BDD validando JSON-LD y vista 404. |
| **Fase B: Telemetría Clínica GA4 & Diagnóstico en `/stats`** | 1. Módulo `src/lib/analytics.ts` con `trackClinicalEvent()` para emitir eventos GA4 (`metronome_start`, `technique_select`, `session_completed`, `clinical_report_export`, `voice_accuracy_recorded`).<br>2. Ampliar `scripts/fetch_platform_metrics.cjs` para extraer estado de indexación URL Inspection, Sitemaps y dispositivos.<br>3. Añadir bandera `🇸🇪 Suecia` y métricas de indexación/salud SEO en `/stats`. | `src/lib/analytics.ts`<br>`src/lib/analytics.test.ts`<br>`scripts/fetch_platform_metrics.cjs`<br>`src/app/stats/page.tsx`<br>`src/data/platform_stats.json` | **Alta (P0)** | • Eventos disparados a `window.gtag` sin romper SSR/Tests.<br>• `platform_stats.json` actualizado con diagnósticos de indexación.<br>• Bandera de Suecia renderizada en `/stats`. |
| **Fase C: Cumplimiento AdSense & Salud YMYL** | 1. Crear `public/ads.txt` con `pub-2700240339792942`.<br>2. Incorporar `<meta name="google-adsense-account">` en `src/app/layout.tsx` y ajustar CSP en `public/_headers`.<br>3. Crear páginas obligatorias **Política de Privacidad (`/privacy`)** y **Términos y Aviso Clínico Fonoaudiológico (`/terms`)** con enlaces en el footer global. | `public/ads.txt`<br>`public/_headers`<br>`src/app/layout.tsx`<br>`src/app/privacy/page.tsx`<br>`src/app/terms/page.tsx` | **Media-Alta (P1)** | • `/ads.txt` servido con Publisher ID oficial.<br>• Rutas `/privacy` y `/terms` pre-renderizadas con aviso médico YMYL.<br>• Suite Vitest y Cucumber 100% en verde. |
| **Fase D: Nuevas Funcionalidades Clínicas & Crecimiento Orgánico** | 1. **Rutas Estáticas SEO por Técnica (`/tecnicas/[id]`):** Pre-renderizar con `generateStaticParams` una página indexable para cada una de las 7 técnicas clínicas (STS, Easy Onset, Contacto Ligero, Habla Prolongada, Respiración 4-4-4-4, Pull-Out, Cancelación) para multiplicar por 7 la huella en Google y Bing.<br>2. **Simulador de Situaciones Reales (`RealWorldSimulator.tsx`):** Entrenamiento guiado para contextos de alta presión (llamada telefónica, presentación laboral, pedir en restaurante, entrevista).<br>3. **Modo Rutina Guiada de 5 Minutos (`QuickDailyRoutine.tsx`):** Flujo paso a paso (1 min respiración 4-4-4-4 + 2 min Easy Onset + 2 min STS) para reducir la tasa de rebote del 67.5% al guiar al usuario nuevo desde el primer clic. | `src/app/tecnicas/[id]/page.tsx`<br>`src/components/RealWorldSimulator.tsx`<br>`src/components/QuickDailyRoutine.tsx`<br>`src/app/page.tsx` | **Media-Alta (P1)** | • 7 páginas estáticas generadas en `out/tecnicas/*` con contenido rico (>500 palabras clínicas c/u) y botón directo de entrenamiento.<br>• Simulador de situaciones reales y rutina de 5 min cubiertos con pruebas Vitest y escenarios Gherkin BDD. |

