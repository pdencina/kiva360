import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Setear en el request (para que otros middlewares lo vean)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. Crear nueva response con las cookies actualizadas
          supabaseResponse = NextResponse.next({ request })
          // 3. Setear en la response (para que el browser las guarde)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ⚠️ IMPORTANTE: usar getUser() en vez de getSession()
  // getSession() lee del JWT local y puede estar desactualizado
  // getUser() valida contra el servidor de Supabase — es el correcto
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas — no requieren sesión
  const rutasPublicas = ['/login', '/register', '/recover', '/auth/callback']
  const esPublica = rutasPublicas.some(r => pathname.startsWith(r))

  // Rutas protegidas — requieren sesión
  const rutasProtegidas = ['/dashboard', '/libro', '/evaluaciones',
    '/planificacion', '/comunicacion', '/integraciones', '/reportes',
    '/familias', '/curriculum', '/onboarding']
  const esProtegida = rutasProtegidas.some(r => pathname.startsWith(r))

  // Sin sesión + ruta protegida → login
  if (!user && esProtegida) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Guardar destino para redirigir después del login
    if (pathname !== '/') url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Con sesión + ruta de login/register → dashboard
  if (user && esPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // ⚠️ CRÍTICO: siempre retornar supabaseResponse (no NextResponse.next())
  // para que las cookies se propaguen correctamente en Vercel
  return supabaseResponse
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas de Next.js internos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}