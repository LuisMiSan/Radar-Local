-- ============================================================
-- Radar Local Agency — Migración Supabase
-- 6 tablas: clientes, perfiles_gbp, tareas, metricas, reportes, auditorias
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. CLIENTES
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  negocio text not null,
  email text,
  telefono text,
  direccion text,
  web text,
  pack text check (pack in ('visibilidad_local', 'autoridad_maps_ia')),
  es_fundador boolean default false,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'pausado')),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PERFILES GBP
create table if not exists perfiles_gbp (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid not null references clientes(id) on delete cascade,
  google_business_id text,
  nombre_gbp text,
  categoria text,
  descripcion text,
  horarios jsonb,
  fotos_count integer default 0,
  resenas_count integer default 0,
  puntuacion numeric(2,1),
  nap_nombre text,
  nap_direccion text,
  nap_telefono text,
  url_maps text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TAREAS
create table if not exists tareas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid not null references clientes(id) on delete cascade,
  agente text not null,
  tipo text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_progreso', 'completada', 'error')),
  resultado jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 4. METRICAS
create table if not exists metricas (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid not null references clientes(id) on delete cascade,
  tipo text not null,
  valor numeric,
  fecha date not null default current_date,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 5. REPORTES
create table if not exists reportes (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid not null references clientes(id) on delete cascade,
  mes text not null,
  contenido jsonb,
  estado text not null default 'borrador' check (estado in ('borrador', 'enviado')),
  created_at timestamptz default now()
);

-- 6. AUDITORIAS (journey público — persistir auditorías gratuitas)
create table if not exists auditorias (
  id text primary key,
  nombre_negocio text not null,
  direccion text not null,
  zona text not null,
  categoria text not null,
  telefono text,
  email text,
  puntuacion integer not null,
  competidores jsonb not null,
  gaps jsonb not null,
  recomendacion_pack text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Índices
-- ============================================================
create index if not exists idx_perfiles_gbp_cliente on perfiles_gbp(cliente_id);
create index if not exists idx_tareas_cliente on tareas(cliente_id);
create index if not exists idx_tareas_agente on tareas(agente);
create index if not exists idx_metricas_cliente on metricas(cliente_id);
create index if not exists idx_metricas_fecha on metricas(fecha);
create index if not exists idx_reportes_cliente on reportes(cliente_id);

-- ============================================================
-- Trigger: auto-update updated_at en clientes y perfiles_gbp
-- ============================================================
create or replace function update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_clientes_updated_at
  before update on clientes
  for each row execute function update_updated_at();

create trigger trg_perfiles_gbp_updated_at
  before update on perfiles_gbp
  for each row execute function update_updated_at();

-- ============================================================
-- RLS (Row Level Security) — permisos básicos
-- ============================================================
alter table clientes enable row level security;
alter table perfiles_gbp enable row level security;
alter table tareas enable row level security;
alter table metricas enable row level security;
alter table reportes enable row level security;
alter table auditorias enable row level security;

-- Políticas: permitir todo con anon key (app interna admin)
-- En producción, restringir por rol/auth
create policy "Allow all for anon" on clientes for all using (true) with check (true);
create policy "Allow all for anon" on perfiles_gbp for all using (true) with check (true);
create policy "Allow all for anon" on tareas for all using (true) with check (true);
create policy "Allow all for anon" on metricas for all using (true) with check (true);
create policy "Allow all for anon" on reportes for all using (true) with check (true);
create policy "Allow all for anon" on auditorias for all using (true) with check (true);
