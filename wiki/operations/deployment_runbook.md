---
title: "Runbook de Despliegue en Cloudflare Pages y Gestión de Medios (Producción)"
category: "operations"
tags: [operations, deployment, runbook, cloudflare-pages, nextjs, turbopack, r2, cdn]
last_updated: "2026-11-03"
sources:
  - "next.config.ts"
  - "package.json"
  - ".github/workflows/deploy.yml"
  - "scripts/compose_cadensa_video.py"
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

