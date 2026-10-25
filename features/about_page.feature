# language: es
Característica: Navegación y Contenido de la Página Acerca de (About US)
  Como usuario, fonoaudiólogo o colaborador del proyecto Cadensa
  Quiero acceder a la página "Acerca de" para comprender el propósito clínico del sitio, consultar la hoja de ruta (ROADMAP) y conocer el perfil del autor
  Para entender la fundamentación del método STS, los futuros pasos del producto y sus referencias técnicas

  Escenario: Acceso y visualización de la página Acerca de
    Dado que el usuario navega a la página Acerca de
    Entonces se debe mostrar el título principal "Propósito, Futuros Pasos y Liderazgo Técnico"
    Y se deben detallar los pilares clínicos del método Habla Rítmica Silábica (STS)
    Y se debe presentar la sección de hitos completados y futuros pasos del roadmap

  Escenario: Consulta de referencias del autor
    Dado que el usuario consulta la información del autor en la página Acerca de
    Entonces se debe mostrar el nombre del autor "Lenin Meza"
    Y debe contar con un enlace directo a su página en GitHub Pages "https://merolhack.github.io"
    Y debe contar con un enlace directo a su perfil de LinkedIn "http://www.linkedin.com/in/leninmezazarco"
    Y debe contar con un enlace a su repositorio en GitHub "https://github.com/merolhack"

  Escenario: Regla de sincronización de TODO y ROADMAP
    Dado que el usuario revisa la hoja de ruta en la página Acerca de
    Entonces se debe indicar la regla de sincronización mandatoria con el ROADMAP y LLM Wiki
