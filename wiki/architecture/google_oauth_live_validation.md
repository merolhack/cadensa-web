# Validación en Vivo de Google OAuth 2.0 y Adopción de Sesiones — Cadensa

> **Documento Canónico de Integración y Pruebas Reales de Autenticación**  
> Última actualización: 2026-10-29  
> Contexto: Verificación E2E sin mocks de Google Identity Platform (GCP `cadensa-web-dev`), Supabase Auth Gateway y adopción de datos locales (`claimLocalSessions`).

---

## 1. Contexto y Desafío de Pruebas "Sin Mocks"

Al implementar flujos de identidad federada de terceros como Google OAuth 2.0 en aplicaciones web de grado clínico:
1. **Detección Anti-Bot de Google:** Google bloquea navegadores headless desatendidos (*Puppeteer/Playwright* sin perfil persistente) cuando intentan escribir credenciales en `accounts.google.com`, impidiendo pruebas E2E 100% ciegas con usuario y contraseña.
2. **Requisito de Cero Mocks:** Para garantizar que el despliegue a producción en Cloudflare Pages funcione a la primera, la integración entre GCP, Supabase y el SPA estático debe verificarse contra los endpoints vivos reales.

---

## 2. Las 3 Estrategias de Validación sin Mocks

### Estrategia A: Verificación Pre-Vuelo de Handshake Real (Supabase ➔ Google)
- **Script:** `scripts/verify_google_oauth_live.cjs`.
- **Mecanismo:** 
  1. Invoca `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'http://localhost:3000', skipBrowserRedirect: true } })`.
  2. Obtiene la URL intermedia de autorización en Supabase Auth Edge (`https://kddeejyhnxrnmkmiwjxp.supabase.co/auth/v1/authorize`).
  3. Ejecuta una petición HTTP en vivo hacia esa URL inspeccionando la respuesta `HTTP 302 Found` y la cabecera `Location`.
  4. Valida en la URL devuelta por Google Accounts:
     - `client_id`: Coincidencia exacta con `GOOGLE_CLIENT_ID` de `.env` (`1014778372980-ff8dp5c48nss88745u0r70nsn7ovob2a.apps.googleusercontent.com`).
     - `redirect_uri`: `https://kddeejyhnxrnmkmiwjxp.supabase.co/auth/v1/callback`.
     - `response_type`: `code` (PKCE Flow).
     - `scope`: `email+profile`.
- **Resultado:** ✅ **Éxito Total (100% vivo sin mocks).**

---

### Estrategia B: Simulación E2E con Playwright (`e2e/google_oauth_simulation.spec.ts`)
- **Mecanismo:**
  1. Carga `localStorage` con sesiones de práctica previas en modo invitado (`userId: 'local_guest'`).
  2. Simula la apertura de `AuthModal` y la presencia del botón *"Continuar con Google"*.
  3. Ejecuta el ciclo de vida del evento `SIGNED_IN` emitido por el cliente `@supabase/supabase-js`.
  4. Valida la ejecución del algoritmo `claimLocalSessions`: transformación automática de las sesiones de `local_guest` hacia el UUID `user_id` del usuario autenticado.
- **Resultado:** ✅ Integrado y validado en la suite E2E de Playwright.

---

### Estrategia C: Validación Manual Guiada en Navegador
- **Mecanismo:**
  1. Ejecución de `npm run dev`.
  2. Entrenamiento de 15 segundos en la estación de práctica como invitado (sin cuenta).
  3. Clic en **👤 Iniciar Sesión ➔ Continuar con Google**.
  4. Selección de la cuenta en `accounts.google.com`.
  5. Retorno a `http://localhost:3000/#access_token=...` y confirmación de:
     - Cambio en UI a avatar / nombre del usuario autenticado.
     - `localStorage`: creación de `cadensa_user_id` y `cadensa_user_email`.
     - Inserción en vivo en la tabla PostgreSQL `public.training_sessions`.

---

## 3. Algoritmo de Adopción de Sesiones Huérfanas (`claimLocalSessions`)

Ubicado en `src/lib/trainingService.ts`:

```typescript
export async function claimLocalSessions(userId: string, client = supabase) {
  // 1. Lee sesiones en localStorage
  // 2. Filtra sesiones con userId 'local_guest' o sin asignar
  // 3. Inserta en bloque hacia Supabase: public.training_sessions
  // 4. Actualiza las sesiones locales con el UUID autenticado
}
```

Este algoritmo garantiza que ningún usuario pierda su racha ni sus minutos entrenados cuando decida formalizar su registro con Google.

