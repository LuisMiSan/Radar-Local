-- ══════════════════════════════════════════════════════════════
-- MEMORIA DE AGENTES — Historial de ejecuciones para contexto
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Cada ejecución de un agente se registra aquí con su input/output resumido.
-- Antes de ejecutar un agente, se cargan las últimas N ejecuciones
-- para darle contexto de qué hizo antes y qué impacto tuvo.

CREATE TABLE IF NOT EXISTS agent_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  agente TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),

  -- Contexto de entrada (qué sabía el agente al ejecutarse)
  score_gbp_al_ejecutar INTEGER,          -- score del perfil cuando corrió
  rating_al_ejecutar NUMERIC(2,1),        -- rating cuando corrió
  resenas_al_ejecutar INTEGER,            -- nº reseñas cuando corrió
  fotos_al_ejecutar INTEGER,              -- nº fotos cuando corrió

  -- Resultado resumido (qué decidió/recomendó)
  resumen TEXT NOT NULL,                  -- resumen legible de lo que hizo
  decisiones_clave JSONB DEFAULT '[]',    -- ["Reescribir descripción", "Añadir 8 fotos"]
  tareas_generadas INTEGER DEFAULT 0,     -- cuántas tareas creó
  tareas_auto INTEGER DEFAULT 0,          -- cuántas auto-ejecutar
  tareas_revision INTEGER DEFAULT 0,      -- cuántas necesitan revisión
  tareas_manual INTEGER DEFAULT 0,        -- cuántas son manuales

  -- Impacto posterior (se actualiza cuando hay un nuevo snapshot)
  impacto_score_delta INTEGER,            -- Δ score después de sus acciones
  impacto_resenas_delta INTEGER,          -- Δ reseñas
  impacto_fotos_delta INTEGER,            -- Δ fotos
  impacto_evaluado BOOLEAN DEFAULT FALSE, -- si ya se midió el impacto

  -- Coste
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  coste_usd NUMERIC(10,6) DEFAULT 0,

  -- Relación con snapshot del momento
  snapshot_id UUID REFERENCES snapshots_gbp(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para queries rápidas de memoria por agente y cliente
CREATE INDEX IF NOT EXISTS idx_agent_memory_cliente_agente
  ON agent_memory(cliente_id, agente, fecha DESC);

-- Índice para evaluar impacto pendiente
CREATE INDEX IF NOT EXISTS idx_agent_memory_impacto_pendiente
  ON agent_memory(impacto_evaluado, cliente_id)
  WHERE impacto_evaluado = FALSE;

-- RLS: solo service_role puede acceder
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_agent_memory" ON agent_memory
  FOR ALL USING (true) WITH CHECK (true);
