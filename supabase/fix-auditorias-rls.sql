-- Fix RLS para auditorias: permitir INSERT/SELECT con clave anon
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow all for anon" ON auditorias;
DROP POLICY IF EXISTS "auditorias_select" ON auditorias;
DROP POLICY IF EXISTS "auditorias_insert" ON auditorias;
DROP POLICY IF EXISTS "auditorias_update" ON auditorias;

-- Habilitar RLS si no está habilitado
ALTER TABLE auditorias ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (cualquiera puede ver su auditoría por ID)
CREATE POLICY "auditorias_select" ON auditorias
  FOR SELECT USING (true);

-- Permitir inserción pública (el formulario público crea auditorías)
CREATE POLICY "auditorias_insert" ON auditorias
  FOR INSERT WITH CHECK (true);

-- Permitir actualización (para upsert en saveAudit)
CREATE POLICY "auditorias_update" ON auditorias
  FOR UPDATE USING (true) WITH CHECK (true);
