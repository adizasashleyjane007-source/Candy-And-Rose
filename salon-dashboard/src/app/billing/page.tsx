"use client";

import Header from "@/components/Header";
import {
    Receipt,
    Search,
    Filter,
    ArrowLeft,
    ArrowRight,
    Eye,
    Download,
    Wallet,
    Banknote,
    CreditCard,
    CheckCircle,
    X,
    PhilippinePeso
} from "lucide-react";
import { useState, useEffect } from "react";
import { addNotification } from "@/lib/notifications";

export default function BillingPage() {
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("Pending"); // Defaulting to pending list based on your specs
    const [searchQuery, setSearchQuery] = useState("");
    const [appointments, setAppointments] = useState<any[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Payment Modal State
    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isPrinting, setIsPrinting] = useState(false);
    const [salonInfo, setSalonInfo] = useState({
        name: "Candy And Rose",
        address: "Poblacion, Ward II, Minglanilla, Cebu",
        email: "candyandrose@gmail.com"
    });

    useEffect(() => {
        if (showReceipt && isPrinting) {
            handlePrint();
            setIsPrinting(false);
        }
    }, [showReceipt, isPrinting]);

    useEffect(() => {
        const loadData = () => {
            const savedApps = localStorage.getItem('salon_appointments');
            if (savedApps) {
                setAppointments(JSON.parse(savedApps));
            }
            const savedInfo = localStorage.getItem('salon_settings_info');
            if (savedInfo) {
                setSalonInfo(JSON.parse(savedInfo));
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

    // Filter Logic
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "Pending") matchesStatus = apt.status === "Pending" || apt.status === "In Progress";
        if (statusFilter === "Paid") matchesStatus = apt.status === "Completed";

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedAppointments = filteredAppointments.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    // Dynamic Summary Metrics
    const totalRevenue = appointments
        .filter(a => a.status === 'Completed')
        .reduce((sum, a) => {
            const num = parseInt(String(a.price).replace(/[^0-9]/g, ''));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);

    const pendingRevenue = appointments
        .filter(a => a.status === 'Pending' || a.status === 'In Progress')
        .reduce((sum, a) => {
            const num = parseInt(String(a.price).replace(/[^0-9]/g, ''));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);

    const paidTransactionsCount = appointments.filter(a => a.status === 'Completed').length;

    const handleOpenPayment = (apt: any) => {
        setSelectedApt(apt);
        const defaultRawAmount = parseInt(String(apt.price).replace(/[^0-9]/g, '')) || 0;
        setPaymentAmount(""); // Clear input initially so user enters it
        setPaymentMethod("Cash");
    };

    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
        const wantsPrint = submitter?.innerText.toLowerCase().includes('print');
        
        if (!selectedApt) return;
        
        const currentTotal = (selectedApt ? formatPrice(selectedApt.price) : 0);
        if (parseInt(paymentAmount) < currentTotal) {
            addNotification("Payment Error", "Insufficient payment amount to complete transaction.", "billing");
            return;
        }

        if (wantsPrint) setIsPrinting(true);

        const updated = appointments.map(a => {
            if (a.id === selectedApt.id) {
                return {
                    ...a,
                    status: "Completed",
                    paymentMethod: paymentMethod,
                    pricePaid: `₱${(apptFee || 0).toLocaleString()}`,
                    amountReceived: `₱${parseInt(paymentAmount).toLocaleString()}`,
                    receiptDate: new Date().toLocaleDateString(),
                    receiptTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
            return a;
        });

        localStorage.setItem('salon_appointments', JSON.stringify(updated));
        setAppointments(updated);
        window.dispatchEvent(new Event('salon_appointments_changed'));

        // Only show receipt if printing was requested, otherwise just close everything
        if (wantsPrint) {
            setShowReceipt(true);
        } else {
            setSelectedApt(null);
            setShowReceipt(false);
            setPaymentAmount("");
            addNotification("Success", "Payment confirmed successfully.", "billing");
        }
    };

    const handlePrint = () => {
        window.print();
        // Automatically close modal after print dialog returns
        setTimeout(() => {
            setSelectedApt(null);
            setShowReceipt(false);
            setPaymentAmount("");
        }, 100);
    };

    const formatPrice = (p: string) => parseInt(String(p).replace(/[^0-9]/g, '')) || 0;
    
    // Receipt Calculations
    const apptFee = selectedApt ? formatPrice(selectedApt.price) : 0;
    const tax = 0; // Tax set to 0 as requested
    const totalWithTax = apptFee + tax;
    const isAmountReceivedValid = parseInt(paymentAmount) >= totalWithTax;
    const change = Math.max(0, (parseInt(paymentAmount) || 0) - totalWithTax);

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-pink-100 overflow-y-auto w-full max-w-full">
            <Header />
            <div className="px-8 pb-8 flex-1 max-w-7xl mx-auto w-full mt-2 print:hidden">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Transactions</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage pending payments and customer receipts</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Total Revenue Collected</p>
                            <Wallet className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Pending Payments Expected</p>
                            <Banknote className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">₱{pendingRevenue.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500">Paid Transactions</p>
                            <Receipt className="w-5 h-5 text-pink-500" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{paidTransactionsCount}</h3>
                        </div>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-2.5 border border-pink-100 rounded-full bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm"
                                placeholder="Search by customer name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-pink-200 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-separate min-w-max" style={{ borderSpacing: "0 10px" }}>
                            <thead>
                                <tr>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Appt ID</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Service</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                                    <th className="pb-2 px-4 text-xs font-bold text-pink-500 uppercase tracking-wider whitespace-nowrap text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAppointments.map((trx) => {
                                    const isPending = trx.status !== 'Completed' && trx.status !== 'Cancelled';
                                    return (
                                        <tr key={trx.id} className="bg-gray-50/50 hover:bg-pink-50/50 transition-all shadow-sm group">
                                            <td className="py-3.5 px-4 text-sm font-semibold text-gray-900 rounded-l-xl whitespace-nowrap">{trx.id}</td>
                                            <td className="py-3.5 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs shrink-0">{trx.customer.charAt(0)}</div>
                                                    {trx.customer}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-sm font-medium text-gray-600 whitespace-nowrap">{trx.service}</td>
                                            <td className="py-3.5 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">{trx.pricePaid || trx.price}</td>
                                            <td className="py-3.5 px-4 text-sm text-center whitespace-nowrap">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-tight border ${isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    {isPending ? "Pending Payment" : "Paid"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-sm rounded-r-xl text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center">
                                                    {isPending ? (
                                                        <button onClick={() => handleOpenPayment(trx)} className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-600 transition-all">Pay</button>
                                                    ) : (
                                                        <button onClick={() => { setSelectedApt(trx); setShowReceipt(true); }} className="px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg border border-pink-200 shadow-sm hover:bg-pink-100 font-bold transition-all">Receipt</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Modal (NEW DESIGN) */}
            {selectedApt && !showReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col border border-pink-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Finalize Payment</h3>
                            <button onClick={() => setSelectedApt(null)} className="text-gray-400 hover:text-pink-500"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleConfirmPayment} className="p-6 space-y-6">
                            {/* 1. Payment Summary */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">1. Payment Summary</h4>
                                <div className="space-y-2 px-1">
                                    <div className="flex justify-between text-base font-medium text-gray-500">
                                        <span>Service Price:</span>
                                        <span className="text-gray-900 font-bold">₱{apptFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-medium text-gray-500">
                                        <span>Tax (0%):</span>
                                        <span className="text-gray-900 font-bold">₱0.00</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2" />
                                    <div className="flex justify-between text-base font-bold text-gray-900 items-center">
                                        <div className="flex items-center gap-2">Total Amount: <div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center text-[10px] text-pink-500">✓</div></div>
                                        <span className="text-xl">₱{totalWithTax.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Mode of Payment */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-800">2. Mode of Payment</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Cash", "GCash"].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentMethod(m)}
                                            className={`py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === m ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative mt-3">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <PhilippinePeso className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Amount Received"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border ${!isAmountReceivedValid && paymentAmount !== "" ? 'border-rose-400 focus:ring-rose-500' : 'border-gray-400 focus:ring-pink-500'} text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all font-sans`}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                    />
                                    {!isAmountReceivedValid && paymentAmount !== "" && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1.5 px-1 animate-pulse">Insufficient amount to cover the total bill.</p>
                                    )}
                                </div>
                            </div>

                            {/* 3. Payment Action */}
                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={!isAmountReceivedValid}
                                    className={`flex-[2] py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm ${isAmountReceivedValid ? 'bg-pink-400 hover:bg-pink-500 text-white shadow-pink-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'}`}
                                >
                                    Okay
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isAmountReceivedValid}
                                    className={`flex-[3] py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm border-2 ${isAmountReceivedValid ? 'bg-white border-pink-400 text-pink-500 hover:bg-pink-50' : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}
                                >
                                    Print Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receipt Modal (DIGITAL & PRINTABLE) */}
            {selectedApt && showReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300 print:relative print:bg-white print:p-0 print:block">
                    <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:w-full print:max-w-none print:rounded-none">
                        <button 
                            onClick={() => { setSelectedApt(null); setShowReceipt(false); setPaymentAmount(""); }}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-pink-500 transition-colors print:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-8 print:p-0">
                            {/* Receipt Header (Centered Format) */}
                            <div className="text-center mb-8">
                                <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight">{salonInfo.name}</h3>
                                <p className="text-[10px] text-gray-500 font-medium lowercase italic">{salonInfo.email}</p>
                                <p className="text-[10px] text-gray-400 font-medium leading-tight">{salonInfo.address}</p>
                            </div>

                            {/* Metadata Section (Left Aligned) */}
                            <div className="space-y-0.5 mb-4 text-[10px] font-medium text-gray-500 uppercase tracking-tight pb-2">
                                <div className="flex gap-2"><span>Date:</span> <span className="text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                                <div className="flex gap-2"><span>Time:</span> <span className="text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                <div className="flex gap-2"><span>Customer Name:</span> <span className="text-gray-500">{selectedApt.customer}</span></div>
                                <div className="flex gap-2"><span>Staff Name:</span> <span className="text-gray-500">{selectedApt.staff}</span></div>
                                <div className="flex gap-2"><span>Mode of Payment:</span> <span className="text-gray-500">{paymentMethod}</span></div>
                            </div>

                            <hr className="h-px border-t border-gray-200 my-6" />

                            {/* Service Section */}
                            <div className="space-y-2 mb-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service</p>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-gray-700">{selectedApt.service}</span>
                                    <span className="text-gray-900">₱{apptFee.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Billing Section (Medium Size) */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <span>Total Amount:</span>
                                    <span className="text-gray-900">₱{totalWithTax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <span>Received:</span>
                                    <span className="text-gray-900">₱{parseInt(paymentAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <hr className="h-px border-t border-gray-200 my-6" />

                            {/* Change Section (Medium Size) */}
                            <div className="flex justify-between items-center text-sm font-black text-gray-900 uppercase tracking-widest mb-12">
                                <span>Change</span>
                                <span>₱{change.toLocaleString()}</span>
                            </div>

                            <div className="text-center mt-auto">
                                <p className="text-[10px] font-bold text-gray-400 tracking-tight italic">Thank You for Choosing {salonInfo.name}!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\:relative, .print\:relative * { visibility: visible; }
                    .print\:relative {
                        position: absolute;
                        left: 50%;
                        top: 20%;
                        transform: translate(-50%, -20%);
                        width: 400px !important;
                    }
                    .print\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
