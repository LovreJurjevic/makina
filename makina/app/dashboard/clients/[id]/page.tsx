'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, MapPin, Car, Save, Trash2, ArrowLeft, Plus } from 'lucide-react'

export default function ClientDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [client, setClient] = useState<any>(null)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function loadData() {
            // Fetch client and their vehicles in parallel
            const [clientRes, vehiclesRes] = await Promise.all([
                supabase.from('clients').select('*').eq('id', id).single(),
                supabase.from('vehicles').select('*').eq('client', id)
            ])

            if (clientRes.data) setClient(clientRes.data)
            if (vehiclesRes.data) setVehicles(vehiclesRes.data)
            setLoading(setLoading(false) as any)
        }
        loadData()
    }, [id, supabase])

    const handleUpdateClient = async () => {
        setIsSaving(true)
        const { error } = await supabase
            .from('clients')
            .update({
                name: client.name,
                surname: client.surname,
                phone_number: client.phone_number,
                address: client.address
            })
            .eq('id', id)

        setIsSaving(false)
        if (!error) alert('Podaci spremljeni!')
    }

    if (loading) return <div className="p-8 font-black uppercase italic opacity-20">Učitavanje...</div>

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Povratak
                </button>

            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Client Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl">
                        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mb-6">
                            <User size={40} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 leading-none">
                            Informacije o <span className="text-blue-600">Klijentu</span>
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Ime</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold focus:border-blue-500 outline-none transition-all"
                                    value={client?.name || ''}
                                    onChange={e => setClient({ ...client, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Prezime</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold focus:border-blue-500 outline-none transition-all"
                                    value={client?.surname || ''}
                                    onChange={e => setClient({ ...client, surname: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Mobitel</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 font-bold focus:border-blue-500 outline-none transition-all"
                                        value={client?.phone_number || ''}
                                        onChange={e => setClient({ ...client, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Adresa</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 font-bold focus:border-blue-500 outline-none transition-all"
                                        value={client?.address || ''}
                                        onChange={e => setClient({ ...client, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full">
                                <button
                                    onClick={handleUpdateClient}
                                    disabled={isSaving}
                                    className="flex items-center w-full gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    <Save size={18} /> {isSaving ? 'Spremanje...' : 'Spremi promjene'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right: Vehicles List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl min-h-[600px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                                Vozni <span className="text-blue-600">Park</span>
                            </h3>
                            <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">
                                <Plus size={14} /> Dodaj vozilo
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {vehicles.length === 0 ? (
                                <div className="col-span-2 py-20 text-center opacity-20">
                                    <Car size={48} className="mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Klijent trenutno nema registriranih vozila</p>
                                </div>
                            ) : vehicles.map(vehicle => (
                                <div
                                    key={vehicle.id}
                                    onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                                    className="group p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-blue-600 hover:bg-white transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Car size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg font-black text-xs tracking-tighter mb-4">
                                            {vehicle.registration}
                                        </div>
                                        <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                            {vehicle.make} {vehicle.model}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            Godina: {vehicle.year || 'N/A'} • {vehicle.engine || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}