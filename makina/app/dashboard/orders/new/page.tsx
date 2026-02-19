'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SmartSearch } from '@/components/ui/combobox'
import { Check, ClipboardList, User, Car, Gauge, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createWorkOrder } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewWorkOrder() {
    const supabase = createClient()
    const router = useRouter()

    // 1. Data States
    const [dbData, setDbData] = useState<any>({ vehicles: [], employees: [] })
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

    useEffect(() => {
        async function loadOrderData() {
            const [ve, em] = await Promise.all([
                supabase.from('vehicles').select('id, registration, make, model'),
                supabase.from('employees').select('id, name')
            ])
            setDbData({
                vehicles: ve.data || [],
                employees: em.data || []
            })
        }
        loadOrderData()
    }, [])

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-[#1d4ed8] font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Povratak
            </Link>
            <form action={createWorkOrder} method="POST" className="bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden text-slate-900">

                {/* HEADER SECTION */}
                <div className="bg-slate-900 p-10 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <ClipboardList className="text-blue-400" size={24} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Novi Radni Nalog</label>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter">OTVARANJE SERVISA</h2>
                </div>

                <div className="p-10 space-y-12 text-left">

                    {/* SECTION 1: VEHICLE & EMPLOYEE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <SmartSearch
                                label="Vozilo (Tablica)"
                                placeholder="Traži po tablici..."
                                options={dbData.vehicles.map((v: any) => ({
                                    id: v.id,
                                    label: v.registration,
                                    subLabel: `${v.make} ${v.model}`
                                }))}
                                onSelect={(opt: any) => setSelectedVehicleId(opt.id)}
                            />
                            <input type="hidden" name="vehicle" value={selectedVehicleId} />
                        </div>

                        <div className="space-y-4">
                            <SmartSearch
                                label="Mehaničar"
                                placeholder="Dodijeli zaposlenika..."
                                options={dbData.employees.map((e: any) => ({
                                    id: e.id,
                                    label: e.name
                                }))}
                                onSelect={(opt: any) => setSelectedEmployeeId(opt.id)}
                            />
                            <input type="hidden" name="employee" value={selectedEmployeeId} />
                        </div>
                    </div>

                    {/* SECTION 2: SERVICE DETAILS */}
                    <div className="pt-10 border-t border-slate-100 grid grid-cols-1 gap-8">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Opis Kvara / Zahtjev klijenta</label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Npr. izmjena ulja i filtera..."
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Trenutna Kilometraža</label>
                                <div className="relative">
                                    <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        name="distance"
                                        type="number"
                                        placeholder="150000"
                                        className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl outline-none focus:border-blue-600 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>


                        </div>
                    </div>



                    <button type="submit" className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                        <Check strokeWidth={4} /> OTVORI NALOG
                    </button>
                </div>
            </form>
        </div>
    )
}