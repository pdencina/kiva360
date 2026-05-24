import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas permitidas por rol
const PERMISOS: Record<string, string[]> = {
  director:     ['/', '/dashboard', '/director', '/utp', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/reportes', '/cobranzas', '/comunicacion', '/familias', '/configuracion', '/personal', '/colaborativo', '/apoderado', '/integraciones'],
  utp:          ['/', '/dashboard', '/utp', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/reportes', '/comunicacion', '/colaborativo'],
  profesor:     ['/', '/dashboard', '/alumnos', '/libro', '/evaluaciones', '/planificacion', '/comunicacion', '/colaborativo'],
  apoderado:    ['/', '/dashboard', '/apoderado', '/comunicacion'],
  admin_kiva360:['*'],
}

// Ruta home por rol
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
  // Verificar prefijos (ej: /libro/3a también es /libro)
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

  // ── Sin sesión ────────────────────────────────────────────────
  if (!user) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register') ||
        pathname.startsWith('/reset-password') || pathname.startsWith('/update-password')) {
      return response
    }
    // Rutas protegidas → login
    const protegidas = ['/dashboard', '/director', '/utp', '/alumnos', '/libro',
      '/evaluaciones', '/planificacion', '/reportes', '/cobranzas', '/comunicacion',
      '/familias', '/configuracion', '/personal', '/colaborativo', '/apoderado',
      '/integraciones', '/onboarding']
    if (protegidas.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // ── Con sesión ────────────────────────────────────────────────

  // Redirigir login → dashboard
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Onboarding — no restringir
  if (pathname.startsWith('/onboarding')) return response

  // Obtener rol del perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, establecimiento_id')
    .eq('id', user.id)
    .single()

  // Sin perfil → onboarding
  if (!perfil) {
    if (!pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return response
  }

  // Sin establecimiento → onboarding
  if (!perfil.establecimiento_id && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  const rol = perfil.rol as string

  // Verificar acceso a la ruta actual
  const rutasProtegidas = ['/director', '/utp', '/alumnos', '/libro', '/evaluaciones',
    '/planificacion', '/reportes', '/cobranzas', '/comunicacion', '/familias',
    '/configuracion', '/personal', '/colaborativo', '/apoderado', '/integraciones']

  const estaEnRutaProtegida = rutasProtegidas.some(r => pathname.startsWith(r))

  if (estaEnRutaProtegida && !puedeAcceder(rol, pathname)) {
    // Redirigir al home del rol
    const home = HOME_ROL[rol] ?? '/dashboard'
    return NextResponse.redirect(new URL(home, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline).*)',
  ],
}
