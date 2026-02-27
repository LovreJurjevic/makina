'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Search, User, Car, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
    const supabase = createClient()
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function fetchClients() {
            // Fetch clients and count their vehicles in one go
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    *,
                    vehicles(count)
                `)
                .order('surname', { ascending: true })

            if (data) setClients(data)
            setLoading(false)
        }
        fetchClients()
    }, [supabase])

    const filteredClients = clients.filter(c =>
        `${c.name} ${c.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone_number?.includes(searchTerm)
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                        POPIS <span className="text-[#1d4ed8]">KLIJENATA</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
                        Ukupno registrirano: {clients.length} klijenta
                    </p>
                </div>

                <Link
                    href="/dashboard/clients/new"
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    <UserPlus size={18} /> Novi Klijent
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1d4ed8] transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="PRETRAŽI PO IMENU, PREZIMENU ILI BROJU MOBITELA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white border-2 border-slate-100 rounded-[2rem] font-bold uppercase tracking-wider text-sm outline-none focus:border-[#1d4ed8] shadow-sm transition-all"
                />
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Link
                            key={client.id}
                            href={`/dashboard/clients/${client.id}`}
                            className="group bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-[#1d4ed8] transition-all hover:shadow-2xl relative overflow-hidden"
                        >
                            {/* Background Icon Decoration */}
                            <User className="absolute -right-4 -bottom-4 text-slate-50 size-32 group-hover:text-blue-50 transition-colors" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-[#1d4ed8] transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <Car size={14} className="text-[#1d4ed8]" />
                                        <span className="font-black text-xs text-slate-900">
                                            {client.vehicles?.[0]?.count || 0}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-tight mb-2">
                                    {client.name} <span className="text-[#1d4ed8]">{client.surname}</span>
                                </h3>

                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Phone size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {client.phone_number || 'Nema broja'}
                                        </span>
                                    </div>
                                    <div className="pt-4 flex items-center gap-2 text-[#1d4ed8] font-black uppercase text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                        DETALJI PROFILA <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {filteredClients.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="font-black uppercase tracking-[0.3em] text-slate-300">Nema pronađenih klijenata</p>
                </div>
            )}
        </div>
    )
}