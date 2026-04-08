"use client";

import Header from "@/components/Header";
import {
    CalendarIcon,
    Clock,
    CheckCircle,
    PhilippinePeso,
    Search,
    Filter,
    Plus,
    ArrowLeft,
    ArrowRight,
    Edit2,
    Trash2,
    X,
    ChevronDown,
    User,
    XCircle,
    FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addNotification } from "@/lib/notifications";

function AppointmentContent() {
    const searchParams = useSearchParams();
    const filterParam = searchParams.get('filter');
    const statusParam = searchParams.get('status');

    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState("All Time");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // CRUD states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

    // Data states
    const [appointments, setAppointments] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        customerName: "",
        serviceName: "",
        staffName: "",
        date: "",
        time: "",
    });

    // Combobox/Autocomplete state for Customer
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (filterParam) {
            setDateFilter(filterParam);
        }
        if (statusParam) {
            setStatusFilter(statusParam);
        }
    }, [filterParam, statusParam]);

    useEffect(() => {
        const savedAppointments = localStorage.getItem('salon_appointments');
        if (savedAppointments) {
            setAppointments(JSON.parse(savedAppointments));
        } else {
            // Default mock data if empty
            const defaultApps = [
                {
                    id: "APT-001",
                    customer: "Marie Anne",
                    service: "Haircut",
                    staff: "Lily",
                    date: "Sep 12, 2026",
                    time: "09:00",
                    duration: "1 hr",
                    price: "₱120",
                    status: "Pending",
                }
            ];
            setAppointments(defaultApps);
            localStorage.setItem('salon_appointments', JSON.stringify(defaultApps));
        }

        const savedCustomers = localStorage.getItem('salon_customers');
        if (savedCustomers) {
            setCustomers(JSON.parse(savedCustomers));
        }

        const savedServices = localStorage.getItem('salon_services');
        if (savedServices) {
            setServices(JSON.parse(savedServices));
        }

        const savedStaff = localStorage.getItem('salon_staff');
        if (savedStaff) {
            setStaffList(JSON.parse(savedStaff));
        }

        // Click outside listener for customer dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(formData.customerName.toLowerCase())
    );

    const handleSaveBooking = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Find service details and parse inputs
        const selectedService = services.find(s => s.name === formData.serviceName);
        const duration = selectedService?.duration || "N/A";
        let price = selectedService?.price || "N/A";
        if (price !== "N/A" && !price.includes('₱')) {
            price = `₱${price}`;
        }

        const priceNum = parseInt(price.replace(/[^0-9]/g, '')) || 0;
        let formattedDate = "N/A";
        if (formData.date) {
            // Adjust for timezone offset if necessary or just use strict parsing.
            // Using a simple split to avoid timezone shifting the day back
            const [year, month, day] = formData.date.split('-');
            formattedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        // 2. Auto-register or Update customer IF NOT EDITING
        if (!editingId) {
            let currentCustomers = [...customers];
            const existingCustomerIndex = currentCustomers.findIndex(c => c.name.toLowerCase() === formData.customerName.toLowerCase());

            if (existingCustomerIndex !== -1) {
                // Update existing customer
                const cust = currentCustomers[existingCustomerIndex];
                const currentSpent = parseInt(String(cust.totalSpent || "0").replace(/[^0-9]/g, '')) || 0;
                const newTotalSpent = currentSpent + priceNum;

                currentCustomers[existingCustomerIndex] = {
                    ...cust,
                    visits: (cust.visits || 0) + 1,
                    lastVisit: formattedDate,
                    totalSpent: `₱${newTotalSpent.toLocaleString()}`
                };
                setCustomers(currentCustomers);
                localStorage.setItem('salon_customers', JSON.stringify(currentCustomers));
            } else if (formData.customerName.trim() !== "") {
                // Register new customer
                const numPart = currentCustomers.length > 0 ? Math.max(...currentCustomers.map(c => parseInt(c.id.split('-')[1] || "0"))) + 1 : 1;
                const newId = `CUST-${numPart.toString().padStart(3, '0')}`;
                const newCustomer = {
                    id: newId,
                    name: formData.customerName,
                    email: "",
                    phone: "",
                    visits: 1,
                    lastVisit: formattedDate,
                    totalSpent: `₱${priceNum.toLocaleString()}`,
                    status: "Active"
                };
                currentCustomers.push(newCustomer);
                setCustomers(currentCustomers);
                localStorage.setItem('salon_customers', JSON.stringify(currentCustomers));
                addNotification("New Customer Registered", `${formData.customerName} was added to the system.`, "customer");
            }
        }

        // 3. Create or Update Appointment
        let updatedAppointments = [...appointments];
        if (editingId) {
            updatedAppointments = updatedAppointments.map(a =>
                a.id === editingId ? {
                    ...a,
                    customer: formData.customerName,
                    service: formData.serviceName,
                    staff: formData.staffName,
                    date: formData.date,
                    time: formData.time,
                    duration: duration,
                    price: price
                } : a
            );
            addNotification("Booking Updated", `Appointment for ${formData.customerName} updated.`, "appointment");
        } else {
            const numPartApt = appointments.length > 0 ? Math.max(...appointments.map(a => parseInt(a.id.toString().replace('APT-', '') || "0"))) + 1 : 1;
            const newAppointment = {
                id: `APT-${numPartApt.toString().padStart(3, '0')}`,
                customer: formData.customerName,
                service: formData.serviceName,
                staff: formData.staffName,
                date: formData.date,
                time: formData.time,
                duration: duration,
                price: price,
                status: "Pending" // Automatically sets as Pending
            };
            updatedAppointments = [newAppointment, ...updatedAppointments];
            addNotification("Booking Created", `New appointment for ${formData.customerName} saved successfully.`, "appointment");
        }

        setAppointments(updatedAppointments);
        localStorage.setItem('salon_appointments', JSON.stringify(updatedAppointments));
        window.dispatchEvent(new Event('salon_appointments_changed'));

        // Clean up
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            customerName: "",
            serviceName: "",
            staffName: "",
            date: "",
            time: "",
        });
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormData({
            customerName: "",
            serviceName: "",
            staffName: "",
            date: "",
            time: "",
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (apt: any) => {
        setEditingId(apt.id);

        let dateForInput = apt.date;
        if (apt.date && typeof apt.date === "string" && apt.date.match(/[A-Za-z]+ \d{1,2}, \d{4}/)) {
            const parsed = new Date(apt.date);
            if (!isNaN(parsed.getTime())) {
                const tzOffset = parsed.getTimezoneOffset() * 60000;
                dateForInput = new Date(parsed.getTime() - tzOffset).toISOString().split('T')[0];
            }
        }

        setFormData({
            customerName: apt.customer,
            serviceName: apt.service,
            staffName: apt.staff,
            date: dateForInput,
            time: apt.time,
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setAppointmentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (appointmentToDelete) {
            const updated = appointments.filter(a => a.id !== appointmentToDelete);
            setAppointments(updated);
            localStorage.setItem('salon_appointments', JSON.stringify(updated));
            window.dispatchEvent(new Event('salon_appointments_changed'));
            addNotification("Appointment Deleted", "The appointment was successfully removed.", "system");
        }
        setIsDeleteModalOpen(false);
        setAppointmentToDelete(null);
    };

    // Filter, Search, and Pagination Logic
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.status.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || apt.status === statusFilter;

        let matchesDate = true;
        if (dateFilter !== "All Time") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);

            const diffTime = aptDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === "Today") {
                matchesDate = diffDays === 0;
            } else if (dateFilter === "Tomorrow") {
                matchesDate = diffDays === 1;
            } else if (dateFilter === "Next Week") {
                matchesDate = diffDays >= 0 && diffDays <= 7;
            } else if (dateFilter === "Next Month") {
                const nextMonth = (today.getMonth() + 1) % 12;
                const yearOfNextMonth = today.getFullYear() + (today.getMonth() === 11 ? 1 : 0);
                matchesDate = aptDate.getMonth() === nextMonth && aptDate.getFullYear() === yearOfNextMonth;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedAppointments = filteredAppointments.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    // Calculate metrics
    const totalAppointmentsCount = appointments.length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;
    const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

    // VERY simple revenue calculation for demo purposes
    const totalRevenue = appointments
        .filter(a => a.status === 'Completed')
        .reduce((sum, a) => {
            const num = parseInt(a.price.replace(/[^0-9]/g, ''));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const fullDateStr = now.toLocaleString();

            // Title
            doc.setFontSize(22);
            doc.setTextColor(0, 0, 0);
            doc.text("Appointment List", 14, 22);

            doc.setFontSize(14);
            doc.setTextColor(236, 72, 153); // Pink color
            doc.text(`As of ${dateStr}`, 14, 30);

            // Metadata
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Exported on: ${fullDateStr}`, 14, 38);

            // Table
            const tableColumn = ["#", "Customer Name", "Service", "Date", "Time", "Price"];

            let grandTotal = 0;
            const tableRows = filteredAppointments.map((apt, index) => {
                // Safer way to get the numeric value: remove all non-digits
                const priceNum = parseInt(apt.price.toString().replace(/[^0-9]/g, '')) || 0;

                // Only add to grand total if status is Completed
                if (apt.status === 'Completed') {
                    grandTotal += priceNum;
                }

                return [
                    index + 1,
                    apt.customer,
                    apt.service,
                    apt.date,
                    apt.time,
                    `PHP ${priceNum.toLocaleString()}`
                ];
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'striped',
                headStyles: { fillColor: [236, 72, 153] }, // Pink-500
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    5: { halign: 'left' } // Left align to match other columns as requested
                }
            });

            // Add Total Amount properly aligned with columns
            const lastTable = (doc as any).lastAutoTable;
            const finalY = (lastTable?.finalY || 200) + 15;
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            
            // Align "Total Amount:" very close to the price value
            const columns = lastTable?.columns || [];
            const priceX = columns[5]?.x || 160;
            const labelX = priceX - 35; // Position it 35 units to the left of the price value

            doc.text("Total Amount:", labelX, finalY);
            doc.text(`PHP ${grandTotal.toLocaleString()}`, priceX, finalY);

            doc.save(`Appointments_${dateStr.replace(' ', '_')}.pdf`);
            addNotification("PDF Exported", "Your appointment report is ready.", "system");
        } catch (error) {
            console.error("PDF Export failed:", error);
            addNotification("Export Failed", "Could not generate PDF. Check console for details.", "system");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-pink-100 overflow-y-auto">
            <Header />
            <div className="px-8 pb-8 flex-1 max-w-7xl mx-auto w-full">
                <div className="mb-8 mt-2">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage your bookings and schedules</p>
                </div>

                {/* 5 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <button
                        onClick={() => setStatusFilter("All")}
                        className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all text-left ${statusFilter === "All" ? "bg-pink-100 border-pink-300" : "bg-white border-pink-100 hover:bg-pink-50"}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                            <CalendarIcon className="w-5 h-5 text-pink-400" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{totalAppointmentsCount}</h3>
                        </div>
                    </button>

                    <button
                        onClick={() => setStatusFilter("Pending")}
                        className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all text-left ${statusFilter === "Pending" ? "bg-amber-50 border-amber-300" : "bg-white border-pink-100 hover:bg-amber-50"}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{pendingCount}</h3>
                        </div>
                    </button>

                    <button
                        onClick={() => setStatusFilter("Completed")}
                        className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all text-left ${statusFilter === "Completed" ? "bg-emerald-50 border-emerald-300" : "bg-white border-pink-100 hover:bg-emerald-50"}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{completedCount}</h3>
                        </div>
                    </button>

                    <button
                        onClick={() => setStatusFilter("Cancelled")}
                        className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all text-left ${statusFilter === "Cancelled" ? "bg-red-50 border-red-300" : "bg-white border-pink-100 hover:bg-red-50"}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Cancelled</p>
                            <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{cancelledCount}</h3>
                        </div>
                    </button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Revenue</p>
                            <PhilippinePeso className="w-5 h-5 text-pink-400" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-2.5 border border-pink-100 rounded-full leading-5 bg-white shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm transition-all"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Date Filter Dropdown */}
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    setDateFilterOpen(!dateFilterOpen);
                                    setFilterOpen(false);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-pink-100 rounded-full shadow-sm hover:bg-pink-50 text-gray-700 font-medium transition-colors"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                {dateFilter === "All Time" ? "Date" : dateFilter}
                            </button>

                            {dateFilterOpen && (
                                <div className="absolute top-12 left-0 sm:left-auto sm:right-0 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-10 animate-in fade-in slide-in-from-top-2">
                                    {["All Time", "Today", "Tomorrow", "Next Week", "Next Month"].map((dFilter) => (
                                        <button
                                            key={dFilter}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${dateFilter === dFilter ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium'}`}
                                            onClick={() => {
                                                setDateFilter(dFilter);
                                                setDateFilterOpen(false);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {dFilter}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    setFilterOpen(!filterOpen);
                                    setDateFilterOpen(false);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-pink-100 rounded-full shadow-sm hover:bg-pink-50 text-gray-700 font-medium transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                {statusFilter === "All" ? "Status" : statusFilter}
                            </button>

                            {filterOpen && (
                                <div className="absolute top-12 left-0 sm:left-auto sm:right-0 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-10 animate-in fade-in slide-in-from-top-2">
                                    {["All", "Pending", "In Progress", "Completed", "Cancelled"].map((status) => (
                                        <button
                                            key={status}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${statusFilter === status ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium'}`}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setFilterOpen(false);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full shadow-sm font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            <FileText className="w-5 h-5" />
                            Export in PDF
                        </button>
                        <button
                            onClick={handleAddClick}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            New Booking
                        </button>
                    </div>
                </div>

                {/* Appointments Table Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-pink-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate min-w-max" style={{ borderSpacing: "0 10px" }}>
                            <thead>
                                <tr>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Service</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Staff</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Time</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Duration</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap w-[140px] text-center">Status</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAppointments.map((apt) => (
                                    <tr key={apt.id} className="bg-gray-50/50 hover:bg-pink-50/50 transition-all shadow-sm group">
                                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 rounded-l-xl border border-transparent group-hover:border-pink-200 border-r-0 whitespace-nowrap">
                                            {apt.customer}
                                        </td>
                                        <td className="py-3.5 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.service}</td>
                                        <td className="py-3.5 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.staff}</td>
                                        <td className="py-3.5 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.date}</td>
                                        <td className="py-3.5 px-4 text-sm font-medium text-gray-900 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.time}</td>
                                        <td className="py-3.5 px-4 text-sm font-medium text-gray-600 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.duration}</td>
                                        <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">{apt.price}</td>
                                        <td className="py-3.5 px-4 text-sm text-center border border-transparent group-hover:border-pink-200 border-x-0 whitespace-nowrap">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-tight border ${apt.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                apt.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        'bg-red-50 text-red-600 border-red-200'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-sm rounded-r-xl border border-transparent group-hover:border-pink-200 border-l-0 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEditClick(apt)} className="p-2 bg-white text-pink-500 rounded-lg shadow-sm border border-pink-100 hover:bg-pink-100 transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(apt.id)} className="p-2 bg-white text-red-500 rounded-lg shadow-sm border border-red-100 hover:bg-red-100 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500 font-medium">
                                            No appointments found. Create a new booking to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-6 mb-4 gap-2">
                        <button
                            disabled={safeCurrentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-1 text-gray-400 hover:text-pink-500 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${safeCurrentPage === page
                                        ? "font-semibold text-gray-900 bg-pink-100"
                                        : "font-medium text-gray-500 hover:bg-white border border-transparent hover:border-pink-200"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={safeCurrentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-1 text-gray-400 hover:text-pink-500 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* New Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col border border-pink-100 overflow-visible">
                        <div className="p-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-2xl font-bold text-gray-900">{editingId ? "Edit Booking" : "New Booking"}</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {editingId ? "Update the details for this appointment" : "Schedule a service for a customer"}
                            </p>
                        </div>

                        <form onSubmit={handleSaveBooking} className="flex-1 overflow-y-auto p-6 sm:px-8 sm:pb-8 sm:pt-5 space-y-5">

                            {/* Customer Autocomplete */}
                            <div className="relative" ref={customerDropdownRef}>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Customer Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-pink-100 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium"
                                        placeholder="Type or select a customer"
                                        value={formData.customerName}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[0-9]/g, '');
                                            setFormData({ ...formData, customerName: value });
                                            setShowCustomerDropdown(true);
                                        }}
                                    />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>

                                {showCustomerDropdown && filteredCustomers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-pink-100 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, customerName: c.name });
                                                    setShowCustomerDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-pink-50 text-gray-700 font-medium transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Service Dropdown */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Service</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-pink-100 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium appearance-none"
                                        value={formData.serviceName}
                                        onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                    >
                                        <option value="" disabled>Select a service</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.name}>
                                                {s.name} - {s.price.includes('₱') ? s.price : `₱${s.price}`} ({s.duration})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Date & Time Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-pink-100 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-pink-100 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Staff Dropdown */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Assigned Staff</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-pink-100 bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-medium appearance-none"
                                        value={formData.staffName}
                                        onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                                    >
                                        <option value="" disabled>Select staff member</option>
                                        {staffList.map(st => (
                                            <option key={st.id} value={st.name}>
                                                {st.name} ({st.role})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    {editingId ? "Update Booking" : "Save Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 border border-pink-100 text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Booking?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you really sure you want to delete this appointment? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full font-medium transition-colors border border-gray-200"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-full font-medium shadow-md shadow-red-200 transition-colors"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppointmentPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-pink-50 min-h-screen">
                <div className="text-pink-500 font-bold animate-pulse text-lg">Loading appointments...</div>
            </div>
        }>
            <AppointmentContent />
        </Suspense>
    );
}
