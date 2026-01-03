import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabaseServer'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  } else {
    redirect('/login')
  }
}

