"use client";

import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [adminProfile, setAdminProfile] = useState({
        name: "Admin User",
        email: "admin@candyandrose.com",
        image: null as string | null
    });

    const updateCount = useCallback(async () => {
        try {
            const supabase = createClient();
            const { count } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("is_read", false);
            setUnreadCount(count ?? 0);
        } catch {
            // silently fail — count stays at previous value
        }
    }, []);

    const loadProfile = useCallback(async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Try to load from profiles table first
            const { data: profile } = await supabase
                .from('profiles')
                .select('name, email, image_url, phone, role, bio')
                .eq('id', user.id)
                .single();

            if (profile) {
                const headerProfile = {
                    name: profile.name || user.email?.split('@')[0] || 'Admin User',
                    email: profile.email || user.email || 'admin@candyandrose.com',
                    image: profile.image_url || null,
                };
                setAdminProfile(headerProfile);
                // Sync to localStorage for admin-profile page
                const fullProfile = {
                    ...headerProfile,
                    phone: profile.phone || '09123456789',
                    role: profile.role || 'Administrator',
                    bio: profile.bio || '',
                };
                localStorage.setItem('salon_admin_profile', JSON.stringify(fullProfile));
                return;
            }

            // Fallback: seed from auth metadata if no profile row
            const meta = user.user_metadata ?? {};
            const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'Admin User';
            const avatar = meta.avatar_url || meta.picture || null;
            const newProfile = {
                name,
                email: user.email || 'admin@candyandrose.com',
                image: avatar,
            };
            setAdminProfile(newProfile);
        } catch {}
    }, []);

    useEffect(() => {
        updateCount();
        loadProfile();

        const onNotifUpdate = () => updateCount();
        const onProfileChange = () => loadProfile();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'salon_admin_profile') loadProfile();
        };

        window.addEventListener('notificationsUpdated', onNotifUpdate);
        window.addEventListener('salon_profile_changed', onProfileChange);
        window.addEventListener('storage', onStorage);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('notificationsUpdated', onNotifUpdate);
            window.removeEventListener('salon_profile_changed', onProfileChange);
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [updateCount, loadProfile]);

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-transparent">
            <div className="flex-1 max-w-xl relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-full leading-5 bg-white shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-white sm:text-sm transition-shadow"
                    placeholder="Search..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-pink-400" />
                </div>
            </div>

            <div className="ml-4 flex items-center gap-6">
                <Link href="/notifications" className="flex-shrink-0 bg-white p-2 rounded-full text-pink-400 hover:text-pink-500 shadow-sm transition-colors relative block">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white px-1 ring-2 ring-white shadow-sm z-10">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors cursor-pointer select-none border border-transparent outline-none focus:bg-pink-50"
                    >
                        {adminProfile.image ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-200 shadow-sm shrink-0 bg-white">
                                <img src={adminProfile.image} alt={adminProfile.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 shadow-sm shrink-0">
                                <span className="text-pink-600 font-semibold uppercase">{adminProfile.name ? adminProfile.name.slice(0, 2) : 'AD'}</span>
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">{adminProfile.name}</p>
                            <p className="text-xs font-medium text-gray-500">{adminProfile.email}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-500 hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-pink-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 py-1.5 overflow-hidden">
                            <Link
                                href="/admin-profile"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <User className="w-4 h-4" /> Profile
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <Settings className="w-4 h-4" /> Settings
                            </Link>
                            <div className="h-px bg-gray-100 my-1 mx-3"></div>
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                                onClick={async () => {
                                    setIsDropdownOpen(false);
                                    const supabase = createClient();
                                    await supabase.auth.signOut();
                                    localStorage.removeItem('salon_admin_profile');
                                    localStorage.removeItem('salon_settings_info');
                                    router.push('/login');
                                    router.refresh();
                                }}
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
