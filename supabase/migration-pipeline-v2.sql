-- ─────────────────────────────────────────────────────────
-- MIGRACIÓN: Pipeline v2 — Nuevos estados
-- ─────────────────────────────────────────────────────────
-- Antes:  lead, contactado, propuesta_enviada, negociando, activo, pausado, baja
-- Ahora:  lead, contactado, llamada_info, propuesta_enviada, negociando, llamada_onboarding, activo, pausado, eliminado
--
-- Cambios:
--   + Añadido: llamada_info (entre contactado y propuesta_enviada)
--   + Añadido: llamada_onboarding (entre negociando y activo)
--   ~ Renombrado: baja → eliminado

-- 1) Eliminar constraint viejo
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_estado_check;

-- 2) Renombrar 'baja' → 'eliminado' en filas existentes
UPDATE clientes SET estado = 'eliminado' WHERE estado = 'baja';

-- 3) Crear constraint nuevo con los 9 estados
ALTER TABLE clientes ADD CONSTRAINT clientes_estado_check
  CHECK (estado IN ('lead','contactado','llamada_info','propuesta_enviada','negociando','llamada_onboarding','activo','pausado','eliminado'));
