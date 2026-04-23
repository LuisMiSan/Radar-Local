-- Migración: Tabla de API keys para el protocolo A2A (white label)
-- Ejecutar en: Supabase Dashboard → SQL Editor

create table if not exists public.a2a_api_keys (
  id                  uuid primary key default gen_random_uuid(),
  nombre_agencia      text not null,
  key_hash            text not null unique,        -- SHA-256 de la key (nunca texto plano)
  activa              boolean not null default true,
  rate_limit_per_hour integer not null default 10, -- máximo de llamadas/hora
  llamadas_totales    bigint not null default 0,
  ultima_llamada      timestamptz,
  notas               text,
  created_at          timestamptz not null default now()
);

-- Solo admins pueden gestionar keys
alter table public.a2a_api_keys enable row level security;

create policy "Solo service_role puede leer a2a_api_keys"
  on public.a2a_api_keys
  for all
  using (false); -- acceso solo desde supabaseAdmin (service_role bypasses RLS)

-- Índice para búsquedas por hash (la operación más frecuente)
create index if not exists a2a_api_keys_hash_idx on public.a2a_api_keys (key_hash);

comment on table public.a2a_api_keys is
  'API keys para agencias white label que usan el protocolo A2A de Radar Local';
