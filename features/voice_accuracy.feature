# language: es
Característica: Evaluación de Precisión Rítmica de la Voz
  Como usuario entrenando con el metrónomo de Cadensa
  Quiero que la plataforma mida la sincronía entre mi emisión de voz y el pulso
  Para recibir retroalimentación objetiva sobre mi cadencia vocal

  Esquema del escenario: Clasificación de precisión según desfase temporal
    Dado que el metrónomo emite un pulso en el milisegundo <tiempo_pulso>
    Y el usuario emite una sílaba en el milisegundo <tiempo_voz>
    Cuando el sistema calcula la precisión rítmica
    Entonces la calificación debe ser "<calificacion>"
    Y el puntaje asignado debe ser <puntaje>

    Ejemplos:
      | tiempo_pulso | tiempo_voz | calificacion | puntaje |
      | 1000         | 1020       | perfect      | 100     |
      | 1000         | 960        | perfect      | 100     |
      | 1000         | 1090       | good         | 80      |
      | 1000         | 1200       | miss         | 40      |
