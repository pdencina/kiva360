-- ═══════════════════════════════════════════════════════════════
-- KIVA360 — Migración 001: Schema principal
-- Ejecutar con: supabase db push
-- ═══════════════════════════════════════════════════════════════

-- ── Extensiones ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgsodium";     -- Para encriptar credenciales SIGE/JUNAEB

-- ── ESTABLECIMIENTOS (TENANTS) ────────────────────────────────
CREATE TABLE establecimientos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rbd             TEXT UNIQUE NOT NULL,
  nombre          TEXT NOT NULL,
  tipo            TEXT CHECK (tipo IN ('municipal','particular_subvencionado','particular_pagado')),
  region          TEXT,
  comuna          TEXT,
  director        TEXT,
  plan            TEXT NOT NULL DEFAULT 'basico'
                  CHECK (plan IN ('basico','completo','enterprise')),
  -- Credenciales MINEDUC (encriptadas con pgsodium)
  sige_user       TEXT,
  sige_pass_enc   BYTEA,
  sae_user        TEXT,
  sae_pass_enc    BYTEA,
  junaeb_user     TEXT,
  junaeb_pass_enc BYTEA,
  activo          BOOLEAN NOT NULL DEFAULT true,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PERFILES Y ROLES ──────────────────────────────────────────
CREATE TABLE perfiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  nombre              TEXT NOT NULL,
  rol                 TEXT NOT NULL
                      CHECK (rol IN ('director','utp','profesor','apoderado','alumno','admin_kiva360')),
  rut                 TEXT,
  telefono            TEXT,
  activo              BOOLEAN NOT NULL DEFAULT true,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CURSOS ────────────────────────────────────────────────────
CREATE TABLE cursos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  nombre              TEXT NOT NULL,   -- "3°A"
  nivel               TEXT NOT NULL,   -- "3° básico"
  anio                INT  NOT NULL,
  profesor_jefe_id    UUID REFERENCES perfiles,
  activo              BOOLEAN NOT NULL DEFAULT true
);

-- ── ALUMNOS ───────────────────────────────────────────────────
CREATE TABLE alumnos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  rut                 TEXT,
  nombre              TEXT NOT NULL,
  apellido_paterno    TEXT,
  apellido_materno    TEXT,
  fecha_nacimiento    DATE,
  curso_id            UUID REFERENCES cursos,
  anio                INT NOT NULL,
  -- JUNAEB / SEP
  prioridad_sinae     INT  CHECK (prioridad_sinae IN (1,2,3)),
  alumno_sep          BOOLEAN NOT NULL DEFAULT false,
  beneficio_pae       BOOLEAN NOT NULL DEFAULT false,
  beneficio_tne       BOOLEAN NOT NULL DEFAULT false,
  -- SAE
  origen_sae          BOOLEAN NOT NULL DEFAULT false,
  prioridad_sae       TEXT,
  activo              BOOLEAN NOT NULL DEFAULT true,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ASISTENCIA ────────────────────────────────────────────────
CREATE TABLE asistencia (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  alumno_id           UUID NOT NULL REFERENCES alumnos ON DELETE CASCADE,
  fecha               DATE NOT NULL,
  estado              TEXT NOT NULL CHECK (estado IN ('P','A','J')),
  declarado_sige      BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(alumno_id, fecha)
);

-- ── EVALUACIONES ──────────────────────────────────────────────
CREATE TABLE evaluaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  curso_id            UUID NOT NULL REFERENCES cursos ON DELETE CASCADE,
  asignatura          TEXT NOT NULL,
  titulo              TEXT NOT NULL,
  tipo                TEXT CHECK (tipo IN ('control','prueba','tarea','disertacion','proyecto')),
  fecha               DATE,
  ponderacion         NUMERIC(5,2),
  oa_asociados        TEXT[]  DEFAULT '{}',
  modalidad           TEXT    DEFAULT 'digital'
                      CHECK (modalidad IN ('digital','papel','mixta')),
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── NOTAS ─────────────────────────────────────────────────────
CREATE TABLE notas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id   UUID NOT NULL REFERENCES evaluaciones ON DELETE CASCADE,
  alumno_id       UUID NOT NULL REFERENCES alumnos  ON DELETE CASCADE,
  nota            NUMERIC(3,1) CHECK (nota BETWEEN 1.0 AND 7.0),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evaluacion_id, alumno_id)
);

-- ── MENSAJES (chat apoderados/docentes) ───────────────────────
CREATE TABLE mensajes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  de_usuario_id       UUID NOT NULL REFERENCES perfiles ON DELETE CASCADE,
  para_usuario_id     UUID NOT NULL REFERENCES perfiles ON DELETE CASCADE,
  contenido           TEXT NOT NULL,
  leido               BOOLEAN NOT NULL DEFAULT false,
  enviado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SIGE — DECLARACIONES ──────────────────────────────────────
CREATE TABLE sige_declaraciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  tipo                TEXT NOT NULL CHECK (tipo IN ('asistencia','matricula','actas')),
  periodo_inicio      DATE,
  periodo_fin         DATE,
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','enviando','enviado','error','confirmado')),
  errores             JSONB,
  enviado_en          TIMESTAMPTZ,
  respuesta_mineduc   JSONB,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SAE — POSTULANTES ─────────────────────────────────────────
CREATE TABLE sae_postulantes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  proceso_anio        INT  NOT NULL,
  rut_alumno          TEXT,
  nombre_alumno       TEXT,
  nivel_postulado     TEXT,
  prioridad           TEXT CHECK (prioridad IN ('hermano','prioritario','nee','funcionario','cercania','sorteo')),
  preferencia         INT,
  estado_matricula    TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado_matricula IN ('pendiente','matriculado','rechazo_apoderado','cupo_lleno')),
  importado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── JUNAEB — PAE ──────────────────────────────────────────────
CREATE TABLE junaeb_pae_registros (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id  UUID NOT NULL REFERENCES establecimientos ON DELETE CASCADE,
  fecha               DATE NOT NULL,
  raciones_desayuno   INT NOT NULL DEFAULT 0,
  raciones_almuerzo   INT NOT NULL DEFAULT 0,
  observaciones       TEXT,
  declarado_junaeb    BOOLEAN NOT NULL DEFAULT false,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(establecimiento_id, fecha)
);

-- ── ÍNDICES para performance ──────────────────────────────────
CREATE INDEX idx_perfiles_establecimiento ON perfiles(establecimiento_id);
CREATE INDEX idx_alumnos_establecimiento  ON alumnos(establecimiento_id);
CREATE INDEX idx_alumnos_curso            ON alumnos(curso_id);
CREATE INDEX idx_asistencia_alumno_fecha  ON asistencia(alumno_id, fecha);
CREATE INDEX idx_asistencia_fecha         ON asistencia(fecha);
CREATE INDEX idx_notas_evaluacion         ON notas(evaluacion_id);
CREATE INDEX idx_mensajes_para_usuario    ON mensajes(para_usuario_id);
CREATE INDEX idx_mensajes_enviado_en      ON mensajes(enviado_en DESC);
CREATE INDEX idx_sae_proceso              ON sae_postulantes(establecimiento_id, proceso_anio);
