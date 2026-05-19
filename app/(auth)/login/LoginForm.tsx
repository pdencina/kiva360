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
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
        .form-input { width: 100%; padding: 0.65rem 0.9rem; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 0.875rem; color: #111827; outline: none; transition: all 0.15s; font-family: inherit; background: white; }
        .form-input:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .form-input::placeholder { color: #9CA3AF; }
        .pass-wrap { position: relative; }
        .pass-toggle { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9CA3AF; font-size: 0.8rem; padding: 0; }
        .submit-btn { width: 100%; padding: 0.7rem; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; position: relative; overflow: hidden; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .error-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 9px; padding: 0.7rem 0.9rem; font-size: 0.78rem; color: #DC2626; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .divider { display: flex; align-items: center; gap: 0.8rem; margin: 1.2rem 0; }
        .divider-line { flex: 1; height: 1px; background: #F1F5F9; }
        .divider-text { font-size: 0.7rem; color: #CBD5E1; font-weight: 500; }
        .label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
        .forgot-link { font-size: 0.72rem; color: #6366F1; font-weight: 600; text-decoration: none; }
        .forgot-link:hover { text-decoration: underline; }
        .loading-dots::after { content: ''; animation: dots 1.2s steps(4,end) infinite; }
        @keyframes dots { 0%,100% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
      `}</style>

      <form onSubmit={handleLogin}>
        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="director@colegio.cl"
            required
            autoComplete="email"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <div className="label-row">
            <label className="form-label" style={{ margin: 0 }}>Contraseña</label>
            <a href="/recover" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="pass-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="form-input"
              style={{ paddingRight: '2.5rem' }}
            />
            <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '0.5rem' }}>
          {loading ? <span className="loading-dots">Ingresando</span> : 'Ingresar →'}
        </button>
      </form>
    </>
  )
}
