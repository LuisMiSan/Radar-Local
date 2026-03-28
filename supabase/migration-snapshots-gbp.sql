-- ══════════════════════════════════════════════════════════════
-- SNAPSHOTS GBP — Seguimiento diario de métricas del perfil
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS snapshots_gbp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Datos brutos de Google Places API
  nombre TEXT,
  direccion TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  resenas_count INTEGER DEFAULT 0,
  fotos_count INTEGER DEFAULT 0,
  google_maps_url TEXT,
  horarios_completos BOOLEAN DEFAULT FALSE,
  tiene_web BOOLEAN DEFAULT FALSE,
  tiene_descripcion BOOLEAN DEFAULT FALSE,
  business_status TEXT,

  -- Score total calculado (0-100)
  score_gbp INTEGER DEFAULT 0,

  -- Desglose del score por área
  score_rating INTEGER DEFAULT 0,       -- max 25
  score_resenas INTEGER DEFAULT 0,      -- max 25
  score_fotos INTEGER DEFAULT 0,        -- max 20
  score_horarios INTEGER DEFAULT 0,     -- max 10
  score_web INTEGER DEFAULT 0,          -- max 10
  score_descripcion INTEGER DEFAULT 0,  -- max 10

  -- Actividad del día
  tareas_creadas INTEGER DEFAULT 0,
  tareas_completadas INTEGER DEFAULT 0,
  agentes_ejecutados INTEGER DEFAULT 0,
  informe_id UUID,

  -- Delta respecto al snapshot anterior
  delta_rating NUMERIC(2,1) DEFAULT 0,
  delta_resenas INTEGER DEFAULT 0,
  delta_fotos INTEGER DEFAULT 0,
  delta_score INTEGER DEFAULT 0,

  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un snapshot por cliente por día
  UNIQUE(cliente_id, fecha)
);

-- Índice para queries de evolución
CREATE INDEX IF NOT EXISTS idx_snapshots_gbp_cliente_fecha
  ON snapshots_gbp(cliente_id, fecha DESC);

-- RLS: solo service_role puede escribir
ALTER TABLE snapshots_gbp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_snapshots" ON snapshots_gbp
  FOR ALL USING (true) WITH CHECK (true);
