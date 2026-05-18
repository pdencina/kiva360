// ─────────────────────────────────────────────────────────────
// types/index.ts — Tipos principales de Kiva360
// Los tipos de Supabase se generan automáticamente en supabase.ts
// usando: npm run db:types
// ─────────────────────────────────────────────────────────────

// ── Roles del sistema ─────────────────────────────────────────
export type Rol =
  | 'director'
  | 'utp'
  | 'profesor'
  | 'apoderado'
  | 'alumno'
  | 'admin_kiva360'  // super-admin de la plataforma

// ── Plan del establecimiento ──────────────────────────────────
export type Plan = 'basico' | 'completo' | 'enterprise'

// ── Tipo de establecimiento ───────────────────────────────────
export type TipoEstablecimiento =
  | 'municipal'
  | 'particular_subvencionado'
  | 'particular_pagado'

// ── Estado asistencia ─────────────────────────────────────────
export type EstadoAsistencia = 'P' | 'A' | 'J'

// ── Prioridad SINAE/JUNAEB ────────────────────────────────────
export type PrioridadSINAE = 1 | 2 | 3

// ── Estado matrícula SAE ──────────────────────────────────────
export type EstadoMatriculaSAE =
  | 'pendiente'
  | 'matriculado'
  | 'rechazo_apoderado'
  | 'cupo_lleno'

// ── Establecimiento (tenant) ──────────────────────────────────
export interface Establecimiento {
  id:          string
  rbd:         string
  nombre:      string
  tipo:        TipoEstablecimiento
  region:      string
  comuna:      string
  director:    string | null
  plan:        Plan
  activo:      boolean
  creado_en:   string
}

// ── Perfil de usuario ─────────────────────────────────────────
export interface Perfil {
  id:                string
  establecimiento_id: string
  nombre:            string
  rol:               Rol
  rut:               string | null
  telefono:          string | null
  activo:            boolean
}

// ── Curso ─────────────────────────────────────────────────────
export interface Curso {
  id:                string
  establecimiento_id: string
  nombre:            string   // "3°A"
  nivel:             string   // "3° básico"
  anio:              number
  profesor_jefe_id:  string | null
}

// ── Alumno ────────────────────────────────────────────────────
export interface Alumno {
  id:                string
  establecimiento_id: string
  rut:               string | null
  nombre:            string
  apellido_paterno:  string | null
  apellido_materno:  string | null
  fecha_nacimiento:  string | null
  curso_id:          string | null
  anio:              number
  // JUNAEB / SEP
  prioridad_sinae:   PrioridadSINAE | null
  alumno_sep:        boolean
  beneficio_pae:     boolean
  beneficio_tne:     boolean
  // SAE
  origen_sae:        boolean
  prioridad_sae:     string | null
  creado_en:         string
}

// ── Asistencia ────────────────────────────────────────────────
export interface Asistencia {
  id:                string
  establecimiento_id: string
  alumno_id:         string
  fecha:             string
  estado:            EstadoAsistencia
  declarado_sige:    boolean
}

// ── Evaluación ────────────────────────────────────────────────
export interface Evaluacion {
  id:                string
  establecimiento_id: string
  curso_id:          string
  asignatura:        string
  titulo:            string
  tipo:              'control' | 'prueba' | 'tarea' | 'disertacion' | 'proyecto'
  fecha:             string | null
  ponderacion:       number | null
  oa_asociados:      string[]
  modalidad:         'digital' | 'papel' | 'mixta'
}

// ── Nota ──────────────────────────────────────────────────────
export interface Nota {
  id:            string
  evaluacion_id: string
  alumno_id:     string
  nota:          number | null
}

// ── Mensaje (chat familias) ───────────────────────────────────
export interface Mensaje {
  id:                string
  establecimiento_id: string
  de_usuario_id:     string
  para_usuario_id:   string
  contenido:         string
  leido:             boolean
  enviado_en:        string
}

// ── SIGE ──────────────────────────────────────────────────────
export interface SigeDeclaracion {
  id:                string
  establecimiento_id: string
  tipo:              'asistencia' | 'matricula' | 'actas'
  periodo_inicio:    string | null
  periodo_fin:       string | null
  estado:            'pendiente' | 'enviado' | 'error' | 'confirmado'
  errores:           SigeError[] | null
  enviado_en:        string | null
}

export interface SigeError {
  tipo:     'error' | 'aviso' | 'info'
  alumno?:  string
  campo?:   string
  mensaje:  string
}

// ── SAE ───────────────────────────────────────────────────────
export interface SaePostulante {
  id:                string
  establecimiento_id: string
  proceso_anio:      number
  rut_alumno:        string | null
  nombre_alumno:     string | null
  nivel_postulado:   string | null
  prioridad:         'hermano' | 'prioritario' | 'nee' | 'funcionario' | 'cercania' | 'sorteo'
  preferencia:       number
  estado_matricula:  EstadoMatriculaSAE
}

// ── JUNAEB ────────────────────────────────────────────────────
export interface JunaebPaeRegistro {
  id:                string
  establecimiento_id: string
  fecha:             string
  raciones_desayuno: number
  raciones_almuerzo: number
  observaciones:     string | null
  declarado_junaeb:  boolean
}
