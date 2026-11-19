---
title: "Auditoría Multi-Plataforma y Plan de Remediación (GA4, GSC, AdSense, Bing, Cloudflare)"
category: "roadmap"
tags: [roadmap, analytics, ga4, gsc, adsense, bing, cloudflare, seo, remediation]
last_updated: "2026-11-19"
sources:
  - "scripts/deep_audit_telemetry.cjs"
  - "reports/deep_telemetry_and_server_audit.json"
  - "src/data/platform_stats.json"
  - "src/app/stats/page.tsx"
related:
  - "wiki/index.md"
  - "wiki/roadmap/next_steps_plan.md"
  - "wiki/operations/deployment_runbook.md"
---

# Auditoría Multi-Plataforma y Plan de Remediación (GA4, GSC, AdSense, Bing y Cloudflare)

> **Fecha de extracción y diagnóstico:** 19 de noviembre de 2026  
> **Dominio objetivo:** `https://cadensa-web.pages.dev/`  
> **Propiedad GA4:** `560646502` (`G-HCTT9146TJ`)  
> **Publisher ID AdSense (Ecosistema Autor):** `ca-pub-2700240339792942`  
> **Bing Webmaster Tools Key:** `856757614FFC2C5582FBCB81B1B4E4CA`  
> **Servidor Edge:** Cloudflare Pages (`cadensa-web`, ID `c5edab4a-ed3b-4582-af5d-a157cc959796`)

---

## 1. Estadísticas, Errores y Diagnósticos Descargados

### 1.1 Google Analytics 4 (`analyticsdata.googleapis.com`)
- **Métricas Globales (Últimos 30 días acumulados):**
  - **Usuarios Activos:** `128` (crecimiento sostenido de **+300%** frente a los 32 usuarios de la auditoría inicial de octubre).
  - **Sesiones Totales:** `215` (crecimiento de +252% desde 61 sesiones).
  - **Vistas de Pantalla (`screenPageViews`):** `289` vistas reales consolidadas.
  - **Duración Media de Sesión:** `140 segundos` (~2 min 20 seg).
  - **Tasa de Interacción (`engagementRate`):** `22.8%`.
  - **Tasa de Rebote (`bounceRate`):** `77.2%`.
- **Distribución de Tráfico por Páginas:**
  - `/` (Home y Estación de Práctica): `248` vistas, `116` usuarios, 136s de duración media.
  - `/login`: `9` vistas, `9` usuarios.
  - `/about`: `8` vistas, `4` usuarios, 63s de duración.
  - `/admin`: `7` vistas, `2` usuarios, 254s de duración media.
  - `/stats`: `7` vistas, `3` usuarios, 180s de duración media.
  - `/register`: `6` vistas, `6` usuarios.
  - `/terms`: `2` vistas, `2` usuarios, 10s de duración.
  - `/privacy`: `1` vista, `1` usuario.
  - `/🐛` (Ruta anómala/bot capturada): `1` vista gestionada con 404 seguro hacia `src/app/not-found.tsx`.
- **Eventos Registrados de Interacción y Práctica Clínica:**
  - `page_view`: 289
  - `session_start`: 212
  - `first_visit`: 127
  - `user_engagement`: 58
  - `scroll`: 51
  - `technique_select`: 20 selecciones de técnicas fonoaudiológicas (13 usuarios distintos).
  - `form_start`: 13
  - `metronome_start`: 10 arranques del metrónomo isocrónico (6 usuarios distintos).
  - `click`: 8
  - `metronome_stop`: 7 detenciones conscientes.
  - `routine_5min_start`: 2 inicios de la rutina guiada de 5 minutos.
  - `simulator_scenario_start`: 2 ejecuciones del simulador de situaciones de habla cotidiana.
- **Dispositivos y Comportamiento de Usuario:**
  - **Desktop:** 108 usuarios (137 sesiones) → 1.26 sesiones/usuario.
  - **Mobile:** 21 usuarios (79 sesiones) → **3.76 sesiones/usuario**. El segmento móvil demuestra una recurrencia casi 3× superior al escritorio, utilizando Cadensa como herramienta de práctica diaria en el bolsillo.
- **Alcance Geográfico Global:**
  - 🇺🇸 **Estados Unidos:** 62 usuarios / 66 vistas.
  - 🇲🇽 **México:** 43 usuarios / 159 vistas (núcleo de mayor profundidad clínica y repetición de ejercicios).
  - 🇵🇪 **Perú:** 7 usuarios / 45 vistas.
  - 🇦🇷 **Argentina:** 2 usuarios / 4 vistas.
  - 🇪🇨 **Ecuador:** 2 usuarios / 3 vistas.
  - 🇫🇷 **Francia:** 2 usuarios / 2 vistas.
  - 🇩🇪 **Alemania:** 2 usuarios / 2 vistas.
  - 🇪🇸 **España:** 2 usuarios / 2 vistas.
  - 🇸🇪 **Suecia:** 2 usuarios / 2 vistas.
  - 🇧🇷 Brasil, 🇮🇳 India, 🇮🇪 Irlanda, 🇬🇧 Reino Unido: 1 usuario cada uno.

---

### 1.2 Google Search Console (`webmasters/v3` & `searchconsole/v1`)
- **Estado de Propiedad:** Verificada con nivel `siteRestrictedUser` para la cuenta de servicio `cadensa-metrics-extractor@cadensa-web-dev.iam.gserviceaccount.com` en `https://cadensa-web.pages.dev/`.
- **Rendimiento de Búsqueda:** `0` clics y `0` impresiones orgánicas en los últimos 30 días.
  - *Diagnóstico:* El dominio actual es un subdominio gratuito de Cloudflare Pages (`*.pages.dev`), el cual carece de autoridad de dominio (DA/DR) consolidada frente a dominios TLD de salud fonoaudiológica. Adicionalmente, el índice de Google da prioridad de indexación a dominios canónicos personalizados.
- **Estado de Indexación:**
  - Home (`https://cadensa-web.pages.dev/`): **Indexada y activa** (`Enviada e indexada`, rastreo móvil exitoso).

---

### 1.3 Google AdSense (`adsense.googleapis.com/v2` & Auditoría de Sitio)
- **Estado de API en GCP:** API habilitada y respondiendo **HTTP 200 OK**.
- **Publisher ID:** `ca-pub-2700240339792942` activo en `public/ads.txt` y en etiqueta `<meta name="google-adsense-account">` en `src/app/layout.tsx`.
- **Diagnóstico de Cuenta:** La consulta `GET /v2/accounts` devolvió `accounts: []`.
  - *Causa Raíz:* La cuenta de servicio de GCP no está añadida como usuario en la consola de Google AdSense, y las políticas de aprobación de sitios de AdSense restringen la monetización de subdominios (`*.pages.dev`), requiriendo un dominio de segundo nivel (TLD).

---

### 1.4 Bing Webmaster Tools (`ssl.bing.com/webmaster/api.svc`)
- **Estado de Propiedad:** Verificada (`IsVerified: true`) con código de autenticación `856757614FFC2C5582FBCB81B1B4E4CA`.
- **Estadísticas de Rastreo (`GetCrawlStats`):**
  - Respuestas HTTP 200 (`Code2xx`): 1 diario regular.
  - Códigos 4xx / 5xx: 0.
  - Bloqueos por robots.txt: 0.
  - Errores de rastreo (`CrawlErrors`): 0.
- **Rendimiento:** 0 clics y 0 impresiones orgánicas en Bing.
- **Protocolo IndexNow:** Operativo y validado en `public/856757614ffc2c5582fbcb81b1b4e4ca.txt`.

---

### 1.5 Servidor de Alojamiento y Logs (Cloudflare Pages)
- **Proyecto:** `cadensa-web` (ID `c5edab4a-ed3b-4582-af5d-a157cc959796`).
- **Estado de Salud de Despliegues:** **100% Exitoso (`success`)** en los 5 despliegues recientes.
- **Último Despliegue en Producción:** ID `14c6dcd6-4dd2-4a66-98b1-a0ee9fead860`, branch `main`, con log final `"Success: Your site was deployed!"`.
- **Rendimiento Edge:** Cero errores 5xx reportados por la infraestructura Edge de Cloudflare.

---

## 2. Matriz de Issues Detectados y Estado de Remediación

| ID | Plataforma | Descripción del Issue | Estado | Solución Aplicada / Plan de Remediación |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | Bing Webmaster | `SubmitFeed` fallaba con `HTTP 405 Method Not Allowed`. | ✅ **Resuelto** | Actualizado a método `POST` con body JSON. Sitemaps confirmados en Bing. |
| **ISSUE-02** | GA4 / Stats UI | Banderas faltantes para Irlanda (🇮🇪) y Reino Unido (🇬🇧) en `/stats`. | ✅ **Resuelto** | Incorporados en `COUNTRY_FLAGS` dentro de `src/app/stats/page.tsx`. |
| **ISSUE-03** | Google Search Console | Sitemap ausente en índice inicial de GSC. | ✅ **Resuelto** | `sitemap.xml` registrado y procesado sin incidencias. |
| **ISSUE-04** | AdSense | Falta de archivo `ads.txt` y meta tag en layout. | ✅ **Resuelto** | `public/ads.txt` y `<meta name="google-adsense-account">` operativos con ID `pub-2700240339792942`. |
| **ISSUE-05** | GA4 | Tráfico bot a ruta `/🐛` provocando rebote. | ✅ **Resuelto** | `src/app/not-found.tsx` captura cualquier ruta inexistente y redirige amigablemente. |
| **ISSUE-06** | Bing Webmaster | Bingbot sin descubrimiento de subpáginas (`AnchorCount: 0`). | ✅ **Resuelto** | Despacho IndexNow continuo y enlaces internos en el Footer. |
| **ISSUE-07** | GA4 / UX | **Embudo de conversión débil en Home:** 248 vistas en Home pero solo 20 selecciones de técnica y 10 arranques de metrónomo. La mayoría de los usuarios no llega a iniciar la práctica. | 🔄 **En Progreso** | Diseñar un flujo de "Práctica Rápida en 1 Toque" (Quick-Start) directamente en el hero principal sin obligar a explorar el catálogo completo. |
| **ISSUE-08** | GSC / AdSense | **Falta de tracción orgánica y bloqueo de monetización por subdominio `.pages.dev`:** 0 clics orgánicos y AdSense no aprueba subdominios de Pages. | ⏳ **Planificado** | Preparar la arquitectura y configuración de DNS en Cloudflare para vincular un dominio personalizado TLD (`cadensa.app` o `cadensa.org`). |
| **ISSUE-09** | Mobile UX | **Fricción en usuarios móviles recurrentes:** 21 usuarios móviles generan 79 sesiones (3.76 sesiones/usuario), pero la interfaz exige navegación de escritorio. | 🔄 **En Progreso** | Implementar accesos directos de práctica rápida para móviles, feedback táctil háptico reforzado en botones y banner de instalación PWA persistente pero no intrusivo. |
| **ISSUE-10** | GSC / GCP | Disparidad de permisos en Service Accounts: `cadensa-tts-service` no tiene permisos en GSC mientras que `cadensa-metrics-extractor` sí los tiene. | ✅ **Resuelto** | Estandarizado el uso de `sa-key.json` (`cadensa-metrics-extractor`) para todas las tareas de auditoría y extracción de telemetría. |

---

## 3. Plan de Nuevas Funcionalidades Clínicas y Crecimiento

| Hito / Funcionalidad | Componentes / Archivos | Impacto Clínico y de Adquisición | Prioridad |
| :--- | :--- | :--- | :--- |
| **1. Modo "Práctica Rápida en 1 Toque" (Quick-Start Flow)** | `src/components/QuickStartExercise.tsx`<br>`src/app/page.tsx` | Reduce la fricción de entrada: botón prominente en el Hero que inicia inmediatamente una sesión guiada de 60 segundos con STS y Easy Onset. | **P0 (Inmediata)** |
| **2. Retos Diarios Fonoaudiológicos con Gamificación Móvil** | `src/components/DailyChallengeModal.tsx`<br>`src/lib/streaks.ts` | Aprovecha la alta recurrencia de los usuarios móviles (3.76 sesiones/usuario) con una meta diaria (ej. 3 minutos de lectura rítmica) y recompensa visual de racha. | **P0 (Inmediata)** |
| **3. Optimización PWA y Accesos Directos Móviles (Web App Manifest Shortcuts)** | `public/manifest.json`<br>`src/lib/pwaManifest.ts` | Agrega accesos directos en el icono de la app para "Iniciar Metrónomo" y "Frase de Desafío" directamente desde la pantalla de inicio del teléfono. | **P1 (Siguiente Sprint)** |
| **4. Vinculación de Dominio Personalizado TLD y Activación AdSense** | Cloudflare DNS<br>`next.config.ts`<br>`public/_headers` | Transición de `cadensa-web.pages.dev` a dominio de marca personalizado para desbloquear indexación SEO de alta prioridad y aprobación formal en Google AdSense. | **P1 (Siguiente Sprint)** |
| **5. Desensibilización Fóbica en Realidad Virtual WebXR** | `src/components/WebXRSimulator.tsx`<br>`src/app/simulador/page.tsx` | Exposición gradual en navegador a situaciones sociales reales con metrónomo háptico/auditivo de fondo. | **P2** |
