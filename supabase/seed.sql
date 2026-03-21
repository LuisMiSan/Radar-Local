-- ============================================================
-- Radar Local Agency — Seed Data
-- Ejecutar DESPUÉS de migration.sql
-- ============================================================

-- Insertar clientes (IDs fijos para referencias)
insert into clientes (id, nombre, negocio, email, telefono, direccion, web, pack, es_fundador, estado, notas, created_at, updated_at) values
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dra. María García', 'Clínica Dental Sonrisa', 'maria@clinicasonrisa.es', '+34 612 345 678', 'C/ Gran Vía 45, Madrid', 'https://clinicasonrisa.es', 'autoridad_maps_ia', true, 'activo', 'Cliente fundador. Alta prioridad.', '2025-01-15T10:00:00Z', '2025-03-01T14:30:00Z'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Carlos López', 'Fisioterapia López', 'carlos@fisiolopez.es', '+34 698 765 432', 'Av. Diagonal 120, Barcelona', 'https://fisiolopez.es', 'visibilidad_local', false, 'activo', null, '2025-02-10T09:00:00Z', '2025-02-28T11:00:00Z'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Ana Martínez', 'Veterinaria San Antón', 'ana@vetsananton.es', '+34 655 111 222', 'C/ Alcalá 78, Madrid', null, 'visibilidad_local', true, 'activo', 'Interesada en upgrade a Autoridad Maps.', '2025-01-20T08:30:00Z', '2025-03-05T16:00:00Z'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Pedro Sánchez', 'Taller Mecánico AutoFix', 'pedro@autofix.es', '+34 677 333 444', 'Polígono Industrial Sur 12, Valencia', 'https://autofix.es', 'autoridad_maps_ia', false, 'pausado', 'Pausado temporalmente por vacaciones.', '2025-02-01T12:00:00Z', '2025-03-01T10:00:00Z'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Laura Fernández', 'Centro Estético Bella', 'laura@centrobella.es', null, 'C/ Serrano 55, Madrid', 'https://centrobella.es', null, false, 'inactivo', 'Lead — pendiente de cerrar venta.', '2025-03-01T15:00:00Z', '2025-03-01T15:00:00Z');

-- Insertar perfiles GBP
insert into perfiles_gbp (id, cliente_id, google_business_id, nombre_gbp, categoria, descripcion, horarios, fotos_count, resenas_count, puntuacion, nap_nombre, nap_direccion, nap_telefono, url_maps, created_at, updated_at) values
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'ChIJ_fake_1', 'Clínica Dental Sonrisa', 'Dentista', 'Clínica dental especializada en implantología y ortodoncia en Gran Vía, Madrid.', '{"lunes":"09:00-20:00","martes":"09:00-20:00","miercoles":"09:00-20:00","jueves":"09:00-20:00","viernes":"09:00-14:00"}', 12, 87, 4.6, 'Clínica Dental Sonrisa', 'C/ Gran Vía 45, 28013 Madrid', '+34 612 345 678', 'https://maps.google.com/?cid=fake1', '2025-01-15T10:00:00Z', '2025-03-01T14:30:00Z'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0002-4000-8000-000000000002', 'ChIJ_fake_2', 'Fisioterapia López', 'Fisioterapeuta', 'Centro de fisioterapia deportiva y rehabilitación en Barcelona.', '{"lunes":"08:00-21:00","martes":"08:00-21:00","miercoles":"08:00-21:00","jueves":"08:00-21:00","viernes":"08:00-15:00"}', 5, 32, 4.2, 'Fisioterapia López', 'Av. Diagonal 120, 08018 Barcelona', '+34 698 765 432', 'https://maps.google.com/?cid=fake2', '2025-02-10T09:00:00Z', '2025-02-28T11:00:00Z'),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0003-4000-8000-000000000003', 'ChIJ_fake_3', 'Veterinaria San Antón', 'Veterinario', 'Clínica veterinaria con urgencias 24h en Alcalá, Madrid.', '{"lunes":"10:00-20:00","martes":"10:00-20:00","miercoles":"10:00-20:00","jueves":"10:00-20:00","viernes":"10:00-14:00","sabado":"10:00-13:00"}', 3, 15, 3.8, 'Veterinaria San Antón', 'C/ Alcalá 78, 28009 Madrid', '+34 655 111 222', 'https://maps.google.com/?cid=fake3', '2025-01-20T08:30:00Z', '2025-03-05T16:00:00Z');

-- Insertar tareas
insert into tareas (id, cliente_id, agente, tipo, estado, resultado, created_at, completed_at) values
  ('c1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'auditor_gbp', 'auditoria_inicial', 'completada', '{"puntuacion":72,"items_revisados":15,"problemas":4}', '2025-01-16T10:00:00Z', '2025-01-16T10:05:00Z'),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'optimizador_nap', 'correccion_nap', 'completada', '{"consistencia":"100%","directorios_actualizados":8}', '2025-01-17T09:00:00Z', '2025-01-17T09:15:00Z'),
  ('c1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', 'redactor_posts_gbp', 'post_mensual', 'en_progreso', null, '2025-03-01T08:00:00Z', null),
  ('c1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0002-4000-8000-000000000002', 'auditor_gbp', 'auditoria_inicial', 'completada', '{"puntuacion":58,"items_revisados":15,"problemas":7}', '2025-02-11T10:00:00Z', '2025-02-11T10:08:00Z'),
  ('c1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0002-4000-8000-000000000002', 'keywords_locales', 'investigacion_keywords', 'pendiente', null, '2025-03-05T12:00:00Z', null),
  ('c1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0003-4000-8000-000000000003', 'generador_schema', 'json_ld_basico', 'error', '{"error":"Web no accesible"}', '2025-02-20T14:00:00Z', null);
