"use client";

import React, { useState, useEffect, useMemo } from "react";
import ServiceApprovalModal, { ServiceApprovalItem } from "@/components/dashboard/ServiceApprovalModal";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users,
  LayoutDashboard,
  FileCheck, 
  Wallet, 
  TrendingUp, 
  Send, 
  Check, 
  Search, 
  Plus, 
  ShieldCheck, 
  Award, 
  Receipt, 
  FileSpreadsheet, 
  History, 
  Lock, 
  Key,
  Download, 
  UserPlus, 
  X, 
  Building2, 
  AlertCircle,
  CheckSquare,
  MessageSquare,
  Sliders,
  Sparkles,
  CreditCard,
  Plane,
  Clock,
  RefreshCw,
  Save,
  Shield,
  Eye,
  Edit,
  DollarSign,
  Power,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Megaphone
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";
import TaxCalendarTicker from "@/components/dashboard/TaxCalendarTicker";

// =========================================================================
// REUSABLE ENTERPRISE PAGINATION CONTROL COMPONENT
// =========================================================================
function PaginationControls({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50]
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 border-t border-slate-200/60 rounded-b-2xl text-xs text-slate-600 font-medium">
      <div className="flex items-center space-x-3">
        <span>
          Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to{" "}
          <strong className="text-slate-900 font-bold">{endItem}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
        </span>
        {onPageSizeChange && (
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 rounded-lg hover:bg-slate-200/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-lg hover:bg-slate-200/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? "bg-blue-700 text-white shadow-xs"
                        : "hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-lg hover:bg-slate-200/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-lg hover:bg-slate-200/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DistributorDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "announcements" | "approvals" | "service-approvals" | "pricing" | "outlets" | "reports">(
    (["overview", "announcements", "approvals", "service-approvals", "pricing", "outlets", "reports"].includes(currentTabParam) ? currentTabParam : "overview") as any
  );

  useEffect(() => {
    if (currentTabParam && ["overview", "announcements", "approvals", "service-approvals", "pricing", "outlets", "reports"].includes(currentTabParam)) {
      setActiveTab(currentTabParam as any);
    }
  }, [currentTabParam]);

  // Loading & Feedback Toast
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Active User Context
  const [activeUser, setActiveUser] = useState<any>(null);
  const [tenantPermissions, setTenantPermissions] = useState<string[]>([]);

  // 1. Overview Dynamic Stats
  const [stats, setStats] = useState({
    total_outlets: 0,
    total_retailers: 0,
    total_operators: 0,
    downline_liquidity: 0,
    pending_approvals: 0,
    today_margin_earned: 0
  });

  // 2. Dynamic Outlets Directory (T3 Retailers & T4 Operators)
  const [outlets, setOutlets] = useState<any[]>([]);
  const [outletRoleFilter, setOutletRoleFilter] = useState("all");
  const [outletSearchQuery, setOutletSearchQuery] = useState("");
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showEditOutletModal, setShowEditOutletModal] = useState(false);
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [showAdjustWalletModal, setShowAdjustWalletModal] = useState(false);
  const [showDeleteOutletModal, setShowDeleteOutletModal] = useState(false);
  const [showOutletActivityModal, setShowOutletActivityModal] = useState(false);
  const [outletActivities, setOutletActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<any>(null);
  const [onboardErrorMsg, setOnboardErrorMsg] = useState("");
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState("");

  // Role Access & Permissions Modal State (Tier 2 -> Tier 3 RBAC)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedOutletForPerms, setSelectedOutletForPerms] = useState<any>(null);
  const [outletPermissionsList, setOutletPermissionsList] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Form states for outlet actions
  const [newOutlet, setNewOutlet] = useState({
    role: "retailer" as "retailer" | "operator",
    full_name: "",
    email: "",
    mobile: "",
    city: "Chennai",
    state: "Tamil Nadu",
    password: "Retailer@1234",
    initial_wallet: "0"
  });

  const [editOutletData, setEditOutletData] = useState({ full_name: "", email: "", mobile: "", city: "", state: "" });
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [walletAdjData, setWalletAdjData] = useState({ amount: "", direction: "CREDIT" as "CREDIT" | "DEBIT", remarks: "" });

  // 3. Dynamic Tier 3 Pricing Setup & Audit Logs
  const [directPricing, setDirectPricing] = useState<any[]>([]);
  const [priceAuditLogs, setPriceAuditLogs] = useState<any[]>([]);
  const [savingPriceKey, setSavingPriceKey] = useState<string | null>(null);

  // 4. Dynamic Wallet Approvals (T3 & T4 Only)
  const [walletRequests, setWalletRequests] = useState<any[]>([]);
  const [serviceApplications, setServiceApplications] = useState<ServiceApprovalItem[]>([]);
  const [selectedServiceApproval, setSelectedServiceApproval] = useState<ServiceApprovalItem | null>(null);
  const [approvalsMainTab, setApprovalsMainTab] = useState<"services" | "wallet">("services");
  const [serviceApprovalSubTab, setServiceApprovalSubTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [approvalSubTab, setApprovalSubTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [approvalRoleFilter, setApprovalRoleFilter] = useState<"all" | "retailer" | "operator">("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Bank statement reference mismatch");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // 5. Dynamic Master Audit Ledger Reports
  const [masterLedger, setMasterLedger] = useState<any[]>([]);
  const [ledgerActionFilter, setLedgerActionFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // 6. Dynamic Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState("all");
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    category: "ANNOUNCEMENT",
    message: "",
    due_date: "",
    urgency: "UPCOMING"
  });
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [announcementsPerPage, setAnnouncementsPerPage] = useState(10);

  // ==========================================
  // PAGINATION STATES ACROSS ALL MODULES
  // ==========================================
  const [outletsPage, setOutletsPage] = useState(1);
  const [outletsPageSize, setOutletsPageSize] = useState(5);

  const [pricingPage, setPricingPage] = useState(1);
  const [pricingPageSize, setPricingPageSize] = useState(6);

  const [priceAuditPage, setPriceAuditPage] = useState(1);
  const [priceAuditPageSize, setPriceAuditPageSize] = useState(5);

  const [approvalsPage, setApprovalsPage] = useState(1);
  const [approvalsPageSize, setApprovalsPageSize] = useState(5);

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  // WhatsApp Downline Notification State
  const [distWhatsappEnabled, setDistWhatsappEnabled] = useState<boolean>(true);
  const [savingWhatsapp, setSavingWhatsapp] = useState<boolean>(false);

  const handleToggleDistributorWhatsapp = async () => {
    setSavingWhatsapp(true);
    const nextVal = !distWhatsappEnabled;
    try {
      const res = await secureApiCall("/api/v1/distributor/whatsapp/config", {
        method: "POST",
        body: JSON.stringify({ enabled: nextVal })
      });
      if (res.ok) {
        setDistWhatsappEnabled(nextVal);
        showToast(`✓ Downline WhatsApp alerts ${nextVal ? 'enabled' : 'paused'}!`);
      } else {
        showToast("Failed to update WhatsApp settings", "error");
      }
    } catch (e) {
      showToast("Network error updating WhatsApp settings", "error");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // ==========================================
  // INITIAL DATA FETCHING
  // ==========================================
  const loadAllData = async () => {
    setLoading(true);
    const user = getAuthUser();
    setActiveUser(user);

    try {
      // 1. Fetch Outlets
      const outletsRes = await secureApiCall("/api/v1/distributor/outlets");
      if (outletsRes.ok && outletsRes.data?.outlets) {
        setOutlets(outletsRes.data.outlets);
        const retCount = outletsRes.data.outlets.filter((o: any) => o.role === 'retailer').length;
        const opCount = outletsRes.data.outlets.filter((o: any) => o.role === 'operator').length;
        const totalLiquidity = outletsRes.data.outlets.reduce((acc: number, o: any) => acc + parseFloat(o.wallet || 0), 0);
        setStats(prev => ({
          ...prev,
          total_outlets: outletsRes.data.outlets.length,
          total_retailers: retCount,
          total_operators: opCount,
          downline_liquidity: totalLiquidity
        }));
      }

      // 2. Fetch Pricing
      const pricingRes = await secureApiCall("/api/v1/pricing");
      if (pricingRes.ok && pricingRes.data?.pricing) {
        setDirectPricing(pricingRes.data.pricing);
      }

      // 3. Fetch Pricing Audit Logs
      const auditRes = await secureApiCall("/api/v1/pricing/audit-logs");
      if (auditRes.ok && auditRes.data?.logs) {
        setPriceAuditLogs(auditRes.data.logs);
      }

      // 4. Fetch Wallet Requests (T3/T4)
      const reqRes = await secureApiCall("/api/v1/wallet/requests");
      if (reqRes.ok && reqRes.data?.requests) {
        setWalletRequests(reqRes.data.requests);
        const pendingCount = reqRes.data.requests.filter((r: any) => r.status === 'pending').length;
        setStats(prev => ({ ...prev, pending_approvals: pendingCount }));
      }

      // 5. Fetch Scoped Audit Ledger
      const ledgerRes = await secureApiCall("/api/v1/admin/audit-ledger");
      if (ledgerRes.ok && ledgerRes.data?.ledger) {
        setMasterLedger(ledgerRes.data.ledger);
      }

      // 6. Fetch Announcements
      const annRes = await secureApiCall("/api/v1/announcements");
      if (annRes.ok && annRes.data?.announcements) {
        setAnnouncements(annRes.data.announcements);
      }

      // 0. Fetch User Profile and Tenant Permissions
      const profRes = await secureApiCall("/api/v1/auth/profile");
      if (profRes.ok && profRes.data?.user) {
        setActiveUser(profRes.data.user);
        if (profRes.data.user.enabled_services) {
          const list = profRes.data.user.enabled_services.split(",").map((s: string) => s.trim());
          setTenantPermissions(list);
        }
      }

      // 7. Fetch Service Document Approvals (T3 & T4)
      const servRes = await secureApiCall("/api/v1/service-approvals/list");
      if (servRes.ok && servRes.data?.applications) {
        setServiceApplications(servRes.data.applications);
      }
    } catch (err) {
      console.error("Failed to load distributor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const switchTab = (tab: "overview" | "approvals" | "service-approvals" | "pricing" | "outlets" | "reports") => {
    setActiveTab(tab);
    router.push(`/dashboard/distributor?tab=${tab}`);
  };

  // ==========================================
  // ACTIONS: VIEW OUTLET ACTIVITY STREAM
  // ==========================================
  const handleViewOutletActivity = async (outlet: any) => {
    setSelectedOutlet(outlet);
    setShowOutletActivityModal(true);
    setLoadingActivity(true);
    try {
      const res = await secureApiCall(`/api/v1/distributor/outlets/activity?user_id=${outlet.id}`);
      if (res.ok && res.data?.activities) {
        setOutletActivities(res.data.activities);
      } else {
        setOutletActivities([]);
      }
    } catch (err) {
      setOutletActivities([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  // ==========================================
  // ACTIONS: CSV EXPORTS
  // ==========================================
  const handleExportOutletsCSV = () => {
    if (filteredOutlets.length === 0) {
      showToast("No outlets matching filter to export.", "error");
      return;
    }

    const headers = ["Outlet ID", "Store Name / Owner", "Role Tier", "Email", "Mobile", "City", "State", "Wallet Balance (INR)", "Status", "Onboarded Date"];
    const rows = filteredOutlets.map(o => [
      `"${o.id}"`,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      `"Tier ${o.role === 'retailer' ? '3 (Retailer)' : '4 (Operator)'}"`,
      `"${o.email}"`,
      `"${o.contact}"`,
      `"${o.city || ''}"`,
      `"${o.state || ''}"`,
      o.wallet || 0,
      `"${o.status}"`,
      `"${o.onboarded_date || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Distributor_Downline_Outlets_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downline Outlets CSV exported successfully!");
  };

  const handleExportLedgerCSV = () => {
    if (filteredLedger.length === 0) {
      showToast("No ledger records available to export.", "error");
      return;
    }

    const headers = ["Transaction ID", "Date & Time", "Outlet / Entity", "Action Type", "Debit (INR)", "Credit (INR)", "Balance After (INR)", "Narration"];
    const rows = filteredLedger.map(tx => [
      `"${tx.reference_id || tx.id}"`,
      `"${tx.date || tx.created_at}"`,
      `"${(tx.entity || 'Platform').replace(/"/g, '""')}"`,
      `"${tx.type}"`,
      tx.debit || "0.00",
      tx.credit || "0.00",
      tx.balance || "0.00",
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Distributor_Audit_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Distributor Audit Ledger CSV exported successfully!");
  };

  // ==========================================
  // ACTIONS: OUTLETS MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC)
  const handleOpenPermissionsModal = (outlet: any) => {
    setSelectedOutletForPerms(outlet);
    let perms: string[] = [];
    if (outlet.permissions) {
      if (outlet.permissions === "all") {
        perms = [
          "gst_registration", "itr_filing", "gstr_filing", "announcements", 
          "vault", "staff", "service_approvals", "float_approvals", "reports"
        ];
      } else if (Array.isArray(outlet.permissions)) {
        perms = outlet.permissions;
      } else if (typeof outlet.permissions === "string") {
        perms = outlet.permissions.split(",").map((s: string) => s.trim());
      }
    } else {
      perms = [
        "gst_registration", "itr_filing", "gstr_filing", "announcements", 
        "vault", "staff", "service_approvals", "float_approvals", "reports"
      ];
    }
    setOutletPermissionsList(perms);
    setShowPermissionsModal(true);
  };

  const handleSaveOutletPermissions = async () => {
    if (!selectedOutletForPerms) return;
    setSavingPermissions(true);
    try {
      const { ok, data } = await secureApiCall("/api/v1/distributor/permissions/update", {
        method: "POST",
        body: {
          user_id: selectedOutletForPerms.id,
          permissions: outletPermissionsList
        }
      });
      if (ok && data.status === "success") {
        showToast(data.message || `✓ Role permissions for '${selectedOutletForPerms.name}' saved successfully!`);
        setShowPermissionsModal(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("infusetax_permissions_updated"));
        }
        loadAllData();
      } else {
        showToast(data.message || "Failed to update role permissions", "error");
      }
    } catch (e) {
      showToast("Network error saving role permissions", "error");
    } finally {
      setSavingPermissions(false);
    }
  };

  // ==========================================
  const handleOnboardOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardErrorMsg("");
    setOnboardSuccessMsg("");
    setLoading(true);

    if (!newOutlet.full_name.trim()) {
      setOnboardErrorMsg("Full name / store name is required.");
      setLoading(false);
      return;
    }
    if (!newOutlet.email.trim() || !newOutlet.email.includes("@")) {
      setOnboardErrorMsg("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    const cleanMob = newOutlet.mobile.replace(/\D/g, "");
    if (cleanMob.length < 10) {
      setOnboardErrorMsg("Mobile number must contain at least 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await secureApiCall("/api/v1/admin/users/create", {
        method: "POST",
        body: {
          role: newOutlet.role,
          full_name: newOutlet.full_name.trim(),
          email: newOutlet.email.trim().toLowerCase(),
          mobile: newOutlet.mobile.trim(),
          parent_id: activeUser?.sub || activeUser?.id,
          city: newOutlet.city || "Chennai",
          state: newOutlet.state || "Tamil Nadu",
          password: newOutlet.password || "Retailer@1234",
          opening_balance: parseFloat(newOutlet.initial_wallet || "0")
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        setOnboardSuccessMsg(`✓ Outlet '${newOutlet.full_name}' onboarded successfully!`);
        showToast(`Downline Outlet '${newOutlet.full_name}' onboarded successfully!`);
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        setTimeout(() => {
          setShowOnboardModal(false);
          setOnboardSuccessMsg("");
          setOnboardErrorMsg("");
          setNewOutlet({
            role: "retailer", full_name: "", email: "", mobile: "",
            city: "Chennai", state: "Tamil Nadu", password: "Retailer@1234", initial_wallet: "0"
          });
          loadAllData();
        }, 1200);
      } else {
        const errMsg = res.data?.message || "Failed to onboard outlet. Email or mobile may already exist.";
        setOnboardErrorMsg(errMsg);
        showToast(errMsg, "error");
      }
    } catch (err: any) {
      const errMsg = "Network connection error.";
      setOnboardErrorMsg(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOutletProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/update", {
        method: "POST",
        body: {
          user_id: selectedOutlet.id,
          full_name: editOutletData.full_name,
          email: editOutletData.email,
          mobile: editOutletData.mobile,
          city: editOutletData.city,
          state: editOutletData.state
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("Outlet profile updated successfully!");
        setShowEditOutletModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Network error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetOutletPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet || !newPasswordVal) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/reset-password", {
        method: "POST",
        body: {
          user_id: selectedOutlet.id,
          new_password: newPasswordVal
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Password for ${selectedOutlet.name} reset successfully!`);
        setShowResetPassModal(false);
        setNewPasswordVal("");
      } else {
        showToast(res.data?.message || "Failed to reset password", "error");
      }
    } catch (err) {
      showToast("Network error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustOutletWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutlet || !walletAdjData.amount) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/adjust-wallet", {
        method: "POST",
        body: {
          user_id: selectedOutlet.id,
          amount: parseFloat(walletAdjData.amount),
          direction: walletAdjData.direction,
          remarks: walletAdjData.remarks || "Direct adjustment by Master Distributor"
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Successfully ${walletAdjData.direction}ED INR ${walletAdjData.amount} for ${selectedOutlet.name}!`);
        setShowAdjustWalletModal(false);
        setWalletAdjData({ amount: "", direction: "CREDIT", remarks: "" });
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to adjust wallet", "error");
      }
    } catch (err) {
      showToast("Network error adjusting wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOutletStatus = async (outletId: string) => {
    try {
      const res = await secureApiCall("/api/v1/admin/users/status", {
        method: "POST",
        body: { user_id: outletId },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(res.data.message || "Outlet status toggled.");
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      showToast("Network error toggling status", "error");
    }
  };

  const handleDeleteOutlet = async () => {
    if (!selectedOutlet) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/delete", {
        method: "POST",
        body: { user_id: selectedOutlet.id },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Outlet '${selectedOutlet.name}' deleted.`);
        setShowDeleteOutletModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to delete outlet", "error");
      }
    } catch (err) {
      showToast("Network error deleting outlet", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIONS: PRICING UPDATE
  // ==========================================
  const handlePriceChange = (serviceKey: string, value: number) => {
    setDirectPricing(directPricing.map(p => p.service_key === serviceKey ? { ...p, tier3_price: value } : p));
  };

  const handleSaveTier3Price = async (service: any) => {
    setSavingPriceKey(service.service_key);
    try {
      const res = await secureApiCall("/api/v1/distributor/pricing/update", {
        method: "POST",
        body: {
          service_key: service.service_key,
          tier3_price: parseFloat(service.tier3_price),
          remarks: `Tier 3 wholesale rate set to INR ${service.tier3_price} by Master Distributor`
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Tier 3 Price updated for ${service.service_name}!`);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to update pricing", "error");
      }
    } catch (err) {
      showToast("Network error updating pricing", "error");
    } finally {
      setSavingPriceKey(null);
    }
  };

  // ==========================================
  // ACTIONS: ANNOUNCEMENTS MANAGEMENT
  // ==========================================
  const loadAnnouncements = async () => {
    try {
      const res = await secureApiCall("/api/v1/announcements");
      if (res.ok && res.data?.announcements) {
        setAnnouncements(res.data.announcements);
      }
    } catch (e) {
      console.error("Failed to load announcements", e);
    }
  };

  const handleCreateAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert("Title and Message are required");
      return;
    }
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/announcements/create", {
        method: "POST",
        body: {
          title: newAnnouncement.title,
          category: newAnnouncement.category,
          message: newAnnouncement.message,
          due_date: newAnnouncement.due_date,
          urgency: newAnnouncement.urgency
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        alert("✓ Announcement broadcasted live to all downline retailers and operators!");
        setShowCreateAnnouncementModal(false);
        setNewAnnouncement({
          title: "",
          category: "ANNOUNCEMENT",
          message: "",
          due_date: "",
          urgency: "UPCOMING"
        });
        loadAnnouncements();
      } else {
        alert(res.data?.message || "Failed to create announcement");
      }
    } catch (err) {
      alert("Network error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editingAnnouncement.title || !editingAnnouncement.message) {
      alert("Title and Message are required");
      return;
    }
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/announcements/update", {
        method: "POST",
        body: {
          id: editingAnnouncement.id,
          title: editingAnnouncement.title,
          category: editingAnnouncement.category,
          message: editingAnnouncement.message,
          due_date: editingAnnouncement.due_date,
          urgency: editingAnnouncement.urgency
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        alert("✓ Announcement updated successfully!");
        setShowEditAnnouncementModal(false);
        setEditingAnnouncement(null);
        loadAnnouncements();
      } else {
        alert(res.data?.message || "Failed to update announcement");
      }
    } catch (err) {
      alert("Network error updating announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await secureApiCall("/api/v1/admin/announcements/delete", {
        method: "POST",
        body: { id },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        alert("✓ Announcement deleted.");
        loadAnnouncements();
      } else {
        alert(res.data?.message || "Failed to delete announcement");
      }
    } catch (e) {
      alert("Network error deleting announcement");
    }
  };

  const handleToggleAnnouncementStatus = async (id: string) => {
    try {
      const res = await secureApiCall("/api/v1/admin/announcements/status", {
        method: "POST",
        body: { id },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        loadAnnouncements();
      }
    } catch (e) {
      alert("Network error updating status");
    }
  };

  // ==========================================
  // ACTIONS: WALLET APPROVALS
  // ==========================================
  const handleApproveWallet = async (reqId: string) => {
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/wallet/requests/approve", {
        method: "POST",
        body: { request_id: reqId, remarks: "Approved by Master Distributor" },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("Wallet request approved and downline outlet credited!");
        setShowReceiptModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Approval failed", "error");
      }
    } catch (err) {
      showToast("Network error approving wallet request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWallet = async () => {
    if (!selectedReqId) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/wallet/requests/reject", {
        method: "POST",
        body: { request_id: selectedReqId, reason: rejectReason },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("Wallet request marked as REJECTED.");
        setShowRejectModal(false);
        setShowReceiptModal(false);
        setSelectedReqId(null);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to reject request", "error");
      }
    } catch (err) {
      showToast("Network error rejecting request", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTERED & PAGINATED DATA PIPELINES
  // ==========================================

  // 1. Outlets Pipeline
  const filteredOutlets = useMemo(() => {
    return outlets.filter(o => {
      const matchesRole = outletRoleFilter === "all" || o.role?.toLowerCase() === outletRoleFilter?.toLowerCase();
      const matchesSearch = !outletSearchQuery ||
        o.name?.toLowerCase().includes(outletSearchQuery.toLowerCase()) ||
        o.email?.toLowerCase().includes(outletSearchQuery.toLowerCase()) ||
        o.contact?.includes(outletSearchQuery);
      return matchesRole && matchesSearch;
    });
  }, [outlets, outletRoleFilter, outletSearchQuery]);

  const paginatedOutlets = useMemo(() => {
    const start = (outletsPage - 1) * outletsPageSize;
    return filteredOutlets.slice(start, start + outletsPageSize);
  }, [filteredOutlets, outletsPage, outletsPageSize]);

  // 2. Pricing Pipeline
  const paginatedPricing = useMemo(() => {
    const start = (pricingPage - 1) * pricingPageSize;
    return directPricing.slice(start, start + pricingPageSize);
  }, [directPricing, pricingPage, pricingPageSize]);

  // 3. Pricing Audit Logs Pipeline
  const paginatedPriceAuditLogs = useMemo(() => {
    const start = (priceAuditPage - 1) * priceAuditPageSize;
    return priceAuditLogs.slice(start, start + priceAuditPageSize);
  }, [priceAuditLogs, priceAuditPage, priceAuditPageSize]);

  // 4. Wallet Requests Pipeline (Filter by T3/T4 + Status)
  const filteredWalletRequests = useMemo(() => {
    return walletRequests.filter(r => {
      const matchesStatus = r.status?.toLowerCase() === approvalSubTab?.toLowerCase();
      const matchesRole = approvalRoleFilter === "all" || r.requester_role?.toLowerCase() === approvalRoleFilter?.toLowerCase();
      return matchesStatus && matchesRole;
    });
  }, [walletRequests, approvalSubTab, approvalRoleFilter]);

  const paginatedWalletRequests = useMemo(() => {
    const start = (approvalsPage - 1) * approvalsPageSize;
    return filteredWalletRequests.slice(start, start + approvalsPageSize);
  }, [filteredWalletRequests, approvalsPage, approvalsPageSize]);

  // 5. Scoped Ledger Pipeline
  const filteredLedger = useMemo(() => {
    return masterLedger.filter(tx => {
      const matchesAction = ledgerActionFilter === "all" || tx.type === ledgerActionFilter;
      const matchesSearch = !ledgerSearch ||
        (tx.reference_id && tx.reference_id.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.entity && tx.entity.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.note && tx.note.toLowerCase().includes(ledgerSearch.toLowerCase()));
      return matchesAction && matchesSearch;
    });
  }, [masterLedger, ledgerActionFilter, ledgerSearch]);

  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPageSize;
    return filteredLedger.slice(start, start + ledgerPageSize);
  }, [filteredLedger, ledgerPage, ledgerPageSize]);

  // 6. Dynamic Announcements Pipeline
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      return announcementCategoryFilter === "all" || a.category === announcementCategoryFilter;
    });
  }, [announcements, announcementCategoryFilter]);

  const paginatedAnnouncements = useMemo(() => {
    const start = (announcementsPage - 1) * announcementsPerPage;
    return filteredAnnouncements.slice(start, start + announcementsPerPage);
  }, [filteredAnnouncements, announcementsPage, announcementsPerPage]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-bold transition-all animate-bounce ${
          feedback.type === "success" 
            ? "bg-emerald-900 text-emerald-100 border-emerald-700" 
            : "bg-rose-900 text-rose-100 border-rose-700"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Tier 2 Master Distributor Hub
            </span>
            <span className="text-xs text-slate-400">Node: {activeUser?.tenant || "INFUSE"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Master Distributor Operations & Liquidity</h1>
          <p className="text-xs text-slate-500">Manage downline retailer networks, approve operator shift floats, set Tier 3 wholesale pricing, and track margins.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 flex items-center space-x-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Retailer / Staff</span>
          </button>
        </div>
      </div>

      {/* Horizontal Tab Switcher */}
      {(() => {
        const allTabs = [
          { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
          { id: "service-approvals", label: "Service Approvals (T3 & T4)", icon: FileCheck, badge: `${serviceApplications.filter(a => a.status === 'PENDING_APPROVAL').length} Pending`, permKey: "service_approvals" },
          { id: "approvals", label: "Wallet Approvals (T3 & T4)", icon: CheckSquare, badge: `${walletRequests.filter(r => r.status === 'pending').length} Pending`, permKey: "float_approvals" },
          { id: "pricing", label: "Tier 3 Pricing Setup", icon: Sliders, badge: `${directPricing.length} Services`, permKey: "pricing" },
          { id: "outlets", label: "Network Outlets", icon: Users, badge: `${outlets.length} Outlets`, permKey: "outlets" },
          { id: "announcements", label: "Company Announcements", icon: Megaphone, badge: `${announcements.length} Live`, permKey: "announcements" },
          { id: "reports", label: "Wallet & Master Reports", icon: History, permKey: "reports" },
        ];

        const isPermitted = (permKey?: string) => {
          if (!permKey) return true;
          if (tenantPermissions.length === 0 || tenantPermissions.includes("all")) return true;
          return tenantPermissions.includes(permKey);
        };

        const visibleTabs = allTabs.filter(t => isPermitted(t.permKey));

        return (
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
            {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  tab.badge.includes('Pending') && parseInt(tab.badge) > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Downline Outlets</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.total_outlets}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                {stats.total_retailers} T3 Retailers • {stats.total_operators} T4 Operators
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Downline Liquidity</span>
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-700">
                ₹{stats.downline_liquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Network float active
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Float Approvals</span>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.pending_approvals}</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> T3 Retailer & T4 Staff claims
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md shadow-slate-900/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Wholesale Margin Earned</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ₹{stats.today_margin_earned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">
                Direct wholesale spread from downline filings
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Master Distributor Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowOnboardModal(true)}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 text-left transition-all cursor-pointer group"
              >
                <UserPlus className="w-5 h-5 text-blue-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-blue-950">Onboard Downline Outlet</div>
                <div className="text-[11px] text-blue-800/70 mt-0.5">Deploy new Retailer POS</div>
              </button>

              <button 
                onClick={() => switchTab("approvals")}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 text-left transition-all cursor-pointer group"
              >
                <CheckSquare className="w-5 h-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-amber-950">Review Float Claims</div>
                <div className="text-[11px] text-amber-800/70 mt-0.5">{stats.pending_approvals} awaiting approval</div>
              </button>

              <button 
                onClick={() => switchTab("pricing")}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-left transition-all cursor-pointer group"
              >
                <Sliders className="w-5 h-5 text-purple-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-purple-950">Tier 3 Wholesale Pricing</div>
                <div className="text-[11px] text-purple-800/70 mt-0.5">Configure 6 service base rates</div>
              </button>

              <button 
                onClick={() => switchTab("reports")}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-left transition-all cursor-pointer group"
              >
                <History className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-emerald-950">Master Audit Reports</div>
                <div className="text-[11px] text-emerald-800/70 mt-0.5">Double-entry downline trail</div>
              </button>
            </div>
          </div>

          {/* Tier 2 WhatsApp Downline Alert Settings Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl border border-slate-700 shadow-md text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-extrabold text-white">Downline WhatsApp Communication Engine</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    distWhatsappEnabled 
                      ? "bg-emerald-500 text-white border-emerald-400" 
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}>
                    {distWhatsappEnabled ? "🟢 Active" : "🔴 Paused"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Automatically sends instant WhatsApp credit notifications to Retailers when you approve their <strong>Wallet Top-ups</strong> and <strong>Service Applications</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleToggleDistributorWhatsapp}
                disabled={savingWhatsapp}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center space-x-2 cursor-pointer ${
                  distWhatsappEnabled
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
              >
                <span>{distWhatsappEnabled ? "Disable Downline WhatsApp" : "Enable Downline WhatsApp"}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NETWORK OUTLETS (T3 Retailers & T4 Operators)                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB: COMPANY ANNOUNCEMENTS & DOWNLINE BROADCASTS                          */}
      {/* ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Tier 2 Outlets Broadcast
                </span>
                <span className="text-xs text-slate-400">Company Notices & Downline Alerts</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Company Announcements & Outlets Notices</h2>
              <p className="text-xs text-slate-500">Publish statutory deadlines, margin incentives, and support notices for your retailer & operator outlets.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <select
                value={announcementCategoryFilter}
                onChange={(e) => {
                  setAnnouncementCategoryFilter(e.target.value);
                  setAnnouncementsPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="GST">GST</option>
                <option value="INCOME_TAX">Income Tax / ITR</option>
                <option value="TDS">TDS / TCS</option>
                <option value="ADVANCE_TAX">Advance Tax</option>
                <option value="ANNOUNCEMENT">General Announcement</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>

              <button
                onClick={() => setShowCreateAnnouncementModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center space-x-2 cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>+ Broadcast to Outlets</span>
              </button>
            </div>
          </div>

          {/* Announcements Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Category & Title</th>
                    <th className="py-3.5 px-5">Broadcast Notice</th>
                    <th className="py-3.5 px-5">Due Date / Validity</th>
                    <th className="py-3.5 px-5">Urgency</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No announcements found for your company network.
                      </td>
                    </tr>
                  ) : (
                    paginatedAnnouncements.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-black text-[10px]">
                              {a.category}
                            </span>
                            <span className="font-bold text-slate-900">{a.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Posted: {a.date || "Active"} • Origin: {a.company_code || "Company"}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 max-w-xs">
                          <p className="text-slate-600 line-clamp-2">{a.message}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {a.due_date || "Continuous"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            a.urgency === "URGENT" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                            a.urgency === "CRITICAL" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                            a.urgency === "INFO" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {a.urgency}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <button
                            onClick={() => handleToggleAnnouncementStatus(a.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              a.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {a.is_active ? "● Live Active" : "○ Inactive"}
                          </button>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingAnnouncement({
                                  id: a.id,
                                  title: a.title,
                                  category: a.category,
                                  message: a.message,
                                  due_date: a.due_date || "",
                                  urgency: a.urgency
                                });
                                setShowEditAnnouncementModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Announcement"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(a.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={announcementsPage}
              totalItems={filteredAnnouncements.length}
              pageSize={announcementsPerPage}
              onPageChange={setAnnouncementsPage}
              onPageSizeChange={setAnnouncementsPerPage}
            />
          </div>
        </div>
      )}

      {activeTab === "outlets" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Network Outlets Directory (Tiers 3 & 4)</h3>
                <p className="text-xs text-slate-500">Retailer POS Stores and Operator Counter Staff under your Master Distributor account.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportOutletsCSV}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Export Outlets Directory to CSV"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Outlets (.CSV)</span>
                </button>
                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 flex items-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard New Outlet</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["all", "retailer", "operator"].map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => { setOutletRoleFilter(roleKey); setOutletsPage(1); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                      outletRoleFilter === roleKey 
                        ? "bg-blue-700 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {roleKey === "all" ? "All Outlets" : roleKey === "retailer" ? "Tier 3 Retailers" : "Tier 4 Operator Staff"}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={outletSearchQuery}
                  onChange={(e) => { setOutletSearchQuery(e.target.value); setOutletsPage(1); }}
                  placeholder="Search store name, mobile, email..."
                  className="bg-transparent text-xs text-slate-700 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Outlets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Outlet / Store Name</th>
                    <th className="py-3.5 px-4">Assigned Role Tier</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 text-center">Sub-Staff</th>
                    <th className="py-3.5 px-4 text-center">Filings & Actions</th>
                    <th className="py-3.5 px-4 text-right">Prepaid Wallet</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedOutlets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No downline outlets matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedOutlets.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-xs">{o.name}</div>
                          <div className="text-[11px] text-slate-500">{o.email} • {o.contact}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            o.role === 'retailer' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            Tier {o.role === 'retailer' ? '3: RETAILER' : '4: OPERATOR'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{o.city || "Chennai"}, {o.state || "Tamil Nadu"}</td>
                        <td className="py-4 px-4 text-center font-bold text-slate-700">{o.sub_staff || 0} Staff</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleViewOutletActivity(o)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                            title="View all tax filings and wallet actions for this outlet"
                          >
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            <span>{o.total_activities || 0} Actions</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900">
                          ₹{parseFloat(o.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            o.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenPermissionsModal(o)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Configure Role Access & Permissions"
                            >
                              <Key className="w-3 h-3 text-purple-600" />
                              <span>Role Access</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOutlet(o);
                                setEditOutletData({
                                  full_name: o.name,
                                  email: o.email,
                                  mobile: o.contact,
                                  city: o.city || "Chennai",
                                  state: o.state || "Tamil Nadu"
                                });
                                setShowEditOutletModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit Outlet Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOutlet(o);
                                setNewPasswordVal("");
                                setShowResetPassModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOutlet(o);
                                setWalletAdjData({ amount: "", direction: "CREDIT", remarks: "" });
                                setShowAdjustWalletModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Adjust Wallet (Credit / Debit)"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleOutletStatus(o.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                o.status === 'active' 
                                  ? 'bg-slate-100 hover:bg-amber-100 text-amber-700' 
                                  : 'bg-slate-100 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={o.status === 'active' ? "Suspend Outlet" : "Activate Outlet"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOutlet(o);
                                setShowDeleteOutletModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete Outlet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Outlets Directory */}
            <PaginationControls
              currentPage={outletsPage}
              totalItems={filteredOutlets.length}
              pageSize={outletsPageSize}
              onPageChange={setOutletsPage}
              onPageSizeChange={setOutletsPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIRECT TIER 3 PRICING SETUP                                        */}
      {/* ========================================================================= */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Tier 3 Retailer Pricing Configuration</h3>
                <p className="text-xs text-slate-500">Configure base wholesale price charged to your Tier 3 Retailers. Your profit margin is earned per transaction.</p>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Service Name</th>
                    <th className="py-3.5 px-4 text-center">Your Wholesale Cost (₹)</th>
                    <th className="py-3.5 px-4 text-center">Tier 3 Retailer Price (₹)</th>
                    <th className="py-3.5 px-4 text-center">Suggested MRP (₹)</th>
                    <th className="py-3.5 px-4 text-center">Your Wholesale Profit</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPricing.map((p) => {
                    const wholesaleCost = parseFloat(p.tier2_price || p.base_cost || 0);
                    const retailerPrice = parseFloat(p.tier3_price || wholesaleCost);
                    const mrp = parseFloat(p.mrp_customer_fee || p.mrp_fee || retailerPrice);
                    const margin = retailerPrice - wholesaleCost;

                    return (
                      <tr key={p.id || p.service_key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">{p.service_name}</td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-600">
                          ₹{wholesaleCost.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-mono font-bold">
                            <span>₹</span>
                            <input
                              type="number"
                              min={wholesaleCost}
                              max={mrp}
                              value={p.tier3_price}
                              onChange={(e) => handlePriceChange(p.service_key, parseFloat(e.target.value) || wholesaleCost)}
                              className="w-16 bg-transparent text-center focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                          ₹{mrp.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                          +₹{margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleSaveTier3Price(p)}
                            disabled={savingPriceKey === p.service_key}
                            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                          >
                            Save Rate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination for Pricing Table */}
            <PaginationControls
              currentPage={pricingPage}
              totalItems={directPricing.length}
              pageSize={pricingPageSize}
              onPageChange={setPricingPage}
              onPageSizeChange={setPricingPageSize}
            />
          </div>

          {/* Pricing Modification Audit Trail Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Pricing Modification Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Updated By</th>
                    <th className="py-3 px-4">Role Tier</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 text-center">Cost Adjustment</th>
                    <th className="py-3 px-4 text-center">MRP Adjustment</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPriceAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.date || log.created_at}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.updated_by_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          log.user_tier?.includes("1") ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {log.user_tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.service_name}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        ₹{log.old_tier3_price || log.old_base_cost} → <span className="text-blue-700 font-black">₹{log.new_tier3_price || log.new_base_cost}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        ₹{log.old_mrp_fee} → <span className="text-emerald-700 font-black">₹{log.new_mrp_fee}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic text-[11px]">{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Pricing Audit Trail */}
            <PaginationControls
              currentPage={priceAuditPage}
              totalItems={priceAuditLogs.length}
              pageSize={priceAuditPageSize}
              onPageChange={setPriceAuditPage}
              onPageSizeChange={setPriceAuditPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SERVICE APPROVALS (TIER 3 & TIER 4 DOCUMENT VERIFICATION)            */}
      {/* ========================================================================= */}
      {activeTab === "service-approvals" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Tier 2 Multi-Outlet Verification Desk
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Network Service Filing Approvals</h2>
              <p className="text-xs text-slate-500">Inspect scanned color documents from Tier 3 Retailers & Tier 4 Operators, approve with verified proof upload, or reject with mandatory remarks.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {(["pending", "approved", "rejected"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setServiceApprovalSubTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    serviceApprovalSubTab === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab} ({serviceApplications.filter(a => {
                    if (tab === "pending") return a.status === "PENDING_APPROVAL" || a.status === "WAITING_VERIFICATION";
                    return a.status?.toLowerCase() === tab;
                  }).length})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="p-3.5">ARN / Ref</th>
                  <th className="p-3.5">Customer / Client</th>
                  <th className="p-3.5">Service & Constitution</th>
                  <th className="p-3.5">Operator / Submitter</th>
                  <th className="p-3.5 text-right">Fee (₹)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {serviceApplications.filter(a => {
                  if (serviceApprovalSubTab === "pending") return a.status === "PENDING_APPROVAL" || a.status === "WAITING_VERIFICATION";
                  return a.status?.toLowerCase() === serviceApprovalSubTab.toLowerCase();
                }).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                      No {serviceApprovalSubTab} service applications found for this network.
                    </td>
                  </tr>
                ) : (
                  serviceApplications
                    .filter(a => {
                      if (serviceApprovalSubTab === "pending") return a.status === "PENDING_APPROVAL" || a.status === "WAITING_VERIFICATION";
                      return a.status?.toLowerCase() === serviceApprovalSubTab.toLowerCase();
                    })
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-[11px] text-blue-700">{app.arn}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{app.client_name}</div>
                          <div className="text-[11px] text-slate-400">{app.submitted_at}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{app.service_category === 'itr' ? 'Income Tax Return' : 'GST Registration'}</div>
                          <div className="text-[11px] text-slate-500">{app.entity_type}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">{app.operator_name || "Network Staff"}</td>
                        <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                          ₹{(parseFloat(app.amount as any || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedServiceApproval(app)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl border border-blue-200 hover:border-transparent transition-all flex items-center space-x-1.5 mx-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Verify & Action</span>
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
      {/* TAB 4: WALLET APPROVALS (T3 & T4 Only)                                    */}
      {/* ========================================================================= */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Downline Wallet Float Approvals (T3 & T4)</h3>
                <p className="text-xs text-slate-500">Review deposit and float requests submitted by downline Retailer Outlets and Operator Staff.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
                  {(["all", "retailer", "operator"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setApprovalRoleFilter(r); setApprovalsPage(1); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        approvalRoleFilter === r ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {r === "all" ? "All Downlines" : r === "retailer" ? "Tier 3 Retailers" : "Tier 4 Operators"}
                    </button>
                  ))}
                </div>

                {/* Sub-Tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
                  {(["pending", "approved", "rejected"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setApprovalSubTab(tab); setApprovalsPage(1); }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        approvalSubTab === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab} {tab === "pending" && `(${walletRequests.filter(r => r.status === 'pending').length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Approvals Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Depositor Entity</th>
                    <th className="py-3.5 px-4">Role Tier</th>
                    <th className="py-3.5 px-4">Payment Ref / Mode</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Requested Amount</th>
                    <th className="py-3.5 px-4 text-center">Proof Slip</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedWalletRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No {approvalSubTab} wallet requests matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedWalletRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{req.requester_name || "Downline User"}</div>
                          <div className="text-[11px] text-slate-500">{req.requester_email} • {req.requester_mobile}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            req.requester_role === 'retailer' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {req.requester_role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-slate-800">{req.reference_no}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{req.payment_mode}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{req.created_at?.slice(0, 16).replace('T', ' ')}</td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                          ₹{parseFloat(req.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => { setSelectedReceipt(req); setShowReceiptModal(true); }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title="View Proof Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApproveWallet(req.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Approve & Credit
                              </button>
                              <button
                                onClick={() => { setSelectedReqId(req.id); setShowRejectModal(true); }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Approvals */}
            <PaginationControls
              currentPage={approvalsPage}
              totalItems={filteredWalletRequests.length}
              pageSize={approvalsPageSize}
              onPageChange={setApprovalsPage}
              onPageSizeChange={setApprovalsPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REPORTS & MASTER AUDIT LEDGER                                      */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Downline Financial Audit Ledger (ACID Double-Entry)</h3>
                <p className="text-xs text-slate-500">Live immutable transaction logs for all wallet adjustments, P2P transfers, and filing fees in your downline.</p>
              </div>

              <button
                onClick={handleExportLedgerCSV}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                title="Download Filtered Ledger as CSV file"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Downline Ledger (.CSV)</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex items-center space-x-1 w-full lg:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["all", "BANK_UTR_CREDIT", "P2P_DISBURSAL", "SERVICE_DEBIT", "MANUAL_CREDIT", "MANUAL_DEBIT"].map((act) => (
                  <button
                    key={act}
                    onClick={() => { setLedgerActionFilter(act); setLedgerPage(1); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      ledgerActionFilter === act 
                        ? "bg-blue-700 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {act === "all" ? "All Transactions" : act.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full lg:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                  placeholder="Search reference, narration..."
                  className="bg-transparent text-xs text-slate-700 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Entity / User</th>
                    <th className="py-3.5 px-4">Action Type</th>
                    <th className="py-3.5 px-4 text-right">Debit (₹)</th>
                    <th className="py-3.5 px-4 text-right">Credit (₹)</th>
                    <th className="py-3.5 px-4 text-right">Balance After</th>
                    <th className="py-3.5 px-4">Narration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No financial ledger transactions matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLedger.map((tx) => (
                      <tr key={tx.id || tx.reference_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">{tx.reference_id || tx.id}</td>
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-500">{tx.date || tx.created_at}</td>
                        <td className="py-4 px-4 font-bold text-slate-800">{tx.entity || "Downline User"}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            tx.type?.includes('CREDIT') ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            tx.type?.includes('DEBIT') ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-rose-600">
                          {tx.debit && parseFloat(tx.debit) > 0 ? `₹${parseFloat(tx.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-emerald-600">
                          {tx.credit && parseFloat(tx.credit) > 0 ? `+₹${parseFloat(tx.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-black text-slate-900">
                          ₹{parseFloat(tx.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-[11px] max-w-xs truncate">{tx.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Master Audit Ledger */}
            <PaginationControls
              currentPage={ledgerPage}
              totalItems={filteredLedger.length}
              pageSize={ledgerPageSize}
              onPageChange={setLedgerPage}
              onPageSizeChange={setLedgerPageSize}
              pageSizeOptions={[5, 10, 25, 50, 100]}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                            */}
      {/* ========================================================================= */}

      {/* 1. ONBOARD OUTLET MODAL */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard Downline Outlet</h3>
                  <p className="text-xs text-slate-500">Create new Tier 3 Retailer POS or Tier 4 Operator Staff</p>
                </div>
              </div>
              <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            {/* In-Modal Alert Notifications */}
            {onboardErrorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2.5 text-xs text-rose-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-bold">{onboardErrorMsg}</span>
              </div>
            )}
            {onboardSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{onboardSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleOnboardOutlet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Tier *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOutlet({ ...newOutlet, role: "retailer" })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      newOutlet.role === "retailer" 
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Tier 3: Retailer Outlet POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOutlet({ ...newOutlet, role: "operator" })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      newOutlet.role === "operator" 
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Tier 4: Operator Counter Staff
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Store Name *</label>
                <input
                  type="text"
                  required
                  value={newOutlet.full_name}
                  onChange={(e) => setNewOutlet({ ...newOutlet, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Digital Seva Point"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newOutlet.email}
                    onChange={(e) => setNewOutlet({ ...newOutlet, email: e.target.value })}
                    placeholder="outlet@example.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newOutlet.mobile}
                    onChange={(e) => setNewOutlet({ ...newOutlet, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={newOutlet.password}
                    onChange={(e) => setNewOutlet({ ...newOutlet, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Wallet (₹)</label>
                  <input
                    type="number"
                    value={newOutlet.initial_wallet}
                    onChange={(e) => setNewOutlet({ ...newOutlet, initial_wallet: e.target.value })}
                    placeholder="0"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowOnboardModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Provisioning..." : "Onboard Outlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT OUTLET PROFILE MODAL */}
      {showEditOutletModal && selectedOutlet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Outlet Profile</h3>
                <p className="text-xs text-slate-500">Update store details for {selectedOutlet.name}</p>
              </div>
              <button onClick={() => setShowEditOutletModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateOutletProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Store Name *</label>
                <input
                  type="text"
                  required
                  value={editOutletData.full_name}
                  onChange={(e) => setEditOutletData({ ...editOutletData, full_name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editOutletData.email}
                    onChange={(e) => setEditOutletData({ ...editOutletData, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={editOutletData.mobile}
                    onChange={(e) => setEditOutletData({ ...editOutletData, mobile: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editOutletData.city}
                    onChange={(e) => setEditOutletData({ ...editOutletData, city: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editOutletData.state}
                    onChange={(e) => setEditOutletData({ ...editOutletData, state: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditOutletModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESET PASSWORD MODAL */}
      {showResetPassModal && selectedOutlet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Outlet Password</h3>
                <p className="text-xs text-slate-500">Set new password for {selectedOutlet.name}</p>
              </div>
              <button onClick={() => setShowResetPassModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleResetOutletPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 6 Characters) *</label>
                <input
                  type="password"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowResetPassModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADJUST WALLET MODAL */}
      {showAdjustWalletModal && selectedOutlet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Adjust Outlet Wallet</h3>
                <p className="text-xs text-slate-500">Credit or debit prepaid balance for {selectedOutlet.name}</p>
              </div>
              <button onClick={() => setShowAdjustWalletModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAdjustOutletWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Direction *</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl space-x-1">
                  <button
                    type="button"
                    onClick={() => setWalletAdjData({ ...walletAdjData, direction: "CREDIT" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      walletAdjData.direction === "CREDIT" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + CREDIT (Add Funds)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAdjData({ ...walletAdjData, direction: "DEBIT" })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      walletAdjData.direction === "DEBIT" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    - DEBIT (Deduct Funds)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={walletAdjData.amount}
                  onChange={(e) => setWalletAdjData({ ...walletAdjData, amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full text-base p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Remarks *</label>
                <input
                  type="text"
                  required
                  value={walletAdjData.remarks}
                  onChange={(e) => setWalletAdjData({ ...walletAdjData, remarks: e.target.value })}
                  placeholder="e.g. Counter shift float advance"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAdjustWalletModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md text-white cursor-pointer disabled:opacity-60 ${
                    walletAdjData.direction === "CREDIT" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {loading ? "Processing..." : `Execute ${walletAdjData.direction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DELETE OUTLET MODAL */}
      {showDeleteOutletModal && selectedOutlet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Outlet Account</h3>
                <p className="text-xs text-slate-500">Confirm permanent deletion of downline node</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete outlet <strong className="text-slate-900">{selectedOutlet.name}</strong> ({selectedOutlet.email})? This action removes all credentials and cannot be undone.
            </p>

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowDeleteOutletModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
              <button type="button" onClick={handleDeleteOutlet} disabled={loading} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                {loading ? "Deleting..." : "Permanently Delete Outlet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REJECT WALLET REQUEST MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Float Request</h3>
                <p className="text-xs text-slate-500">Provide reason for rejecting downline float request</p>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason *</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-rose-600"
                >
                  <option value="Deposit slip mismatch">Deposit slip mismatch</option>
                  <option value="Counter float exceeds shift limits">Counter float exceeds shift limits</option>
                  <option value="Duplicate reference claim">Duplicate reference claim</option>
                  <option value="Insufficient distributor allocation">Insufficient distributor allocation</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="button" onClick={handleRejectWallet} disabled={loading} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. BANK RECEIPT / PROOF SLIP VIEWER MODAL */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Float Request Proof Slip</h3>
                  <p className="text-xs text-slate-500">Ref: {selectedReceipt.reference_no}</p>
                </div>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Downline Outlet</div>
                  <div className="text-xs font-black text-slate-900">{selectedReceipt.requester_name || "Downline User"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Claimed Amount</div>
                  <div className="text-base font-mono font-black text-emerald-600">
                    ₹{parseFloat(selectedReceipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Payment Mode:</span>
                  <span className="font-mono font-bold text-blue-800">{selectedReceipt.payment_mode || "BANK_UTR"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Reference No:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.reference_no}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Submission Date:</span>
                  <span className="font-mono text-slate-700">{selectedReceipt.created_at?.slice(0, 19).replace('T', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Remarks / Purpose:</span>
                  <span className="text-slate-800 italic">{selectedReceipt.remarks || "Direct outlet top-up"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowReceiptModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Close</button>
              {selectedReceipt.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setSelectedReqId(selectedReceipt.id); setShowRejectModal(true); }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveWallet(selectedReceipt.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Approve & Credit ₹{parseFloat(selectedReceipt.amount || 0).toLocaleString('en-IN')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. OUTLET ACTIONS & FILINGS ACTIVITY STREAM MODAL */}
      {showOutletActivityModal && selectedOutlet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Outlet Activity & Filings Stream</h3>
                  <p className="text-xs text-slate-500">{selectedOutlet.name} ({selectedOutlet.role?.toUpperCase()}) • {selectedOutlet.email}</p>
                </div>
              </div>
              <button onClick={() => setShowOutletActivityModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Filings / Actions</span>
                <div className="text-sm font-bold text-slate-900">{outletActivities.length} Records</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                <div className="text-xs font-bold text-slate-700">{selectedOutlet.city || "Chennai"}, {selectedOutlet.state || "Tamil Nadu"}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Wallet</span>
                <div className="text-sm font-mono font-black text-blue-700">
                  ₹{parseFloat(selectedOutlet.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 pr-1">
              {loadingActivity ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Loading downline action stream...</span>
                </div>
              ) : outletActivities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  No tax filing or wallet transaction records found for this outlet.
                </div>
              ) : (
                outletActivities.map((act) => (
                  <div key={act.id || act.reference_id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                    <div className="space-y-0.5 max-w-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          act.type?.includes('CREDIT') || act.type?.includes('TOPUP') ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          act.type?.includes('DEBIT') || act.type?.includes('REGISTRATION') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {act.type}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{act.reference_id}</span>
                      </div>
                      <div className="text-slate-800 font-medium text-[11px] truncate">{act.note}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{act.date}</div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      {act.debit && parseFloat(act.debit) > 0 ? (
                        <span className="text-rose-600 font-bold">-₹{parseFloat(act.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : act.credit && parseFloat(act.credit) > 0 ? (
                        <span className="text-emerald-600 font-bold">+₹{parseFloat(act.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      <div className="text-[10px] text-slate-400 font-normal">Bal: ₹{parseFloat(act.balance || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowOutletActivityModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: EDIT ANNOUNCEMENT NOTICE (DISTRIBUTOR)                              */}
      {/* ========================================================================= */}
            {/* ========================================================================= */}
      {/* MODAL: BROADCAST NEW ANNOUNCEMENT (DISTRIBUTOR)                           */}
      {/* ========================================================================= */}
      {showCreateAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Broadcast Notice to Outlets</h3>
                  <p className="text-xs text-slate-500">Live ticker on your Retailer & Operator terminals</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAnnouncementModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                  >
                    <option value="GST">GST</option>
                    <option value="INCOME_TAX">Income Tax / ITR</option>
                    <option value="TDS">TDS / TCS</option>
                    <option value="ADVANCE_TAX">Advance Tax</option>
                    <option value="ANNOUNCEMENT">General Announcement</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="COMPLIANCE">Statutory Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urgency Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAnnouncement.urgency}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, urgency: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="URGENT">Urgent (High Priority)</option>
                    <option value="CRITICAL">Critical (Statutory Deadline)</option>
                    <option value="INFO">Informational / Incentive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g., Extended Counter Hours for GSTR-3B Due Date"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Due Date / Validity Notice
                </label>
                <input
                  type="text"
                  value={newAnnouncement.due_date}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, due_date: e.target.value })}
                  placeholder="e.g., Valid till 20th of this month"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Broadcast Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  rows={3}
                  placeholder="Provide full announcement details, incentive commissions, or store guidelines..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Broadcast to Outlets</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showEditAnnouncementModal && editingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Outlet Notice</h3>
                  <p className="text-xs text-slate-500">Update broadcast notice for downlines</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditAnnouncementModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAnnouncementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingAnnouncement.category}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                  >
                    <option value="GST">GST</option>
                    <option value="INCOME_TAX">Income Tax / ITR</option>
                    <option value="TDS">TDS / TCS</option>
                    <option value="ADVANCE_TAX">Advance Tax</option>
                    <option value="ANNOUNCEMENT">General Announcement</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="COMPLIANCE">Statutory Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urgency Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingAnnouncement.urgency}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, urgency: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="URGENT">Urgent (High Priority)</option>
                    <option value="CRITICAL">Critical (Statutory Deadline)</option>
                    <option value="INFO">Informational / Incentive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  placeholder="e.g., Extended Counter Hours for GSTR-3B Due Date"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Due Date / Validity Notice
                </label>
                <input
                  type="text"
                  value={editingAnnouncement.due_date}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, due_date: e.target.value })}
                  placeholder="e.g., Valid till 20th of this month"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Broadcast Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={editingAnnouncement.message}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                  rows={3}
                  placeholder="Provide full announcement details, incentive commissions, or store guidelines..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditAnnouncementModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CONFIGURE ROLE & DESK PERMISSIONS MODAL (TIER 2 -> TIER 3/4 RBAC) */}
      {showPermissionsModal && selectedOutletForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Tier {selectedOutletForPerms.role === 'retailer' ? '3: Retailer Outlet' : '4: Staff Operator'}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    Role Access &amp; Permissions
                  </h2>
                  <p className="text-xs text-slate-500 truncate">{selectedOutletForPerms.name} • {selectedOutletForPerms.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enabled Services &amp; Action Desks
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allKeys = [
                        "gst_registration", "itr_filing", "gstr_filing", "announcements", 
                        "vault", "staff", "service_approvals", "float_approvals", "reports"
                      ].filter(k => tenantPermissions.length === 0 || tenantPermissions.includes("all") || tenantPermissions.includes(k));
                      setOutletPermissionsList(allKeys);
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Select All Allowed
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setOutletPermissionsList(["reports"])}
                    className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                {[
                  { key: "gst_registration", label: "1. GST Registration Desk", desc: "Proprietorship, Pvt Ltd, LLP" },
                  { key: "itr_filing", label: "2. Income Tax Filing Desk", desc: "ITR-1 Individual & ITR-4 Business" },
                  { key: "gstr_filing", label: "3. GST Returns (1 & 3B)", desc: "Monthly & Quarterly compliance" },
                  { key: "service_approvals", label: "📋 Service Approvals", desc: "Verify and approve filings" },
                  { key: "float_approvals", label: "💳 Float Top-Up Approvals", desc: "Approve child wallet top-ups" },
                  { key: "staff", label: "Shop Staff Management", desc: "Create & control Tier 4 operators" },
                  { key: "vault", label: "Document Vault & AI", desc: "KYC cloud vault & OCR scanner" },
                  { key: "announcements", label: "Company Announcements", desc: "View statutory notifications" },
                  { key: "reports", label: "Store Audit Ledger", desc: "Transaction history & float logs" }
                ].map((item) => {
                  const isAllowedByDistributor = tenantPermissions.length === 0 || tenantPermissions.includes("all") || tenantPermissions.includes(item.key);
                  const isChecked = outletPermissionsList.includes(item.key) || outletPermissionsList.includes("all");

                  return (
                    <label 
                      key={item.key}
                      className={`p-3 rounded-2xl border transition-all flex items-start space-x-2.5 cursor-pointer ${
                        !isAllowedByDistributor ? "opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed" :
                        isChecked ? "bg-purple-50/80 border-purple-300 text-purple-950" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!isAllowedByDistributor}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOutletPermissionsList(prev => [...prev.filter(p => p !== "all"), item.key]);
                          } else {
                            const current = outletPermissionsList.includes("all") 
                              ? ["gst_registration", "itr_filing", "gstr_filing", "announcements", "vault", "staff", "service_approvals", "float_approvals", "reports"]
                              : outletPermissionsList;
                            setOutletPermissionsList(current.filter(p => p !== item.key && p !== "all"));
                          }
                        }}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPermissions}
                onClick={handleSaveOutletPermissions}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingPermissions ? "Saving..." : "Save Role Access"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
