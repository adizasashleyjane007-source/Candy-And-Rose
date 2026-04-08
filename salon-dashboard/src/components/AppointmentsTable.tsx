"use client";

import { ArrowUpRight, Edit2, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatAMPM(timeStr: string) {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
}

export default function AppointmentsTable() {
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        const loadData = () => {
            const savedAppointments = localStorage.getItem('salon_appointments');
            if (savedAppointments) {
                const allAppointments = JSON.parse(savedAppointments);
                
                const now = new Date().getTime();
                
                // Helper to get time
                const getAptTime = (apt: any) => {
                    try {
                        let d: Date;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(apt.date)) {
                            const [y, m, day] = apt.date.split("-").map(Number);
                            d = new Date(y, m - 1, day);
                        } else {
                            d = new Date(apt.date);
                        }
                        
                        if (apt.time) {
                            const timeMatch = apt.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                            if (timeMatch) {
                                let h = parseInt(timeMatch[1], 10);
                                const m = parseInt(timeMatch[2], 10);
                                const ampm = timeMatch[3]?.toUpperCase();
                                if (ampm === "PM" && h < 12) h += 12;
                                if (ampm === "AM" && h === 12) h = 0;
                                d.setHours(h, m, 0, 0);
                            }
                        }
                        return d.getTime() || 0;
                    } catch {
                        return 0;
                    }
                };

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayTime = today.getTime();
                
                const upcomingApps = allAppointments.filter((apt: any) => {
                    if (apt.status === "Cancelled" || apt.status === "Completed") return false;
                    const aptTime = getAptTime(apt);
                    // Show appointments from today onwards
                    return aptTime >= todayTime;
                });

                // Sort by closest date first
                upcomingApps.sort((a: any, b: any) => {
                    return getAptTime(a) - getAptTime(b);
                });

                setAppointments(upcomingApps.slice(0, 5));
            }
        };

        loadData();

        // Auto-refresh every minute to remove appointments that have passed
        const interval = setInterval(loadData, 60000);

        window.addEventListener('storage', loadData);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', loadData);
        };
    }, []);

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-200 flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-pink-400" />
                    <h3 className="font-semibold text-gray-900 text-lg">Upcoming Appointments</h3>
                </div>
                <Link href="/appointment" className="text-pink-500 hover:text-pink-600 font-medium text-sm flex items-center gap-1 transition-colors">
                    View All <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate" style={{ borderSpacing: "0 10px" }}>
                    <thead>
                        <tr>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap">Time</th>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap">Customer</th>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap">Service</th>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap">Staff</th>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap">Price</th>
                            <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase whitespace-nowrap w-[120px] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.slice(0, 5).map((apt: any) => (
                            <tr key={apt.id} className="bg-gray-50/50 hover:bg-pink-50/50 transition-all shadow-sm group">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900 rounded-l-xl border border-transparent group-hover:border-pink-200 border-r-0">{formatAMPM(apt.time)}</td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900 border border-transparent group-hover:border-pink-200 border-x-0">{apt.customer}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0">{apt.service}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0">{apt.staff}</td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900 border border-transparent group-hover:border-pink-200 border-x-0">{apt.price}</td>
                                <td className="py-3 px-4 text-sm text-center rounded-r-xl border border-transparent group-hover:border-pink-200 border-l-0">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-tight border ${apt.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        apt.status === 'Active' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-6 text-center text-sm font-medium text-gray-500 bg-gray-50/50 rounded-xl border border-transparent">
                                    No appointments scheduled recently.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
