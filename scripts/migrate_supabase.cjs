/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Parse .env
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

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'kddeejyhnxrnmkmiwjxp';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${projectRef}.supabase.co`;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!token) {
  console.error('❌ Error: Falta SUPABASE_ACCESS_TOKEN en las variables de entorno.');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

async function runMigrations() {
  console.log(`=======================================================`);
  console.log(`🚀 Iniciando Ejecución Desatendida de Migraciones SQL`);
  console.log(`📌 Proyecto Supabase: ${projectRef}`);
  console.log(`📂 Migraciones detectadas: ${migrationFiles.length}`);
  console.log(`=======================================================\n`);

  // 1. Asegurar tabla de control de migraciones con RLS activo y acceso revocado
  const setupTrackerSql = `
    CREATE TABLE IF NOT EXISTS public._schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public._schema_migrations ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public._schema_migrations FROM anon, authenticated;
  `;

  await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: setupTrackerSql }),
  });

  // 2. Obtener migraciones ya registradas
  const getAppliedRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: `SELECT version FROM public._schema_migrations;` }),
  });

  let appliedVersions = new Set();
  if (getAppliedRes.ok) {
    const rows = await getAppliedRes.json();
    if (Array.isArray(rows)) {
      appliedVersions = new Set(rows.map(r => r.version));
    }
  }

  for (let i = 0; i < migrationFiles.length; i++) {
    const file = migrationFiles[i];
    const step = `[${i + 1}/${migrationFiles.length}]`;
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    if (appliedVersions.has(file)) {
      console.log(`⏩ ${step} Migración ${file} ya aplicada previamente. Saltando.`);
      continue;
    }

    console.log(`⏳ ${step} Enviando migración: ${file}...`);

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Si el error indica que las relaciones ya existen, adoptamos el estado existente y marcamos como aplicada
      if (errorText.includes('already exists')) {
        console.warn(`⚠️ ${step} Objetos de ${file} ya existían en la base de datos (${errorText.trim()}).`);
        console.log(`📌 Registrando ${file} como aplicada en _schema_migrations...`);
      } else {
        console.error(`❌ Falló la migración ${file} (HTTP ${response.status}):\n${errorText}`);
        process.exit(1);
      }
    } else {
      console.log(`✅ ${step} Migración ${file} ejecutada exitosamente.`);
    }

    // Registrar migración aplicada
    await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `INSERT INTO public._schema_migrations (version) VALUES ('${file}') ON CONFLICT (version) DO NOTHING;`,
      }),
    });
  }

  console.log(`-------------------------------------------------------`);
  console.log(`🔍 Validando estado de tablas en PostgreSQL vía PostgREST...`);
  console.log(`-------------------------------------------------------`);

  if (!anonKey) {
    console.warn('⚠️ No se encontró NEXT_PUBLIC_SUPABASE_ANON_KEY para la verificación PostgREST.');
    return;
  }

  const tables = ['profiles', 'exercises', 'training_sessions', 'user_streaks', 'feedback_reports', 'app_admins', 'platform_metrics_snapshots'];
  let allHealthy = true;

  for (const table of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=2`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ Tabla ${table}: HTTP ${res.status} - Error: ${errText}`);
        allHealthy = false;
      } else {
        const data = await res.json();
        console.log(`✅ Tabla public.${table}: ACTIVA (HTTP ${res.status}) - Registros devueltos: ${Array.isArray(data) ? data.length : 0}`);
      }
    } catch (e) {
      console.error(`❌ Error al conectar con tabla ${table}:`, e.message);
      allHealthy = false;
    }
  }

  if (allHealthy) {
    console.log(`\n🎉 ¡Todas las tablas fueron creadas y verificadas exitosamente en Supabase!`);
  } else {
    console.error(`\n⚠️ Se detectaron inconsistencias en algunas tablas.`);
    process.exit(1);
  }
}

runMigrations().catch(err => {
  console.error('❌ Excepción fatal al aplicar migraciones:', err);
  process.exit(1);
});
