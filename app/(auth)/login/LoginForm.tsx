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
        .f-group { margin-bottom: 1.1rem; }

        .f-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .f-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.9rem;
          color: white;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          -webkit-text-fill-color: white;
        }
        .f-input::placeholder { color: rgba(255,255,255,0.2); }
        .f-input:focus {
          background: rgba(245,158,11,0.05);
          border-color: rgba(245,158,11,0.35);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }
        .f-input:-webkit-autofill,
        .f-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #0d1117 inset;
          -webkit-text-fill-color: white;
        }

        .f-pass-wrap { position: relative; }
        .f-pass-wrap .f-input { padding-right: 3rem; }
        .f-eye {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          font-size: 0.9rem;
          transition: color 0.15s;
          padding: 0;
          line-height: 1;
        }
        .f-eye:hover { color: rgba(255,255,255,0.6); }

        .f-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .f-forgot {
          font-size: 0.72rem;
          color: rgba(245,158,11,0.7);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .f-forgot:hover { color: #F59E0B; }

        .f-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          font-size: 0.8rem;
          color: #FCA5A5;
          margin-bottom: 1rem;
        }

        .f-btn {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
          margin-top: 0.5rem;
        }
        .f-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .f-btn:hover::before { opacity: 1; }
        .f-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245,158,11,0.35); }
        .f-btn:active { transform: translateY(0); }
        .f-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .f-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .f-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .f-divider-text { font-size: 0.7rem; color: rgba(255,255,255,0.2); }

        .f-help {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          margin-top: 1.5rem;
        }
        .f-help a {
          color: rgba(245,158,11,0.7);
          text-decoration: none;
          font-weight: 500;
        }
        .f-help a:hover { color: #F59E0B; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .f-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
      `}</style>

      <form onSubmit={handleLogin}>
        {error && (
          <div className="f-error">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="f-group">
          <label className="f-label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="director@colegio.cl"
            required
            autoComplete="email"
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
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="f-input"
            />
            <button type="button" className="f-eye" onClick={() => setShowPass(s => !s)}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="f-btn">
          {loading
            ? <><span className="f-spinner" />Verificando...</>
            : 'Ingresar →'
          }
        </button>

        <p className="f-help">
          ¿Problemas para ingresar?{' '}
          <a href="mailto:soporte@kiva360.cl">Contactar soporte</a>
        </p>
      </form>
    </>
  )
}
