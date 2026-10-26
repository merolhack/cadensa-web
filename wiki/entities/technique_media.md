---
title: "Entidad: Recursos Multimedia y Activos Audiovisuales de Técnicas"
category: "entities"
tags: [entities, media, video, thumbnails, assets, storage]
last_updated: "2026-10-26"
sources:
  - "wiki/architecture/multimedia_and_video_facade.md"
related:
  - "wiki/concepts/clinical_techniques_overview.md"
  - "wiki/entities/cloudflare_pages.md"
---

# Entidad: Recursos Multimedia de Técnicas Fonoaudiológicas

Este documento define la estructura de almacenamiento, estándares de formato y ciclo de vida de los activos de video e imágenes asociados al catálogo clínico de Cadensa.

---

## 1. Convención de Almacenamiento y Rutas

Todos los activos multimedia estáticos residen bajo el directorio público de Next.js:

```
public/media/techniques/
├── cadensa_sts_montaje_limpio_final.mp4   # Video demostrativo HD de la técnica STS (8.75 MB)
└── cadensa_sts_portada.png               # Imagen de portada / poster 16:9 (4.14 MB)
```

* **Ruta en desarrollo WSL:** `/home/merolhack/fl/cadensa-web/public/media/techniques/`
* **Ruta en Windows UNC:** `\\wsl$\Ubuntu-20.04\home\merolhack\fl\cadensa-web\public\media\techniques\`
* **URL servida en producción:** `/media/techniques/<nombre_archivo>`

---

## 2. Especificación Técnica de Archivos

| Tipo de Recurso | Formato Canónico | Códec / Perfil | Relación de Aspecto | Resolución Estándar | Límite de Peso |
|---|---|---|---|---|---|
| **Video Demostrativo** | `.mp4` | H.264 (AVC) + Audio AAC estéreo | 16:9 | 1080p (1920×1080) o 720p | ≤ 25 MB |
| **Portada / Poster** | `.png` o `.webp` | RGB 8-bit con compresión sin pérdidas | 16:9 | 1920×1080 o 1280×720 | ≤ 5 MB |

### Justificación de Formatos:
* **MP4 (H.264 / AAC):** Es el único contenedor y códec con compatibilidad garantizada al 100% en todos los motores de renderizado web (WebKit en iOS Safari, Blink en Android Chrome, Gecko en Firefox).
* **16:9 Fijo:** Evita cualquier salto de diseño (*Layout Shift*) al cargar o alternar entre la portada y el reproductor de video.

---

## 3. Prevención de Contaminación por Metadatos de SO

Al manipular archivos desde sistemas Windows sobre particiones WSL, se generan archivos de flujo alterno de metadatos NTFS que no deben ser versionados en el repositorio Git:

1. **Patrones Excluidos:**
   * `*:Zone.Identifier` (Marcas de origen web añadidas por Windows al descargar archivos).
   * `Thumbs.db` (Caché de miniaturas de Windows Explorer).
   * `desktop.ini` (Configuraciones de carpeta de Windows).
2. **Blindaje en [`.gitignore`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/.gitignore#L26-L30):**
   ```gitignore
   *:Zone.Identifier
   *.Zone.Identifier
   Thumbs.db
   desktop.ini
   ```

---

## 4. Mapeo en el Modelo de Datos ([`src/lib/clinicalTechniques.ts`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/clinicalTechniques.ts))

Los recursos se vinculan de forma tipada dentro del catálogo de técnicas fonoaudiológicas:

```typescript
export interface ClinicalTechnique {
  // ... campos clínicos previos ...
  videoUrl?: string;       // Ruta al archivo MP4 relativo a public/
  thumbnailUrl?: string;   // Ruta a la portada PNG/WebP relativa a public/
}
```

Para la técnica canónica `sts`:
```typescript
videoUrl: '/media/techniques/cadensa_sts_montaje_limpio_final.mp4',
thumbnailUrl: '/media/techniques/cadensa_sts_portada.png',
```
Si una técnica aún no cuenta con video producido, ambas propiedades permanecen como `undefined`, lo que activa automáticamente el modo de reserva (*placeholder*) institucional en el modal.
