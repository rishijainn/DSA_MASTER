import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignupClient from './SignupClient'

export const dynamic = 'force-dynamic'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return <SignupClient />
}
