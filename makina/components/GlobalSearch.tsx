"use client";
import { useState, useEffect } from "react";
import { Search, Car, User, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) return setResults([]);
            const res = await fetch(`/api/search?q=${query}`);
            const data = await res.json();
            setResults(data);
        };

        const timer = setTimeout(fetchResults, 300); // Debounce
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="PRETRAŽI BAZU PODATAKA (Vozila, Klijenti, Nalozi)..."
                className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-sm focus:border-[#1d4ed8] outline-none shadow-sm"
            />

            {results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {results.map((res: any) => (
                        <button
                            key={`${res.type}-${res.id}`}
                            onClick={() => {
                                router.push(res.url);
                                setQuery("");
                            }}
                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b last:border-0"
                        >
                            <div className="p-2 bg-slate-100 rounded-lg text-[#1d4ed8]">
                                {res.type === 'vehicle' && <Car size={18} />}
                                {res.type === 'client' && <User size={18} />}
                                {res.type === 'order' && <ClipboardList size={18} />}
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-tight text-sm">{res.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{res.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}