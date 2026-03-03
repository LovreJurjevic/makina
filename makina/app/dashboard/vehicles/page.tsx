'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import brands from '@/lib/data/brands.json'
import { Search, Edit2, Plus, User, Zap, ChevronRight, Phone } from 'lucide-react'

export default function VehicleListPage() {
    const supabase = createClient()
    const router = useRouter()
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
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* HEADER & SEARCH */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                        MAKINA <span className="text-[#1d4ed8]">VEHICLES</span>
                    </h1>
                    <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sva vozila u bazi podataka</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Traži tablicu, ime..."
                            className="w-full lg:w-96 h-12 sm:h-14 pl-12 pr-6 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl font-bold outline-none focus:border-blue-600 transition-all shadow-sm text-slate-900 text-sm sm:text-base"
                        />
                    </div>
                    <Link href="/dashboard/vehicles/new" className="h-12 sm:h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all shadow-lg shadow-blue-100">
                        <Plus size={18} strokeWidth={4} /> NOVO VOZILO
                    </Link>
                </div>
            </div>

            {/* MOBILE LIST VIEW (Visible only on small screens) */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {filteredVehicles.map((vehicle) => {
                    const brandLogo = brands.find(b => b.name.toLowerCase() === vehicle.make?.toLowerCase())?.image.thumb
                    return (
                        <div 
                            key={vehicle.id}
                            onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                            className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 border border-slate-100">
                                        {brandLogo ? <img src={brandLogo} alt="" className="w-full h-full object-contain" /> : <Zap size={16} className="text-slate-300" />}
                                    </div>
                                    <div>
                                        <div className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">{vehicle.registration}</div>
                                        <div className="text-[10px] font-bold uppercase text-slate-400 italic mt-1">{vehicle.make} {vehicle.model}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/vehicles/edit/${vehicle.id}`); }}
                                    className="p-2 bg-slate-50 text-slate-400 rounded-lg"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <User size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase text-slate-900">{vehicle.clients?.name} {vehicle.clients?.surname}</p>
                                        <p className="text-[10px] font-medium text-slate-400">{vehicle.clients?.phone_number}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* DESKTOP TABLE VIEW (Hidden on small screens) */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
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
                                    onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2 shrink-0 group-hover:bg-white transition-colors">
                                                {brandLogo ? <img src={brandLogo} alt={vehicle.make} className="w-full h-full object-contain" /> : <Zap size={20} className="text-slate-300" />}
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">{vehicle.registration}</div>
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
                                            <div className="text-xs font-mono font-medium text-slate-400">{vehicle.clients?.phone_number}</div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/vehicles/edit/${vehicle.id}`); }}
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

            {/* EMPTY STATE */}
            {!loading && filteredVehicles.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nema pronađenih vozila</p>
                </div>
            )}
        </div>
    )
}