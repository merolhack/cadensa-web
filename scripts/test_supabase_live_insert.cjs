const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kddeejyhnxrnmkmiwjxp.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing live insert into client_telemetry_errors...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', anonKey ? anonKey.substring(0, 15) + '...' : 'none');

fetch(`${supabaseUrl}/rest/v1/client_telemetry_errors`, {
  method: 'POST',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  },
  body: JSON.stringify({
    event_name: 'test_node_live_insert',
    error_message: 'Mensaje de prueba en vivo desde script de validacion',
    component: 'TestRunner',
    user_id: null,
    metadata: { test: true, timestamp: new Date().toISOString() },
  }),
})
  .then(async (res) => {
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  })
  .catch((err) => {
    console.error('Fetch error:', err);
  });
