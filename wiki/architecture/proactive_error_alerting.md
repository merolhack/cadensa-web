# Alertas Proactivas en Tiempo Real de Errores Fatales

> **Componente**: [`src/lib/errorTracker.ts`](file:///home/merolhack/fl/cadensa-web/src/lib/errorTracker.ts)  
> **Integración**: Discord Webhooks, Slack Webhooks y Endpoints HTTP Genéricos  
> **Patrón**: Silent Fail y Desacoplamiento Asíncrono

---

## 1. Motivación y Arquitectura

Para incidentes críticos (excepciones no capturadas en el hilo principal de audio, colapso de AudioContext o fallas en el flujo de autenticación), Cadensa cuenta con un canal de alerta proactiva que notifica de inmediato al equipo técnico sin esperar a que el usuario reporte la falla.

### Flujo de Despacho
1. Ocurre una excepción marcada con `fatal: true`.
2. El despachador consulta la variable de entorno `NEXT_PUBLIC_ERROR_WEBHOOK_URL`.
3. Detecta automáticamente el formato del receptor:
   - **Discord**: Crea un payload enriquecido con `embeds`, color de alerta (#ef4444), nombre del evento, mensaje, componente, URL, usuario y fragmento del stack trace (hasta 800 caracteres).
   - **Slack**: Formatea el bloque de texto con asteriscos Markdown (`🚨 *Alerta Proactiva Crítica*`).
   - **Genérico**: Envía un JSON con campos `level: 'fatal'`, `source: 'cadensa-web'`, `timestamp` y objeto de error.
4. La petición se envía con protección `try/catch` para garantizar que una falla de red al webhook jamás afecte al paciente.

---

## 2. Configuración en Entornos
Para activar el canal de alertas en producción:
- Agregar en Cloudflare Pages Environment Variables:
  `NEXT_PUBLIC_ERROR_WEBHOOK_URL="https://discord.com/api/webhooks/..."`
- O en el archivo `.env` local para pruebas de desarrollo.

