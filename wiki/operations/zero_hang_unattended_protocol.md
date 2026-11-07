---
title: "Protocolo de Ejecución Desatendida Zero-Hang y Prevención de Bloqueos"
category: "operations"
tags: [operations, zero-hang, unattended, timeouts, watchdog, automation, reliability]
last_updated: "2026-11-07"
sources:
  - "wiki/raw/preventing-unattended-hangs-and-process-timeouts.md"
  - "AGENTS.md"
  - "package.json"
related:
  - "wiki/operations/deployment_runbook.md"
  - "wiki/operations/developer_handoff.md"
  - "wiki/architecture/video_generation_pipeline.md"
---

# Protocolo de Ejecución Desatendida "Zero-Hang" y Prevención de Bloqueos en Cadensa

> [!IMPORTANT]
> **REGLA DE ORO DE AUTOMATIZACIÓN DESATENDIDA EN CADENSA:**
> Queda terminantemente PROHIBIDO lanzar tareas en segundo plano o procesos desatendidos que puedan requerir interacción por teclado, solicitud de contraseñas (`sudo`), confirmaciones interactivas (`[y/N]`, `read`, prompts de `npm`/`npx`), o que carezcan de un límite estricto de tiempo (*timeout* defensivo).
> Todo comando, script o pipeline desatendido debe ser 100% autónomo, desacoplado de la entrada estándar (`< /dev/null`), inmune a bloqueos en `stdin` y contar con registro continuo de latido (*heartbeat*) y puntos de control (*checkpoints*) en disco.

---

## 1. El Incidente de Referencia: La Amenaza del Bloqueo Silencioso

En arquitecturas donde agentes autónomos de IA y scripts de automatización operan de noche o durante la ausencia del desarrollador, el peor fallo no es un error que termina con código distinto de cero (`exit code != 0`), sino un **bloqueo silencioso** (*hang*).

### La Cadena Causal del Bloqueo:
1. **Petición en stdin en entorno sin TTY:** Un subproceso invoca una utilidad interactiva (ej. `sudo`, confirmación de sobreescritura de archivo en FFmpeg, prompt de descarga de paquetes en `npx`, o solicitud de credenciales de Git).
2. **Consumo de 0% CPU en espera indefinida:** El proceso pasa al estado `WAITING FOR INPUT`. No emite logs, no genera errores y no consume ciclos de CPU.
3. **Suspensión reactiva del agente:** El orquestador o agente de IA cede el turno aguardando la señal de finalización de la tarea. Al no recibir salida ni código de retorno, permanece congelado durante horas completas (ej. incidente documentado de 7 horas en dqro.mx).
4. **Pérdida de ventana operativa:** Se desaprovechan las horas nocturnas o ventanas de procesamiento desatendido, bloqueando pipelines críticos (generación neuronal de video, suites de pruebas E2E, ingestas o compilaciones).

---

## 2. Mapa de Vulnerabilidades Críticas en Cadensa

Cadensa integra múltiples subsistemas susceptibles a bloqueos silenciosos si no se ejecutan bajo el protocolo Zero-Hang:

| Subsistema de Cadensa | Componente / Script | Punto de Riesgo de Bloqueo | Consecuencia en Modo Desatendido |
|---|---|---|---|
| **Pipeline Audiovisual e IA** | `scripts/compose_cadensa_video.py`, `wav2lip_runner.py`, `validate_and_run_comfyui.py` | FFmpeg sin bandera `-nostdin` o sin `-y`; ComfyUI API local (`127.0.0.1:8188`) colgada o WebSocket interrumpido; descargas de pesos PyTorch/HuggingFace esperando confirmación de red. | El agente o script espera eternamente a que termine la transcodificación o generación de frames del avatar clínico. |
| **Pruebas E2E y Navegadores** | `playwright.config.ts`, `npx playwright test`, `tests/e2e/cadensa.spec.ts` | Navegador Chromium/WebKit/Firefox esperando un selector inexistente sin timeout estricto de acción; prompt interactivo de `npx` (`Need to install the following packages... Ok to proceed? (y)`). | Suite E2E colgada impidiendo avanzar hacia la etapa de verificación o despliegue. |
| **Control de Versiones y Despliegue** | `git push`, CLI de GitHub (`gh run watch`), Cloudflare Pages | Git solicitando credenciales HTTPS o frase de paso SSH en `stdin`; `gh run watch` esperando un workflow encolado sin límite de tiempo. | Proceso congelado en terminal sin TTY. |
| **Auditoría SEO y APIs de Google** | `scripts/submit_seo_changes.py`, `scripts/audit_seo_performance.py` | Tokens OAuth que disparan flujo interactivo de navegador; respuestas 429 de Google Search Console o Indexing API sin backoff. | Script detenido esperando que un humano abra una URL de autorización en el navegador. |
| **Base de Datos y Telemetría** | `scripts/migrate_supabase.cjs`, `supabase/` | Conexión a PostgREST/Supabase interrumpida sin socket timeout; bloqueos en DDL. | Tarea en background suspendida indefinidamente. |
| **Entorno WSL / Sistema Operativo** | Invocación de utilidades del sistema en Ubuntu WSL | Invocación de `sudo` cuando la caché de credenciales expiró. | Subproceso WSL congelado esperando contraseña en entrada estándar cerrada. |

---

## 3. Los 5 Principios Inmutables del Protocolo "Zero-Hang" en Cadensa

### Principio 1: Prohibición Absoluta de `sudo` y Aislamiento de Permisos
* **Regla:** Queda terminantemente PROHIBIDO utilizar `sudo` en cualquier script, comando automatizado o acción ejecutada por el agente en Cadensa.
* **Manejo de Permisos:**
  * En WSL, todo comando debe ejecutarse con el usuario ordinario de desarrollo (`merolhack`), el cual ya posee permisos sobre todo el árbol `/home/merolhack/fl/cadensa-web/`.
  * En contenedores Docker (`Dockerfile`, `docker-compose.yml`), si se requiere manipular archivos con permisos elevados, se debe invocar la bandera de usuario del propio contenedor (`docker exec -u 0 <container> ...`), jamás `sudo` en el sistema host.

### Principio 2: Timeouts Defensivos Obligatorios en Comandos de Segundo Plano
* **Regla:** NINGÚN comando en segundo plano puede despacharse sin un límite de tiempo explícito. Todo comando susceptible de demorarse debe envolverse en la utilidad `timeout` de GNU coreutils con la señal `KILL` forzada ante falta de respuesta (`--kill-after=10s`).
* **Sintaxis Estándar:**
  ```bash
  # Termina el comando con SIGTERM tras el tiempo fijado, y con SIGKILL tras 10s adicionales si no responde
  timeout --kill-after=10s <DURACION> <COMANDO>
  ```
* **Tabla de Timeouts Máximos Permitidos en Cadensa:**

| Categoría de Tarea | Comando / Script | Timeout Máximo Recomendado |
|---|---|---|
| **Pruebas Unitarias Vitest** | `npm run test` / `npx vitest run` | `120s` (2 minutos) |
| **Escenarios BDD Cucumber** | `npm run test:bdd` / `npx cucumber-js` | `180s` (3 minutos) |
| **Suite Completa de Pruebas** | `npm run test:all` | `300s` (5 minutos) |
| **Pruebas E2E Playwright** | `npx playwright test` | `300s` (5 minutos) |
| **Compilación Next.js Turbopack** | `npm run build` | `240s` (4 minutos) |
| **Generación de Video Individual** | `python scripts/compose_cadensa_video.py` | `600s` (10 minutos por técnica) |
| **Batch Completo de 7 Técnicas** | `python scripts/generate_all_techniques.py` | `3600s` (60 minutos con checkpoints) |
| **Auditoría SEO / Indexing API** | `python scripts/submit_seo_changes.py` | `120s` (2 minutos) |
| **Monitorización GitHub Actions** | `gh run list` / comprobación de CI | `180s` por ciclo de sondeo |

### Principio 3: Desacople de Entrada Estándar (`< /dev/null`) y Banderas No-Interactivas
* **Regla:** Todo proceso desatendido debe cerrar su entrada estándar (`< /dev/null`). Si alguna biblioteca o herramienta intenta solicitar entrada del usuario, fallará en milisegundos (`Fail-Fast`) en lugar de suspenderse indefinidamente.
* **Configuración de Variables de Entorno No-Interactivas:**
  ```bash
  export DEBIAN_FRONTEND=noninteractive
  export GIT_TERMINAL_PROMPT=0
  export NPM_CONFIG_YES=true
  export CI=true
  ```
* **Invocaciones Seguras por Herramienta:**
  * **FFmpeg:** NUNCA ejecutar sin `-y` (sobreescribir sin preguntar) y `-nostdin` (desactivar control interactivo por consola):
    ```bash
    ffmpeg -y -nostdin -hide_banner -loglevel error -i input.mp4 output.mp4 < /dev/null
    ```
  * **NPX / NPM:** Pasar siempre `--yes` o bandera no interactiva:
    ```bash
    npx --yes playwright test < /dev/null
    ```
  * **Python:** Ejecutar con salida sin búfer (`python -u`) para que los registros se escriban inmediatamente en disco:
    ```bash
    python -u scripts/compose_cadensa_video.py < /dev/null
    ```
  * **Git:** Forzar no interactividad ante solicitud de credenciales:
    ```bash
    git -c core.askPass=true push origin main < /dev/null
    ```

### Principio 4: Bitácora de Latido Persistente en Disco (Heartbeat Watchdog)
* **Regla:** Toda tarea desatendida de larga duración (más de 3 minutos, ej. generación audiovisual de avatares, procesamiento de audio clínico por lotes o análisis de SEO masivo) debe emitir latidos periódicos cada 15 a 30 segundos y guardar puntos de control (*checkpoints*).
* **Archivo de Estado Canónico:** `reports/.unattended_status.json`
* **Estructura del Latido:**
  ```json
  {
    "timestamp": "2026-11-07T09:30:00-06:00",
    "task_id": "video-batch-sadtalker-7-techniques",
    "stage": "composing_technique",
    "current_item": "syllable-timed-speech",
    "progress_percent": 42.8,
    "completed_items": ["easy-onset", "light-contact", "prolonged-speech"],
    "total_items": 7,
    "last_error": null,
    "status": "RUNNING"
  }
  ```
* **Protocolo de Recuperación:**
  1. Si un proceso muere por timeout o fallo de memoria (OOM), el estado persistido en `reports/.unattended_status.json` registra exactamente cuáles elementos concluyeron con éxito.
  2. Al reanudar la ejecución desatendida, el script o el agente lee el checkpoint y reanuda desde el elemento pendiente, sin repetir el trabajo ya procesado.
  3. Si el archivo de estado no actualiza su `timestamp` en más de 4 minutos, se considera un proceso zombi y debe ser terminado (`kill`).

### Principio 5: Circuit Breakers y Backoff Exponencial ante APIs y Servicios Externos
* **Regla:** Ningún bucle de conexión contra servicios externos (ComfyUI local `127.0.0.1:8188`, Supabase REST, Google Indexing API, GitHub API) puede reintentar indefinidamente sin límite de intentos ni pausas crecientes.
* **Reglas del Circuit Breaker en Cadensa:**
  * **Límite de Reintentos:** Máximo 3 intentos por petición fallida.
  * **Retroceso Exponencial con Jitter:** Intervalos de espera de 2s → 4s → 8s con variación aleatoria de ±500 ms.
  * **Comprobación de Salud Previa (Pre-Flight Health Check):** Antes de lanzar un lote masivo contra ComfyUI o Supabase, verificar el endpoint base (ej. `GET http://127.0.0.1:8188/system_stats`). Si el servicio no responde en 5 segundos, abortar inmediatamente con mensaje explicativo en lugar de iniciar el procesamiento.
  * **Manejo de HTTP 429 (Too Many Requests):** Si la API de Google Search Console o Supabase responde con rate limit, detener peticiones y esperar el valor indicado en `Retry-After` (o mínimo 60 segundos) antes de intentar el siguiente recurso.

---

## 4. Instrucciones Operativas para Agentes de IA en Modo Desatendido

Cuando el usuario deje al agente trabajando en una tarea autónoma de larga duración (ej. mediante slash command `/goal`, refactorizaciones profundas o compilación y verificación nocturna):

1. **Despacho Defensivo de Comandos en Background:**
   * Al utilizar herramientas de ejecución de comandos (`run_command`), SIEMPRE agregar el prefijo `timeout` adecuado y redirigir `< /dev/null`.
   * **Ejemplo de invocación segura de la suite de pruebas:**
     ```bash
     timeout 300s npm run test:all < /dev/null
     ```
2. **Monitoreo de GitHub Actions sin Bloqueo:**
   * NUNCA ejecutar `gh run watch` sin un timeout global o en un bucle ciego.
   * La verificación de GitHub Actions requerida por `AGENTS.md` (Regla 5) debe realizarse consultando el estado con `gh run list --limit 1` y pausas periódicas, abortando si supera los 15 minutos de espera.
3. **Fail-Fast ante Errores Críticos:**
   * Si una prueba o comando falla, el agente DEBE detenerse, analizar el error y planificar la remediación. Queda prohibido entrar en bucles de reintentos ciegos que ejecuten el mismo comando fallido una y otra vez.

---

## 5. Matriz de Prevención Rápida

| Síntoma Observado | Causa Raíz Probable | Solución Inmediata Obligatoria |
|---|---|---|
| Proceso congelado con 0% de CPU | Subproceso esperando entrada de teclado o contraseña | Agregar `< /dev/null` y banderas no interactivas (`-y`, `--yes`). |
| FFmpeg no termina de procesar audio/video | FFmpeg esperando confirmación de sobreescritura o atado a stdin | Pasar `-y -nostdin` explícitamente en los argumentos de FFmpeg. |
| Playwright cuelga la terminal | Test esperando selector indefinido o navegador pidiendo permisos | Configurar timeout de acción de 5000 ms y timeout global de 30s por test en Playwright. |
| `git push` se detiene sin mensaje | Git solicitando credenciales HTTPS interactivas | Usar `git -c core.askPass=true push` o verificar configuración de credenciales SSH/OAuth. |
| ComfyUI no responde al script de avatar | Servidor local apagado o WebSocket desconectado | Pre-flight check a `/system_stats` con timeout de 5 segundos antes de encolar. |
| Script en background ejecutándose por horas | Ausencia de timeout envolvente en el comando | Envolver con `timeout --kill-after=10s <Xs> <comando>`. |

---

## 6. Lista de Verificación Previa a la Ejecución Desatendida

Antes de dejar cualquier tarea corriendo sin supervisión humana:
* [ ] ¿Se eliminó cualquier uso de `sudo` del comando o script?
* [ ] ¿Cuenta el comando con un `timeout` defensivo calibrado según su carga de trabajo?
* [ ] ¿Está desacoplada la entrada estándar con `< /dev/null`?
* [ ] ¿Se pasaron banderas no interactivas (`-y`, `--yes`, `-nostdin`, `CI=true`)?
* [ ] ¿Escribe el script registros sin búfer en disco (`python -u`, logs rotacionales)?
* [ ] ¿Cuenta la tarea de larga duración con checkpoints y archivo de estado (`reports/.unattended_status.json`) para reanudación ante fallos?

