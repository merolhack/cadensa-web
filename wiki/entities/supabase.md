---
title: "Entidad: Supabase (BaaS & PostgreSQL)"
category: "entities"
tags: [entities, supabase, postgresql, auth, types]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/backend_database.md"
  - "wiki/concepts/zero_trust_rls.md"
  - "wiki/entities/profiles_table.md"
---

# Entidad: Supabase

**Supabase** es la plataforma Backend-as-a-Service (BaaS) de código abierto que provee la infraestructura de datos, autenticación y almacenamiento para Cadensa.

---

## 1. Responsabilidades en el Sistema

- **Motor Relacional:** PostgreSQL 15+ para persistencia transaccional.
- **Autenticación (GoTrue):** Emisión y renovación de tokens JWT, registro por email/password, magic links o proveedores sociales (OAuth).
- **PostgREST API:** Exposición automática y segura de endpoints REST sobre las tablas de PostgreSQL, filtrados por RLS.
- **Tipado TypeScript:** Generación del contrato de tipos para consumo en frontend.

---

## 2. Configuración y Cliente Singleton (`src/lib/supabaseClient.ts`)

La aplicación inicializa una única instancia tipada del cliente para todo el ciclo de vida del frontend:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Variables de Entorno Requeridas:
- `NEXT_PUBLIC_SUPABASE_URL`: Endpoint de la API del proyecto (ej. `https://xyzcompany.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública para peticiones anónimas y autenticadas desde el navegador.

---

## 3. Flujo de Trabajo Local con Supabase CLI

Para desarrollo local y generación de migraciones:

```bash
# Iniciar servicios de Supabase en Docker local
npx supabase start

# Crear una nueva migración SQL
npx supabase migration new nombre_de_la_migracion

# Aplicar migraciones pendientes
npx supabase db reset

# Regenerar tipos de TypeScript
npm run supabase:gen-types
```

El script `npm run supabase:gen-types` vuelca las interfaces directamente a `src/types/supabase.ts`, asegurando que cualquier cambio en las columnas de la base de datos cause errores de compilación inmediatos en TypeScript si no coincide con los componentes de la UI.
