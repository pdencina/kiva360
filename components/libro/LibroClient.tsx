'use client'

import { useState } from 'react'
import { TabAsistencia } from './TabAsistencia'
import { TabNotas      } from './TabNotas'
import { TabHojaVida   } from './TabHojaVida'

type Tab = 'asistencia' | 'notas' | 'hojavida'
interface Curso { id: string; nombre: string; nivel: string }
interface Props  { cursos: Curso[] }

export function LibroClient({ cursos }: Props) {
  const [tab,    setTab]   = useState<Tab>('asistencia')
  const [curso,  setCurso] = useState<Curso>(cursos[0])
  const [alumno, setAlumno] = useState<string | null>(null)

  const abrirHoja = (id: string) => { setAlumno(id); setTab('hojavida') }

  const TABS = [
    { id: 'asistencia' as Tab, label: 'Asistencia'   },
    { id: 'notas'      as Tab, label: 'Notas'         },
    { id: 'hojavida'   as Tab, label: 'Hoja de Vida'  },
  ]

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '100%' }}>
      {/* Selector de cursos */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        {cursos.map(c => (
          <button key={c.id} onClick={() => { setCurso(c); setTab('asistencia') }} style={{
            padding: '0.32rem 0.85rem', borderRadius: '6px',
            fontSize: '0.78rem', fontWeight: c.id === curso.id ? 600 : 400,
            cursor: 'pointer', border: '1px solid',
            borderColor: c.id === curso.id ? '#37352F' : '#E8E8E5',
            background:  c.id === curso.id ? '#37352F' : 'white',
            color:        c.id === curso.id ? 'white'   : '#6B6B6B',
            transition: 'all 0.12s', fontFamily: 'inherit',
          }}>
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E5', marginBottom: '1rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.5rem 1rem', fontSize: '0.8rem',
            fontWeight: tab === t.id ? 600 : 400,
            border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: `2px solid ${tab === t.id ? '#37352F' : 'transparent'}`,
            color: tab === t.id ? '#37352F' : '#9B9A97',
            marginBottom: '-1px', fontFamily: 'inherit', transition: 'color 0.12s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'asistencia' && <TabAsistencia cursoId={curso.id} cursoNombre={curso.nombre} onVerHoja={abrirHoja} />}
      {tab === 'notas'      && <TabNotas      cursoId={curso.id} cursoNombre={curso.nombre} />}
      {tab === 'hojavida'   && <TabHojaVida   alumnoId={alumno}  onVolver={() => setTab('asistencia')} />}
    </div>
  )
}
