---
title: "Contenedores y Docker: Arquitectura Multi-stage"
category: "architecture"
tags: [docker, containers, nginx, alpine, devops]
last_updated: "2026-10-23"
sources:
  - "Dockerfile"
  - "nginx.conf"
  - "docker-compose.yml"
related:
  - "wiki/architecture/frontend.md"
  - "wiki/concepts/static_spa_paradigm.md"
  - "wiki/architecture/cicd_deployment.md"
---

# Contenedores y Docker: Arquitectura Multi-stage

Cadensa cuenta con un entorno contenerizado reproducible mediante Docker y Docker Compose, optimizado para la entrega de la exportación estática de Next.js (`output: 'export'`).

---

## 1. Diseño Multi-Stage del Dockerfile

Para conciliar las dependencias nativas de compilación (Turbopack) con una imagen final ultraligera de producción, el `Dockerfile` se estructura en 3 etapas:

```
[ Etapa 1: deps (node:20-slim) ]
  → Instala dependencias con npm ci --legacy-peer-deps
           │
           ▼
[ Etapa 2: builder (node:20-slim) ]
  → Recibe ARGs públicos de Supabase
  → Compila Next.js con Turbopack (glibc)
  → Genera carpeta /app/out
           │
           ▼
[ Etapa 3: runner (nginx:alpine) ]
  → Imagen final de ~25 MB
  → Copia configuración optimizada de Nginx (nginx.conf)
  → Expone el puerto 80 con compresión gzip y headers de seguridad
```

> **Por qué `node:20-slim` en compilación:** Next.js 16 requiere bibliotecas nativas glibc para su motor Turbopack (`@next/swc-linux-x64-gnu`). El uso de imágenes basadas en Debian (`slim`) previene fallos de enlace dinámico presentes en Alpine sin engordar la imagen final, ya que el runtime final descarta Node.js por completo y utiliza `nginx:alpine`.

---

## 2. Configuración de Nginx (`nginx.conf`)

El servidor Nginx está ajustado para una Single-Page Application (SPA) estática:
- **Fallback SPA:** `try_files $uri $uri.html $uri/ /index.html =404;` para soporte de enrutamiento del lado del cliente.
- **Inmutabilidad de Estáticos:** `location /_next/static/` con cabeceras `Cache-Control: public, max-age=31536000, immutable`.
- **Cabeceras de Seguridad:** `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`.
- **Compresión:** Gzip activo para HTML, CSS, JavaScript y SVG.

---

## 3. Comandos de Uso

```bash
# Construir la imagen localmente
docker build -t cadensa-web:latest .

# Ejecutar el contenedor mapeando al puerto 3000
docker run -p 3000:80 cadensa-web:latest

# O mediante Docker Compose
docker compose up -d
```
