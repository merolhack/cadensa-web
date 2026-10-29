# language: es
Característica: Evaluación de Diadococinesia Oral, AudioWorklet y Sincronización Cloud
  Como paciente con tartamudez o terapeuta del lenguaje
  Quiero evaluar la tasa motora articulatoria con secuencias /pa-ta-ka/, procesar audio a baja latencia y sincronizar mis frases
  Para medir la agilidad del habla y practicar de manera consistente en múltiples dispositivos

  Escenario: Evaluación exitosa de diadococinesia oral rápida con secuencia /pa-ta-ka/
    Dado que el paciente realiza una prueba de 10 segundos en la secuencia "pa-ta-ka"
    Y articula 52 sílabas con intervalos isocrónicos regulares
    Cuando el motor clínico foniátrico calcula los resultados de la prueba DDK
    Entonces la tasa motora articulatoria es mayor o igual a 5.0 sílabas por segundo
    Y la regularidad temporal se clasifica como "Muy Regular" con jitter menor o igual a 35 ms

  Escenario: Detección de fluctuaciones articulatorias y recomendación de metrónomo
    Dado que el paciente articula sílabas con alta dispersión e intervalos irregulares
    Cuando se evalúa la secuencia "ba-da-ga" durante 10 segundos
    Entonces la regularidad temporal se clasifica como "Disritmia / Irregular"
    Y la recomendación foniátrica sugiere afianzar la isocronía con metrónomo a tempo moderado

  Escenario: Informe fonoaudiológico imprimible incluye estimación de jitter vocal
    Dado que un paciente ha completado sesiones con precisión rítmica del 92%
    Cuando se genera el documento imprimible del informe fonoaudiológico
    Entonces el documento incluye la métrica de jitter vocal inter-silábico en milisegundos
    Y contiene las pautas foniátricas y la tabla de sesiones recientes

  Escenario: Sincronización multi-dispositivo de frases de desafío en la nube
    Dado que el usuario autenticado tiene 2 frases locales guardadas en su dispositivo
    Y existen 2 frases adicionales respaldadas en la nube en Supabase
    Cuando se ejecuta la sincronización multi-dispositivo
    Entonces el repertorio unificado contiene 4 frases sin duplicados
    Y el estado confirma la sincronización exitosa con la nube

