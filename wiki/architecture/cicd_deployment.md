---
title: "Pipeline CI/CD y Despliegue en Cloudflare Pages"
category: "architecture"
tags: [cicd, github-actions, cloudflare-pages, deployment]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/overview.md"
  - "wiki/architecture/frontend.md"
  - "wiki/entities/cloudflare_pages.md"
---

# Pipeline CI/CD y Despliegue

La integración y entrega continua (CI/CD) de Cadensa está automatizada mediante **GitHub Actions** y despliega de manera atómica a **Cloudflare Pages**.

---

## 1. Flujo de Trabajo (`.github/workflows/deploy.yml`)

El pipeline se activa automáticamente en dos escenarios:
1. Con cada `git push` a la rama `main`.
2. Manualmente a través de `workflow_dispatch` desde la interfaz de GitHub.

### Fases del Pipeline:

```
[ Git Push / Dispatch ]
           │
           ▼
[ Checkout del Repositorio (actions/checkout@v4) ]
           │
           ▼
[ Setup de Node.js v20 con caché npm (actions/setup-node@v4) ]
           │
           ▼
[ Instalación Determinista: npm ci ]
           │
           ▼
[ Verificación de Calidad: ESLint + npx tsc --noEmit ]
           │
           ▼
[ Compilación Estática: npm run build ]
  (Variables inyectadas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
           │
           ▼
[ Despliegue a Cloudflare Pages (cloudflare/pages-action@v1) ]
  (Directorio publicado: out/)
```

---

## 2. Variables de Entorno y Secretos

El flujo requiere que los siguientes secretos estén configurados en el repositorio de GitHub:

| Secreto / Variable | Propósito | Requerido en |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la instancia de Supabase | Fase de compilación Next.js (`npm run build`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase | Fase de compilación Next.js (`npm run build`) |
| `CLOUDFLARE_API_TOKEN` | Token de API con permisos de edición en Cloudflare Pages | Acción `cloudflare/pages-action` |
| `CLOUDFLARE_ACCOUNT_ID` | Identificador único de la cuenta de Cloudflare | Acción `cloudflare/pages-action` |
| `GITHUB_TOKEN` | Token automático para reporte de estado del deployment | Acción `cloudflare/pages-action` |

---

## 3. Características Clave del Despliegue

- **Inmutabilidad:** Cada commit genera un despliegue único con su propia URL de previsualización en Cloudflare Pages.
- **Rollbacks Instantáneos:** Si se detecta una anomalía en producción, Cloudflare permite revertir al commit anterior en segundos sin necesidad de recompilar.
- **Sin Dependencias de Runtime:** Al no desplegar contenedores Docker ni procesos Node.js persistentes, no existen fugas de memoria en servidor ni vulnerabilidades de sistema operativo en el host de ejecución.
