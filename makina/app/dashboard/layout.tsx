import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    LayoutDashboard,
    Car,
    ClipboardList,
    Settings,
    LogOut,
    Plus
} from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        // FIX: Ensure w-full and no padding/margin on this outer div
        <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">

            {/* SIDEBAR - left-0 ensures it sticks to the absolute edge */}
            <aside className="w-64 bg-[#1d4ed8] text-white flex flex-col fixed inset-y-0 left-0 z-20 shadow-2xl">
                <div className="p-8 border-b border-blue-600/50">
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">MAKINA</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-200 opacity-80 mt-1">
                        by Lovre Jurjević
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-6">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Početna stranica" />
                    <NavItem href="/dashboard/vozila" icon={<Car size={20} />} label="Vozila" />
                    <NavItem href="/dashboard/nalozi" icon={<ClipboardList size={20} />} label="Radni Nalozi" />
                    <NavItem href="/dashboard/postavke" icon={<Settings size={20} />} label="Postavke" />
                </nav>

                <div className="p-4 border-t border-blue-600/50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-blue-800/30 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#facc15] flex items-center justify-center text-[#1e3a8a] font-black text-xs shrink-0">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-xs font-bold truncate">{user.email}</p>
                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Mehaničar</p>
                        </div>
                    </div>

                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-blue-200 hover:text-white hover:bg-blue-700 rounded-xl transition-all cursor-pointer group border-none">
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            ODJAVA
                        </button>
                    </form>
                </div>
            </aside>

            {/* MAIN CONTENT - ml-64 matches the sidebar width */}
            <main className="flex-1 ml-64 flex flex-col min-w-0">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <span>Makina</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-900">MAKI - obrt za automehaničarske usluge</span>
                    </div>

                    <button className="bg-[#facc15] hover:bg-[#fde047] text-[#1e3a8a] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-md shadow-yellow-500/10 flex items-center gap-2 cursor-pointer border-none">
                        <Plus size={16} strokeWidth={4} />
                        Novi Radni Nalog
                    </button>
                </header>

                <div className="p-10 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-blue-100 hover:bg-blue-700/50 hover:text-white"
        >
            {icon}
            {label}
        </Link>
    );
}