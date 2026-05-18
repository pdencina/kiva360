import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Tipado explícito para cookies de Supabase
type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

// Para React Server Components y Server Actions
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },

        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // En Server Components no se pueden setear cookies
            // El middleware/proxy se encarga de esto
          }
        },
      },
    }
  )
}

// Para operaciones admin (bypass RLS) — SOLO en Route Handlers seguros
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },

        setAll(_: CookieToSet[]) {
          // noop
        },
      },

      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
