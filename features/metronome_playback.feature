# language: es
Característica: Control y Reproducción del Metrónomo de Audio
  Como usuario practicando el habla rítmica silábica (STS)
  Quiero iniciar, pausar y ajustar la velocidad del metrónomo
  Para entrenar con una referencia acústica constante y sin jitter

  Escenario: Inicio y parada del metrónomo
    Dado que el metrónomo está inicializado a 80 BPM
    Cuando el usuario inicia el metrónomo
    Entonces el estado de reproducción debe ser activo
    Cuando el usuario detiene el metrónomo
    Entonces el estado de reproducción debe ser inactivo

  Esquema del escenario: Ajuste dinámico de velocidad de entrenamiento
    Dado que el metrónomo está en velocidad inicial de 80 BPM
    Cuando el usuario cambia el tempo a <nuevo_bpm> BPM
    Entonces el tempo resultante debe ser <bpm_esperado> BPM

    Ejemplos:
      | nuevo_bpm | bpm_esperado |
      | 60        | 60           |
      | 95        | 95           |
      | 140       | 140          |
      | 25        | 40           |
      | 300       | 240          |

  Escenario: Silenciar y reactivar el pulso de audio
    Dado que el metrónomo está con audio habilitado
    Cuando el usuario activa el modo silencio
    Entonces el estado de silencio debe ser verdadero
    Cuando el usuario desactiva el modo silencio
    Entonces el estado de silencio debe ser falso
