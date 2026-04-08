"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { addNotification } from "@/lib/notifications";
import {
    Store,
    Clock,
    Bell,
    Save,
    CheckCircle2,
    MapPin,
    Phone,
    Mail,
    Scissors,
} from "lucide-react";

// --- Types ---
interface SalonInfo {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
}

interface DaySchedule {
    isOpen: boolean;
    open: string;
    close: string;
}

interface OperatingHours {
    Monday: DaySchedule;
    Tuesday: DaySchedule;
    Wednesday: DaySchedule;
    Thursday: DaySchedule;
    Friday: DaySchedule;
    Saturday: DaySchedule;
    Sunday: DaySchedule;
}

interface NotificationSettings {
    appointmentReminder: boolean;
    reminderHoursBefore: number;
    newBookingAlert: boolean;
    cancellationAlert: boolean;
    dailySummary: boolean;
    inventoryLowAlert: boolean;
}

// --- Defaults ---
const defaultSalonInfo: SalonInfo = {
    name: "Candy And Rose Salon",
    tagline: "Where beauty meets elegance",
    address: "Blk and Lot, Dasmarinas Cavite",
    phone: "09123456789",
    email: "candyandroses@gmail.com",
};

const defaultOperatingHours: OperatingHours = {
    Monday: { isOpen: true, open: "08:00", close: "19:00" },
    Tuesday: { isOpen: true, open: "08:00", close: "19:00" },
    Wednesday: { isOpen: true, open: "08:00", close: "19:00" },
    Thursday: { isOpen: true, open: "08:00", close: "19:00" },
    Friday: { isOpen: true, open: "08:00", close: "19:00" },
    Saturday: { isOpen: true, open: "09:00", close: "20:00" },
    Sunday: { isOpen: false, open: "10:00", close: "17:00" },
};

const defaultNotifications: NotificationSettings = {
    appointmentReminder: true,
    reminderHoursBefore: 24,
    newBookingAlert: true,
    cancellationAlert: true,
    dailySummary: false,
    inventoryLowAlert: true,
};

// --- Toggle Switch Component ---
const ToggleSwitch = ({
    enabled,
    onChange,
    id,
}: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    id: string;
}) => (
    <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${enabled ? "bg-pink-500" : "bg-gray-200"
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"
                }`}
        />
    </button>
);

// --- Toast ---
const Toast = ({ message, onDone }: { message: string; onDone: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onDone, 3000);
        return () => clearTimeout(timer);
    }, [onDone]);
    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{message}</span>
        </div>
    );
};

// ============================================================
export default function SettingsPage() {
    const [salonInfo, setSalonInfo] = useState<SalonInfo>(defaultSalonInfo);
    const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultOperatingHours);
    const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
    const [toast, setToast] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"salon" | "hours" | "notifications">("salon");
    const [salonErrors, setSalonErrors] = useState<Partial<Record<keyof SalonInfo, string>>>({});

    // Load from localStorage
    useEffect(() => {
        try {
            const si = localStorage.getItem("salon_settings_info");
            const oh = localStorage.getItem("salon_settings_hours");
            const ns = localStorage.getItem("salon_settings_notifications");
            if (si) setSalonInfo(JSON.parse(si));
            if (oh) setOperatingHours(JSON.parse(oh));
            if (ns) setNotifications(JSON.parse(ns));
        } catch { }
    }, []);

    const showToast = (msg: string) => setToast(msg);

    // Phone change handler — enforces "09" prefix
    const handlePhoneChange = (val: string) => {
        let digits = val.replace(/\D/g, "").slice(0, 11);
        if (digits.length >= 1 && digits[0] !== "0") digits = "0" + digits.slice(1);
        if (digits.length >= 2 && digits[1] !== "9") digits = digits[0] + "9" + digits.slice(2);
        setSalonInfo((prev) => ({ ...prev, phone: digits }));
    };

    // Save Salon Info
    const handleSaveSalonInfo = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const errors: Partial<Record<keyof SalonInfo, string>> = {};
        if (!salonInfo.name.trim()) errors.name = "Salon name is required.";
        if (!salonInfo.phone.trim()) errors.phone = "Phone number is required.";
        else if (!/^09\d{9}$/.test(salonInfo.phone)) errors.phone = "Phone must start with 09 and be exactly 11 digits.";
        if (!salonInfo.email.trim()) errors.email = "Email address is required.";
        else if (!salonInfo.email.toLowerCase().endsWith("@gmail.com")) errors.email = "Email must end with @gmail.com.";
        if (!salonInfo.tagline.trim()) errors.tagline = "Tagline / Slogan is required.";
        if (!salonInfo.address.trim()) errors.address = "Address is required.";

        setSalonErrors(errors);
        if (Object.keys(errors).length > 0) return; // block save

        localStorage.setItem("salon_settings_info", JSON.stringify(salonInfo));
        window.dispatchEvent(new Event("salonInfoUpdated"));
        showToast("Salon information saved successfully!");
        addNotification("Settings Updated", "Salon information has been updated.", "system");
    };

    // Save Operating Hours
    const handleSaveHours = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("salon_settings_hours", JSON.stringify(operatingHours));
        showToast("Operating hours saved successfully!");
        addNotification("Settings Updated", "Operating hours have been updated.", "system");
    };

    // Save Notifications
    const handleSaveNotifications = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("salon_settings_notifications", JSON.stringify(notifications));
        showToast("Notification preferences saved!");
        if (notifications.appointmentReminder) {
            addNotification(
                "Reminders Enabled",
                `Appointment reminders set to ${notifications.reminderHoursBefore}h before booking.`,
                "appointment"
            );
        }
    };

    const updateDay = (
        day: keyof OperatingHours,
        field: keyof DaySchedule,
        value: string | boolean
    ) => {
        setOperatingHours((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const days = Object.keys(operatingHours) as (keyof OperatingHours)[];

    const sectionTabs = [
        { key: "salon" as const, label: "Salon Info", icon: Store },
        { key: "hours" as const, label: "Operating Hours", icon: Clock },
        { key: "notifications" as const, label: "Notifications", icon: Bell },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-pink-100 overflow-y-auto w-full max-w-full">
            <Header />

            <div className="px-8 pb-8 flex-1 w-full mt-2">
                {/* Page Title */}
                <div className="mb-5">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h2>
                    <p className="text-gray-500 mt-1 font-medium">
                        Configure your salon preferences and system settings
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-pink-100 w-fit">
                    {sectionTabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeSection === key
                                    ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                                    : "text-gray-500 hover:text-pink-500 hover:bg-pink-50"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ─────────────────────────────── SALON INFO ─────────────────────────── */}
                {activeSection === "salon" && (
                    <form onSubmit={handleSaveSalonInfo} className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Salon Information</h3>
                                    <p className="text-sm text-gray-500">Basic details about your salon</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Salon Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                        Salon Name <span className="text-pink-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={salonInfo.name}
                                        onChange={(e) => { setSalonInfo({ ...salonInfo, name: e.target.value.replace(/[0-9]/g, "") }); setSalonErrors((p) => ({ ...p, name: undefined })); }}
                                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all font-medium ${salonErrors.name ? "border-red-400 ring-1 ring-red-400" : "border-pink-100"}`}
                                        placeholder="e.g. Candy And Rose Salon"
                                    />
                                    {salonErrors.name && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{salonErrors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-pink-400" /> Phone Number <span className="text-pink-400">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={salonInfo.phone}
                                        onChange={(e) => { handlePhoneChange(e.target.value); setSalonErrors((p) => ({ ...p, phone: undefined })); }}
                                        maxLength={11}
                                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all font-medium ${salonErrors.phone ? "border-red-400 ring-1 ring-red-400" : "border-pink-100"}`}
                                        placeholder="09XXXXXXXXX"
                                    />
                                    {salonErrors.phone && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{salonErrors.phone}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-pink-400" /> Email Address <span className="text-pink-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={salonInfo.email}
                                        onChange={(e) => { setSalonInfo({ ...salonInfo, email: e.target.value }); setSalonErrors((p) => ({ ...p, email: undefined })); }}
                                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all font-medium ${salonErrors.email ? "border-red-400 ring-1 ring-red-400" : "border-pink-100"}`}
                                        placeholder="example@gmail.com"
                                    />
                                    {salonErrors.email && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{salonErrors.email}</p>}
                                </div>

                                {/* Tagline */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">
                                        Tagline / Slogan <span className="text-pink-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={salonInfo.tagline}
                                        onChange={(e) => { setSalonInfo({ ...salonInfo, tagline: e.target.value.replace(/[0-9]/g, "") }); setSalonErrors((p) => ({ ...p, tagline: undefined })); }}
                                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all font-medium ${salonErrors.tagline ? "border-red-400 ring-1 ring-red-400" : "border-pink-100"}`}
                                        placeholder="e.g. Where beauty meets elegance"
                                    />
                                    {salonErrors.tagline && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{salonErrors.tagline}</p>}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-pink-400" /> Address <span className="text-pink-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={salonInfo.address}
                                        onChange={(e) => { setSalonInfo({ ...salonInfo, address: e.target.value }); setSalonErrors((p) => ({ ...p, address: undefined })); }}
                                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all font-medium ${salonErrors.address ? "border-red-400 ring-1 ring-red-400" : "border-pink-100"}`}
                                        placeholder="Street, City, Province"
                                    />
                                    {salonErrors.address && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{salonErrors.address}</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-7 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Salon Info
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ─────────────────────────────── OPERATING HOURS ─────────────────────── */}
                {activeSection === "hours" && (
                    <form onSubmit={handleSaveHours} className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Operating Hours</h3>
                                    <p className="text-sm text-gray-500">Set which days the salon is open and its hours</p>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-5 mb-5 text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                                <span className="w-28">Day</span>
                                <span className="w-16 text-center">Status</span>
                                <span className="ml-4 flex-1">Opening Time</span>
                                <span className="flex-1">Closing Time</span>
                            </div>

                            <div className="space-y-3">
                                {days.map((day) => {
                                    const schedule = operatingHours[day];
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 ${schedule.isOpen
                                                    ? "bg-emerald-50/50 border-emerald-100"
                                                    : "bg-gray-50 border-gray-100 opacity-70"
                                                }`}
                                        >
                                            {/* Day Name */}
                                            <span
                                                className={`w-28 text-sm font-bold ${schedule.isOpen ? "text-gray-800" : "text-gray-400"
                                                    }`}
                                            >
                                                {day}
                                            </span>

                                            {/* Toggle */}
                                            <div className="flex items-center gap-2">
                                                <ToggleSwitch
                                                    id={`toggle-${day}`}
                                                    enabled={schedule.isOpen}
                                                    onChange={(val) => updateDay(day, "isOpen", val)}
                                                />
                                                <span
                                                    className={`text-xs font-bold w-14 ${schedule.isOpen ? "text-emerald-600" : "text-gray-400"
                                                        }`}
                                                >
                                                    {schedule.isOpen ? "Open" : "Closed"}
                                                </span>
                                            </div>

                                            {/* Time Pickers */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex flex-col flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Opens
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={schedule.open}
                                                        disabled={!schedule.isOpen}
                                                        onChange={(e) => updateDay(day, "open", e.target.value)}
                                                        className="px-3 py-2 rounded-xl border border-pink-100 bg-white text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                    />
                                                </div>
                                                <div className="mt-4 text-gray-300 font-bold select-none">→</div>
                                                <div className="flex flex-col flex-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Closes
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={schedule.close}
                                                        disabled={!schedule.isOpen}
                                                        onChange={(e) => updateDay(day, "close", e.target.value)}
                                                        className="px-3 py-2 rounded-xl border border-pink-100 bg-white text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-7 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Operating Hours
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ─────────────────────────────── NOTIFICATIONS ───────────────────────── */}
                {activeSection === "notifications" && (
                    <form onSubmit={handleSaveNotifications} className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Notification Reminders</h3>
                                    <p className="text-sm text-gray-500">
                                        Control which system messages are sent as reminders
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* ── Appointment Reminder ── */}
                                <div
                                    className={`rounded-2xl border p-5 transition-all duration-200 ${notifications.appointmentReminder
                                            ? "bg-pink-50/60 border-pink-200"
                                            : "bg-gray-50 border-gray-100"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">
                                                Appointment Reminder
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Send a system reminder message before a customer's appointment is due.
                                            </p>

                                            {/* Hours selector shown only when toggle is on */}
                                            {notifications.appointmentReminder && (
                                                <div className="mt-4 flex items-center gap-3">
                                                    <label className="text-xs font-bold text-gray-600">
                                                        Remind me
                                                    </label>
                                                    <select
                                                        value={notifications.reminderHoursBefore}
                                                        onChange={(e) =>
                                                            setNotifications({
                                                                ...notifications,
                                                                reminderHoursBefore: Number(e.target.value),
                                                            })
                                                        }
                                                        className="px-3 py-1.5 rounded-xl border border-pink-200 bg-white text-pink-600 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                                                    >
                                                        <option value={1}>1 hour before</option>
                                                        <option value={3}>3 hours before</option>
                                                        <option value={6}>6 hours before</option>
                                                        <option value={12}>12 hours before</option>
                                                        <option value={24}>24 hours before</option>
                                                        <option value={48}>48 hours before</option>
                                                    </select>
                                                    <label className="text-xs font-bold text-gray-600">
                                                        the appointment
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <ToggleSwitch
                                            id="toggle-appointment-reminder"
                                            enabled={notifications.appointmentReminder}
                                            onChange={(val) =>
                                                setNotifications({ ...notifications, appointmentReminder: val })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* ── New Booking Alert ── */}
                                <NotifRow
                                    id="toggle-new-booking"
                                    title="New Booking Alert"
                                    description="Receive a system notification whenever a new appointment is created."
                                    enabled={notifications.newBookingAlert}
                                    onChange={(val) =>
                                        setNotifications({ ...notifications, newBookingAlert: val })
                                    }
                                />

                                {/* ── Cancellation Alert ── */}
                                <NotifRow
                                    id="toggle-cancellation"
                                    title="Cancellation Alert"
                                    description="Get notified when an appointment is cancelled by a customer."
                                    enabled={notifications.cancellationAlert}
                                    onChange={(val) =>
                                        setNotifications({ ...notifications, cancellationAlert: val })
                                    }
                                />

                                {/* ── Daily Summary ── */}
                                <NotifRow
                                    id="toggle-daily-summary"
                                    title="Daily Summary"
                                    description="Receive an end-of-day summary of appointments, revenue, and attendance."
                                    enabled={notifications.dailySummary}
                                    onChange={(val) =>
                                        setNotifications({ ...notifications, dailySummary: val })
                                    }
                                />

                                {/* ── Inventory Low Alert ── */}
                                <NotifRow
                                    id="toggle-inventory-low"
                                    title="Low Inventory Alert"
                                    description="Get notified when an inventory item falls below the minimum stock level."
                                    enabled={notifications.inventoryLowAlert}
                                    onChange={(val) =>
                                        setNotifications({ ...notifications, inventoryLowAlert: val })
                                    }
                                />
                            </div>

                            {/* Active summary */}
                            <div className="mt-6 px-5 py-4 bg-pink-50 rounded-2xl border border-pink-100">
                                <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">
                                    Active Notifications
                                </p>
                                <p className="text-sm text-gray-600 font-medium">
                                    {[
                                        notifications.appointmentReminder && "Appointment Reminder",
                                        notifications.newBookingAlert && "New Booking",
                                        notifications.cancellationAlert && "Cancellation",
                                        notifications.dailySummary && "Daily Summary",
                                        notifications.inventoryLowAlert && "Low Inventory",
                                    ]
                                        .filter(Boolean)
                                        .join(" · ") || "No notifications enabled"}
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-7 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Toast */}
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </div>
    );
}

// ── Reusable notification row ──
function NotifRow({
    id,
    title,
    description,
    enabled,
    onChange,
}: {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-2xl border p-5 transition-all duration-200 ${enabled ? "bg-pink-50/60 border-pink-200" : "bg-gray-50 border-gray-100"
                }`}
        >
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <ToggleSwitch id={id} enabled={enabled} onChange={onChange} />
        </div>
    );
}
