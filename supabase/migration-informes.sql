-- ════════════════════════════════════════════════════════════
-- TABLA: informes — Historial de análisis IA por cliente
-- Ejecutar en Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS informes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  pack TEXT NOT NULL,

  -- Resultados de cada agente (JSON completo)
  agentes JSONB NOT NULL DEFAULT '[]',

  -- Informe consolidado del agente 11
  reporte JSONB NOT NULL DEFAULT '{}',

  -- Métricas clave extraídas (para comparación rápida sin parsear JSON)
  puntuacion_gbp INTEGER DEFAULT 0,
  consistencia_nap INTEGER DEFAULT 0,
  total_resenas INTEGER DEFAULT 0,
  media_resenas NUMERIC(2,1) DEFAULT 0,
  posicion_maps INTEGER DEFAULT 0,
  presencia_ias INTEGER DEFAULT 0,

  -- Metadata
  agentes_total INTEGER NOT NULL DEFAULT 0,
  agentes_completados INTEGER NOT NULL DEFAULT 0,
  tiempo_ejecucion INTEGER DEFAULT 0,  -- en segundos

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para buscar informes por cliente ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_informes_cliente_fecha
  ON informes(cliente_id, created_at DESC);

-- RLS: solo service_role puede leer/escribir
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;

-- Política para service_role (acceso total)
CREATE POLICY "service_role_informes" ON informes
  FOR ALL USING (auth.role() = 'service_role');
