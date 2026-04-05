-- ─────────────────────────────────────────────────────────
-- Tabla configuracion — key-value store for app settings
-- ─────────────────────────────────────────────────────────
-- Stores landing page config, feature flags, etc.

CREATE TABLE IF NOT EXISTS configuracion (
  clave text PRIMARY KEY,
  valor jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: allow all (admin-only access controlled by API)
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for configuracion" ON configuracion;
CREATE POLICY "Allow all for configuracion" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS configuracion_updated_at ON configuracion;
CREATE TRIGGER configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
