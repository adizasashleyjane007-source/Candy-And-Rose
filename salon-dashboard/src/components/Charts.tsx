"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const initialWeeklyData = [
    { name: "Mon", total: 0 },
    { name: "Tue", total: 0 },
    { name: "Wed", total: 0 },
    { name: "Thu", total: 0 },
    { name: "Fri", total: 0 },
    { name: "Sat", total: 0 },
    { name: "Sun", total: 0 },
];

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const COLORS = ["#ec4899", "#fcd34d", "#60a5fa", "#34d399", "#a78bfa", "#f87171"];

export function WeeklyRevenueChart() {
    const [revenueData, setRevenueData] = useState(initialWeeklyData);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedWeek, setSelectedWeek] = useState(() => {
        // Calculate the current actual week of the month (Monday-based)
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Day of week of the 1st (0=Sun,1=Mon,...6=Sat), convert to Mon-based (Mon=0)
        const firstDow = (firstOfMonth.getDay() + 6) % 7; // Mon=0, Sun=6
        const todayDom = today.getDate();
        // Week number: which Monday-based week does today fall in?
        return Math.ceil((todayDom + firstDow) / 7);
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
 
    useEffect(() => {
        const loadData = () => {
            const savedAppointments = localStorage.getItem('salon_appointments');
            if (savedAppointments) {
                const appointments = JSON.parse(savedAppointments);
                const data = [...initialWeeklyData.map(d => ({ ...d }))];
                const currentYear = new Date().getFullYear();
 
                // Build the Monday-based week boundaries for the selected month
                // Week 1 starts on day 1 (even if it's mid-week)
                // Each subsequent week starts on the next Monday
                const firstOfMonth = new Date(currentYear, selectedMonth, 1);
                // Day-of-week of the 1st, Mon-based (Mon=0, Sun=6)
                const firstDow = (firstOfMonth.getDay() + 6) % 7;

                // Align the 7-day range strictly with the calendar row (Mon-Sun)
                // Target Monday = 1st of month - day of week of 1st + (selectedWeek - 1) * 7
                const calendarMonday = new Date(currentYear, selectedMonth, 1 - firstDow + (selectedWeek - 1) * 7);
                const weekStart = new Date(calendarMonday);
                const weekEnd = new Date(calendarMonday);
                weekEnd.setDate(weekEnd.getDate() + 6);

                appointments.forEach((apt: any) => {
                    // Only count completed bookings for revenue
                    if (apt.status === 'Completed') {
                        // Use receiptDate if available, fallback to booking date
                        const dateString = apt.receiptDate || apt.date;
                        if (dateString) {
                            const aptDate = new Date(dateString);
                            // Normalize to date-only for comparison
                            const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
                            const weekStartDay = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
                            const weekEndDay = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

                            // Filter by Month, Year, and actual calendar week
                            if (!isNaN(aptDate.getTime()) && 
                                aptDate.getMonth() === selectedMonth && 
                                aptDate.getFullYear() === currentYear &&
                                aptDay >= weekStartDay &&
                                aptDay <= weekEndDay) {
                                
                                // Map 0-6 (Sun-Sat) to our index (Mon-Sun)
                                const dayIndex = aptDate.getDay(); 
                                const targetIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Mon=0, Sun=6
                                
                                // Use pricePaid if available (collected amount), fallback to base price
                                const rawPrice = apt.pricePaid || apt.price;
                                const priceNum = parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0;
                                data[targetIndex].total += priceNum;
                            }
                        }
                    }
                });
                setRevenueData(data);
            }
        };
 
        loadData();
        window.addEventListener('salon_appointments_changed', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('salon_appointments_changed', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, [selectedMonth, selectedWeek]);
 
    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-200 flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-gray-900 border-none">Weekly Revenue - <span className="text-pink-500">{months[selectedMonth]}</span></h3>
                    <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((w) => (
                            <button
                                key={`week-${w}`}
                                onClick={() => setSelectedWeek(w)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all uppercase tracking-tighter ${selectedWeek === w ? 'bg-pink-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                Week {w}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-400 hover:text-pink-500 transition-colors p-1"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-pink-50 py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Month</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {months.map((month, idx) => (
                                        <button
                                            key={month}
                                            onClick={() => {
                                                setSelectedMonth(idx);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedMonth === idx ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {month}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                        <XAxis
                            dataKey="name"
                            stroke="#a1a1aa"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "#fce7f3" }}
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, "Revenue"]}
                        />
                        <Bar
                            dataKey="total"
                            fill="#ec4899"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function ServiceDistributionChart() {
    const [serviceData, setServiceData] = useState<{ name: string, value: number, color: string }[]>([]);

    useEffect(() => {
        const loadData = () => {
            const savedAppointments = localStorage.getItem('salon_appointments');
            const savedServices = localStorage.getItem('salon_services');

            let serviceToCategory: Record<string, string> = {};
            if (savedServices) {
                const services = JSON.parse(savedServices);
                services.forEach((s: any) => {
                    serviceToCategory[s.name] = s.category;
                });
            }

            if (savedAppointments) {
                const allAppointments = JSON.parse(savedAppointments);

                const categoryCounts: Record<string, number> = {};
                let totalBookings = 0;

                allAppointments.forEach((apt: any) => {
                    if (apt.service) {
                        const category = serviceToCategory[apt.service] || 'Other';
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                        totalBookings++;
                    }
                });

                const sortedEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

                const newData = sortedEntries.map(([name, value], index) => {
                    const percentage = totalBookings > 0 ? Math.round((Number(value) / totalBookings) * 100) : 0;
                    return {
                        name: `${name} (${percentage}%)`,
                        value: Number(value),
                        color: COLORS[index % COLORS.length]
                    };
                });

                if (newData.length > 0) {
                    setServiceData(newData);
                } else {
                    setServiceData([
                        { name: "No Data", value: 1, color: "#d1d5db" }
                    ]);
                }
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

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-200 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Service Distribution</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 w-full flex items-center justify-center flex-col relative pb-2 pt-2 min-h-[300px]">
                <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, bottom: 10 }}>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                formatter={(value: any) => [value, "Bookings"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="w-full px-8 mt-4">
                    <div className="flex flex-col gap-2 w-fit mx-auto">
                        {serviceData.map((entry: any, index) => (
                            <div key={`item-${index}`} className="flex items-center space-x-3 text-sm text-gray-700 font-semibold min-w-[200px]">
                                <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }} />
                                <span className="truncate tracking-tight" title={entry.name}>
                                    {entry.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
