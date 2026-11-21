"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  Download,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  Key,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield
} from "lucide-react";
import ReceiptModal, { ReceiptData } from "@/components/dashboard/ReceiptModal";
import TaxCalendarTicker from "@/components/dashboard/TaxCalendarTicker";
import DocumentUploadVault from "@/components/dashboard/DocumentUploadVault";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState<"overview" | "my_filings" | "credentials" | "documents" | "receipts">(
    (["overview", "my_filings", "credentials", "documents", "receipts"].includes(currentTabParam)
      ? currentTabParam
      : "overview") as any
  );

  useEffect(() => {
    if (
      currentTabParam &&
      ["overview", "my_filings", "credentials", "documents", "receipts"].includes(currentTabParam)
    ) {
      setActiveTab(currentTabParam as any);
    }
  }, [currentTabParam]);

  const switchTab = (tab: "overview" | "my_filings" | "credentials" | "documents" | "receipts") => {
    setActiveTab(tab);
    router.push(`/dashboard/customer?tab=${tab}`);
  };

  // State
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [filings, setFilings] = useState<any[]>([]);
  const [esevaiList, setEsevaiList] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Credential Visibility
  const [showItPass, setShowItPass] = useState(false);
  const [itUserId, setItUserId] = useState("");
  const [itPassword, setItPassword] = useState("");
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Filter
  const [filingFilter, setFilingFilter] = useState("all");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadCustomerData = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);

    try {
      const [pRes, fRes, eRes] = await Promise.allSettled([
        secureApiCall("/api/v1/auth/profile"),
        secureApiCall("/api/v1/filings/recent"),
        secureApiCall("/api/v1/services/esevai/list")
      ]);

      if (pRes.status === "fulfilled" && pRes.value.ok && pRes.value.data?.user) {
        const u = pRes.value.data.user;
        setProfile(u);
        setItUserId(u.income_tax_login_id || "");
        setItPassword(u.income_tax_password || "");
      }

      if (fRes.status === "fulfilled" && fRes.value.ok && fRes.value.data?.filings) {
        setFilings(fRes.value.data.filings);
      }

      if (eRes.status === "fulfilled" && eRes.value.ok && eRes.value.data?.applications) {
        setEsevaiList(eRes.value.data.applications);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    try {
      const res = await secureApiCall("/api/v1/auth/profile/update", {
        method: "POST",
        body: JSON.stringify({
          income_tax_login_id: itUserId,
          income_tax_password: itPassword
        })
      });

      if (res.ok) {
        showToast("Income Tax portal credentials updated securely.");
        loadCustomerData();
      } else {
        showToast(res.data?.message || "Failed to update credentials", "error");
      }
    } catch {
      showToast("Network error updating credentials", "error");
    } finally {
      setIsSavingCreds(false);
    }
  };

  const filteredFilings = filings.filter((f) => {
    if (filingFilter === "all") return true;
    if (filingFilter === "gst") return f.service?.toLowerCase().includes("gst");
    if (filingFilter === "itr") return f.service?.toLowerCase().includes("itr") || f.service?.toLowerCase().includes("income");
    return true;
  });

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
              Track your GST, Income Tax (ITR), and E-Sevai applications, securely manage tax portal credentials, and download government verified filings.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadCustomerData}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
          { id: "my_filings", label: `My Filings (${filings.length})`, icon: FileCheck },
          { id: "credentials", label: "My Credentials Vault", icon: ShieldAlert },
          { id: "documents", label: "Document Vault", icon: ShieldCheck },
          { id: "receipts", label: "Receipts & Slips", icon: Receipt }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD OVERVIEW                                                 */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {filings.filter((f) => f.status === "SUBMITTED" || f.status === "WAITING_VERIFICATION").length}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">Under Admin verification</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">E-Sevai Certificates</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600">{esevaiList.length}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Income, Nativity, Community</div>
            </div>
          </div>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Income Tax Portal Credentials</h3>
                    <p className="text-xs text-slate-500">Vaulted access for automated return filing</p>
                  </div>
                </div>
                <button
                  onClick={() => switchTab("credentials")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">IT Login ID (PAN)</span>
                  <span className="font-mono font-bold text-slate-800">{itUserId || "Not Vaulted Yet"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Portal Password</span>
                  <span className="font-mono text-slate-800">{itPassword ? "••••••••••••" : "Not Set"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Tax & Identity Document Locker</h3>
                    <p className="text-xs text-slate-500">Verified Aadhaar, PAN & Address proofs</p>
                  </div>
                </div>
                <button
                  onClick={() => switchTab("documents")}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <span>View Vault</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Cloudflare R2 Encrypted Document Vault is active</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Recent Filings Table */}
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
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5">Filing Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Receipt</th>
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
                          <button
                            onClick={() =>
                              setSelectedReceipt({
                                id: f.id,
                                client: profile?.full_name || "Customer",
                                service: f.service,
                                amount: parseFloat(f.amount || 0),
                                comm: 0,
                                status: f.status,
                                date: f.date || "Today",
                                customerMobile: profile?.mobile || "",
                                customerPanOrGst: f.pan || ""
                              })
                            }
                            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>
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
      {/* TAB 2: MY FILINGS (Full Filterable Table)                                 */}
      {/* ========================================================================= */}
      {activeTab === "my_filings" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Applications & Compliance Returns</h2>
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
                  <th className="p-3.5">Fee (₹)</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredFilings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      No filings found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredFilings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{f.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{f.service}</td>
                      <td className="p-3.5 text-slate-500">{f.date || "Recent"}</td>
                      <td className="p-3.5 font-black text-slate-900">₹{parseFloat(f.amount || 0).toFixed(2)}</td>
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
                        <button
                          onClick={() =>
                            setSelectedReceipt({
                              id: f.id,
                              client: profile?.full_name || "Customer",
                              service: f.service,
                              amount: parseFloat(f.amount || 0),
                              comm: 0,
                              status: f.status,
                              date: f.date || "Today",
                              customerMobile: profile?.mobile || "",
                              customerPanOrGst: f.pan || ""
                            })
                          }
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CREDENTIALS VAULT (Income Tax Portal Login Details)                */}
      {/* ========================================================================= */}
      {activeTab === "credentials" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-4">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Secure Credential Locker
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Government Portal Credentials</h2>
            <p className="text-xs text-slate-500">
              Save your official Income Tax Department portal login ID & password. This allows your authorized TaxPartner retailer to seamlessly verify AIS, Form 16, and file your ITR without needing to ask for credentials each time.
            </p>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Income Tax Department Login ID (PAN / Aadhaar) *
              </label>
              <input
                type="text"
                required
                value={itUserId}
                onChange={(e) => setItUserId(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Income Tax Portal Password *
              </label>
              <div className="relative">
                <input
                  type={showItPass ? "text" : "password"}
                  required
                  value={itPassword}
                  onChange={(e) => setItPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowItPass(!showItPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showItPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Credentials are AES encrypted and stored securely.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingCreds}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 cursor-pointer"
              >
                {isSavingCreds ? "Encrypting & Saving..." : "Update Income Tax Credentials"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOCUMENT VAULT                                                     */}
      {/* ========================================================================= */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-black text-slate-900">Customer Identity & Proofs Vault</h2>
            <p className="text-xs text-slate-500">Secure digital locker for your Aadhaar, PAN, Bank Passbook, and Address proofs.</p>
          </div>
          <DocumentUploadVault />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RECEIPTS & SLIPS                                                   */}
      {/* ========================================================================= */}
      {activeTab === "receipts" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">TaxPartner Invoices & Payment Slips</h2>
            <p className="text-xs text-slate-500">Download official stamped acknowledgment slips for all completed filings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filings.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">{f.id.slice(0, 8)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {f.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{f.service}</h4>
                  <p className="text-[11px] text-slate-500">{f.date || "Today"}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">₹{parseFloat(f.amount || 0).toFixed(2)}</span>
                  <button
                    onClick={() =>
                      setSelectedReceipt({
                        id: f.id,
                        client: profile?.full_name || "Customer",
                        service: f.service,
                        amount: parseFloat(f.amount || 0),
                        comm: 0,
                        status: f.status,
                        date: f.date || "Today",
                        customerMobile: profile?.mobile || "",
                        customerPanOrGst: f.pan || ""
                      })
                    }
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    View Slip
                  </button>
                </div>
              </div>
            ))}
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
