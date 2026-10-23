# language: es
Característica: Entrenamiento de Habla Rítmica Silábica (STS)
  Como persona que busca mejorar la fluidez de su habla
  Quiero que Cadensa calcule los intervalos de cadencia y valide los rangos terapéuticos
  Para practicar oraciones a un ritmo constante sin bloqueos

  Escenario: Cálculo de intervalo de pulso para cadencia terapéutica inicial
    Dado que el usuario configura una cadencia de 60 BPM
    Cuando el sistema calcula el intervalo entre pulsos
    Entonces el intervalo debe ser exactamente de 1000 milisegundos

  Escenario: Cálculo de duración total de una secuencia de sílabas
    Dado que el ejercicio contiene 4 sílabas
    Y la velocidad establecida es de 120 BPM
    Cuando el sistema calcula la duración total del ejercicio
    Entonces la duración calculada debe ser de 2000 milisegundos

  Esquema del escenario: Validación de límites clínicos recomendados
    Dado que un terapeuta o usuario ingresa una velocidad de <bpm> BPM
    Cuando el motor de cadencia evalúa si es una velocidad recomendada
    Entonces el resultado clínico debe ser "<resultado>"

    Ejemplos:
      | bpm | resultado |
      | 50  | false     |
      | 60  | true      |
      | 90  | true      |
      | 140 | true      |
      | 160 | true      |
      | 180 | false     |
