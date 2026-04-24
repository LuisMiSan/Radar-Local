-- Migración: Agente Vigilante — tabla de cambios detectados
-- Ejecutar en: Supabase Dashboard → SQL Editor

create table if not exists public.cambios_detectados (
  id                    uuid primary key default gen_random_uuid(),
  fuente                text not null,
  -- google_blog | anthropic | nextjs | supabase | reddit | github | seo_news | general
  titulo                text not null,
  url                   text,
  resumen               text not null,
  impacto_estimado      text not null default 'info'
    check (impacto_estimado in ('critico', 'importante', 'info')),
  area_afectada         text not null default 'general',
  -- gbp | llm | stack | negocio | seo | seguridad
  propuesta             text,          -- qué propone el agente hacer
  tipo_cambio           text default 'manual'
    check (tipo_cambio in ('knowledge', 'prompt', 'code', 'config', 'manual')),
  diff_propuesto        jsonb,         -- { file, before, after } para tipo=code/prompt
  estado                text not null default 'pending'
    check (estado in ('pending', 'analysed', 'aprobado', 'descartado', 'implementado', 'pospuesto')),
  notas_admin           text,
  fecha_deteccion       timestamptz not null default now(),
  fecha_revision        timestamptz,
  fecha_implementacion  timestamptz
);

alter table public.cambios_detectados enable row level security;

create policy "Solo service_role puede acceder a cambios_detectados"
  on public.cambios_detectados
  for all
  using (false);

create index if not exists cambios_estado_idx   on public.cambios_detectados (estado);
create index if not exists cambios_impacto_idx  on public.cambios_detectados (impacto_estimado);
create index if not exists cambios_fecha_idx    on public.cambios_detectados (fecha_deteccion desc);

comment on table public.cambios_detectados is
  'Cambios detectados por el Agente Vigilante. Flujo: pending → analysed → aprobado/descartado/pospuesto → implementado.';
