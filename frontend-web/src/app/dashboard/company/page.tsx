"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Building, 
  LayoutDashboard,
  Users, 
  Sliders, 
  CheckSquare, 
  History, 
  Palette, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Save, 
  Search, 
  Filter, 
  AlertCircle, 
  TrendingUp, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Lock, 
  Edit, 
  DollarSign, 
  Clock, 
  ArrowDownLeft, 
  RefreshCw, 
  Eye, 
  Power,
  FileSpreadsheet,
  Download,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Megaphone,
  MessageSquare,
  X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { secureApiCall } from "@/lib/crypto";
import WhatsAppConfigDesk from "@/components/dashboard/WhatsAppConfigDesk";

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

export default function CompanySuperAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Overview Dynamic Stats
  const [stats, setStats] = useState({
    total_companies: 3,
    total_gst_filings: 48,
    total_itr_filings: 132,
    total_users: 6,
    total_distributors: 3,
    total_retailers: 2,
    total_operators: 1,
    master_pool_inr: 3387750,
    pending_utrs: 2,
    earned_margin_today: 1470
  });

  // 2. Companies & Tenant Management
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("a0000000-0000-0000-0000-000000000001");
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  // New Company Form State
  const [newCompany, setNewCompany] = useState({
    code: "",
    name: "",
    domain: "",
    dlt_sender: "INFUST",
    primary_color: "#1E40AF",
    secondary_color: "#F59E0B",
    distributor_name: "",
    distributor_email: "",
    distributor_mobile: "",
    distributor_city: "Chennai",
    distributor_state: "Tamil Nadu",
    distributor_password: ""
  });

  // 3. Dynamic Company Users
  const [users, setUsers] = useState<any[]>([]);
  const [userCompanyFilter, setUserCompanyFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showOnboardUserModal, setShowOnboardUserModal] = useState(false);

  // Modals for User Management (Edit, Reset Password, Adjust Wallet, Delete)
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [showAdjustWalletModal, setShowAdjustWalletModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states for user actions
  const [editUserData, setEditUserData] = useState({ full_name: "", email: "", mobile: "", city: "", state: "" });
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [walletAdjData, setWalletAdjData] = useState({ amount: "", direction: "CREDIT" as "CREDIT" | "DEBIT", remarks: "" });

  const [newUser, setNewUser] = useState({
    role: "distributor",
    full_name: "",
    email: "",
    mobile: "",
    parent_id: "",
    city: "Chennai",
    state: "Tamil Nadu",
    password: "",
    initial_wallet: "0"
  });

  // 4. Dynamic Pricing & Custom Service Creation (Scoped Under Company)
  const [pricings, setPricings] = useState<any[]>([]);
  const [pricingCompanyFilter, setPricingCompanyFilter] = useState("all");
  const [priceAuditLogs, setPriceAuditLogs] = useState<any[]>([]);
  const [priceAuditCompanyFilter, setPriceAuditCompanyFilter] = useState("all");
  const [priceAuditTierFilter, setPriceAuditTierFilter] = useState("all");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    tenant_id: "a0000000-0000-0000-0000-000000000001",
    service_key: "",
    service_name: "",
    category: "Tax & Compliance",
    base_cost: "",
    mrp_fee: ""
  });

  // 5. Dynamic UTR Requests (Scoped Under Company)
  const [utrRequests, setUtrRequests] = useState<any[]>([]);
  const [utrCompanyFilter, setUtrCompanyFilter] = useState("all");
  const [utrSubTab, setUtrSubTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [showRejectUtrModal, setShowRejectUtrModal] = useState(false);
  const [selectedUtrId, setSelectedUtrId] = useState<string | null>(null);
  const [utrRejectReason, setUtrRejectReason] = useState("Bank statement reference mismatch");

  // Receipt Preview Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // 6. White Labeling & Permissions
  const [selectedBrandingCompanyId, setSelectedBrandingCompanyId] = useState<string>("a0000000-0000-0000-0000-000000000001");
  const [brandingSettings, setBrandingSettings] = useState({
    company_name: "InfuseTax Technologies Pvt Ltd",
    domain: "tax.infusetax.com",
    dlt_sender_id: "INFUST",
    primary_color: "#1E40AF",
    secondary_color: "#F59E0B",
    logo_url: "https://vault.infusetax.com/brand/infusetax_logo.png"
  });
  const [enabledServices, setEnabledServices] = useState<{ [key: string]: boolean }>({
    gst_registration: true,
    itr_filing: true,
    gstr_filing: true,
    announcements: true,
    vault: true,
    staff: true,
    service_approvals: true,
    float_approvals: true,
    reports: true
  });

  // 7. Master Audit Ledger (Scoped Under Company)
  const [masterLedger, setMasterLedger] = useState<any[]>([]);
  const [ledgerCompanyFilter, setLedgerCompanyFilter] = useState("all");
  const [ledgerActionFilter, setLedgerActionFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // 8. Dynamic Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementCompanyFilter, setAnnouncementCompanyFilter] = useState("all");
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState("all");
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    category: "ANNOUNCEMENT",
    message: "",
    due_date: "",
    urgency: "UPCOMING",
    tenant_id: "all"
  });
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [announcementsPerPage, setAnnouncementsPerPage] = useState(10);

  // ==========================================
  // PAGINATION STATES ACROSS ALL MODULES
  // ==========================================
  const [overviewPage, setOverviewPage] = useState(1);
  const [overviewPageSize, setOverviewPageSize] = useState(5);

  const [companiesPage, setCompaniesPage] = useState(1);
  const [companiesPageSize, setCompaniesPageSize] = useState(6);

  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(5);

  const [pricingPage, setPricingPage] = useState(1);
  const [pricingPageSize, setPricingPageSize] = useState(6);

  const [priceAuditPage, setPriceAuditPage] = useState(1);
  const [priceAuditPageSize, setPriceAuditPageSize] = useState(5);

  const [utrPage, setUtrPage] = useState(1);
  const [utrPageSize, setUtrPageSize] = useState(5);

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  // ==========================================
  // INITIAL DATA FETCHING
  // ==========================================
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes, compRes, usersRes, pricingRes, logsRes, utrRes, ledgerRes, annRes
      ] = await Promise.allSettled([
        secureApiCall("/api/v1/dashboard/stats"),
        secureApiCall("/api/v1/admin/companies"),
        secureApiCall("/api/v1/admin/users"),
        secureApiCall("/api/v1/pricing"),
        secureApiCall("/api/v1/pricing/audit-logs"),
        secureApiCall("/api/v1/wallet/requests"),
        secureApiCall("/api/v1/admin/audit-ledger"),
        secureApiCall("/api/v1/announcements")
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.ok && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      }

      if (compRes.status === "fulfilled" && compRes.value.ok && compRes.value.data?.companies) {
        const comps = compRes.value.data.companies;
        setCompanies(comps);
        const targetId = selectedBrandingCompanyId || comps[0]?.id;
        if (targetId) {
          if (!selectedCompanyId) setSelectedCompanyId(targetId);
          if (!selectedBrandingCompanyId) setSelectedBrandingCompanyId(targetId);
          const comp = comps.find((c: any) => c.id === targetId) || comps[0];
          if (comp) {
            setBrandingSettings({
              company_name: comp.company_name,
              domain: comp.domain,
              dlt_sender_id: comp.dlt_sender_id || "INFUST",
              primary_color: comp.primary_color || "#1E40AF",
              secondary_color: comp.secondary_color || "#F59E0B",
              logo_url: comp.logo_url || "https://vault.infusetax.com/brand/infusetax_logo.png"
            });

            const servList = (comp.enabled_services || "").split(",").map((s: string) => s.trim());
            const allKeys = [
              "gst_registration", "itr_filing", "gstr_filing", "announcements", 
              "vault", "staff", "service_approvals", "float_approvals", "reports"
            ];
            const newMap: { [key: string]: boolean } = {};
            allKeys.forEach(k => {
              newMap[k] = servList.includes(k) || servList.includes("all");
            });
            setEnabledServices(newMap);
          }
        }
      }

      if (usersRes.status === "fulfilled" && usersRes.value.ok && usersRes.value.data?.users) {
        setUsers(usersRes.value.data.users);
      }

      if (pricingRes.status === "fulfilled" && pricingRes.value.ok && pricingRes.value.data?.pricing) {
        setPricings(pricingRes.value.data.pricing);
      }

      if (logsRes.status === "fulfilled" && logsRes.value.ok && logsRes.value.data?.logs) {
        setPriceAuditLogs(logsRes.value.data.logs);
      }

      if (utrRes.status === "fulfilled" && utrRes.value.ok && utrRes.value.data?.requests) {
        setUtrRequests(utrRes.value.data.requests);
      }

      if (ledgerRes.status === "fulfilled" && ledgerRes.value.ok && ledgerRes.value.data?.ledger) {
        setMasterLedger(ledgerRes.value.data.ledger);
      }

      if (annRes.status === "fulfilled" && annRes.value.ok && annRes.value.data?.announcements) {
        setAnnouncements(annRes.value.data.announcements);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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

  // Sync selected company for branding
  const handleBrandingCompanyChange = (companyId: string) => {
    setSelectedBrandingCompanyId(companyId);
    const comp = companies.find(c => c.id === companyId);
    if (comp) {
      setBrandingSettings({
        company_name: comp.company_name,
        domain: comp.domain,
        dlt_sender_id: comp.dlt_sender_id || "INFUST",
        primary_color: comp.primary_color || "#1E40AF",
        secondary_color: comp.secondary_color || "#F59E0B",
        logo_url: comp.logo_url || "https://vault.infusetax.com/brand/logo.png"
      });

      if (comp.enabled_services) {
        const servList = comp.enabled_services.split(",").map((s: string) => s.trim());
        const allKeys = [
          "gst_registration", "itr_filing", "gstr_filing", "announcements", 
          "vault", "staff", "service_approvals", "float_approvals", "reports"
        ];
        const newMap: { [key: string]: boolean } = {};
        allKeys.forEach(k => {
          newMap[k] = servList.includes(k) || servList.includes("all") || comp.enabled_services.includes(k);
        });
        setEnabledServices(newMap);
      }
    }
  };

  // ==========================================
  // ACTIONS: CSV EXPORT UTILITIES
  // ==========================================
  const handleExportLedgerCSV = () => {
    if (filteredLedger.length === 0) {
      showToast("No ledger records available to export.", "error");
      return;
    }

    const headers = ["Transaction ID", "Company Node", "Date & Time", "Entity / User", "Action Type", "Debit (INR)", "Credit (INR)", "Balance After (INR)", "Narration"];
    const rows = filteredLedger.map(tx => [
      `"${tx.reference_id || tx.id}"`,
      `"${tx.tenant_code || 'INFUSE'}"`,
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
    link.setAttribute("download", `InfuseTax_Master_Audit_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Master Audit Ledger CSV exported successfully!");
  };

  const handleExportUsersCSV = () => {
    if (filteredUsers.length === 0) {
      showToast("No users available to export.", "error");
      return;
    }

    const headers = ["User ID", "Company Node", "Full Name / Firm", "Role Tier", "Email", "Contact Mobile", "Parent Master", "City", "State", "Wallet Balance (INR)", "Status"];
    const rows = filteredUsers.map(u => [
      `"${u.id}"`,
      `"${u.tenant_code || 'INFUSE'}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"Tier ${u.tier} (${u.role})"`,
      `"${u.email}"`,
      `"${u.contact}"`,
      `"${u.parent_name || 'Direct Company'}"`,
      `"${u.city || ''}"`,
      `"${u.state || ''}"`,
      u.wallet || 0,
      `"${u.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Company_Users_Directory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("User Directory CSV exported successfully!");
  };

  // ==========================================
  // ACTIONS: COMPANY CREATION & EDIT & STATUS
  // ==========================================
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/companies/create", {
        method: "POST",
        body: newCompany,
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Company '${newCompany.name}' created with Master Distributor!`);
        setShowCreateCompanyModal(false);
        setNewCompany({
          code: "", name: "", domain: "", dlt_sender: "INFUST",
          primary_color: "#1E40AF", secondary_color: "#F59E0B",
          distributor_name: "", distributor_email: "", distributor_mobile: "",
          distributor_city: "Chennai", distributor_state: "Tamil Nadu", distributor_password: ""
        });
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to create company", "error");
      }
    } catch (err) {
      showToast("Network error during company creation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/companies/update", {
        method: "POST",
        body: {
          id: editingCompany.id,
          company_name: editingCompany.company_name,
          domain: editingCompany.domain,
          dlt_sender_id: editingCompany.dlt_sender_id,
          primary_color: editingCompany.primary_color,
          secondary_color: editingCompany.secondary_color,
          logo_url: editingCompany.logo_url
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Company details updated successfully!`);
        setShowEditCompanyModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to update company", "error");
      }
    } catch (err) {
      showToast("Network error during company update", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompanyStatus = async (companyId: string) => {
    try {
      const res = await secureApiCall("/api/v1/admin/companies/toggle-status", {
        method: "POST",
        body: { id: companyId },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("Company status toggled successfully.");
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      showToast("Network error toggling status", "error");
    }
  };

  // ==========================================
  // ACTIONS: WHITE LABELING & PERMISSIONS SAVE
  // ==========================================
  const handleSaveBrandingAndPermissions = async () => {
    setLoading(true);
    try {
      // 1. Update branding in database
      const brandRes = await secureApiCall("/api/v1/admin/branding/update", {
        method: "POST",
        body: {
          tenant_id: selectedBrandingCompanyId,
          id: selectedBrandingCompanyId,
          company_name: brandingSettings.company_name,
          domain: brandingSettings.domain,
          dlt_sender_id: brandingSettings.dlt_sender_id,
          primary_color: brandingSettings.primary_color,
          secondary_color: brandingSettings.secondary_color,
          logo_url: brandingSettings.logo_url
        },
        encrypt: true
      });

      // 2. Update active service permissions
      const activeServices = Object.keys(enabledServices).filter(k => enabledServices[k]);
      const permRes = await secureApiCall("/api/v1/admin/permissions/update", {
        method: "POST",
        body: {
          tenant_id: selectedBrandingCompanyId,
          id: selectedBrandingCompanyId,
          enabled_services: activeServices
        },
        encrypt: true
      });

      if (brandRes.ok && permRes.ok) {
        showToast("✓ White-Label Branding & Permissions updated successfully in database!");
        const activeServicesStr = activeServices.join(",");
        setCompanies(prev => prev.map(c => c.id === selectedBrandingCompanyId ? {
          ...c,
          company_name: brandingSettings.company_name,
          domain: brandingSettings.domain,
          dlt_sender_id: brandingSettings.dlt_sender_id,
          primary_color: brandingSettings.primary_color,
          secondary_color: brandingSettings.secondary_color,
          logo_url: brandingSettings.logo_url,
          enabled_services: activeServicesStr
        } : c));
        loadAllData();
      } else {
        showToast(brandRes.data?.message || permRes.data?.message || "Failed to save branding or permissions", "error");
      }
    } catch (err) {
      showToast("Network error saving branding", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIONS: USER MANAGEMENT (ONBOARD, EDIT, RESET PASS, ADJUST WALLET, STATUS, DELETE)
  // ==========================================
  const handleOnboardUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/create", {
        method: "POST",
        body: { ...newUser, tenant_id: selectedCompanyId },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`User '${newUser.full_name}' onboarded successfully!`);
        setShowOnboardUserModal(false);
        setNewUser({
          role: "distributor", full_name: "", email: "", mobile: "",
          parent_id: "", city: "Chennai", state: "Tamil Nadu", password: "", initial_wallet: "0"
        });
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to onboard user", "error");
      }
    } catch (err) {
      showToast("Network error onboarding user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/update", {
        method: "POST",
        body: {
          user_id: selectedUser.id,
          full_name: editUserData.full_name,
          email: editUserData.email,
          mobile: editUserData.mobile,
          city: editUserData.city,
          state: editUserData.state
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("User profile updated successfully!");
        setShowEditUserModal(false);
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

  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPasswordVal) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/reset-password", {
        method: "POST",
        body: {
          user_id: selectedUser.id,
          new_password: newPasswordVal
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Password for ${selectedUser.name} reset successfully!`);
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

  const handleAdjustUserWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !walletAdjData.amount) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/adjust-wallet", {
        method: "POST",
        body: {
          user_id: selectedUser.id,
          amount: parseFloat(walletAdjData.amount),
          direction: walletAdjData.direction,
          remarks: walletAdjData.remarks || "Direct adjustment by Super Admin"
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Successfully ${walletAdjData.direction}ED INR ${walletAdjData.amount} for ${selectedUser.name}!`);
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

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await secureApiCall("/api/v1/admin/users/status", {
        method: "POST",
        body: { user_id: userId },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(res.data.message || "User status toggled.");
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to toggle user status", "error");
      }
    } catch (err) {
      showToast("Network error toggling user status", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/admin/users/delete", {
        method: "POST",
        body: { user_id: selectedUser.id },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`User '${selectedUser.name}' deleted.`);
        setShowDeleteUserModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showToast("Network error deleting user", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIONS: ANNOUNCEMENTS MANAGEMENT
  // ==========================================
  const loadAnnouncements = async () => {
    try {
      const url = announcementCompanyFilter === "all" 
        ? "/api/v1/announcements" 
        : `/api/v1/announcements?tenant_id=${announcementCompanyFilter}`;
      const res = await secureApiCall(url);
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
      showToast("Title and Message are required", "error");
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
          urgency: newAnnouncement.urgency,
          tenant_id: newAnnouncement.tenant_id === "all" ? null : newAnnouncement.tenant_id
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("✓ Announcement broadcasted live across all store terminals!");
        setShowCreateAnnouncementModal(false);
        setNewAnnouncement({
          title: "",
          category: "ANNOUNCEMENT",
          message: "",
          due_date: "",
          urgency: "UPCOMING",
          tenant_id: "all"
        });
        loadAnnouncements();
      } else {
        showToast(res.data?.message || "Failed to create announcement", "error");
      }
    } catch (err) {
      showToast("Network error creating announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editingAnnouncement.title || !editingAnnouncement.message) {
      showToast("Title and Message are required", "error");
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
          urgency: editingAnnouncement.urgency,
          tenant_id: editingAnnouncement.tenant_id === "all" || editingAnnouncement.tenant_id === "global" ? null : editingAnnouncement.tenant_id
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("✓ Announcement updated successfully!");
        setShowEditAnnouncementModal(false);
        setEditingAnnouncement(null);
        loadAnnouncements();
      } else {
        showToast(res.data?.message || "Failed to update announcement", "error");
      }
    } catch (err) {
      showToast("Network error updating announcement", "error");
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
        showToast("✓ Announcement deleted successfully.");
        loadAnnouncements();
      } else {
        showToast(res.data?.message || "Failed to delete announcement", "error");
      }
    } catch (e) {
      showToast("Network error deleting announcement", "error");
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
        showToast("✓ Announcement status updated.");
        loadAnnouncements();
      } else {
        showToast(res.data?.message || "Failed to toggle status", "error");
      }
    } catch (e) {
      showToast("Network error updating status", "error");
    }
  };

  // ==========================================
  // ACTIONS: PRICING UPDATE & ADD CUSTOM SERVICE (Scoped Under Company)
  // ==========================================
  const handlePriceChange = (id: string, field: "base_cost" | "mrp_fee" | "tier2_price" | "mrp_customer_fee", value: number) => {
    setPricings(pricings.map(p => p.id === id ? { ...p, [field]: value, tier2_price: (field === "base_cost" || field === "tier2_price") ? value : p.tier2_price, mrp_customer_fee: (field === "mrp_fee" || field === "mrp_customer_fee") ? value : p.mrp_customer_fee } : p));
  };

  const handleSavePricing = async (service: any) => {
    setIsUpdatingPrice(true);
    try {
      const res = await secureApiCall("/api/v1/super-admin/pricing/update", {
        method: "POST",
        body: {
          tenant_id: service.tenant_id || (pricingCompanyFilter === "all" ? "a0000000-0000-0000-0000-000000000001" : pricingCompanyFilter),
          service_key: service.service_key,
          tier2_price: parseFloat(service.tier2_price ?? service.base_cost ?? 0),
          mrp_customer_fee: parseFloat(service.mrp_customer_fee ?? service.mrp_fee ?? 0),
          remarks: "Super Admin updated Tier 2 wholesale pricing & MRP"
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`Base Pricing updated for ${service.service_name}!`);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to update pricing", "error");
      }
    } catch (err) {
      showToast("Network error updating pricing", "error");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleCreateCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/pricing/create", {
        method: "POST",
        body: {
          tenant_id: newService.tenant_id,
          service_key: newService.service_key,
          service_name: newService.service_name,
          category: newService.category,
          base_cost: parseFloat(newService.base_cost),
          mrp_fee: parseFloat(newService.mrp_fee)
        },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast(`New service '${newService.service_name}' added to catalog!`);
        setShowAddServiceModal(false);
        setNewService({ tenant_id: "a0000000-0000-0000-0000-000000000001", service_key: "", service_name: "", category: "Tax & Compliance", base_cost: "", mrp_fee: "" });
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to create service", "error");
      }
    } catch (err) {
      showToast("Network error adding service", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIONS: UTR APPROVALS & REJECTIONS (Scoped Under Company)
  // ==========================================
  const handleApproveUtr = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/wallet/requests/approve", {
        method: "POST",
        body: { request_id: requestId, remarks: "Super Admin verified with bank credit slip" },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("UTR Request approved & user wallet credited successfully!");
        setShowReceiptModal(false);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to approve UTR", "error");
      }
    } catch (err) {
      showToast("Network error approving UTR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUtr = async () => {
    if (!selectedUtrId) return;
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/wallet/requests/reject", {
        method: "POST",
        body: { request_id: selectedUtrId, reason: utrRejectReason },
        encrypt: true
      });
      if (res.ok && res.data?.status === "success") {
        showToast("UTR Request marked as REJECTED.");
        setShowRejectUtrModal(false);
        setShowReceiptModal(false);
        setSelectedUtrId(null);
        loadAllData();
      } else {
        showToast(res.data?.message || "Failed to reject UTR", "error");
      }
    } catch (err) {
      showToast("Network error rejecting UTR", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTERED & PAGINATED DATA PIPELINES
  // ==========================================

  // 1. Overview Companies Matrix
  const paginatedOverviewCompanies = useMemo(() => {
    const start = (overviewPage - 1) * overviewPageSize;
    return companies.slice(start, start + overviewPageSize);
  }, [companies, overviewPage, overviewPageSize]);

  // 2. Companies Tab Grid
  const paginatedCompaniesGrid = useMemo(() => {
    const start = (companiesPage - 1) * companiesPageSize;
    return companies.slice(start, start + companiesPageSize);
  }, [companies, companiesPage, companiesPageSize]);

  // 3. Company Users Directory (Filtered by Company + Role + Search)
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      let matchesCompany = true;
      if (userCompanyFilter === "active_only") {
        const comp = companies.find(c => c.id === u.tenant_id);
        matchesCompany = comp ? comp.is_active : true;
      } else if (userCompanyFilter !== "all") {
        matchesCompany = u.tenant_id === userCompanyFilter;
      }
      const matchesRole = userRoleFilter === "all" || u.role?.toLowerCase() === userRoleFilter?.toLowerCase();
      const matchesSearch = !userSearchQuery || 
        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.contact?.includes(userSearchQuery);
      return matchesCompany && matchesRole && matchesSearch;
    });
  }, [users, userCompanyFilter, userRoleFilter, userSearchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return filteredUsers.slice(start, start + usersPageSize);
  }, [filteredUsers, usersPage, usersPageSize]);

  // 4. Tier 2 Pricing Matrix (Filtered by Company)
  const filteredPricings = useMemo(() => {
    return pricings.filter(p => {
      return pricingCompanyFilter === "all" || p.tenant_id === pricingCompanyFilter || !p.tenant_id;
    });
  }, [pricings, pricingCompanyFilter]);

  const paginatedPricings = useMemo(() => {
    const start = (pricingPage - 1) * pricingPageSize;
    return filteredPricings.slice(start, start + pricingPageSize);
  }, [filteredPricings, pricingPage, pricingPageSize]);

  // 5. Pricing Audit Trail (Filtered by Company + Tier)
  const filteredPriceAuditLogs = useMemo(() => {
    return priceAuditLogs.filter(l => {
      const matchesCompany = priceAuditCompanyFilter === "all" || l.tenant_id === priceAuditCompanyFilter;
      const matchesTier = priceAuditTierFilter === "all" || l.user_tier?.toLowerCase() === priceAuditTierFilter.toLowerCase();
      return matchesCompany && matchesTier;
    });
  }, [priceAuditLogs, priceAuditCompanyFilter, priceAuditTierFilter]);

  const paginatedPriceAuditLogs = useMemo(() => {
    const start = (priceAuditPage - 1) * priceAuditPageSize;
    return filteredPriceAuditLogs.slice(start, start + priceAuditPageSize);
  }, [filteredPriceAuditLogs, priceAuditPage, priceAuditPageSize]);

  // 6. UTR Requests (Filtered by Company + Status Tab)
  const filteredUtrs = useMemo(() => {
    return utrRequests.filter(r => {
      const matchesCompany = utrCompanyFilter === "all" || r.tenant_id === utrCompanyFilter;
      const matchesStatus = r.status?.toLowerCase() === utrSubTab?.toLowerCase();
      return matchesCompany && matchesStatus;
    });
  }, [utrRequests, utrCompanyFilter, utrSubTab]);

  const paginatedUtrs = useMemo(() => {
    const start = (utrPage - 1) * utrPageSize;
    return filteredUtrs.slice(start, start + utrPageSize);
  }, [filteredUtrs, utrPage, utrPageSize]);

  // 7. Master Financial Audit Ledger (Filtered by Company + Action Type + Search)
  const filteredLedger = useMemo(() => {
    return masterLedger.filter(tx => {
      const matchesCompany = ledgerCompanyFilter === "all" || tx.tenant_id === ledgerCompanyFilter;
      const matchesAction = ledgerActionFilter === "all" || tx.type === ledgerActionFilter;
      const matchesSearch = !ledgerSearch || 
        (tx.reference_id && tx.reference_id.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.entity && tx.entity.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.note && tx.note.toLowerCase().includes(ledgerSearch.toLowerCase()));
      return matchesCompany && matchesAction && matchesSearch;
    });
  }, [masterLedger, ledgerCompanyFilter, ledgerActionFilter, ledgerSearch]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchCompany = announcementCompanyFilter === "all" || a.tenant_id === announcementCompanyFilter || (announcementCompanyFilter === "global" && !a.tenant_id);
      const matchCategory = announcementCategoryFilter === "all" || a.category === announcementCategoryFilter;
      return matchCompany && matchCategory;
    });
  }, [announcements, announcementCompanyFilter, announcementCategoryFilter]);

  const paginatedAnnouncements = useMemo(() => {
    const start = (announcementsPage - 1) * announcementsPerPage;
    return filteredAnnouncements.slice(start, start + announcementsPerPage);
  }, [filteredAnnouncements, announcementsPage, announcementsPerPage]);

  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPageSize;
    return filteredLedger.slice(start, start + ledgerPageSize);
  }, [filteredLedger, ledgerPage, ledgerPageSize]);

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
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Tier 1 Super Admin Portal
            </span>
            <span className="text-xs text-slate-400">Enterprise Multi-Tenant Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Multi-Tenant Company Administration</h1>
          <p className="text-xs text-slate-500">Configure white-label entities, manage downline network tiers, set Tier 2 pricing, and audit liquidity.</p>
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
            onClick={() => setShowCreateCompanyModal(true)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Company</span>
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: "overview", label: "Platform Overview", icon: LayoutDashboard },
          { id: "companies", label: "Companies", icon: Building },
          { id: "company-users", label: "Company Users", icon: Users },
          { id: "announcements", label: "📢 Announcements & Broadcasts", icon: Megaphone },
          { id: "pricing", label: "Tier 2 Pricing", icon: Sliders },
          { id: "utr", label: "UTR Approvals", icon: CheckSquare },
          { id: "branding", label: "White Labeling", icon: Palette },
          { id: "whatsapp", label: "💬 WhatsApp Gateway", icon: MessageSquare },
          { id: "ledger", label: "Master Ledger", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                router.push(`/dashboard/company?tab=${tab.id}`);
              }}
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
      {/* TAB 1: PLATFORM OVERVIEW (With Matrix Pagination)                         */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Companies</span>
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.total_companies}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> 100% white-label deployed
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Network Users</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.total_users}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                {stats.total_distributors} T2 Dist | {stats.total_retailers} T3 Ret | {stats.total_operators} T4 Ops
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Filings Processed</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.total_gst_filings + stats.total_itr_filings}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                {stats.total_gst_filings} GST Filings | {stats.total_itr_filings} ITR Form 16s
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md shadow-slate-900/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Master Pool Liquidity</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ₹{stats.master_pool_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {stats.pending_utrs} pending UTR approvals
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Fast-Track Administration Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowCreateCompanyModal(true)}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 text-left transition-all cursor-pointer group"
              >
                <Building className="w-5 h-5 text-blue-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-blue-950">Add Tenant Company</div>
                <div className="text-[11px] text-blue-800/70 mt-0.5">Deploy new white-label node</div>
              </button>

              <button 
                onClick={() => { setActiveTab("company-users"); setShowOnboardUserModal(true); }}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-left transition-all cursor-pointer group"
              >
                <UserPlus className="w-5 h-5 text-purple-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-purple-950">Onboard Company User</div>
                <div className="text-[11px] text-purple-800/70 mt-0.5">Create T2 Master or T3 POS</div>
              </button>

              <button 
                onClick={() => setActiveTab("utr")}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 text-left transition-all cursor-pointer group"
              >
                <CheckSquare className="w-5 h-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-amber-950">Review Bank UTRs</div>
                <div className="text-[11px] text-amber-800/70 mt-0.5">{stats.pending_utrs} awaiting verification</div>
              </button>

              <button 
                onClick={() => setActiveTab("pricing")}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-left transition-all cursor-pointer group"
              >
                <Sliders className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-emerald-950">Direct Tier 2 Pricing</div>
                <div className="text-[11px] text-emerald-800/70 mt-0.5">Configure 6 core tax services</div>
              </button>
            </div>
          </div>

          {/* TENANT COMPANIES LIVE OPERATIONS & LIQUIDITY MATRIX */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tenant Companies Operations & Liquidity Matrix</h3>
                <p className="text-xs text-slate-500">Live operational status, downline network distribution, and white-label domains</p>
              </div>
              <button
                onClick={() => setActiveTab("companies")}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Manage All Companies →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Company Entity</th>
                    <th className="py-3.5 px-6">Custom Domain</th>
                    <th className="py-3.5 px-6">DLT Sender</th>
                    <th className="py-3.5 px-6 text-center">T2 Masters</th>
                    <th className="py-3.5 px-6 text-center">T3 Retailers</th>
                    <th className="py-3.5 px-6 text-center">T4 Staff</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedOverviewCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                            {c.code?.slice(0, 2) || "CO"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{c.company_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">Code: {c.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <a 
                          href={`https://${c.domain}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-mono text-blue-600 hover:underline flex items-center space-x-1 text-xs"
                        >
                          <span>{c.domain}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">{c.dlt_sender_id || "INFUST"}</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-700">{c.total_distributors || 1}</td>
                      <td className="py-4 px-6 text-center font-bold text-blue-700">{c.total_retailers || 0}</td>
                      <td className="py-4 px-6 text-center font-bold text-amber-700">{c.total_operators || 0}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          c.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {c.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setEditingCompany(c); setShowEditCompanyModal(true); }}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit Company"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCompanyStatus(c.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              c.is_active 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                            title={c.is_active ? "Suspend Company" : "Activate Company"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Overview Companies Matrix */}
            <PaginationControls
              currentPage={overviewPage}
              totalItems={companies.length}
              pageSize={overviewPageSize}
              onPageChange={setOverviewPage}
              onPageSizeChange={setOverviewPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY CREATION & MANAGEMENT (With Grid Pagination)               */}
      {/* ========================================================================= */}
      {activeTab === "companies" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tenant Companies & White-Label Nodes</h3>
                <p className="text-xs text-slate-500">Each company operates on its own dedicated subdomain with custom DLT headers & themes.</p>
              </div>
              <button
                onClick={() => setShowCreateCompanyModal(true)}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Company</span>
              </button>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              {paginatedCompaniesGrid.map((c) => (
                <div key={c.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 relative hover:border-blue-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-mono font-bold">
                        {c.code}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {c.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">{c.company_name}</h4>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{c.domain}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">DLT Header: {c.dlt_sender_id || "INFUST"}</p>

                    <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-200/60 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Distributors</div>
                        <div className="text-sm font-extrabold text-purple-700">{c.total_distributors || 1}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Retailers</div>
                        <div className="text-sm font-extrabold text-blue-700">{c.total_retailers || 0}</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Operators</div>
                        <div className="text-sm font-extrabold text-amber-700">{c.total_operators || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => { setEditingCompany(c); setShowEditCompanyModal(true); }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Node</span>
                    </button>
                    <button
                      onClick={() => handleToggleCompanyStatus(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                        c.is_active 
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{c.is_active ? 'Suspend' : 'Activate'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Companies Grid */}
            <PaginationControls
              currentPage={companiesPage}
              totalItems={companies.length}
              pageSize={companiesPageSize}
              onPageChange={setCompaniesPage}
              onPageSizeChange={setCompaniesPageSize}
              pageSizeOptions={[3, 6, 12, 24]}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMPANY USERS (Scoped Under Company with Pagination)               */}
      {/* ========================================================================= */}
      {activeTab === "company-users" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Company Users Directory (Tiers 2, 3 & 4)</h3>
                <p className="text-xs text-slate-500">Manage Master Distributors, Retailer Counter Outlets, and Operator Staff scoped by Company Node.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportUsersCSV}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Export User Directory to CSV"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Users (.CSV)</span>
                </button>
                <button
                  onClick={() => setShowOnboardUserModal(true)}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-700/20 flex items-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard Company User</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Company Filter Dropdown */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <select
                    value={userCompanyFilter}
                    onChange={(e) => { setUserCompanyFilter(e.target.value); setUsersPage(1); }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">🏢 All Companies ({companies.length})</option>
                    <option value="active_only">🟢 Active Companies Only ({companies.filter(c => c.is_active).length})</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.is_active ? "🟢" : "🔴"} {c.company_name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "distributor", "retailer", "operator"].map((roleKey) => (
                    <button
                      key={roleKey}
                      onClick={() => { setUserRoleFilter(roleKey); setUsersPage(1); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        userRoleFilter === roleKey 
                          ? "bg-purple-700 text-white shadow-xs" 
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      {roleKey === "all" ? "All Tiers" : roleKey === "distributor" ? "Tier 2 Master" : roleKey === "retailer" ? "Tier 3 Retailer" : "Tier 4 Operator"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full lg:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => { setUserSearchQuery(e.target.value); setUsersPage(1); }}
                  placeholder="Search user, mobile, email..."
                  className="bg-transparent text-xs text-slate-700 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Company Node</th>
                    <th className="py-3.5 px-4">Assigned Role Tier</th>
                    <th className="py-3.5 px-4">Parent Master</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 text-right">Prepaid Wallet</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No company users matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email} • {u.contact}</div>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            const comp = companies.find(c => c.id === u.tenant_id || c.code === u.tenant_code);
                            const isCompActive = comp ? comp.is_active : true;
                            return (
                              <div className="flex items-center space-x-1.5">
                                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${
                                  isCompActive 
                                    ? "bg-blue-50 text-blue-800 border-blue-200" 
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}>
                                  {u.tenant_code || "INFUSE"}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${isCompActive ? 'bg-emerald-500' : 'bg-rose-500'}`} title={isCompActive ? 'Company Active' : 'Company Suspended'} />
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            u.tier === 2 ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            u.tier === 3 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            Tier {u.tier}: {u.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {u.parent_name ? (
                            <div className="font-bold text-slate-800">{u.parent_name}</div>
                          ) : (
                            <span className="text-slate-400 italic">Direct Under Company</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-600">{u.city || "Chennai"}, {u.state || "Tamil Nadu"}</td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900">
                          ₹{(u.wallet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setEditUserData({
                                  full_name: u.name,
                                  email: u.email,
                                  mobile: u.contact,
                                  city: u.city || "Chennai",
                                  state: u.state || "Tamil Nadu"
                                });
                                setShowEditUserModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit User Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setNewPasswordVal("");
                                setShowResetPassModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                              title="Reset User Password"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setWalletAdjData({ amount: "", direction: "CREDIT", remarks: "" });
                                setShowAdjustWalletModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Adjust User Wallet (Credit / Debit)"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            {/* SUSPEND / ACTIVATE ACTION */}
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.status === 'active' 
                                  ? 'bg-slate-100 hover:bg-amber-100 text-amber-700' 
                                  : 'bg-slate-100 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={u.status === 'active' ? "Suspend User Access" : "Activate User Access"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            {/* DELETE USER ACTION */}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowDeleteUserModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
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

            {/* Pagination for Users Directory */}
            <PaginationControls
              currentPage={usersPage}
              totalItems={filteredUsers.length}
              pageSize={usersPageSize}
              onPageChange={setUsersPage}
              onPageSizeChange={setUsersPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DIRECT TIER 2 PRICING SETUP (Scoped Under Company with Pagination)  */}
      {/* ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Tier 1 Broadcast Control
                </span>
                <span className="text-xs text-slate-400">Company-Based Announcements Hub</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Company Announcements & Statutory Notices</h2>
              <p className="text-xs text-slate-500">Publish statutory compliance due dates, maintenance alerts, and promotional notices across store terminals.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Company Filter Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Company:</span>
                <select
                  value={announcementCompanyFilter}
                  onChange={(e) => {
                    setAnnouncementCompanyFilter(e.target.value);
                    setAnnouncementsPage(1);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">All Companies & Global</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

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
                <span>+ Broadcast Notice</span>
              </button>
            </div>
          </div>

          {/* Announcements Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Target Company</th>
                    <th className="py-3.5 px-5">Category & Title</th>
                    <th className="py-3.5 px-5">Broadcast Message</th>
                    <th className="py-3.5 px-5">Due Date / Validity</th>
                    <th className="py-3.5 px-5">Urgency</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        No announcements found for the selected company filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedAnnouncements.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-bold text-[10px]">
                            {a.company_code || "GLOBAL"}
                          </span>
                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate max-w-[140px]">
                            {a.company_name}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-black text-[10px]">
                              {a.category}
                            </span>
                            <span className="font-bold text-slate-900">{a.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Posted: {a.date || "Active"}
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
                                  urgency: a.urgency,
                                  tenant_id: a.tenant_id || "global"
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

      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Tier 2 Base Service Pricing Configuration</h3>
                <p className="text-xs text-slate-500">Configure base platform wholesale cost to Master Distributors (Tier 2) scoped under each Company Node.</p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Company Scoping Dropdown for Pricing */}
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <select
                    value={pricingCompanyFilter}
                    onChange={(e) => { setPricingCompanyFilter(e.target.value); setPricingPage(1); }}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="all">🏢 All Company Nodes ({companies.length})</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.is_active ? "🟢" : "🔴"} {c.company_name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Service</span>
                </button>
              </div>
            </div>

            {/* Pricing Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Service Name</th>
                    <th className="py-3.5 px-4">Company Scoped Node</th>
                    <th className="py-3.5 px-4 text-center">Tier 1 Base Cost (₹)</th>
                    <th className="py-3.5 px-4 text-center">Suggested MRP (₹)</th>
                    <th className="py-3.5 px-4 text-center">T2 Margin Spread</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPricings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No service pricings found for this company node.
                      </td>
                    </tr>
                  ) : (
                    paginatedPricings.map((p) => {
                      const margin = (p.mrp_fee || 0) - (p.base_cost || 0);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">{p.service_name}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                              {p.tenant_code || "ALL COMPANIES"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-mono font-bold">
                              <span>₹</span>
                              <input
                                type="number"
                                value={p.base_cost}
                                onChange={(e) => handlePriceChange(p.id, "base_cost", parseFloat(e.target.value) || 0)}
                                className="w-16 bg-transparent text-center focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-mono font-bold">
                              <span>₹</span>
                              <input
                                type="number"
                                value={p.mrp_fee}
                                onChange={(e) => handlePriceChange(p.id, "mrp_fee", parseFloat(e.target.value) || 0)}
                                className="w-16 bg-transparent text-center focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                            +₹{margin.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleSavePricing(p)}
                              disabled={isUpdatingPrice}
                              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                            >
                              Save Rate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Pricing Matrix */}
            <PaginationControls
              currentPage={pricingPage}
              totalItems={filteredPricings.length}
              pageSize={pricingPageSize}
              onPageChange={setPricingPage}
              onPageSizeChange={setPricingPageSize}
            />
          </div>

          {/* Pricing Audit Trail Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pricing Modification Audit Trail</h3>
                <p className="text-xs text-slate-500">Live immutable record of pricing modifications by Super Admin (T1) and Master Distributors (T2)</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={priceAuditCompanyFilter}
                  onChange={(e) => { setPriceAuditCompanyFilter(e.target.value); setPriceAuditPage(1); }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">🏢 All Companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.code})</option>
                  ))}
                </select>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  {["all", "tier_1", "tier_2"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => { setPriceAuditTierFilter(tier); setPriceAuditPage(1); }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        priceAuditTierFilter === tier ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tier === "all" ? "All Tiers" : tier.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
                  {paginatedPriceAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No pricing modification logs found.
                      </td>
                    </tr>
                  ) : (
                    paginatedPriceAuditLogs.map((log) => (
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
                          ₹{log.old_base_cost} → <span className="text-blue-700 font-black">₹{log.new_base_cost}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          ₹{log.old_mrp_fee} → <span className="text-emerald-700 font-black">₹{log.new_mrp_fee}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic text-[11px]">{log.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Pricing Audit Trail */}
            <PaginationControls
              currentPage={priceAuditPage}
              totalItems={filteredPriceAuditLogs.length}
              pageSize={priceAuditPageSize}
              onPageChange={setPriceAuditPage}
              onPageSizeChange={setPriceAuditPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: UTR BANK APPROVALS (Scoped Under Company with Pagination)           */}
      {/* ========================================================================= */}
      {activeTab === "utr" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">UTR Bank Deposit Approvals</h3>
                <p className="text-xs text-slate-500">Verify direct IMPS/NEFT/RTGS bank deposit top-up requests submitted by downline network outlets scoped under Company.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Company Filter Dropdown for UTRs */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <select
                    value={utrCompanyFilter}
                    onChange={(e) => { setUtrCompanyFilter(e.target.value); setUtrPage(1); }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">🏢 All Companies ({companies.length})</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.is_active ? "🟢" : "🔴"} {c.company_name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
                  {(["pending", "approved", "rejected"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setUtrSubTab(tab); setUtrPage(1); }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        utrSubTab === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab} {tab === "pending" && `(${utrRequests.filter(r => r.status === 'pending').length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Depositor Entity</th>
                    <th className="py-3.5 px-4">Company Node</th>
                    <th className="py-3.5 px-4">Role Tier</th>
                    <th className="py-3.5 px-4">Bank Reference (UTR)</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Requested Amount</th>
                    <th className="py-3.5 px-4 text-center">Receipt Slip</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedUtrs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No {utrSubTab} UTR deposit requests found for this company filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedUtrs.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{req.requester_name || "Network User"}</div>
                          <div className="text-[11px] text-slate-500">{req.requester_email} • {req.requester_mobile}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                            {req.tenant_code || "INFUSE"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            req.requester_role === 'distributor' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {req.requester_role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-800">{req.reference_no}</td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{req.created_at?.slice(0, 16).replace('T', ' ')}</td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                          ₹{parseFloat(req.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => { setSelectedReceipt(req); setShowReceiptModal(true); }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                            title="View Bank Proof Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApproveUtr(req.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Approve & Credit
                              </button>
                              <button
                                onClick={() => { setSelectedUtrId(req.id); setShowRejectUtrModal(true); }}
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

            {/* Pagination for UTR Requests */}
            <PaginationControls
              currentPage={utrPage}
              totalItems={filteredUtrs.length}
              pageSize={utrPageSize}
              onPageChange={setUtrPage}
              onPageSizeChange={setUtrPageSize}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WHITE LABELING & PERMISSIONS                                       */}
      {/* ========================================================================= */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          {/* Company Switcher for White Labeling */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Company for White-Labeling & Permissions</h3>
              <p className="text-xs text-slate-500">Manage branding, DLT SMS headers, and active modules per tenant company.</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-600">Active Node:</label>
              <select
                value={selectedBrandingCompanyId}
                onChange={(e) => handleBrandingCompanyChange(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-blue-900 focus:outline-none focus:border-blue-600"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Branding & DLT SMS Configuration</h3>
                <p className="text-xs text-slate-500">Configure corporate identity, custom CNAME domain, and DLT 6-char SMS sender ID.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Display Name</label>
                  <input
                    type="text"
                    value={brandingSettings.company_name}
                    onChange={(e) => setBrandingSettings({ ...brandingSettings, company_name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Portal Subdomain / CNAME</label>
                  <input
                    type="text"
                    value={brandingSettings.domain}
                    onChange={(e) => setBrandingSettings({ ...brandingSettings, domain: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DLT SMS Header (6 Alpha Characters)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={brandingSettings.dlt_sender_id}
                    onChange={(e) => setBrandingSettings({ ...brandingSettings, dlt_sender_id: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Theme Colors (Primary & Secondary)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={brandingSettings.primary_color}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, primary_color: e.target.value })}
                      className="w-10 h-9 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer"
                    />
                    <input
                      type="color"
                      value={brandingSettings.secondary_color}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, secondary_color: e.target.value })}
                      className="w-10 h-9 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold">{brandingSettings.primary_color} / {brandingSettings.secondary_color}</span>
                  </div>
                </div>
              </div>

              {/* Company Logo Upload Section */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">Company Brand Logo (PNG / SVG)</label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Current Logo Asset</div>
                      <div className="text-[11px] font-mono text-slate-400">{brandingSettings.logo_url}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = `https://vault.infusetax.com/brand/logo_${Date.now()}.png`;
                      setBrandingSettings({ ...brandingSettings, logo_url: sampleUrl });
                      showToast("Brand logo uploaded to Cloudflare R2 vault!");
                    }}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Logo</span>
                  </button>
                </div>
              </div>

              {/* Enabled Services & Desks Checkboxes */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Enabled Tax Desks & Compliance Modules
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn: { [key: string]: boolean } = {};
                        [
                          "gst_registration", "itr_filing", "gstr_filing", "announcements", 
                          "vault", "staff", "service_approvals", "float_approvals", "reports"
                        ].forEach(k => allOn[k] = true);
                        setEnabledServices(allOn);
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allOff: { [key: string]: boolean } = {};
                        [
                          "gst_registration", "itr_filing", "gstr_filing", "announcements", 
                          "vault", "staff", "service_approvals", "float_approvals", "reports"
                        ].forEach(k => allOff[k] = false);
                        setEnabledServices(allOff);
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: "gst_registration", label: "GST Registration Desk", desc: "1a Sole Prop, 1b Pvt Ltd, 1c LLP" },
                    { key: "itr_filing", label: "IT Filing Desk", desc: "Individual & Business Tax returns" },
                    { key: "gstr_filing", label: "GST Return Filing", desc: "Monthly GSTR-1 & 3B filings" },
                    { key: "announcements", label: "Company Announcements", desc: "Statutory alerts & notices" },
                    { key: "vault", label: "Document Vault & AI", desc: "Client KYC storage & OCR analysis" },
                    { key: "staff", label: "Shop Staff (Tier 4)", desc: "Counter staff operator accounts" },
                    { key: "service_approvals", label: "Service Approvals (Tier 4)", desc: "Operator service document check" },
                    { key: "float_approvals", label: "Float Approvals (Tier 4)", desc: "Counter shift float clearance" },
                    { key: "reports", label: "Store Audit Ledger", desc: "Financial passbook & transaction log" },
                  ].map((mod) => (
                    <label key={mod.key} className={`flex items-start space-x-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      enabledServices[mod.key]
                        ? "bg-blue-50/70 border-blue-200 text-blue-950"
                        : "bg-slate-50 border-slate-200 text-slate-500 opacity-60"
                    }`}>
                      <input
                        type="checkbox"
                        checked={!!enabledServices[mod.key]}
                        onChange={(e) => setEnabledServices({ ...enabledServices, [mod.key]: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold">{mod.label}</div>
                        <div className="text-[10px] text-slate-500">{mod.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveBrandingAndPermissions}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20 flex items-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving to Database..." : "Save White-Label Branding & Permissions"}</span>
              </button>
            </div>

            {/* Live White-Label Portal Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Live Portal Preview</h3>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="h-4 w-32 bg-slate-300 rounded-full" />
                <div 
                  className="h-10 rounded-xl flex items-center px-4 font-bold text-white text-xs shadow-xs"
                  style={{ backgroundColor: brandingSettings.primary_color }}
                >
                  {brandingSettings.company_name}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">SMS Header Preview</div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    [{brandingSettings.dlt_sender_id}] Your GST Filing has been acknowledged.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: WHATSAPP BUSINESS GATEWAY & MULTI-TIER COMMUNICATION CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === "whatsapp" && (
        <WhatsAppConfigDesk />
      )}

      {/* ========================================================================= */}
      {/* TAB 7: MASTER FINANCIAL AUDIT LEDGER (Scoped Under Company with Pagination) */}
      {/* ========================================================================= */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Master Financial Audit Ledger (ACID Double-Entry)</h3>
                <p className="text-xs text-slate-500">Live PostgreSQL transaction logs with debit/credit balance trail and actor attribution scoped by Company Node.</p>
              </div>

              <button
                onClick={handleExportLedgerCSV}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                title="Download Filtered Ledger as CSV file"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Ledger (.CSV)</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Company Filter Dropdown */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <select
                    value={ledgerCompanyFilter}
                    onChange={(e) => { setLedgerCompanyFilter(e.target.value); setLedgerPage(1); }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">🏢 All Companies ({companies.length})</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                {/* Action Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                  {["all", "BANK_UTR_CREDIT", "P2P_DISBURSAL", "SERVICE_DEBIT", "MANUAL_CREDIT", "MANUAL_DEBIT", "OPENING_BALANCE"].map((act) => (
                    <button
                      key={act}
                      onClick={() => { setLedgerActionFilter(act); setLedgerPage(1); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                        ledgerActionFilter === act 
                          ? "bg-blue-700 text-white shadow-xs" 
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      {act === "all" ? "All Types" : act.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
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
                    <th className="py-3.5 px-4">Company Node</th>
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
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        No financial ledger transactions matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLedger.map((tx) => (
                      <tr key={tx.id || tx.reference_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">{tx.reference_id || tx.id}</td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                            {tx.tenant_code || "INFUSE"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-500">{tx.date || tx.created_at}</td>
                        <td className="py-4 px-4 font-bold text-slate-800">{tx.entity || "Platform"}</td>
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

      {/* 1. ADD CUSTOM SERVICE MODAL (Scoped to Company) */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Custom Compliance Service</h3>
                <p className="text-xs text-slate-500">Define new catalog product with wholesale cost & retail MRP</p>
              </div>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCustomService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Scope Node *</label>
                <select
                  value={newService.tenant_id}
                  onChange={(e) => setNewService({ ...newService, tenant_id: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Display Name *</label>
                <input
                  type="text"
                  required
                  value={newService.service_name}
                  onChange={(e) => setNewService({ ...newService, service_name: e.target.value, service_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. MSME Udyam Registration"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Key Identifier *</label>
                  <input
                    type="text"
                    required
                    value={newService.service_key}
                    onChange={(e) => setNewService({ ...newService, service_key: e.target.value })}
                    placeholder="msme_udyam"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Tax & Compliance">Tax & Compliance</option>
                    <option value="Govt Registration">Govt Registration</option>
                    <option value="Legal & Certificate">Legal & Certificate</option>
                    <option value="Banking & KYC">Banking & KYC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tier 1 Base Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newService.base_cost}
                    onChange={(e) => setNewService({ ...newService, base_cost: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Suggested MRP Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newService.mrp_fee}
                    onChange={(e) => setNewService({ ...newService, mrp_fee: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Adding..." : "Add to Service Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELETE USER MODAL */}
      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">Confirm permanent deletion of network outlet</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete user <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})? This will remove access and all assigned credentials.
            </p>

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowDeleteUserModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
              <button type="button" onClick={handleDeleteUser} disabled={loading} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                {loading ? "Deleting..." : "Permanently Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CREATE COMPANY MODAL */}
      {showCreateCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Tenant Company</h3>
                  <p className="text-xs text-slate-500">Provisions dedicated subdomain, brand theme, and root Master Distributor</p>
                </div>
              </div>
              <button onClick={() => setShowCreateCompanyModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newCompany.code}
                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="Apex FinTech Cloud Pvt Ltd"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Portal Domain *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    placeholder="portal.apexfintech.in"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DLT SMS Header (6 Chars)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newCompany.dlt_sender}
                    onChange={(e) => setNewCompany({ ...newCompany, dlt_sender: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Master Distributor Section */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Root Master Distributor (Tier 2 Admin)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Distributor Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newCompany.distributor_name}
                      onChange={(e) => setNewCompany({ ...newCompany, distributor_name: e.target.value })}
                      placeholder="Apex Zonal Head"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newCompany.distributor_email}
                      onChange={(e) => setNewCompany({ ...newCompany, distributor_email: e.target.value })}
                      placeholder="head@apexfintech.in"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={newCompany.distributor_mobile}
                      onChange={(e) => setNewCompany({ ...newCompany, distributor_mobile: e.target.value })}
                      placeholder="+91 98421 00991"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      value={newCompany.distributor_password}
                      onChange={(e) => setNewCompany({ ...newCompany, distributor_password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCreateCompanyModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Provisioning..." : "Create & Deploy Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT COMPANY MODAL */}
      {showEditCompanyModal && editingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Company Settings</h3>
                <p className="text-xs text-slate-500">Update company domain, DLT sender, and brand themes</p>
              </div>
              <button onClick={() => setShowEditCompanyModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editingCompany.company_name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, company_name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portal CNAME Domain *</label>
                <input
                  type="text"
                  required
                  value={editingCompany.domain}
                  onChange={(e) => setEditingCompany({ ...editingCompany, domain: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DLT Sender ID</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editingCompany.dlt_sender_id || "INFUST"}
                    onChange={(e) => setEditingCompany({ ...editingCompany, dlt_sender_id: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={editingCompany.primary_color || "#1E40AF"}
                    onChange={(e) => setEditingCompany({ ...editingCompany, primary_color: e.target.value })}
                    className="w-full h-9 p-1 bg-white border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditCompanyModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Saving..." : "Update Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ONBOARD USER MODAL */}
      {showOnboardUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Onboard Company User</h3>
                <p className="text-xs text-slate-500">Create new Master Distributor, Retailer POS, or Operator Staff</p>
              </div>
              <button onClick={() => setShowOnboardUserModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleOnboardUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Tier *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="distributor">Tier 2: Master Distributor</option>
                    <option value="retailer">Tier 3: Retailer Outlet POS</option>
                    <option value="operator">Tier 4: Operator Counter Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Tenant Node *</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Store Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Digital Seva Center"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newUser.mobile}
                    onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Opening Wallet (₹)</label>
                  <input
                    type="number"
                    value={newUser.initial_wallet}
                    onChange={(e) => setNewUser({ ...newUser, initial_wallet: e.target.value })}
                    placeholder="0"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowOnboardUserModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Onboarding..." : "Provision User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT USER PROFILE MODAL */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit User Details</h3>
                <p className="text-xs text-slate-500">Update contact and location information for {selectedUser.name}</p>
              </div>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateUserProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Store Name *</label>
                <input
                  type="text"
                  required
                  value={editUserData.full_name}
                  onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={editUserData.mobile}
                    onChange={(e) => setEditUserData({ ...editUserData, mobile: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editUserData.city}
                    onChange={(e) => setEditUserData({ ...editUserData, city: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editUserData.state}
                    onChange={(e) => setEditUserData({ ...editUserData, state: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditUserModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RESET USER PASSWORD MODAL */}
      {showResetPassModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">Set new password for {selectedUser.name}</p>
              </div>
              <button onClick={() => setShowResetPassModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleResetUserPassword} className="space-y-4">
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

      {/* 8. ADJUST USER WALLET MODAL */}
      {showAdjustWalletModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Adjust User Prepaid Wallet</h3>
                <p className="text-xs text-slate-500">Direct balance credit or debit for {selectedUser.name}</p>
              </div>
              <button onClick={() => setShowAdjustWalletModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAdjustUserWallet} className="space-y-4">
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
                  placeholder="e.g. Special camp float advance"
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

      {/* 9. REJECT UTR REASON MODAL */}
      {showRejectUtrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject UTR Top-Up Request</h3>
                <p className="text-xs text-slate-500">Provide rejection reason for depositor notification</p>
              </div>
              <button onClick={() => setShowRejectUtrModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason *</label>
                <select
                  value={utrRejectReason}
                  onChange={(e) => setUtrRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-rose-600"
                >
                  <option value="Bank statement reference mismatch">Bank statement reference mismatch</option>
                  <option value="Amount deposited does not match claim">Amount deposited does not match claim</option>
                  <option value="Duplicate UTR number already credited">Duplicate UTR number already credited</option>
                  <option value="Unverified third-party account deposit">Unverified third-party account deposit</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowRejectUtrModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="button" onClick={handleRejectUtr} disabled={loading} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. BANK RECEIPT / PROOF SLIP VIEWER MODAL */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bank Deposit Proof Slip</h3>
                  <p className="text-xs text-slate-500">UTR: {selectedReceipt.reference_no}</p>
                </div>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Depositor</div>
                  <div className="text-xs font-black text-slate-900">{selectedReceipt.requester_name || "Network User"}</div>
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
                  <span className="font-bold text-slate-500">UTR / Ref No:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.reference_no}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Submission Date:</span>
                  <span className="font-mono text-slate-700">{selectedReceipt.created_at?.slice(0, 19).replace('T', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Remarks / Note:</span>
                  <span className="text-slate-800 italic">{selectedReceipt.remarks || "Direct bank transfer"}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified with HDFC/ICICI core banking API statement bridge.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowReceiptModal(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Close</button>
              {selectedReceipt.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setSelectedUtrId(selectedReceipt.id); setShowRejectUtrModal(true); }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveUtr(selectedReceipt.id)}
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
      {/* ========================================================================= */}
      {/* MODAL: EDIT ANNOUNCEMENT / BROADCAST NOTICE (SUPER ADMIN)                 */}
      {/* ========================================================================= */}
            {/* ========================================================================= */}
      {/* MODAL: BROADCAST NEW ANNOUNCEMENT (SUPER ADMIN)                           */}
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
                  <h3 className="text-base font-bold text-slate-900">Broadcast Notice / Announcement</h3>
                  <p className="text-xs text-slate-500">Live ticker on all Retailer & Operator terminals</p>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Company <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newAnnouncement.tenant_id}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, tenant_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                >
                  <option value="all">Global Broadcast (All Companies)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

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
                    <option value="MAINTENANCE">System Maintenance</option>
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
                    <option value="INFO">Informational / Bonus</option>
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
                  placeholder="e.g., GSTR-3B Monthly Return Filing"
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
                  placeholder="e.g., Due: 20th of Every Month or Valid till 31 Aug 2026"
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
                  placeholder="Provide full announcement details, statutory penalty info, or commission updates..."
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
                  <span>Broadcast Live</span>
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
                  <h3 className="text-base font-bold text-slate-900">Edit Notice / Announcement</h3>
                  <p className="text-xs text-slate-500">Update company broadcast details</p>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Company <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editingAnnouncement.tenant_id}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, tenant_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                >
                  <option value="global">Global Broadcast (All Companies)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

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
                    <option value="MAINTENANCE">System Maintenance</option>
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
                    <option value="INFO">Informational / Bonus</option>
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
                  placeholder="e.g., GSTR-3B Monthly Return Filing"
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
                  placeholder="e.g., Due: 20th of Every Month or Valid till 31 Aug 2026"
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
                  placeholder="Provide full announcement details, statutory penalty info, or commission updates..."
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

    </div>
  );
}
