---
title: "Arquitectura de Backend y Base de Datos: Supabase PostgreSQL"
category: "architecture"
tags: [backend, database, supabase, postgresql, rls]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/overview.md"
  - "wiki/concepts/zero_trust_rls.md"
  - "wiki/entities/profiles_table.md"
  - "wiki/entities/supabase.md"
---

# Arquitectura de Backend y Base de Datos

Cadensa utiliza **Supabase** como plataforma backend unificada sobre **PostgreSQL 15+**. Proporciona la capa de datos, el motor de autenticación (GoTrue) y la API PostgREST automática.

---

## 1. Modelo de Datos y Migraciones

La definición del esquema de la base de datos se gestiona como código en la carpeta `supabase/migrations/`:

- Migración inicial: `supabase/migrations/20260531140826_init_schema.sql`

### Estructura de Tablas:
1. **`auth.users` (Esquema interno de Supabase):** Gestiona credenciales, correos electrónicos, contraseñas hash, proveedores OAuth y metadatos de usuario (`raw_user_meta_data`).
2. **`public.profiles`:** Tabla pública que extiende el perfil del usuario mediante una relación 1:1 con `auth.users`.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);
```

---

## 2. Automatización Reactiva: Trigger de Alta de Usuario

Para desacoplar la creación del usuario en el sistema de autenticación de la lógica de perfiles de la aplicación, se implementó una función y un trigger en PL/pgSQL:

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

> **Nota de Seguridad (`security definer`):** La función se ejecuta con los privilegios del creador (superusuario/postgres), permitiéndole insertar en `public.profiles` de forma atómica inmediatamente después de que Supabase Auth confirme el registro.

---

## 3. Seguridad de Acceso: Row Level Security (RLS)

Toda tabla creada en `public` debe tener RLS habilitado:

```sql
alter table public.profiles enable row level security;
```

Las políticas vigentes garantizan que:
- **Lectura pública:** Cualquier usuario (autenticado o anónimo) puede consultar perfiles públicos (`for select using (true)`).
- **Escritura restringida:** Solo el dueño del perfil (`auth.uid() = id`) puede insertar o actualizar sus propios datos (`for insert/update using (auth.uid() = id)`).

---

## 4. Tipado de Extremo a Extremo (TypeScript)

Mediante el script configurado en `package.json`:
```bash
npm run supabase:gen-types
```
Se ejecuta la herramienta de Supabase CLI para inspeccionar el esquema local o remoto y generar la definición `src/types/supabase.ts`. Esto garantiza autocompletado y validación de tipos estricta en el cliente:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```
