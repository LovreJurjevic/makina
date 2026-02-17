'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createFullVehicleAction(formData: FormData) {
    const supabase = await createClient()

    // 1. CLIENT LOGIC: Use existing or create new
    let clientId = formData.get('client_id')
    const isNewClient = formData.get('is_new_client') === 'true'

    if (isNewClient) {
        const { data: newClient, error: clientErr } = await supabase.from('clients').insert({
            name: formData.get('new_client_name'),
            surname: formData.get('new_client_surname'),
            phone_number: formData.get('new_client_phone'),
            phonebook_name: formData.get('new_client_phonebook'),
        }).select().single()
        if (clientErr) throw new Error(clientErr.message)
        clientId = newClient.id
    }

    // 2. COMPANY LOGIC: Use existing or create new
    let companyOib = formData.get('company_oib')
    const isNewCompany = formData.get('is_new_company') === 'true'

    if (isNewCompany) {
        const { error: compErr } = await supabase.from('companies').upsert({
            oib: formData.get('new_company_oib'),
            name: formData.get('new_company_name'),
            address: formData.get('new_company_address'),
        })
        if (compErr) throw new Error(compErr.message)
        companyOib = formData.get('new_company_oib')
    }

    // 3. ENGINE LOGIC: Learning Upsert
    const engineCode = formData.get('engine_code')?.toString().toUpperCase()
    if (engineCode) {
        await supabase.from('engines').upsert({
            code: engineCode,
            displacement: formData.get('displacement') ? parseInt(formData.get('displacement') as string) : null,
            power: formData.get('power') ? parseInt(formData.get('power') as string) : null,
            fuel: formData.get('fuel'),
        })
    }

    // 4. FINAL VEHICLE INSERT
    const { error: vehErr } = await supabase.from('vehicles').insert({
        registration: formData.get('registration')?.toString().toUpperCase(),
        vin: formData.get('vin')?.toString().toUpperCase(),
        make: formData.get('make'),
        model: formData.get('model'),
        year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
        distance: formData.get('distance') ? parseInt(formData.get('distance') as string) : null,
        client: clientId ? parseInt(clientId as string) : null,
        company: companyOib || null,
        engine: engineCode || null
    })

    if (vehErr) throw new Error(vehErr.message)

    revalidatePath('/dashboard')
    redirect('/dashboard')
}