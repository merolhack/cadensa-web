---
title: "Entidad: Cloudflare Pages (Hosting & Edge CDN)"
category: "entities"
tags: [entities, cloudflare, hosting, edge, cdn]
last_updated: "2026-10-23"
sources:
  - "wiki/raw/poc_specifications.md"
related:
  - "wiki/architecture/cicd_deployment.md"
  - "wiki/concepts/static_spa_paradigm.md"
---

# Entidad: Cloudflare Pages

**Cloudflare Pages** es la plataforma de alojamiento web y edge compute seleccionada para servir los activos estáticos de Cadensa en todo el mundo.

---

## 1. Características Técnicas

- **Red Anycast Global:** Distribución de contenido en más de 300 ciudades globales, garantizando que los archivos HTML, JavaScript y CSS se sirvan desde la ubicación física más cercana al usuario final.
- **Soporte Nativo de HTTPS y HTTP/3:** Certificados SSL/TLS gestionados y renovados de manera completamente automática.
- **Despliegues Atómicos Inmutables:** Cada ejecución de CI produce un despliegue versionado. Los cambios se propagan a nivel mundial en cuestión de milisegundos sin estados intermedios inconsistentes.
- **Previsualizaciones por Rama (Preview Deployments):** Facilidad para crear despliegues aislados en Pull Requests antes de fusionar a la rama `main`.

---

## 2. Configuración en Cadensa

El proyecto se despliega a través de la acción oficial de GitHub Actions:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: 'cadensa-web'
    directory: 'out'
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Parámetros Críticos:
- `projectName`: Identificador del proyecto en el panel de Cloudflare (`cadensa-web`).
- `directory`: Carpeta generada por Next.js en el paso `npm run build` (`out`).
- `apiToken`: Token de servicio con permisos de `Cloudflare Pages:Edit`.
- `accountId`: Identificador de cuenta de Cloudflare.

---

## 3. Enrutamiento y SPA Fallback

Al ser una SPA estática con App Router de Next.js, Cloudflare Pages maneja automáticamente las rutas mediante archivos HTML pre-renderizados (`/index.html`). Para rutas dinámicas de cliente que puedan añadirse en el futuro, Cloudflare Pages proporciona reglas automáticas o cabeceras mediante archivos `_routes.json` y `_headers` en la carpeta `public/`.
