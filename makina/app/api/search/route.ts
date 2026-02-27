import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) return NextResponse.json([]);

    const supabase = await createClient();

    // Search Clients
    const { data: clients } = await supabase
        .from("clients")
        .select("id, name, surname")
        .ilike("search_name", `%${query}%`) // Matches "Vito", "Jurjević", or "Vito Jurjević"
        .limit(5);

    // Search Vehicles
    const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, registration, make, model")
        .ilike("search_info", `%${query}%`) // Matches "Ford", "Focus", or "Ford Focus"
        .limit(5);

    // 3. Search Work Orders (ID or Description)
    const { data: orders } = await supabase
        .from("work_orders")
        .select("id, description")
        .or(`description.ilike.%${query}%`)
        .limit(5);

    const results = [
        ...(vehicles?.map(v => ({
            id: v.id, type: 'vehicle', title: v.registration, sub: `${v.make} ${v.model}`, url: `/dashboard/vehicles/${v.id}`
        })) || []),
        ...(clients?.map(c => ({
            id: c.id, type: 'client', title: `${c.name} ${c.surname}`, sub: c.phone_number || 'Klijent', url: `/dashboard/clients/${c.id}`
        })) || []),
        ...(orders?.map(o => ({
            id: o.id, type: 'order', title: `Nalog #${o.id}`, sub: o.description, url: `/dashboard/orders/${o.id}`
        })) || [])
    ];

    return NextResponse.json(results);
}