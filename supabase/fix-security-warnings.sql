-- ============================================================
-- Radar Local — Fix para los 7 avisos de seguridad de Supabase
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ============================================================
-- FIX 1: function_search_path_mutable
-- Problema: la función update_updated_at() no tiene search_path fijo
-- Solución: recrear la función con SET search_path = ''
-- Esto evita que alguien cree una función con el mismo nombre
-- en otro schema y "engañe" a PostgreSQL
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- ============================================================
-- FIX 2-7: rls_policy_always_true (6 tablas)
-- Problema: las políticas "Allow all for anon" usan USING(true)
-- lo que permite a CUALQUIERA leer/escribir/borrar datos
--
-- Solución: Reemplazar con políticas más seguras:
-- - SELECT: permitido (lectura pública es necesaria para la app)
-- - INSERT: permitido (la app necesita crear registros)
-- - UPDATE: solo el rol "service_role" (admin desde backend)
-- - DELETE: solo el rol "service_role" (admin desde backend)
--
-- Nota: "anon" es la clave pública (la que usa el navegador)
--       "service_role" es la clave secreta (solo backend)
-- ============================================================

-- --- CLIENTES ---
DROP POLICY IF EXISTS "Allow all for anon" ON clientes;
-- Lectura: cualquiera autenticado o anónimo puede leer
CREATE POLICY "Allow select for all" ON clientes
  FOR SELECT USING (true);
-- Insertar: permitido (crear clientes desde la app)
CREATE POLICY "Allow insert for all" ON clientes
  FOR INSERT WITH CHECK (true);
-- Actualizar: solo service_role (backend con clave secreta)
CREATE POLICY "Allow update for service_role" ON clientes
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
-- Borrar: solo service_role
CREATE POLICY "Allow delete for service_role" ON clientes
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );

-- --- PERFILES_GBP ---
DROP POLICY IF EXISTS "Allow all for anon" ON perfiles_gbp;
CREATE POLICY "Allow select for all" ON perfiles_gbp
  FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON perfiles_gbp
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service_role" ON perfiles_gbp
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
CREATE POLICY "Allow delete for service_role" ON perfiles_gbp
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );

-- --- TAREAS ---
DROP POLICY IF EXISTS "Allow all for anon" ON tareas;
CREATE POLICY "Allow select for all" ON tareas
  FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON tareas
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service_role" ON tareas
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
CREATE POLICY "Allow delete for service_role" ON tareas
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );

-- --- METRICAS ---
DROP POLICY IF EXISTS "Allow all for anon" ON metricas;
CREATE POLICY "Allow select for all" ON metricas
  FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON metricas
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service_role" ON metricas
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
CREATE POLICY "Allow delete for service_role" ON metricas
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );

-- --- REPORTES ---
DROP POLICY IF EXISTS "Allow all for anon" ON reportes;
CREATE POLICY "Allow select for all" ON reportes
  FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON reportes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for service_role" ON reportes
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
CREATE POLICY "Allow delete for service_role" ON reportes
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );

-- --- AUDITORIAS ---
DROP POLICY IF EXISTS "Allow all for anon" ON auditorias;
CREATE POLICY "Allow select for all" ON auditorias
  FOR SELECT USING (true);
-- Insertar: permitido (el journey público crea auditorías)
CREATE POLICY "Allow insert for all" ON auditorias
  FOR INSERT WITH CHECK (true);
-- Actualizar: solo service_role
CREATE POLICY "Allow update for service_role" ON auditorias
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
-- Borrar: solo service_role
CREATE POLICY "Allow delete for service_role" ON auditorias
  FOR DELETE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
    OR current_user = 'postgres'
  );
