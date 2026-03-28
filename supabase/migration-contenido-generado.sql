-- ══════════════════════════════════════════════════════════════
-- LIBRERÍA DE CONTENIDO — Todo lo que generan los agentes
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contenido_generado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  -- Qué agente lo creó
  agente TEXT NOT NULL,
  tarea_id UUID,                          -- FK a tareas_ejecucion si aplica

  -- Tipo de contenido
  tipo TEXT NOT NULL,                     -- 'faq_voz', 'chunk', 'schema_jsonld', 'tldr', 'post_gbp', 'respuesta_resena'
  categoria TEXT NOT NULL DEFAULT 'geo_aeo', -- 'voz', 'geo_aeo', 'map_pack', 'web'

  -- El contenido en sí
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,                -- El contenido completo (FAQ, chunk, schema, etc.)
  contenido_json JSONB,                   -- Versión estructurada si aplica

  -- Metadata de optimización
  plataforma_target TEXT,                 -- 'gemini', 'chatgpt', 'siri', 'alexa', 'google_maps', 'web'
  optimizado_para TEXT,                   -- 'busqueda_voz', 'map_pack', 'rich_snippet', 'citacion_llm'
  keywords TEXT[],                        -- Keywords incluidas

  -- Estado de publicación
  estado TEXT NOT NULL DEFAULT 'generado', -- 'generado', 'publicado', 'descartado'
  publicado_en TEXT,                      -- 'web', 'gbp', 'blog', etc.
  publicado_at TIMESTAMPTZ,

  -- Scoring
  score_calidad INTEGER,                  -- 0-100, evaluado por el agente

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar contenido por cliente y tipo
CREATE INDEX IF NOT EXISTS idx_contenido_cliente_tipo
  ON contenido_generado(cliente_id, tipo, created_at DESC);

-- Índice para contenido de voz específicamente
CREATE INDEX IF NOT EXISTS idx_contenido_voz
  ON contenido_generado(cliente_id, categoria, plataforma_target)
  WHERE categoria = 'voz';

-- RLS
ALTER TABLE contenido_generado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_contenido" ON contenido_generado
  FOR ALL USING (true) WITH CHECK (true);
