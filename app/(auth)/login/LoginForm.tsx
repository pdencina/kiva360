'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [debug,    setDebug]    = useState<string | null>(null)
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebug(null)

    try {
      const supabase = createClient()

      setDebug('1. Supabase client creado ✓')

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setDebug(`ERROR en signIn: ${signInError.message} (${signInError.status})`)
        setError(signInError.message)
        setLoading(false)
        return
      }

      setDebug(`2. Login OK ✓ — user: ${data.user?.email} — session: ${data.session ? 'SÍ' : 'NO'}`)

      if (!data.session) {
        setDebug('ERROR: Login OK pero sin sesión — revisa Email Confirmation en Supabase')
        setError('Sin sesión activa. ¿Confirmaste tu correo en Supabase?')
        setLoading(false)
        return
      }

      setDebug('3. Haciendo router.refresh()...')
      router.refresh()

      await new Promise(r => setTimeout(r, 300))

      setDebug('4. Redirigiendo a /dashboard...')
      router.push('/dashboard')

    } catch (err: any) {
      setDebug(`EXCEPCIÓN: ${err?.message ?? JSON.stringify(err)}`)
      setError('Error inesperado. Ver debug.')
      setLoading(false)
    }
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
          placeholder="admin@kiva360.cl"
          required
          autoComplete="email"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-bold text-gray-700">Contraseña</label>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* ── DEBUG BOX — quitar después de resolver ── */}
      {debug && (
        <div className="bg-gray-900 text-green-400 rounded-xl px-4 py-3 text-xs font-mono whitespace-pre-wrap">
          {debug}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-bold disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}