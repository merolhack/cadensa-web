# Fuente Cruda: Especificaciones Técnicas del PoC

> **Tipo de Fuente:** Especificación de Ingeniería & Arquitectura Inicial  
> **Estado:** Inmutable (Referencia primaria)  
> **Fecha de Ingesta:** 2026-10-23

---

## 1. Objetivos del PoC (Prueba de Concepto)
- Validar la infraestructura base para una aplicación web rápida, de coste de mantenimiento casi nulo, segura y desplegable automáticamente.
- Probar la integración de:
  1. Frontend estático de alto rendimiento en Next.js.
  2. Backend serverless con base de datos PostgreSQL y autenticación segura con Supabase.
  3. Despliegue continuo en el edge mediante Cloudflare Pages.

---

## 2. Decisiones de Stack Tecnológico

| Capa | Elección | Justificación |
|---|---|---|
| Framework Web | Next.js 16 (App Router) | Ecosistema maduro, soporte React 19, excelente DX. |
| Modo de Exportación | `output: 'export'` | Genera HTML/JS/CSS estáticos en `out/`, sin necesidad de servidor Node.js permanente. |
| Estilizado | Tailwind CSS v4 | Configuración ligera vía `@tailwindcss/postcss`, modo oscuro por defecto. |
| Base de Datos & Auth | Supabase | PostgreSQL relacional administrado, sistema de Auth incorporado y Row Level Security (RLS). |
| Tipado | TypeScript 5 + supabase gen types | Type safety extremo desde la base de datos hasta los componentes de React. |
| Hosting & Edge | Cloudflare Pages | Despliegue global estático de baja latencia y alta concurrencia con costo cero en tier base. |
| CI/CD | GitHub Actions | Automatización de linting, type-checking, compilación estática y despliegue a Cloudflare. |

---

## 3. Restricciones de Seguridad & Operación
- **Zero Trust en Frontend:** Toda llamada a Supabase se realiza mediante `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La clave `service_role` jamás se almacena ni expone en el cliente.
- **RLS Obligatorio:** Ninguna tabla puede crearse sin `ENABLE ROW LEVEL SECURITY`.
- **Client Components Exclusivos:** Al usar `output: 'export'`, cualquier componente que interactúe con estado, navegador o Supabase debe incluir la directiva `'use client'`.
