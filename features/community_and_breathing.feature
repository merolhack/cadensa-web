# language: es
Característica: Vinculación comunitaria AMTTM y herramientas de control orofacial y respiratorio
  Como persona que tartamudea o terapeuta del lenguaje
  Quiero acceder al apoyo de la comunidad AMTTM, ejercitar mi respiración diafragmática y ajustar compases
  Para tener una terapia integral que reduzca la ansiedad y promueva la fluidez del habla

  Escenario: Acceso al banner de apoyo comunitario de la AMTTM
    Dado que un usuario ingresa a Cadensa en busca de apoyo integral
    Cuando visualiza la sección inferior de la aplicación antes del pie de página
    Entonces se presenta un banner con enlace seguro hacia la "Asociación Mexicana de Tartamudez"
    Y el enlace apunta al grupo oficial de Facebook con rel noopener noreferrer
    Y el banner incluye el enlace al canal oficial de YouTube de la AMTTM

  Escenario: Inicio de sesión de respiración diafragmática 4-4-4-4
    Dado que el usuario siente tensión o bloqueo antes de hablar
    Cuando activa el marcapasos de respiración diafragmática
    Entonces el sistema inicia el ciclo en fase de inhalación durante 4 segundos
    Y continúa la secuencia hacia retener, exhalar y pausa

  Escenario: Activación del desafío de atenuación de ritmo (fading)
    Dado que el usuario domina el seguimiento con metrónomo sonoro
    Cuando activa el desafío de ritmo interno
    Entonces el metrónomo programa compases audibles seguidos de compases de silencio
    Y el usuario mantiene el ritmo de dicción internamente

  Escenario: Selección de compás musical y timbre sintético
    Dado que el terapeuta indica practicar con un compás de 3/4
    Cuando el usuario selecciona compás "3/4" y timbre "madera"
    Entonces el motor de metrónomo genera acentos rítmicos cada 3 pulsos con timbre de madera
