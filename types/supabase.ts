// Este archivo se genera automáticamente con:
// npm run db:types
// (que ejecuta: supabase gen types typescript --linked > types/supabase.ts)
//
// NO edites este archivo manualmente.
// Cada vez que cambies el schema en Supabase, vuelve a correr el comando.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      establecimientos: {
        Row: {
          id:            string
          rbd:           string
          nombre:        string
          tipo:          string | null
          region:        string | null
          comuna:        string | null
          director:      string | null
          plan:          string
          activo:        boolean
          creado_en:     string
        }
        Insert: {
          id?:           string
          rbd:           string
          nombre:        string
          tipo?:         string | null
          region?:       string | null
          comuna?:       string | null
          director?:     string | null
          plan?:         string
          activo?:       boolean
          creado_en?:    string
        }
        Update: {
          id?:           string
          rbd?:          string
          nombre?:       string
          tipo?:         string | null
          region?:       string | null
          comuna?:       string | null
          director?:     string | null
          plan?:         string
          activo?:       boolean
          creado_en?:    string
        }
      }
      perfiles: {
        Row: {
          id:                string
          establecimiento_id: string
          nombre:            string
          rol:               string
          rut:               string | null
          telefono:          string | null
          activo:            boolean
        }
        Insert: {
          id:                string
          establecimiento_id: string
          nombre:            string
          rol:               string
          rut?:              string | null
          telefono?:         string | null
          activo?:           boolean
        }
        Update: {
          id?:                string
          establecimiento_id?: string
          nombre?:            string
          rol?:               string
          rut?:               string | null
          telefono?:          string | null
          activo?:            boolean
        }
      }
      alumnos: {
        Row: {
          id:                string
          establecimiento_id: string
          rut:               string | null
          nombre:            string
          apellido_paterno:  string | null
          apellido_materno:  string | null
          fecha_nacimiento:  string | null
          curso_id:          string | null
          anio:              number
          prioridad_sinae:   number | null
          alumno_sep:        boolean
          beneficio_pae:     boolean
          beneficio_tne:     boolean
          origen_sae:        boolean
          prioridad_sae:     string | null
          creado_en:         string
        }
        Insert: Partial<Database['public']['Tables']['alumnos']['Row']> & {
          establecimiento_id: string
          nombre: string
          anio: number
        }
        Update: Partial<Database['public']['Tables']['alumnos']['Row']>
      }
    }
    Views:    {}
    Functions: {}
    Enums:    {}
  }
}
