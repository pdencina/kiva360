'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : error.message === 'Email not confirmed'
          ? 'Debes confirmar tu correo antes de ingresar'
          : 'Error al iniciar sesión. Intenta nuevamente.'
      )
      setLoading(false)
      return
    }

    // ⚠️ FIX CRÍTICO para Vercel:
    // router.refresh() fuerza a Next.js a re-leer las cookies del servidor
    // Sin esto, el middleware no ve la sesión nueva y redirige de vuelta al login
    router.refresh()

    // Pequeña espera para que las cookies se propaguen antes del redirect
    await new Promise(r => setTimeout(r, 100))

    // Verificar si hay un redirect pendiente en la URL
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect') ?? '/dashboard'

    router.push(redirect)
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="director@colegio.cl"
          required
          autoComplete="email"
          className="input"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-bold text-gray-700">Contraseña</label>
          <a href="/recover" className="text-xs text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="input"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'btn btn-primary w-full justify-center py-3 text-base mt-1',
          loading && 'opacity-60 cursor-not-allowed'
        )}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}