// ═══════════════════════════════════════════════════════════════
// components/libro/SelectorCurso.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

interface Curso { id: string; nombre: string; nivel: string }
interface Props  { cursos: Curso[]; activo: string; onChange: (id: string) => void }

export function SelectorCurso({ cursos, activo, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
      {cursos.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)} style={{
          padding: '0.35rem 0.9rem', borderRadius: '10px',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
          background: c.id === activo ? '#1976D2' : 'white',
          color:      c.id === activo ? 'white'   : '#475569',
          boxShadow:  c.id === activo ? '0 2px 8px rgba(25,118,210,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'all 0.15s',
        }}>
          {c.nombre}
        </button>
      ))}
    </div>
  )
}
