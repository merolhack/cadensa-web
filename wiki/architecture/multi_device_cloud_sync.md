---
title: "Sincronización Multi-Dispositivo de Frases (Supabase Zero Trust RLS)"
category: "architecture"
tags: [architecture, supabase, sync, zero-trust, rls, custom-phrases]
last_updated: "2026-10-28"
sources:
  - "supabase/migrations/20261029050000_user_custom_phrases_sync.sql"
  - "src/lib/customPhraseService.ts"
  - "src/components/CustomPhraseTrainer.tsx"
related:
  - "wiki/concepts/zero_trust_rls.md"
  - "wiki/concepts/custom_phrases_training.md"
---

# Sincronización Multi-Dispositivo de Frases (Supabase Zero Trust RLS)

Permite a los usuarios registrados mantener su repertorio de frases temidas y oraciones de práctica sincronizadas entre su computadora y su teléfono móvil, manteniendo una arquitectura **offline-first**.

---

## 1. Esquema de Base de Datos y Zero Trust RLS

Migración `supabase/migrations/20261029050000_user_custom_phrases_sync.sql`:

```sql
create table public.user_custom_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  phrase text not null,
  bpm_recommended int not null default 80,
  category text not null default 'personalizado',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_custom_phrases enable row level security;
```

Las políticas garantizan que ningún usuario pueda leer, escribir o borrar frases de otros usuarios (`auth.uid() = user_id`).

---

## 2. Flujo de Sincronización Bidireccional (`customPhraseService.ts`)

1. **Lectura Local Inmediata**: Carga `cadensa_custom_phrases` desde `localStorage` al iniciar la app.
2. **Detección de Sesión**: Si el usuario está autenticado en Supabase:
   - Consulta `public.user_custom_phrases` para su `user_id`.
   - Identifica frases locales ausentes en la nube y las inserta.
   - Fusiona ambas listas por texto canónico.
   - Persiste el resultado unificado en `localStorage`.
3. **Modo Offline**: Si no hay conexión o el usuario practica como invitado, opera 100% de manera local sin fallos.

