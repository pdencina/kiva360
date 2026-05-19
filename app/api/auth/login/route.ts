import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Debes ingresar correo y contraseña.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message === 'Invalid login credentials'
              ? 'Correo o contraseña incorrectos'
              : error.message,
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error) {
    console.error('POST /api/auth/login error:', error)

    return NextResponse.json(
      { error: 'Error inesperado al iniciar sesión.' },
      { status: 500 }
    )
  }
}
