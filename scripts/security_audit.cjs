/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
let token = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SUPABASE_ACCESS_TOKEN=')) {
      token = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const projectRef = 'kddeejyhnxrnmkmiwjxp';

async function querySql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  return await res.json();
}

async function audit() {
  console.log('--- 1. AUDITORÍA DE RLS EN TABLAS PÚBLICAS ---');
  const tables = await querySql(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public';
  `);
  console.log(tables);

  console.log('\n--- 2. POLÍTICAS RLS EXISTENTES ---');
  const policies = await querySql(`
    SELECT tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public';
  `);
  console.log(policies);

  console.log('\n--- 3. AUDITORÍA DE FUNCIONES SECURITY DEFINER ---');
  const functions = await querySql(`
    SELECT 
      p.proname AS function_name,
      p.prosecdef AS is_security_definer,
      p.proconfig AS search_path_config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
  `);
  console.log(functions);

  console.log('\n--- 4. PRUEBA DE ACCESO ANÓNIMO A _schema_migrations ---');
  let anonKey = '';
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        anonKey = line.trim().split('=')[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  const testRes = await fetch(`https://${projectRef}.supabase.co/rest/v1/_schema_migrations?select=*`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    },
  });
  console.log(`Estado HTTP al consultar _schema_migrations con clave anónima: ${testRes.status} (${testRes.statusText})`);
  const testBody = await testRes.text();
  console.log('Respuesta PostgREST (debe ser vacía o denegada):', testBody);
}

audit().catch(console.error);
