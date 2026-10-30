# language: es
Característica: Observabilidad de Cliente y Telemetría de Errores Híbrida (GA4 y Supabase RLS)
  Como desarrollador y administrador clínico de Cadensa
  Quiero capturar y recibir telemetría inmediata de errores de JavaScript y fallas en botones
  Para resolver problemas técnicos de forma proactiva sin depender de que el usuario reporte la falla

  Escenario: Captura y reporte dual de un error funcional en la interfaz
    Dado que un usuario interactúa con la aplicación en su navegador
    Cuando ocurre una falla en el flujo de registro o interacción de un botón
    Entonces el sistema envía la excepción a Google Analytics 4 mediante el evento exception
    Y registra el error en la base de datos de Supabase con política Zero Trust RLS
    Y la telemetría falla silenciosamente sin interrumpir la experiencia del paciente

  Escenario: Deduplicación inteligente de errores de ejecución
    Dado que un componente de interfaz entra en un bucle de error recurrente
    Cuando se reportan errores con la misma firma en menos de 10 segundos
    Entonces el sistema descarta los duplicados para evitar saturación de red

