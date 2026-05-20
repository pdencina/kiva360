import { createClient } from '@supabase/supabase-js'

// Cliente con service role — bypasea RLS
// SOLO usar en Server Actions críticas como onboarding
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
