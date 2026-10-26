---
title: "Arquitectura Multimedia: Reproducción de Video Nativo con Patrón Façade"
category: "architecture"
tags: [architecture, multimedia, video, player, facade-pattern, web-vitals, performance]
last_updated: "2026-10-26"
sources:
  - "wiki/raw/poc_specifications.md"
  - "wiki/architecture/frontend.md"
related:
  - "wiki/entities/technique_media.md"
  - "wiki/architecture/layout_and_responsive_standards.md"
  - "wiki/concepts/clinical_techniques_overview.md"
---

# Arquitectura Multimedia: Reproducción de Video Nativo con Patrón Façade

Este documento formaliza la arquitectura, decisiones de diseño y directrices de ingeniería para la entrega e incrustación de contenido audiovisual clínico en **Cadensa**.

---

## 1. Principio y Motivación Clínica-Técnica

Las técnicas fonoaudiológicas (como el **Habla Rítmica Silábica - STS**, el **Inicio Vocal Suave** o el **Pull-Out**) requieren modelado visual y auditivo para que el usuario aprenda la postura laríngea y la coordinación motora adecuada antes de entrenar con el metrónomo.

Sin embargo, en plataformas web móviles y Jamstack, la inclusión de video presenta riesgos de rendimiento:
* **Sobrecarga de ancho de banda:** Descargar archivos de video (ej. 8.75 MB) en la carga inicial penaliza el consumo de datos móviles del usuario.
* **Degradación de Core Web Vitals:** Puede disparar el *Largest Contentful Paint* (LCP) y provocar saltos visuales (*Cumulative Layout Shift - CLS*).
* **Bloatware de reproductores de terceros:** Librerías como *Video.js* o *ReactPlayer* añaden entre 50 KB y 150 KB de bundle JS y conflictos de hidratación en React 19.

---

## 2. Solución Arquitectónica: Patrón Façade Click-to-Play

Cadensa implementa la recomendación canónica de Google Web Vitals conocida como el **Patrón Façade**:

```
[ Estado 1: Portada Estática ] ──( Clic en ▶ )──→ [ Estado 2: Reproductor Activo ]
  • Next.js <Image /> (unoptimized)                • HTML5 <video controls autoPlay>
  • Relación aspect-video fija (CLS = 0)           • playsInline (previene fullscreen forzado)
  • Cero transferencia de video (0 MB red)         • Streaming HTTP Range 206 desde Edge CDN
  • Botón Play glowing perfectamente centrado       • Pausa y reset automático al cerrar
```

### 2.1 Fase 1: Portada Estática Interactiva (Façade)
* Se renderiza la portada [`/media/techniques/cadensa_sts_portada.png`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/public/media/techniques/cadensa_sts_portada.png) utilizando el componente `Image` de Next.js optimizado para exportación estática (`unoptimized`).
* La relación de aspecto se bloquea en 16:9 (`aspect-video`), garantizando **CLS = 0**.
* Sobre la portada se superpone un degradado semitransparente, un badge informativo (`Video Demostrativo de {technique.shortName}`) y un botón circular de reproducción esmeralda (`bg-emerald-500 hover:bg-emerald-400`) con el glifo `▶` centrado mediante posicionamiento absoluto (`absolute inset-0 flex items-center justify-center`).
* **Consumo de red para el video: 0 bytes**.

### 2.2 Fase 2: Montaje y Reproducción Nativa
* Cuando el usuario hace clic en el botón o en la portada, el estado reactivo conmuta (`setPlayingTechniqueId(technique.id)`).
* Se monta el elemento HTML5 nativo `<video>` con:
  * `src`: Ruta al archivo MP4 (`/media/techniques/cadensa_sts_montaje_limpio_final.mp4`).
  * `poster`: URL de la portada para transición sin parpadeo.
  * `autoPlay`: Inicio inmediato de la reproducción al hacer clic.
  * `controls`: Controles nativos accesibles del navegador (volumen, seek bar, pantalla completa, Picture-in-Picture).
  * `playsInline`: **Obligatorio para iOS Safari**. Evita que el navegador de iPhone secuestre la pantalla completa automáticamente, preservando el contexto del modal.

### 2.3 Fase 3: Gestión de Ciclo de Vida y Limpieza
* Si el usuario cierra el modal (mediante botón cerrar, tecla `Escape` o clic fuera del diálogo), el reproductor invoca `videoRef.current.pause()` y restablece el estado para garantizar que no persista audio reproduciéndose en segundo plano.

---

## 3. Integración en el Catálogo de Inicio ([`TechniquesCatalogHome.tsx`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/components/TechniquesCatalogHome.tsx))

Para técnicas que cuentan con material audiovisual (`technique.thumbnailUrl` definido):
* La tarjeta del catálogo en la página principal exhibe la portada en formato miniatura (`aspect-video rounded-2xl`).
* Al pasar el cursor (`group-hover`), se activa una micro-animación de zoom y se resalta el botón de play central con el badge `🎬 Video HD`.
* El botón inferior de la tarjeta se adapta automáticamente a `Ver Video (HD)` para indicar al usuario la disponibilidad del material audiovisual.

---

## 4. Distribución en Cloudflare Pages Anycast CDN

* Los archivos estáticos en `public/media/techniques/` se distribuyen a través de la red perimetral Anycast de Cloudflare.
* Cloudflare Pages soporta cabeceras `Range` con respuestas `HTTP 206 Partial Content`, permitiendo al usuario saltar de forma instantánea a cualquier punto del video sin requerir la descarga completa previa del archivo.
* Límite de tamaño: Archivos multimedia individuales deben mantenerse preferentemente **por debajo de 25 MB** para compatibilidad óptima con los límites de despliegue de Cloudflare Pages.
