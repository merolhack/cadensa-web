# language: es
Característica: Generación y Exportación de Informes Clínicos
  Como fonoaudiólogo o terapeuta del lenguaje
  Quiero acceder al resumen métrico de adherencia rítmica de las sesiones de Cadensa
  Para evaluar la evolución de la fluidez verbal y ajustar el plan terapéutico

  Escenario: Cálculo de resumen clínico tras múltiples sesiones de entrenamiento
    Dado que un paciente ha completado 3 sesiones con precisión promedio de 88%
    Y mantiene una racha activa de 5 días con 30 minutos acumulados
    Cuando el sistema genera el informe clínico de seguimiento
    Entonces el nivel de adherencia rítmica se clasifica como "Óptimo"
    Y el informe incluye recomendaciones para progresar el tempo hacia 95-100 BPM

  Escenario: Alerta clínica cuando la sincronización desciende por debajo de 70%
    Dado que un paciente ha registrado sesiones con precisión promedio de 64%
    Cuando se evalúa el nivel de adherencia rítmica
    Entonces el nivel se clasifica como "Requiere Refuerzo"
    Y se recomienda desacelerar el tempo hacia 65-70 BPM con ejercicios de diadococinesia
