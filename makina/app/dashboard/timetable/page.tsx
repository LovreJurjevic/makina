'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameDay, isToday, addMonths, getDay, startOfToday
} from 'date-fns'
import { hr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Car, X, Calendar as CalendarIcon } from 'lucide-react'
import { SmartSearch } from '@/components/ui/combobox'

export default function TimetablePage() {
    const supabase = createClient()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(startOfToday())
    const [counts, setCounts] = useState<Record<string, number>>({})
    const [dayReservations, setDayReservations] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)

    const [dbData, setDbData] = useState({ vehicles: [], clients: [] })
    const [newRes, setNewRes] = useState({ vehicle_id: '', client_id: '', time: '08:00', desc: '' })

    // 1. Fetch Month Counts
    const fetchCounts = useCallback(async () => {
        const first = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const last = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const { data } = await supabase.from('reservations').select('scheduled_date').gte('scheduled_date', first).lte('scheduled_date', last)

        if (data) {
            const map = data.reduce((acc: any, r: any) => {
                acc[r.scheduled_date] = (acc[r.scheduled_date] || 0) + 1
                return acc
            }, {})
            setCounts(map)
        }
    }, [currentMonth, supabase])

    useEffect(() => { fetchCounts() }, [fetchCounts])

    // 2. Fetch Selected Day Details - Updated to trigger on selectedDate change
    useEffect(() => {
        async function fetchDayDetails() {
            const { data } = await supabase
                .from('reservations')
                .select(`*, clients(name, surname, phone_number)`)
                .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
                .order('scheduled_time', { ascending: true })
            setDayReservations(data || [])
        }
        fetchDayDetails()
    }, [selectedDate, counts, supabase])

    // 3. Navigation Helpers
    const goToToday = () => {
        const today = startOfToday()
        setCurrentMonth(today)
        setSelectedDate(today)
    }

    const handleAddReservation = async () => {
        const { error } = await supabase.from('reservations').insert([{
            scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
            scheduled_time: newRes.time,
            vehicle_id: newRes.vehicle_id,
            client_id: newRes.client_id,
            service_description: newRes.desc
        }])
        if (!error) {
            setShowAddModal(false)
            fetchCounts() // Refresh counts to update badges
        }
    }

    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
    const startDay = getDay(startOfMonth(currentMonth))
    const prefix = startDay === 0 ? 6 : startDay - 1

    return (
        <div className="p-8 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto min-h-[90vh]">

            {/* CALENDAR SECTION */}
            <div className="flex-1 bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                            {format(currentMonth, 'LLLL yyyy', { locale: hr })}
                        </h2>
                        {/* TODAY BUTTON */}
                        <button
                            onClick={goToToday}
                            className="bg-blue-600 hover:bg-blue-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all"
                        >
                            Danas
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft /></button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 flex-1">
                    {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
                        <div key={d} className="bg-slate-50 p-4 text-[10px] font-black uppercase text-slate-400 text-center border-b border-slate-100">{d}</div>
                    ))}
                    {[...Array(prefix)].map((_, i) => <div key={i} className="bg-slate-50/30 border-b border-r border-slate-50" />)}
                    {days.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const count = counts[dateStr] || 0
                        const isSelected = isSameDay(day, selectedDate)
                        const isTodayDay = isToday(day)

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(day)}
                                className={`min-h-[110px] p-4 border-b border-r border-slate-100 flex flex-col justify-between transition-all relative
                  ${isSelected ? 'bg-blue-600 text-white z-10' : 'hover:bg-slate-50 text-slate-900'}
                `}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`font-black text-lg ${isTodayDay && !isSelected ? 'text-blue-600' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {/* YELLOW DOT FOR TODAY */}
                                    {isTodayDay && (
                                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-workshop-yellow'}`} />
                                    )}
                                </div>

                                {count > 0 && (
                                    <div className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 self-start
                    ${isSelected ? 'bg-white text-blue-600' : 'bg-slate-900 text-white'}`}
                                    >
                                        {count} <Car size={10} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* SIDE DETAIL PANEL */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl min-h-[400px]">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">
                                {format(selectedDate, 'EEEE', { locale: hr })}
                            </p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
                                {format(selectedDate, 'dd. MMMM', { locale: hr })}
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {dayReservations.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center opacity-20">
                                <CalendarIcon size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest text-[10px]">Nema rezervacija za ovaj dan</p>
                            </div>
                        ) : dayReservations.map(res => (
                            <div key={res.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200">
                                        <Clock size={12} className="text-blue-600" />
                                        <span className="font-black text-xs text-slate-900">{res.scheduled_time.slice(0, 5)}</span>
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-slate-400">PENDING</div>
                                </div>
                                <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">
                                    {res.service_description || 'Opis nije unesen'}
                                </h4>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <User size={12} />
                                    <span className="text-[10px] font-bold uppercase">
                                        {res.clients?.name} {res.clients?.surname}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* QUICK ADD MODAL (OVERLAY) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Nova Rezervacija</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <SmartSearch
                                label="Vozilo" options={dbData.vehicles.map((v: any) => ({ id: v.id, label: v.registration, subLabel: `${v.make} ${v.model}` }))}
                                onSelect={(opt: any) => setNewRes({ ...newRes, vehicle_id: opt.id })}
                            />
                            <SmartSearch
                                label="Klijent" options={dbData.clients.map((c: any) => ({ id: c.id, label: `${c.name} ${c.surname}`, subLabel: c.phone_number }))}
                                onSelect={(opt: any) => setNewRes({ ...newRes, client_id: opt.id })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Vrijeme</label>
                                    <input type="time" className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-black"
                                        value={newRes.time} onChange={e => setNewRes({ ...newRes, time: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Opis Radova</label>
                                    <input className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold"
                                        placeholder="Servis, kočnice..." value={newRes.desc} onChange={e => setNewRes({ ...newRes, desc: e.target.value })} />
                                </div>
                            </div>
                            <button onClick={handleAddReservation} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all">
                                SPREMI REZERVACIJU
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}