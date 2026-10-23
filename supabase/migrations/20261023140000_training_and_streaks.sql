-- ==============================================================================
-- Cadensa: Migración para Ejercicios, Sesiones de Entrenamiento y Rachas (Streaks)
-- ==============================================================================

-- 1. Tabla de Ejercicios Clínicos y Frases
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general', -- 'monosilabas', 'polisilabas', 'frases_cortas', 'conversacion'
  difficulty text not null default 'facil', -- 'facil', 'medio', 'avanzado'
  phrase text not null,
  bpm_recommended int not null default 80,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para exercises: Lectura pública para todos
alter table public.exercises enable row level security;

create policy "Los ejercicios son visibles por todos los usuarios" on public.exercises
  for select using (true);

-- 2. Tabla de Sesiones de Entrenamiento Completadas
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  exercise_id uuid references public.exercises on delete set null,
  bpm int not null,
  duration_seconds int not null default 0,
  syllable_count int not null default 0,
  accuracy_score numeric(5,2) default 100.0,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para training_sessions: Los usuarios solo pueden ver y crear sus propias sesiones
alter table public.training_sessions enable row level security;

create policy "Los usuarios pueden ver sus propias sesiones" on public.training_sessions
  for select using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propias sesiones" on public.training_sessions
  for insert with check (auth.uid() = user_id);

-- 3. Tabla de Rachas y Gamificación de Usuarios
create table if not exists public.user_streaks (
  user_id uuid references auth.users on delete cascade primary key,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date default current_date,
  total_minutes int not null default 0,
  xp_points int not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para user_streaks
alter table public.user_streaks enable row level security;

create policy "Los usuarios pueden consultar su racha" on public.user_streaks
  for select using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar su racha inicial" on public.user_streaks
  for insert with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar su propia racha" on public.user_streaks
  for update using (auth.uid() = user_id);

-- Semillas iniciales de ejercicios
insert into public.exercises (category, difficulty, phrase, bpm_recommended) values
  ('frases_cortas', 'facil', 'Encuentra el ritmo de tu voz', 70),
  ('frases_cortas', 'facil', 'Cadensa es ritmo y tranquilidad', 75),
  ('conversacion', 'medio', 'Cadensa entrena tu fluidez cada día', 95),
  ('conversacion', 'medio', 'Hablar con calma y seguridad es posible', 100),
  ('conversacion', 'avanzado', 'La comunicación fluye cuando el compás es constante', 120)
on conflict do nothing;
