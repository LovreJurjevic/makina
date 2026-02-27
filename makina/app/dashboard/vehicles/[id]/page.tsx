'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    User, Hash, Gauge, Calendar, Wrench,
    ChevronRight, Edit3, ArrowLeft, Fuel, Activity, Building2, Car, Zap,
    Diameter, Search, FilterX, FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { hr } from 'date-fns/locale'

// Polished GitHub logos from your brands.json array
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
                .select('*, clients(*), engines(*)')
                .eq('id', id)
                .single()

            const { data: oData } = await supabase
                .from('work_orders')
                .select('*')
                .eq('vehicle', id)
                .order('time_of_creation', { ascending: false })

            setVehicle(vData)
            setOrders(oData || [])
            setLoading(false)
        }
        fetchVehicleData()
    }, [id, supabase])

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase italic tracking-widest">Učitavanje...</div>
    if (!vehicle) return <div className="p-20 text-center font-black text-red-600 uppercase italic">Vozilo nije pronađeno.</div>

    const filteredOrders = orders.filter(order =>
        order.service_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const brandMatch = brands.find(b => b.slug === vehicle.make?.toLowerCase())
    const logoUrl = brandMatch?.image?.optimized || ''
    const engineData = vehicle.engines?.[0] || {}

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 bg-slate-50/50 min-h-screen">

            {/* TOP BAR */}
            <div className="flex justify-between items-center">
                <Link href="/dashboard/vehicles" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Natrag na popis
                </Link>
                <Link
                    href={`/dashboard/vehicles/edit/${id}`}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]"
                >
                    <Edit3 size={18} /> Uredi Podatke
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: IDENTITY CARD */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        {/* Header Branding */}
                        <div className="bg-slate-900 p-8 text-white">
                            <div className="flex justify-between items-center mb-6">
                                <div className="w-16 h-16 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner">
                                    <img src={logoUrl} alt={vehicle.make} className="w-full h-full object-contain" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xl text-blue-500 font-black italic tracking-tighter uppercase leading-none">{vehicle.make + " " + vehicle.model}</p>
                                </div>
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter leading-none text-center border-t border-slate-800 pt-6">
                                {vehicle.registration}
                            </h1>
                        </div>

                        {/* Owner & Mileage Info */}
                        <div className="p-6 space-y-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-3 text-slate-400">
                                    <User size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Vlasnik Vozila</span>
                                </div>
                                <p className="font-black text-2xl text-slate-900 leading-tight">
                                    {vehicle.clients?.name} {vehicle.clients?.surname}
                                </p>
                                <p className="text-sm font-bold text-slate-500 mt-1">{vehicle.clients?.phone_number}</p>

                                {vehicle.clients?.company_name && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
                                        <Building2 size={18} className="text-blue-600" />
                                        <p className="font-black text-xs text-slate-900 uppercase italic tracking-tight">{vehicle.clients.company_name}</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ENGINE SPECS - Integrated into Left Column for better balance */}
                    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                            <Wrench className="text-blue-600" size={20} />
                            <h3 className="text-lg font-black uppercase italic tracking-tighter">Specifikacije</h3>
                        </div>
                        <div className="space-y-1">
                            <SpecRow icon={<Activity size={14} />} label="Kod Motora" value={vehicle.engine || '---'} />
                            <SpecRow icon={<Hash size={14} />} label="VIN / Šasija" value={vehicle.vin || '---'} />
                            <SpecRow icon={<Calendar size={14} />} label="Godište" value={vehicle.year || '---'} />
                            <SpecRow icon={<Fuel size={14} />} label="Gorivo" value={vehicle.engines.fuel || '---'} />
                            <SpecRow icon={<Zap size={14} />} label="Snaga" value={vehicle.engines.power ? `${vehicle.engines.power} kW` : '---'} />
                            <SpecRow icon={<Diameter size={14} />} label="Zapremnina" value={vehicle.engines.displacement ? `${vehicle.engines.displacement} ccm` : '---'} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: HISTORY LOG */}
                <div className="lg:col-span-8 space-y-6">

                    {/* SEARCH INTERFACE */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Search size={22} strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="PRETRAŽI POVIJEST (NPR. 'KOČNICE', 'SERVIS', 'PUMPA'...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-2 border-slate-200 rounded-[2rem] py-6 pl-16 pr-8 font-black uppercase tracking-widest text-sm focus:border-slate-900 focus:outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                                <div className="flex justify-center mb-4 text-slate-200">
                                    <FilterX size={48} />
                                </div>
                                <p className="font-black uppercase text-slate-300 text-sm tracking-[0.4em]">
                                    {searchTerm ? 'Nema rezultata' : 'Nema povijesti radova'}
                                </p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/dashboard/orders/${order.id}`}
                                    className="flex flex-col p-8 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-slate-900 hover:shadow-2xl transition-all group"
                                >
                                    {/* Entry Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-50 gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                <Calendar size={24} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">Datum Servisa</p>
                                                <p className="font-black text-xl text-slate-900 italic tracking-tighter uppercase">
                                                    {format(new Date(order.time_of_creation), 'dd. MMMM yyyy.', { locale: hr })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center gap-3 self-start md:self-center">
                                            <Gauge size={18} className="text-blue-500" />
                                            <p className="text-lg font-black italic leading-none">{order.distance?.toLocaleString()} <span className="text-[10px] font-normal uppercase opacity-50">km</span></p>
                                        </div>
                                    </div>

                                    {/* Entry Title */}
                                    <div className="mb-6">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Zahvat</p>
                                        <h4 className="font-black text-slate-900 uppercase text-3xl leading-tight tracking-tighter group-hover:text-blue-600 transition-colors">
                                            {order.service_description}
                                        </h4>
                                    </div>

                                    {/* Entry Description - Prominent & Readable */}
                                    {order.description && (
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border-l-8 border-blue-500 relative overflow-hidden">
                                            <FileText size={60} className="absolute -right-2 -bottom-2 text-slate-900 opacity-[0.03] pointer-events-none" />
                                            <p className="text-[9px] font-black uppercase text-blue-600 tracking-[0.2em] mb-2">Napomene i detalji:</p>
                                            <p className="text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                                                {order.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-end items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">
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

function SpecRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
                <span className="text-blue-600 opacity-70">{icon}</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            </div>
            <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{value || '---'}</span>
        </div>
    )
}