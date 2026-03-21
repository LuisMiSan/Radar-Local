-- ============================================================
-- Radar Local Agency — Migración: Sistema de Tareas de Ejecución
--
-- PROPÓSITO: Los agentes ya no solo AUDITAN, ahora EJECUTAN.
-- Cada agente genera tareas concretas que se pueden:
--   - Ejecutar automáticamente (tipo = 'auto')
--   - Aprobar antes de ejecutar (tipo = 'revision')
--   - Hacer manualmente (tipo = 'manual')
--
-- FLUJO:
--   Agente audita → genera tareas → se ejecutan → se verifica
--
-- Ejecutar en Supabase SQL Editor DESPUÉS de migration.sql
-- ============================================================

-- ── Tabla principal: tareas ejecutables ─────────────────────

CREATE TABLE IF NOT EXISTS tareas_ejecucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  agente TEXT NOT NULL,                -- qué agente la generó (auditor_gbp, etc.)
  informe_id UUID REFERENCES informes(id) ON DELETE SET NULL,  -- auditoría que la originó

  -- Descripción de la tarea
  titulo TEXT NOT NULL,                -- "Añadir descripción a foto 3"
  descripcion TEXT NOT NULL,           -- Detalle de qué hacer y por qué
  categoria TEXT NOT NULL DEFAULT 'mejora',  -- mejora, correccion, creacion, verificacion

  -- Control de ejecución
  tipo TEXT NOT NULL DEFAULT 'revision'
    CHECK (tipo IN ('auto', 'revision', 'manual')),
    -- auto: el agente lo hace solo (ej: crear descripción de foto)
    -- revision: lo hace pero tú apruebas antes (ej: cambiar categoría GBP)
    -- manual: necesita intervención humana (ej: tomar fotos nuevas)

  prioridad TEXT NOT NULL DEFAULT 'media'
    CHECK (prioridad IN ('critica', 'alta', 'media', 'baja')),
    -- critica: afecta ranking directamente (nombre, categoría)
    -- alta: mejora significativa (descripción, fotos)
    -- media: mejora incremental (posts, atributos)
    -- baja: nice-to-have (Q&A, extras)

  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN (
      'pendiente',      -- generada, esperando acción
      'aprobada',       -- admin aprobó (solo para tipo=revision)
      'ejecutando',     -- agente está trabajando en ella
      'completada',     -- hecho y verificado
      'fallo',          -- se intentó pero falló
      'rechazada',      -- admin rechazó la acción
      'omitida'         -- no aplica / no se hará
    )),

  -- Datos de la acción
  campo_gbp TEXT,                      -- campo GBP afectado (descripcion, fotos, categoria...)
  valor_actual TEXT,                   -- valor actual del campo
  valor_propuesto TEXT,                -- valor que el agente propone
  accion_api JSONB,                    -- datos para la API de GBP (método, params)

  -- Resultado de la ejecución
  resultado TEXT,                      -- qué pasó cuando se ejecutó
  error TEXT,                          -- detalle del error si falló

  -- Aprobación (HITL)
  aprobado_por TEXT,                   -- quién aprobó (admin username)
  aprobado_en TIMESTAMPTZ,

  -- Timestamps
  ejecutado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Índices para consultas frecuentes ───────────────────────

CREATE INDEX IF NOT EXISTS idx_tareas_ejecucion_cliente
  ON tareas_ejecucion(cliente_id);

CREATE INDEX IF NOT EXISTS idx_tareas_ejecucion_estado
  ON tareas_ejecucion(estado);

CREATE INDEX IF NOT EXISTS idx_tareas_ejecucion_agente
  ON tareas_ejecucion(agente);

CREATE INDEX IF NOT EXISTS idx_tareas_ejecucion_tipo
  ON tareas_ejecucion(tipo);

-- Índice compuesto: "tareas pendientes de aprobación" (la query más frecuente)
CREATE INDEX IF NOT EXISTS idx_tareas_pendientes_revision
  ON tareas_ejecucion(estado, tipo)
  WHERE estado = 'pendiente' AND tipo = 'revision';

-- ── RLS (Row Level Security) ────────────────────────────────

ALTER TABLE tareas_ejecucion ENABLE ROW LEVEL SECURITY;

-- Política: lectura pública (el admin siempre puede ver)
CREATE POLICY "tareas_ejecucion_select" ON tareas_ejecucion
  FOR SELECT USING (true);

-- Política: inserción desde service_role (los agentes insertan)
CREATE POLICY "tareas_ejecucion_insert" ON tareas_ejecucion
  FOR INSERT WITH CHECK (true);

-- Política: actualización (aprobar, ejecutar, completar)
CREATE POLICY "tareas_ejecucion_update" ON tareas_ejecucion
  FOR UPDATE USING (true);

-- ── Trigger: actualizar updated_at automáticamente ──────────

CREATE OR REPLACE FUNCTION update_tareas_ejecucion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tareas_ejecucion_updated_at
  BEFORE UPDATE ON tareas_ejecucion
  FOR EACH ROW
  EXECUTE FUNCTION update_tareas_ejecucion_updated_at();

-- ── Vista: resumen de progreso por cliente ──────────────────
-- NOTA: Creada como SECURITY INVOKER para evitar el warning que tuvimos antes

CREATE OR REPLACE VIEW resumen_progreso_cliente
WITH (security_invoker = true) AS
SELECT
  cliente_id,
  agente,
  COUNT(*) AS total_tareas,
  COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
  COUNT(*) FILTER (WHERE estado = 'pendiente' AND tipo = 'revision') AS esperando_aprobacion,
  COUNT(*) FILTER (WHERE estado = 'ejecutando') AS en_ejecucion,
  COUNT(*) FILTER (WHERE estado = 'fallo') AS fallidas,
  ROUND(
    COUNT(*) FILTER (WHERE estado = 'completada')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE estado != 'rechazada' AND estado != 'omitida'), 0) * 100,
    1
  ) AS porcentaje_completado
FROM tareas_ejecucion
GROUP BY cliente_id, agente;
