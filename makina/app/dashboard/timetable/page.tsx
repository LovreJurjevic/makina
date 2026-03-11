'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, addMonths, getDay, startOfToday
} from 'date-fns'
import { hr } from 'date-fns/locale'
import { 
    ChevronLeft, ChevronRight, Plus, Clock, User, 
    Car, X, Calendar as CalendarIcon, Save, UserPlus, 
    Wrench, Phone, Target, Trash2
} from 'lucide-react'
import { SmartSearch } from '@/components/ui/combobox'
import { useRouter } from 'next/navigation'

export default function TimetablePage() {
    const supabase = createClient()
    const router = useRouter()
    
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(startOfToday())
    const [counts, setCounts] = useState<Record<string, number>>({})
    const [dayReservations, setDayReservations] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)

    const [dbData, setDbData] = useState<any>({ vehicles: [], clients: [] })
    
    const [newRes, setNewRes] = useState({ 
        vehicle_id: '', 
        client_id: '', 
        time: '08:00', 
        desc: '' 
    })

    const [isCreatingNew, setIsCreatingNew] = useState(false)
    const [newVehicleData, setNewVehicleData] = useState({ 
        registration: '', 
        make: '', 
        model: '', 
        name: '', 
        surname: '', 
        phone: '' 
    })

    const fetchData = useCallback(async () => {
        const [vRes, cRes] = await Promise.all([
            supabase.from('vehicles').select('*, clients(*)'),
            supabase.from('clients').select('*')
        ])
        setDbData({ vehicles: vRes.data || [], clients: cRes.data || [] })
    }, [supabase])

    useEffect(() => {
        fetchData()
        fetchMonthCounts()
        fetchDayDetails()
    }, [currentMonth, selectedDate, fetchData])

    async function fetchMonthCounts() {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const { data } = await supabase.from('reservations').select('scheduled_date').gte('scheduled_date', start).lte('scheduled_date', end)
        const tally: Record<string, number> = {}
        data?.forEach(r => tally[r.scheduled_date] = (tally[r.scheduled_date] || 0) + 1)
        setCounts(tally)
    }

    async function fetchDayDetails() {
        const { data } = await supabase
            .from('reservations')
            .select('*, clients(*), work_orders(id, vehicle(registration, make, model))')
            .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
            .order('scheduled_time', { ascending: true })
        setDayReservations(data || [])
    }

    const handleAddReservation = async () => {
        let finalVehicleId = newRes.vehicle_id;
        let finalClientId = newRes.client_id;

        // Validation based on mode
        if (!isCreatingNew && !finalVehicleId) {
            return alert("Molimo odaberite vozilo iz pretrage.");
        }
        if (isCreatingNew && (!newVehicleData.registration || !newVehicleData.name)) {
            return alert("Molimo unesite barem registraciju i ime vlasnika.");
        }

        if (isCreatingNew) {
            // 1. Create Client
            const { data: client } = await supabase.from('clients').insert({
                name: newVehicleData.name,
                surname: newVehicleData.surname,
                phone_number: newVehicleData.phone
            }).select().single();
            
            if (client) {
                finalClientId = client.id;
                // 2. Create Vehicle
                const { data: vehicle } = await supabase.from('vehicles').insert({
                    registration: newVehicleData.registration.toUpperCase(),
                    make: newVehicleData.make,
                    model: newVehicleData.model,
                    client: client.id // Maps to your schema structure
                }).select().single();
                if (vehicle) finalVehicleId = vehicle.id;
            }
        }

        // Final safety check in case DB insert fails
        if (!finalVehicleId) return alert("Dogodila se greška. Molimo pokušajte ponovno.");

        // 3. Create Reservation
        const { data: res } = await supabase.from('reservations').insert({
            scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
            scheduled_time: newRes.time,
            client_id: finalClientId,
            service_description: newRes.desc,
            status: 'PENDING'
        }).select().single()

        if (res) {
            // 4. Create Work Order
            await supabase.from('work_orders').insert({
                reservation_id: res.id,
                vehicle: finalVehicleId,
                description: newRes.desc,
                status: 'OTVORENO',
                time_of_creation: new Date().toISOString()
            })
            
            setShowAddModal(false)
            setIsCreatingNew(false)
            setNewRes({ vehicle_id: '', client_id: '', time: '08:00', desc: '' })
            setNewVehicleData({ registration: '', make: '', model: '', name: '', surname: '', phone: '' })
            fetchDayDetails()
            fetchMonthCounts()
            fetchData() // Refresh cache for smart search
        }
    }

    const handleDeleteReservation = async (e: React.MouseEvent, resId: string) => {
        e.stopPropagation(); // Prevents navigating to the order page when clicking delete
        if (!confirm('Jeste li sigurni da želite obrisati ovu narudžbu i pripadajući radni nalog?')) return;

        const { error: workOrderError } = await supabase.from('work_orders').delete().eq('reservation_id', resId);
        const { error: reservationError } = await supabase.from('reservations').delete().eq('id', resId);
        if (!workOrderError && !reservationError) {
            fetchDayDetails();
            fetchMonthCounts();
        } else {
            alert('Greška prilikom brisanja: ' + (workOrderError?.message || reservationError?.message));
        }
    }

    const formatMonthTitle = (date: Date) => {
        const monthName = format(date, 'MMMM', { locale: hr });
        const corrections: Record<string, string> = {
            'siječnja': 'Siječanj', 'veljače': 'Veljača', 'ožujka': 'Ožujak',
            'travnja': 'Travanj', 'svibnja': 'Svibanj', 'lipnja': 'Lipanj',
            'srpnja': 'Srpanj', 'kolovoza': 'Kolovoz', 'rujna': 'Rujan',
            'listopada': 'Listopad', 'studenoga': 'Studeni', 'prosinca': 'Prosinac'
        };
        return corrections[monthName.toLowerCase()] || monthName;
    }

    const goToToday = () => {
        const today = startOfToday();
        setCurrentMonth(today);
        setSelectedDate(today);
    }

    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
    const startDay = getDay(days[0])
    const blanks = Array.from({ length: (startDay + 6) % 7 }, (_, i) => i)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CALENDAR */}
                <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><ChevronLeft /></button>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter w-40 text-center">
                                {formatMonthTitle(currentMonth)}
                                <span className="block text-[10px] not-italic font-bold tracking-widest text-slate-300">{format(currentMonth, 'yyyy')}</span>
                            </h2>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><ChevronRight /></button>
                        </div>
                        
                        <button 
                            onClick={goToToday}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            <Target size={14} /> Danas
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-4">
                        {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {blanks.map(i => <div key={`b-${i}`} />)}
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const count = counts[dateStr] || 0
                            const isSel = isSameDay(day, selectedDate)
                            const isCurrToday = isToday(day)

                            return (
                                <button 
                                    key={dateStr}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group
                                        ${isSel ? 'bg-blue-600 text-white shadow-xl scale-105 z-10' : 'hover:bg-slate-50 text-slate-900'}
                                        ${isCurrToday && !isSel ? 'border-2 border-blue-600' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-black ${isCurrToday && !isSel ? 'text-blue-600' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {count > 0 && (
                                        <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-lg text-[9px] font-black 
                                            ${isSel ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'}
                                        `}>
                                            {count}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* DAY DETAILS */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between bg-slate-900 p-6 rounded-[2.5rem] text-white">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Pregled dana</p>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                                {format(selectedDate, 'dd. MMMM', { locale: hr })}
                            </h2>
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 p-4 rounded-2xl hover:bg-blue-500 transition-all shadow-lg"><Plus /></button>
                    </div>

                    <div className="space-y-4">
                        {dayReservations.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                <CalendarIcon className="mx-auto text-slate-200 mb-4" size={40} />
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nema zakazanih termina</p>
                            </div>
                        ) : (
                            dayReservations.map(res => (
                                <div 
                                    key={res.id} 
                                    onClick={() => router.push(`/dashboard/orders/${res.work_orders?.[0]?.id}`)}
                                    className="group bg-white p-5 rounded-[2rem] border-2 border-slate-100 flex items-start gap-5 cursor-pointer hover:border-blue-600 hover:shadow-xl transition-all"
                                >
                                    <div className="bg-blue-50 text-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 mt-1">
                                        {res.scheduled_time.slice(0,5)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black uppercase text-base tracking-tight truncate">{res.work_orders?.[0]?.vehicle?.registration}</span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase italic">
                                                {res.work_orders?.[0]?.vehicle?.make} {res.work_orders?.[0]?.vehicle?.model}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                                            <div className="flex items-center gap-1">
                                                <User size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest truncate">{res.clients?.name} {res.clients?.surname} ({res.clients?.phone_number})</span>
                                            </div>
                                        </div>
                                        {/* SERVICE DESCRIPTION SNIPPET */}
                                        {res.service_description && (
                                            <div className="text-[11px] font-bold text-slate-500 italic bg-slate-50 p-3 rounded-xl line-clamp-2">
                                                {res.service_description}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteReservation(e, res.id)}
                                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* MODAL */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl my-auto animate-in zoom-in-95 duration-200">
                            <div className="p-8 sm:p-12 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Nova <span className="text-blue-600">Narudžba</span></h3>
                                    <button onClick={() => {setShowAddModal(false); setIsCreatingNew(false)}} className="text-slate-300 hover:text-slate-900"><X size={32} /></button>
                                </div>

                                <div className="space-y-6">
                                    {!isCreatingNew ? (
                                        <div className="space-y-4">
                                            <SmartSearch 
                                                label="Pretraži Vozilo (Tablica)"
                                                options={dbData.vehicles.map((v: any) => ({
                                                    id: v.id, 
                                                    label: v.registration, 
                                                    subLabel: `${v.make} ${v.model} • ${v.clients?.name} ${v.clients?.surname}`, 
                                                    client_id: v.clients?.id || v.client_id || v.client // Ensures relationship extraction is safe
                                                }))}
                                                onSelect={(opt: any) => setNewRes({ ...newRes, vehicle_id: opt.id, client_id: opt.client_id })}
                                                onCreate={(val:any) => { setNewVehicleData({ ...newVehicleData, registration: val }); setIsCreatingNew(true); }}
                                            />
                                            {newRes.client_id && (
                                                <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700">
                                                    <User size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        Vlasnik: {dbData.clients.find((c:any) => c.id === newRes.client_id)?.name} {dbData.clients.find((c:any) => c.id === newRes.client_id)?.surname}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-blue-100 space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2"><UserPlus size={16}/> Brzi Unos Vozila i Klijenta</span>
                                                <button onClick={() => setIsCreatingNew(false)} className="text-[9px] font-bold uppercase text-slate-400 underline">Odustani</button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Registracija</label>
                                                    <input placeholder="ZD000XX" className="w-full h-14 px-6 rounded-2xl border-2 border-white font-black uppercase outline-none focus:border-blue-600" value={newVehicleData.registration} onChange={e => setNewVehicleData({...newVehicleData, registration: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Marka</label>
                                                    <input placeholder="npr. BMW" className="w-full h-14 px-6 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600" value={newVehicleData.make} onChange={e => setNewVehicleData({...newVehicleData, make: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Model</label>
                                                    <input placeholder="npr. Serija 3" className="w-full h-14 px-6 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600" value={newVehicleData.model} onChange={e => setNewVehicleData({...newVehicleData, model: e.target.value})} />
                                                </div>
                                                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Vlasnik (Ime i Prezime)</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input placeholder="Ime" className="h-14 px-6 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600" value={newVehicleData.name} onChange={e => setNewVehicleData({...newVehicleData, name: e.target.value})} />
                                                        <input placeholder="Prezime" className="h-14 px-6 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600" value={newVehicleData.surname} onChange={e => setNewVehicleData({...newVehicleData, surname: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Kontakt Mobitel</label>
                                                    <input placeholder="09x xxxx xxx" className="w-full h-14 px-6 rounded-2xl border-2 border-white font-bold outline-none focus:border-blue-600" value={newVehicleData.phone} onChange={e => setNewVehicleData({...newVehicleData, phone: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center gap-2"><Clock size={14}/> Vrijeme</label>
                                            <select 
                                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black outline-none focus:border-blue-600 appearance-none"
                                                value={newRes.time}
                                                onChange={e => setNewRes({ ...newRes, time: e.target.value })}
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => {
                                                    const h = 8 + i;
                                                    const timeStr = `${h < 10 ? '0' : ''}${h}:00`;
                                                    return <option key={timeStr} value={timeStr}>{timeStr}</option>
                                                })}
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center gap-2"><Wrench size={14}/> Opis Radova</label>
                                            <textarea 
                                                className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 font-bold text-lg outline-none focus:border-blue-600 transition-all italic"
                                                placeholder="Tip servisa, posebni zahtjevi klijenta..." 
                                                value={newRes.desc} 
                                                onChange={e => setNewRes({ ...newRes, desc: e.target.value })} 
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAddReservation} 
                                        className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Save size={20} /> POTVRDI I KREIRAJ NALOG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}