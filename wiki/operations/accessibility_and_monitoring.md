# Monitoreo de Errores, Tolerancia a Fallos y Accesibilidad Web (a11y)

**Cadensa — Protocolos de Producción y Experiencia Inclusiva**  
*Fecha de Certificación:* Noviembre 2026  
*Estado:* Operativo / 100% Validado  

---

## 1. Resumen Ejecutivo

Para garantizar que Cadensa opere con la máxima confiabilidad en entornos clínicos y dispositivos heterogéneos de pacientes y fonoaudiólogos, se implementó una tríada de robustez:

1. **Auditoría Automatizada de Accesibilidad (a11y):** Certificación WCAG 2.1 AA mediante `axe-core` y `vitest-axe` con 0 violaciones detectadas.
2. **Límite de Errores React (ErrorBoundary):** Aislamiento de caídas en tiempo de ejecución con pantalla de recuperación amigable y captura de errores.
3. **Tolerancia a Fallos de Video:** Fallback visual y funcional ante navegadores obsoletos o códecs de video no soportados.
4. **Telemetría Privacy-First (Zero Trust):** Registro de eventos clínicos y operacionales sin rastreo de PII ni almacenamiento de datos sensibles.

---

## 2. Límite de Errores Clínico (`ErrorBoundary.tsx`)

### Arquitectura y Funcionamiento
Ubicado en `src/components/ErrorBoundary.tsx` e integrado en `src/app/layout.tsx` envolviendo la jerarquía de componentes raíz.

- **Detección Automática:** Intercepta excepciones no controladas en el ciclo de vida del árbol de React (`componentDidCatch`).
- **Recuperación Resiliente:** Presenta una interfaz oscura con iconografía médica fonoaudiológica (`🩺`), explicando con empatía que ocurrió una interrupción no prevista sin exponer trazas crudas ni alarmar al paciente.
- **Acciones Clave:**
  - **Reintentar Sesión:** Restablece el estado interno del componente (`this.setState({ hasError: false, error: null })`).
  - **Volver al Inicio:** Redirige de forma segura a la raíz (`/`) restaurando el metrónomo base.
- **Notificación Silenciosa:** Invoca `trackRuntimeError` de la capa de telemetría para auditar la anomalía sin recopilar información identificable del paciente.

```tsx
// src/app/layout.tsx
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

---

## 3. Tolerancia a Fallos en Reproducción de Video

### Fallback Fonoaudiológico en `TechniqueVideoModal.tsx`
Cuando un dispositivo antiguo, un perfil corporativo restrictivo o un navegador sin soporte para códec H.264 High Profile / AAC intenta reproducir un video demostrativo:

1. **Captura de Evento de Error:** El elemento `<video>` dispara `onError={handleVideoError}`.
2. **Activación de Fallback Amigable:** En lugar de dejar un reproductor negro congelado, se renderiza un contenedor accesible con el mensaje explícito:
   > *"El video no está disponible en este dispositivo, por favor, usa un navegador actualizado."*
3. **Continuidad Terapéutica:** Se mantiene visible y habilitado el botón de acción principal (*"Comenzar Práctica Guiada de [Técnica]"*), permitiendo al paciente realizar su entrenamiento con el metrónomo visual y lector silábico aún sin video.
4. **Registro de Incidencia:** Se reporta el evento `video_error` con el código y mensaje de error nativo del navegador vía telemetría.

---

## 4. Telemetría Privacy-First (Zero Trust)

### Principios de Privacidad
Implementada en `src/lib/telemetry.ts` bajo la arquitectura Zero Trust del proyecto:

- **Sin PII (Personally Identifiable Information):** Jamás se registra nombre, apellido, correo electrónico, documento, IP, ni audio del usuario.
- **Identificador de Sesión Efímero:** Se genera un `sessionId` anónimo (`anon_[random]_[timestamp]`) almacenado exclusivamente en `sessionStorage`. Al cerrar la pestaña o el navegador, el identificador se destruye por completo.
- **Filtrado Preventivo de Propiedades:** Toda propiedad enviada pasa por un filtro de sanitización que bloquea cualquier clave sospechosa de contener datos personales (`name`, `email`, `token`, `phone`, etc.).
- **Transporte Ligero:** Despacha logs estructurados en consola para depuración local y, si se configura un endpoint, despacha balizas ligeras y no bloqueantes vía `navigator.sendBeacon`.

### Eventos Oficiales Rastreados:
- `technique_viewed`: Visualización de la ficha o modal de una de las 7 técnicas fonoaudiológicas.
- `video_played`: Inicio de reproducción de un video con indicación del estado de silencio (`isMuted`).
- `practice_started`: Clic en el botón de comenzar práctica guiada desde el modal multimedia.
- `video_error`: Fallo de decodificación o carga del archivo multimedia.
- `runtime_error`: Excepción en componentes atrapada por el Error Boundary.

---

## 5. Auditoría de Accesibilidad Web (WCAG 2.1 AA)

### Verificaciones Automatizadas en CI/CD (`accessibility.test.tsx`):
- **Estructura de Encabezados (Heading Order):** Jerarquía estricta `h1` → `h2` → `h3` sin saltos ni niveles omitidos en toda la aplicación.
- **Foco Accesible y Trampa de Foco (Focus Trap):**
  - Al abrir `TechniqueVideoModal`, el foco queda confinado a los elementos interactivos del modal (`Tab` / `Shift+Tab`).
  - Al cerrar con el botón o con la tecla `Escape`, el foco se restituye al elemento disparador exacto que lo abrió.
- **Etiquetado Semántico y ARIA:**
  - Todos los botones interactivos cuentan con `aria-label` descriptivo.
  - El control deslizante de tempo incluye `aria-valuemin`, `aria-valuemax` y `aria-valuenow`.
  - Las miniaturas del catálogo fonoaudiológico operan como botones accesibles de teclado (`role="button"`, `tabIndex={0}`, eventos `Enter` / `Espacio`).
- **Contraste de Color:** Paleta esmeralda (`#10b981`), cian (`#06b6d4`) y zinc (`#fafafa` sobre `#09090b`), superando la razón mínima de contraste de 4.5:1 para texto normal y 3.0:1 para elementos de interfaz.

