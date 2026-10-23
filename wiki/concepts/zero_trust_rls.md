---
title: "Patrón de Seguridad: Zero Trust Row Level Security (RLS)"
category: "concepts"
tags: [security, postgresql, rls, zero-trust, supabase]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/backend_database.md"
  - "wiki/entities/profiles_table.md"
  - "wiki/entities/supabase.md"
---

# Patrón de Seguridad: Zero Trust RLS

En las arquitecturas web tradicionales, la seguridad y la autorización residen en una capa intermedia (servidor backend, API Gateway o middleware de autenticación). Si esa capa tiene un fallo lógico, toda la base de datos queda expuesta.

Cadensa adopta el paradigma **Zero Trust en el Cliente**, delegando el 100% de la autorización al propio motor de base de datos PostgreSQL mediante **Row Level Security (RLS)**.

---

## 1. Principio de Operación

1. El cliente web (SPA estática) no se considera un entorno seguro.
2. La clave expuesta en el frontend (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) es pública por diseño y solo otorga permisos básicos de acceso anónimo a la API PostgREST.
3. Cuando un usuario inicia sesión, Supabase emite un JSON Web Token (JWT) firmado criptográficamente que contiene el identificador único del usuario (`auth.uid()`).
4. Toda consulta SQL enviada a través del cliente JS incluye este JWT en el encabezado `Authorization: Bearer <token>`.
5. PostgreSQL extrae `auth.uid()` internamente y evalúa cada fila contra las políticas RLS definidas en el DDL.

---

## 2. Reglas Estrictas en el Repositorio

- **Prohibición de `service_role` en frontend:** La clave `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS por completo. Jamás debe introducirse en `src/`, ni en variables públicas con prefijo `NEXT_PUBLIC_`.
- **Habilitación Mandataria de RLS:** Cualquier tabla nueva creada en `supabase/migrations/` debe ejecutar de forma obligatoria:
  ```sql
  alter table public.<nueva_tabla> enable row level security;
  ```
- **Principio de Mínimo Privilegio:** Cada operación (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) debe contar con una política explícita. Por defecto, si RLS está activo y no hay política que coincida, PostgreSQL deniega el acceso.

---

## 3. Ejemplo Práctico en `public.profiles`

```sql
-- Todos pueden ver perfiles (para tablas de clasificación o comunidad)
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

-- Solo el dueño puede modificar sus datos personales
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);
```

Incluso si un usuario malicioso manipula las peticiones HTTP desde la consola de desarrollo del navegador para modificar el ID de otro usuario, PostgreSQL rechaza la operación inmediatamente a nivel de base de datos (`403 Forbidden` / 0 filas actualizadas).
