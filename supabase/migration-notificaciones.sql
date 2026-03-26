-- ══════════════════════════════════════════════════════════════
-- Tabla: notificaciones
-- Para el sistema de autonomía de agentes
-- Registra acciones auto-ejecutadas que el admin debe conocer
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL,                    -- 'tarea_auto_ejecutada', 'error_ejecucion', etc.
  nivel text DEFAULT 'info',             -- 'info', 'warning', 'error'
  titulo text NOT NULL,
  mensaje text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  tarea_id uuid,                         -- referencia opcional a tarea_ejecucion
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON notificaciones
  FOR ALL USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida) WHERE leida = false;
CREATE INDEX IF NOT EXISTS idx_notificaciones_cliente ON notificaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created ON notificaciones(created_at DESC);

-- ══════════════════════════════════════════════════════════════
-- Actualizar tabla tareas_ejecucion para soportar autonomía
-- Añadir columna nivel_autonomia si no existe
-- ══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tareas_ejecucion' AND column_name = 'nivel_autonomia'
  ) THEN
    ALTER TABLE tareas_ejecucion ADD COLUMN nivel_autonomia text DEFAULT 'aprobar';
  END IF;
END $$;
