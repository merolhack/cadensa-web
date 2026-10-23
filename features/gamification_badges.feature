# language: es
Característica: Gamificación, Logros y Títulos de Fluidez
  Como usuario entrenando en Cadensa
  Quiero acumular puntos de experiencia (XP) y desbloquear insignias
  Para mantenerme motivado en mi terapia diaria del habla

  Esquema del escenario: Asignación de nivel según experiencia acumulada
    Dado que el usuario tiene acumulados <xp> puntos de experiencia
    Cuando el sistema consulta el título de nivel
    Entonces el título debe ser "<titulo_esperado>"

    Ejemplos:
      | xp   | titulo_esperado       |
      | 100  | Iniciado en Cadencia  |
      | 350  | Entrenador Constante  |
      | 700  | Hablante Fluido       |
      | 1500 | Maestro del Ritmo     |

  Escenario: Desbloqueo de insignias por racha de 3 días
    Dado que el usuario alcanza una racha de 3 días y 10 minutos acumulados
    Cuando se evalúan las insignias desbloqueadas
    Entonces la insignia "Hábito en Marcha" debe estar desbloqueada
    Y la insignia "Primer Pulso" debe estar desbloqueada
