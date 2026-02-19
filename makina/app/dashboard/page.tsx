import { createClient } from "@/lib/supabase/server";
import {
    UserPlus,
    Car,
    ClipboardPlus,
    Search,
    Activity,
    History
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* 1. Header & Quick Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                        MAKINA <span className="text-[#1d4ed8]">HOME</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                        Prijavljen: {user?.email}
                    </p>
                </div>


            </div>
            <div className="relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1d4ed8] transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="PRETRAŽI BAZU PODATAKA..."
                    className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-sm focus:border-[#1d4ed8] outline-none transition-all shadow-sm"
                />
            </div>

            {/* 2. The Quick Access Menu (The "Big Three") */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ActionButton
                    href="/dashboard/orders/new"
                    icon={<ClipboardPlus size={32} />}
                    label="Novi Radni Nalog"
                    description="Otvori nalog za popravak"
                    variant="yellow"
                />
                <ActionButton
                    href="/dashboard/vehicles/new"
                    icon={<Car size={32} />}
                    label="Dodaj Vozilo"
                    description="Upiši novi auto u bazu podataka"
                    variant="blue"
                />
                <ActionButton
                    href="/dashboard/clients/new"
                    icon={<UserPlus size={32} />}
                    label="Novi Kupac"
                    description="Registriraj novog klijenta"
                    variant="blue"
                />
            </div>

            {/* 3. Status Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {/* Active Shop Status */}
                <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-[#1d4ed8]" size={20} />
                        <h2 className="font-black uppercase tracking-widest text-xs text-slate-400">Trenutno u radioni</h2>
                    </div>
                    <div className="space-y-4">
                        {/* This will be a map of active vehicles later */}
                        <p className="text-slate-300 italic text-sm py-4 border-2 border-dashed border-slate-50 rounded-2xl text-center">
                            Nema aktivnih vozila na dizalicama.
                        </p>
                    </div>
                </div>

                {/* Recent History */}
                <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <History className="text-slate-400" size={20} />
                        <h2 className="font-black uppercase tracking-widest text-xs text-slate-400">Zadnje završeno</h2>
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-300 italic text-sm py-4 border-2 border-dashed border-slate-50 rounded-2xl text-center">
                            Nema nedavnih završenih radnih naloga.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components to keep code clean
function ActionButton({ href, icon, label, description, variant }: any) {
    const styles = variant === 'yellow'
        ? "bg-[#facc15] text-[#1e3a8a] border-[#fde047]"
        : "bg-white text-slate-900 border-slate-200 hover:border-[#1d4ed8]";

    return (
        <Link href={href} className={`${styles} p-8 rounded-3xl border-2 flex flex-col items-center text-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]`}>
            <div className={`${variant === 'yellow' ? 'bg-white/40' : 'bg-slate-50'} p-4 rounded-2xl`}>
                {icon}
            </div>
            <div>
                <h3 className="font-black uppercase tracking-tighter text-lg leading-tight">{label}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{description}</p>
            </div>
        </Link>
    );
}

function RecentItem({ plate, model, task }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
                <span className="font-mono font-black text-sm">{plate}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{model}</span>
            </div>
            <span className="text-[9px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest">
                {task}
            </span>
        </div>
    );
}