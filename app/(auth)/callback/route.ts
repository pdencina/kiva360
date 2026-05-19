import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// Esta ruta maneja el intercambio del código de autenticación
// Supabase la necesita para establecer la sesión correctamente en producción
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()                { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirigir al destino original o al dashboard
      const redirectUrl = next.startsWith('/')
        ? `${origin}${next}`
        : next
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si algo salió mal, al login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}