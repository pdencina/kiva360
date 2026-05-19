'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const [email, setEmail] = useState('admin@kiva360.cl')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error ?? 'No se pudo iniciar sesión.')
      setLoading(false)
      return
    }

    window.location.replace('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="admin@kiva360.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input h-14 text-base rounded-2xl bg-gray-50 border-gray-100 focus:bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input h-14 text-base rounded-2xl bg-gray-50 border-gray-100 focus:bg-white"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'btn btn-primary w-full justify-center h-14 text-base mt-3 rounded-2xl shadow-lg shadow-primary-700/20',
          loading && 'opacity-60 cursor-not-allowed'
        )}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
