'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import brands from '@/lib/data/brands.json'
import { SmartSearch } from '@/components/ui/combobox'
import { updateVehicleAction } from '../../actions'
import { Zap, ArrowLeft, Save, User, Gauge, Hash, Calendar, Plus, X, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function EditVehiclePage() {
    const { id } = useParams()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [dbData, setDbData] = useState<any>({ clients: [], engines: [], vehicles: [] })

    // Selection States
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [engineCode, setEngineCode] = useState<string>('')
    const [selectedBrand, setSelectedBrand] = useState<any>(null)
    const [selectedModel, setSelectedModel] = useState('')
    const [engineSpecs, setEngineSpecs] = useState({ displacement: '', power: '', fuel: 'Diesel' })
    const [vehicle, setVehicle] = useState<any>(null)

    // UI States for New Client
    const [isCreatingClient, setIsCreatingClient] = useState(false)
    const [newClient, setNewClient] = useState({ name: '', surname: '', phone: '' })

    useEffect(() => {
        async function loadData() {
            const [cl, en, ve, currentVe] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('engines').select('*'),
                supabase.from('vehicles').select('make, model'),
                supabase.from('vehicles').select('*, clients(*), engines(*)').eq('id', id).single()
            ])

            setDbData({
                clients: cl.data || [],
                engines: en.data || [],
                vehicles: ve.data || []
            })

            if (currentVe.data) {
                const v = currentVe.data
                setVehicle(v)
                setSelectedClientId(v.client_id || '')
                setEngineCode(v.engines?.code || '')
                setSelectedModel(v.model || '')
                setEngineSpecs({
                    displacement: v.engines?.displacement?.toString() || '',
                    power: v.engines?.power?.toString() || '',
                    fuel: v.engines?.fuel || 'Diesel'
                })

                const brand = brands.find(b => b.name === v.make)
                if (brand) setSelectedBrand({ id: brand.slug, label: brand.name, image: brand.image.thumb })
            }
            setLoading(false)
        }
        loadData()
    }, [id, supabase])

    const handleCreateClient = async () => {
        if (!newClient.name) return
        const { data, error } = await supabase
            .from('clients')
            .insert([{ name: newClient.name, surname: newClient.surname, phone_number: newClient.phone }])
            .select()
            .single()

        if (data) {
            setDbData({ ...dbData, clients: [data, ...dbData.clients] })
            setSelectedClientId(data.id)
            setIsCreatingClient(false)
        }
    }

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase italic">Učitavanje...</div>

    const modelOptions = dbData.vehicles
        .filter((v: any) => v.make === (selectedBrand?.label || vehicle?.make))
        .map((v: any) => ({ id: v.model, label: v.model }))
        .filter((v: any, i: number, self: any) => self.findIndex((t: any) => t.id === v.id) === i)

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20 bg-slate-50/30 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <Link href={`/dashboard/vehicles/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Odustani
                </Link>
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-blue-600 tracking-[0.2em] mb-1">Uređivanje vozila</p>
                    <p className="font-black text-slate-900 italic tracking-tighter uppercase text-xl leading-none">{vehicle?.registration || '---'}</p>
                </div>
            </div>

            <form action={updateVehicleAction} className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-900 overflow-hidden">
                <input type="hidden" name="vehicle_id" value={id} />

                {/* HEADER AREA */}
                <div className="bg-slate-900 p-10 text-white grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Registracija</label>
                        <input required name="registration" defaultValue={vehicle?.registration || ''} className="bg-transparent text-5xl font-black uppercase outline-none w-full focus:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-end space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Šasija (VIN)</label>
                        <input name="vin" defaultValue={vehicle?.vin || ''} className="bg-transparent text-xl font-mono font-bold uppercase outline-none w-full border-b border-slate-700 pb-2 focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                <div className="p-10 space-y-12">

                    {/* OWNER SECTION WITH CREATE OPTION */}
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                                <h3 className="font-black uppercase text-xs tracking-widest text-slate-900 italic">Vlasnik</h3>
                            </div>
                            {!isCreatingClient && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingClient(true)}
                                    className="flex items-center gap-2 text-[9px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all"
                                >
                                    <Plus size={12} /> Novi Klijent
                                </button>
                            )}
                        </div>

                        {isCreatingClient ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                                <input placeholder="IME" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} className="h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold uppercase text-xs outline-none focus:border-blue-500" />
                                <input placeholder="PREZIME" value={newClient.surname} onChange={e => setNewClient({ ...newClient, surname: e.target.value })} className="h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold uppercase text-xs outline-none focus:border-blue-500" />
                                <div className="flex gap-2">
                                    <input placeholder="MOBITEL" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} className="flex-1 h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold uppercase text-xs outline-none focus:border-blue-500" />
                                    <button type="button" onClick={handleCreateClient} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-colors"><UserPlus size={18} /></button>
                                    <button type="button" onClick={() => setIsCreatingClient(false)} className="bg-slate-200 text-slate-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><X size={18} /></button>
                                </div>
                            </div>
                        ) : (
                            <SmartSearch
                                label="Promijeni Klijenta"
                                placeholder="Traži..."
                                initialValue={vehicle?.clients ? `${vehicle.clients.name} ${vehicle.clients.surname}` : ''}
                                options={dbData.clients.map((c: any) => ({ id: c.id, label: `${c.name} ${c.surname}`, subLabel: c.phone_number }))}
                                onSelect={(opt: any) => setSelectedClientId(opt.id)}
                                onCreate={(val: string) => {
                                    setIsCreatingClient(true);
                                    setNewClient({ ...newClient, name: val.split(' ')[0] || '', surname: val.split(' ')[1] || '' })
                                }}
                            />
                        )}
                        <input type="hidden" name="client_id" value={selectedClientId || vehicle?.client_id || ''} />
                    </div>

                    {/* VEHICLE TECH DATA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                        <div className="space-y-2">
                            <SmartSearch
                                label="Marka"
                                initialValue={vehicle?.make || ''}
                                options={brands.map(b => ({ id: b.slug, label: b.name, image: b.image.thumb }))}
                                onSelect={(opt: any) => setSelectedBrand(opt)}
                            />
                            <input type="hidden" name="make" value={selectedBrand?.label || vehicle?.make || ''} />
                        </div>

                        <div className="space-y-2">
                            <SmartSearch
                                label="Model"
                                initialValue={selectedModel || ''}
                                options={modelOptions}
                                onSelect={(opt: any) => setSelectedModel(opt.label)}
                            />
                            <input type="hidden" name="model" value={selectedModel || ''} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Godište</label>
                                <input name="year" type="number" defaultValue={vehicle?.year || ''} className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">KM</label>
                                <input name="distance" type="number" defaultValue={vehicle?.distance || ''} className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* ENGINE DATA */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center"><Zap size={20} fill="currentColor" /></div>
                            <h3 className="font-black uppercase italic text-xl tracking-tighter">Specifikacija Motora</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900 p-8 rounded-[2.5rem] text-white">
                            <div>
                                <label className="text-[9px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Kod Motora</label>
                                <input name="engine_code" value={engineCode || ''} onChange={e => setEngineCode(e.target.value.toUpperCase())} className="w-full h-12 px-4 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold uppercase outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Zapremnina</label>
                                <input name="displacement" value={engineSpecs.displacement || ''} onChange={e => setEngineSpecs({ ...engineSpecs, displacement: e.target.value })} className="w-full h-12 px-4 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Snaga (kW)</label>
                                <input name="power" value={engineSpecs.power || ''} onChange={e => setEngineSpecs({ ...engineSpecs, power: e.target.value })} className="w-full h-12 px-4 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-blue-400 mb-2 block tracking-widest">Gorivo</label>
                                <select name="fuel" value={engineSpecs.fuel || 'Diesel'} onChange={e => setEngineSpecs({ ...engineSpecs, fuel: e.target.value })} className="w-full h-12 px-4 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500 appearance-none">
                                    <option value="Diesel">Diesel</option>
                                    <option value="Benzin">Benzin</option>
                                    <option value="Hibrid">Hibrid</option>
                                    <option value="Struja">Struja</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full h-24 bg-blue-600 hover:bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                        <Save size={28} /> SPREMI IZMJENE
                    </button>
                </div>
            </form>
        </div>
    )
}