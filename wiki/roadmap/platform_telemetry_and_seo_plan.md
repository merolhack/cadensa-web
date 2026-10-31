---
title: "Auditoría Multi-Plataforma y Plan de Remediación (GA4, GSC, AdSense, Bing)"
category: "roadmap"
tags: [roadmap, analytics, ga4, gsc, adsense, bing, seo, remediation]
last_updated: "2026-10-30"
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

> **Fecha de extracción y diagnóstico:** 30 de octubre de 2026  
> **Dominio objetivo:** `https://cadensa-web.pages.dev/`  
> **Propiedad GA4:** `560646502` (`G-HCTT9146TJ`)  
> **Publisher ID AdSense (Ecosistema Autor):** `ca-pub-2700240339792942`  
> **Bing Webmaster Tools Key:** `38ccc57036f94ecf9f0988066f403014`

---

## 1. Estadísticas, Errores y Diagnósticos Descargados

### 1.1 Google Analytics 4 (`analyticsdata.googleapis.com`)
- **Métricas Globales (Últimos 30 días acumulados):**
  - **Usuarios Activos:** `32` (crecimiento sostenido de +52.4% respecto a los 21 usuarios de la auditoría anterior).
  - **Sesiones Totales:** `61` (crecimiento desde 37 sesiones).
  - **Vistas de Pantalla (`screenPageViews`):** `106` (superando la barrera de 100 vistas orgánicas).
  - **Duración Media de Sesión:** `295 segundos` (~4 min 55 seg), demostrando un alto compromiso con los ejercicios clínicos interactivos.
  - **Tasa de Interacción (`engagementRate`):** `37.7%` (aumento continuo desde 32.4%).
  - **Tasa de Rebote (`bounceRate`):** `62.3%` (reducción favorable respecto al 67.57% previo).
  - **Eventos Registrados:**
    - `page_view`: 106
    - `session_start`: 60
    - `first_visit`: 32
    - `user_engagement`: 29
    - `scroll`: 25
    - `click`: 8
    - `form_start`: 7
    - `technique_select`: 5
    - `metronome_start`: 2
    - `simulator_scenario_start`: 2
    - `routine_5min_start`: 1
- **Distribución de Tráfico por Páginas:**
  - `/` (Home y Estación de Práctica): 90 vistas, 31 usuarios, 296.7s duración media.
  - `/stats`: 5 vistas, 3 usuarios.
  - `/about`: 4 vistas, 2 usuarios.
  - `/admin`: 4 vistas, 2 usuarios.
  - `/privacy`: 1 vista, 1 usuario.
  - `/terms`: 1 vista, 1 usuario.
  - `/🐛` (Ruta errónea capturada): 1 vista redirigida con código 404 a `src/app/not-found.tsx`.
- **Alcance Geográfico Global (9 países / 19 localidades):**
  - 🇲🇽 **México:** 16 usuarios / 61 vistas (Querétaro, Aguascalientes, León, Córdoba, Piedras Negras).
  - 🇵🇪 **Perú:** 4 usuarios / 31 vistas (Paucarpata, Bustamante, Arequipa).
  - 🇺🇸 **Estados Unidos:** 3 usuarios / 3 vistas (Forest City, Prineville).
  - 🇦🇷 **Argentina:** 2 usuarios / 3 vistas (Lanús, Manuel B. Gonnet).
  - 🇪🇨 **Ecuador:** 2 usuarios / 3 vistas (Cuenca, Quito).
  - 🇫🇷 **Francia:** 2 usuarios / 2 vistas (París).
  - 🇮🇪 **Irlanda:** 1 usuario / 1 vista (Dublín) — *Nuevo país alcanzado*.
  - 🇸🇪 **Suecia:** 1 usuario / 1 vista (Luleå).
  - 🇬🇧 **Reino Unido:** 1 usuario / 1 vista (Londres) — *Nuevo país alcanzado*.
- **Dispositivos y Canales:**
  - **Desktop:** Windows Chrome (14 usuarios), Linux Chrome (2), Windows Firefox (1), Windows Opera (1).
  - **Mobile:** Android Chrome (11 usuarios), iOS Safari (4 usuarios).
  - **Adquisición:** Direct (55 sesiones / 27 usuarios), Organic Social vía `facebook.com` y `m.facebook.com` (5 sesiones / 5 usuarios referidos desde comunidades fonoaudiológicas y AMTTM).

---

### 1.2 Google Search Console (`webmasters/v3` & `searchconsole/v1`)
- **Estado de Propiedad:** Verificada (`siteRestrictedUser` para la Service Account en `https://cadensa-web.pages.dev/`).
- **Rendimiento de Búsqueda (`searchAnalytics/query`):** `0` clics, `0` impresiones (fase inicial de propagación del índice y procesamiento de sitemap).
- **Sitemaps Registrados (`sitemaps.list`):**
  - URL del sitemap: `https://cadensa-web.pages.dev/sitemap.xml`.
  - Fecha de registro: `2026-10-30T03:21:25.131Z`.
  - Estado: `isPending: true`, `warnings: "0"`, `errors: "0"`. En cola de procesamiento por Googlebot sin incidencias.
- **Inspección de URLs en Vivo (`urlInspection/index:inspect`):**
  - `https://cadensa-web.pages.dev/`: **PASS** (`Enviada e indexada`, rastreada como `MOBILE`, `pageFetchState: SUCCESSFUL`).
  - Subpáginas (`/about`, `/stats`, `/tecnicas/*`): Descubiertas y en cola de indexación gracias al Sitemap.

---

### 1.3 Google AdSense (`adsense.googleapis.com/v2` & Auditoría de Sitio)
- **Estado de API en GCP (`cadensa-web-dev`):**
  - **Estado:** API habilitada y respondiendo **HTTP 200 OK**.
  - **Publisher ID:** `ca-pub-2700240339792942` configurado en `public/ads.txt` y en etiqueta `<meta name="google-adsense-account">` en `src/app/layout.tsx`.
- **Estatus de Cumplimiento YMYL y Políticas:**
  - ✅ Archivo `public/ads.txt` validado y servido correctamente en la raíz del dominio.
  - ✅ CSP en `public/_headers` ajustado para permitir recursos y frames de Google AdSense (`pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`).
  - ✅ Páginas obligatorias publicadas: Política de Privacidad (`/privacy`), Términos de Uso (`/terms`) y descargo de responsabilidad médica fonoaudiológica visible.
  - ✅ Páginas de contenido editorial clínico (`/tecnicas/*`) con explicaciones detalladas para prevenir rechazos por "sitio de bajo valor".

---

### 1.4 Bing Webmaster Tools (`ssl.bing.com/webmaster/api.svc`)
- **Estado de Propiedad:** Verificada con API Key (`38ccc57036f94ecf9f0988066f403014`).
- **Estado de Sitemaps (`GetFeeds`):**
  - **Issue Detectado y Corregido (BING-FEED-1):** Anteriormente el script intentaba enviar `SubmitFeed` con método GET, provocando `HTTP 405 Method Not Allowed`. Se refactorizó el script para enviar la solicitud mediante método `POST` con cuerpo JSON `{ siteUrl, feedUrl }`.
  - **Confirmación en Vivo:** La API de Bing respondió `HTTP 200 {"d":null}`. La consulta posterior a `GetFeeds` confirmó el registro exitoso:
    - URL: `https://cadensa-web.pages.dev/sitemap.xml`
    - Estado: `Pending`
    - Fecha de envío: `2026-10-30`
- **Protocolo IndexNow:**
  - ✅ Clave de verificación activa en `public/856757614ffc2c5582fbcb81b1b4e4ca.txt`.
  - ✅ Disparo automatizado exitoso con **HTTP 200 OK** para las 12 URLs prioritarias del sitio hacia `https://api.indexnow.org/indexnow`.
- **Errores de Rastreo (`GetCrawlIssues`):** `0` errores reportados.

---

## 2. Matriz de Issues Detectados y Estado de Remediación

| ID | Plataforma | Descripción del Issue | Estado | Solución Aplicada / Verificación |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | Bing Webmaster | `SubmitFeed` fallaba con `HTTP 405 Method Not Allowed`. | ✅ **Resuelto** | Se actualizó `scripts/submit_seo_index.cjs` a método `POST` con body JSON. Confirmado estado `Pending` en Bing. |
| **ISSUE-02** | GA4 / Stats UI | Banderas faltantes para Irlanda (🇮🇪) y Reino Unido (🇬🇧) en `/stats`. | ✅ **Resuelto** | Se incorporaron `Ireland` y `United Kingdom` en `COUNTRY_FLAGS` dentro de `src/app/stats/page.tsx`. |
| **ISSUE-03** | Google Search Console | Sitemap ausente en índice de GSC. | ✅ **Resuelto** | Sitemap `sitemap.xml` enviado y registrado sin errores (`warnings: 0, errors: 0`). |
| **ISSUE-04** | AdSense | Falta de archivo `ads.txt` y meta tag en layout. | ✅ **Resuelto** | `public/ads.txt` y `<meta name="google-adsense-account">` operativos con ID `pub-2700240339792942`. |
| **ISSUE-05** | GA4 | Tráfico bot a ruta `/🐛` provocando rebote. | ✅ **Resuelto** | `src/app/not-found.tsx` captura cualquier ruta inexistente y redirige amigablemente al catálogo fonoaudiológico. |
| **ISSUE-06** | Bing Webmaster | Bingbot sin descubrimiento de subpáginas (`AnchorCount: 0`). | 🔄 **En Progreso** | Resuelto a nivel sitemap vía IndexNow (HTTP 200) y feed de sitemap registrado en Bing API. Pendiente indexación por crawler. |

---

## 3. Plan de Nuevas Funcionalidades Clínicas y Crecimiento Orgánico

| Hito / Funcionalidad | Componentes / Archivos | Impacto Clínico y de Adquisición | Prioridad |
| :--- | :--- | :--- | :--- |
| **1. Enlaces Footer a Técnicas para SEO Crawler Interlinking** | `src/components/Footer.tsx`<br>`src/app/layout.tsx` | Permite a Bingbot y Googlebot rastrear directamente las 7 técnicas desde cualquier página, elevando el `AnchorCount` y `TotalChildUrlCount` por encima de 0. | **P0 (Inmediata)** |
| **2. Inferencia Acústica On-Device (ONNX Runtime Web / WebGPU)** | `src/lib/acousticAiDetector.ts`<br>`src/components/AcousticBiofeedback.tsx` | Detección on-device mediante red neuronal de micro-tensión laringotraqueal previa al inicio del habla para prevenir bloqueos tónicos. | **P1 (Siguiente Sprint)** |
| **3. Desensibilización Fóbica en Realidad Virtual WebXR** | `src/components/WebXRSimulator.tsx`<br>`src/app/simulador/page.tsx` | Exposición gradual en navegador a situaciones sociales reales con metrónomo háptico/auditivo de fondo. | **P1 (Siguiente Sprint)** |
| **4. Mapeo Fonético Transversal Multilingüe** | `src/lib/phoneticPresets.ts`<br>`src/components/DialectSelector.tsx` | Ajuste de métricas de precisión de fonación para variedades dialectales hispanohablantes (México, Cono Sur, Andino, Caribe, España). | **P2** |
