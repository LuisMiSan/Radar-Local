-- ══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Tabla notebooklm_sync
-- Registra sincronizaciones bidireccionales con NotebookLM
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notebooklm_sync (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('push', 'pull')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'error')),
  notebook_id text NOT NULL,
  content_summary text NOT NULL DEFAULT '',
  content_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  synced_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE notebooklm_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service_role notebooklm_sync" ON notebooklm_sync;
CREATE POLICY "Allow all for service_role notebooklm_sync" ON notebooklm_sync
  FOR ALL USING (true) WITH CHECK (true);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_notebooklm_sync_cliente ON notebooklm_sync(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notebooklm_sync_direction ON notebooklm_sync(direction, status);
