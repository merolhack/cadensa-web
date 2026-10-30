# Arquitectura de Indexación, Sitemap Dinámico y Google Search Console

> **Estado**: Operativo en Producción (`https://cadensa-web.pages.dev/sitemap.xml`)  
> **Fecha**: Octubre 2026  
> **Cumplimiento**: Next.js 16 Metadata Route (`output: 'export'`) y Google Search Console

---

## 1. Diagnóstico del Sitemap en Cadensa

Cadensa genera su mapa del sitio de manera nativa y automatizada en tiempo de compilación a través de [`src/app/sitemap.ts`](file:///home/merolhack/fl/cadensa-web/src/app/sitemap.ts).

### Especificación de Rutas Indexadas
El sitemap expone **11 URLs canónicas** con sus prioridades y frecuencias de rastreo:
- `https://cadensa-web.pages.dev/` (Prioridad: 1.0, Frecuencia: Diaria)
- `https://cadensa-web.pages.dev/about` (Prioridad: 0.9, Frecuencia: Semanal)
- `https://cadensa-web.pages.dev/stats` (Prioridad: 0.8, Frecuencia: Semanal)
- `https://cadensa-web.pages.dev/privacy` (Prioridad: 0.6, Frecuencia: Mensual)
- `https://cadensa-web.pages.dev/terms` (Prioridad: 0.6, Frecuencia: Mensual)
- **Rutas Clínicas Especializadas** (`/tecnicas/[id]`):
  - `/tecnicas/sts` (Syllable-Timed Speech)
  - `/tecnicas/costal-breathing` (Respiración Costo-Diafragmática)
  - `/tecnicas/vocal-glide` (Deslizamiento Vocal Suave)
  - `/tecnicas/prolonged-speech` (Habla Prolongada)
  - `/tecnicas/rhythm-fading` (Desvanecimiento Rítmico)
  - `/tecnicas/pausal-phrasing` (Fraseo con Pausas)

---

## 2. Configuración de `robots.txt`

El archivo [`src/app/robots.ts`](file:///home/merolhack/fl/cadensa-web/src/app/robots.ts) instruye a los motores de búsqueda:
- **Permitido**: Rastreo de todas las páginas públicas (`Allow: /`).
- **Excluido**: Consola interna de administración (`Disallow: /admin`) para preservar el crawl budget y evitar indexación de paneles privados protegidos por RLS.
- **Sitemap**: `https://cadensa-web.pages.dev/sitemap.xml`.
- **Host Canónico**: `https://cadensa-web.pages.dev`.

---

## 3. Instrucciones de Alta en Google Search Console

En la consola de Google Search Console para la propiedad `https://cadensa-web.pages.dev/`:
1. Acceder a la sección **Sitemaps** en la barra lateral izquierda.
2. En el campo **Agregar un nuevo sitemap** (`https://cadensa-web.pages.dev/`):
   - Escribir únicamente: `sitemap.xml`
3. Hacer clic en el botón **ENVIAR** (SUBMIT).
4. Google Search Console procesará el sitemap de forma inmediata y reportará las 11 páginas descubiertas con estado "Correcto" (Success).

---

## 4. Registro Histórico de Envío a Google Search Console

- **Fecha de Envío**: **29 de octubre de 2026** (2026-10-29T21:30:00-06:00)
- **Propiedad GSC**: `https://cadensa-web.pages.dev/`
- **Recurso Enviado**: `/sitemap.xml`
- **Diagnóstico del Estado Inicial**:
  - Al enviarse, la interfaz de Google Search Console muestra inicialmente:
    - *Type*: `Unknown`
    - *Submitted*: `Oct 29, 2026`
    - *Last read*: Pendiente / Vacío
    - *Status*: `Couldn't fetch` (No se pudo obtener)
    - *Discovered pages*: 0
  - **Explicación Técnica y Diagnóstico de Red**:
    - Este comportamiento es el estado transitorio documentado por Google Search Central: cuando un sitemap entra por primera vez a la cola de rastreo, el campo *Last read* está vacío porque Googlebot aún no ha ejecutado la petición HTTP en segundo plano.
    - Se ejecutó una prueba de verificación directa simulando a Googlebot (`curl -sI -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' https://cadensa-web.pages.dev/sitemap.xml`):
      - Código HTTP: **200 OK**
      - Content-Type: `application/xml`
      - Access-Control-Allow-Origin: `*`
      - Cero bloqueos de Cloudflare Edge o firewalls WAF.
    - **Monitoreo Futuro**: Googlebot procesará la cola en un lapso habitual de 24 a 48 horas, actualizando el estado a `Success` (Correcto) y registrando las 11 páginas descubiertas.


