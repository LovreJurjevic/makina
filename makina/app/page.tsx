
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  redirect('/dashboard')

  const { data: vehicles } = await supabase.from('vehicles').select()

  return (
    <ul>
      {vehicles?.map((vehicle) => (
        <li key={vehicle.id}>{vehicle.vin}</li>
      ))}
    </ul>
  )
}
