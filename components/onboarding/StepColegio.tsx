'use client'

import { useActionState, useTransition } from 'react'
import { guardarColegio } from '@/lib/actions/onboarding'
import type { OnboardingState } from '@/lib/actions/onboarding'

interface Props { onSuccess: () => void }

const TIPOS = [
  { value: 'municipal',                label: 'Municipal' },
  { value: 'particular_subvencionado', label: 'Particular subvencionado' },
  { value: 'particular_pagado',        label: 'Particular pagado' },
]

const REGIONES = [
  'Metropolitana','Valparaíso','Biobío','Araucanía','Los Lagos',
  'O\'Higgins','Maule','Antofagasta','Coquimbo','Atacama',
  'Tarapacá','Arica y Parinacota','Los Ríos','Aysén','Magallanes','Ñuble',
]

const S = {
  wrap:    { padding: '2rem' } as React.CSSProperties,
  label:   { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' } as React.CSSProperties,
  input:   { width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: '#111827', transition: 'border-color 0.15s' } as React.CSSProperties,
  row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.9rem' } as React.CSSProperties,
  group:   { marginBottom: '0.9rem' } as React.CSSProperties,
  footer:  { display: 'flex', justifyContent: 'flex-end', paddingTop: '1.2rem', borderTop: '1px solid #F1F5F9' } as React.CSSProperties,
  btnPrim: { padding: '0.6rem 1.6rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' } as React.CSSProperties,
  error:   { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', padding: '0.7rem 1rem', fontSize: '0.78rem', color: '#DC2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } as React.CSSProperties,
}

const initial: OnboardingState = { error: null, success: false }

export function StepColegio({ onSuccess }: Props) {
  const [, startTransition] = useTransition()

  const [state, action, isPending] = useActionState(
    async (prev: OnboardingState, formData: FormData) => {
      const result = await guardarColegio(prev, formData)
      if (result.success) startTransition(() => onSuccess())
      return result
    },
    initial
  )

  return (
    <form action={action} style={S.wrap}>
      {/* Encabezado */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ width: '22px', height: '22px', background: '#EEF2FF', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#6366F1' }}>1</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6366F1' }}>Paso 1 de 4</span>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Cuéntanos sobre tu colegio
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
          Esta información se usa para conectar con SIGE, SAE y JUNAEB.
        </p>
      </div>

      {state.error && <div style={S.error}>⚠️ {state.error}</div>}

      <div style={S.row}>
        <div>
          <label style={S.label}>RBD <span style={{ color: '#EF4444' }}>*</span></label>
          <input name="rbd" style={{...S.input, borderColor: state.field === 'rbd' ? '#EF4444' : '#E5E7EB'}} placeholder="12345-6" required />
          <p style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.3rem' }}>Código MINEDUC del establecimiento</p>
        </div>
        <div>
          <label style={S.label}>Tipo <span style={{ color: '#EF4444' }}>*</span></label>
          <select name="tipo" style={S.input} defaultValue="particular_subvencionado" required>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div style={S.group}>
        <label style={S.label}>Nombre del establecimiento <span style={{ color: '#EF4444' }}>*</span></label>
        <input name="nombre" style={S.input} placeholder="Ej: Colegio San Patricio de Santiago" required />
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>Región <span style={{ color: '#EF4444' }}>*</span></label>
          <select name="region" style={S.input} defaultValue="Metropolitana" required>
            {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Comuna <span style={{ color: '#EF4444' }}>*</span></label>
          <input name="comuna" style={S.input} placeholder="Providencia" required />
        </div>
      </div>

      <div style={S.group}>
        <label style={S.label}>Nombre del director/a <span style={{ color: '#EF4444' }}>*</span></label>
        <input name="director" style={S.input} placeholder="Juan Pérez Soto" required />
      </div>

      <div style={S.footer}>
        <button type="submit" disabled={isPending} style={{ ...S.btnPrim, opacity: isPending ? 0.6 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}>
          {isPending ? 'Guardando...' : 'Siguiente →'}
        </button>
      </div>
    </form>
  )
}
