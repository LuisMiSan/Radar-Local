-- ════════════════════════════════════════════════════════════
-- Tabla: uso_api — Registro de consumo de tokens por agente
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS uso_api (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  agente TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  coste_input NUMERIC(10,6) NOT NULL DEFAULT 0,
  coste_output NUMERIC(10,6) NOT NULL DEFAULT 0,
  coste_total NUMERIC(10,6) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'agente',  -- 'agente' | 'individual' | 'analisis_completo'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_uso_api_fecha ON uso_api(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_uso_api_agente ON uso_api(agente, fecha);
CREATE INDEX IF NOT EXISTS idx_uso_api_cliente ON uso_api(cliente_id, fecha);

-- Vista materializada para resumen diario
CREATE OR REPLACE VIEW resumen_gastos_diario AS
SELECT
  fecha,
  COUNT(*) as total_llamadas,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(coste_total) as coste_total_dia,
  COUNT(DISTINCT cliente_id) as clientes_unicos,
  COUNT(DISTINCT agente) as agentes_usados
FROM uso_api
GROUP BY fecha
ORDER BY fecha DESC;

-- Vista por agente
CREATE OR REPLACE VIEW resumen_gastos_agente AS
SELECT
  agente,
  COUNT(*) as total_llamadas,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  ROUND(AVG(input_tokens)) as avg_input_tokens,
  ROUND(AVG(output_tokens)) as avg_output_tokens,
  SUM(coste_total) as coste_total,
  ROUND(AVG(coste_total), 6) as coste_promedio
FROM uso_api
GROUP BY agente
ORDER BY coste_total DESC;

-- RLS
ALTER TABLE uso_api ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_role_uso_api' AND tablename = 'uso_api'
  ) THEN
    CREATE POLICY "service_role_uso_api" ON uso_api FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
