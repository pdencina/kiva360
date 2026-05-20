'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RegisterForm() {
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [exito,    setExito]    = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // 1. Crear usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      }
    })

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'Este correo ya tiene una cuenta. ¿Quieres ingresar?'
          : signUpError.message
      )
      setLoading(false)
      return
    }

    // 2. Si el email no necesita confirmación, ir directo al onboarding
    if (data.user && data.session) {
      window.location.href = '/onboarding'
      return
    }

    // 3. Si necesita confirmar email, mostrar mensaje
    setExito(true)
    setLoading(false)
  }

  if (exito) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📬</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Revisa tu correo
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Enviamos un enlace de confirmación a<br />
          <strong style={{ color: '#0A0A0A' }}>{email}</strong>
        </p>
        <p style={{ fontSize: '0.72rem', color: '#999' }}>
          ¿No llegó? Revisa tu carpeta de spam o{' '}
          <button
            onClick={() => setExito(false)}
            style={{ color: '#0A0A0A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.72rem', textDecoration: 'underline', fontFamily: 'inherit' }}
          >
            intenta de nuevo
          </button>
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .rf-group { margin-bottom: 1rem; }
        .rf-label { display: block; font-size: 0.72rem; font-weight: 500; color: #444; margin-bottom: 0.4rem; letter-spacing: -0.01em; }
        .rf-input { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid #E5E5E5; border-radius: 8px; font-size: 0.88rem; color: #0A0A0A; background: white; outline: none; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
        .rf-input::placeholder { color: #CCC; }
        .rf-input:focus { border-color: #0A0A0A; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
        .rf-error { padding: 0.65rem 0.85rem; background: #FFF5F5; border: 1px solid #FFE0E0; border-radius: 8px; font-size: 0.78rem; color: #CC0000; margin-bottom: 1rem; }
        .rf-btn { width: 100%; padding: 0.7rem; background: #0A0A0A; color: white; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: background 0.15s; margin-top: 0.5rem; }
        .rf-btn:hover:not(:disabled) { background: #222; }
        .rf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rf-terms { font-size: 0.68rem; color: #999; text-align: center; margin-top: 0.75rem; line-height: 1.5; }
        .rf-terms a { color: #666; text-decoration: underline; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rf-spin { display: inline-block; width: 13px; height: 13px; border: 1.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; margin-right: 0.4rem; }
      `}</style>

      <form onSubmit={handleRegister}>
        {error && <div className="rf-error">{error}</div>}

        <div className="rf-group">
          <label className="rf-label">Tu nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Director/a del colegio" required className="rf-input" autoComplete="name" />
        </div>

        <div className="rf-group">
          <label className="rf-label">Correo institucional</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@colegio.cl" required className="rf-input" autoComplete="email" />
        </div>

        <div className="rf-group">
          <label className="rf-label">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required className="rf-input" autoComplete="new-password" minLength={8} />
        </div>

        <button type="submit" disabled={loading} className="rf-btn">
          {loading ? <><span className="rf-spin" />Creando cuenta...</> : 'Crear cuenta gratis →'}
        </button>

        <p className="rf-terms">
          Al registrarte aceptas los{' '}
          <a href="/terminos">Términos de uso</a> y la{' '}
          <a href="/privacidad">Política de privacidad</a>
        </p>
      </form>
    </>
  )
}
