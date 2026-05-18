-- ═══════════════════════════════════════════════════════════════
-- KIVA360 — Migración 002: Row Level Security (RLS)
-- Garantiza que cada colegio ve SOLO sus propios datos
-- ═══════════════════════════════════════════════════════════════

-- ── Helper function: obtener establecimiento_id del usuario activo
CREATE OR REPLACE FUNCTION mi_establecimiento_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT establecimiento_id
  FROM perfiles
  WHERE id = auth.uid()
$$;

-- ── Habilitar RLS en todas las tablas ────────────────────────
ALTER TABLE establecimientos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia            ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sige_declaraciones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sae_postulantes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE junaeb_pae_registros  ENABLE ROW LEVEL SECURITY;

-- ── ESTABLECIMIENTOS ─────────────────────────────────────────
CREATE POLICY "ver_mi_establecimiento" ON establecimientos
  FOR SELECT USING (id = mi_establecimiento_id());

CREATE POLICY "actualizar_mi_establecimiento" ON establecimientos
  FOR UPDATE USING (id = mi_establecimiento_id());

-- ── PERFILES ──────────────────────────────────────────────────
CREATE POLICY "ver_perfiles_mismo_colegio" ON perfiles
  FOR SELECT USING (establecimiento_id = mi_establecimiento_id());

CREATE POLICY "actualizar_mi_perfil" ON perfiles
  FOR UPDATE USING (id = auth.uid());

-- ── CURSOS ────────────────────────────────────────────────────
CREATE POLICY "cursos_mismo_colegio" ON cursos
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── ALUMNOS ───────────────────────────────────────────────────
CREATE POLICY "alumnos_mismo_colegio" ON alumnos
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── ASISTENCIA ────────────────────────────────────────────────
CREATE POLICY "asistencia_mismo_colegio" ON asistencia
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── EVALUACIONES ──────────────────────────────────────────────
CREATE POLICY "evaluaciones_mismo_colegio" ON evaluaciones
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── NOTAS ─────────────────────────────────────────────────────
-- Las notas se filtran a través de la evaluación
CREATE POLICY "notas_mismo_colegio" ON notas
  FOR ALL USING (
    evaluacion_id IN (
      SELECT id FROM evaluaciones
      WHERE establecimiento_id = mi_establecimiento_id()
    )
  );

-- ── MENSAJES ──────────────────────────────────────────────────
-- Solo ves mensajes que enviaste o que son para ti
CREATE POLICY "mensajes_propios" ON mensajes
  FOR SELECT USING (
    establecimiento_id = mi_establecimiento_id()
    AND (de_usuario_id = auth.uid() OR para_usuario_id = auth.uid())
  );

CREATE POLICY "enviar_mensajes" ON mensajes
  FOR INSERT WITH CHECK (
    establecimiento_id = mi_establecimiento_id()
    AND de_usuario_id = auth.uid()
  );

-- ── SIGE ──────────────────────────────────────────────────────
CREATE POLICY "sige_mismo_colegio" ON sige_declaraciones
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── SAE ───────────────────────────────────────────────────────
CREATE POLICY "sae_mismo_colegio" ON sae_postulantes
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());

-- ── JUNAEB ────────────────────────────────────────────────────
CREATE POLICY "junaeb_mismo_colegio" ON junaeb_pae_registros
  FOR ALL USING (establecimiento_id = mi_establecimiento_id());
