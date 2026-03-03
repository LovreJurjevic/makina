'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, addMonths, getDay, startOfToday
} from 'date-fns'
import { hr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Car, X, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
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
    const [clientVehicles, setClientVehicles] = useState<any[]>([])
    const [newRes, setNewRes] = useState({ vehicle_id: '', client_id: '', time: '08:00', desc: '' })

    const fetchCounts = useCallback(async () => {
        const first = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const last = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const { data } = await supabase
            .from('reservations')
            .select('scheduled_date')
            .gte('scheduled_date', first)
            .lte('scheduled_date', last)

        if (data) {
            const map = data.reduce((acc: any, r: any) => {
                acc[r.scheduled_date] = (acc[r.scheduled_date] || 0) + 1
                return acc
            }, {})
            setCounts(map)
        }
    }, [currentMonth, supabase])

    useEffect(() => { fetchCounts() }, [fetchCounts])

    useEffect(() => {
        async function fetchDayDetails() {
            const { data } = await supabase
                .from('reservations')
                .select(`
                    *, 
                    clients(name, surname, phone_number),
                    work_orders(id)
                `)
                .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
                .order('scheduled_time', { ascending: true })
            
            setDayReservations(data || [])
        }
        fetchDayDetails()
    }, [selectedDate, counts, supabase])

    useEffect(() => {
        async function loadOrderData() {
            const [ve, cl] = await Promise.all([
                supabase.from('vehicles').select('id, registration, make, model, client'),
                supabase.from('clients').select('id, name, surname, phone_number')
            ])
            setDbData({
                vehicles: ve.data || [],
                clients: cl.data || []
            })
        }
        loadOrderData()
    }, [supabase])

    useEffect(() => {
        if (newRes.client_id) {
            const filtered = dbData.vehicles.filter((v: any) => v.client === parseInt(newRes.client_id));
            setClientVehicles(filtered);
            setNewRes(prev => ({ ...prev, vehicle_id: '' }));
        } else {
            setClientVehicles([]);
        }
    }, [newRes.client_id, dbData.vehicles]);

    const handleAddReservation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: reservation, error: resError } = await supabase
            .from('reservations')
            .insert([{
                scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
                scheduled_time: newRes.time,
                client_id: parseInt(newRes.client_id),
                service_description: newRes.desc,
                user_id: user.id
            }])
            .select()
            .single();

        if (resError) {
            alert(`Greška: ${resError.message}`);
            return;
        }

        const { error: orderError } = await supabase
            .from('work_orders')
            .insert([{
                reservation_id: reservation.id,
                description: newRes.desc,
                status: 'OTVORENO',
                vehicle: newRes.vehicle_id ? parseInt(newRes.vehicle_id) : null,
                user_id: user.id,
                time_of_creation: new Date().toISOString()
            }]);

        if (orderError) console.error("Order creation failed:", orderError.message);

        setShowAddModal(false);
        fetchCounts();
        setNewRes({ vehicle_id: '', client_id: '', time: '08:00', desc: '' });
    };

    const handleDeleteReservation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Obustaviti rezervaciju i povezani nalog?')) return;
        await supabase.from('reservations').delete().eq('id', id);
        fetchCounts();
    };

    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
    const startDay = getDay(startOfMonth(currentMonth))
    const prefix = startDay === 0 ? 6 : startDay - 1

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-screen-2xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                        MAKINA <span className="text-[#1d4ed8]">CALENDAR</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-3">
                        TERMINI I RADNI NALOZI
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT GRID - flex-col-reverse on mobile puts panel below, lg:flex-row on desktop puts panel on right */}
            <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 min-h-[75vh]">
                
                {/* CALENDAR VIEW - Takes remaining space */}
                <div className="flex-1 bg-white rounded-[2rem] lg:rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-900 p-5 sm:p-6 lg:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto justify-between sm:justify-start">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter truncate">
                                {format(currentMonth, 'LLLL yyyy', { locale: hr })}
                            </h2>
                            <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(startOfToday()); }} className="bg-blue-600 px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shrink-0">Danas</button>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 sm:p-3 bg-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-colors"><ChevronLeft size={20} /></button>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 sm:p-3 bg-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 flex-1">
                        {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
                            <div key={d} className="bg-slate-50 p-2 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase text-slate-400 text-center border-b border-slate-100 truncate">{d}</div>
                        ))}
                        {[...Array(prefix)].map((_, i) => <div key={i} className="bg-slate-50/30 border-b border-r border-slate-50" />)}
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const count = counts[dateStr] || 0
                            const isSelected = isSameDay(day, selectedDate)
                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(day)}
                                    className={`min-h-[4rem] sm:min-h-[5.5rem] lg:min-h-32 p-2 sm:p-4 lg:p-6 border-b border-r border-slate-100 flex flex-col justify-between transition-all relative
                                    ${isSelected ? 'bg-blue-600 text-white z-10 shadow-inner' : 'hover:bg-slate-50 text-slate-900'}`}
                                >
                                    <span className={`text-sm sm:text-lg lg:text-xl font-black ${isToday(day) && !isSelected ? 'text-blue-600' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {count > 0 && (
                                        <div className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 self-start ${isSelected ? 'bg-white text-blue-600' : 'bg-slate-900 text-white'}`}>
                                            {count} <Car size={10} className="sm:w-3 sm:h-3" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* SIDE DETAIL PANEL - Moves to the right on lg screens */}
                <div className="w-full lg:w-[380px] xl:w-[450px] space-y-6">
                    <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 border-2 border-slate-100 shadow-xl flex flex-col h-full min-h-[500px] lg:min-h-0">
                        <div className="flex justify-between items-start mb-6 lg:mb-8">
                            <div>
                                <p className="text-[9px] lg:text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1 leading-none">
                                    {format(selectedDate, 'EEEE', { locale: hr })}
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
                                    {format(selectedDate, 'dd. MMMM', { locale: hr })}
                                </h3>
                            </div>
                            <button onClick={() => setShowAddModal(true)} className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-600 text-white rounded-xl lg:rounded-2xl flex items-center justify-center hover:bg-blue-700 shadow-lg transition-all active:scale-90 shrink-0">
                                <Plus size={24} className="lg:w-7 lg:h-7" strokeWidth={3} />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            {dayReservations.length === 0 ? (
                                <div className="py-16 lg:py-24 text-center opacity-20 grayscale flex flex-col items-center">
                                    <CalendarIcon size={48} className="lg:w-16 lg:h-16 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Prazan hod</p>
                                </div>
                            ) : dayReservations.map(res => {
                                const orderId = res.work_orders?.[0]?.id;

                                return (
                                    <div 
                                        key={res.id} 
                                        onClick={() => orderId && router.push(`/dashboard/orders/${orderId}`)}
                                        className="p-5 lg:p-6 bg-white hover:border-blue-600 cursor-pointer group rounded-[1.5rem] lg:rounded-[2rem] border-2 border-slate-100 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                                            {/* Padding added within the time badge for better spacing */}
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg sm:rounded-xl">
                                                <Clock size={12} className="text-blue-400" />
                                                <span className="font-black text-[10px] sm:text-xs">{res.scheduled_time.slice(0, 5)}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteReservation(res.id, e)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        
                                        <h4 className="font-black text-lg lg:text-xl text-slate-900 uppercase tracking-tighter mb-3 lg:mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                            {res.service_description}
                                        </h4>
                                        
                                        <div className="flex items-center gap-2 lg:gap-3 text-slate-400 border-t border-slate-50 pt-3 lg:pt-4">
                                            <div className="bg-slate-100 p-1.5 lg:p-2 rounded-lg text-slate-600">
                                                <User size={12} className="lg:w-3.5 lg:h-3.5" />
                                            </div>
                                            <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-slate-900">
                                                {res.clients?.name} {res.clients?.surname}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* MODAL SECTION REMAINING SAME */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4 lg:p-6">
                        <div className="bg-white w-full max-w-xl rounded-t-[2rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-200 max-h-[90vh] flex flex-col">
                            <div className="bg-slate-900 p-6 sm:p-8 lg:p-10 text-white flex justify-between items-center shrink-0">
                                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">Planiranje Zahvata</h3>
                                <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24} className="sm:w-8 sm:h-8" /></button>
                            </div>
                            <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
                                <SmartSearch
                                    label="Odaberi Klijenta"
                                    options={dbData.clients.map((c: any) => ({ id: c.id, label: `${c.name} ${c.surname}`, subLabel: c.phone_number }))}
                                    onSelect={(opt: any) => setNewRes({ ...newRes, client_id: opt.id })}
                                />
                                {newRes.client_id && (
                                    <div>
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Odaberi Vozilo</label>
                                        <select
                                            className="w-full h-14 sm:h-16 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-black text-base sm:text-lg appearance-none cursor-pointer focus:border-blue-600 outline-none transition-all"
                                            value={newRes.vehicle_id}
                                            onChange={e => setNewRes({ ...newRes, vehicle_id: e.target.value })}
                                        >
                                            <option value="">-- Odaberi vozilo --</option>
                                            {clientVehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registration})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="sm:col-span-1">
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Vrijeme dolaska</label>
                                        <select
                                            className="w-full h-14 sm:h-16 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-black text-base sm:text-lg appearance-none cursor-pointer focus:border-blue-600 outline-none transition-all"
                                            value={newRes.time}
                                            onChange={e => setNewRes({ ...newRes, time: e.target.value })}
                                        >
                                            {Array.from({ length: 13 }).map((_, i) => {
                                                const h = (i + 7).toString().padStart(2, '0');
                                                return (
                                                    <React.Fragment key={h}>
                                                        <option value={`${h}:00`}>{h}:00</option>
                                                        <option value={`${h}:30`}>{h}:30</option>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Planirani Radovi</label>
                                        <textarea 
                                            className="w-full min-h-[100px] sm:min-h-[120px] bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 font-bold text-base sm:text-lg outline-none focus:border-blue-600 transition-all"
                                            placeholder="Opis servisa..." 
                                            value={newRes.desc} 
                                            onChange={e => setNewRes({ ...newRes, desc: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <button onClick={handleAddReservation} className="w-full h-16 sm:h-20 bg-blue-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 shrink-0">
                                    POTVRDI I KREIRAJ NALOG
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}