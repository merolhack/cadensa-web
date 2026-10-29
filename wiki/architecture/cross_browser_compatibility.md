# Compatibilidad Multi-Navegador y Arquitectura Cross-Browser en Cadensa

> **Resumen**: Estrategia de compatibilidad, degradación elegante y validación automatizada en los 3 motores web fundamentales: Chromium (Chrome, Edge, Opera), WebKit (Safari Desktop e iOS) y Gecko (Mozilla Firefox).

---

## 1. Matriz de Soporte de APIs Web en Cadensa

| Capacidad Técnica | Chrome / Edge / Opera (Chromium) | Safari macOS / iOS (WebKit) | Mozilla Firefox (Gecko) | Estrategia de Resiliencia en Cadensa |
| :--- | :--- | :--- | :--- | :--- |
| **Web Audio API & Metrónomo** | Nativo (AudioContext) | Nativo (Requiere toque) | Nativo (AudioContext) | Módulo `src/lib/audioUnlock.ts` que desbloquea el contexto en el primer evento de puntero/táctil (`pointerdown`/`touchstart`). |
| **AudioWorklet (< 5ms)** | Nativo | Nativo (versiones modernas) | Nativo | Fallback automático y transparente a `AnalyserNode` en el hilo principal (`audioWorkletHelper.ts`). |
| **Web Speech API** | Nativo (`webkitSpeechRecognition`) | Parcial / Nativo en iOS 14.5+ | Deshabilitado por defecto | Degradación elegante en `PhoneticRecognitionValidator.tsx` activando automáticamente el modo foniátrico por ritmo y VAD acústico. |
| **WebRTC DataChannel** | Nativo (E2EE) | Nativo | Nativo | Señalización manual por SDP en Base64 sin relay de terceros, garantizando privacidad absoluta fonoaudiólogo-paciente. |
| **Viewport Dinámico y Safe Areas** | Nativo | Soporte `100dvh` y `env(safe-area-inset-*)` | Nativo | Estilos Tailwind CSS v4 para evitar solapamientos con la barra de navegación táctil de iOS. |

---

## 2. Banner de Diagnóstico en Tiempo Real

El componente `src/components/BrowserCompatibilityBanner.tsx` detecta el entorno de ejecución en el cliente y proporciona:
1. Píldora de estado en la cabecera informando el nivel de compatibilidad (Óptimo / Compatible).
2. Modal accesible con la matriz detallada de capacidades.
3. Transparencia clínica hacia el paciente y el terapeuta.

---

## 3. Automatización de Pruebas con Playwright

La infraestructura E2E definida en `playwright.config.ts` valida la aplicación en 5 perfiles:
- `chromium`: Google Chrome y variantes.
- `firefox`: Motor Gecko nativo.
- `webkit`: Safari en macOS.
- `mobile-safari`: Emulación de iPhone 14 con motor WebKit móvil.
- `edge`: Microsoft Edge con canal dedicado.

Los tests utilizan flags de emulación de dispositivos multimedia (`--use-fake-device-for-media-stream` y `--use-fake-ui-for-media-stream`) para ejecutar pruebas de audio y VAD sin requerir micrófonos físicos en los entornos de integración continua.

