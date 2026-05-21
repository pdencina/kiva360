export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCursosDelColegio } from '@/lib/actions/libro'
import { MovilAsistenciaClient } from '@/components/movil/MovilAsistenciaClient'

export default async function MovilAsistenciaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cursos = await getCursosDelColegio()

  return <MovilAsistenciaClient cursos={cursos} userEmail={user.email ?? ''} />
}
