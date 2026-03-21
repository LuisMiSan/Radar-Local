-- ─────────────────────────────────────────────────────────
-- Migración: Pipeline CRM
-- ─────────────────────────────────────────────────────────
-- 1. Elimina el CHECK constraint antiguo que solo permite 'activo','inactivo','pausado'
-- 2. Crea nuevo CHECK con todos los estados del pipeline
-- 3. Añade columna audit_id para vincular el lead con su auditoría
-- 4. Cambia 'inactivo' por 'lead' en datos existentes
-- 5. Añade columna pack_recomendado (del resultado de la auditoría)

-- Paso 1: Quitar el constraint antiguo de estado
-- (puede llamarse 'clientes_estado_check' o similar)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_estado_check;

-- Paso 2: Añadir nuevo constraint con todos los estados del pipeline
ALTER TABLE clientes ADD CONSTRAINT clientes_estado_check
  CHECK (estado IN ('lead', 'contactado', 'propuesta_enviada', 'negociando', 'activo', 'pausado', 'baja'));

-- Paso 3: Añadir columna audit_id (referencia a la auditoría que generó el lead)
-- Es opcional porque los clientes existentes no tienen auditoría
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS audit_id text DEFAULT NULL;

-- Paso 4: Añadir columna pack_recomendado (pack sugerido por la auditoría)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS pack_recomendado text DEFAULT NULL;

-- Paso 5: Migrar datos existentes ('inactivo' ya no existe → convertir a 'lead')
UPDATE clientes SET estado = 'lead' WHERE estado = 'inactivo';

-- Paso 6: Crear índice para búsquedas por estado (usado en la vista Kanban)
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);

-- Paso 7: Crear índice para búsqueda por audit_id
CREATE INDEX IF NOT EXISTS idx_clientes_audit_id ON clientes(audit_id);
