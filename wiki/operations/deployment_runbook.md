---
title: "Runbook de Despliegue en Cloudflare Pages y Gestión de Medios (Producción)"
category: "operations"
tags: [operations, deployment, runbook, cloudflare-pages, nextjs, turbopack, r2, cdn]
last_updated: "2026-11-04"
sources:
  - "next.config.ts"
  - "package.json"
  - ".github/workflows/deploy.yml"
  - "scripts/compose_cadensa_video.py"
  - "scripts/submit_seo_changes.py"
related:
  - "wiki/architecture/cicd_deployment.md"
  - "wiki/architecture/video_generation_pipeline.md"
  - "wiki/operations/developer_handoff.md"
---

# Runbook de Despliegue en Cloudflare Pages y Gestión de Medios (Producción)

Este documento describe el procedimiento operativo estandarizado para compilar, verificar y desplegar **Cadensa** en **Cloudflare Pages**, así como la estrategia de escalamiento y entrega de activos multimedia de alta definición.

---

## 1. Arquitectura de Despliegue

Cadensa opera bajo el paradigma **Static SPA** (Jamstack desacoplado) con Cloudflare Pages como Edge CDN Anycast global y Supabase como backend BaaS Zero Trust:
- **Compilador:** Next.js 16 con motor Turbopack (`next build`).
- **Modo de Exportación:** Estático inmutable (`output: 'export'` en `next.config.ts`).
- **Directorio de Artefactos:** `out/` (contiene todo el HTML prerenderizado, CSS, JS y activos en `media/`).
- **Infraestructura de Hosting:** Cloudflare Pages (red global con compresión Brotli/Gzip automática, HTTP/3 y mitigación DDoS).

---

## 2. Variables de Entorno Requeridas

Todas las variables de producción deben registrarse en el panel de **Cloudflare Pages** (`Settings` → `Environment variables`) o en los **GitHub Actions Secrets**:

| Variable | Tipo | Requerida | Propósito | Ejemplo / Formato |
| :--- | :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (Client) | **Sí** | Endpoint de la API REST / Realtime de Supabase | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (Client) | **Sí** | Llave anónima pública con Zero Trust RLS | `eyJhbGciOiJIUzI1Ni...` |
| `NEXT_PUBLIC_GA_ID` | Pública (Client) | Opcional | ID de medición de Google Analytics 4 | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Pública (Client) | Opcional | Client ID para Google OAuth 2.0 | `xxxxxx.apps.googleusercontent.com` |
| `NEXT_PUBLIC_SITE_URL` | Pública (Client) | Opcional | URL canónica de producción | `https://cadensa-web.pages.dev` |

> ⚠️ **Principio Zero Trust:** Jamás configures `SUPABASE_SERVICE_ROLE_KEY` en el frontend ni en variables con prefijo `NEXT_PUBLIC_`. Toda la seguridad y el aislamiento de datos multi-inquilino se gobiernan a nivel de motor de base de datos en PostgreSQL mediante Row Level Security (RLS).

---

## 3. Procedimiento de Construcción Local y Validación Pre-Vuelo

Antes de promover cambios al repositorio o iniciar un despliegue manual, ejecuta en tu terminal:

```bash
# 1. Instalar dependencias exactas
npm ci

# 2. Verificar tipos TypeScript y reglas de ESLint
npm run lint
npx tsc --noEmit

# 3. Ejecutar suite completa de pruebas (Unitarias + BDD)
npm run test:all

# 4. Generar compilación de exportación estática con Turbopack
npm run build
```

El build generará el directorio `out/` con 18 rutas estáticas optimizadas. Puedes previsualizar la compilación localmente con cualquier servidor estático:

```bash
npx serve out
```

---

## 4. Métodos de Despliegue

### Método A: Despliegue Continuo Automatizado (GitHub Actions — Recomendado)

El repositorio cuenta con integración continua en `.github/workflows/deploy.yml` y `.github/workflows/cadensa-ci.yml`.

1. Realiza `git push` a la rama `main`.
2. El workflow ejecutará automáticamente:
   - Instalación y validación de tipos.
   - Ejecución de 297 pruebas unitarias (Vitest) y 104 escenarios clínicos BDD (Cucumber).
   - Aplicación de migraciones idempotentes en Supabase si `SUPABASE_ACCESS_TOKEN` está configurado.
   - Compilación estática Next.js (`npm run build`).
   - Despliegue inmutable a Cloudflare Pages mediante `cloudflare/wrangler-action@v3`.

**Secretos requeridos en GitHub (`Settings` → `Secrets and variables` → `Actions`):**
- `CLOUDFLARE_API_TOKEN`: Token con permisos `Cloudflare Pages:Edit`.
- `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta de Cloudflare.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key de Supabase.

---

### Método B: Conexión Git Nativa en Cloudflare Dashboard

Si prefieres que Cloudflare compile directamente desde el repositorio:
1. Accede a **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Selecciona el repositorio `cadensa-web` y la rama `main`.
3. Configura los parámetros de compilación:
   - **Framework preset:** `Next.js (Static HTML Export)`
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Environment variables:** Añade `NODE_VERSION = 20` y las variables de Supabase.
4. Haz clic en **Save and Deploy**.

---

### Método C: Despliegue Manual con Wrangler CLI

Para despliegues inmediatos de emergencia desde la terminal local:

```bash
# 1. Compilar la aplicación estática
npm run build

# 2. Desplegar el directorio out directamente al edge
npx wrangler pages deploy out --project-name=cadensa-web
```

---

## 5. Estrategia de Activos Multimedia y Escalado CDN (Cloudflare R2 / AWS S3)

### Estado Actual (Archivos Locales en Edge)
Actualmente, los 7 videos de técnicas fonoaudiológicas (`public/media/techniques/`) y los audios (`public/media/audio/`) residen dentro del bundle estático:
- **Peso Total de Videos:** ~7.8 MB (codificados en H.264 CRF 23 Full HD 1080p).
- **Peso Total de Portadas WebP:** ~410 KB (7 imágenes a ~50 KB c/u con calidad 85).
- **Límites de Cloudflare Pages:** Admite archivos de hasta 25 MB y hasta 20,000 archivos por despliegue. El catálogo actual consume menos del 0.1% de la cuota disponible y se sirve con latencia de borde ultrabaja (<20 ms en CDN global Anycast).

### Estrategia de Crecimiento a CDN Externo (Cloudflare R2)
Si en fases futuras se incorporan grabaciones en 4K, múltiples locuciones dialectales o centenares de ejercicios guiados que superen los 25 MB por archivo:

1. **Crear Bucket R2:**
   ```bash
   npx wrangler r2 bucket create cadensa-media
   ```
2. **Sincronizar Activos Locales hacia R2:**
   ```bash
   # Subir videos de técnicas
   npx wrangler r2 object put cadensa-media/techniques/syllable-timed-speech_avatar_final.mp4 \
     --file=public/media/techniques/syllable-timed-speech_avatar_final.mp4
   ```
3. **Conectar Dominio Personalizado al Bucket R2:**
   Configurar `media.cadensa.io` o un subdominio gestionado en Cloudflare apuntando al bucket R2 (sin tarifas de salida / Zero Egress Fees).
4. **Vincular en Frontend:**
   En `src/lib/clinicalTechniques.ts`, parametrizar la URL base:
   ```typescript
   const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_CDN_URL || '/media/techniques';
   ```

---

## 6. Monitoreo Post-Despliegue y Verificación de Salud

Inmediatamente después de cada despliegue:
1. **Auditoría HTTP:**
   ```bash
   curl -I https://cadensa-web.pages.dev/
   ```
   Verificar cabeceras de seguridad: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`.
2. **Verificación de Reproducción de Video (Streaming HTTP 206):**
   ```bash
   curl -I -H "Range: bytes=0-1024" https://cadensa-web.pages.dev/media/techniques/easy-onset_avatar_final.mp4
   ```
   Debe responder `HTTP/2 206 Partial Content` y `accept-ranges: bytes`.
3. **Panel de Salud Interno:**
   Acceder a `https://cadensa-web.pages.dev/stats` y `https://cadensa-web.pages.dev/admin` para confirmar telemetría activa.

---

## 7. Notificación SEO Post-Despliegue (Google Search Console, Google Indexing & Bing)

Para acelerar la indexación en motores de búsqueda de las nuevas rutas canónicas de técnicas fonoaudiológicas (`/techniques/[slug]`), el sitemap (`sitemap.xml`) y el archivo `robots.txt`, el pipeline de CI/CD ejecuta automáticamente el script:

```bash
python3 scripts/submit_seo_changes.py
```

### 7.1 Motores y Protocolos Notificados
1. **Google Search Console API:**
   - **Acción:** Re-envío automatizado del feed del sitemap XML mediante `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{sitemapUrl}`.
   - **Alcance OAuth 2.0:** `https://www.googleapis.com/auth/webmasters`.
2. **Google Indexing API:**
   - **Acción:** Notificación de cada una de las 7 URLs de técnicas fonoaudiológicas con el evento `URL_UPDATED` vía `POST https://indexing.googleapis.com/v3/urlNotifications:publish`.
   - **Alcance OAuth 2.0:** `https://www.googleapis.com/auth/indexing`.
3. **Bing Webmaster Tools API:**
   - **Acción:** Registro del sitemap (`SubmitFeed`) y envío en lote de URLs actualizadas (`SubmitUrlbatch`) mediante la API oficial de Bing.
4. **Protocolo IndexNow (Bing / Yandex / Seznam / Naver):**
   - **Acción:** Despacho instantáneo vía `POST https://api.indexnow.org/indexnow` utilizando la clave verificada en `public/856757614ffc2c5582fbcb81b1b4e4ca.txt`.

### 7.2 Guía de Generación de Credenciales

#### A. Cuenta de Servicio de Google Cloud (GCP)
1. **Crear o Seleccionar Proyecto:** Accede a [Google Cloud Console](https://console.cloud.google.com/) y selecciona tu proyecto (ej. `cadensa-web-dev`).
2. **Habilitar APIs Requeridas:**
   - [Google Search Console API](https://console.developers.google.com/apis/api/webmasters.googleapis.com/overview)
   - [Web Search Indexing API](https://console.developers.google.com/apis/api/indexing.googleapis.com/overview)
3. **Crear Cuenta de Servicio (Service Account):**
   - Ve a **IAM y Administración** → **Cuentas de servicio** → **Crear cuenta de servicio** (ej. `cadensa-seo-notifier`).
   - Asigna el rol básico de lectura/invocador.
   - En la pestaña **Claves**, crea una nueva clave en formato **JSON** y descárgala.
4. **Autorizar en Google Search Console:**
   - Accede a [Google Search Console](https://search.google.com/search-console).
   - Selecciona la propiedad `https://cadensa-web.pages.dev/`.
   - Ve a **Ajustes** → **Usuarios y permisos** → **Añadir usuario**.
   - Ingresa el correo de la cuenta de servicio (ej. `cadensa-tts-service@cadensa-web-dev.iam.gserviceaccount.com`) con permiso de **Propietario** (Owner).
5. **Configurar Secreto en GitHub Actions:**
   - Copia el contenido íntegro del archivo JSON descargado.
   - En GitHub (`Settings` → `Secrets and variables` → `Actions`), añade el secreto:
     `GOOGLE_APPLICATION_CREDENTIALS_JSON = {"type": "service_account", ...}`

#### B. API Key de Bing Webmaster Tools
1. **Acceder a Bing Webmaster:** Inicia sesión en [Bing Webmaster Tools](https://www.bing.com/webmasters) con tu cuenta y selecciona la propiedad `https://cadensa-web.pages.dev/`.
2. **Generar API Key:**
   - Ve al icono de engrane (**Configuración**) en la esquina superior derecha.
   - Selecciona **Acceso a la API** → **Clave de API**.
   - Haz clic en **Generar Clave de API** y copia el valor hexadecimal de 32 caracteres.
3. **Configurar Secreto en GitHub Actions:**
   - En GitHub (`Settings` → `Secrets and variables` → `Actions`), añade el secreto:
     `BING_WEBMASTER_API_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 7.3 Ejecución Manual y Modo Dry-Run

Para probar o simular el proceso de notificación localmente sin realizar llamadas HTTP externas:

```bash
# Simulación sin mutaciones externas (Dry-Run)
python3 scripts/submit_seo_changes.py --dry-run

# Ejecución real en caliente
python3 scripts/submit_seo_changes.py
```

### 7.4 Auditoría Periódica del Estado de Indexación (`scripts/check_indexing_status.py`)

Para cerrar el ciclo y verificar si Google y Bing han procesado e indexado las nuevas rutas de técnicas (`/techniques/[slug]`), se dispone del script de auditoría:

```bash
# Simulación / Verificación rápida de conexión (Dry-Run)
python3 scripts/check_indexing_status.py --dry-run

# Auditoría en vivo contra Google URL Inspection y Bing GetUrlInfo
python3 scripts/check_indexing_status.py

# Salida estructurada en JSON (para pipelines de observabilidad o telemetría)
python3 scripts/check_indexing_status.py --json
```

**Métricas Reportadas:**
* **Google Search Console (URL Inspection API):**
  * `verdict`: Veredicto global de indexabilidad (`PASS`, `NEUTRAL`, `FAIL`).
  * `coverageState`: Estado de cobertura en el índice de Google (ej. *"Enviada e indexada"*, *"Rastreada - actualmente no indexada"*, *"Descubierta: actualmente no indexada"*).
  * `lastCrawlTime`: Marca de tiempo ISO del último rastreo por Googlebot Smartphone.
  * `robotsTxtState` e `indexingState`: Validación de bloqueos o directivas noindex.
* **Bing Webmaster Tools (GetUrlInfo API):**
  * `isIndexed`: Confirmación booleana de presencia en el índice de Bing (`✅ Indexada` o `⏳ En cola`).
  * `lastCrawl`: Fecha del último rastreo registrado por Bingbot.

**Frecuencia recomendada:** Ejecutar semanalmente como parte de la rutina de mantenimiento de SEO Técnico o integrarlo en flujos de auditoría periódica (`weekly-metrics.yml`).

### 7.5 Resolución de Errores 403 en Search Console

Al ejecutar `python3 scripts/check_indexing_status.py --verify-setup` o consultar la URL Inspection API en producción, si se obtiene el error:
```text
ERROR: La cuenta de servicio no tiene permisos. Ve a Search Console → Configuración → Usuarios y permisos y añade cadensa-tts-service@cadensa-web-dev.iam.gserviceaccount.com como Propietario.
```
significa que la Service Account de Google Cloud aún no ha sido delegada formalmente en la consola web de Google Search Console para la propiedad de Cadensa.

Para resolver este error de permisos y habilitar la inspección y notificación automatizada, deben seguirse los dos pasos críticos:

#### Paso 1: Delegar Permisos en Google Search Console
1. Abre [Google Search Console](https://search.google.com/search-console).
2. Selecciona la propiedad de Cadensa (`https://cadensa-web.pages.dev/` o `sc-domain:cadensa-web.pages.dev`).
3. En el menú lateral izquierdo, haz clic en **Configuración** (`Settings`) → **Usuarios y permisos** (`Users and permissions`).
4. Haz clic en el botón superior **Añadir usuario** (`Add user`).
5. En el campo de correo electrónico, introduce el `client_email` de la cuenta de servicio de GCP:
   `cadensa-tts-service@cadensa-web-dev.iam.gserviceaccount.com`
6. En el selector de permisos, selecciona **Propietario** (`Owner`) o **Completo** (`Full`).
   > ⚠️ **Advertencia Crítica:** El rol "Restringido" (`Restricted`) **no sirve** para la URL Inspection API ni para la Google Indexing API; Google exige permisos de propietario delegado o administración completa para inspeccionar URLs a través de la API.
7. Guarda los cambios. La propagación de permisos en los servidores de Google toma habitualmente entre 1 y 5 minutos.

#### Paso 2: Coincidencia Exacta del Tipo de Propiedad (`siteUrl`)
Verifica que el parámetro `siteUrl` que se envía en el script coincida con el tipo de propiedad registrada en Google Search Console:
* **Propiedad con Prefijo de URL (Recomendada para Cloudflare Pages):**
  * Debe incluir el esquema HTTPS y la barra final: `https://cadensa-web.pages.dev/`.
  * Si la propiedad fue dada de alta con prefijo `https://`, el parámetro `siteUrl` debe ser idéntico con la barra al final.
* **Propiedad de Nivel Dominio (DNS TXT):**
  * Si la propiedad fue registrada a nivel de dominio mediante registro DNS, el `siteUrl` debe llevar el prefijo `sc-domain:` (por ejemplo, `sc-domain:cadensa-web.pages.dev`).
  * En ese caso, invoca el script pasando el flag correspondiente:
    ```bash
    python3 scripts/check_indexing_status.py --site-url sc-domain:cadensa-web.pages.dev --verify-setup
    ```

#### Paso 3: Habilitar la Web Search Indexing API en Google Cloud
Si además se utiliza la Google Indexing API para notificaciones en lote (`URL_UPDATED`), la API debe estar habilitada en el proyecto de GCP correspondiente:
1. Abre [Google Cloud Console - Web Search Indexing API](https://console.developers.google.com/apis/api/indexing.googleapis.com/overview?project=cadensa-web-dev).
2. Haz clic en **Habilitar** (`Enable`).

#### Comprobación Rápida con `--verify-setup`
Para verificar en segundos si los permisos ya están operativos sin esperar a auditar todas las páginas:
```bash
python3 scripts/check_indexing_status.py --verify-setup
```
* **Si falta delegación (HTTP 403):** Imprimirá el correo exacto de la Service Account y la ruta de configuración en GSC.
* **Si está autorizado (HTTP 200):** Imprimirá `✅ Permisos configurados correctamente. El script de auditoría puede proceder.`

### 7.6 Auditoría de Rendimiento SEO (`scripts/audit_seo_performance.py`)

Para medir el rendimiento de búsqueda orgánico (clics, impresiones, CTR y posición media) de las rutas canónicas `/techniques/*` en Google Search Console Search Analytics API:

```bash
# Simulación / Previsualización de métricas (Dry-Run)
python3 scripts/audit_seo_performance.py --dry-run

# Consulta en vivo de los últimos 28 días
python3 scripts/audit_seo_performance.py

# Exportación a archivo CSV compatible con Excel (BOM UTF-8)
python3 scripts/audit_seo_performance.py --dry-run --export-csv reports/seo_performance_report.csv

# Consulta en vivo con exportación automática
python3 scripts/audit_seo_performance.py --export-csv

# Salida estructurada en JSON
python3 scripts/audit_seo_performance.py --json
```

**Métricas Reportadas:**
* **Clics (Clicks):** Número de visitas orgánicas recibidas desde resultados de búsqueda.
* **Impresiones (Impressions):** Veces que la URL apareció en la pantalla de un usuario en Google.
* **CTR (Click-Through Rate):** Porcentaje de conversión de impresión a clic (`clics / impresiones × 100`).
* **Posición Media (Average Position):** Ranking promedio en los resultados orgánicos de Googlebot.
* **Compatibilidad Excel:** La exportación CSV incluye Byte Order Mark UTF-8 (`\ufeff`) para garantizar que acentos, caracteres especiales y números se muestren correctamente en Windows y macOS.

---

## 8. Pruebas End-to-End (E2E) con Playwright y Configuración de Supabase Auth

### 8.1 Ejecución Local de Playwright E2E

Cadensa utiliza **Playwright** (`@playwright/test`) para validar los flujos clínicos, multimedia y de navegación sobre motores de navegador reales (Chromium, Firefox y WebKit):

```bash
# 1. Compilar el export estático de Next.js
npm run build

# 2. Ejecutar la suite E2E completa en headless mode (Chromium, Firefox y WebKit)
npx playwright test tests/e2e/cadensa.spec.ts

# 3. Ejecutar solo en un motor específico (ej. Chromium)
npx playwright test tests/e2e/cadensa.spec.ts --project=chromium

# 4. Ver reporte interactivo HTML en caso de fallos
npx playwright show-report
```

**Flujos Verificados en `tests/e2e/cadensa.spec.ts`:**
1. Carga de la plataforma y registro activo del Service Worker (`public/sw.js`).
2. Apertura del modal interactivo de la técnica STS y acoplamiento del reproductor de video.
3. Apertura de `CustomPhraseTrainer`, silabación fonoaudiológica con `src/lib/syllables.ts` y renderizado de cajas visuales.
4. Navegación y renderizado de las páginas públicas de autenticación `/login` y `/register`.

### 8.2 Configuración de Variables de Entorno de Supabase Auth

La autenticación de pacientes y la persistencia de frases personalizadas en la nube operan bajo el modelo **Zero Trust RLS** con `@supabase/supabase-js`.

**Variables Requeridas en `.env` local y GitHub Actions Secrets:**
```bash
# URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kddeejyhnxrnmkmiwjxp.supabase.co

# Clave pública anónima (Segura para frontend con RLS activo)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Token de despliegue para migraciones automatizadas en CI (opcional para desarrollo local)
SUPABASE_ACCESS_TOKEN=sbp_...
```

**Modelo de Datos y Seguridad RLS:**
* Las frases personalizadas se persisten en la tabla `public.custom_phrases` con la política `auth.uid() = user_id`.
* Si el paciente no ha iniciado sesión, las frases se resguardan de forma local en `localStorage['cadensa_custom_phrases']`.
* Al iniciar sesión en `/login` o mediante el modal `AuthModal`, las frases locales se sincronizan y respaldan bidireccionalmente en Supabase sin duplicados.


