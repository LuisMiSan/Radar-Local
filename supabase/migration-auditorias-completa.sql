-- Migración COMPLETA para la tabla auditorias
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- Añade las columnas que faltan: nombre_contacto, puesto, telefono, dimensiones

DO $$
BEGIN
  -- Columna nombre_contacto
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'nombre_contacto'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN nombre_contacto text DEFAULT '';
  END IF;

  -- Columna puesto
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'puesto'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN puesto text DEFAULT '';
  END IF;

  -- Columna telefono
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'telefono'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN telefono text DEFAULT '';
  END IF;

  -- Columna email (por si no existe)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'email'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN email text DEFAULT '';
  END IF;

  -- Columna dimensiones (JSON para gráficos)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditorias' AND column_name = 'dimensiones'
  ) THEN
    ALTER TABLE auditorias ADD COLUMN dimensiones jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
