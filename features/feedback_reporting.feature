# language: es
Característica: Sistema de Retroalimentación Comunitaria y Reporte de Errores
  Como paciente, terapeuta o visitante de Cadensa
  Quiero enviar comentarios o reportar fallas en los videos y técnicas sin fricción
  Para que el equipo clínico y de desarrollo pueda mejorar continuamente la calidad del entrenamiento

  Escenario: Envío de reporte de falla en video por un visitante anónimo
    Dado que un visitante experimenta una falla en la reproducción de un video demostrativo
    Cuando abre el formulario de reporte de problemas
    Y describe el fallo con al menos 10 caracteres
    Entonces el sistema debe permitir el envío sin forzar un registro de cuenta previo
    Y debe clasificar el incidente en la categoría "video_issue"

  Escenario: Envío de duda técnica por un usuario registrado
    Dado que un usuario registrado detecta una duda sobre la técnica "easy_onset"
    Cuando redacta su observación para el equipo fonoaudiológico
    Entonces el reporte debe asociar su identidad de sesión
    Y la base de datos debe almacenar el estado inicial como "pending"

  Escenario: Rechazo de spam y validación de seguridad de datos
    Dado que un intento de envío contiene un mensaje de menos de 10 caracteres
    Entonces el servicio debe rechazar el reporte indicando la longitud mínima requerida
    Y si un bot automatizado llena el campo trampa honeypot debe ser neutralizado con éxito simulado

  Escenario: Protección de cuota contra saturación en cliente
    Dado que un usuario realiza múltiples envíos en una ventana de 1 hora
    Cuando intenta superar el límite máximo de 3 reportes
    Entonces el sistema debe aplicar rate limiting indicando el tiempo de espera restante
