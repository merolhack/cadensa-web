---
title: "Entidad: Tabla public.profiles"
category: "entities"
tags: [entities, database, postgresql, schema, profiles, triggers]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/backend_database.md"
  - "wiki/concepts/zero_trust_rls.md"
  - "wiki/entities/supabase.md"
---

# Entidad: Tabla `public.profiles`

La tabla `public.profiles` es el modelo central de identidad de usuario dentro del esquema de aplicación de Cadensa, extendiendo los datos autenticados de `auth.users`.

---

## 1. Definición del Esquema (DDL)

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

### Detalle de Columnas:

| Columna | Tipo de Dato | Modificadores | Descripción |
|---|---|---|---|
| `id` | `uuid` | `primary key, references auth.users on delete cascade` | Clave primaria que coincide exactamente con el UUID del usuario autenticado. Si el usuario se elimina de auth, su perfil se borra en cascada. |
| `updated_at` | `timestamp with time zone` | Nullable | Marca temporal de la última actualización del perfil. |
| `username` | `text` | `unique` | Nombre de usuario identificativo. Restringido por check constraint a un mínimo de 3 caracteres. |
| `full_name` | `text` | Nullable | Nombre completo o alias para mostrar en la interfaz. |
| `avatar_url` | `text` | Nullable | URL a la imagen de perfil (almacenada en Supabase Storage o avatar OAuth). |
| `website` | `text` | Nullable | Enlace o sitio web personal del usuario. |

---

## 2. Triggers y Ciclo de Vida

La inserción en esta tabla está completamente automatizada mediante un trigger a nivel de base de datos (`on_auth_user_created`):

```
[ Registro de Usuario en Supabase Auth ]
                  │
                  ▼
          (INSERT en auth.users)
                  │
                  ▼
   [ Trigger on_auth_user_created ]
                  │
                  ▼
     [ Función handle_new_user() ]
                  │
                  ▼
  (INSERT atómico en public.profiles)
```

Esto asegura que nunca existan usuarios registrados en el sistema de autenticación sin su correspondiente fila en `public.profiles`.

---

## 3. Políticas de Acceso (RLS)

- **`SELECT`:** Pública para todos (`using (true)`). Permite mostrar nombres de usuario o avatares sin exponer credenciales sensibles.
- **`INSERT`:** Restringida a que el ID sea igual a `auth.uid()`.
- **`UPDATE`:** Restringida a que el ID sea igual a `auth.uid()`.
