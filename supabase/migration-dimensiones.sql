-- Migración: Añadir columna 'dimensiones' a la tabla 'auditorias'
-- Ejecutar en Supabase SQL Editor (una sola vez)

-- Añadir columna dimensiones (JSON) si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'dimensiones'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN dimensiones jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
