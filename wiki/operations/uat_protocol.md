# Protocolo de Pruebas de Aceptación de Usuario (UAT) — Cadensa

**Versión:** 2.5.0  
**Audiencia:** Fonoaudiólogos / Terapeutas del Habla, Pacientes con Disfemia y QA Testers  
**Entorno de Validación:** Producción ([https://cadensa-web.pages.dev/](https://cadensa-web.pages.dev/))  
**Fecha de Publicación:** Noviembre 2026  

---

## 1. Propósito y Alcance Clínico

Este protocolo establece los criterios de aceptación rigurosos para validar en dispositivos físicos reales (smartphones iOS, Android, tablets y navegadores de escritorio) la experiencia de usuario (UX), la fidelidad fonoaudiológica, la resiliencia offline (PWA) y la privacidad de los datos (Zero Trust).

---

## 2. Requisitos Previos del Evaluador

| Requisito | Descripción | Estado |
| :--- | :--- | :--- |
| **Dispositivo Móvil A** | iPhone / iPad con iOS 16.4+ (Safari actualizado). | [ ] Verificado |
| **Dispositivo Móvil B** | Smartphone Android con Chrome 115+ o Firefox Mobile. | [ ] Verificado |
| **Auriculares** | Con cable o Bluetooth con micrófono integrado. | [ ] Verificado |
| **Conectividad Inicial** | Acceso a Internet para la primera visita y precarga del Service Worker. | [ ] Verificado |

---

## 3. Matriz de Casos de Prueba UAT

### Escenario 1: Instalación y Experiencia PWA (Mobile & Desktop)

*Objetivo:* Certificar que la aplicación web progresiva es instalable como una app nativa sin requerir tiendas de aplicaciones.

- [ ] **1.1 Prompt de Instalación en Android:**
  - Al acceder a `https://cadensa-web.pages.dev/` en Chrome para Android, se observa la opción "Añadir a pantalla de inicio" o "Instalar app".
  - El icono institucional (192px / 512px) y el splash screen en modo oscuro (`#09090b`) se cargan sin distorsión.
- [ ] **1.2 Instalación en iOS (Safari):**
  - Al pulsar el botón "Compartir" de Safari y seleccionar "Añadir a pantalla de inicio", se genera el icono con título "Cadensa".
  - Al abrirse desde la pantalla de inicio, la app se ejecuta en modo standalone (sin barras de navegación de Safari).
- [ ] **1.3 Welcome Tour Inicial (FTUE):**
  - En la primera visita, se despliega el modal de bienvenida en 4 pasos.
  - El paso 3 adapta dinámicamente las instrucciones según el sistema operativo detectado (iOS vs. Android/Escritorio).
  - Al pulsar "Comenzar mi práctica", el modal se cierra y no vuelve a aparecer en recargas subsecuentes (`localStorage`).

---

### Escenario 2: Navegación Clínica y Catálogo de Técnicas

*Objetivo:* Verificar que el paciente y el fonoaudiólogo pueden explorar y seleccionar cualquiera de las 7 técnicas terapéuticas sin fricción.

- [ ] **2.1 Exploración del Catálogo Maestro:**
  - El catálogo en la página de inicio muestra las 7 técnicas con sus respectivas portadas WebP optimizadas y etiquetas de dificultad.
- [ ] **2.2 Rutas Canónicas SEO Directas:**
  - Al acceder a una ruta dedicada (ej. `/techniques/syllable-timed-speech` o `/techniques/easy-onset`), la página carga directamente con encabezado `<h1>`, explicación terapéutica y reproductor de alta definición.
- [ ] **2.3 Transición a la Estación de Práctica:**
  - Al pulsar "Comenzar Práctica" desde el modal o la página de técnica, la aplicación navega fluidamente a la estación con el metrónomo configurado en el tempo sugerido para dicha técnica.

---

### Escenario 3: Reproducción Audiovisual y Biofeedback en Vivo

*Objetivo:* Certificar la sincronización labio-fonética, la presencia de audio directo y la operatividad de controles.

- [ ] **3.1 Audio Inmediato en Botón Play:**
  - Al pulsar el botón "Play" sobre el video de la técnica, el audio clínico sintetizado (Google Cloud TTS neuronal) se escucha de inmediato.
  - Si las políticas de autoplay del navegador bloquean el sonido, se visualiza de forma prominente el botón "Activar audio" en verde esmeralda.
- [ ] **3.2 Control Interactivo de Volumen / Mute:**
  - El botón de sonido permite alternar rápidamente entre "Audio activo" y "Silenciar" sin interrumpir la reproducción del video.
- [ ] **3.3 Widgets de Biofeedback Especializados:**
  - En *Easy Onset*, se aprecia la rampa gráfica de volumen suave.
  - En *Light Contact*, se observa el medidor de presión labial tipo pluma.
  - En *Box Breathing*, el orbe respiratorio realiza el ciclo 4-4-4-4 con guía visual clara.
  - En *Syllable-Timed Speech (STS)*, el metrónomo visual e isocrónico pulsa sincronizado con las sílabas.

---

### Escenario 4: Práctica de Auto-Escucha y Sincronización con Metrónomo

*Objetivo:* Comprobar la experiencia de propiocepción vocal sin interferencias sonoras indeseadas.

- [ ] **4.1 Consentimiento de Micrófono Zero Trust:**
  - Antes de la primera grabación, aparece el modal explicativo informando que el audio se procesa 100% en la memoria RAM del navegador y nunca viaja a servidores.
- [ ] **4.2 Grabación de Práctica y Metrónomo:**
  - Al pulsar "Grabar Práctica", el metrónomo inicia sus pulsos auditivos e isocrónicos.
- [ ] **4.3 Detención Sincronizada:**
  - Al pulsar "Detener Grabación", el metrónomo se detiene automáticamente sin requerir un clic adicional.
- [ ] **4.4 Reproducción Limpia de la Voz:**
  - Al pulsar "Escucharme", el audio del paciente se reproduce con claridad mientras el metrónomo permanece silenciado para permitir una evaluación limpia de la cadencia.

---

### Escenario 5: Exportación de Progreso Clínico en Formato CSV (Excel Ready)

*Objetivo:* Asegurar que el terapeuta pueda abrir el reporte de práctica sin errores de codificación de caracteres.

- [ ] **5.1 Generación del Archivo:**
  - En la sección de práctica o perfil, pulsar "Descargar Reporte para mi Fonoaudiólogo".
  - El navegador descarga un archivo nombrado con timestamp (ej. `cadensa_progreso_clinico_YYYY-MM-DD.csv`).
- [ ] **5.2 Compatibilidad de Caracteres en Microsoft Excel:**
  - Al hacer doble clic en el archivo descargado para abrirlo en Microsoft Excel (Windows o Mac), los textos con tildes y caracteres especiales ("Habla Rítmica Silábica", "Precisión", "Sílaba", "Fonoarticulación") se visualizan correctamente gracias al BOM UTF-8 (`\ufeff`).
- [ ] **5.3 Integridad de Datos Médicos:**
  - El reporte refleja con precisión: fecha, técnica practicada, BPM utilizado, duración de sesión y precisión fonoarticulatoria.

---

### Escenario 6: Navegación Accesible (a11y - WCAG 2.1 AA)

*Objetivo:* Garantizar la accesibilidad para pacientes con limitaciones motoras o que utilizan lectores de pantalla.

- [ ] **6.1 Navegación Exclusiva por Teclado:**
  - Es posible recorrer toda la interfaz utilizando únicamente las teclas `Tab` y `Shift + Tab`.
  - El indicador visual de foco (outline verde/cian) es visible en todos los botones y enlaces interactivos.
- [ ] **6.2 Focus Trap y Cierre en Modales:**
  - Al abrir un modal de video o el modal de técnicas, el foco queda atrapado dentro del modal.
  - Al presionar la tecla `Escape`, el modal se cierra y el foco regresa al botón que lo abrió.
- [ ] **6.3 Contraste y Legibilidad:**
  - Todos los textos (verde esmeralda, cian y blanco sobre fondo `#09090b`) cumplen con la relación de contraste mínima de 4.5:1.

---

### Escenario 7: Resiliencia Offline (PWA Offline-First)

*Objetivo:* Certificar que la terapia diaria puede continuar en áreas rurales, vuelos o sin cobertura de datos.

- [ ] **7.1 Activación del Service Worker:**
  - Tras navegar por la aplicación una vez con conexión a Internet, el Service Worker descarga y almacena en caché (`cadensa-v2.5.0`) los assets críticos y videos.
- [ ] **7.2 Modo Avión / Desconexión de Red:**
  - Activar el "Modo Avión" o apagar la conexión Wi-Fi y datos celulares del dispositivo.
  - Recargar la página `https://cadensa-web.pages.dev/`.
  - La aplicación carga instantáneamente sin pantalla de error de conexión.
- [ ] **7.3 Reproducción Offline de Videos y Metrónomo:**
  - Abrir la técnica *Habla Rítmica Silábica (STS)* y pulsar reproducir: el video MP4 y su audio se reproducen sin conexión.
  - El metrónomo Web Audio API funciona con tempo regular y respuesta sonora.

---

### Escenario 8: Tolerancia a Fallos y Error Boundary

*Objetivo:* Garantizar una experiencia empática que nunca deje al paciente frente a una pantalla en blanco.

- [ ] **8.1 Captura de Errores de Renderizado:**
  - Ante un fallo inesperado de un componente secundario, el `ErrorBoundary` clínico captura el error.
- [ ] **8.2 Mensaje Empático de Recuperación:**
  - Se presenta una tarjeta accesible con mensaje claro: "Ha ocurrido un contratiempo técnico, pero tu progreso está a salvo".
  - Se ofrece un botón visible "Reiniciar práctica" que restaura el estado sin pérdida de configuraciones locales.

---

## 4. Registro de Resultados del Evaluador

| Número de Prueba | Dispositivo / Navegador | Veredicto (Aprobado / Observaciones) | Firma / Fecha |
| :--- | :--- | :--- | :--- |
| **Prueba 01** | iPhone 14 Pro / iOS 17 (Safari PWA) |                                      |               |
| **Prueba 02** | Google Pixel 8 / Android 14 (Chrome) |                                      |               |
| **Prueba 03** | MacBook Pro / macOS (Chrome Desktop)|                                      |               |
| **Prueba 04** | Windows 11 PC (Edge / Firefox)      |                                      |               |

---

## 5. Criterio de Pase Final (Sign-Off Clínico)

Para declarar la versión 2.5.0 formalmente aceptada por el comité clínico, deben cumplirse el 100% de los escenarios críticos (Escenarios 1, 3, 4, 5 y 7).
