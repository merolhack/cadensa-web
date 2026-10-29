# language: es
Característica: Hitos Clínicos Avanzados: Validador Fonético, Biofeedback de Formantes, Telesalud P2P y Fluidez Pediátrica
  Como terapeuta del lenguaje, fonoaudiólogo o paciente
  Quiero disponer de herramientas de precisión fonética, análisis de formantes, telepráctica cifrada y entrenamiento lúdico infantil
  Para lograr una evaluación integral y personalizada de la fluidez del habla

  Escenario: Validación fonética on-device de la emisión acústica del paciente
    Dado que la frase objetivo es "Camino despacio cada mañana"
    Cuando el paciente pronuncia la oración completa con articulación precisa
    Entonces el validador fonético calcula un porcentaje de coincidencia mayor o igual a 90%
    Y confirma que la articulación fonética es óptima

  Escenario: Biofeedback visual de formantes F1 y F2 en el cuadrilátero vocálico
    Dado que el paciente vocaliza con formante F1 en 800 Hz y formante F2 en 1350 Hz
    Cuando el analizador acústico evalúa la posición del tracto vocal
    Entonces clasifica la vocal acústica más cercana como "a"
    Y determina que la apertura mandibular es "Abierta" con posición lingual "Central"

  Escenario: Sesión de telesalud fonoaudiológica P2P con metrónomo sincronizado
    Dado que el fonoaudiólogo inicia una sala de telepráctica P2P
    Y emite un pulso de metrónomo a 85 BPM para el paciente
    Cuando el mensaje de sincronización es transmitido por el canal de datos
    Entonces el paciente recibe el pulso rítmico en tiempo real con latencia menor a 50 ms

  Escenario: Módulo pediátrico de fluidez con Tortuga Zen y asignación de estrellas
    Dado que un niño selecciona al avatar "Tortuga Zen" para hablar despacito
    Cuando completa un desafío infantil de habla suave con 90% de precisión rítmica
    Entonces recibe 3 estrellas y un mensaje de felicitación positivo

