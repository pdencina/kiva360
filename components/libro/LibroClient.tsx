// ═══════════════════════════════════════════════════════════════
// components/libro/LibroClient.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

import { useState } from 'react'
import { SelectorCurso    } from './SelectorCurso'
import { TabAsistencia    } from './TabAsistencia'
import { TabNotas         } from './TabNotas'
import { TabHojaVida      } from './TabHojaVida'

type Tab = 'asistencia' | 'notas' | 'hojavida'

interface Curso { id: string; nombre: string; nivel: string }
interface Props  { cursos: Curso[] }

export function LibroClient({ cursos }: Props) {
  const [tab,    setTab]   = useState<Tab>('asistencia')
  const [curso,  setCurso] = useState<Curso>(cursos[0])
  const [alumno, setAlumno] = useState<string | null>(null)

  const abrirHoja = (id: string) => { setAlumno(id); setTab('hojavida') }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'asistencia', label: 'Asistencia', icon: '✅' },
    { id: 'notas',      label: 'Notas',      icon: '📊' },
    { id: 'hojavida',   label: 'Hoja de Vida', icon: '📋' },
  ]

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui' }}>
      <SelectorCurso cursos={cursos} activo={curso.id} onChange={id => {
        const c = cursos.find(c => c.id === id)
        if (c) setCurso(c)
      }} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '1.2rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600,
            border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: tab === t.id ? '2.5px solid #1976D2' : '2.5px solid transparent',
            color: tab === t.id ? '#1976D2' : '#64748B',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'asistencia' && <TabAsistencia cursoId={curso.id} cursoNombre={curso.nombre} onVerHoja={abrirHoja} />}
      {tab === 'notas'      && <TabNotas      cursoId={curso.id} cursoNombre={curso.nombre} />}
      {tab === 'hojavida'   && <TabHojaVida   alumnoId={alumno}  onVolver={() => setTab('asistencia')} />}
    </div>
  )
}
