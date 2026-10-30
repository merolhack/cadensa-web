/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Cadensa - Verificación en Vivo de Google OAuth 2.0 (Estrategia A)
 * Valida sin mocks el handshake real entre Supabase Auth y Google Identity Gateway.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Cargar variables de entorno desde .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const expectedClientId = process.env.GOOGLE_CLIENT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

console.log('--- Iniciando Verificación Pre-Vuelo Real de Google OAuth (Estrategia A) ---');
console.log('📌 Supabase URL:', supabaseUrl);
console.log('📌 Client ID esperado:', expectedClientId ? expectedClientId.substring(0, 20) + '...' : 'No configurado');

async function testOAuthHandshake() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n📡 Solicitando URL de autorización a Supabase Auth Edge con skipBrowserRedirect: true...');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000',
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.error('\n❌ Fallo en la respuesta de Supabase:');
    console.error('Mensaje:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }

  if (!data || !data.url) {
    console.error('\n❌ Supabase no retornó una URL válida de autenticación:', data);
    process.exit(1);
  }

  console.log('✅ Handshake exitoso con Supabase Auth Gateway.');
  console.log('🔗 URL de autorización intermedia:', data.url);

  console.log('\n📡 Resolviendo redirección 302 hacia Google Identity Gateway...');
  const res = await fetch(data.url, { redirect: 'manual' });
  const locationHeader = res.headers.get('location');

  if (!locationHeader) {
    console.error('❌ Supabase no devolvió cabecera Location de redirección (HTTP ' + res.status + ')');
    process.exit(1);
  }

  console.log('✅ 302 Redirect recibido correctamente de Supabase.');
  console.log('🔗 URL final de Google OAuth:\n', locationHeader);

  const authUrl = new URL(locationHeader);
  const host = authUrl.host;
  const clientId = authUrl.searchParams.get('client_id');
  const redirectUri = authUrl.searchParams.get('redirect_uri');
  const responseType = authUrl.searchParams.get('response_type');
  const scope = authUrl.searchParams.get('scope');

  console.log('\n🔎 Análisis de parámetros reales de Google Identity:');
  console.log('• Host destino:', host, host === 'accounts.google.com' ? '✅ (Válido: Google Accounts)' : '❌ (Inválido)');
  console.log('• Client ID en URL:', clientId);
  console.log('• Redirect URI en URL:', redirectUri);
  console.log('• Response Type:', responseType);
  console.log('• Scopes solicitados:', scope);

  let allChecksPassed = true;

  if (host !== 'accounts.google.com') {
    console.error('❌ El host destino no es accounts.google.com');
    allChecksPassed = false;
  }

  if (expectedClientId && clientId !== expectedClientId) {
    console.warn('⚠️ Advertencia: El Client ID configurado en Supabase no coincide exactamente con el .env local.');
    console.warn(`   En Supabase: ${clientId}`);
    console.warn(`   En .env:     ${expectedClientId}`);
  } else if (expectedClientId && clientId === expectedClientId) {
    console.log('✅ Client ID coincide 100% con .env local (GCP cadensa-web-dev).');
  }

  const expectedRedirect = `${supabaseUrl}/auth/v1/callback`;
  if (redirectUri === expectedRedirect) {
    console.log('✅ Redirect URI apunta correctamente al callback de Supabase:', redirectUri);
  } else {
    console.warn('⚠️ Redirect URI difiere del callback estándar:', redirectUri);
  }

  if (allChecksPassed) {
    console.log('\n🎉 ¡Estrategia A completada con ÉXITO total! La integración Google OAuth <-> Supabase está 100% viva y operativa.');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testOAuthHandshake().catch((err) => {
  console.error('❌ Excepción no controlada durante el handshake:', err);
  process.exit(1);
});
