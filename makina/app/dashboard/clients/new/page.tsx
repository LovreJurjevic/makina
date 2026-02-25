'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const { error } = await supabase.from('clients').insert({
            name: formData.get('name'),
            surname: formData.get('surname'),
            phonebook_name: formData.get('phonebook_name'),
            phone_number: formData.get('phone_number'),
            address: formData.get('address'),
        })

        if (error) {
            alert('Greška: ' + error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-[#1d4ed8] font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Povratak
            </Link>

            <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-[#1d4ed8] rounded-2xl text-white shadow-lg shadow-blue-200">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">Novi Klijent</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unos podataka</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NAME */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ime</label>
                            <input name="name" placeholder="Ivan" className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#1d4ed8] focus:bg-white outline-none transition-all" />
                        </div>

                        {/* SURNAME */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Prezime</label>
                            <input name="surname" placeholder="Horvat" className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#1d4ed8] focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    {/* PHONEBOOK NAME - Important for his quick searching */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Naziv klijenta u telefonskom imeniku</label>
                        <input required name="phonebook_name" placeholder="Npr. Ivan Golf" className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#1d4ed8] focus:bg-white outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PHONE NUMBER */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Broj Mobitela</label>
                            <input required name="phone_number" type="tel" placeholder="+385 ..." className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#1d4ed8] focus:bg-white outline-none transition-all" />
                        </div>

                        {/* ADDRESS */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Adresa</label>
                            <input name="address" placeholder="Narodni trg 1, Zadar" className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-[#1d4ed8] focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 mt-4 bg-[#facc15] hover:bg-[#fde047] disabled:bg-slate-100 text-accent-foreground rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'SPREMI KLIJENTA'}
                    </button>
                </form>
            </div>
        </div>
    )
}