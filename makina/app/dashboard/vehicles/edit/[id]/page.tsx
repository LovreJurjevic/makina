'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import brands from '@/lib/data/brands.json'
import { SmartSearch } from '@/components/ui/combobox'
import { updateVehicleAction } from '../../actions'
import { Zap, ArrowLeft, Save, User, Building2, Plus, X, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function EditVehiclePage() {
    const { id } = useParams()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    // Fetching companies along with other data
    const [dbData, setDbData] = useState<any>({ clients: [], companies: [], engines: [], vehicles: [] })

    // Selection States
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    // NEW STATE: Company OIB
    const [selectedCompanyOib, setSelectedCompanyOib] = useState<string>('')
    const [engineCode, setEngineCode] = useState<string>('')
    const [selectedBrand, setSelectedBrand] = useState<any>(null)
    const [selectedModel, setSelectedModel] = useState('')
    const [engineSpecs, setEngineSpecs] = useState({ displacement: '', power: '', fuel: 'Diesel' })
    const [vehicle, setVehicle] = useState<any>(null)

    // UI States for New Client/Company
    const [ui, setUi] = useState({ newClient: false, newCompany: false })
    const [newClient, setNewClient] = useState({ name: '', surname: '', phone: '' })

    useEffect(() => {
        async function loadData() {
            // Added fetch for companies
            const [cl, co, en, ve, currentVe] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('companies').select('*'),
                supabase.from('engines').select('*'),
                supabase.from('vehicles').select('make, model'),
                supabase.from('vehicles').select('*, clients(*), engines(*), companies(*)').eq('id', id).single()
            ])

            setDbData({
                clients: cl.data || [],
                companies: co.data || [],
                engines: en.data || [],
                vehicles: ve.data || []
            })

            if (currentVe.data) {
                const v = currentVe.data
                setVehicle(v)
                setSelectedClientId(v.client || '')
                // Set initial company OIB from vehicle data
                setSelectedCompanyOib(v.company_oib || '')
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

            {/* FORM CONTAINER WITH NEW STYLING */}
            <form action={updateVehicleAction} className="bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden text-slate-900">
                <input type="hidden" name="vehicle_id" value={id} />

                {/* HEADER AREA - IDENTICAL TO NEW VEHICLE FORM */}
                <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full text-left">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Registracija</label>
                        <input required name="registration" defaultValue={vehicle?.registration || ''} className="bg-transparent text-5xl font-black uppercase outline-none w-full placeholder:text-slate-800" />
                    </div>
                    <div className="w-full md:w-72 text-left">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">VIN</label>
                        <input name="vin" defaultValue={vehicle?.vin || ''} className="bg-transparent text-xl font-mono font-bold uppercase outline-none w-full border-b border-slate-700 pb-1" />
                    </div>
                </div>

                <div className="p-10 space-y-12 text-left">

                    {/* CLIENT & COMPANY SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <SmartSearch
                                label="Klijent (Vlasnik)"
                                placeholder="Traži..."
                                initialValue={vehicle?.clients ? `${vehicle.clients.name} ${vehicle.clients.surname}` : ''}
                                options={dbData.clients.map((c: any) => ({ id: c.id, label: c.phonebook_name || `${c.name} ${c.surname}`, subLabel: c.phone_number }))}
                                onSelect={(opt: any) => setSelectedClientId(opt.id)}
                                onCreate={() => setUi({ ...ui, newClient: true })}
                            />
                            <input type="hidden" name="client_id" value={selectedClientId || vehicle?.client_id || ''} />
                            <input type="hidden" name="is_new_client" value={ui.newClient.toString()} />
                            {ui.newClient && (
                                <div className="p-4 bg-slate-50 rounded-2xl grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 border-2 border-blue-100">
                                    <div className="col-span-2 flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-blue-600 uppercase">Novi Klijent</span>
                                        <button type="button" onClick={() => setUi({ ...ui, newClient: false })}><X size={14} /></button>
                                    </div>
                                    <input name="new_client_name" placeholder="Ime" className="form-input-minimal bg-white" />
                                    <input name="new_client_surname" placeholder="Prezime" className="form-input-minimal bg-white" />
                                    <input name="new_client_phonebook" placeholder="Ime u imeniku" className="form-input-minimal col-span-2 bg-white" />
                                    <input name="new_client_phone" placeholder="Mobitel" className="form-input-minimal col-span-2 bg-white" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <SmartSearch
                                label="Poduzeće"
                                placeholder="OIB ili Naziv..."
                                initialValue={dbData.companies.find((c: any) => c.oib === selectedCompanyOib)?.name || ''}
                                options={dbData.companies.map((c: any) => ({ id: c.oib, label: c.name, subLabel: c.oib }))}
                                onSelect={(opt: any) => setSelectedCompanyOib(opt.id)}
                                onCreate={() => setUi({ ...ui, newCompany: true })}
                            />
                            <input type="hidden" name="company_oib" value={selectedCompanyOib} />
                            <input type="hidden" name="is_new_company" value={ui.newCompany.toString()} />
                            {ui.newCompany && (
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 animate-in slide-in-from-top-2 border-2 border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-blue-600 uppercase">Novo Poduzeće</span>
                                        <button type="button" onClick={() => setUi({ ...ui, newCompany: false })}><X size={14} /></button>
                                    </div>
                                    <input name="new_company_oib" placeholder="OIB" className="form-input-minimal bg-white" />
                                    <input name="new_company_name" placeholder="Naziv Firme" className="form-input-minimal bg-white" />
                                    <input name="new_company_address" placeholder="Adresa" className="form-input-minimal bg-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE DETAILS */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <SmartSearch
                                    label="Marka Vozila"
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
                                    // Add this line below to catch any new model the user types!
                                    onCreate={(val: string) => setSelectedModel(val)}
                                />
                                {/* Best to keep this hidden so the user only interacts with the SmartSearch */}
                                <input type="hidden" name="model" value={selectedModel || ''} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Godište</label>
                                    <input name="year" type="number" defaultValue={vehicle?.year || ''} className="form-input-minimal h-14" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">KM</label>
                                    <input name="distance" type="number" defaultValue={vehicle?.distance || ''} className="form-input-minimal h-14" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENGINE SECTION - MATCHING NEW FORM STYLE */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap size={18} className="text-slate-900 fill-slate-900" />
                            <h3 className="font-black uppercase italic tracking-tighter text-lg">Podaci o motoru</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-4xl">
                            <div className="col-span-2 md:col-span-1">
                                <SmartSearch
                                    label="Kod Motora"
                                    initialValue={engineCode || ''}
                                    options={dbData.engines.map((e: any) => ({
                                        id: e.code,
                                        label: e.code,
                                        subLabel: `${e.displacement} ccm`,
                                        displacement: e.displacement,
                                        power: e.power,
                                        fuel: e.fuel
                                    }))}
                                    onSelect={(opt: any) => {
                                        setEngineCode(opt.label);
                                        setEngineSpecs({
                                            displacement: opt.displacement?.toString() || '',
                                            power: opt.power?.toString() || '',
                                            fuel: opt.fuel || 'Diesel'
                                        });
                                    }}
                                    onCreate={(val: string) => setEngineCode(val.toUpperCase())}
                                />
                                <input type="hidden" name="engine_code" value={engineCode} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">ccm</label>
                                <input
                                    name="displacement"
                                    value={engineSpecs.displacement}
                                    onChange={(e) => setEngineSpecs({ ...engineSpecs, displacement: e.target.value })}
                                    className="form-input-minimal h-12 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">kW</label>
                                <input
                                    name="power"
                                    value={engineSpecs.power}
                                    onChange={(e) => setEngineSpecs({ ...engineSpecs, power: e.target.value })}
                                    className="form-input-minimal h-12 bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Gorivo</label>
                                <select
                                    name="fuel"
                                    value={engineSpecs.fuel || 'Diesel'}
                                    onChange={(e) => setEngineSpecs({ ...engineSpecs, fuel: e.target.value })}
                                    className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold outline-none appearance-none"
                                >
                                    <option value="Diesel">Diesel</option>
                                    <option value="Benzin">Benzin</option>
                                    <option value="Hibrid">Hibrid</option>
                                    <option value="Struja">Struja</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON - IDENTICAL STYLE */}
                    <button type="submit" className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                        <Save size={20} /> SPREMI IZMJENE
                    </button>
                </div>
            </form>
        </div>
    )
}