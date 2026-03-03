'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    Search, User, ChevronRight,
} from 'lucide-react'

export default function OrdersDashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [supabase])

    async function fetchOrders() {
        const { data } = await supabase
            .from('work_orders')
            .select(`*, vehicles (registration, make, model, clients (name, surname))`)
            .order('time_of_creation', { ascending: false })
        if (data) setOrders(data)
        setLoading(false)
    }

    // Filter orders based solely on the search term
    const filteredOrders = orders.filter(order => {
        const searchStr = `${order.vehicles?.registration} ${order.vehicles?.clients?.name} ${order.vehicles?.clients?.surname} ${order.description}`.toLowerCase()
        return searchStr.includes(searchTerm.toLowerCase())
    })

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase italic">Učitavanje...</div>

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">

            {/* HEADER & SEARCH */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Radni Nalozi</h1>
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Upravljanje aktivnim zahvatima</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder="PRETRAGA (REG, KLIJENT, OPIS)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest focus:border-slate-900 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* ORDERS LIST */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest italic">Nema rezultata</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                            className="relative bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col lg:flex-row items-center gap-8 hover:border-slate-900 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                        >
                            {/* REG & CAR */}
                            <div className="w-full lg:w-48 pointer-events-none">
                                <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg inline-block mb-1">
                                    <p className="text-xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                                        {order.vehicles?.registration}
                                    </p>
                                </div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight">
                                    {order.vehicles?.make} {order.vehicles?.model}
                                </p>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="flex-1 w-full text-left pointer-events-none">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={12} className="text-blue-600" />
                                    <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest">
                                        {order.vehicles?.clients?.name} {order.vehicles?.clients?.surname}
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-slate-600 italic line-clamp-2 leading-relaxed whitespace-pre-wrap">
                                    {order.description || 'Bez opisa zahvata...'}
                                </p>
                            </div>

                            {/* ARROW INDICATOR */}
                            <div className="hidden lg:flex w-11 h-11 items-center justify-center bg-slate-50 text-slate-300 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ChevronRight size={20} strokeWidth={3} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}