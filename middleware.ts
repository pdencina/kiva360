import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// KIVA360 — Middleware definitivo (sin loops)
// Regla de oro: el onboarding se decide SOLO por metadatos del
// usuario (onboarding_complete / establecimiento_id), nunca por
// una query a la tabla perfiles (el RLS puede bloquearla y causar loop).
// ═══════════════════════════════════════════════════════════════

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── 1. Rutas siempre públicas (incluye /onboarding) ──────────
  const PUBLICAS = ['/', '/login', '/register', '/reset-password', '/update-password', '/onboarding']
  const esPublica = PUBLICAS.some(r => pathname === r || pathname.startsWith(r + '/'))

  if (esPublica) {
    // Autenticado entrando a login/register → dashboard
    if (user && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // ── 2. Sin sesión → login ─────────────────────────────────────
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── 3. Onboarding incompleto → onboarding (SOLO por metadatos) ─
  const completo =
    user.user_metadata?.onboarding_complete === true ||
    !!user.user_metadata?.establecimiento_id

  if (!completo) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // ── 4. Todo OK → continuar ────────────────────────────────────
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|icons|manifest|sw.js|.*\\..*).*)',
  ],
}
