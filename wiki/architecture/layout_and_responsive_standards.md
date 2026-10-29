---
title: "Estándares de Diseño y Homogeneidad de Ancho en Cadensa"
category: "architecture"
tags: [frontend, layout, design-system, responsive, accessibility]
last_updated: "2026-10-24"
sources:
  - "src/app/page.tsx"
  - "src/components/TechniquesCatalogHome.tsx"
  - "src/components/CommunityBanner.tsx"
  - "src/components/FaqAndMethodology.tsx"
related:
  - "wiki/architecture/frontend.md"
  - "wiki/architecture/overview.md"
---

# Estándares de Diseño y Homogeneidad de Ancho en Cadensa

Este documento especifica la arquitectura de contenedores, rejillas responsivas y jerarquía de anchos máximos (`max-w-*`) adoptada para garantizar una experiencia visualmente homogénea, simétrica y libre de saltos de diseño (*layout shifts*) entre todas las pantallas de Cadensa.

---

## 1. Problema de Diseño Previo y Diagnóstico

En versiones anteriores existía una disparidad notable en la escala de los contenedores entre vistas:

1. **Página de Inicio / Catálogo:** Utilizaba un ancho amplio de `max-w-5xl` (1024px) en la cabecera y en la rejilla de tarjetas de técnicas, ofreciendo una vista panorámica y moderna.
2. **Estación de Práctica:** Reducía drásticamente el marco superior a `max-w-3xl` (768px), y la tarjeta de entrenamiento central a `max-w-xl` (576px).
   - **Consecuencia:** En pantallas de escritorio se creaban barras negras vacías gigantescas a ambos lados, comprimiendo los lectores de sílabas y los visualizadores fisiológicos en una columna estrecha.
   - **Salto Visual:** Al alternar entre el catálogo y la práctica, la barra de navegación "saltaba" 128px hacia adentro, provocando una sensación de desalineación.

---

## 2. Sistema Homogéneo de Contenedores

Para resolver la disparidad, se estableció una jerarquía clara de 3 niveles de contención que se respeta de manera idéntica en todas las vistas:

```text
+-----------------------------------------------------------------------------------+
|  NIVEL 1: Marco Superior / Inferior (max-w-5xl = 1024px)                          |
|  [Navbar: ← Inicio | Cadensa v0.4.0 ........... Video | Técnica ▾ | Racha | Auth] |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  NIVEL 2: Contenido Focal y Estudio Clínico (max-w-4xl = 896px)                   |
|  +-----------------------------------------------------------------------------+  |
|  | Header / Subtítulo / Barra de Meta Diaria                                   |  |
|  +-----------------------------------------------------------------------------+  |
|  | Estudio de Entrenamiento Central (Pacer, Sílabas, Controles, Sliders)       |  |
|  | (Componentes internos: max-w-2xl para visualizadores y lectores)           |  |
|  +-----------------------------------------------------------------------------+  |
|  | Rejilla de 3 Tarjetas de Fundamento Neurobiológico (md:grid-cols-3)         |  |
|  +-----------------------------------------------------------------------------+  |
|  | Acordeón Interactivo de FAQ y Metodología (FaqAndMethodology)               |  |
|  +-----------------------------------------------------------------------------+  |
|  | Banner Comunitario Oficial AMTTM (CommunityBanner)                          |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  NIVEL 3: Catálogo General de 3 Columnas (max-w-5xl = 1024px)                     |
|  (Página de Inicio: 7 tarjetas con espaciado equilibrado en 3 columnas)           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  NIVEL 1: Pie de Página Homogéneo (max-w-5xl = 1024px)                            |
|  [Footer: Cadensa Web — Terapia Rítmica Silábica • Next.js 16 • Cloudflare Pages] |
+-----------------------------------------------------------------------------------+
```

---

## 3. Matriz de Ancho por Componente

| Componente | Clase Tailwind | Ancho Máximo en Píxeles | Propósito Visual |
| :--- | :--- | :---: | :--- |
| **Barra de Navegación** (Home y Práctica) | `w-full max-w-5xl` | 1024px | Marco superior simétrico sin saltos al navegar. |
| **Pie de Página** (Home) | `w-full max-w-5xl` | 1024px | Cierre visual alineado simétricamente con el catálogo y la cabecera. |
| **Pie de Página** (Práctica) | `w-full max-w-4xl` | 896px | Cierre visual simétrico con la consola de práctica y tarjetas clínicas. |
| **Parrilla de Catálogo** (`TechniquesCatalogHome`) | `w-full max-w-5xl` | 1024px | Permite 3 columnas de tarjetas (`grid-cols-1 md:grid-cols-3`) con respiro visual. |
| **Sección Informativa Neuroplasticidad** (Home) | `w-full max-w-5xl` | 1024px | Se alinea con los márgenes exteriores de las tarjetas superiores. |
| **Banner Comunitario AMTTM** (Home / Práctica) | `w-full max-w-5xl` / `max-w-4xl` | 1024px / 896px | Alineación simétrica según la vista activa. |
| **Aviso de Compatibilidad de Navegadores** (`BrowserCompatibilityBanner`) | En Footer | Compacto | Ubicado discretamente al pie de página para perfil técnico sin estorbar la práctica clínica. |
| **Estudio de Entrenamiento** (`page.tsx`) | `w-full max-w-4xl` | 896px | Espacio amplio para metrónomo, slider de tempo y botones. |
| **Tarjetas de Neurobiología** (3 cards) | `w-full max-w-4xl` | 896px | Se alinea con el estudio superior y da ~280px por columna. |
| **Acordeón FAQ y Guía** (`FaqAndMethodology`) | `w-full max-w-4xl` | 896px | Legibilidad óptima sin renglones excesivamente largos. |
| **Banner Comunitario** (`CommunityBanner`) | `w-full max-w-4xl` | 896px | Alineación simétrica con el acordeón y el estudio. |
| **Visualizadores Fisiológicos** (`TechniqueVisualizer`) | `w-full max-w-2xl` | 672px | Contiene rampas y diagramas en 3 etapas sin cortes. |
| **Lector de Sílabas** (`SyllableReader`) | `w-full max-w-2xl` | 672px | Flujo de palabras y sílabas balanceado y centrado. |

---

## 4. Beneficios Ergonómicos y Accesibilidad

1. **Cero Layout Shift (CLS = 0):** El usuario puede entrar a la práctica y volver al catálogo (`← Inicio`) manteniendo la barra superior y los botones de racha en la misma posición de la pantalla.
2. **Eliminación del Efecto "Túnel":** En monitores de escritorio (Full HD o 4K), la estación de práctica no se ve como una tira estrecha, sino como una consola profesional de fonoaudiología digital.
3. **Adaptabilidad Móvil Fluida:** En pantallas pequeñas (`< 640px`), todas las clases `max-w-*` respetan el 100% del ancho con `w-full` y un espaciado perimetral ergonómico de `p-3 sm:p-6`.
