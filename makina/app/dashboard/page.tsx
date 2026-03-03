import { createClient } from "@/lib/supabase/server";
import {
    UserPlus,
    Car,
    ClipboardPlus,
} from "lucide-react";
import Link from "next/link";
import GlobalSearch from "@/components/GlobalSearch";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        // Added responsive padding and tightened spacing for mobile
        <div className="space-y-6 md:space-y-10 max-w-6xl mx-auto px-4 md:px-0 pb-10">
            
            {/* 1. Header & Quick Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                        MAKINA <span className="text-[#1d4ed8]">HOME</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1">
                        Prijavljen: {user?.email}
                    </p>
                </div>
            </div>

            {/* Global Search - ensure it's easy to tap */}
            <div className="relative group w-full">
                <GlobalSearch />
            </div>

            {/* 2. The Quick Access Menu (The "Big Three") */}
            {/* Changed from 1 col on mobile to 1 col for better tap targets, though sm:grid-cols-3 handles tablets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <ActionButton
                    href="/dashboard/orders/new"
                    icon={<ClipboardPlus size={28} className="md:w-[32px] md:h-[32px]" />}
                    label="Novi Radni Nalog"
                    description="Otvori nalog za popravak"
                    variant="yellow"
                />
                <ActionButton
                    href="/dashboard/vehicles/new"
                    icon={<Car size={28} className="md:w-[32px] md:h-[32px]" />}
                    label="Dodaj Vozilo"
                    description="Upiši novi auto u bazu"
                    variant="blue"
                />
                <ActionButton
                    href="/dashboard/clients/new"
                    icon={<UserPlus size={28} className="md:w-[32px] md:h-[32px]" />}
                    label="Novi Kupac"
                    description="Registriraj klijenta"
                    variant="blue"
                />
            </div>
        </div>
    );
}

function ActionButton({ href, icon, label, description, variant }: any) {
    const styles = variant === 'yellow'
        ? "bg-[#facc15] text-[#1e3a8a] border-[#fde047]"
        : "bg-white text-slate-900 border-slate-200 hover:border-[#1d4ed8]";

    return (
        <Link href={href} className={`${styles} p-6 md:p-8 rounded-[2rem] border-2 flex flex-row sm:flex-col items-center text-left sm:text-center gap-4 transition-all hover:shadow-xl active:scale-[0.98]`}>
            {/* Flex-row on mobile, Flex-col on desktop for better thumb reach */}
            <div className={`${variant === 'yellow' ? 'bg-white/40' : 'bg-slate-50'} p-3 md:p-4 rounded-2xl shrink-0`}>
                {icon}
            </div>
            <div className="overflow-hidden">
                <h3 className="font-black uppercase tracking-tighter text-base md:text-lg leading-tight truncate">
                    {label}
                </h3>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5 truncate">
                    {description}
                </p>
            </div>
        </Link>
    );
}