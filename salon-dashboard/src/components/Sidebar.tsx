"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Calendar,
    Package,
    Scissors,
    CreditCard,
    Users,
    UserCircle,
    BarChart2,
    Bell,
    Settings,
    Sparkles
} from "lucide-react";

// Custom 3-users icon
const UsersThree = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
        <path d="M4 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M2 20v-1a5 5 0 0 1 4-4.9" />
        <path d="M20 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M22 20v-1a5 5 0 0 0-4-4.9" />
    </svg>
);

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Appointment", href: "/appointment", icon: Calendar },
    { name: "Nails AI", href: "/nails", icon: Sparkles },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Service", href: "/service", icon: Scissors },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Customer", href: "/customer", icon: UsersThree },
    { name: "Staff", href: "/staff", icon: Users },
    { name: "Admin Profile", href: "/admin-profile", icon: UserCircle },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Setting", href: "/settings", icon: Settings },
];

const AUTH_ROUTES = ["/login", "/signup", "/auth", "/forgot-password", "/reset-password"];

export default function Sidebar() {
    const pathname = usePathname();
    const [salonName, setSalonName] = useState("Candy And Rose");

    useEffect(() => {
        const loadSalonName = () => {
            try {
                const saved = localStorage.getItem("salon_settings_info");
                if (saved) {
                    const info = JSON.parse(saved);
                    if (info?.name) setSalonName(info.name);
                }
            } catch { }
        };
        loadSalonName();
        window.addEventListener("salonInfoUpdated", loadSalonName);
        window.addEventListener("storage", loadSalonName);
        return () => {
            window.removeEventListener("salonInfoUpdated", loadSalonName);
            window.removeEventListener("storage", loadSalonName);
        };
    }, []);

    // Hide sidebar on auth pages (must be after hooks)
    if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
        return null;
    }

    return (
        <aside className="w-64 bg-[#1a0b12] border-r border-[#2d1320] text-zinc-300 flex flex-col h-screen overflow-y-auto no-scrollbar">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-8">
                    <img src="/LOGO.jpg" alt="Candy & Rose Logo" className="w-12 h-12 rounded-full object-contain mix-blend-lighten" />
                    <h1 className="font-medium text-lg leading-tight text-white">{salonName}<br /><span className="text-sm">Salon</span></h1>
                </div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">Navigation</p>
            </div>

            <nav className="flex-1 px-3 space-y-1 pb-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-gradient-to-r from-pink-500/20 to-pink-500/5 text-pink-400 font-medium relative"
                                : "hover:bg-zinc-800/50 hover:text-white text-zinc-400"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-pink-500" : ""}`} />
                            <span className="text-sm">{item.name}</span>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pink-500 rounded-r-md" />
                            )}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto px-6 py-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 text-center">© 2026 Candy & Rose Salon</p>
            </div>
        </aside>
    );
}
