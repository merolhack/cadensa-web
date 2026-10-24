# language: es
Característica: Diferenciación Funcional de las Técnicas Clínicas
  Como fonoaudiólogo o persona con tartamudez
  Quiero que cada técnica fonoaudiológica active su propio tipo de ejercicio, botón de acción e interfaz
  Para no ejecutar un metrónomo rítmico rígido en técnicas que requieren rampa de sonido, control de presión o respiración

  Escenario: Técnica Habla Rítmica Silábica (STS) - Marcapasos isocrónico
    Dado que la técnica activa es "Habla Rítmica Silábica (STS)"
    Entonces la técnica se clasifica como rítmica con metrónomo activo
    Y el botón de acción principal indica "Comenzar Práctica Rítmica"
    Y la tarjeta clínica 01 expone el mecanismo de "Isocronía"

  Escenario: Técnica Inicio Vocal Suave (Easy Onset) - Rampa fono-respiratoria
    Dado que la técnica activa es "Inicio Vocal Suave (Easy Onset)"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Iniciar Rampa de Inicio Suave"
    Y la categoría recomendada de práctica se enfoca en "vocales"
    Y la tarjeta clínica 01 expone "Ataque Glótico Suave"

  Escenario: Técnica Contacto Articular Suave (Light Contact) - Tacto pluma en oclusivas
    Dado que la técnica activa es "Contacto Articular Suave (Light Contact)"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Iniciar Práctica de Contacto Pluma"
    Y la categoría recomendada de práctica se enfoca en "diadococinesia"
    Y la tarjeta clínica 01 expone "Contacto Articular Ligero"

  Escenario: Técnica Habla Prolongada - Ligado continuo y estiramiento vocálico
    Dado que la técnica activa es "Habla Prolongada y Fonación Continua"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Iniciar Fonación Continua (Legato)"
    Y la tarjeta clínica 01 expone "Fonación Continua"

  Escenario: Técnica Respiración Diafragmática (Box Breathing) - Regulación autonómica 4-4-4-4
    Dado que la técnica activa es "Respiración Diafragmática (Box Breathing)"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Iniciar Ciclo de Respiración 4-4-4-4"
    Y la tarjeta clínica 01 expone "Calma Neurovegetativa"

  Escenario: Técnica Salida Suave del Bloqueo (Pull-Out) - Desactivación del espasmo
    Dado que la técnica activa es "Salida Suave del Bloqueo (Pull-Out)"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Simular y Desactivar Bloqueo (Pull-Out)"
    Y la tarjeta clínica 01 expone "Control en Bloqueo"

  Escenario: Técnica Cancelación Post-Bloqueo - Pausa reflexiva de 3 segundos
    Dado que la técnica activa es "Cancelación y Pausa Consciente (Cancellation)"
    Entonces la técnica no utiliza metrónomo rítmico rígido
    Y el botón de acción principal indica "Iniciar Protocolo de Cancelación (3s)"
    Y la tarjeta clínica 01 expone "Post-Bloqueo"
