'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : signInError.message === 'Email not confirmed'
          ? 'Confirma tu correo antes de ingresar'
          : 'Error al iniciar sesión'
      )
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <>
      <style>{`
        .f-group { margin-bottom: 1rem; }
        .f-label {
          display: block; font-size: 0.75rem; font-weight: 500;
          color: #444; margin-bottom: 0.4rem; letter-spacing: -0.01em;
        }
        .f-input {
          width: 100%; padding: 0.65rem 0.85rem;
          border: 1px solid #E5E5E5; border-radius: 8px;
          font-size: 0.88rem; color: #0A0A0A; background: white;
          outline: none; font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .f-input::placeholder { color: #CCC; }
        .f-input:focus {
          border-color: #0A0A0A;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
        }
        .f-pass-wrap { position: relative; }
        .f-pass-wrap .f-input { padding-right: 2.75rem; }
        .f-eye {
          position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #CCC; font-size: 0.82rem; transition: color 0.15s; padding: 0;
        }
        .f-eye:hover { color: #666; }
        .f-label-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .f-forgot {
          font-size: 0.72rem; color: #999; text-decoration: none;
          font-weight: 400; transition: color 0.15s;
        }
        .f-forgot:hover { color: #0A0A0A; }
        .f-error {
          padding: 0.65rem 0.85rem;
          background: #FFF5F5; border: 1px solid #FFE0E0; border-radius: 8px;
          font-size: 0.78rem; color: #CC0000; margin-bottom: 1rem;
        }
        .f-btn {
          width: 100%; padding: 0.7rem; margin-top: 0.5rem;
          background: #0A0A0A; color: white;
          border: none; border-radius: 8px;
          font-size: 0.88rem; font-weight: 500;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
        }
        .f-btn:hover:not(:disabled) { background: #222; }
        .f-btn:active:not(:disabled) { transform: scale(0.99); }
        .f-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .f-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.25rem 0; font-size: 0.72rem; color: #CCC;
        }
        .f-divider-line { flex: 1; height: 1px; background: #F0F0F0; }
        .f-help {
          text-align: center; font-size: 0.72rem; color: #999; margin-top: 1.25rem;
        }
        .f-help a { color: #666; text-decoration: none; }
        .f-help a:hover { color: #0A0A0A; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .f-spin {
          display: inline-block; width: 13px; height: 13px;
          border: 1.5px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          vertical-align: middle; margin-right: 0.4rem;
        }
      `}</style>

      <form onSubmit={handleLogin}>
        {error && <div className="f-error">{error}</div>}

        <div className="f-group">
          <label className="f-label">Correo electrónico</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="director@colegio.cl" required autoComplete="email"
            className="f-input"
          />
        </div>

        <div className="f-group">
          <div className="f-label-row">
            <label className="f-label" style={{ margin: 0 }}>Contraseña</label>
            <a href="/recover" className="f-forgot">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="f-pass-wrap">
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="f-input"
            />
            <button type="button" className="f-eye" onClick={() => setShowPass(s => !s)}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="f-btn">
          {loading ? <><span className="f-spin" />Verificando...</> : 'Ingresar →'}
        </button>

        <div className="f-help">
          ¿Problemas? <a href="mailto:soporte@kiva360.cl">Contactar soporte</a>
        </div>
      </form>
    </>
  )
}
