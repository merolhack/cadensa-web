-- ==============================================================================
-- Cadensa: Tabla custom_phrases con Zero Trust RLS
-- Permite a los pacientes guardar y sincronizar sus frases en la nube.
-- ==============================================================================

create table if not exists public.custom_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  phrase text not null,
  bpm int not null default 80,
  category text not null default 'personalizado',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (Zero-Trust)
alter table public.custom_phrases enable row level security;

-- Políticas de aislamiento por user_id = auth.uid()
create policy "Usuarios consultan solo sus frases personalizadas"
  on public.custom_phrases
  for select
  using (auth.uid() = user_id);

create policy "Usuarios insertan solo sus frases personalizadas"
  on public.custom_phrases
  for insert
  with check (auth.uid() = user_id);

create policy "Usuarios actualizan solo sus frases personalizadas"
  on public.custom_phrases
  for update
  using (auth.uid() = user_id);

create policy "Usuarios eliminan solo sus frases personalizadas"
  on public.custom_phrases
  for delete
  using (auth.uid() = user_id);

-- Índices de consulta rápida
create index if not exists idx_custom_phrases_user_id
  on public.custom_phrases (user_id);

