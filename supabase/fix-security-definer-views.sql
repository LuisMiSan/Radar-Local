-- ════════════════════════════════════════════════════════════
-- FIX: Eliminar vistas SECURITY DEFINER
-- ════════════════════════════════════════════════════════════
-- PROBLEMA: Las vistas resumen_gastos_diario y resumen_gastos_agente
-- se crearon con SECURITY DEFINER por defecto, lo que significa que
-- se ejecutan con los permisos del CREADOR (superadmin), no del usuario.
-- Esto es un riesgo de seguridad.
--
-- SOLUCIÓN: Eliminarlas. El código en lib/gastos.ts hace queries
-- directas a la tabla uso_api y agrupa los resultados en JavaScript.
-- Estas vistas nunca se usan.
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.resumen_gastos_diario;
DROP VIEW IF EXISTS public.resumen_gastos_agente;
