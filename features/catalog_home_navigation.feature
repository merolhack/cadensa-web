# language: es
Característica: Navegación de Página de Inicio, Catálogo de Técnicas y Modal de Video
  Como persona con tartamudez o profesional fonoaudiólogo
  Quiero explorar un catálogo visual con las 7 técnicas, ver sus videos explicativos y navegar fluidamente entre el catálogo y la estación de entrenamiento
  Para seleccionar la intervención adecuada antes de iniciar la práctica guiada

  Escenario: Visualización del catálogo completo de técnicas en la página de inicio
    Dado que el usuario accede a la página principal de Cadensa
    Entonces se debe presentar el catálogo con 7 tarjetas de técnicas clínicas
    Y deben estar disponibles los filtros por familia terapéutica
    Y cada tarjeta debe incluir opciones para "Ver Video" y "Entrenar"

  Escenario: Acceso directo a la práctica y botón de retorno al catálogo
    Dado que el usuario navega a la estación de práctica de una técnica
    Entonces la interfaz de práctica debe mostrar el botón de navegación "Inicio"
    Y debe contar con un botón "Video" para consultar la guía audiovisual técnica en cualquier momento

  Escenario: Apertura del modal de video técnico
    Dado que el usuario solicita ver el video explicativo de una técnica clínica
    Entonces el sistema debe desplegar el modal interactivo de video con el protocolo fisiológico
    Y debe permitir comenzar el entrenamiento directamente desde el modal
