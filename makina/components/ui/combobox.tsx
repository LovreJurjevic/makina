'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'

export function SmartSearch({
    options,
    onSelect,
    onCreate,
    placeholder,
    label,
    imageKey = null
}: any) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const filtered = useMemo(() => {
        const q = query.toLowerCase()
        if (q === '') return options.slice(0, 6)

        return options.filter((opt: any) => {
            const labelMatch = opt.label?.toLowerCase().includes(q)
            // SEARCH BOTH LABEL AND SUB-LABEL (Phone/OIB/ccm)
            const subLabelMatch = opt.subLabel?.toLowerCase().includes(q)
            return labelMatch || subLabelMatch
        })
    }, [query, options])

    return (
        <div className="relative" ref={containerRef}>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">{label}</label>
            <div className="relative group">
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto p-2">
                        {!options.find((o: any) => o.label.toLowerCase() === query.toLowerCase()) && onCreate && (
                            <button
                                type="button"
                                onClick={() => { onCreate(query); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 font-bold mb-2 hover:bg-blue-100 transition-colors"
                            >
                                <Plus size={16} strokeWidth={3} />
                                <div className="flex flex-col items-start">
                                    <span className="text-xs uppercase font-black">{label}</span>
                                    <span className="text-sm italic">Novi unos</span>
                                </div>
                            </button>
                        )}

                        {filtered.map((opt: any) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    setQuery(opt.label);
                                    onSelect(opt);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                            >
                                {opt.image && <img src={opt.image} className="w-6 h-6 object-contain grayscale opacity-50" />}
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="font-bold text-slate-900 truncate w-full">{opt.label}</span>
                                    {opt.subLabel && (
                                        <span className="text-[10px] text-blue-600 uppercase font-black tracking-tight">
                                            {opt.subLabel}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase italic">Nema rezultata za "{query}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}