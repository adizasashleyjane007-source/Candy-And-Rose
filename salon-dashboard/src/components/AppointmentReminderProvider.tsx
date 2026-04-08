"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, User, Scissors, Calendar, X, XCircle, TrendingUp, Users, DollarSign } from "lucide-react";

interface Appointment {
    id: string;
    customer: string;
    service: string;
    staff: string;
    date: string;
    time: string;
    duration?: string;
    price?: string;
    status: string;
    createdAt?: string; // We might need this for precise daily stats, but we'll use appointment date
}

interface SummaryData {
    cancelled: number;
    completed: number;
    pending: number;
    revenue: number;
    newCustomers: number;
}

// Parse appointment date+time into a Date object
function parseAppointmentDateTime(dateStr: string, timeStr: string): Date | null {
    try {
        let parsedDate: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split("-").map(Number);
            parsedDate = new Date(y, m - 1, d);
        } else {
            parsedDate = new Date(dateStr);
        }
        if (isNaN(parsedDate.getTime())) return null;

        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!timeMatch) return null;

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const meridiem = timeMatch[3]?.toUpperCase();

        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;

        parsedDate.setHours(hours, minutes, 0, 0);
        return parsedDate;
    } catch {
        return null;
    }
}

// Track which appointments have already triggered a reminder this session
const remindedIds = new Set<string>();

export default function AppointmentReminderProvider() {
    const router = useRouter();
    const [reminderAppt, setReminderAppt] = useState<Appointment | null>(null);
    const [cancelledAppt, setCancelledAppt] = useState<Appointment | null>(null);
    const [warnCancelAppt, setWarnCancelAppt] = useState<Appointment | null>(null);
    const [dailySummary, setDailySummary] = useState<SummaryData | null>(null);
    const [isImmediate, setIsImmediate] = useState(false);
    const [minutesLeft, setMinutesLeft] = useState(0);
    const [showedSummaryDate, setShowedSummaryDate] = useState<string | null>(null);

    const checkReminders = useCallback(() => {
        const raw = localStorage.getItem("salon_appointments");
        if (!raw) return;

        let appointments: Appointment[] = [];
        try {
            appointments = JSON.parse(raw);
        } catch {
            return;
        }

        const now = new Date();
        const dateString = now.toLocaleDateString('en-CA');
        let hasChanges = false;
        let lastAutoCancelled: Appointment | null = null;

        // 1. Check for reminders (1 hour, 20 minutes, NOW, and 30-Min Late Warning)
        try {
            const ns = localStorage.getItem("salon_settings_notifications");
            if (ns) {
                const settings = JSON.parse(ns);
                if (settings.appointmentReminder) {
                    for (const apt of appointments) {
                        if (apt.status === "Cancelled" || apt.status === "Completed") continue;

                        const aptTime = parseAppointmentDateTime(apt.date, apt.time);
                        if (!aptTime) continue;

                        const diffMs = aptTime.getTime() - now.getTime();
                        const diffMins = Math.floor(diffMs / 60000);

                        // IMMEDIATE REMINDER (The Exact Time)
                        if (diffMins === 0 && !remindedIds.has(`${apt.id}-now`)) {
                            remindedIds.add(`${apt.id}-now`);
                            setMinutesLeft(0);
                            setIsImmediate(true);
                            setReminderAppt(apt);
                            break;
                        }

                        // 1 Hour Reminder
                        if (diffMins >= 55 && diffMins <= 65 && !remindedIds.has(`${apt.id}-1h`)) {
                            remindedIds.add(`${apt.id}-1h`);
                            setMinutesLeft(diffMins);
                            setIsImmediate(false);
                            setReminderAppt(apt);
                            break;
                        }

                        // 20 Minute Reminder
                        if (diffMins >= 15 && diffMins <= 25 && !remindedIds.has(`${apt.id}-20m`)) {
                            remindedIds.add(`${apt.id}-20m`);
                            setMinutesLeft(diffMins);
                            setIsImmediate(false);
                            setReminderAppt(apt);
                            break;
                        }
                    }
                }
            }
        } catch { }

        const updatedAppointments = appointments;
        /* Auto-cancel logic removed as per user request */

        if (hasChanges) {
            localStorage.setItem("salon_appointments", JSON.stringify(updatedAppointments));
            window.dispatchEvent(new Event('salon_appointments_changed'));
            window.dispatchEvent(new Event('storage'));
        }

        // 3. DAILY SUMMARY LOGIC (1 min after closing)
        try {
            const hoursRaw = localStorage.getItem("salon_settings_hours");
            if (hoursRaw && showedSummaryDate !== dateString) {
                const hours = JSON.parse(hoursRaw);
                const closing = hours.closing; // "18:00"
                if (closing) {
                    const [closeHour, closeMin] = closing.split(":").map(Number);
                    const triggerTime = new Date(now);
                    triggerTime.setHours(closeHour, closeMin + 1, 0, 0); // 1 minute after closing

                    // If it's currently past the trigger time, and we haven't shown it today
                    if (now >= triggerTime) {
                        // Calculate stats for TODAY
                        const todayApts = updatedAppointments.filter(a => {
                            const ad = parseAppointmentDateTime(a.date, a.time);
                            return ad && ad.toLocaleDateString('en-CA') === dateString;
                        });

                        const cancelled = todayApts.filter(a => a.status === "Cancelled").length;
                        const completed = todayApts.filter(a => a.status === "Completed").length;
                        const pending = todayApts.filter(a => a.status === "Pending").length;
                        const revenue = todayApts
                            .filter(a => a.status === "Completed")
                            .reduce((sum, a) => sum + parseInt(a.price?.replace(/[^0-9]/g, '') || "0"), 0);

                        // New customers today
                        const customersRaw = localStorage.getItem("salon_customers");
                        let newCustomers = 0;
                        if (customersRaw) {
                            const customers = JSON.parse(customersRaw);
                            newCustomers = customers.filter((c: any) => {
                                if (!c.createdAt) return false;
                                return new Date(c.createdAt).toLocaleDateString('en-CA') === dateString;
                            }).length;
                        }

                        setDailySummary({ cancelled, completed, pending, revenue, newCustomers });
                        setShowedSummaryDate(dateString);
                    }
                }
            }
        } catch (err) {
            console.error("Summary error:", err);
        }
    }, [showedSummaryDate]);

    useEffect(() => {
        checkReminders();
        const interval = setInterval(checkReminders, 30 * 1000); // Check every 30s for more precision
        return () => clearInterval(interval);
    }, [checkReminders]);

    const handleOkay = () => {
        setReminderAppt(null);
        setCancelledAppt(null);
        setWarnCancelAppt(null);
        setDailySummary(null);
        router.push("/appointment");
    };

    const handleCancel = () => {
        setReminderAppt(null);
        setCancelledAppt(null);
        setWarnCancelAppt(null);
        setDailySummary(null);
    };

    const handleConfirmCancel = () => {
        if (!warnCancelAppt) return;

        const raw = localStorage.getItem("salon_appointments");
        if (raw) {
            const appointments: Appointment[] = JSON.parse(raw);
            const updated = appointments.map(a =>
                a.id === warnCancelAppt.id ? { ...a, status: "Cancelled" } : a
            );
            localStorage.setItem("salon_appointments", JSON.stringify(updated));
            window.dispatchEvent(new Event('salon_appointments_changed'));
            window.dispatchEvent(new Event('storage'));
        }
        setWarnCancelAppt(null);
    };

    const handleDenyCancel = () => {
        setWarnCancelAppt(null);
    };

    if (!reminderAppt && !cancelledAppt && !dailySummary && !warnCancelAppt) return null;

    if (warnCancelAppt) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-amber-100 animate-in zoom-in-95 duration-300 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-red-500" />
                    <div className="p-7">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                                <XCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Cancel Appointment?</h3>
                                <p className="text-sm text-amber-600 font-bold">Customer is 30 minutes behind schedule</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 space-y-3 mb-6">
                            <DetailRow icon={<User className="w-4 h-4 text-amber-400" />} label="Customer" value={warnCancelAppt.customer} />
                            <DetailRow icon={<Scissors className="w-4 h-4 text-amber-400" />} label="Service" value={warnCancelAppt.service} />
                            <DetailRow icon={<Clock className="w-4 h-4 text-amber-400" />} label="Scheduled" value={warnCancelAppt.time} />
                        </div>

                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            This appointment has passed the 30-minute grace period. Would you like to officially cancel it as a no-show?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDenyCancel}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                No, Wait
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-md shadow-red-100 active:scale-95"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (dailySummary) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-300 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-pink-400 to-amber-400" />
                    <div className="p-7">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">End of Day Summary</h3>
                                <p className="text-sm text-gray-500 font-medium">Daily performance review</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Revenue</p>
                                <p className="text-xl font-bold text-gray-900">₱{dailySummary.revenue.toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">New Clients</p>
                                <p className="text-xl font-bold text-gray-900">{dailySummary.newCustomers}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-sm font-semibold text-gray-600">Completed</span>
                                </div>
                                <span className="font-bold text-gray-900">{dailySummary.completed}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-sm font-semibold text-gray-600">Pending No-shows</span>
                                </div>
                                <span className="font-bold text-gray-900">{dailySummary.pending}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <span className="text-sm font-semibold text-gray-600">Cancelled</span>
                                </div>
                                <span className="font-bold text-gray-900">{dailySummary.cancelled}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCancel}
                            className="w-full px-4 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-all shadow-md shadow-pink-100 hover:shadow-lg active:scale-95"
                        >
                            Close Summary
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header accent */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${cancelledAppt ? 'from-red-400 to-red-600' : 'from-pink-400 to-pink-600'}`} />

                {/* Content */}
                <div className="p-7">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${cancelledAppt ? 'bg-red-50' : 'bg-pink-100'}`}>
                            {cancelledAppt ? (
                                <XCircle className="w-6 h-6 text-red-500" />
                            ) : (
                                <Bell className="w-6 h-6 text-pink-500 animate-bounce" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {cancelledAppt ? 'Appointment Cancelled' : isImmediate ? 'Appointment Starting Now!' : 'Appointment Reminder'}
                            </h3>
                            <p className={`text-sm font-semibold mt-0.5 ${cancelledAppt ? 'text-red-500' : 'text-pink-500'}`}>
                                {cancelledAppt ? 'Cancelled due to no-show' : isImmediate ? 'Scheduled for exactly this time' : `Upcoming in ~${minutesLeft} minutes`}
                            </p>
                        </div>
                    </div>

                    {isImmediate && !cancelledAppt && (
                        <div className="mb-5 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full w-fit animate-pulse">
                            LIVE SCHEDULE
                        </div>
                    )}

                    {/* Appointment Details Card */}
                    <div className={`${cancelledAppt ? 'bg-red-50 border-red-100' : 'bg-pink-50 border-pink-100'} rounded-2xl border p-5 space-y-3 mb-6`}>
                        <DetailRow
                            icon={cancelledAppt ? <User className="w-4 h-4 text-red-400" /> : <User className="w-4 h-4 text-pink-400" />}
                            label="Customer"
                            value={cancelledAppt ? cancelledAppt.customer : reminderAppt!.customer}
                        />
                        <DetailRow
                            icon={cancelledAppt ? <Scissors className="w-4 h-4 text-red-400" /> : <Scissors className="w-4 h-4 text-pink-400" />}
                            label="Service"
                            value={cancelledAppt ? cancelledAppt.service : reminderAppt!.service}
                        />
                        <DetailRow
                            icon={cancelledAppt ? <Calendar className="w-4 h-4 text-red-400" /> : <Calendar className="w-4 h-4 text-pink-400" />}
                            label="Date"
                            value={cancelledAppt ? cancelledAppt.date : reminderAppt!.date}
                        />
                        <DetailRow
                            icon={cancelledAppt ? <Clock className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-pink-400" />}
                            label="Time"
                            value={cancelledAppt ? cancelledAppt.time : reminderAppt!.time}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleOkay}
                            className={`flex-[2] px-4 py-3 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 ${cancelledAppt ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}
                        >
                            {cancelledAppt ? 'View Details' : 'Okay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Small helper row ──
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="shrink-0">{icon}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-16">{label}</span>
            <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
        </div>
    );
}


