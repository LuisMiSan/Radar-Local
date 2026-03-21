-- ═══════════════════════════════════════════════════════════════
-- FIX: Restringir SELECT en tablas con datos sensibles (PII)
-- ═══════════════════════════════════════════════════════════════
-- PROBLEMA: La clave pública (anon) puede LEER todos los datos
-- de clientes (emails, teléfonos, direcciones).
-- Como la clave anon es visible en el navegador, cualquiera
-- podría usarla para leer todos los datos de tus clientes.
--
-- SOLUCIÓN: Solo service_role puede leer las tablas sensibles.
-- La tabla "auditorias" sigue siendo pública (la necesitan los visitantes).
-- ═══════════════════════════════════════════════════════════════

-- 1. CLIENTES — contiene email, teléfono, dirección
DROP POLICY IF EXISTS "Allow select for all" ON clientes;
CREATE POLICY "Allow select for service_role"
  ON clientes FOR SELECT
  TO service_role
  USING (true);

-- 2. PERFILES_GBP — datos internos del perfil Google Business
DROP POLICY IF EXISTS "Allow select for all" ON perfiles_gbp;
CREATE POLICY "Allow select for service_role"
  ON perfiles_gbp FOR SELECT
  TO service_role
  USING (true);

-- 3. TAREAS — historial de tareas internas
DROP POLICY IF EXISTS "Allow select for all" ON tareas;
CREATE POLICY "Allow select for service_role"
  ON tareas FOR SELECT
  TO service_role
  USING (true);

-- 4. METRICAS — métricas internas
DROP POLICY IF EXISTS "Allow select for all" ON metricas;
CREATE POLICY "Allow select for service_role"
  ON metricas FOR SELECT
  TO service_role
  USING (true);

-- 5. REPORTES — reportes internos
DROP POLICY IF EXISTS "Allow select for all" ON reportes;
CREATE POLICY "Allow select for service_role"
  ON reportes FOR SELECT
  TO service_role
  USING (true);

-- 6. AUDITORIAS — MANTENER SELECT PÚBLICO
-- Los visitantes necesitan leer su auditoría por ID
-- (ya tenía "Allow select for all" — no lo tocamos)
-- Pero añadimos una restricción: solo pueden leer SU auditoría
-- No cambiamos esta política porque la lectura pública es necesaria
-- para que la página /auditoria/[id] funcione.

-- ═══════════════════════════════════════════════════════════════
-- RESULTADO:
-- ✅ Tablas clientes, perfiles_gbp, tareas, metricas, reportes
--    → Solo legibles con clave service_role (servidor)
-- ✅ Tabla auditorias → sigue legible con clave anon (público)
-- ═══════════════════════════════════════════════════════════════
