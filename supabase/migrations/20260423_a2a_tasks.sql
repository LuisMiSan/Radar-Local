-- Migración: Tabla de tareas async A2A
-- Ejecutar en: Supabase Dashboard → SQL Editor

create table if not exists public.a2a_tasks (
  id              uuid primary key,
  api_key_id      uuid references public.a2a_api_keys(id) on delete set null,
  cliente_id      uuid,
  skill_id        text not null default 'auditoria_completa',
  nombre_agencia  text,                      -- copia desnormalizada para consultas rápidas
  estado          text not null default 'submitted'
                  check (estado in ('submitted', 'working', 'completed', 'failed')),
  resultado       jsonb,                     -- TaskResult.artifacts cuando completed
  error_message   text,
  created_at      timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz
);

alter table public.a2a_tasks enable row level security;

create policy "Solo service_role puede acceder a a2a_tasks"
  on public.a2a_tasks
  for all
  using (false);

create index if not exists a2a_tasks_estado_idx    on public.a2a_tasks (estado);
create index if not exists a2a_tasks_api_key_idx   on public.a2a_tasks (api_key_id);
create index if not exists a2a_tasks_created_idx   on public.a2a_tasks (created_at desc);

comment on table public.a2a_tasks is
  'Registro de tareas async del protocolo A2A. Permite polling de estado sin bloquear la respuesta inicial.';
