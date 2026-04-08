"use client";

import { CalendarIcon, Users, PhilippinePeso } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OverviewCards() {
    const [stats, setStats] = useState({
        revenue: 0,
        todaysBookings: 0,
        confirmedBookings: 0,
        totalCustomers: 0
    });

    useEffect(() => {
        const loadData = () => {
            let revenue = 0;
            let todaysBookings = 0;
            let confirmedBookings = 0;
            
            const savedAppointments = localStorage.getItem('salon_appointments');
            const now = new Date();
            const todayStr = now.toDateString();
            
            if (savedAppointments) {
                const appointments = JSON.parse(savedAppointments);
                
                appointments.forEach((apt: any) => {
                    // 1. Revenue: Only count completed bookings
                    if (apt.status === 'Completed') {
                        // Use receiptDate (collected date) if available, fallback to date
                        const pricePaid = apt.pricePaid || apt.price;
                        const priceNum = parseInt(String(pricePaid).replace(/[^0-9]/g, '')) || 0;
                        revenue += priceNum;
                    }
                    
                    // 2. Bookings for today
                    if (apt.date) {
                        const aptDate = new Date(apt.date);
                        if (!isNaN(aptDate.getTime()) && aptDate.toDateString() === todayStr) {
                            todaysBookings++;
                            if (apt.status === 'Active' || apt.status === 'Completed') {
                                confirmedBookings++;
                            }
                        }
                    }
                });
            }

            let totalCustomers = 0;
            const savedCustomers = localStorage.getItem('salon_customers');
            if (savedCustomers) {
                const customers = JSON.parse(savedCustomers);
                totalCustomers = customers.length;
            }

            setStats({
                revenue,
                todaysBookings,
                confirmedBookings,
                totalCustomers
            });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link 
                href="/appointment?status=Completed"
                className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 flex flex-col justify-between hover:bg-pink-50 transition-colors"
            >
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <PhilippinePeso className="w-5 h-5 text-pink-400" />
                </div>
                <div className="mt-3">
                    <h3 className="text-3xl font-bold text-gray-900">₱{stats.revenue.toLocaleString()}</h3>
                    <p className="text-sm text-pink-500 mt-1 font-medium">from completed bookings</p>
                </div>
            </Link>

            <Link 
                href="/appointment?filter=Today"
                className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 flex flex-col justify-between hover:bg-pink-50 transition-colors"
            >
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                    <CalendarIcon className="w-5 h-5 text-pink-400" />
                </div>
                <div className="mt-3">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.todaysBookings}</h3>
                    <p className="text-sm text-pink-500 mt-1 font-medium">{stats.confirmedBookings} confirmed</p>
                </div>
            </Link>

            <Link 
                href="/customer"
                className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 flex flex-col justify-between hover:bg-pink-50 transition-colors"
            >
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                    <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div className="mt-3">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</h3>
                    <p className="text-sm text-pink-500 mt-1 font-medium">registered clients</p>
                </div>
            </Link>
        </div>
    );
}
