# language: es
Característica: Práctica Rápida en 1 Toque y Retos Diarios con Gamificación Fonoaudiológica

  Como persona que busca mejorar su fluidez verbal y apego terapéutico
  Quiero acceder a micro-sesiones guiadas de 60 segundos y retos diarios de ritmo
  Para mantener mi hábito de entrenamiento diario sin fricción técnica.

  Escenario: Acceso a la Práctica Rápida de 60 segundos desde el catálogo de inicio
    Dado que el usuario se encuentra en la pantalla de inicio de Cadensa
    Entonces se visualiza un botón de acción rápida para "Práctica Rápida (60s)"
    Y se visualiza un acceso directo para "Reto Diario"
    Y la píldora de racha y progreso diario es interactiva para ver los logros

  Escenario: Ejecución de la micro-sesión fonoaudiológica guiada de 60 segundos
    Dado que el usuario inicia la práctica rápida de 60 segundos
    Entonces se presenta una fase inicial de preparación diafragmática
    Y el metrónomo visual marca la cadencia rítmica silábica a 85 BPM
    Y al concluir la sesión se otorgan 25 puntos de experiencia XP y opción a práctica completa

  Escenario: Consulta y activación del Reto Diario con gamificación
    Dado que el usuario abre el modal del reto diario
    Entonces se muestra su racha activa de días consecutivos y puntos XP
    Y se listan las insignias y logros desbloqueables del sistema
    Y dispone de un botón directo para iniciar el reto fonoaudiológico de hoy
