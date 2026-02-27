'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import brands from '@/lib/data/brands.json'
import { SmartSearch } from '@/components/ui/combobox'
import { createFullVehicleAction } from '../actions'
import { Check, Zap, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SingleCardVehicleForm() {
    const supabase = createClient()

    const [dbData, setDbData] = useState<any>({
        clients: [], companies: [], engines: [], vehicles: []
    })

    // Selection States for Hidden Inputs
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [selectedCompanyOib, setSelectedCompanyOib] = useState<string>('')
    const [engineCode, setEngineCode] = useState<string>('')
    const [selectedBrand, setSelectedBrand] = useState<any>(null)
    const [selectedModel, setSelectedModel] = useState('')

    const [ui, setUi] = useState({ newClient: false, newCompany: false })
    const [engineSpecs, setEngineSpecs] = useState({ displacement: '', power: '', fuel: 'Diesel' })

    useEffect(() => {
        async function loadLearningData() {
            const [cl, co, en, ve] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('companies').select('*'),
                supabase.from('engines').select('*'),
                supabase.from('vehicles').select('make, model')
            ])
            setDbData({
                clients: cl.data || [],
                companies: co.data || [],
                engines: en.data || [],
                vehicles: ve.data || []
            })
        }
        loadLearningData()
        console.log('Loaded DB data for vehicle form:', dbData.companies)
    }, [])

    const modelOptions = dbData.vehicles
        .filter((v: any) => v.make === selectedBrand?.label)
        .map((v: any) => ({ id: v.model, label: v.model }))
        .filter((v: any, i: number, self: any) => self.findIndex((t: any) => t.id === v.id) === i)

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-[#1d4ed8] font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Povratak
            </Link>
            <form action={createFullVehicleAction} className="bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden text-slate-900">

                {/* HEADER */}
                <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full text-left">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Registracija</label>
                        <input required name="registration" placeholder="ZD000XX" className="bg-transparent text-5xl font-black uppercase outline-none w-full placeholder:text-slate-800" />
                    </div>
                    <div className="w-full md:w-72 text-left">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">VIN</label>
                        <input name="vin" placeholder="BROJ ŠASIJE..." className="bg-transparent text-xl font-mono font-bold uppercase outline-none w-full border-b border-slate-700 pb-1" />
                    </div>
                </div>

                <div className="p-10 space-y-12 text-left">

                    {/* CLIENT & COMPANY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <SmartSearch
                                label="Klijent (Vlasnik)"
                                placeholder="Traži..."
                                options={dbData.clients.map((c: any) => ({ id: c.id, label: c.phonebook_name || `${c.name} ${c.surname}`, subLabel: c.phone_number }))}
                                onSelect={(opt: any) => setSelectedClientId(opt.id)}
                                onCreate={() => setUi({ ...ui, newClient: true })}
                            />
                            <input type="hidden" name="client_id" value={selectedClientId} />
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
                                    placeholder="Traži marku..."
                                    options={brands.map(b => ({ id: b.slug, label: b.name, image: b.image.thumb }))}
                                    onSelect={(opt: any) => setSelectedBrand(opt)}
                                />
                                <input type="hidden" name="make" value={selectedBrand?.label || ''} />
                                {selectedBrand && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl border border-blue-100 mt-2">
                                        <img src={selectedBrand.image} className="w-8 h-8 object-contain" />
                                        <span className="text-xs font-black uppercase text-blue-700">{selectedBrand.label}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <SmartSearch
                                    label="Model"
                                    placeholder="Golf..."
                                    options={modelOptions}
                                    onSelect={(opt: any) => setSelectedModel(opt.label)}
                                />
                                <input type="hidden" name="model" value={selectedModel} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Godište</label>
                                    <input name="year" type="number" className="form-input-minimal h-14" placeholder="2020" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">KM</label>
                                    <input name="distance" type="number" className="form-input-minimal h-14" placeholder="150000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENGINE SECTION */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap size={18} className="text-slate-900 fill-slate-900" />
                            <h3 className="font-black uppercase italic tracking-tighter text-lg">Podaci o motoru</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-4xl">
                            <div className="col-span-2 md:col-span-1">
                                <SmartSearch
                                    label="Kod Motora"
                                    placeholder="CAYC..."
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
                                    className="form-input-minimal h-12 bg-white" placeholder="1598"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">kW</label>
                                <input
                                    name="power"
                                    value={engineSpecs.power}
                                    onChange={(e) => setEngineSpecs({ ...engineSpecs, power: e.target.value })}
                                    className="form-input-minimal h-12 bg-white" placeholder="77"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Gorivo</label>
                                <select
                                    name="fuel"
                                    value={engineSpecs.fuel}
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

                    <button type="submit" className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                        SPREMI VOZILO U RADIONU
                    </button>
                </div>
            </form>
        </div>
    )
}