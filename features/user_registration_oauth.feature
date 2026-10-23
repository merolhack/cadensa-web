# language: es
Característica: Registro de Usuarios y Autenticación con OAuth y Soft Confirmation
  Como persona que busca mejorar su fluidez verbal
  Quiero acceder de inmediato a los ejercicios rítmicos sin bloqueos estrictos de correo
  Y poder sincronizar mis sesiones con Google o enlace mágico para mantener mi racha diaria

  Escenario: Acceso con política de registro suave (Soft Confirmation)
    Dado que un usuario nuevo ingresa a Cadensa por primera vez
    Cuando decide iniciar sesión o registrar su cuenta
    Entonces el sistema le permite practicar de inmediato sin exigir confirmación previa de correo
    Y sus sesiones se respaldan localmente en el dispositivo

  Escenario: Inicio de sesión asistido con proveedor OAuth
    Dado que un usuario prefiere no recordar contraseñas
    Cuando selecciona la opción "Continuar con Google"
    Entonces el sistema inicia el flujo de autenticación delegada hacia Supabase Auth
    Y redirige al usuario para sincronizar su perfil en la nube
