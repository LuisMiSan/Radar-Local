-- ============================================================
-- Migración: Tabla google_tokens
-- Almacena tokens OAuth2 de Google por cliente
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT DEFAULT '',
  -- Datos opcionales del GBP vinculado
  account_name TEXT,         -- accounts/123456
  location_name TEXT,        -- locations/abc123
  location_title TEXT,       -- "Radar Local"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cliente_id)         -- Un token por cliente
);

-- RLS: solo accesible con service_role (los tokens son sensibles)
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Política: solo service_role puede leer/escribir
-- (no hay política para anon/authenticated = acceso denegado por defecto)
-- El código usa supabaseAdmin (service_role) para acceder a esta tabla

-- Índice
CREATE INDEX IF NOT EXISTS idx_google_tokens_cliente ON google_tokens(cliente_id);
