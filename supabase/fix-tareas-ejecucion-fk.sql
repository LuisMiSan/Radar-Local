-- ============================================================
-- FIX: Quitar foreign key de informe_id en tareas_ejecucion
--
-- El campo informe_id guardaba el ID de la tarea en tabla `tareas`
-- pero tenía FK apuntando a `informes`. Quitamos la FK para que
-- sea un campo libre que referencia la tarea origen sin constraint.
--
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE tareas_ejecucion
  DROP CONSTRAINT IF EXISTS tareas_ejecucion_informe_id_fkey;

-- Renombrar para claridad: es el ID de la tarea (tabla tareas) que originó estas
COMMENT ON COLUMN tareas_ejecucion.informe_id IS 'ID de la tarea/auditoría que generó esta tarea de ejecución (sin FK)';
