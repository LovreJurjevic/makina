
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: vehicles } = await supabase.from('vehicles').select()

  return (
    <ul>
      {vehicles?.map((vehicle) => (
        <li key={vehicle.id}>{vehicle.vin}</li>
      ))}
    </ul>
  )
}
