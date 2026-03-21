-- ─────────────────────────────────────────────────────────
-- MIGRACIÓN: Portal del Cliente — Columna portal_token
-- ─────────────────────────────────────────────────────────
-- Añade una columna para almacenar el token único que
-- identifica a cada cliente en su portal público.
-- El token es generado por la app y permite acceso
-- sin contraseña a un dashboard de solo lectura.

-- 1) Añadir columna portal_token (nullable, única)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS portal_token text UNIQUE DEFAULT NULL;

-- 2) Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_clientes_portal_token ON clientes(portal_token) WHERE portal_token IS NOT NULL;

-- 3) Política RLS: permitir SELECT con service_role para consultas por token
-- (ya tenemos SELECT restringido a service_role, así que esto ya funciona)
