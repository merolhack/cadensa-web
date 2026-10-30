# Detección Acústica On-Device de Bloqueos Tónicos y Disfluencias

> **Módulo**: [`src/lib/acousticBlockDetector.ts`](file:///home/merolhack/fl/cadensa-web/src/lib/acousticBlockDetector.ts)  
> **Área**: Fonoaudiología Computacional y Procesamiento de Señales de Audio en Tiempo Real  
> **Cumplimiento**: Zero Trust (100% On-Device, cero transferencia de audio a la nube)

---

## 1. Fundamentos Clínicos

En personas con tartamudez o disfemia, los eventos de habla espasmódica se dividen clínicamente en:

1. **Bloqueos Tónicos (Tonic Blocks)**:
   - Contracción espasmódica sostenida de la musculatura laríngea o glótica.
   - El paciente intenta activamente emitir sonido, pero se produce un silencio tenso por encima de 350 ms debido a la oclusión completa del flujo aéreo.
   - **Estrategia Terapéutica**: Inicio suave (Easy Onset) y reducción de presión subglótica.

2. **Prolongaciones Involuntarias (Prolongations)**:
   - Mantenimiento anormal de la fonación de un sonido vocálico o fricativo (/s/, /a/, /m/) por más de 300 ms con baja varianza espectral.
   - **Estrategia Terapéutica**: Transición rítmica regular mediante metrónomo.

3. **Repeticiones Clónicas (Clonic Bursts)**:
   - Ráfagas consecutivas rápidas del inicio de la sílaba en intervalos menores a 220 ms.
   - **Estrategia Terapéutica**: Habla Rítmica Silábica (STS).

---

## 2. Algoritmo y Extracción Acústica

El analizador procesa ventanas temporales PCM de audio a través de los siguientes descriptores:

- **Root Mean Square (RMS Energy)**: Nivel energético continuo de la señal para discriminar entre silencio y emisión sonora activa (`isVoiced`).
- **Zero Crossing Rate (ZCR)**: Tasa de cruce por cero para distinguir entre fricativas no sonoras y vocales sonoras.
- **Varianza Espectral de Energía**: Detecta el congelamiento acústico característico de la prolongación.
- **Detector de Intervalo Inter-Pulso**: Detecta ráfagas repetitivas para la clasificación de repeticiones clónicas.

