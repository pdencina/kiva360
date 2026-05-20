export const revalidate = 0
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCursosDelColegio } from '@/lib/actions/libro'
import { LibroClient } from '@/components/libro/LibroClient'
import { LibroSkeleton } from '@/components/libro/LibroSkeleton'

export const metadata: Metadata = { title: 'Libro de Clases' }

export default async function LibroPage() {
  const cursos = await getCursosDelColegio()

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#37352F', letterSpacing: '-0.03em', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📒 Libro de Clases Digital
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#9B9A97', fontWeight: 400 }}>
            Sin papel · Conforme MINEDUC · Sincronizado con SIGE
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 600, color: '#6B6B6B', background: '#F0F0EE', border: '1px solid #E8E8E5', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
          <span style={{ width: '6px', height: '6px', background: '#37352F', borderRadius: '50%', display: 'inline-block' }} />
          SIGE sincronizado
        </div>
      </div>

      {cursos.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E8E8E5', borderRadius: '10px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <h2 style={{ fontWeight: 600, color: '#37352F', marginBottom: '0.3rem', fontSize: '0.95rem' }}>No hay cursos configurados</h2>
          <p style={{ fontSize: '0.8rem', color: '#9B9A97' }}>
            Importa los cursos desde SIGE o créalos en Configuración.
          </p>
        </div>
      ) : (
        <Suspense fallback={<LibroSkeleton />}>
          <LibroClient cursos={cursos} />
        </Suspense>
      )}
    </div>
  )
}
