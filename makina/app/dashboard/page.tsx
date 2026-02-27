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
import GlobalSearch from "@/components/GlobalSearch";

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
                <GlobalSearch />
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