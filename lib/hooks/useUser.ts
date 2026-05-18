'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Perfil } from '@/types'

interface UseUserReturn {
  user:    User | null
  perfil:  Perfil | null
  loading: boolean
  error:   string | null
}

export function useUser(): UseUserReturn {
  const [user,    setUser]    = useState<User | null>(null)
  const [perfil,  setPerfil]  = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(user)

        if (user) {
          const { data: perfil, error: perfilError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (perfilError) throw perfilError
          setPerfil(perfil as Perfil)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session) setPerfil(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, perfil, loading, error }
}
