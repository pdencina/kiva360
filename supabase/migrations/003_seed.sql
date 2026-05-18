-- ═══════════════════════════════════════════════════════════════
-- KIVA360 — Migración 003: Seed de datos de prueba
-- Solo para entorno de desarrollo local
-- NUNCA ejecutar en producción
-- ═══════════════════════════════════════════════════════════════

-- ── Colegio de prueba ─────────────────────────────────────────
INSERT INTO establecimientos (id, rbd, nombre, tipo, region, comuna, director, plan) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '12345-6',
  'Colegio Demo Kiva360',
  'particular_subvencionado',
  'Metropolitana',
  'Santiago',
  'Juan Pérez Soto',
  'completo'
);

-- ── Cursos ────────────────────────────────────────────────────
INSERT INTO cursos (id, establecimiento_id, nombre, nivel, anio) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '1°A', '1° básico',  2025),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2°B', '2° básico',  2025),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '3°A', '3° básico',  2025),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '4°C', '4° básico',  2025),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '5°A', '5° básico',  2025),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'I°A', 'I° medio',   2025);

-- ── Alumnos de prueba en 3°A ──────────────────────────────────
INSERT INTO alumnos (establecimiento_id, rut, nombre, apellido_paterno, apellido_materno, curso_id, anio, prioridad_sinae, alumno_sep, beneficio_pae) VALUES
('00000000-0000-0000-0000-000000000001', '22345678-9', 'Sofía',   'Alarcón',  'Rojas',     '10000000-0000-0000-0000-000000000003', 2025, NULL, false, false),
('00000000-0000-0000-0000-000000000001', '22876543-2', 'Matías',  'Cárdenas', 'Pérez',     '10000000-0000-0000-0000-000000000003', 2025, 1,    true,  true),
('00000000-0000-0000-0000-000000000001', '23112876-K', 'Diego',   'Fuentes',  'Mora',      '10000000-0000-0000-0000-000000000003', 2025, 2,    true,  true),
('00000000-0000-0000-0000-000000000001', '23456789-0', 'Valentina','González','Torres',    '10000000-0000-0000-0000-000000000003', 2025, NULL, false, false),
('00000000-0000-0000-0000-000000000001', '23789012-3', 'Tomás',   'Herrera',  'Vidal',     '10000000-0000-0000-0000-000000000003', 2025, 3,    true,  true),
('00000000-0000-0000-0000-000000000001', '23012345-6', 'Isidora', 'López',    'Cifuentes', '10000000-0000-0000-0000-000000000003', 2025, NULL, false, false);

-- ── Evaluaciones de ejemplo ───────────────────────────────────
INSERT INTO evaluaciones (establecimiento_id, curso_id, asignatura, titulo, tipo, fecha, ponderacion, oa_asociados) VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
 'Matemáticas', 'Control de Fracciones', 'control', CURRENT_DATE, 20.0, ARRAY['OA3','OA5']),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005',
 'Lenguaje', 'Comprensión Lectora', 'prueba', CURRENT_DATE + 1, 30.0, ARRAY['OA1','OA2']);

-- ── Asistencia de ejemplo (semana actual) ─────────────────────
-- Se genera dinámicamente en la app. Aquí solo algunos registros de ejemplo.
-- (Los IDs de alumnos son los insertados arriba, se obtienen con un SELECT)
