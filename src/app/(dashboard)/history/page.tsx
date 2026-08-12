import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: problems } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return <HistoryClient problems={problems ?? []} />
}