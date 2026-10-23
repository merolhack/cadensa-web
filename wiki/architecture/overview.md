---
title: "Visión General de la Arquitectura"
category: "architecture"
tags: [architecture, jamstack, overview, monorepo]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/frontend.md"
  - "wiki/architecture/backend_database.md"
  - "wiki/architecture/cicd_deployment.md"
  - "wiki/concepts/zero_trust_rls.md"
  - "wiki/concepts/static_spa_paradigm.md"
---

# Visión General de la Arquitectura de Cadensa

Cadensa está diseñada bajo una arquitectura **Jamstack / Modern SPA** desacoplada, donde el frontend es un conjunto de archivos estáticos distribuidos globalmente en la red perimetral (Edge CDN) y el backend es una plataforma BaaS (Backend-as-a-Service) que provee PostgreSQL con seguridad a nivel de filas (RLS).

```
┌──────────────────────────────────────────────────────────────────┐
│ USUARIO FINAL (Navegador Web / Mobile)                           │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ 1. Descarga HTML/JS/CSS estáticos
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE PAGES (Edge CDN)                                      │
│ - Distribución global de baja latencia                           │
│ - Archivos generados por Next.js Static Export (`out/`)          │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ 2. Consultas directas HTTPS / WebSockets
                                  │    con anon key + JWT de usuario
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ SUPABASE (PostgreSQL + Auth + Storage)                           │
│ - Autenticación con tokens JWT                                   │
│ - Políticas de acceso aplicadas en la BD (Row Level Security)    │
│ - Triggers PL/pgSQL para creación reactiva de perfiles           │
└──────────────────────────────────────────────────────────────────┘
```

## Principios Rectores

1. **Cero Servidores que Mantener:**  
   Al no requerir un servidor Node.js permanente para SSR, se eliminan los parches de SO, el autoescalado de servidores y los costes fijos de computación.
2. **Latencia Mínima de Carga:**  
   El bundle inicial se sirve desde los más de 300 puntos de presencia (PoPs) de Cloudflare.
3. **Seguridad Delegada al Motor de Base de Datos:**  
   El cliente web consulta directamente a PostgreSQL a través de la API REST/PostgREST de Supabase; toda autorización y privacidad se evalúa mediante políticas de [Zero Trust RLS](../concepts/zero_trust_rls.md).
4. **Monorepo Cohesivo:**  
   El frontend (`src/`), las migraciones de base de datos (`supabase/`) y los flujos de automatización (`.github/`) residen en el mismo repositorio Git, garantizando que el esquema de la base de datos y los tipos TypeScript (`src/types/supabase.ts`) evolucionen de forma sincronizada.
