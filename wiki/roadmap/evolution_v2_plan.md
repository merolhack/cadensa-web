# Plan Maestro de Evolución v2 — Suite Clínica y Comunitaria de Cadensa

> **Documento Canónico de Roadmap y Especificación de Nuevas Funcionalidades**  
> Última actualización: 2026-10-23  
> Contexto: Evolución funcional de Cadensa con 10 mejoras de impacto clínico, terapéutico y comunitario.

---

## 1. Resumen de Nuevas Funcionalidades y Mejoras (10 Puntos)

| # | Módulo / Funcionalidad | Descripción Clínica y Técnica |
|---|---|---|
| **1** | **Banner Oficial AMTTM** | Banner destacado hacia la Asociación Mexicana de Tartamudez (`https://www.facebook.com/AMTTM/`) para vinculación comunitaria y soporte psicológico. |
| **2** | **Gestión de Sesión y Logout** | Integración de `onAuthStateChange`, botón de "Cerrar Sesión" en barra superior y detección reactiva de usuario logueado en Supabase. |
| **3** | **Selector de Compás Rítmico** | Soporte para compases de 4/4, 3/4 y 2/4 en el motor de audio y visualizador de compases. |
| **4** | **Sintetizador de Timbres Sonoros** | Opciones de sonido: Clásico (880/440 Hz), Madera/Clave (baja fatiga auditiva) y Digital Suave (senoide pura). |
| **5** | **Entrenador de Respiración Diafragmática** | Guía visual interactiva de respiración 4-4-4-4 (Box Breathing) para reducir la tensión laríngea y torácica antes de hablar. |
| **6** | **Anillo de Meta Diaria de Práctica** | Progreso diario respecto al estándar terapéutico de 5 minutos al día. |
| **7** | **Modo Silencio Rítmico (Rhythm Fading)** | Desafío clínico: compases audibles seguidos de compases en silencio para internalizar el tempo cerebral. |
| **8** | **Generador de Frases Personalizadas** | Entrada de texto dinámico para que el paciente entrene sus propias palabras de bloqueo con silabificación inmediata. |
| **9** | **Visualizador de Onda / Espectro Vocal** | Retroalimentación visual reactiva del nivel fonatorio durante la articulación silábica. |
| **10** | **Escalado de Accesibilidad Silábica** | Control de tamaño tipográfico de las tarjetas silábicas (Normal, Grande, Extragrande) para mayor legibilidad. |

---

## 2. Análisis del Estado Actual de Login y Registro en Supabase

### Diagnóstico de Pruebas
1. **Registro (Sign-Up)**:
   - Verificado con éxito contra el proyecto `https://kddeejyhnxrnmkmiwjxp.supabase.co`.
   - Utilizando dominios válidos estándar (ej. `@gmail.com`), el backend de Supabase crea el usuario inmediatamente en `auth.users` asignando su `User ID` (`ca5ca2b3-31a7-46fc-8297-c856b8ef6f57`).
2. **Validación de Correo**:
   - Por defecto, el proyecto tiene activo `Confirm email`. Cuando un usuario se registra con email y contraseña, Supabase despacha el correo de confirmación.
   - Si el usuario no confirma su correo, el login posterior con contraseña devuelve `Email not confirmed` / `Invalid credentials`.
3. **Estrategia Implementada**:
   - **Soft Confirmation**: En la UI de Cadensa, al registrarse, el usuario recibe acceso inmediato para no interrumpir su práctica.
   - **Google OAuth**: Flujo directo de un solo clic que auto-confirma la identidad.
   - **Modo Invitado**: Acceso 100% libre sin credenciales respaldado en `localStorage`.
   - **Mejora v2**: Se implementa el botón de "Cerrar Sesión" en la barra de navegación para permitir alternar cuentas o salir de modo invitado.
