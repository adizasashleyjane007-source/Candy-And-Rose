"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardCalendar() {
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const [appointments, setAppointments] = useState<any[]>([]);

    const [currentDate] = useState(new Date(2026, 8, 1)); // September 2026
    const paddingDays = 2; // September 2026 starts on Tuesday
    const daysInMonth = 30;

    useEffect(() => {
        const loadData = () => {
            const saved = localStorage.getItem('salon_appointments');
            if (saved) {
                setAppointments(JSON.parse(saved));
            }
        };
        loadData();
        window.addEventListener('salon_appointments_changed', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('salon_appointments_changed', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, []);

    const getStatus = (day: number) => {
        const dateStr = `2026-09-${day.toString().padStart(2, '0')}`;
        const dayApts = appointments.filter(a => {
            // Support both YYYY-MM-DD and "Month DD, YYYY" formats
            let aptDate = a.date;
            if (aptDate && aptDate.match(/[A-Za-z]+ \d{1,2}, \d{4}/)) {
                const parsed = new Date(aptDate);
                if (!isNaN(parsed.getTime())) {
                    aptDate = parsed.toISOString().split('T')[0];
                }
            }
            return aptDate === dateStr;
        });

        if (dayApts.some(a => a.status === 'Active')) return 'occupied';
        if (dayApts.some(a => a.status === 'Pending')) return 'reserved';
        return 'available';
    };

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-200 flex flex-col items-center h-full">
            <div className="w-full flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-xl">Calendar</h3>
                <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-pink-50 rounded-full text-gray-400 hover:text-pink-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-pink-600 text-sm tracking-wide uppercase">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button className="p-1 hover:bg-pink-50 rounded-full text-gray-400 hover:text-pink-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="w-full grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="w-full grid grid-cols-7 gap-2">
                {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = getStatus(day);

                    let statusClasses = "";
                    if (status === 'occupied') {
                        statusClasses = "bg-pink-500 text-white font-bold shadow-sm shadow-pink-200 hover:bg-pink-600";
                    } else if (status === 'reserved') {
                        statusClasses = "bg-amber-100 text-amber-700 font-bold border border-amber-200 hover:bg-amber-200";
                    } else {
                        statusClasses = "bg-gray-50 text-gray-600 font-medium hover:bg-pink-100 hover:text-pink-600 border border-transparent";
                    }

                    return (
                        <button
                            key={day}
                            className={`flex items-center justify-center w-full aspect-square rounded-full text-sm transition-all duration-200 ${statusClasses}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-between w-full px-2 border-t border-gray-100 pt-4">
                <div className="flex flex-col items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-100 border border-amber-200"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reserved</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-pink-500 shadow-sm shadow-pink-200"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupied</span>
                </div>
            </div>
        </div>
    );
}
