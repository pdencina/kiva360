import { NextResponse, type NextRequest } from 'next/server'

// Middleware temporal para pruebas.
// Deja pasar todas las rutas mientras validamos login, dashboard y Supabase.
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
