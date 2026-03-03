'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    User, Hash, Gauge, Calendar, Wrench,
    ChevronRight, Edit3, ArrowLeft, Fuel, Activity, Building2, Car, Zap,
    Search, FilterX, FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

import brands from '@/lib/data/brands.json'

export default function VehicleDetailsPage() {
    const { id } = useParams()
    const supabase = createClient()
    const [vehicle, setVehicle] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        async function fetchVehicleData() {
            const { data: vData } = await supabase
                .from('vehicles')
                .select('*, clients(*), engines(*), companies(*)')
                .eq('id', id)
                .single()

            const { data: oData } = await supabase
                .from('work_orders')
                .select('*')
                .eq('vehicle', id)
                .order('time_of_creation', { ascending: false })

            if (vData) setVehicle(vData)
            if (oData) setOrders(oData)
            setLoading(false)
        }
        fetchVehicleData()
    }, [id, supabase])

    const filteredOrders = orders.filter(o =>
        o.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString().includes(searchTerm)
    )

    if (loading) return <div className="p-8 text-center font-black uppercase tracking-widest opacity-20 animate-pulse">Učitavanje...</div>
    if (!vehicle) return <div className="p-8 text-center font-black uppercase tracking-widest text-red-500">Vozilo nije pronađeno.</div>

    const brandLogo = brands.find(b => b.name.toLowerCase() === vehicle.make?.toLowerCase())?.image.thumb

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* TOP NAVIGATION / HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <Link href="/dashboard/vehicles" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={14} strokeWidth={3} /> Povratak na listu
                </Link>
                <Link href={`/dashboard/vehicles/edit/${vehicle.id}`} className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 px-6 py-3 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
                    <Edit3 size={16} /> Uredi Vozilo
                </Link>
            </div>

            {/* VEHICLE MAIN BANNER */}
            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white backdrop-blur-md rounded-3xl p-4 flex items-center justify-center border border-white/10 shrink-0">
                            {brandLogo ? <img src={brandLogo} alt="" className="w-full h-full object-contain" /> : <Car size={48} />}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2 sm:mb-4">
                                <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase italic">MAKINA DATABASE</span>
                                <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">ID: #{vehicle.id}</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none mb-2 sm:mb-4">
                                {vehicle.make} <span className="text-blue-500">{vehicle.model}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/60">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" />
                                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{vehicle.registration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash size={16} className="text-blue-500" />
                                    <span className="text-xs sm:text-sm font-mono tracking-tight">{vehicle.vin}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block h-24 w-px bg-white/10 mx-8"></div>

                    <div className="bg-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/10 lg:min-w-[300px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 sm:mb-4">Vlasnik / Klijent</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                {vehicle.companies ? <Building2 size={20} /> : <User size={20} />}
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-base sm:text-lg tracking-tight">
                                    {vehicle.companies ? vehicle.companies.name : `${vehicle.clients?.name} ${vehicle.clients?.surname}`}
                                </h3>
                                <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">
                                    {vehicle.companies ? `OIB: ${vehicle.companies.oib}` : vehicle.clients?.phone_number}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
            </div>

            {/* GRID SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* SPECIFICATIONS PANEL */}
                <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-6 flex items-center gap-3">
                            <Zap className="text-blue-600" size={24} /> Specifikacije
                        </h2>
                        <div className="space-y-1">
                            <SpecRow icon={<Calendar size={16} />} label="Godina Proizvodnje" value={vehicle.year} />
                            <SpecRow icon={<Fuel size={16} />} label="Gorivo" value={vehicle.fuel_type} />
                            <SpecRow icon={<Gauge size={16} />} label="Zapremnina (ccm)" value={vehicle.engines?.displacement} />
                            <SpecRow icon={<Activity size={16} />} label="Snaga (kW)" value={`${vehicle.engines?.power}`} />
                            <SpecRow icon={<Hash size={16} />} label="Oznaka Motora" value={vehicle.engines?.engine_code} />
                            <SpecRow icon={<Wrench size={16} />} label="Vrsta Pogona" value={vehicle.drive_type} />
                        </div>
                    </div>
                </div>

                {/* WORK ORDERS HISTORY */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
                            <HistoryIcon className="text-blue-600" size={28} /> Povijest Radova
                        </h2>
                        
                        {/* SEARCH INTERFACE */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                                <Search size={22} strokeWidth={3} />
                            </div>
                            <input
                                type="text"
                                placeholder="PRETRAŽI POVIJEST (NPR. 'KOČNICE', 'SERVIS', 'PUMPA'...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                /* Increased pl-16 to pl-20 to ensure text never touches the magnifying glass */
                                className="w-full bg-white border-2 border-slate-200 rounded-[2rem] py-6 pl-20 pr-8 font-black uppercase tracking-widest text-sm focus:border-slate-900 focus:outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-12 sm:p-20 text-center">
                                <FilterX size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nema zapisa o servisima</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href={`/dashboard/orders/${order.id}`}
                                    className="group bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border-2 border-slate-100 hover:border-blue-600 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm italic group-hover:bg-blue-600 transition-colors shrink-0">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={12} className="text-blue-600" />
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                        {format(new Date(order.time_of_creation), 'dd. MMMM yyyy.', { locale: hr })}
                                                    </span>
                                                </div>
                                                <h3 className="font-black uppercase text-slate-900 tracking-tight leading-none">
                                                    Radni Nalog
                                                </h3>
                                            </div>
                                        </div>
                                        <div className={`self-start sm:self-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            order.status === 'ZAVRŠENO' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {order.status || 'OTVORENO'}
                                        </div>
                                    </div>

                                    {order.description && (
                                        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 group-hover:bg-white transition-colors">
                                            <p className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                                                {order.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 sm:mt-6 flex justify-end items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">
                                        Detalji Naloga <ChevronRight size={14} strokeWidth={3} />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
                <span className="text-blue-600 opacity-70 shrink-0">{icon}</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-tight">{label}</span>
            </div>
            <span className="font-black text-slate-900 uppercase text-xs sm:text-sm tracking-tight text-right ml-4">{value || '---'}</span>
        </div>
    )
}

function HistoryIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}