# language: es
Característica: Simplificación de Interfaz Tipo Duolingo y Componentes Ergonómicos
  Como usuario, niño o paciente con ansiedad articulatoria
  Quiero una interfaz visualmente limpia, intuitiva y libre de sobrecarga cognitiva
  Para entrenar mi fluidez del habla sin distracciones mediante divulgación, colapsables y toggles

  Escenario: Acceso directo y jerarquía visual limpia en la página principal
    Dado que el usuario accede a la página de inicio de Cadensa con diseño simplificado
    Entonces se presenta un llamado a la acción principal para "Comenzar Práctica Guiada Directa"
    Y se ofrece el acceso directo a "Cadensa Kids" para el público infantil
    Y el laboratorio clínico y sus 9 módulos especializados se agrupan en un panel colapsable

  Escenario: Divulgación progresiva de fundamentos clínicos en las tarjetas de técnicas
    Dado que el usuario explora las tarjetas de técnicas clínicas en el catálogo
    Entonces cada tarjeta dispone de un componente Disclosure para "Fundamento Clínico y Objetivo"
    Y los detalles neurobiológicos se muestran bajo demanda sin saturar la vista inicial

  Escenario: Estación de práctica limpia con panel de ajustes colapsable y toggles
    Dado que el usuario ingresa a la estación de entrenamiento rítmico
    Entonces los controles de tempo y timbres se organizan dentro de un panel Collapsible
    Y se dispone de interruptores Toggle para el sonido acústico, vibración háptica y reto de silencio
    Y las herramientas de auto-escucha y validación fonética se presentan en su contenedor ergonómico

