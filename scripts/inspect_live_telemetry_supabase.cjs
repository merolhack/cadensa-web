const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
let token = '';
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) {
      token = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}

if (!token) {
  console.error('No token found');
  process.exit(1);
}

const projectRef = 'kddeejyhnxrnmkmiwjxp';

async function fetchLatestErrors() {
  console.log('Consultando registros reales en Supabase PostgreSQL (client_telemetry_errors)...');
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        SELECT id, event_name, error_message, component, url, created_at, metadata
        FROM public.client_telemetry_errors
        ORDER BY created_at DESC
        LIMIT 5;
      `,
    }),
  });

  const data = await res.json();
  console.log('Resultados obtenidos de la base de datos viva:');
  console.dir(data, { depth: null });
}

fetchLatestErrors().catch(console.error);
