/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`⏳ [1/2] Enviando migración: ${file}...`);

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
      console.error(`❌ Falló la migración ${file} (HTTP ${response.status}):\n${errorText}`);
      process.exit(1);
    }

    console.log(`✅ [2/2] Migración ${file} ejecutada exitosamente.\n`);
  }

  console.log(`-------------------------------------------------------`);
  console.log(`🔍 Validando estado de tablas en PostgreSQL vía PostgREST...`);
  console.log(`-------------------------------------------------------`);

  if (!anonKey) {
    console.warn('⚠️ No se encontró NEXT_PUBLIC_SUPABASE_ANON_KEY para la verificación PostgREST.');
    return;
  }

  const client = createClient(url, anonKey);

  const tables = ['profiles', 'exercises', 'training_sessions', 'user_streaks'];
  let allHealthy = true;

  for (const table of tables) {
    const { data, error, status } = await client.from(table).select('*').limit(2);
    if (error) {
      console.error(`❌ Tabla ${table}: HTTP ${status} - Error: ${error.message}`);
      allHealthy = false;
    } else {
      console.log(`✅ Tabla public.${table}: ACTIVA (HTTP ${status}) - Registros devueltos: ${data ? data.length : 0}`);
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
