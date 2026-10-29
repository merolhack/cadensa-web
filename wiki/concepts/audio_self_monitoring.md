# Auto-Escucha Fonoaudiológica y Monitor Propioceptivo

## 1. Fundamento Clínico: La Retroalimentación Auditiva Diferida

Uno de los principales desafíos en el habla disfluente es la retroalimentación sensorial (*auditory-motor integration*). Durante un bloqueo o emisión acelerada, el paciente a menudo carece de conciencia propioceptiva en tiempo real sobre la tensión laríngea y la velocidad silábica.

La técnica de **Auto-Escucha Diferida (Self-Monitoring)** permite al paciente:
1. Hablar al compás del metrónomo visual o sonoro.
2. Grabar su voz en tiempo real durante la práctica.
3. Escuchar su propia emisión inmediatamente después de terminar para autoevaluar la regularidad rítmica, la suavidad articulatoria y la presencia de bloqueos.

---

## 2. Implementación Técnica en Navegador

El componente `AudioSelfMonitor` (`src/components/AudioSelfMonitor.tsx`) aprovecha las APIs estándar del navegador:

```
[ Micrófono del Paciente ] 
            │
            ▼ (navigator.mediaDevices.getUserMedia)
[ MediaRecorder API ] 
            │
            ▼ (ondataavailable: chunks de audio WebM)
[ Blob Local en Memoria ] 
            │
            ▼ (URL.createObjectURL)
[ Reproductor HTMLAudioElement ]
```

### Ciclo de Vida:
- **Inicio de Grabación:** Solicita permisos de micrófono de forma explícita y activa el cronómetro con indicador visual pulsante.
- **Detención:** Invoca `MediaRecorder.stop()`, detiene los tracks activos del micrófono (`stream.getTracks().forEach(t => t.stop())`) para apagar el indicador de hardware del dispositivo.
- **Reproducción y Descarte:** Se genera una URL de objeto en memoria (`blob:...`) que se libera mediante `URL.revokeObjectURL()` al descartar o grabar una nueva muestra.

---

## 3. Garantía de Privacidad Zero Trust

> [!IMPORTANT]
> **Aislamiento en Memoria:** Ningún byte de voz o audio grabado por el paciente es transmitido a Supabase, Cloudflare ni a ningún servicio de telemetría de terceros. Todo el ciclo de vida del audio reside exclusivamente en la memoria RAM del navegador.

