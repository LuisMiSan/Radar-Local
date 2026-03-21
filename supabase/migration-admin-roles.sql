-- ============================================================
-- Radar Local — Migración: Sistema de Roles Admin
--
-- PROPÓSITO: Diferenciar permisos entre tipos de admin:
--   - super_admin: Acceso total (el dueño)
--   - auditorias: Comercial (pipeline, clientes, auditorías)
--   - gestion: Técnico (agentes, tareas, ejecución, gastos)
--
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── Tabla de perfiles admin ───────────────────────────────

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL DEFAULT '',
  rol TEXT NOT NULL DEFAULT 'gestion'
    CHECK (rol IN ('super_admin', 'auditorias', 'gestion')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS (Row Level Security) ──────────────────────────────

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Solo el service_role puede leer/escribir (el servidor Next.js)
CREATE POLICY "service_role_full_access" ON admin_profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Los usuarios autenticados pueden leer su propio perfil
CREATE POLICY "users_read_own_profile" ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ── Índices ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_rol ON admin_profiles(rol);

-- ── Insertar tu perfil como super_admin ───────────────────
-- NOTA: Reemplaza el UUID con tu user ID real de Supabase Auth
-- Puedes encontrarlo en: Authentication → Users → tu usuario → ID

INSERT INTO admin_profiles (id, email, nombre, rol)
VALUES ('4a3f7271-4219-4807-ae37-53604b20174d', 'admin@radarlocal.es', 'Luis Miguel', 'super_admin')
ON CONFLICT (id) DO NOTHING;
