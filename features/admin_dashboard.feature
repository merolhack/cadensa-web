# language: es
Característica: Panel de Control Privado y Gobierno Clínico para Administradores
  Como administrador o director clínico de Cadensa
  Quiero acceder a un panel privado protegido con Zero Trust RLS
  Para consultar métricas de tráfico, auditar la lista de usuarios y moderar los reportes de calidad terapéutica

  Escenario: Acceso denegado a usuarios o visitantes sin privilegios
    Dado que un visitante o paciente sin privilegios administrativos intenta acceder a la ruta "/admin"
    Cuando el sistema evalúa sus credenciales con la política Zero Trust
    Entonces se debe denegar el acceso a los datos sensibles
    Y se debe mostrar la pantalla de acceso restringido con opción para autenticarse

  Escenario: Acceso autorizado a un administrador verificado
    Dado que un usuario con rol de "admin" inicia sesión en la plataforma
    Cuando ingresa al panel de control administrativo
    Entonces el sistema debe validar su pertenencia en la tabla "app_admins"
    Y debe mostrar el panel de control con los KPIs de usuarios, minutos y reportes

  Escenario: Moderación y actualización de reportes de calidad fonoaudiológica
    Dado que existen reportes de retroalimentación en estado "pending"
    Cuando el administrador revisa un reporte de falla y lo marca como "resolved"
    Entonces el estado del reporte debe actualizarse exitosamente en Supabase
    Y debe reflejarse en el contador de reportes resueltos

  Escenario: Visualización unificada de métricas de tráfico y motores de búsqueda
    Dado que el administrador consulta la pestaña de tráfico
    Entonces debe visualizar los datos consolidados de Google Analytics 4, Search Console y Bing
    Y debe poder auditar la distribución de usuarios por país
