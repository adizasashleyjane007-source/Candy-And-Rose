"use client";

import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LabelList } from "recharts";
import { MoreHorizontal, TrendingUp, Users, Scissors, PhilippinePeso, Calendar, X, Clock, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

// --- Mock Data ---

const revenueData = [
    { name: "Jan", revenue: 4500 },
    { name: "Feb", revenue: 5200 },
    { name: "Mar", revenue: 4800 },
    { name: "Apr", revenue: 6100 },
    { name: "May", revenue: 5900 },
    { name: "Jun", revenue: 7500 },
    { name: "Jul", revenue: 8200 },
    { name: "Aug", revenue: 8000 },
    { name: "Sep", revenue: 8900 },
    { name: "Oct", revenue: 9500 },
    { name: "Nov", revenue: 11000 },
    { name: "Dec", revenue: 13500 },
];

const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const bookingsData = [
    { name: "Week 1", bookings: 120 },
    { name: "Week 2", bookings: 132 },
    { name: "Week 3", bookings: 101 },
    { name: "Week 4", bookings: 145 },
];

const serviceUsageData = [
    { name: "Manicure", value: 35, color: "#ec4899" }, // pink-500
    { name: "Haircut", value: 25, color: "#fcd34d" }, // amber-300
    { name: "Hair Color", value: 20, color: "#8b5cf6" }, // purple-500
    { name: "Facial", value: 15, color: "#10b981" }, // emerald-500
    { name: "Massage", value: 5, color: "#3b82f6" }, // blue-500
];

const topStaffData = [
    { name: "Sarah L.", revenue: 4500, rating: 4.9 },
    { name: "Jessica T.", revenue: 3800, rating: 4.8 },
    { name: "Emily R.", revenue: 3200, rating: 4.7 },
    { name: "Michael B.", revenue: 2900, rating: 4.9 },
    { name: "Anna K.", revenue: 2500, rating: 4.6 },
];

const topCustomersData = [
    { id: 1, name: "Maria Garcia", visits: 24, totalSpent: 3500, lastVisit: "2 days ago", avatar: "MG" },
    { id: 2, name: "Sophia Lee", visits: 18, totalSpent: 2800, lastVisit: "1 week ago", avatar: "SL" },
    { id: 3, name: "Olivia Johnson", visits: 15, totalSpent: 2100, lastVisit: "3 days ago", avatar: "OJ" },
    { id: 4, name: "Emma Davis", visits: 12, totalSpent: 1800, lastVisit: "2 weeks ago", avatar: "ED" },
    { id: 5, name: "Isabella Martinez", visits: 10, totalSpent: 1500, lastVisit: "1 month ago", avatar: "IM" },
];

// --- Components ---

export function RevenueAnalyticsChart({ selectedMonth }: { selectedMonth: string }) {
    const [monthlyRevenue, setMonthlyRevenue] = useState([
        { name: "Jan", revenue: 0 },
        { name: "Feb", revenue: 0 },
        { name: "Mar", revenue: 0 },
        { name: "Apr", revenue: 0 },
        { name: "May", revenue: 0 },
        { name: "Jun", revenue: 0 },
        { name: "Jul", revenue: 0 },
        { name: "Aug", revenue: 0 },
        { name: "Sep", revenue: 0 },
        { name: "Oct", revenue: 0 },
        { name: "Nov", revenue: 0 },
        { name: "Dec", revenue: 0 },
    ]);

    useEffect(() => {
        const loadData = () => {
            const savedApps = localStorage.getItem('salon_appointments');
            if (savedApps) {
                const allApps = JSON.parse(savedApps);
                const currentYear = new Date().getFullYear();
                
                // Reset to zero for each month
                const data = [
                    { name: "Jan", revenue: 0 }, { name: "Feb", revenue: 0 }, { name: "Mar", revenue: 0 },
                    { name: "Apr", revenue: 0 }, { name: "May", revenue: 0 }, { name: "Jun", revenue: 0 },
                    { name: "Jul", revenue: 0 }, { name: "Aug", revenue: 0 }, { name: "Sep", revenue: 0 },
                    { name: "Oct", revenue: 0 }, { name: "Nov", revenue: 0 }, { name: "Dec", revenue: 0 },
                ];

                allApps.forEach((apt: any) => {
                    const d = new Date(apt.date);
                    if (apt.status === 'Completed' && !isNaN(d.getTime()) && d.getFullYear() === currentYear) {
                        const monthIdx = d.getMonth();
                        const priceNum = parseInt(String(apt.price).replace(/[^0-9]/g, '')) || 0;
                        if (monthIdx >= 0 && monthIdx < 12) {
                            data[monthIdx].revenue += priceNum;
                        }
                    }
                });
                setMonthlyRevenue(data);
            }
        };

        loadData();
        window.addEventListener('salon_appointments_changed', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('salon_appointments_changed', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, [selectedMonth]);

    return (
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-pink-100 flex flex-col h-full col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Revenue Overview - <span className="text-pink-500">{new Date().getFullYear()}</span></h3>
                    <p className="text-sm text-gray-500 mt-1">Accumulated revenue from completed appointments</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${Number(value).toLocaleString()}`} />
                        <Tooltip
                            cursor={{ fill: "#fdf2f8" }}
                            contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue (Completed)']}
                        />
                        <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function BookingsTrendChart({ selectedMonth: globalSelectedMonth }: { selectedMonth: string }) {
    const [currentMonthIdx, setCurrentMonthIdx] = useState(() => {
        // Tie to global selected month if it's a specific month
        const now = new Date();
        if (globalSelectedMonth === "Last Month") {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return lastMonth.getMonth();
        }
        return now.getMonth();
    });
    const [bookingsDataList, setBookingsDataList] = useState([
        { name: "Week 1", bookings: 0 },
        { name: "Week 2", bookings: 0 },
        { name: "Week 3", bookings: 0 },
        { name: "Week 4", bookings: 0 },
        { name: "Week 5", bookings: 0 },
    ]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const now = new Date();
        if (globalSelectedMonth === "Last Month") {
            const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            setCurrentMonthIdx(m.getMonth());
        } else if (globalSelectedMonth === "This Month") {
            setCurrentMonthIdx(now.getMonth());
        }
    }, [globalSelectedMonth]);

    useEffect(() => {
        const loadData = () => {
            const savedApps = localStorage.getItem('salon_appointments');
            if (savedApps) {
                const allApps = JSON.parse(savedApps);
                const year = new Date().getFullYear();
                
                // Initialize week buckets
                const data = [
                    { name: "Week 1", bookings: 0 },
                    { name: "Week 2", bookings: 0 },
                    { name: "Week 3", bookings: 0 },
                    { name: "Week 4", bookings: 0 },
                    { name: "Week 5", bookings: 0 },
                ];

                allApps.forEach((apt: any) => {
                    if (apt.status === 'Completed' && apt.date) {
                        const d = new Date(apt.date);
                        if (!isNaN(d.getTime()) && 
                            d.getMonth() === currentMonthIdx && 
                            d.getFullYear() === year) {
                            
                            const day = d.getDate();
                            // Simple grouping: 1-7, 8-14, 15-21, 22-28, 29+
                            let weekIdx = 0;
                            if (day <= 7) weekIdx = 0;
                            else if (day <= 14) weekIdx = 1;
                            else if (day <= 21) weekIdx = 2;
                            else if (day <= 28) weekIdx = 3;
                            else weekIdx = 4;
                            
                            data[weekIdx].bookings += 1;
                        }
                    }
                });
                setBookingsDataList(data);
            }
        };

        loadData();
        window.addEventListener('salon_appointments_changed', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('salon_appointments_changed', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, [currentMonthIdx]);

    return (
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-pink-100 flex flex-col h-full lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Monthly Bookings - <span className="text-pink-500">{monthsList[currentMonthIdx]}</span></h3>
                    <p className="text-sm text-gray-500 mt-1">Number of completed appointments</p>
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Select Month</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {monthsList.map((month, idx) => (
                                        <button
                                            key={month}
                                            onClick={() => {
                                                setCurrentMonthIdx(idx);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentMonthIdx === idx ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookingsDataList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value: any) => [`${value} bookings`, "Completed"]}
                        />
                        <Area type="monotone" dataKey="bookings" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const PIE_COLORS = ["#ec4899", "#fcd34d", "#8b5cf6", "#10b981", "#3b82f6", "#f97316", "#ef4444", "#14b8a6"];

export function ServiceUsageAnalyticsChart({ selectedMonth }: { selectedMonth?: string }) {
    const [serviceData, setServiceData] = useState<{ name: string, count?: number, value: number, color: string }[]>([]);

    useEffect(() => {
        const loadData = () => {
            const savedAppointments = localStorage.getItem('salon_appointments');
            if (savedAppointments) {
                const allAppointments = JSON.parse(savedAppointments);

                const now = new Date();
                const filteredApps = allAppointments.filter((apt: any) => {
                    if (!apt.date) return false;
                    const d = new Date(apt.date);
                    if (isNaN(d.getTime())) return false;

                    if (selectedMonth === "This Month") {
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    } else if (selectedMonth === "Last Month") {
                        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
                    } else if (selectedMonth === "Last 3 Months") {
                        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                        return d >= threeMonthsAgo && d <= now;
                    } else if (selectedMonth === "This Year") {
                        return d.getFullYear() === now.getFullYear();
                    }
                    return true;
                });

                const counts: Record<string, number> = {};
                let total = 0;
                filteredApps.forEach((apt: any) => {
                    if (apt.service) { // Count by service directly
                        counts[apt.service] = (counts[apt.service] || 0) + 1;
                        total++;
                    }
                });

                const sortedData = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                    .slice(0, 6) // Get only the top 6
                    .map(([name, value], index) => {
                        return {
                            name: name,
                            count: Number(value),
                            value: Number(value),
                            color: PIE_COLORS[index % PIE_COLORS.length]
                        };
                    });

                if (sortedData.length > 0) {
                    setServiceData(sortedData);
                } else {
                    setServiceData([{ name: "No Data", value: 1, color: "#e2e8f0" }]);
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
    }, [selectedMonth]);

    return (
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-pink-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Services</h3>
                    <p className="text-sm text-gray-500 mt-1">Most frequently booked services</p>
                </div>
                <div className="p-2 bg-pink-50 rounded-xl">
                    <Scissors className="w-5 h-5 text-pink-500" />
                </div>
            </div>
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-start flex-col relative pb-4">
                <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={serviceData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                formatter={(value: any) => [`${value}`, 'Usage']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full px-2 mt-2">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 w-full">
                        {serviceData.map((entry, index) => (
                            <div key={`item-${index}`} className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium overflow-hidden">
                                <div className="flex items-center space-x-2 overflow-hidden w-full">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                    <span className="truncate" title={entry.name}>{entry.name}</span>
                                </div>
                                <span className="shrink-0 font-bold ml-1 text-pink-500">({entry.count})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TopStaffChart({ selectedMonth: globalSelectedMonth }: { selectedMonth?: string }) {
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [staffDataList, setStaffDataList] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Sync with global filter
        const now = new Date();
        if (globalSelectedMonth === "Last Month") {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            setCurrentMonthIdx(lastMonth.getMonth());
        } else if (globalSelectedMonth === "This Month") {
            setCurrentMonthIdx(now.getMonth());
        }
    }, [globalSelectedMonth]);

    useEffect(() => {
        const loadData = () => {
            const savedApps = localStorage.getItem('salon_appointments');
            if (savedApps) {
                const allApps = JSON.parse(savedApps);
                const currentYear = new Date().getFullYear();
                
                // Filter by locally selected month and status
                const filteredApps = allApps.filter((apt: any) => {
                    if (apt.status !== 'Completed' || !apt.date) return false;
                    const d = new Date(apt.date);
                    if (isNaN(d.getTime())) return false;
                    return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
                });

                const revenueMap: Record<string, number> = {};
                filteredApps.forEach((apt: any) => {
                    if (apt.staff) {
                        const price = parseInt(String(apt.price).replace(/[^0-9]/g, '')) || 0;
                        revenueMap[apt.staff] = (revenueMap[apt.staff] || 0) + price;
                    }
                });

                let sorted = Object.entries(revenueMap)
                    .map(([name, rev]) => ({ name, revenue: rev }))
                    .sort((a, b) => {
                        if (b.revenue !== a.revenue) {
                            return b.revenue - a.revenue;
                        }
                        return a.name.localeCompare(b.name);
                    })
                    .slice(0, 4);

                // Recharts draws bottom-up, so we reverse to place #1 at the top natively.
                sorted.reverse();

                if (sorted.length === 0) {
                    setStaffDataList([]); // Showing nothing if no data
                } else {
                    setStaffDataList(sorted);
                }
            } else {
                setStaffDataList([]);
            }
        };

        loadData();
        window.addEventListener('salon_appointments_changed', loadData);
        window.addEventListener('storage', loadData);
        return () => {
            window.removeEventListener('salon_appointments_changed', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, [currentMonthIdx]);

    return (
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-pink-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Staff - <span className="text-pink-500">{monthsList[currentMonthIdx]}</span></h3>
                    <p className="text-sm text-gray-500 mt-1">Ranked by generated revenue</p>
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Select Month</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {monthsList.map((month, idx) => (
                                        <button
                                            key={month}
                                            onClick={() => {
                                                setCurrentMonthIdx(idx);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentMonthIdx === idx ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffDataList} layout="vertical" margin={{ top: 0, right: 30, left: -40, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#111827" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} width={120} />
                        <Tooltip
                            cursor={{ fill: "#f8fafc" }}
                            contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={24}>
                            <LabelList
                                dataKey="revenue"
                                position="right"
                                fill="#111827"
                                fontSize={13}
                                fontWeight={700}
                                formatter={(value: any) => `₱${Number(value).toLocaleString()}`}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function TopCustomersList({ selectedMonth: globalSelectedMonth }: { selectedMonth?: string }) {
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [customersList, setCustomersList] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [customerHistory, setCustomerHistory] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Sync with global filter
        const now = new Date();
        if (globalSelectedMonth === "Last Month") {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            setCurrentMonthIdx(lastMonth.getMonth());
        } else if (globalSelectedMonth === "This Month") {
            setCurrentMonthIdx(now.getMonth());
        }
    }, [globalSelectedMonth]);

    useEffect(() => {
        const loadData = () => {
            const savedAppointments = localStorage.getItem('salon_appointments');
            const savedCustomers = localStorage.getItem('salon_customers');
            
            let allApps = [];
            if (savedAppointments) {
                allApps = JSON.parse(savedAppointments);
            }

            const currentYear = new Date().getFullYear();
            // Filter appointments based on locally selected month and completion
            const filteredApps = allApps.filter((apt: any) => {
                const isCompleted = apt.status === 'Completed' || apt.status === 'Paid';
                if (!isCompleted || !apt.date) return false;
                const d = new Date(apt.date);
                if (isNaN(d.getTime())) return false;
                return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
            });

            let customerMap: Record<string, any> = {};

            // Initialize with known customers to ensure info consistency
            if (savedCustomers) {
                const customers = JSON.parse(savedCustomers);
                customers.forEach((c: any) => {
                    customerMap[c.name] = { ...c, visits: 0, spentValue: 0, lastVisitDate: null };
                });
            }

            filteredApps.forEach((app: any) => {
                if (app.customer) {
                    if (!customerMap[app.customer]) {
                        customerMap[app.customer] = { id: app.id, name: app.customer, visits: 0, spentValue: 0, lastVisitDate: null };
                    }
                    
                    const price = parseInt(String(app.price).replace(/[^0-9]/g, '')) || 0;
                    customerMap[app.customer].visits += 1;
                    customerMap[app.customer].spentValue += price;
                    
                    const aptDate = new Date(app.date);
                    if (!customerMap[app.customer].lastVisitDate || aptDate > customerMap[app.customer].lastVisitDate) {
                        customerMap[app.customer].lastVisitDate = aptDate;
                        customerMap[app.customer].lastVisit = app.date;
                    }
                }
            });

            const processedCustomers = Object.values(customerMap)
                .filter((c: any) => c.visits > 0) // Only show customers with at least one completed visit
                .sort((a: any, b: any) => b.spentValue - a.spentValue)
                .slice(0, 5);

            setCustomersList(processedCustomers);
        };

        loadData();
        window.addEventListener('storage', loadData);
        window.addEventListener('salon_customers_changed', loadData);
        window.addEventListener('salon_appointments_changed', loadData);
        return () => {
            window.removeEventListener('storage', loadData);
            window.removeEventListener('salon_customers_changed', loadData);
            window.removeEventListener('salon_appointments_changed', loadData);
        };
    }, [currentMonthIdx]);

    const handleCustomerClick = (customer: any) => {
        // ... (rest of function unchanged)
        // ...
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-pink-100 flex flex-col h-full lg:col-span-1">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Customers - <span className="text-pink-500">{monthsList[currentMonthIdx]}</span></h3>
                    <p className="text-sm text-gray-500 mt-1">Loyal clients this month</p>
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Select Month</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {monthsList.map((month, idx) => (
                                        <button
                                            key={month}
                                            onClick={() => {
                                                setCurrentMonthIdx(idx);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentMonthIdx === idx ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
            <div className="space-y-4">
                {customersList.map((customer, index) => (
                    <div
                        key={customer.id || index}
                        onClick={() => handleCustomerClick(customer)}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-pink-50/50 transition-all border border-transparent hover:border-pink-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99] group"
                    >
                        <div className="flex items-center gap-4">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{customer.name}</h4>
                                <p className="text-xs text-gray-500 font-medium">Last visit: {customer.lastVisit || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">₱{customer.spentValue.toLocaleString()}</p>
                            <p className="text-xs text-pink-500 font-bold">{customer.visits} visits</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer history modal */}
            {isHistoryModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col border border-pink-100 overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-pink-50 bg-gradient-to-br from-white to-pink-50/30">
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-pink-600 hover:bg-white rounded-full transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedCustomer.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium lowercase">Customer Appointment History</p>
                                </div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="p-6 max-h-[400px] overflow-y-auto">
                            {customerHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {customerHistory.map((app: any, idx: number) => (
                                        <div key={app.id || idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:border-pink-200 transition-all">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Scissors className="w-3.5 h-3.5 text-pink-500" />
                                                    <span className="font-bold text-gray-900 text-sm tracking-tight">{app.service}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-medium">{app.date} • {app.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                                                    <PhilippinePeso className="w-3 h-3 text-pink-600" />
                                                    <span className="font-bold text-pink-600 text-xs tracking-tight">
                                                        {app.price.toString().replace('₱', '').replace(',', '')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Wallet className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{app.paymentMethod || 'Cash'}</span>
                                                    <span className="text-[10px] text-gray-300 mx-1">•</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-pink-50 text-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No completed appointments found.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Spent</span>
                                <span className="text-lg font-bold text-gray-900 tracking-tight">₱{selectedCustomer.spentValue.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
