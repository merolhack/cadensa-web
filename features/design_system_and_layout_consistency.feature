# language: es
Característica: Coherencia Estricta de Diseño, Arquitectura de Rejilla Bootstrap y Accesibilidad
  Como desarrollador, auditor de calidad o agente de IA en Cadensa
  Quiero que todos los nuevos componentes, vistas y elementos respeten rigurosamente las reglas del Design System
  Para garantizar simetría geométrica, altura uniforme en tarjetas, cero saltos de diseño (CLS = 0) y accesibilidad WCAG 2.1 AA

  Escenario: Contenedor maestro canónico unificado en todas las vistas principales
    Dado que se evalúa la arquitectura de contención de la aplicación Cadensa
    Entonces todas las vistas principales y de navegación deben usar el ancho maestro canónico "max-w-5xl"
    Y ninguna vista principal debe presentar saltos de diseño horizontal al alternar entre inicio y práctica
    Y el pie de página global debe alinearse exactamente con el marco perimetral maestro

  Escenario: Patrón de altura uniforme y anclaje inferior de acciones en rejillas multi-columna
    Dado que se analizan las rejillas de tarjetas en el catálogo, práctica y logros
    Entonces los contenedores de rejilla deben utilizar alineación elástica "items-stretch"
    Y cada tarjeta debe implementar la clase de altura uniforme "h-full flex flex-col justify-between"
    Y las barras de botones y acciones finales deben anclarse al fondo con "mt-auto"

  Escenario: Prohibición estricta de clases de ancho desalineadas en el código fuente
    Dado que se audita el árbol de componentes en "src"
    Entonces no debe existir ninguna ocurrencia de la clase desalineada "max-w-4xl" en archivos TSX de componentes y páginas
    Y los componentes interactivos en "src/components" deben declarar la directiva "use client"

  Escenario: Relaciones de aspecto uniformes para medios y elementos gráficos
    Dado que se inspeccionan las tarjetas con videos y los elementos de avatar u orbes
    Entonces las miniaturas de video deben fijar la relación de aspecto panorámica "aspect-video"
    Y los avatares, orbes e insignias circulares deben fijar proporciones simétricas cuadradas

  Escenario: Accesibilidad ergonómica obligatoria y estados semánticos válidos
    Dado que se auditan los botones y controles interactivos de la plataforma
    Entonces cada botón interactivo debe contar con un área táctil ergonómica mínima y etiqueta accesible
    Y los botones de alternancia en barras de navegación sin tablist deben usar "aria-pressed"
    Y no deben existir violaciones estructurales de accesibilidad WCAG 2.1 AA
