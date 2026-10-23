# language: es
Característica: Persistencia de Sesiones y Rachas de Entrenamiento
  Como persona que entrena diariamente su fluidez vocal
  Quiero que Cadensa registre mis minutos de práctica y actualice mi racha
  Para mantener la constancia clínica y consolidar la neuroplasticidad

  Escenario: Registro de primera sesión de entrenamiento
    Dado que el usuario completa un ejercicio de 12 sílabas a 80 BPM
    Y la duración fue de 60 segundos con precisión de 98%
    Cuando se guarda la sesión de entrenamiento
    Entonces el registro debe ser guardado exitosamente
    Y la racha del usuario debe iniciar en 1 día

  Esquema del escenario: Cálculo de racha consecutiva diaria
    Dado que la última sesión registrada fue "<dias_atras>"
    Cuando el sistema evalúa la racha con el entrenamiento de hoy
    Entonces el estado de incremento debe ser "<incremento>"
    Y el estado de reinicio debe ser "<reinicio>"

    Ejemplos:
      | dias_atras | incremento | reinicio |
      | hoy        | false      | false    |
      | ayer       | true       | false    |
      | tres_dias  | true       | true     |
