-- ==============================================================================
-- Cadensa: Sincronización Multi-Dispositivo de Frases de Desafío (Zero Trust RLS)
-- Permite respaldar y sincronizar frases personalizadas por usuario autenticado.
-- ==============================================================================

create table if not exists public.user_custom_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  phrase text not null,
  bpm_recommended int not null default 80,
  category text not null default 'personalizado',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (Zero-Trust)
alter table public.user_custom_phrases enable row level security;

-- Políticas de aislamiento estricto por user_id
create policy "Usuarios consultan solo sus frases personalizadas"
  on public.user_custom_phrases
  for select
  using (auth.uid() = user_id);

create policy "Usuarios insertan solo sus frases personalizadas"
  on public.user_custom_phrases
  for insert
  with check (auth.uid() = user_id);

create policy "Usuarios actualizan solo sus frases personalizadas"
  on public.user_custom_phrases
  for update
  using (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus frases personalizadas"
  on public.user_custom_phrases
  for delete
  using (auth.uid() = user_id);

-- Índices de consulta rápida
create index if not exists idx_user_custom_phrases_user_id
  on public.user_custom_phrases (user_id);

