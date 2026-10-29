# Retroalimentación Auditiva Alterada (DAF / FAF) en Cadensa

## 1. Fundamento Clínico y Fonoaudiológico
La **Retroalimentación Auditiva Alterada** (*Altered Auditory Feedback* - AAF) comprende dos modalidades bioacústicas de intervención directa sobre el bucle sensoriomotor auditivo-fonatorio:

1. **DAF (Delayed Auditory Feedback):** Retardo artificial controlado (entre 50 ms y 200 ms) entre la fonación del hablante y su recepción por vía aérea en los auriculares.
2. **FAF (Frequency-Altered Feedback):** Desplazamiento del tono fundamental vocal (frecuencia F0) en ±1 a ±4 semitonos.

### Mecanismo Neurobiológico del "Efecto Coro"
En personas que tartamudean (PQT), existe una desincronización funcional o sobrecarga en los circuitos estriatopalidales (ganglios basales) y la corteza motora del habla. Al introducir DAF/FAF:
- Se induce el fenómeno del *habla en coro* (choral speech effect), simulando que otra persona habla al unísono con el paciente.
- Se desacopla la dependencia excesiva de la propiocepción laríngea hiperreactiva.
- Se reduce de forma inmediata y no farmacológica la frecuencia de espasmos, bloqueos y repeticiones involuntarias en hasta un 60-80% durante la lectura o monólogo guiado.

## 2. Implementación de Audio en Cadensa
El procesador `AlteredAuditoryProcessor` implementa la cadena de nodos sobre Web Audio API:

```
MediaStream (Micrófono) 
  → DelayNode (50 ms a 200 ms) 
  → BiquadFilterNode (Modulación FAF paramétrica) 
  → GainNode (Control de volumen y seguridad acústica ≤ 0.8) 
  → audioCtx.destination (Auriculares estéreo)
```

### Parámetros Foniátricos
- **Retardo óptimo:** 70-80 ms para ritmo conversacional; 100-150 ms para reducción severa de bloqueos iniciales.
- **Tono FAF:** -1 semitono para evitar fatiga perceptual y emular timbre armónico de acompañamiento.

## 3. Seguridad Acústica y Privacidad Zero Trust
- **Uso obligatorio de auriculares:** El audio retrasado retroalimentado al altavoz sin auriculares produciría un ciclo de retroalimentación o acople acústico de alta ganancia. La interfaz de usuario bloquea o advierte explícitamente al paciente.
- **Procesamiento estrictamente local (Zero Trust):** Los búferes de audio PCM circulan únicamente en la memoria local del hilo de audio del navegador; ningún frame de voz es subido a servidores remotos ni almacenado en bases de datos.
