import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReviewClient from './ReviewClient'

export default async function ReviewPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: problem } = await supabase
    .from('problems')
    .select('*')
    .eq('id', questionId)
    .eq('user_id', user.id)
    .single()

  if (!problem) redirect('/dashboard')

  return <ReviewClient problem={problem} />
}