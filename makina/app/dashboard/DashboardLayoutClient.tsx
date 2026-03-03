'use client';

import { useState } from "react";
import {
    LayoutDashboard,
    Car,
    ClipboardList,
    LogOut,
    Plus,
    Calendar as CalendarIcon,
    User,
    Menu,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { signOut } from "./actions";

export default function DashboardLayoutClient({
    children,
    user
}: {
    children: React.ReactNode;
    user: any;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">
            {/* MOBILE OVERLAY */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={closeMenu}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                w-64 bg-[#1d4ed8] text-white flex flex-col fixed inset-y-0 left-0 z-40 shadow-2xl transition-transform duration-300 lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 border-b border-blue-600/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">MAKINA</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Workshop OS</p>
                    </div>
                    <button onClick={closeMenu} className="lg:hidden text-white/50 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Home" onClick={closeMenu} active={pathname === '/dashboard'} />
                    <NavItem href="/dashboard/timetable" icon={<CalendarIcon size={20} />} label="Kalendar" onClick={closeMenu} active={pathname === '/dashboard/timetable'} />
                    <NavItem href="/dashboard/vehicles" icon={<Car size={20} />} label="Vozila" onClick={closeMenu} active={pathname.startsWith('/dashboard/vehicles')} />
                    <NavItem href="/dashboard/orders" icon={<ClipboardList size={20} />} label="Radni Nalozi" onClick={closeMenu} active={pathname.startsWith('/dashboard/orders')} />
                    <NavItem href="/dashboard/clients" icon={<User size={20} />} label="Klijenti" onClick={closeMenu} active={pathname.startsWith('/dashboard/clients')} />
                </nav>

                <div className="p-4 border-t border-blue-600/50 space-y-4">
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Prijavljen kao</p>
                        <p className="text-xs font-bold truncate">{user?.email}</p>
                    </div>
                    <form action={signOut}>
                        <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-200 hover:bg-blue-800 hover:text-white transition-all">
                            <LogOut size={20} /> Odjava
                        </button>
                    </form>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <header className="h-20 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 lg:hidden text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="hidden md:inline">Makina</span>
                            <span className="hidden md:inline text-slate-200">/</span>
                            <span className="text-slate-900 truncate">Automehaničarske usluge</span>
                        </div>
                    </div>

                    <Link href="/dashboard/orders/new">
                        <button className="bg-[#facc15] hover:bg-[#fde047] text-[#1e3a8a] px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2">
                            <Plus size={16} strokeWidth={4} />
                            <span className="hidden sm:inline">Novi Nalog</span>
                        </button>
                    </Link>
                </header>

                <div className="p-4 lg:p-10 w-full max-w-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, onClick, active }: any) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-4 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                active ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
            }`}
        >
            {icon} {label}
        </Link>
    );
}