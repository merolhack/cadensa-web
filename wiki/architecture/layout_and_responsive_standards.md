---
title: "Estándares de Diseño y Homogeneidad de Ancho en Cadensa"
category: "architecture"
tags: [frontend, layout, design-system, responsive, accessibility, bootstrap-grid, equal-height]
last_updated: "2026-11-19"
sources:
  - "src/app/page.tsx"
  - "src/components/TechniquesCatalogHome.tsx"
  - "src/components/FluencyPath.tsx"
  - "src/components/CommunityBanner.tsx"
  - "src/components/FaqAndMethodology.tsx"
related:
  - "wiki/architecture/frontend.md"
  - "wiki/architecture/overview.md"
---

# Estándares de Diseño, Rejillas y Homogeneidad Geométrica en Cadensa

Este documento especifica la arquitectura de contenedores, la adaptación de las mejores prácticas de sistemas de rejilla tipo Bootstrap (12 columnas, filas y columnas, alineación simétrica y tarjetas de altura uniforme *Equal Height*) y la jerarquía de anchos máximos (`max-w-*`) adoptada para garantizar una experiencia visualmente armónica, consistente y con cero saltos de diseño (*Cumulative Layout Shift - CLS = 0*) en Cadensa.

---

## 1. Principios de Rejilla y Contención (Mejores Prácticas Bootstrap)

Inspirado en los fundamentos de sistemas de diseño robustos como Bootstrap Grid:

1. **Contenedor Maestro Unificado (`max-w-5xl = 1024px`):**
   - Todas las vistas principales (Home con sus 4 modos: Ruta Duolingo, Práctica Rápida, Logros y Modo Clínico; la Consola de Práctica Rítmica Interactiva; las secciones de FAQ y Metodología; y el Footer Global) comparten un mismo marco maestro centrado de 1024px (`w-full max-w-5xl mx-auto px-3 sm:px-6`).
   - **Resultado:** Elimina el salto visual horizontal de 128px al navegar entre el Inicio y la Práctica, asegurando alineación milimétrica en la barra de navegación y el pie de página.

2. **Columnas de Altura Uniforme (*Equal Height Cards*):**
   - En rejillas multi-columna (ej. catálogo de 7 técnicas, 4 técnicas rápidas, 6 logros, 9 módulos de laboratorio), los textos de descripción y títulos varían en cantidad de renglones.
   - **Solución implementada:**
     - El contenedor de la rejilla usa `grid items-stretch gap-5 w-full`.
     - Cada tarjeta usa `h-full flex flex-col justify-between`.
     - El bloque superior de información usa `flex-1 flex flex-col`.
     - Los botones de acción finales se anclan al fondo mediante `mt-auto pt-3 border-t border-zinc-800/80 w-full`.
     - **Beneficio:** Todos los botones de acción (`Guía & Video`, `Ver Video`, `Entrenar →`) quedan perfectamente alineados horizontalmente en el mismo nivel visual, sin importar la extensión del contenido textual.

3. **Relación de Aspecto Fija (*Fixed Aspect Ratio*):**
   - Miniaturas de video: `aspect-video` (16:9) con `object-cover` para evitar saltos de renderizado al cargar pósters.
   - Iconos, orbes y avatares: `aspect-square` (1:1) con bordes circulares o redondeados simétricos.

4. **Gutters y Separadores Consistentes:**
   - Escritorio: `gap-5` o `gap-6` (20px - 24px).
   - Tablets y Móvil: `gap-3` o `gap-4` (12px - 16px).

---

## 2. Jerarquía de Contenedores y Rejillas en Cadensa

```text
+-----------------------------------------------------------------------------------+
|  NIVEL 1: Marco Superior / Navbar (max-w-5xl = 1024px)                             |
|  [Navbar: ← Inicio | Cadensa v2.5.0 ........... Video | Técnica ▾ | Racha | Auth]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  NIVEL 1: Contenido Maestro (max-w-5xl = 1024px)                                  |
|  +-----------------------------------------------------------------------------+  |
|  | Pestaña Ruta (Duolingo): FluencyPath (Camino de 6 Niveles con Nodos)        |  |
|  | Pestaña Práctica: 4 Tarjetas de Técnicas (grid md:grid-cols-2, Equal Height)|  |
|  | Pestaña Logros: Métricas (grid sm:grid-cols-3) + 6 Badges (Equal Height)    |  |
|  | Pestaña Clínico: 9 Módulos Lab (grid 3 cols) + 7 Técnicas (grid 3 cols)     |  |
|  | Consola de Práctica: Tarjeta Principal (max-w-5xl) + Pacer/Lector (max-w-2xl)| |
|  | Base Neurobiológica: Disclosure con 3 Tarjetas (md:grid-cols-3)             |  |
|  | Acordeón FAQ y Metodología: FaqAndMethodology (max-w-5xl)                    |  |
|  | Banner Comunitario Oficial AMTTM: CommunityBanner (max-w-5xl)               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  NIVEL 1: Pie de Página Homogéneo (max-w-5xl = 1024px)                            |
|  [Footer: Cadensa Web — Terapia Rítmica Silábica • Next.js 16 • Cloudflare Pages] |
+-----------------------------------------------------------------------------------+
```

---

## 3. Matriz Canónica de Ancho y Rejilla por Componente

| Componente | Clase Tailwind de Contenedor | Rejilla Interna | Estándar de Altura |
| :--- | :--- | :--- | :--- |
| **Navbar Global** | `w-full max-w-5xl mx-auto` | Flexbox simétrico | Altura fija ~52px |
| **Ruta de Fluidez (Duolingo)** | `w-full max-w-5xl mx-auto` | Flex vertical centrado | Nodos circulares de 80px |
| **Práctica Rápida (Home)** | `w-full max-w-5xl mx-auto` | `grid-cols-1 md:grid-cols-2 gap-5` | *Equal Height* con `mt-auto` en botón |
| **Logros y Estadísticas** | `w-full max-w-5xl mx-auto` | `grid-cols-1 sm:grid-cols-2 gap-5` | *Equal Height* con `mt-auto` en progreso |
| **Laboratorio Clínico (9 Módulos)** | `w-full max-w-5xl mx-auto` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3` | Botones de `min-h-[56px] h-14` |
| **Catálogo Clínico (7 Técnicas)** | `w-full max-w-5xl mx-auto` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5` | *Equal Height* + `aspect-video` + botonera anclada |
| **Consola de Práctica Rítmica** | `w-full max-w-5xl mx-auto` | Contenedor principal 1024px | Rítmico con visualizadores en `max-w-2xl` |
| **Divulgación Neurobiológica** | `w-full max-w-5xl mx-auto` | `grid-cols-1 md:grid-cols-3 gap-3.5` | 3 tarjetas informativas simétricas |
| **Acordeón FAQ y Guía** | `w-full max-w-5xl mx-auto` | Acordeón vertical fluido | Expansible con animación suave |
| **Footer Global y AMTTM** | `w-full max-w-5xl mx-auto` | Bloque unificado | Alineado con el margen perimetral |

---

## 4. Beneficios Ergonómicos y Accesibilidad (WCAG 2.1 AA)

1. **Cero Layout Shift (CLS = 0):** Al navegar entre vistas, el ancho del marco permanece inalterable en 1024px.
2. **Ergonomía de Clic y Touch Targets:** Los botones anclados al pie de las tarjetas ofrecen un área de interacción mínima de 44 × 44 px, superando las pautas de accesibilidad.
3. **Escaneabilidad Visual Homogénea:** El ojo del usuario encuentra los elementos clave (iconos, títulos, badges y botones) en las mismas coordenadas verticales dentro de cada fila del Grid.

---

## 5. Reglas de Validación Automatizada Obligatoria (Regla 10 de AGENTS.md)

Para prevenir regresiones y asegurar que cualquier nuevo elemento, vista o tarjeta cumpla las directrices arquitectónicas, se implementaron suites de validación estricta en 3 capas:

1. **Pruebas BDD en Cucumber.js (`features/design_system_and_layout_consistency.feature`):**
   - Valida el contenedor maestro canónico `max-w-5xl` en todas las pantallas.
   - Audita la presencia obligatoria de `items-stretch`, `h-full flex flex-col justify-between` y `mt-auto` en las rejillas.
   - Detecta y prohíbe de manera estricta clases desalineadas como `max-w-4xl`.
   - Verifica la directiva `'use client'` en todos los componentes interactivos de `src/components/`.

2. **Pruebas Arquitectónicas en Vitest (`src/tests/design_system_consistency.test.ts`):**
   - Escaneo estático del árbol `src/` para garantizar 0 ocurrencias de `max-w-4xl`.
   - Verificación de la relación de aspecto `aspect-video` para videos y `aspect-square` para avatares u orbes.
   - Verificación de atributos ARIA válidos (`aria-pressed` para alternancias en nav sin tablist y ausencia de `aria-selected`).

3. **Pruebas E2E en Playwright (`tests/e2e/cadensa.spec.ts`):**
   - Medición precisa de dimensiones computadas (bounding box <= 1024px) en viewport de escritorio amplio sin saltos al alternar pestañas o entrar a la práctica.
   - Comprobación en navegador real de alturas equiparables entre tarjetas adyacentes (*Equal Height*) y altura táctil mínima (>= 32px) en los botones de acción.
