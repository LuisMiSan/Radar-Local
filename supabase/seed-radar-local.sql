-- ============================================================
-- Radar Local Agency — Seed: Perfil piloto "Radar Local"
--
-- Este es TU propio perfil de negocio para probar el sistema.
-- Ejecutar DESPUÉS de migration.sql y seed.sql
-- ============================================================

-- ── Tu perfil como cliente ──────────────────────────────────

INSERT INTO clientes (
  id, nombre, negocio, email, telefono, direccion, web,
  pack, es_fundador, estado, notas, created_at, updated_at
) VALUES (
  'a1b2c3d4-0000-4000-8000-000000000000',
  'Radar Local',
  'Radar Local - Agencia GEO/AEO',
  'hola@radarlocal.es',
  '+34 600 000 000',
  'Madrid, España',
  'https://radarlocalmadrid.es',
  'autoridad_maps_ia',
  true,
  'activo',
  'Perfil piloto. Nuestro propio negocio como cliente de prueba para validar todos los agentes.',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  negocio = EXCLUDED.negocio,
  updated_at = now();

-- ── Perfil GBP de Radar Local ───────────────────────────────
-- Datos reales que deberás completar con tu perfil de Google Business Profile

INSERT INTO perfiles_gbp (
  id, cliente_id, google_business_id,
  nombre_gbp, categoria, descripcion,
  horarios, fotos_count, resenas_count, puntuacion,
  nap_nombre, nap_direccion, nap_telefono,
  url_maps, created_at, updated_at
) VALUES (
  'b1b2c3d4-0000-4000-8000-000000000000',
  'a1b2c3d4-0000-4000-8000-000000000000',
  NULL,  -- Pendiente: añadir el ID real de Google Business Profile
  'Radar Local',
  'Agencia de marketing',  -- Categoría actual (¿es la mejor?)
  'Agencia de posicionamiento local especializada en GEO y AEO. Preparamos negocios para que Gemini, ChatGPT y asistentes de voz los recomienden.',
  '{"lunes":"09:00-18:00","martes":"09:00-18:00","miercoles":"09:00-18:00","jueves":"09:00-18:00","viernes":"09:00-14:00"}',
  0,     -- fotos_count: ¿cuántas fotos tienes?
  0,     -- resenas_count: ¿cuántas reseñas?
  NULL,  -- puntuacion: ¿puntuación media?
  'Radar Local',
  'Madrid, España',  -- Dirección exacta pendiente
  '+34 600 000 000', -- Teléfono real pendiente
  NULL,  -- URL de Google Maps pendiente
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  nombre_gbp = EXCLUDED.nombre_gbp,
  categoria = EXCLUDED.categoria,
  descripcion = EXCLUDED.descripcion,
  updated_at = now();
