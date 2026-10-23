# language: es
Característica: Motor Fonético de Silabeo para Entrenamiento del Habla
  Como persona en entrenamiento de habla rítmica silábica (STS)
  Quiero que Cadensa divida palabras y oraciones en sílabas ortográficas exactas
  Para poder pronunciar cada sílaba en sincronía con el pulso del metrónomo

  Esquema del escenario: Silabeo de palabras clínicas y complejas
    Dado que el usuario tiene la palabra "<palabra>"
    Cuando el motor fonético procesa la palabra
    Entonces debe dividirse en <conteo> sílabas
    Y la representación silábica unida con guiones debe ser "<silabeo>"

    Ejemplos:
      | palabra       | conteo | silabeo              |
      | cadencia      | 3      | ca-den-cia           |
      | ritmo         | 2      | rit-mo               |
      | comunicación  | 5      | co-mu-ni-ca-ción     |
      | poeta         | 3      | po-e-ta              |
      | transporte    | 3      | trans-por-te         |
      | biología      | 4      | bio-lo-gí-a          |

  Escenario: Aplanado de una oración en una secuencia rítmica de sílabas
    Dado que el usuario selecciona la frase "Cadensa es ritmo"
    Cuando el sistema segmenta la frase completa
    Entonces se debe generar una secuencia ordenada de 6 sílabas
    Y la primera sílaba debe ser "ca"
    Y la última sílaba debe ser "mo"
