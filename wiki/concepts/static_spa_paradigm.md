---
title: "Paradigma de Exportación Estática (SPA Jamstack)"
category: "concepts"
tags: [architecture, jamstack, spa, performance, cloudflare]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/frontend.md"
  - "wiki/architecture/cicd_deployment.md"
  - "wiki/entities/cloudflare_pages.md"
---

# Paradigma de Exportación Estática (SPA Jamstack)

Cadensa implementa una arquitectura basada en **Static Single-Page Application (SPA)** mediante Next.js (`output: 'export'`). Este documento sintetiza las razones técnicas, las ventajas operativas y las restricciones que este paradigma impone al equipo de desarrollo.

---

## 1. Justificación Técnica: ¿Por Qué No SSR?

A menudo se asume que usar Next.js implica ejecutar un servidor Node.js en producción para renderizado del lado del servidor (SSR) o Server Components dinámicos. Para Cadensa, este enfoque se descartó deliberadamente:

1. **Cero Superficie de Ataque en Servidor:** Al no haber un runtime de Node.js en producción procesando peticiones HTTP arbitrarias, no existe riesgo de fallos de memoria, vulnerabilidades de SSRF ni exploits a nivel de proceso de servidor.
2. **Escalabilidad Infinita a Coste Cero:** Los archivos estáticos son almacenados en caché por la CDN de Cloudflare Pages y servidos directamente desde la memoria RAM del edge. Atender 10 usuarios o 1,000,000 de usuarios cuesta exactamente lo mismo y no requiere configurar clústeres de Kubernetes ni autoscaling groups.
3. **Despliegues Deterministas:** La carpeta `out/` generada en CI contiene exactamente los activos que se van a servir. No hay discrepancias por versiones de runtime de Node en producción.

---

## 2. Compensaciones y Restricciones a Respetar

Al operar en modo estático, los desarrolladores y agentes de IA deben recordar:

| Característica de Next.js | Disponible en Static Export | Alternativa en Cadensa |
|---|---|---|
| `getServerSideProps` / `headers()` | ❌ No | Peticiones en cliente con React Hooks y `@supabase/supabase-js`. |
| Server Actions (`'use server'`) | ❌ No | Llamadas directas a funciones RPC de Postgres o mutaciones directas vía Supabase. |
| Optimización dinámica `next/image` | ❌ No | Configurado `unoptimized: true` en `next.config.ts`, o uso de transformaciones de CDN. |
| API Routes (`src/app/api/`) | ❌ No | Funciones de base de datos Supabase / Edge Functions en caso necesario. |
| `'use client'` | ✓ Mandatario | Obligatorio en cualquier componente con estado, hooks de audio o interacción. |

---

## 3. Experiencia de Usuario (PWA & Offline First)

El enfoque de SPA estática sienta las bases perfectas para convertir Cadensa en una **Progressive Web App (PWA)** en fases posteriores:
- El código de la aplicación puede cachearse mediante un Service Worker en el dispositivo del usuario.
- Los ejercicios de metrónomo y repetición silábica podrán ejecutarse completamente sin conexión a internet una vez descargados, sincronizando los resultados con Supabase cuando vuelva la conectividad.
