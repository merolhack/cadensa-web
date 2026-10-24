# language: es
Característica: Menú Modular de Técnicas Clínicas y Modalidad Easy Onset
  Como persona que tartamudea o terapeuta del lenguaje
  Quiero navegar entre diferentes técnicas fonoaudiológicas agrupadas por familias terapéuticas
  Para entrenar el Inicio Vocal Suave, Contacto Ligero, Habla Prolongada y consultar el FAQ especializado de cada una

  Escenario: Apertura del Menú Modular y visualización de familias clínicas
    Dado que el usuario se encuentra en la pantalla principal de Cadensa
    Cuando abre el menú modular de técnicas desde la barra superior
    Entonces se despliegan las 3 familias fonoaudiológicas: Modelado de Fluidez, Control Fisiológico y Modificación de Bloqueos
    Y puede visualizar cada técnica con su icono, nivel de dificultad y objetivo clínico

  Escenario: Activación de la técnica Inicio Vocal Suave (Easy Onset)
    Dado que el usuario tiene dificultad con el ataque glótico duro en palabras con vocal
    Cuando selecciona la técnica "Inicio Vocal Suave (Easy Onset)"
    Entonces el área de práctica activa la rampa visual de fonación progresiva
    Y el sistema guía una aspiración suave previa antes de alcanzar la voz plena

  Escenario: Consulta de FAQ y fundamento clínico especializado por técnica
    Dado que el usuario desea aprender cómo aplicar la técnica Contacto Articular Suave
    Cuando selecciona la pestaña de la técnica en la sección FAQ
    Entonces visualiza las instrucciones prácticas paso a paso
    Y tiene acceso a las respuestas sobre reducción de presión en consonantes oclusivas
