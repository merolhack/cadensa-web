# language: es
Característica: Validación en Ambiente Productivo Real (cadensa-web.pages.dev)
  Como equipo clínico y de operaciones de Cadensa
  Quiero ejecutar pruebas de simulación de usuario real directamente en el ambiente desplegado en Cloudflare Pages
  Para verificar la disponibilidad de GA4, la integridad de Google OAuth y el registro forense en Supabase

  Escenario: Simulación de paciente real en producción con captura dual de telemetría
    Dado que un paciente navega al portal productivo "https://cadensa-web.pages.dev"
    Cuando la interfaz carga la biblioteca de Google Analytics 4 con identificador "G-HCTT9146TJ"
    Y se verifica la disponibilidad del modal de acceso con Google OAuth 2.0
    Entonces el despachador de observabilidad registra eventos en la base de datos de Supabase
    Y las excepciones y métricas quedan disponibles para auditoría clínica
