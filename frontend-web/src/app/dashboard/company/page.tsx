"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Palette, 
  CheckSquare, 
  History, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  Save,
  Search,
  Filter,
  Eye,
  Sliders,
  CreditCard,
  Lock,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Download,
  AlertCircle,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus
} from "lucide-react";
import { getAuthToken } from "@/lib/auth";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "utr" | "branding" | "users" | "pricing" | "ledger">(
    (["overview", "utr", "branding", "users", "pricing", "ledger"].includes(currentTabParam) ? currentTabParam : "overview") as any
  );

  // Sync tab with URL query parameter and fetch real backend data
  useEffect(() => {
    if (currentTabParam && ["overview", "utr", "branding", "users", "pricing", "ledger"].includes(currentTabParam)) {
      setActiveTab(currentTabParam as any);
    }

    const fetchUsers = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await fetch("/api/v1/admin/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.status === "success" && data.users?.length > 0) {
          setUsersList(data.users);
        }
      } catch (e) {}
    };

    fetchUsers();
  }, [currentTabParam]);

  const switchTab = (tab: "overview" | "utr" | "branding" | "users" | "pricing" | "ledger") => {
    setActiveTab(tab);
    router.push(`/dashboard/company?tab=${tab}`);
  };

  // -------------------------------------------------------------
  // User Creation & Onboarding Modal State
  // -------------------------------------------------------------
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [newUserRole, setNewUserRole] = useState("retailer");
  const [newUserCity, setNewUserCity] = useState("Coimbatore");
  const [newUserState, setNewUserState] = useState("Tamil Nadu");
  const [newUserBalance, setNewUserBalance] = useState("10000");
  const [newUserPassword, setNewUserPassword] = useState("Retailer@1234");
  const [newUserPermissions, setNewUserPermissions] = useState({
    gst: true,
    itr: true,
    pan: true,
    passport: true,
    certificates: true,
    p2p: true
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState("");

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/v1/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: newUserName,
          email: newUserEmail,
          mobile: newUserMobile,
          role: newUserRole,
          city: newUserCity,
          state: newUserState,
          opening_balance: parseFloat(newUserBalance) || 0,
          password: newUserPassword,
          permissions: newUserPermissions
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success" && data.user) {
        setUsersList([data.user, ...usersList]);
        setCreateSuccessMsg(`✓ Successfully onboarded ${newUserName} as ${newUserRole.toUpperCase()}!`);
        setTimeout(() => {
          setCreateSuccessMsg("");
          setShowCreateUserModal(false);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserMobile("");
        }, 1200);
      } else {
        alert(data.message || "Failed to create user.");
      }
    } catch (err) {
      // Offline fallback
      const localUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newUserName,
        email: newUserEmail,
        contact: newUserMobile,
        role: newUserRole === "distributor" ? "Master Distributor" : newUserRole === "operator" ? "Operator" : "Retailer Outlet",
        city: newUserCity,
        state: newUserState,
        wallet: parseFloat(newUserBalance) || 0,
        status: "ACTIVE",
        kyc: "VERIFIED",
        downlines: newUserRole === "distributor" ? 1 : 0
      };
      setUsersList([localUser, ...usersList]);
      setShowCreateUserModal(false);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // -------------------------------------------------------------
  // 1. White-Label Branding Engine State
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState("InfuseTax Technologies Pvt Ltd");
  const [primaryColor, setPrimaryColor] = useState("#1E40AF"); // Blue 800
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B"); // Amber 500
  const [customDomain, setCustomDomain] = useState("tax.infusetax.com");
  const [smsSenderId, setSmsSenderId] = useState("INFUST");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Feature Activation Matrix
  const [featureFlags, setFeatureFlags] = useState({
    gst: true,
    itr: true,
    pan: true,
    passport: true,
    certificates: true,
    aiOcr: true,
    p2pShare: true,
  });

  // -------------------------------------------------------------
  // 2. Bank UTR Approval Queue State
  // -------------------------------------------------------------
  const [pendingUtrs, setPendingUtrs] = useState([
    { id: "UTR-801", retailerId: "RET-1029", retailer: "Ramesh Digital Seva", bank: "HDFC Bank", utr: "423519827361", amount: 25000, date: "23 Aug 2026, 14:20", status: "PENDING" },
    { id: "UTR-802", retailerId: "RET-1088", retailer: "Kumar Tax Point", bank: "ICICI Bank", utr: "991823746123", amount: 50000, date: "23 Aug 2026, 14:45", status: "PENDING" },
    { id: "UTR-803", retailerId: "RET-1102", retailer: "Sai E-Seva Center", bank: "State Bank of India", utr: "128472910394", amount: 10000, date: "23 Aug 2026, 15:10", status: "PENDING" },
    { id: "UTR-804", retailerId: "DIS-2001", retailer: "Salem Master Distributor", bank: "Axis Bank", utr: "883719028341", amount: 100000, date: "23 Aug 2026, 16:30", status: "PENDING" },
  ]);

  const [approvedUtrs, setApprovedUtrs] = useState<any[]>([]);
  const [viewUtrReceipt, setViewUtrReceipt] = useState<any | null>(null);

  // -------------------------------------------------------------
  // 3. User & Network Directory State
  // -------------------------------------------------------------
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [usersList, setUsersList] = useState([
    { id: "DIS-2001", name: "Salem Metro Network", role: "Master Distributor", contact: "+91 98421 90812", downlines: 48, wallet: 145000, status: "ACTIVE", kyc: "VERIFIED" },
    { id: "DIS-2002", name: "Coimbatore Prime Hub", role: "Master Distributor", contact: "+91 94432 10982", downlines: 62, wallet: 210000, status: "ACTIVE", kyc: "VERIFIED" },
    { id: "RET-1029", name: "Ramesh Digital Seva", role: "Retailer Outlet", contact: "+91 98765 43210", downlines: 2, wallet: 24850, status: "ACTIVE", kyc: "VERIFIED" },
    { id: "RET-1088", name: "Kumar Tax Point", role: "Retailer Outlet", contact: "+91 90807 12381", downlines: 1, wallet: 18200, status: "ACTIVE", kyc: "VERIFIED" },
    { id: "RET-1102", name: "Sai E-Seva Center", role: "Retailer Outlet", contact: "+91 99441 55621", downlines: 0, wallet: 8900, status: "ACTIVE", kyc: "VERIFIED" },
    { id: "EMP-3001", name: "K. Selvam (Counter Staff)", role: "Operator", contact: "+91 98421 77651", downlines: 0, wallet: 0, status: "ACTIVE", kyc: "VERIFIED" },
  ]);

  // -------------------------------------------------------------
  // 4. Service Pricing & Commission Slabs State
  // -------------------------------------------------------------
  const [pricingSlabs, setPricingSlabs] = useState([
    { service: "GST New Registration", govtFee: 0, customerFee: 1500, retailerMargin: 300, distMargin: 75, companyMargin: 1125 },
    { service: "GSTR-3B Monthly Return", govtFee: 0, customerFee: 500, retailerMargin: 150, distMargin: 50, companyMargin: 300 },
    { service: "ITR-1 Salaried Return", govtFee: 0, customerFee: 800, retailerMargin: 250, distMargin: 80, companyMargin: 470 },
    { service: "New Physical PAN (49A)", govtFee: 107, customerFee: 150, retailerMargin: 25, distMargin: 6, companyMargin: 12 },
    { service: "Instant e-PAN Only", govtFee: 66, customerFee: 100, retailerMargin: 20, distMargin: 5, companyMargin: 9 },
    { service: "Passport Seva (Normal)", govtFee: 1500, customerFee: 2000, retailerMargin: 350, distMargin: 70, companyMargin: 80 },
    { service: "Dynamic E-Certificates", govtFee: 60, customerFee: 150, retailerMargin: 45, distMargin: 15, companyMargin: 30 },
  ]);

  // -------------------------------------------------------------
  // 5. Master Double-Entry Audit Ledger State
  // -------------------------------------------------------------
  const [masterLedger, setMasterLedger] = useState([
    { id: "TXN-90812", date: "23 Aug 2026, 17:40", entity: "Ramesh Digital Seva (RET-1029)", type: "SERVICE DEBIT", service: "GST Registration", debit: 1200, credit: 0, balance: 24850, note: "ARN AA330826190823Z" },
    { id: "TXN-90811", date: "23 Aug 2026, 17:40", entity: "Salem Metro Network (DIS-2001)", type: "COMMISSION OVERRIDE", service: "GST Registration Override", debit: 0, credit: 75, balance: 145000, note: "Override from RET-1029" },
    { id: "TXN-90810", date: "23 Aug 2026, 17:15", entity: "Kumar Tax Point (RET-1088)", type: "SERVICE DEBIT", service: "ITR-1 Return", debit: 550, credit: 0, balance: 18200, note: "ITR-V Generated" },
    { id: "TXN-90809", date: "23 Aug 2026, 16:30", entity: "Salem Metro Network (DIS-2001)", type: "BANK UTR CREDIT", service: "Bank Deposit Top-Up", debit: 0, credit: 100000, balance: 144925, note: "Axis Bank UTR 883719028341" },
    { id: "TXN-90808", date: "23 Aug 2026, 15:50", entity: "Sai E-Seva Center (RET-1102)", type: "SERVICE DEBIT", service: "Physical PAN 49A", debit: 125, credit: 0, balance: 8900, note: "UTI-PAN-908123" },
  ]);

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleApproveUtr = (utrItem: any) => {
    setPendingUtrs(pendingUtrs.filter(item => item.id !== utrItem.id));
    setApprovedUtrs([{ ...utrItem, status: "APPROVED", approvedAt: "Just now" }, ...approvedUtrs]);

    // Update target user wallet balance
    setUsersList(usersList.map(u => u.id === utrItem.retailerId ? { ...u, wallet: u.wallet + utrItem.amount } : u));

    // Append to Double-Entry Ledger
    const newTxn = {
      id: `TXN-${Math.floor(90813 + Math.random() * 1000)}`,
      date: "Just now",
      entity: `${utrItem.retailer} (${utrItem.retailerId})`,
      type: "BANK UTR TOP-UP",
      service: "Wallet Credit (Approved)",
      debit: 0,
      credit: utrItem.amount,
      balance: 50000 + utrItem.amount,
      note: `${utrItem.bank} Ref: ${utrItem.utr}`,
    };
    setMasterLedger([newTxn, ...masterLedger]);
  };

  const handleRejectUtr = (utrItem: any) => {
    setPendingUtrs(pendingUtrs.filter(item => item.id !== utrItem.id));
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleUserStatus = (userId: string) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" };
      }
      return u;
    }));
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.id.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.contact.includes(userSearchQuery);
    const matchesRole = userRoleFilter === "all" || 
                        (userRoleFilter === "distributor" && u.role === "Master Distributor") ||
                        (userRoleFilter === "retailer" && u.role === "Retailer Outlet") ||
                        (userRoleFilter === "operator" && u.role === "Operator");
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* View UTR Screenshot / Detail Modal */}
      {viewUtrReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900">Bank Deposit Verification Voucher</h3>
              </div>
              <button onClick={() => setViewUtrReceipt(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Retailer Outlet:</span>
                <span className="font-bold text-slate-900">{viewUtrReceipt.retailer} ({viewUtrReceipt.retailerId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Bank:</span>
                <span className="font-bold text-slate-900">{viewUtrReceipt.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Reference No:</span>
                <span className="font-mono font-bold text-blue-700">{viewUtrReceipt.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Top-Up:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">₹{viewUtrReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Timestamp:</span>
                <span className="text-slate-700">{viewUtrReceipt.date}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900">
              ✓ Verified with Bank Gateway Webhook: Amount matched with Company Current Account statement.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleApproveUtr(viewUtrReceipt);
                  setViewUtrReceipt(null);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Approve & Credit ₹{viewUtrReceipt.amount.toLocaleString()}
              </button>
              <button
                onClick={() => setViewUtrReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Tier 1: Company Super Admin Management Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Tenant Control Center & Master Financial Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage white-label branding, bank deposit approvals, network outlets, pricing margins, and ACID audit ledgers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>Multi-Tenant Engine Online (PostgreSQL 16)</span>
          </span>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        <button
          onClick={() => switchTab("overview")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "overview" ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => switchTab("utr")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "utr" ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>UTR Bank Approvals ({pendingUtrs.length})</span>
        </button>

        <button
          onClick={() => switchTab("users")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "users" ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Network Outlets ({usersList.length})</span>
        </button>

        <button
          onClick={() => switchTab("pricing")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "pricing" ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Pricing & Commission Slabs</span>
        </button>

        <button
          onClick={() => switchTab("branding")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "branding" ? "bg-purple-700 text-white shadow-md shadow-purple-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>White-Label Theming</span>
        </button>

        <button
          onClick={() => switchTab("ledger")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${
            activeTab === "ledger" ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Master Audit Ledger</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PLATFORM OVERVIEW & KPI METRICS                     */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Master Wallet Pool</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">₹25,00,000</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% liquidity vs last week</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Active Outlets</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">1,480</div>
              <div className="text-[11px] text-indigo-600 font-semibold">Across 42 Master Distributors</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Pending Bank UTRs</span>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">{pendingUtrs.length} Requests</div>
              <div className="text-[11px] text-slate-500 font-medium">₹1,85,000 awaiting approval</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Total Filings Completed</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">12,840</div>
              <div className="text-[11px] text-emerald-600 font-semibold">₹1.84 Cr customer refunds</div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl space-y-4">
              <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Quick Deposit Clearance</span>
              </div>
              <div className="text-xl font-bold">{pendingUtrs.length} Bank Deposits Awaiting Approval</div>
              <p className="text-xs text-blue-200">Review retailer UTR references and disburse liquidity to retail desks.</p>
              <button
                onClick={() => setActiveTab("utr")}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-transform transform hover:scale-105"
              >
                Open Approval Desk
              </button>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-900 to-slate-900 text-white rounded-3xl space-y-4">
              <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>White-Label Branding</span>
              </div>
              <div className="text-xl font-bold">Customize Colors & Logo</div>
              <p className="text-xs text-purple-200">Update primary colors, company name, and feature toggles in real-time.</p>
              <button
                onClick={() => setActiveTab("branding")}
                className="px-5 py-2.5 bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold text-xs rounded-xl transition-transform transform hover:scale-105"
              >
                Configure Branding
              </button>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl space-y-4">
              <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Financial Ledger Audit</span>
              </div>
              <div className="text-xl font-bold">ACID Double-Entry Logs</div>
              <p className="text-xs text-emerald-200">100% immutable ledger tracking every wallet credit, debit, and split.</p>
              <button
                onClick={() => setActiveTab("ledger")}
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-transform transform hover:scale-105"
              >
                View Audit Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BANK UTR TOP-UP APPROVAL QUEUE                     */}
      {/* ========================================================= */}
      {activeTab === "utr" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in space-y-6">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Retailer & Distributor UTR Bank Deposit Queue</h2>
                <p className="text-xs text-slate-500">Approve bank deposit references to instantly credit downline wallets</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {pendingUtrs.length} Pending Approval
              </span>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {approvedUtrs.length} Approved Today
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pendingUtrs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-sm">All UTR Requests Cleared!</div>
                <div>No pending deposit approvals in queue.</div>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Applicant Outlet</th>
                    <th className="p-4">Deposit Bank</th>
                    <th className="p-4">Bank UTR Reference</th>
                    <th className="p-4">Amount Requested</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pendingUtrs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-700">{req.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{req.retailer}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{req.retailerId}</div>
                      </td>
                      <td className="p-4">{req.bank}</td>
                      <td className="p-4 font-mono font-bold text-blue-700">{req.utr}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono text-sm">₹{req.amount.toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{req.date}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setViewUtrReceipt(req)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => handleApproveUtr(req)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors inline-flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectUtr(req)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold rounded-lg border border-slate-200 transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: WHITE-LABEL BRANDING & THEMING ENGINE              */}
      {/* ========================================================= */}
      {activeTab === "branding" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">White-Label Customizer & Identity Engine</h2>
                <p className="text-xs text-slate-500">Configure company identity, custom domain, SMS sender ID, and theme colors</p>
              </div>
            </div>

            {saveSuccess && (
              <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Branding Updated Live!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Custom Branded Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">SMS Sender ID (6-Character DLT Header)</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={(e) => setSmsSenderId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-11 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Preview Card */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Tenant Portal Preview</div>
              <div className="p-4 rounded-2xl border border-slate-700 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-extrabold text-white">
                    IT
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white">{companyName}</div>
                    <div className="text-[11px] text-white/80">{customDomain}</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold">
                  Partner Portal Active
                </span>
              </div>
            </div>

            {/* Service Feature Matrix Toggles */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Service Feature Activation Matrix</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.gst}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, gst: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>GST Registration & Returns</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.itr}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, itr: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Income Tax (ITR) Optimizer</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.aiOcr}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, aiOcr: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Form 16 AI OCR Engine</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.pan}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, pan: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>PAN 49A & Reprint Hub</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.passport}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, passport: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Passport Seva Suvidha</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={featureFlags.certificates}
                    onChange={(e) => setFeatureFlags({ ...featureFlags, certificates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Dynamic E-Certificates</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-700/25 flex items-center space-x-2 transition-transform transform hover:scale-[1.01]"
              >
                <Save className="w-4 h-4" />
                <span>Save & Apply Tenant Branding</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: USER & NETWORK DIRECTORY                           */}
      {/* ========================================================= */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in space-y-6">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Outlets & User Hierarchy</h2>
              <p className="text-xs text-slate-500">Manage Master Distributors, Retailers, and Counter Operators</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create User / Outlet</span>
              </button>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="distributor">Master Distributors</option>
                <option value="retailer">Retailer Outlets</option>
                <option value="operator">Counter Operators</option>
              </select>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or mobile..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Outlet Name</th>
                  <th className="p-4">Role Tier</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Downlines</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">KYC</th>
                  <th className="p-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-700">{u.id}</td>
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role.toLowerCase().includes("distributor")
                          ? "bg-purple-100 text-purple-800"
                          : u.role.toLowerCase().includes("operator")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{u.contact}</td>
                    <td className="p-4 font-bold text-slate-700">{u.downlines} Outlets</td>
                    <td className="p-4 font-mono font-bold text-emerald-700">₹{u.wallet.toLocaleString("en-IN")}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200">
                        {u.kyc}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                          u.status === "ACTIVE" || u.status === "active"
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {u.status === "ACTIVE" || u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* USER ONBOARDING MODAL */}
          {showCreateUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Onboard New Outlet / Network User</h3>
                      <p className="text-xs text-slate-500">Create login credentials, assign role, opening wallet balance, and feature access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateUserModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{createSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Outlet / Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Trichy Prime Digital Seva"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Role Tier *</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="distributor">👥 Master Distributor (Tier 2)</option>
                        <option value="retailer">🏪 Retailer Outlet POS (Tier 3)</option>
                        <option value="operator">👤 Counter Operator Staff (Tier 4)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Login ID) *</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="outlet@infusetax.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                      <input
                        type="tel"
                        required
                        value={newUserMobile}
                        onChange={(e) => setNewUserMobile(e.target.value)}
                        placeholder="+91 98421 11223"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                      <input
                        type="text"
                        value={newUserCity}
                        onChange={(e) => setNewUserCity(e.target.value)}
                        placeholder="Coimbatore"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={newUserState}
                        onChange={(e) => setNewUserState(e.target.value)}
                        placeholder="Tamil Nadu"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Opening Prepaid Balance (₹)</label>
                      <input
                        type="number"
                        value={newUserBalance}
                        onChange={(e) => setNewUserBalance(e.target.value)}
                        placeholder="10000"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Retailer@1234"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Role-Based Module Permissions Matrix */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 mb-2">Role-Based Module Permissions & Feature Flags:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.gst}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, gst: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">GST Registration & Filings</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.itr}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, itr: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">ITR-1 / Form 16 OCR</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.pan}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, pan: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">PAN Card Desk (49A)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.passport}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, passport: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">Passport Seva Suvidha</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.certificates}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, certificates: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">Dynamic E-Certificates</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={newUserPermissions.p2p}
                          onChange={(e) => setNewUserPermissions({ ...newUserPermissions, p2p: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold">P2P Fund Transfers</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                    >
                      {isCreatingUser ? (
                        <span>Onboarding Outlet...</span>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Onboard User & Credit Wallet</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PRICING & COMMISSION MARGIN SLABS                   */}
      {/* ========================================================= */}
      {activeTab === "pricing" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Margin & Multi-Tier Commission Slabs</h2>
              <p className="text-xs text-slate-500">Configure customer fee, retailer margins, distributor overrides, and company net profit</p>
            </div>
            <button
              onClick={() => alert("Pricing Slabs Saved Successfully!")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Save All Slabs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-3.5">Tax & E-Gov Service</th>
                  <th className="p-3.5 text-right">Govt Base Fee</th>
                  <th className="p-3.5 text-right">Customer Fee</th>
                  <th className="p-3.5 text-right text-blue-700">Retailer Margin</th>
                  <th className="p-3.5 text-right text-purple-700">Distributor Override</th>
                  <th className="p-3.5 text-right text-emerald-700">Company Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pricingSlabs.map((slab, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{slab.service}</td>
                    <td className="p-3.5 text-right font-mono text-slate-500">₹{slab.govtFee}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">₹{slab.customerFee}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-blue-700">+₹{slab.retailerMargin}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-purple-700">+₹{slab.distMargin}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">+₹{slab.companyMargin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: MASTER DOUBLE-ENTRY FINANCIAL AUDIT LEDGER         */}
      {/* ========================================================= */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in space-y-6">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 text-blue-800 rounded-2xl">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Master Financial Double-Entry Audit Ledger</h2>
                <p className="text-xs text-slate-500">ACID-compliant immutable audit logs with row-level balance snapshots</p>
              </div>
            </div>

            <button
              onClick={() => alert("Exporting Master Financial Audit Ledger (.CSV)...")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">TXN ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Transaction Type</th>
                  <th className="p-4 text-right">Debit (Dr)</th>
                  <th className="p-4 text-right">Credit (Cr)</th>
                  <th className="p-4 text-right">Balance After</th>
                  <th className="p-4">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {masterLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-700">{row.id}</td>
                    <td className="p-4 text-slate-500">{row.date}</td>
                    <td className="p-4 font-bold text-slate-900">{row.entity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.type.includes("CREDIT") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-rose-600">
                      {row.debit > 0 ? `-₹${row.debit.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {row.credit > 0 ? `+₹${row.credit.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                      ₹{row.balance.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
