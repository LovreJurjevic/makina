'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createWorkOrder(formData: FormData) {
    const supabase = await createClient()

    // Extract data from FormData based on your SQL schema
    const rawFormData = {
        vehicle: parseInt(formData.get('vehicle') as string),
        employee: parseInt(formData.get('employee') as string),
        description: formData.get('description') as string,
        status: formData.get('status') as string,
        notes_from_worker: formData.get('notes_from_worker') as string,
        distance: parseInt(formData.get('distance') as string),
        time_of_creation: new Date().toISOString(),
    }

    // Insert into Supabase
    const { error } = await supabase
        .from('work_orders')
        .insert([rawFormData])

    if (error) {
        console.error('Error creating work order:', error)
        return { error: 'Failed to create work order' }
    }

    // Refresh the orders list and redirect
    revalidatePath('/dashboard/orders')
    redirect('/dashboard/orders')
}