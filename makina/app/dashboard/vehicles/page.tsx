'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Added for row navigation
import brands from '@/lib/data/brands.json'
import { Search, Edit2, Plus, User, Zap } from 'lucide-react'

export default function VehicleListPage() {
    const supabase = createClient()
    const router = useRouter() // Initialize router
    const [vehicles, setVehicles] = useState<any[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchVehicles() {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
          *,
          clients (*),
          companies (*),
          engines (*)
        `).order('make, model,year', { ascending: true })


            if (!error) setVehicles(data)
            setLoading(false)
        }
        fetchVehicles()
    }, [])

    const filteredVehicles = useMemo(() => {
        const q = query.toLowerCase()
        return vehicles.filter(v => {
            const clientName = `${v.clients?.name} ${v.clients?.surname} ${v.clients?.phonebook_name}`.toLowerCase()
            const companyInfo = `${v.companies?.name} ${v.companies?.oib}`.toLowerCase()

            return (
                v.registration?.toLowerCase().includes(q) ||
                v.vin?.toLowerCase().includes(q) ||
                v.make?.toLowerCase().includes(q) ||
                v.model?.toLowerCase().includes(q) ||
                v.engine?.toLowerCase().includes(q) ||
                clientName.includes(q) ||
                v.clients?.phone_number?.includes(q) ||
                companyInfo.includes(q)
            )
        })
    }, [query, vehicles])

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* HEADER & SEARCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                        MAKINA <span className="text-[#1d4ed8]">VEHICLES</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Sva vozila u bazi podataka</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Traži tablicu, ime, broj mobitela..."
                            className="w-full md:w-96 h-14 pl-12 pr-6 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all shadow-sm text-slate-900"
                        />
                    </div>
                    <Link href="/dashboard/vehicles/new" className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-200">
                        <Plus size={20} strokeWidth={4} /> NOVO VOZILO
                    </Link>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b-2 border-slate-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vozilo</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Klijent / Poduzeće</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Opcije</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredVehicles.map((vehicle) => {
                            const brandLogo = brands.find(b => b.name.toLowerCase() === vehicle.make?.toLowerCase())?.image.thumb

                            return (
                                <tr
                                    key={vehicle.id}
                                    // Row Click Handler: Navigates to full view
                                    onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2 shrink-0 group-hover:bg-white transition-colors">
                                                {brandLogo ? (
                                                    <img src={brandLogo} alt={vehicle.make} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Zap size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">
                                                    {vehicle.registration}
                                                </div>
                                                <div className="text-[11px] font-bold uppercase text-slate-400 italic">
                                                    {vehicle.make} {vehicle.model} <span className="text-blue-600 ml-1">({vehicle.year})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1 text-slate-900">
                                            <div className="flex items-center gap-2 font-bold">
                                                <User size={14} className="text-blue-500" />
                                                {`${vehicle.clients?.name} ${vehicle.clients?.surname}`}
                                            </div>
                                            <div className="text-xs font-mono font-medium text-slate-400">
                                                {vehicle.clients?.phone_number}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-6 text-right">
                                        {/* Edit Button: stopPropagation prevents the row click from triggering */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/dashboard/vehicles/edit/${vehicle.id}`);
                                            }}
                                            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}