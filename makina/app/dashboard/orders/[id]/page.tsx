'use client'

import { useEffect, useState, use as useReact } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { OrderPDF } from '@/components/pdf/OrderPDF'
import { 
    Printer, 
    FileCheck, 
    Car, 
    User, 
    Clock, 
    ChevronLeft, 
    Save, 
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function OrderPage({ params }: PageProps) {
    const resolvedParams = useReact(params);
    const orderId = resolvedParams.id;
    
    const router = useRouter()
    const supabase = createClient()
    
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function fetchOrder() {
            const { data: order } = await supabase
                .from('work_orders')
                .select(`
                    *, 
                    vehicles (
                        *, 
                        clients (*)
                    )
                `)
                .eq('id', orderId)
                .single()

            if (order) setData(order)
            setLoading(false)
        }
        fetchOrder()
    }, [orderId, supabase])

    async function handleUpdate() {
        setIsSaving(true)
        const { error } = await supabase
            .from('work_orders')
            .update({
                description: data.description,
            })
            .eq('id', orderId)
        
        if (!error) {
            // Optional: add a "Saved" toast or visual feedback here
            setIsSaving(false)
        }
    }

    if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest opacity-20 animate-pulse">Učitavanje...</div>
    if (!data) return <div className="p-10 text-center font-black uppercase tracking-widest text-red-500">Nalog nije pronađen.</div>

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
            
            {/* TOP NAVIGATION */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                    Povratak
                </button>

                <PDFDownloadLink 
                    document={<OrderPDF order={data} />} 
                    fileName={`Nalog_${data.vehicles.registration}.pdf`}
                    className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-900 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                >
                    <Printer size={14} /> Ispis Naloga
                </PDFDownloadLink>
            </div>

            {/* HEADER INFO */}
            <div className="bg-slate-900 p-6 sm:p-10 rounded-[2rem] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Radni Nalog <span className="text-blue-500">#{data.id}</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                         <p className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                            <Clock size={12} className="text-blue-500" /> {new Date(data.time_of_creation).toLocaleDateString('hr-HR')}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${data.status === 'ZAVRŠENO' ? 'bg-green-500' : 'bg-blue-600'}`}>
                            {data.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DESCRIPTION AREA */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm p-6 sm:p-8">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-4">
                            <FileCheck size={16} className="text-blue-600" /> Opis Zahvata i Radova
                        </label>
                        
                        <textarea 
                            className="w-full min-h-[300px] sm:min-h-[400px] bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 sm:p-8 font-bold text-lg sm:text-xl outline-none focus:border-blue-600 focus:bg-white transition-all italic leading-relaxed text-slate-800"
                            placeholder="Što je rađeno na vozilu?"
                            /* FIX: Using || '' to prevent the null error */
                            value={data.description || ''}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                        />

                        {/* BIG INTUITIVE SAVE BUTTON */}
                        <button 
                            onClick={handleUpdate}
                            disabled={isSaving}
                            className="w-full mt-6 h-16 sm:h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl sm:rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={24} /> 
                                    Spremi Promjene
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* SIDEBAR INFO */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-600 p-3 rounded-2xl text-white">
                                <Car size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vozilo</p>
                                <p className="font-black text-xl uppercase tracking-tighter italic">{data.vehicles.registration}</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-600 uppercase mb-4">{data.vehicles.make} {data.vehicles.model}</p>
                        
                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Klijent</p>
                                    <p className="font-bold text-sm uppercase">{data.vehicles.clients.name} {data.vehicles.clients.surname}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 text-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Pomoć</p>
                        <p className="text-xs font-bold text-blue-700 leading-relaxed italic">
                            Sve promjene u opisu će biti vidljive na PDF ispisu za klijenta.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}