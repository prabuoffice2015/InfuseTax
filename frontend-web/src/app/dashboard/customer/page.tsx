"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Receipt,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  FileSpreadsheet,
  RefreshCw,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Upload,
  ShieldCheck,
  Shield,
  FileUp,
  X
} from "lucide-react";
import ReceiptModal, { ReceiptData } from "@/components/dashboard/ReceiptModal";
import TaxCalendarTicker from "@/components/dashboard/TaxCalendarTicker";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";

// Generate last 12 calendar/fiscal months for the dropdown
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    options.push({ key, label });
  }
  return options;
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState<"overview" | "my_filings" | "receipts">(
    (["overview", "my_filings", "receipts"].includes(currentTabParam)
      ? currentTabParam
      : "overview") as any
  );

  useEffect(() => {
    if (
      currentTabParam &&
      ["overview", "my_filings", "receipts"].includes(currentTabParam)
    ) {
      setActiveTab(currentTabParam as any);
    }
  }, [currentTabParam]);

  const switchTab = (tab: "overview" | "my_filings" | "receipts") => {
    setActiveTab(tab);
    router.push(`/dashboard/customer?tab=${tab}`);
  };

  // State
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [filings, setFilings] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Month-Wise Daily Invoices State
  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.key || new Date().toISOString().slice(0, 7));
  const [monthlyInvoices, setMonthlyInvoices] = useState<any[]>([]);
  const [monthlyFiling, setMonthlyFiling] = useState<any | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Invoice Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_date: new Date().toISOString().slice(0, 10),
    invoice_title: "",
    invoice_number: "",
    notes: "",
    file_name: "",
    file_url: ""
  });
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);

  // Filter for filings
  const [filingFilter, setFilingFilter] = useState("all");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Load Customer profile & general filings
  const loadCustomerData = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);

    try {
      const [pRes, fRes] = await Promise.allSettled([
        secureApiCall("/api/v1/auth/profile"),
        secureApiCall("/api/v1/filings/recent")
      ]);

      if (pRes.status === "fulfilled" && pRes.value.ok && pRes.value.data?.user) {
        setProfile(pRes.value.data.user);
      }

      if (fRes.status === "fulfilled" && fRes.value.ok && fRes.value.data?.filings) {
        setFilings(fRes.value.data.filings);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load Invoices for selected month
  const loadInvoicesForMonth = async (month: string) => {
    setLoadingInvoices(true);
    try {
      const res = await secureApiCall(`/api/v1/customer/invoices?month=${month}`);
      if (res.ok && res.data?.status === "success") {
        setMonthlyInvoices(res.data.invoices || []);
        setMonthlyFiling(res.data.filing || null);
      } else {
        setMonthlyInvoices([]);
        setMonthlyFiling(null);
      }
    } catch {
      setMonthlyInvoices([]);
      setMonthlyFiling(null);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadInvoicesForMonth(selectedMonth);
    }
  }, [selectedMonth]);

  // Handle uploading daily invoice
  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.file_url) {
      showToast("Please select or scan an invoice file (PDF/Image)", "error");
      return;
    }
    setIsUploadingInvoice(true);
    try {
      const res = await secureApiCall("/api/v1/customer/invoices/upload", {
        method: "POST",
        body: {
          month: selectedMonth,
          invoice_date: invoiceForm.invoice_date,
          invoice_title: invoiceForm.invoice_title || "Daily Invoice",
          invoice_number: invoiceForm.invoice_number,
          file_url: invoiceForm.file_url,
          file_name: invoiceForm.file_name,
          notes: invoiceForm.notes
        }
      });

      if (res.ok && res.data?.status === "success") {
        showToast("✓ Daily invoice uploaded successfully!");
        setShowUploadModal(false);
        setInvoiceForm({
          invoice_date: new Date().toISOString().slice(0, 10),
          invoice_title: "",
          invoice_number: "",
          notes: "",
          file_name: "",
          file_url: ""
        });
        loadInvoicesForMonth(selectedMonth);
      } else {
        showToast(res.data?.message || "Failed to upload invoice", "error");
      }
    } catch {
      showToast("Network error uploading invoice", "error");
    } finally {
      setIsUploadingInvoice(false);
    }
  };

  // Handle deleting an unfiled invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to remove this uploaded invoice?")) return;
    try {
      const res = await secureApiCall("/api/v1/customer/invoices/delete", {
        method: "POST",
        body: { invoice_id: invoiceId }
      });
      if (res.ok && res.data?.status === "success") {
        showToast("Invoice removed.");
        loadInvoicesForMonth(selectedMonth);
      } else {
        showToast(res.data?.message || "Failed to delete invoice", "error");
      }
    } catch {
      showToast("Network error deleting invoice", "error");
    }
  };

  const filteredFilings = filings.filter((f) => {
    if (filingFilter === "all") return true;
    if (filingFilter === "gst") return f.service?.toLowerCase().includes("gst");
    if (filingFilter === "itr") return f.service?.toLowerCase().includes("itr") || f.service?.toLowerCase().includes("income");
    return true;
  });

  const selectedMonthLabel = monthOptions.find(m => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Statutory Tax Calendar Ticker */}
      <TaxCalendarTicker />

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-3 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider rounded-full">
                Customer Client Portal
              </span>
              <span className="text-xs text-blue-200 font-mono">TaxPartner Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Welcome, {profile?.full_name || getAuthUser()?.name || "Customer"}
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-xl">
              Track your GST and Income Tax (ITR) filings, upload daily invoices month-wise, and download department-approved acknowledgement slips.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadCustomerData();
                loadInvoicesForMonth(selectedMonth);
              }}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD OVERVIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status KPI Cards - ZERO AMOUNTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Filings</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{filings.length}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Submitted on your behalf</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Filings</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {filings.filter((f) => f.status === "APPROVED" || f.status === "FILED_VERIFIED").length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified with Department</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">In Verification</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {filings.filter((f) => f.status === "SUBMITTED" || f.status === "WAITING_VERIFICATION" || f.status === "PENDING_APPROVAL").length}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">Under Department / Admin review</div>
            </div>
          </div>

          {/* Quick Action: Month-Wise Daily Invoices Teaser */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">GST Filing: Daily Invoices by Month</h3>
                  <p className="text-xs text-slate-500">Upload your sales and purchase bills daily. Your Retailer compiles them for monthly GST return submission (GSTR-1 &amp; GSTR-3B).</p>
                </div>
              </div>

              <button
                onClick={() => switchTab("my_filings")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>Manage Monthly Invoices</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Filings Table - ZERO AMOUNTS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Recent Applications & Filings</h3>
                <p className="text-xs text-slate-500">Track status changes from submission to department certification</p>
              </div>
              <button
                onClick={() => switchTab("my_filings")}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                View All Filings →
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
                  <tr>
                    <th className="p-3.5">Ref / Ack</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Filing Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Department Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        No filings recorded yet. Your retailer will submit on your behalf.
                      </td>
                    </tr>
                  ) : (
                    filings.slice(0, 5).map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-700">{f.id.slice(0, 8)}...</td>
                        <td className="p-3.5 font-bold text-slate-900">{f.service}</td>
                        <td className="p-3.5 text-slate-500">{f.date || "Recent"}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              f.status === "APPROVED" || f.status === "FILED_VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : f.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {f.verified_doc_url ? (
                            <a
                              href={f.verified_doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Approved Receipt</span>
                            </a>
                          ) : (
                            <button
                              onClick={() =>
                                setSelectedReceipt({
                                  id: f.id,
                                  client: profile?.full_name || "Customer",
                                  service: f.service,
                                  amount: 0,
                                  comm: 0,
                                  hideAmounts: true,
                                  status: f.status,
                                  date: f.date || "Today",
                                  customerMobile: profile?.mobile || "",
                                  customerPanOrGst: f.pan || ""
                                })
                              }
                              className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY FILINGS & MONTH-WISE DAILY INVOICES                             */}
      {/* ========================================================================= */}
      {activeTab === "my_filings" && (
        <div className="space-y-6">
          {/* SECTION 1: MONTH-WISE DAILY INVOICE DESK */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  GST Return Invoices
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  GST Daily Invoices Desk (Month-Wise)
                </h2>
                <p className="text-xs text-slate-500">
                  Select month to view or upload daily business sales/purchase bills. Your assigned Retailer compiles and submits your monthly GST return at month-end.
                </p>
              </div>

              {/* Month Selector Dropdown & Upload Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                  <span className="text-xs font-bold text-slate-700">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-xs font-black text-indigo-900 focus:outline-none cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Upload Daily Invoice</span>
                </button>
              </div>
            </div>

            {/* Monthly Return Filing Status Alert */}
            {monthlyFiling ? (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                monthlyFiling.status === "APPROVED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}>
                <div className="flex items-center space-x-3">
                  {monthlyFiling.status === "APPROVED" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-6 h-6 text-blue-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-extrabold block text-sm">
                      {monthlyFiling.status === "APPROVED" 
                        ? `✓ Monthly GST Return for ${selectedMonthLabel} Approved!` 
                        : `⏳ Monthly GST Return for ${selectedMonthLabel} Submitted (Under Review)`}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Ack Ref: {monthlyFiling.ack_number} • Status: {monthlyFiling.status}
                    </span>
                  </div>
                </div>

                {monthlyFiling.verified_doc_url && (
                  <a
                    href={monthlyFiling.verified_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Receipt</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  📝 <strong>{selectedMonthLabel}</strong> daily invoices in progress. You can upload invoices daily. Retailer will submit the compiled return at month end.
                </span>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {monthlyInvoices.length} Invoices Uploaded
                </span>
              </div>
            )}

            {/* Uploaded Invoices Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice Date</th>
                    <th className="p-3.5">Bill Title / Description</th>
                    <th className="p-3.5">Invoice / Ref No.</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Document</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                        Loading {selectedMonthLabel} invoices...
                      </td>
                    </tr>
                  ) : monthlyInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        No invoices uploaded yet for {selectedMonthLabel}. Click &quot;+ Upload Daily Invoice&quot; to attach your bills.
                      </td>
                    </tr>
                  ) : (
                    monthlyInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono text-slate-700">{inv.invoice_date}</td>
                        <td className="p-3.5 font-bold text-slate-900">{inv.invoice_title}</td>
                        <td className="p-3.5 font-mono text-purple-700 font-bold">{inv.invoice_number || "—"}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inv.status === "FILED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {inv.status === "FILED" ? "Filed in Return" : "Uploaded"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {inv.file_url ? (
                            <a
                              href={inv.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View File</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No file</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {inv.status !== "FILED" && (
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: ALL COMPLIANCE FILINGS (GST & ITR) - STRICT ZERO AMOUNT */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">All Applications &amp; Compliance Filings</h2>
                <p className="text-xs text-slate-500">Track all GST registrations, GST return submissions, and Income Tax returns filed for you.</p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                {["all", "gst", "itr"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilingFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      filingFilter === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
                  <tr>
                    <th className="p-3.5">Ref / Ack</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Filing Date</th>
                    <th className="p-3.5">Verification Status</th>
                    <th className="p-3.5 text-center">Receipt / Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredFilings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        No filings found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredFilings.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-700">{f.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{f.service}</td>
                        <td className="p-3.5 text-slate-500">{f.date || "Recent"}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              f.status === "APPROVED" || f.status === "FILED_VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : f.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {f.verified_doc_url ? (
                            <a
                              href={f.verified_doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Approved Receipt</span>
                            </a>
                          ) : (
                            <button
                              onClick={() =>
                                setSelectedReceipt({
                                  id: f.id,
                                  client: profile?.full_name || "Customer",
                                  service: f.service,
                                  amount: 0,
                                  comm: 0,
                                  hideAmounts: true,
                                  status: f.status,
                                  date: f.date || "Today",
                                  customerMobile: profile?.mobile || "",
                                  customerPanOrGst: f.pan || ""
                                })
                              }
                              className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RECEIPTS & DEPARTMENT ACKNOWLEDGEMENTS                             */}
      {/* ========================================================================= */}
      {activeTab === "receipts" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">Department Receipts &amp; Verified Slips</h2>
            <p className="text-xs text-slate-500">
              Download official government-certified slips and department receipts for all completed filings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filings.filter(f => f.status === "APPROVED" || f.status === "FILED_VERIFIED" || f.verified_doc_url).map((f) => (
              <div key={f.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{f.id.slice(0, 10)}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Department Verified
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{f.service}</h4>
                    <p className="text-xs text-slate-500">{f.date || "Completed"}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  {f.verified_doc_url ? (
                    <a
                      href={f.verified_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Department Receipt</span>
                    </a>
                  ) : (
                    <button
                      onClick={() =>
                        setSelectedReceipt({
                          id: f.id,
                          client: profile?.full_name || "Customer",
                          service: f.service,
                          amount: 0,
                          comm: 0,
                          hideAmounts: true,
                          status: f.status,
                          date: f.date || "Today",
                          customerMobile: profile?.mobile || "",
                          customerPanOrGst: f.pan || ""
                        })
                      }
                      className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Filing Slip</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filings.filter(f => f.status === "APPROVED" || f.status === "FILED_VERIFIED" || f.verified_doc_url).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs font-bold">
                No verified receipts issued yet. When your filings are approved by the department, your official receipts will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DAILY INVOICE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Upload Daily Invoice / Bill</h3>
                <p className="text-xs text-slate-500">Attach for month: <strong>{selectedMonthLabel}</strong></p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUploadInvoice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Bill Date *</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.invoice_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bill Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Sales Cash Memo / Material Bill"
                  value={invoiceForm.invoice_title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_title: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2024-082"
                  value={invoiceForm.invoice_number}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Bill / Invoice (PDF / Image) *</label>
                <div className="p-3 bg-purple-50/50 border border-dashed border-purple-300 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <FileUp className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="text-xs text-slate-700 truncate font-semibold">
                      {invoiceForm.file_name || "Select scan or PDF"}
                    </span>
                  </div>
                  <label className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors">
                    <span>Browse</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setInvoiceForm({
                            ...invoiceForm,
                            file_name: file.name,
                            file_url: reader.result as string
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes for your accountant / retailer..."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingInvoice}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isUploadingInvoice ? "Uploading..." : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
