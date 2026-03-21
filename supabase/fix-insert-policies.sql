-- ============================================================
-- Radar Local — Fix para los 6 avisos de INSERT permisivo
-- Ejecutar en Supabase SQL Editor
-- ============================================================
--
-- PROBLEMA: Las políticas "Allow insert for all" usan WITH CHECK (true)
-- lo que permite a CUALQUIERA insertar datos usando la clave anon (pública).
--
-- SOLUCIÓN: Restringir INSERT solo al rol "service_role".
-- El código del servidor ahora usa la clave service_role para escribir,
-- así que la clave anon (pública) ya NO puede insertar datos.
--
-- NOTA: service_role salta las políticas RLS automáticamente,
-- pero añadimos las políticas igualmente por buena práctica.
-- ============================================================

-- --- CLIENTES ---
DROP POLICY IF EXISTS "Allow insert for all" ON clientes;
CREATE POLICY "Allow insert for service_role" ON clientes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- --- PERFILES_GBP ---
DROP POLICY IF EXISTS "Allow insert for all" ON perfiles_gbp;
CREATE POLICY "Allow insert for service_role" ON perfiles_gbp
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- --- TAREAS ---
DROP POLICY IF EXISTS "Allow insert for all" ON tareas;
CREATE POLICY "Allow insert for service_role" ON tareas
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- --- METRICAS ---
DROP POLICY IF EXISTS "Allow insert for all" ON metricas;
CREATE POLICY "Allow insert for service_role" ON metricas
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- --- REPORTES ---
DROP POLICY IF EXISTS "Allow insert for all" ON reportes;
CREATE POLICY "Allow insert for service_role" ON reportes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- --- AUDITORIAS ---
DROP POLICY IF EXISTS "Allow insert for all" ON auditorias;
CREATE POLICY "Allow insert for service_role" ON auditorias
  FOR INSERT
  TO service_role
  WITH CHECK (true);
