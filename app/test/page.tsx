import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <pre style={{ padding: 24, whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(user, null, 2)}
    </pre>
  )
}
