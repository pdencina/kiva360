import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PERMISOS: Record<string, string[]> = {
  director:     ['/', '/dashboard', '/director', '/utp', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/reportes', '/cobranzas', '/comunicacion', '/familias', '/configuracion', '/personal', '/colaborativo', '/apoderado', '/admision', '/biblioteca'],
  utp:          ['/', '/dashboard', '/utp', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/reportes', '/comunicacion', '/colaborativo', '/biblioteca', '/admision'],
  profesor:     ['/', '/dashboard', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/comunicacion', '/colaborativo', '/biblioteca'],
  apoderado:    ['/', '/dashboard', '/apoderado', '/comunicacion'],
  admin_kiva360:['*'],
}

const HOME_ROL: Record<string, string> = {
  director:     '/dashboard',
  utp:          '/utp',
  profesor:     '/libro',
  apoderado:    '/apoderado',
  admin_kiva360:'/dashboard',
}

function puedeAcceder(rol: string, pathname: string): boolean {
  const permitidos = PERMISOS[rol]
  if (!permitidos) return false
  if (permitidos.includes('*')) return true
  return permitidos.some(ruta => pathname === ruta || pathname.startsWith(ruta + '/'))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Rutas públicas siempre accesibles ─────────────────────
  const rutasPublicas = ['/', '/login', '/register', '/reset-password', '/update-password', '/onboarding']
  if (rutasPublicas.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    // Si ya está autenticado y va al login → dashboard
    if (user && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // ── Rutas estáticas ────────────────────────────────────────
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') ||
      pathname.includes('.') || pathname.startsWith('/icons') ||
      pathname.startsWith('/manifest') || pathname.startsWith('/sw')) {
    return response
  }

  // ── Sin sesión → login ─────────────────────────────────────
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Con sesión — verificar onboarding ─────────────────────
  // Primero revisar metadatos del usuario (más rápido, sin query)
  const onboardingComplete = user.user_metadata?.onboarding_complete === true
  const metaEstId = user.user_metadata?.establecimiento_id

  // Si tiene metadatos completos, no ir al onboarding
  if (!onboardingComplete && !metaEstId) {
    // Solo redirigir si NO está ya en onboarding
    if (!pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return response
  }

  // ── Verificar rol para control de acceso ──────────────────
  const rol = user.user_metadata?.rol as string

  // Si no tiene rol en metadatos, leer perfil (fallback)
  if (!rol) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, establecimiento_id')
      .eq('id', user.id)
      .single()

    if (!perfil?.establecimiento_id) {
      if (!pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      return response
    }

    const rolPerfil = perfil.rol as string
    const rutasProtegidas = ['/director', '/utp', '/alumnos', '/libro', '/evaluaciones',
      '/planificacion', '/reportes', '/cobranzas', '/comunicacion', '/familias',
      '/configuracion', '/personal', '/colaborativo', '/apoderado', '/admision', '/biblioteca']

    if (rutasProtegidas.some(r => pathname.startsWith(r)) && !puedeAcceder(rolPerfil, pathname)) {
      return NextResponse.redirect(new URL(HOME_ROL[rolPerfil] ?? '/dashboard', request.url))
    }

    return response
  }

  // Rol desde metadatos — control de acceso
  const rutasProtegidas = ['/director', '/utp', '/alumnos', '/libro', '/evaluaciones',
    '/planificacion', '/reportes', '/cobranzas', '/comunicacion', '/familias',
    '/configuracion', '/personal', '/colaborativo', '/apoderado', '/admision', '/biblioteca']

  if (rutasProtegidas.some(r => pathname.startsWith(r)) && !puedeAcceder(rol, pathname)) {
    return NextResponse.redirect(new URL(HOME_ROL[rol] ?? '/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|icons|manifest|sw\\.js|offline).*)'],
}
