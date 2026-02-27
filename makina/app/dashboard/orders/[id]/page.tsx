'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { OrderPDF } from '@/components/pdf/OrderPDF'
import { ArrowLeft, Printer, FileText, Calendar, Car, User, Gauge } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailsPage() {
    const { id } = useParams()
    const supabase = createClient()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrder() {
            const { data } = await supabase
                .from('work_orders')
                .select(`*, vehicles (*, clients (*))`)
                .eq('id', id)
                .single()
            setOrder(data)
            setLoading(false)
        }
        fetchOrder()
    }, [id, supabase])

    if (loading || !order) return <div className="p-20 text-center font-black animate-pulse text-slate-300 italic uppercase">Učitavanje...</div>

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            {/* Header Nav */}
            <div className="flex justify-between items-center mb-10">
                <Link href="/dashboard/orders" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors">
                    <ArrowLeft size={14} /> Natrag na listu
                </Link>

                {/* PDF PRINT BUTTON */}
                <PDFDownloadLink
                    document={<OrderPDF order={order} />}
                    fileName={`Nalog_${order.vehicles.registration}_${id}.pdf`}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-100"
                >
                    {({ loading }) => (
                        <>
                            <Printer size={18} />
                            {loading ? 'PRIPREMA...' : 'ISPRINTAJ RADNI NALOG'}
                        </>
                    )}
                </PDFDownloadLink>
            </div>

            {/* Screen Preview of the Order */}
            <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="bg-slate-900 p-10 text-white flex justify-between items-end">
                    <div>
                        <p className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em] mb-2">Detalji Naloga</p>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">#{order.id}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                        <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase mt-1">
                            {order.status || 'OTVORENO'}
                        </span>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">Vozilo & Vlasnik</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                                <p className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">{order.vehicles.registration}</p>
                                <p className="font-bold text-slate-600 uppercase text-sm">{order.vehicles.make} {order.vehicles.model}</p>
                                <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                                    <User size={14} className="text-blue-600" />
                                    <p className="font-black uppercase text-xs">{order.vehicles.clients.name} {order.vehicles.clients.surname}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">Informacije</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Kilometraža</span>
                                    <span className="font-black text-slate-900">{order.distance?.toLocaleString()} KM</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Datum</span>
                                    <span className="font-black text-slate-900">{new Date(order.time_of_creation).toLocaleDateString('hr-HR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">Opis zahvata</h3>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-700 font-bold italic whitespace-pre-wrap leading-relaxed">
                                {order.description || 'Nema unesenog opisa.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}