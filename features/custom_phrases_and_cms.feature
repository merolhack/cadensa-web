# language: es
Característica: Frases Personalizadas, Auto-Escucha, CMS y Exportación CSV
  Como paciente y administrador de Cadensa
  Quiero personalizar mis frases de desafío, grabar mi voz localmente para auto-escucha,
  administrar ejercicios desde el CMS y exportar datos a CSV
  Para optimizar el tratamiento fonoaudiológico y el gobierno clínico

  Escenario: Silabación fonoaudiológica de una frase de desafío personalizada
    Dado que un paciente ingresa la frase personal "Quiero pedir un café con leche"
    Cuando el motor silábico procesa la oración para habla rítmica STS
    Entonces se debe desglosar en sílabas fonéticas válidas
    Y debe permitir persistir la frase en el almacenamiento local del dispositivo

  Escenario: Grabación y auto-escucha local con privacidad Zero Trust
    Dado que un paciente está en la estación de práctica rítmica
    Cuando inicia la grabación de auto-escucha de su voz
    Entonces el audio debe capturarse en memoria local sin enviarse a ningún servidor
    Y el paciente debe poder reproducir su propia voz para retroalimentación propioceptiva

  Escenario: Administración de ejercicios clínicos en el CMS de Supabase
    Dado que un administrador autenticado desea agregar un nuevo ejercicio
    Cuando registra la frase "Respiración tranquila y pausada" con 70 BPM en el CMS
    Entonces la función createAdminExercise debe procesar la inserción
    Y el ejercicio debe quedar disponible para la práctica de los pacientes

  Escenario: Exportación de reportes de calidad clínica y directorio de usuarios a CSV
    Dado que existen reportes de calidad y usuarios registrados en la plataforma
    Cuando el administrador solicita la exportación en formato CSV
    Entonces se debe generar un archivo con encabezados estructurados
    Y debe contener los campos de diagnóstico, adherencia y fechas correspondientes

  Escenario: Disponibilidad de instalación PWA offline
    Dado que un usuario ingresa a Cadensa desde un navegador compatible
    Cuando la plataforma ofrece la instalación como Progressive Web App
    Entonces el botón de instalación debe estar accesible en la interfaz
