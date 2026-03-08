-- =============================================
-- Radar Local Agency — Esquema de base de datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla: clientes
-- Datos del cliente y su pack contratado
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  negocio TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  web TEXT,
  pack TEXT CHECK (pack IN ('visibilidad_local', 'autoridad_maps_ia')),
  es_fundador BOOLEAN DEFAULT FALSE,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'pausado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: perfiles_gbp
-- Datos del perfil de Google Business del cliente
CREATE TABLE perfiles_gbp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  google_business_id TEXT,
  nombre_gbp TEXT,
  categoria TEXT,
  descripcion TEXT,
  horarios JSONB,
  fotos_count INT DEFAULT 0,
  resenas_count INT DEFAULT 0,
  puntuacion NUMERIC(2, 1),
  nap_nombre TEXT,
  nap_direccion TEXT,
  nap_telefono TEXT,
  url_maps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: tareas
-- Trabajo ejecutado por agentes para cada cliente
CREATE TABLE tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  agente TEXT NOT NULL,
  tipo TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'error')),
  resultado JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Tabla: metricas
-- Números mensuales del cliente (clics, llamadas, etc.)
CREATE TABLE metricas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  valor NUMERIC,
  fecha DATE DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: reportes
-- Informe mensual generado por IA
CREATE TABLE reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  contenido JSONB,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_perfiles_gbp_cliente ON perfiles_gbp(cliente_id);
CREATE INDEX idx_tareas_cliente ON tareas(cliente_id);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_metricas_cliente ON metricas(cliente_id);
CREATE INDEX idx_metricas_fecha ON metricas(fecha);
CREATE INDEX idx_reportes_cliente ON reportes(cliente_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_perfiles_gbp_updated_at
  BEFORE UPDATE ON perfiles_gbp
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
