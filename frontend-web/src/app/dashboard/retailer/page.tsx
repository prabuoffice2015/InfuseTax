"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Receipt,
  Megaphone, 
  FileSpreadsheet, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  Check, 
  ArrowRight, 
  Building, 
  Loader2,
  Scale, 
  Printer, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  QrCode, 
  Search, 
  RefreshCw, 
  Eye, 
  Sliders, 
  DollarSign, 
  TrendingUp, 
  FileCheck, 
  Users, 
  UserPlus, 
  X, 
  Clock, 
  Lock,
  CheckSquare,
  History,
  Download,
  Key,
  Shield,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Camera,
  MapPin,
  FileUp,
  Image as ImageIcon,
  Building2
} from "lucide-react";
import ReceiptModal, { ReceiptData } from "@/components/dashboard/ReceiptModal";
import AnnouncementsDesk from "@/components/dashboard/AnnouncementsDesk";
import ServiceApprovalModal, { ServiceApprovalItem } from "@/components/dashboard/ServiceApprovalModal";
import UpiQrModal from "@/components/dashboard/UpiQrModal";
import DocumentUploadVault from "@/components/dashboard/DocumentUploadVault";
import TaxCalendarTicker from "@/components/dashboard/TaxCalendarTicker";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";

export default function RetailerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDeskParam = searchParams.get("desk") || "gst_reg";

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [activeDesk, setActiveDesk] = useState<"gst_reg" | "itr" | "gstr_filing" | "announcements" | "vault" | "staff" | "approvals" | "service-approvals" | "reports">(
    (["gst_reg", "itr", "gstr_filing", "announcements", "vault", "staff", "approvals", "service-approvals", "reports"].includes(currentDeskParam) ? currentDeskParam : "gst_reg") as any
  );

  useEffect(() => {
    if (currentDeskParam && ["gst_reg", "itr", "gstr_filing", "announcements", "vault", "staff", "approvals", "service-approvals", "reports"].includes(currentDeskParam)) {
      setActiveDesk(currentDeskParam as any);
    }
  }, [currentDeskParam]);

  const switchDesk = (desk: "gst_reg" | "itr" | "gstr_filing" | "vault" | "staff" | "approvals" | "reports") => {
    setActiveDesk(desk);
    router.push(`/dashboard/retailer?desk=${desk}`);
  };

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [counterWalletBalance, setCounterWalletBalance] = useState<number>(48750.00);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tenantPermissions, setTenantPermissions] = useState<string[]>([]);

  // -------------------------------------------------------------
  // Data State: Filings, Staff, Approvals, Ledger
  // -------------------------------------------------------------
  const [filings, setFilings] = useState<ReceiptData[]>([]);
  const [operatorRequests, setOperatorRequests] = useState<any[]>([]);
  const [serviceApplications, setServiceApplications] = useState<ServiceApprovalItem[]>([]);
  const [selectedServiceApproval, setSelectedServiceApproval] = useState<ServiceApprovalItem | null>(null);
  const [selectedWalletRequest, setSelectedWalletRequest] = useState<any | null>(null);
  const [showWalletActionModal, setShowWalletActionModal] = useState<boolean>(false);
  const [walletActionRemarks, setWalletActionRemarks] = useState<string>("Cash received at store counter");
  const [walletRejectReason, setWalletRejectReason] = useState<string>("Cash not received at store counter");
  const [isProcessingWallet, setIsProcessingWallet] = useState<boolean>(false);
  const [approvalsMainTab, setApprovalsMainTab] = useState<"services" | "wallet">("services");
  const [serviceApprovalSubTab, setServiceApprovalSubTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [auditLedger, setAuditLedger] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Pagination States
  const [filingsPage, setFilingsPage] = useState<number>(1);
  const [filingsPerPage, setFilingsPerPage] = useState<number>(10);
  const [staffPage, setStaffPage] = useState<number>(1);
  const [staffPerPage, setStaffPerPage] = useState<number>(10);
  const [approvalsPage, setApprovalsPage] = useState<number>(1);
  const [approvalsPerPage, setApprovalsPerPage] = useState<number>(10);
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [ledgerPerPage, setLedgerPerPage] = useState<number>(10);

  // Staff Modals
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState<boolean>(false);
  const [showResetPassModal, setShowResetPassModal] = useState<boolean>(false);
  const [showAdjustFloatModal, setShowAdjustFloatModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  // Staff Permissions Modal State (Tier 3 -> Tier 4 RBAC)
  const [showStaffPermsModal, setShowStaffPermsModal] = useState(false);
  const [selectedStaffForPerms, setSelectedStaffForPerms] = useState<any>(null);
  const [staffPermsList, setStaffPermsList] = useState<string[]>([]);
  const [savingStaffPerms, setSavingStaffPerms] = useState(false);

  // Staff Form Inputs
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffMobile, setStaffMobile] = useState("");
  const [staffShift, setStaffShift] = useState("Morning (9 AM - 6 PM)");
  const [staffPassword, setStaffPassword] = useState("Operator@1234");
  const [isStaffSaving, setIsStaffSaving] = useState(false);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState("");
  const [staffErrorMsg, setStaffErrorMsg] = useState("");

  // Edit Staff Form
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCity, setEditCity] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Reset Password Form
  const [newPassword, setNewPassword] = useState("Operator@1234");
  const [isResettingPass, setIsResettingPass] = useState(false);

  // Adjust Float Form
  const [adjustAmount, setAdjustAmount] = useState("5000");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustRemarks, setAdjustRemarks] = useState("Shift float liquidity adjustment");
  const [isAdjustingFloat, setIsAdjustingFloat] = useState(false);

  // Approvals Filter
  const [approvalSubTab, setApprovalSubTab] = useState<"pending" | "approved" | "rejected">("pending");

  // Ledger Filter
  const [ledgerActionFilter, setLedgerActionFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Auto-redirect to first permitted desk if current desk is disabled
  useEffect(() => {
    if (tenantPermissions.length > 0 && !tenantPermissions.includes("all")) {
      const allDesks = [
        { id: "gst_reg", permKey: "gst_registration" },
        { id: "itr", permKey: "itr_filing" },
        { id: "gstr_filing", permKey: "gstr_filing" },
        { id: "announcements", permKey: "announcements" },
        { id: "vault", permKey: "vault" },
        { id: "staff", permKey: "staff" },
        { id: "service-approvals", permKey: "service_approvals" },
        { id: "approvals", permKey: "float_approvals" },
        { id: "reports", permKey: "reports" },
      ];
      const isPermitted = (permKey?: string) => !permKey || tenantPermissions.includes("all") || tenantPermissions.includes(permKey);
      const currentConfig = allDesks.find(d => d.id === activeDesk);
      if (currentConfig && !isPermitted(currentConfig.permKey)) {
        const firstVisible = allDesks.find(d => isPermitted(d.permKey));
        if (firstVisible) {
          switchDesk(firstVisible.id as any);
        }
      }
    }
  }, [tenantPermissions, activeDesk]);

  // -------------------------------------------------------------
  // CORE SERVICE 1: GST REGISTRATION (1a Sole Prop, 1b Pvt Ltd, 1c Partnership/LLP)
  // -------------------------------------------------------------
  const [gstRegType, setGstRegType] = useState<"sole_proprietorship" | "private_limited" | "partnership_llp">("sole_proprietorship");
  const [isGstSubmitting, setIsGstSubmitting] = useState(false);

  // 1a: Sole Proprietorship State (11 Fields/Uploads)
  const [spTradeName, setSpTradeName] = useState("");
  const [spPan, setSpPan] = useState("");
  const [spAadhaar, setSpAadhaar] = useState("");
  const [spMobile, setSpMobile] = useState("");
  const [spEmail, setSpEmail] = useState("");
  const [spDocs, setSpDocs] = useState<{ [key: string]: boolean }>({});

  // 1b: Private Limited State (15 Fields/Uploads)
  const [pvtCompanyName, setPvtCompanyName] = useState("");
  const [pvtCin, setPvtCin] = useState("");
  const [pvtMobile, setPvtMobile] = useState("");
  const [pvtEmail, setPvtEmail] = useState("");
  const [pvtAuthSignatory, setPvtAuthSignatory] = useState("");
  const [pvtDocs, setPvtDocs] = useState<{ [key: string]: boolean }>({});

  // 1c: Partnership / LLP State (17 Fields/Uploads)
  const [firmName, setFirmName] = useState("");
  const [firmPan, setFirmPan] = useState("");
  const [firmMobile, setFirmMobile] = useState("");
  const [firmEmail, setFirmEmail] = useState("");
  const [firmAuthSignatory, setFirmAuthSignatory] = useState("");
  const [firmDocs, setFirmDocs] = useState<{ [key: string]: boolean }>({});

  // -------------------------------------------------------------
  // CORE SERVICE 2: IT FILING (Individual & Business Person - 9 Fields)
  // -------------------------------------------------------------
  const [itFilerType, setItFilerType] = useState<"individual" | "business">("individual");
  const [itCustomerName, setItCustomerName] = useState("");
  const [itLoginUser, setItLoginUser] = useState("");
  const [itLoginPassword, setItLoginPassword] = useState("");
  const [itPan, setItPan] = useState("");
  const [itAadhaar, setItAadhaar] = useState("");
  const [itGstNo, setItGstNo] = useState("");
  const [itSsiMsme, setItSsiMsme] = useState("");
  const [itMobile, setItMobile] = useState("");
  const [itEmail, setItEmail] = useState("");
  const [itBankPeriod, setItBankPeriod] = useState("01st Apr to 31st Mar (Full Financial Year)");
  const [itDocs, setItDocs] = useState<{ [key: string]: boolean }>({});
  const [isItSubmitting, setIsItSubmitting] = useState(false);

  // -------------------------------------------------------------
  // CORE SERVICE 3: GST RETURN FILING (GSTR-1 & 3B)
  // -------------------------------------------------------------
  const [gstrReturnType, setGstrReturnType] = useState<"GSTR-3B" | "GSTR-1">("GSTR-3B");
  const [gstrGstin, setGstrGstin] = useState("33AABCT9981K1Z2");
  const [gstrPeriod, setGstrPeriod] = useState("August 2026");
  const [gstrTurnover, setGstrTurnover] = useState("450000");
  const [gstrOutputTax, setGstrOutputTax] = useState("81000");
  const [gstrItcClaim, setGstrItcClaim] = useState("64000");
  const [isGstrSubmitting, setIsGstrSubmitting] = useState(false);

  // -------------------------------------------------------------
  // LOAD INITIAL DATA
  // -------------------------------------------------------------
  const loadAllData = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingData(true);

    try {
      const [
        pRes, fRes, sRes, prRes, aRes, saRes, rRes, lRes
      ] = await Promise.allSettled([
        secureApiCall("/api/v1/auth/profile"),
        secureApiCall("/api/v1/filings/recent"),
        secureApiCall("/api/v1/retailer/operators"),
        secureApiCall("/api/v1/pricing"),
        secureApiCall("/api/v1/announcements"),
        secureApiCall("/api/v1/service-approvals/list"),
        secureApiCall("/api/v1/wallet/requests"),
        secureApiCall("/api/v1/admin/audit-ledger")
      ]);

      if (pRes.status === "fulfilled" && pRes.value.ok && pRes.value.data?.user) {
        const u = pRes.value.data.user;
        setUserProfile(u);
        if (u.wallet !== undefined && u.wallet !== null) {
          setCounterWalletBalance(parseFloat(u.wallet));
        }
        if (u.enabled_services) {
          const list = u.enabled_services.split(",").map((s: string) => s.trim());
          setTenantPermissions(list);
        }
      }

      if (fRes.status === "fulfilled" && fRes.value.ok && fRes.value.data?.filings) {
        setFilings(fRes.value.data.filings.map((f: any) => ({
          id: f.id,
          client: f.client,
          service: f.service,
          amount: parseFloat(f.amount || 0),
          comm: parseFloat(f.margin || 0),
          status: f.status,
          documents: f.documents || {},
          verified_doc_url: f.verified_doc_url,
          rejection_remarks: f.rejection_remarks,
          date: f.date || "Today",
          customerMobile: f.mobile || "+91 94432 10982",
          customerPanOrGst: f.pan || f.id
        })));
      }

      if (sRes.status === "fulfilled" && sRes.value.ok && sRes.value.data?.operators) {
        setStaffMembers(sRes.value.data.operators);
      }

      if (prRes.status === "fulfilled" && prRes.value.ok && prRes.value.data?.pricing) {
        setPricingList(prRes.value.data.pricing);
      }

      if (aRes.status === "fulfilled" && aRes.value.ok && aRes.value.data?.announcements) {
        setAnnouncements(aRes.value.data.announcements);
      }

      if (saRes.status === "fulfilled" && saRes.value.ok && saRes.value.data?.applications) {
        setServiceApplications(saRes.value.data.applications);
      }

      if (rRes.status === "fulfilled" && rRes.value.ok && rRes.value.data?.requests) {
        setOperatorRequests(rRes.value.data.requests);
      }

      if (lRes.status === "fulfilled" && lRes.value.ok && lRes.value.data?.ledger) {
        setAuditLedger(lRes.value.data.ledger);
      }
    } catch (e) {
      console.error("Error loading retailer data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleUpdate = () => loadAllData();
    window.addEventListener("infusetax_wallet_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    const interval = setInterval(loadAllData, 30000);

    return () => {
      window.removeEventListener("infusetax_wallet_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Dynamic 5-Service Price Lookup Helper
  const getServicePrice = (serviceKey: string) => {
    const p = pricingList.find((item: any) => item.service_key === serviceKey);
    return {
      tier3_price: p ? parseFloat(p.tier3_price || 0) : 0,
      mrp_customer_fee: p ? parseFloat(p.mrp_customer_fee || 0) : 0,
      tier2_price: p ? parseFloat(p.tier2_price || 0) : 0,
      service_name: p ? p.service_name : serviceKey
    };
  };

  const getCurrentGstServiceKey = (type: string) => {
    if (type === "sole_proprietorship") return "gst_reg_sole_prop";
    if (type === "private_limited") return "gst_reg_pvt_ltd";
    return "gst_reg_llp";
  };

  // -------------------------------------------------------------
  // ACTION: SUBMIT GST REGISTRATION (1a, 1b, 1c)
  // -------------------------------------------------------------
  // Strict Form Validation Helpers
  const validateGstForm = (): string | null => {
    if (gstRegType === "sole_proprietorship") {
      if (!spTradeName || spTradeName.trim().length < 2) return "Business / Trade Name is mandatory.";
      if (!spPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(spPan.trim())) return "Valid 10-digit Proprietor PAN Card is required (e.g. ABCDE1234F).";
      if (!spAadhaar || !/^\d{12}$/.test(spAadhaar.replace(/\s+/g, ""))) return "Valid 12-digit Aadhaar Card Number is required.";
      if (!spMobile || !/^\d{10}$/.test(spMobile.replace(/[^0-9]/g, "").slice(-10))) return "Valid 10-digit Mobile Number is required.";
      if (!spEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(spEmail.trim())) return "Valid Email Address is required.";

      const requiredDocs = [
        { key: "sp_pan_doc", label: "1) PAN Card (Color Copy)" },
        { key: "sp_aadhaar_doc", label: "2) Aadhaar Card (Color Copy)" },
        { key: "sp_photo", label: "3) Photo Scanned" },
        { key: "sp_signature", label: "4) Signature Scanned" },
        { key: "sp_rent_deed", label: "7) Rent Deed / Own Property Deed" },
        { key: "sp_eb_receipt", label: "8) EB Receipt of Own or Lease" },
        { key: "sp_tax_receipt", label: "9) Property Tax Receipt" },
        { key: "sp_name_board", label: "10) Front Office Name Board (2/2 Cut Out)" },
        { key: "sp_geo_photo", label: "11) Premises Geo Photo with Owner & Board" }
      ];

      for (const doc of requiredDocs) {
        if (!spDocs[doc.key]) {
          return `Please upload mandatory document: ${doc.label}`;
        }
      }
    } else if (gstRegType === "private_limited") {
      if (!pvtCompanyName || pvtCompanyName.trim().length < 2) return "Company Legal Name is mandatory.";
      if (!pvtCin || pvtCin.trim().length < 10) return "Corporate Identification Number (CIN) is required.";
      if (!pvtMobile || !/^\d{10}$/.test(pvtMobile.replace(/[^0-9]/g, "").slice(-10))) return "Valid 10-digit Company Mobile Number is required.";
      if (!pvtEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pvtEmail.trim())) return "Valid Company Email ID is required.";
      if (!pvtAuthSignatory || pvtAuthSignatory.trim().length < 2) return "Authorized Signatory Name is mandatory.";

      const requiredDocs = [
        { key: "pvt_coi", label: "1) Incorporation Certificate (COI)" },
        { key: "pvt_dir_pan", label: "2) PAN Card for Both Directors" },
        { key: "pvt_dir_aadhaar", label: "3) Aadhaar for Both Directors" },
        { key: "pvt_dir_photo", label: "4) Photo Scanned for Both Directors" },
        { key: "pvt_dir_sig", label: "5) Signature of Both Directors" },
        { key: "pvt_rent_deed", label: "8) Rental Deed / Property Deed" },
        { key: "pvt_eb_receipt", label: "9) EB Receipt of Own or Lease" },
        { key: "pvt_tax_receipt", label: "10) Property Tax Receipt" },
        { key: "pvt_geo_photo", label: "11) Premises Geo Photo with Owner & Board" },
        { key: "pvt_bank_proof", label: "13) Bank Passbook / Cheque (Company)" },
        { key: "pvt_name_board", label: "14) Front Office Name Board (2/2 Cut Out)" }
      ];

      for (const doc of requiredDocs) {
        if (!pvtDocs[doc.key]) {
          return `Please upload mandatory document: ${doc.label}`;
        }
      }
    } else if (gstRegType === "partnership_llp") {
      if (!firmName || firmName.trim().length < 2) return "Firm / LLP Name is mandatory.";
      if (!firmPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(firmPan.trim())) return "Valid 10-digit Firm PAN Card is required.";
      if (!firmMobile || !/^\d{10}$/.test(firmMobile.replace(/[^0-9]/g, "").slice(-10))) return "Valid 10-digit Firm Mobile Number is required.";
      if (!firmEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firmEmail.trim())) return "Valid Firm Email ID is required.";
      if (!firmAuthSignatory || firmAuthSignatory.trim().length < 2) return "Authorized Signatory Name is mandatory.";

      const requiredDocs = [
        { key: "firm_deed", label: "1) Partnership Deed / LLP Agreement" },
        { key: "firm_reg_cert", label: "2) Partnership Registration Certificate" },
        { key: "firm_pan_doc", label: "3) Firm PAN Card Copy" },
        { key: "firm_partner_pan", label: "4) PAN Card for Both Partners" },
        { key: "firm_partner_aadhaar", label: "5) Aadhaar for Both Partners" },
        { key: "firm_partner_photo", label: "6) Photo Scanned for Both Partners" },
        { key: "firm_partner_sig", label: "7) Signature of Both Partners" },
        { key: "firm_rent_deed", label: "10) Rental Deed / Property Deed" },
        { key: "firm_eb_receipt", label: "11) EB Receipt of Own or Lease" },
        { key: "firm_tax_receipt", label: "12) Property Tax Receipt" },
        { key: "firm_geo_photo", label: "13) Premises Geo Photo with Owner & Board" },
        { key: "firm_bank_proof", label: "15) Bank Passbook / Cheque (Firm Account)" }
      ];

      for (const doc of requiredDocs) {
        if (!firmDocs[doc.key]) {
          return `Please upload mandatory document: ${doc.label}`;
        }
      }
    }
    return null;
  };

  const validateItForm = (): string | null => {
    if (!itCustomerName || itCustomerName.trim().length < 2) return "Customer / Taxpayer Name is mandatory.";
    if (!itPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(itPan.trim())) return "Valid 10-digit PAN Number is required.";
    if (!itAadhaar || !/^\d{12}$/.test(itAadhaar.replace(/\s+/g, ""))) return "Valid 12-digit Aadhaar Card Number is required.";
    if (!itMobile || !/^\d{10}$/.test(itMobile.replace(/[^0-9]/g, "").slice(-10))) return "Valid 10-digit Mobile Number is required.";
    if (!itEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(itEmail.trim())) return "Valid Email Address is required.";

    const requiredDocs = [
      { key: "it_pan_doc", label: "3) PAN Card Scanned Copy" },
      { key: "it_aadhaar_doc", label: "4) Aadhaar Card Scanned Copy" },
      { key: "it_sb_bank", label: "9a) SB Account Statement (01 Apr - 31 Mar)" }
    ];

    for (const doc of requiredDocs) {
      if (!itDocs[doc.key]) {
        return `Please upload mandatory document: ${doc.label}`;
      }
    }
    return null;
  };

  const validateGstrForm = (): string | null => {
    if (!gstrGstin || gstrGstin.trim().length < 10) return "Valid GSTIN is required.";
    const turnoverNum = parseFloat(gstrTurnover);
    if (isNaN(turnoverNum) || turnoverNum <= 0) return "Valid positive taxable turnover amount is required.";
    return null;
  };

  const handleGstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateGstForm();
    if (valErr) {
      showToast(valErr, 'error');
      return;
    }
    setIsGstSubmitting(true);
    try {
      const token = getAuthToken();
      let trade = spTradeName;
      let panVal = spPan;
      let mobVal = spMobile;
      let emailVal = spEmail;

      if (gstRegType === "private_limited") {
        trade = pvtCompanyName;
        panVal = pvtCin;
        mobVal = pvtMobile;
        emailVal = pvtEmail;
      } else if (gstRegType === "partnership_llp") {
        trade = firmName;
        panVal = firmPan;
        mobVal = firmMobile;
        emailVal = firmEmail;
      }

      const { ok, data } = await secureApiCall("/api/v1/tax/gst-registration", {
        method: "POST",
        body: {
          reg_type: gstRegType,
          trade_name: trade || "Aadhya Enterprises",
          legal_name: trade,
          pan: panVal || "AABCT9981K",
          mobile: mobVal,
          email: emailVal,
          state: "Tamil Nadu",
          mrp_customer_fee: getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee || 1500.00,
          documents: gstRegType === "sole_proprietorship" ? spDocs : gstRegType === "private_limited" ? pvtDocs : firmDocs
        }
      });

      if (ok && data.status === "success") {
        if (data.new_wallet_bal !== undefined) {
          setCounterWalletBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: ReceiptData = {
          id: data.arn,
          client: data.trade_name,
          service: `GST Registration (${gstRegType.replace('_', ' ').toUpperCase()})`,
          amount: getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee || 1500.00,
          comm: data.earned_margin || 350,
          status: "ARN Generated",
          date: "Just now",
          customerMobile: data.mobile || "+91 94432 10982",
          customerPanOrGst: data.trade_name
        };
        setFilings(prev => [receipt, ...prev]);
        setSelectedReceipt(receipt);
        // Clear form state completely
        setSpTradeName("");
        setSpPan("");
        setSpAadhaar("");
        setSpMobile("");
        setSpEmail("");
        setSpDocs({});
        setPvtCompanyName("");
        setPvtCin("");
        setPvtMobile("");
        setPvtEmail("");
        setPvtAuthSignatory("");
        setPvtDocs({});
        setFirmName("");
        setFirmPan("");
        setFirmMobile("");
        setFirmEmail("");
        setFirmAuthSignatory("");
        setFirmDocs({});
        showToast(`✓ GST Registration submitted! ARN: ${data.arn}`);
        loadAllData();
      } else {
        showToast(data.message || "Failed to submit GST registration", "error");
      }
    } catch (err) {
      showToast("Network error submitting GST registration", "error");
    } finally {
      setIsGstSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: SUBMIT IT FILING (Individual / Business)
  // -------------------------------------------------------------
  const handleItSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateItForm();
    if (valErr) {
      showToast(valErr, 'error');
      return;
    }
    setIsItSubmitting(true);
    try {
      const token = getAuthToken();
      const { ok, data } = await secureApiCall("/api/v1/tax/it-filing", {
        method: "POST",
        body: {
          filer_type: itFilerType,
          customer_name: itCustomerName || "S. Venkatesh",
          it_login_user: itLoginUser || itPan || "BNMPS8821R",
          it_login_password: itLoginPassword || "TaxPass@2026",
          pan: itPan || "BNMPS8821R",
          aadhaar: itAadhaar || "123456789012",
          gst_no: itGstNo,
          ssi_msme: itSsiMsme,
          mobile: itMobile || "+91 94432 10982",
          email: itEmail || "client@example.com",
          bank_statements_period: itBankPeriod,
          mrp_customer_fee: getServicePrice("itr_filing").mrp_customer_fee || 800.00,
          documents: itDocs
        }
      });
      if (ok && data.status === "success") {
        if (data.new_wallet_bal !== undefined) {
          setCounterWalletBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: ReceiptData = {
          id: data.ack_number,
          client: data.customer_name,
          service: `Income Tax Filing (${itFilerType.toUpperCase()})`,
          amount: getServicePrice("itr_filing").mrp_customer_fee || 800.00,
          comm: data.earned_margin || 250,
          status: "ITR-V Generated",
          date: "Just now",
          customerMobile: data.mobile || "+91 94432 10982",
          customerPanOrGst: data.pan
        };
        setFilings(prev => [receipt, ...prev]);
        setSelectedReceipt(receipt);
        showToast(`✓ IT Filing processed! Ack: ${data.ack_number}`);
        loadAllData();
      } else {
        showToast(data.message || "Failed to submit IT filing", "error");
      }
    } catch (err) {
      showToast("Network error submitting IT filing", "error");
    } finally {
      setIsItSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION: SUBMIT GST RETURN FILING (GSTR-1 & 3B)
  // -------------------------------------------------------------
  const handleGstrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateGstrForm();
    if (valErr) {
      showToast(valErr, 'error');
      return;
    }
    setIsGstrSubmitting(true);
    try {
      const { ok, data } = await secureApiCall("/api/v1/tax/gstr-filing", {
        method: "POST",
        body: {
          return_type: gstrReturnType,
          gstin: gstrGstin,
          period: gstrPeriod,
          turnover: parseFloat(gstrTurnover),
          output_tax: parseFloat(gstrOutputTax),
          itc_claim: parseFloat(gstrItcClaim),
          mrp_customer_fee: getServicePrice("gstr_filing").mrp_customer_fee || 500.00
        }
      });
      if (ok && data.status === "success") {
        if (data.new_wallet_bal !== undefined) {
          setCounterWalletBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: ReceiptData = {
          id: data.arn,
          client: data.gstin,
          service: `${gstrReturnType} Return (${data.period})`,
          amount: getServicePrice("gstr_filing").mrp_customer_fee || 500.00,
          comm: data.earned_margin || 150,
          status: "Filed Successfully",
          date: "Just now",
          customerMobile: "+91 94432 10982",
          customerPanOrGst: data.gstin
        };
        setFilings(prev => [receipt, ...prev]);
        setSelectedReceipt(receipt);
        // Clear GSTR form state completely
        setGstrGstin("");
        setGstrTurnover("");
        setGstrOutputTax("");
        setGstrItcClaim("");
        showToast(`✓ ${gstrReturnType} filed! ARN: ${data.arn}`);
        loadAllData();
      } else {
        showToast(data.message || "Failed to file GSTR return", "error");
      }
    } catch (err) {
      showToast("Network error submitting GSTR filing", "error");
    } finally {
      setIsGstrSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // STAFF MANAGEMENT & ROLE ACCESS CONTROL (DESK=STAFF)
  const handleOpenStaffPermsModal = (staff: any) => {
    setSelectedStaffForPerms(staff);
    let perms: string[] = [];
    if (staff.permissions) {
      if (staff.permissions === "all") {
        perms = ["gst_registration", "itr_filing", "gstr_filing", "reports"];
      } else if (Array.isArray(staff.permissions)) {
        perms = staff.permissions;
      } else if (typeof staff.permissions === "string") {
        perms = staff.permissions.split(",").map((s: string) => s.trim());
      }
    } else {
      perms = ["gst_registration", "itr_filing", "gstr_filing", "reports"];
    }
    setStaffPermsList(perms);
    setShowStaffPermsModal(true);
  };

  const handleSaveStaffPerms = async () => {
    if (!selectedStaffForPerms) return;
    setSavingStaffPerms(true);
    try {
      const { ok, data } = await secureApiCall("/api/v1/retailer/permissions/update", {
        method: "POST",
        body: {
          user_id: selectedStaffForPerms.id,
          permissions: staffPermsList
        }
      });
      if (ok && data.status === "success") {
        showToast(data.message || `✓ Permissions for '${selectedStaffForPerms.name}' saved!`);
        setShowStaffPermsModal(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("infusetax_permissions_updated"));
        }
        loadAllData();
      } else {
        showToast(data.message || "Failed to save staff permissions", "error");
      }
    } catch (e) {
      showToast("Network error saving staff permissions", "error");
    } finally {
      setSavingStaffPerms(false);
    }
  };

  // -------------------------------------------------------------
  const handleOnboardStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffErrorMsg("");
    setStaffSuccessMsg("");

    if (!staffName.trim()) {
      setStaffErrorMsg("Staff full name is required.");
      return;
    }

    if (!staffEmail.trim() || !staffEmail.includes("@")) {
      setStaffErrorMsg("Please enter a valid email address.");
      return;
    }

    const cleanDigits = staffMobile.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setStaffErrorMsg("Please enter a valid 10-digit mobile number (e.g. 9844672249).");
      return;
    }

    setIsStaffSaving(true);

    try {
      const { ok, data } = await secureApiCall("/api/v1/retailer/operators/create", {
        method: "POST",
        body: {
          full_name: staffName.trim(),
          email: staffEmail.trim().toLowerCase(),
          mobile: staffMobile.trim(),
          role: "operator",
          password: staffPassword || "Operator@1234",
          city: "Store Counter",
          state: "Tamil Nadu",
          opening_balance: 0,
        }
      });

      if (ok && data?.status === "success") {
        setStaffSuccessMsg(`✓ Staff "${staffName}" added! They can now log in at /sign-in`);
        showToast(`Staff "${staffName}" added successfully!`);
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        loadAllData();
        setTimeout(() => {
          setShowStaffModal(false);
          setStaffSuccessMsg("");
          setStaffErrorMsg("");
          setStaffName("");
          setStaffEmail("");
          setStaffMobile("");
        }, 1500);
      } else {
        setStaffErrorMsg(data?.message || "Failed to add operator. Email or mobile may already exist.");
        showToast(data?.message || "Failed to add operator.", "error");
      }
    } catch (err: any) {
      setStaffErrorMsg("Network error connecting to backend.");
      showToast("Network error connecting to backend.", "error");
    } finally {
      setIsStaffSaving(false);
    }
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsEditSaving(true);

    try {
      const { ok, data } = await secureApiCall("/api/v1/admin/users/update", {
        method: "POST",
        body: {
          id: selectedStaff.id,
          full_name: editName,
          mobile: editMobile,
          city: editCity
        }
      });

      if (ok && data.status === "success") {
        showToast("✓ Staff profile updated successfully!");
        setShowEditStaffModal(false);
        loadAllData();
      } else {
        showToast(data.message || "Failed to update staff", "error");
      }
    } catch (e) {
      showToast("Network error updating staff", "error");
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsResettingPass(true);

    try {
      const { ok, data } = await secureApiCall("/api/v1/admin/users/reset-password", {
        method: "POST",
        body: {
          user_id: selectedStaff.id,
          new_password: newPassword
        }
      });

      if (ok && data.status === "success") {
        showToast(`✓ Password for ${selectedStaff.name || selectedStaff.email} reset!`);
        setShowResetPassModal(false);
      } else {
        showToast(data.message || "Failed to reset password", "error");
      }
    } catch (e) {
      showToast("Network error resetting password", "error");
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleAdjustFloatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsAdjustingFloat(true);

    try {
      const { ok, data } = await secureApiCall("/api/v1/retailer/operators/adjust-float", {
        method: "POST",
        body: {
          operator_id: selectedStaff.id,
          amount: parseFloat(adjustAmount),
          type: adjustType,
          remarks: adjustRemarks
        }
      });

      if (ok && data.status === "success") {
        showToast(`✓ Float of ₹${adjustAmount} ${adjustType === 'credit' ? 'allocated to' : 'reclaimed from'} ${selectedStaff.name}!`);
        setShowAdjustFloatModal(false);
        loadAllData();
      } else {
        showToast(data.message || "Failed to adjust float", "error");
      }
    } catch (e) {
      showToast("Network error adjusting float", "error");
    } finally {
      setIsAdjustingFloat(false);
    }
  };

  // Approvals & Ledger Pipelines
  const filteredRequests = useMemo(() => {
    return operatorRequests.filter(r => r.status?.toLowerCase() === approvalSubTab.toLowerCase());
  }, [operatorRequests, approvalSubTab]);

  const paginatedRequests = useMemo(() => {
    const start = (approvalsPage - 1) * approvalsPerPage;
    return filteredRequests.slice(start, start + approvalsPerPage);
  }, [filteredRequests, approvalsPage, approvalsPerPage]);

  const filteredLedger = useMemo(() => {
    return auditLedger.filter(tx => {
      const matchAction = ledgerActionFilter === "all" || tx.type === ledgerActionFilter;
      const matchSearch = !ledgerSearch || (tx.reference_id && tx.reference_id.toLowerCase().includes(ledgerSearch.toLowerCase())) || (tx.note && tx.note.toLowerCase().includes(ledgerSearch.toLowerCase()));
      return matchAction && matchSearch;
    });
  }, [auditLedger, ledgerActionFilter, ledgerSearch]);

  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPerPage;
    return filteredLedger.slice(start, start + ledgerPerPage);
  }, [filteredLedger, ledgerPage, ledgerPerPage]);

  const paginatedFilings = useMemo(() => {
    const start = (filingsPage - 1) * filingsPerPage;
    return filings.slice(start, start + filingsPerPage);
  }, [filings, filingsPage, filingsPerPage]);

  // Handle Wallet Float Approve / Reject
  const handleApproveWallet = async () => {
    if (!selectedWalletRequest) return;
    setIsProcessingWallet(true);
    try {
      const { ok, data } = await secureApiCall("/api/v1/wallet/requests/approve", {
        method: "POST",
        body: {
          request_id: selectedWalletRequest.id,
          remarks: walletActionRemarks
        }
      });
      if (ok && data.status === "success") {
        showToast(`✓ Shift Float of ₹${selectedWalletRequest.amount} approved and credited to ${selectedWalletRequest.requester_name || 'operator'}!`);
        setShowWalletActionModal(false);
        loadAllData();
      } else {
        showToast(data.message || "Failed to approve float request.", "error");
      }
    } catch (e) {
      showToast("Network error approving float request.", "error");
    } finally {
      setIsProcessingWallet(false);
    }
  };

  const handleRejectWallet = async () => {
    if (!selectedWalletRequest) return;
    setIsProcessingWallet(true);
    try {
      const { ok, data } = await secureApiCall("/api/v1/wallet/requests/reject", {
        method: "POST",
        body: {
          request_id: selectedWalletRequest.id,
          reason: walletRejectReason
        }
      });
      if (ok && data.status === "success") {
        showToast(`✓ Float request ${selectedWalletRequest.reference_no || selectedWalletRequest.id} rejected.`);
        setShowWalletActionModal(false);
        loadAllData();
      } else {
        showToast(data.message || "Failed to reject float request.", "error");
      }
    } catch (e) {
      showToast("Network error rejecting float request.", "error");
    } finally {
      setIsProcessingWallet(false);
    }
  };

  // Document Upload Slot Helper Component
  const DocumentSlot = ({ label, code, stateMap, setStateMap, required = true }: { label: string; code: string; stateMap: any; setStateMap: any; required?: boolean }) => {
    const isUploaded = !!stateMap[code];
    return (
      <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        isUploaded ? "bg-emerald-50/70 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300"
      }`}>
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
            isUploaded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            {isUploaded ? <Check className="w-4 h-4" /> : <FileUp className="w-3.5 h-3.5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold truncate flex items-center space-x-1.5">
              <span>{label}</span>
              {required && <span className="text-rose-500 text-[10px]">*</span>}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {isUploaded ? "✓ Scanned Color Copy Attached" : "PDF / JPG / PNG (Max 5MB)"}
            </div>
          </div>
        </div>

        <label className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0 ${
          isUploaded ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800" : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
        }`}>
          <span>{isUploaded ? "Replace" : "Upload"}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setStateMap((prev: any) => ({ ...prev, [code]: true }));
                showToast(`✓ ${label} uploaded successfully!`);
              }
            }}
          />
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Universal Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

      {/* Wallet Float Action Modal */}
      {showWalletActionModal && selectedWalletRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] uppercase rounded-full">
                  Float Clearance Action
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Approve Shift Float Request</h3>
                <p className="text-xs text-slate-500 font-mono">Ref: {selectedWalletRequest.reference_no || selectedWalletRequest.id}</p>
              </div>
              <button
                onClick={() => setShowWalletActionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-bold text-slate-900">{selectedWalletRequest.requester_name || "Counter Operator"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Method:</span>
                <span className="font-bold text-slate-900">{selectedWalletRequest.payment_mode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                <span className="text-slate-700">Requested Amount:</span>
                <span className="text-emerald-700 font-mono">₹{parseFloat(selectedWalletRequest.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Approval Clearance Remarks</label>
              <input
                type="text"
                value={walletActionRemarks}
                onChange={(e) => setWalletActionRemarks(e.target.value)}
                placeholder="Cash collected at counter / Bank UTR verified"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessingWallet}
                onClick={handleRejectWallet}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
              >
                ✕ Reject Request
              </button>
              <button
                type="button"
                disabled={isProcessingWallet}
                onClick={handleApproveWallet}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingWallet ? "Processing..." : "✓ Approve & Credit Float"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Document Verification & Approval Modal */}
      <ServiceApprovalModal item={selectedServiceApproval} onClose={() => setSelectedServiceApproval(null)} onSuccess={(msg) => { showToast(msg); loadAllData(); }} />

      {/* Instant UPI QR Modal */}
      <UpiQrModal 
        isOpen={showUpiModal} 
        onClose={() => setShowUpiModal(false)} 
        onSuccess={(amt, txn) => {
          setCounterWalletBalance(prev => prev + amt);
          setShowUpiModal(false);
          showToast(`✓ Wallet credited with ₹${amt.toLocaleString('en-IN')} (Txn: ${txn})`);
        }}
        userRole="Retailer"
      />

      {/* Live Rotating Announcements Ticker */}
      <TaxCalendarTicker />

      {/* Toast Feedback */}
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

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 text-white">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>Tier 3: Retailer Outlet POS & Citizen Seva Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {userProfile?.name || "Retailer Store POS"}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Store Location: {userProfile?.city || "Tamil Nadu"} • Company Node: <span className="text-blue-300 font-bold">{userProfile?.tenant || "INFUSE"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
            <div className="text-xs text-blue-200 font-medium">Store Working Wallet</div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
              ₹{counterWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 cursor-pointer"
            title="Refresh Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tab Switcher for 3 Core Services & 4 Utility Desks */}
      {(() => {
        const allDesks = [
          { id: "gst_reg", label: "1. GST Registration Desk", icon: Building, badge: "1a, 1b, 1c", permKey: "gst_registration" },
          { id: "itr", label: "2. IT Filing Desk", icon: FileText, badge: "Indiv & Biz", permKey: "itr_filing" },
          { id: "gstr_filing", label: "3. GST Return Filing", icon: FileSpreadsheet, badge: "GSTR-1 & 3B", permKey: "gstr_filing" },
          { id: "announcements", label: "Company Announcements", icon: Megaphone, badge: `${announcements.length} Live`, permKey: "announcements" },
          { id: "vault", label: "Document Vault & AI", icon: ShieldCheck, badge: "Cloud", permKey: "vault" },
          { id: "staff", label: "Shop Staff (Tier 4)", icon: Users, badge: `${staffMembers.length} Ops`, permKey: "staff" },
          { id: "service-approvals", label: "Service Approvals", icon: FileCheck, badge: `${serviceApplications.filter(a => a.status === 'PENDING_APPROVAL').length} Pending`, permKey: "service_approvals" },
          { id: "approvals", label: "Float Approvals", icon: CheckSquare, badge: `${operatorRequests.filter(r => r.status === 'pending').length} Pending`, permKey: "float_approvals" },
          { id: "reports", label: "Store Audit Ledger", icon: History, badge: "Audit", permKey: "reports" },
        ];

        const isPermitted = (permKey?: string) => {
          if (!permKey) return true;
          if (tenantPermissions.length === 0 || tenantPermissions.includes("all")) return true;
          return tenantPermissions.includes(permKey);
        };

        const visibleDesks = allDesks.filter(d => isPermitted(d.permKey));

        return (
          <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-thin">
            {visibleDesks.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDesk === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchDesk(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 font-mono"}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* DESK 1: GST REGISTRATION WORKFLOW (1a Sole Prop / 1b Pvt Ltd / 1c LLP)    */}
      {/* ========================================================================= */}
      {activeDesk === "gst_reg" && (
        <div className="space-y-6">
          {/* Registration Type Switcher (1a, 1b, 1c) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 max-w-2xl">
            <button
              onClick={() => setGstRegType("sole_proprietorship")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "sole_proprietorship" ? "bg-white text-blue-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1a. Sole Proprietorship (11 Items)
            </button>
            <button
              onClick={() => setGstRegType("private_limited")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "private_limited" ? "bg-white text-blue-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1b. Private Limited Co (15 Items)
            </button>
            <button
              onClick={() => setGstRegType("partnership_llp")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "partnership_llp" ? "bg-white text-blue-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1c. Partnership / LLP (17 Items)
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {gstRegType === "sole_proprietorship" ? "1a. Sole Proprietorship Color Scanned Copy" : gstRegType === "private_limited" ? "1b. Private Limited Company (Dual Director)" : "1c. Partnership Firm / LLP (Dual Partner)"}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {gstRegType === "sole_proprietorship" ? "Sole Proprietorship GST Registration Desk" : gstRegType === "private_limited" ? "Private Limited Company GST Registration Desk" : "Partnership Firm / LLP GST Registration Desk"}
                </h2>
                <p className="text-xs text-slate-500">Attach mandatory color scanned documents and submit for instant ARN assignment.</p>
              </div>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-right">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Customer MRP Fee</span>
                <div className="text-base font-black text-blue-950 font-mono">
                  ₹{getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-blue-800 font-semibold mt-0.5">
                  Wholesale Rate: ₹{getServicePrice(getCurrentGstServiceKey(gstRegType)).tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <form onSubmit={handleGstSubmit} className="space-y-6">
              {/* 1a. Sole Proprietorship Form */}
              {gstRegType === "sole_proprietorship" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Business / Trade Name *</label>
                      <input
                        type="text"
                        required
                        value={spTradeName}
                        onChange={(e) => setSpTradeName(e.target.value)}
                        placeholder="e.g., Sri Balaji Enterprises"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">1) Proprietor PAN Card *</label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={spPan}
                        onChange={(e) => setSpPan(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">2) Aadhaar Card Number *</label>
                      <input
                        type="text"
                        maxLength={12}
                        required
                        value={spAadhaar}
                        onChange={(e) => setSpAadhaar(e.target.value)}
                        placeholder="1234 5678 9012"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">5) Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={spMobile}
                        onChange={(e) => setSpMobile(e.target.value)}
                        placeholder="+91 94432 10982"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">6) Email ID *</label>
                      <input
                        type="email"
                        required
                        value={spEmail}
                        onChange={(e) => setSpEmail(e.target.value)}
                        placeholder="proprietor@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State Jurisdiction</label>
                      <select className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-bold">
                        <option>Tamil Nadu (33)</option>
                        <option>Karnataka (29)</option>
                        <option>Maharashtra (27)</option>
                        <option>Kerala (32)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Mandatory Scanned Color Copy Uploads (11 Items Checklist)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <DocumentSlot label="1) PAN Card (Color Copy)" code="sp_pan_doc" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="2) Aadhaar Card (Color Copy)" code="sp_aadhaar_doc" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="3) Photo Scanned" code="sp_photo" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="4) Signature Scanned" code="sp_signature" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="7) Rent Deed / Own Property Deed" code="sp_rent_deed" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="8) EB Receipt of Own or Lease" code="sp_eb_receipt" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="9) Property Tax Receipt" code="sp_tax_receipt" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="10) Front Office Name Board (2/2 Cut Out)" code="sp_name_board" stateMap={spDocs} setStateMap={setSpDocs} />
                      <DocumentSlot label="11) Office Premises Geo-Location Photo with Owner & Board" code="sp_geo_photo" stateMap={spDocs} setStateMap={setSpDocs} />
                    </div>
                  </div>
                </div>
              )}

              {/* 1b. Private Limited Company Form */}
              {gstRegType === "private_limited" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={pvtCompanyName}
                        onChange={(e) => setPvtCompanyName(e.target.value)}
                        placeholder="e.g., Apex Tech Solutions Pvt Ltd"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Identification (CIN) *</label>
                      <input
                        type="text"
                        required
                        value={pvtCin}
                        onChange={(e) => setPvtCin(e.target.value.toUpperCase())}
                        placeholder="U72900TN2025PTC123456"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">6) Company Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={pvtMobile}
                        onChange={(e) => setPvtMobile(e.target.value)}
                        placeholder="9844672249"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">7) Company Email ID *</label>
                      <input
                        type="email"
                        required
                        value={pvtEmail}
                        onChange={(e) => setPvtEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">15) Assign Authorized Signatory *</label>
                      <input
                        type="text"
                        required
                        value={pvtAuthSignatory}
                        onChange={(e) => setPvtAuthSignatory(e.target.value)}
                        placeholder="Director Name / DIN Number"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Mandatory Scanned Color Copy Uploads (15 Items Checklist)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <DocumentSlot label="1) Incorporation Certificate (COI)" code="pvt_coi" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="2) PAN Card for Both Directors" code="pvt_dir_pan" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="3) Aadhaar for Both Directors" code="pvt_dir_aadhaar" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="4) Photo Scanned for Both Directors" code="pvt_dir_photo" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="5) Signature of Both Directors" code="pvt_dir_sig" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="8) Rental Deed / Property Deed" code="pvt_rent_deed" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="9) EB Receipt of Own or Lease" code="pvt_eb_receipt" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="10) Property Tax Receipt (Municipal Tax)" code="pvt_tax_receipt" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="11) Premises Geo Photo with Owner & Board" code="pvt_geo_photo" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="12) MSME Registration (Udyam)" code="pvt_msme" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="13) Bank Passbook / Cancelled Cheque (Company)" code="pvt_bank_proof" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="14) Front Office Name Board (2/2 Cut Out)" code="pvt_name_board" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="15) Board Resolution for Signatory" code="pvt_board_res" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                    </div>
                  </div>
                </div>
              )}

              {/* 1c. Partnership Firm or LLP Form */}
              {gstRegType === "partnership_llp" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Firm / LLP Name *</label>
                      <input
                        type="text"
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        placeholder="e.g., Kovai Fasteners LLP"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">3) Firm PAN Card Number *</label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={firmPan}
                        onChange={(e) => setFirmPan(e.target.value.toUpperCase())}
                        placeholder="AAAFF1234K"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">8) Firm Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={firmMobile}
                        onChange={(e) => setFirmMobile(e.target.value)}
                        placeholder="+91 94432 00000"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">9) Firm Email ID *</label>
                      <input
                        type="email"
                        required
                        value={firmEmail}
                        onChange={(e) => setFirmEmail(e.target.value)}
                        placeholder="partners@firm.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">17) Assign Authorized Signatory *</label>
                      <input
                        type="text"
                        required
                        value={firmAuthSignatory}
                        onChange={(e) => setFirmAuthSignatory(e.target.value)}
                        placeholder="Managing Partner Name"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Mandatory Scanned Color Copy Uploads (17 Items Checklist)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <DocumentSlot label="1) Partnership Deed / LLP Agreement" code="firm_deed" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="2) Partnership Registration Certificate" code="firm_reg_cert" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="3) Firm PAN Card Copy" code="firm_pan_doc" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="4) PAN Card for Both Partners" code="firm_partner_pan" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="5) Aadhaar for Both Partners" code="firm_partner_aadhaar" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="6) Photo Scanned for Both Partners" code="firm_partner_photo" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="7) Signature of Both Partners" code="firm_partner_sig" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="10) Rental Deed / Property Deed" code="firm_rent_deed" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="11) EB Receipt of Own or Lease" code="firm_eb_receipt" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="12) Property Tax Receipt (Municipal Tax)" code="firm_tax_receipt" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="13) Premises Geo Photo with Owner & Board" code="firm_geo_photo" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="14) MSME Registration (Udyam)" code="firm_msme" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="15) Bank Passbook / Cheque (Firm Account)" code="firm_bank_proof" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="16) Front Office Name Board (2/2 Cut Out)" code="firm_name_board" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="17) Authorization Letter for Signatory" code="firm_auth_letter" stateMap={firmDocs} setStateMap={setFirmDocs} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isGstSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Building className="w-4 h-4" />
                  <span>{isGstSubmitting ? "Transmitting REG-01..." : `Submit GST Registration (₹${getServicePrice(getCurrentGstServiceKey(gstRegType)).tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 2: IT FILING WORKFLOW (Individual & Business Person - 9 Fields)      */}
      {/* ========================================================================= */}
      {activeDesk === "itr" && (
        <div className="space-y-6">
          {/* Filer Type Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 max-w-md">
            <button
              onClick={() => setItFilerType("individual")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                itFilerType === "individual" ? "bg-white text-emerald-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Individual Filer (ITR-1 / 2)
            </button>
            <button
              onClick={() => setItFilerType("business")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                itFilerType === "business" ? "bg-white text-emerald-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Business Person (ITR-3 / 4)
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  AY 2025-26 Income Tax Return ({itFilerType === "individual" ? "Individual" : "Business Person"})
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Income Tax (IT) Filing & Bank Statement Analysis Desk
                </h2>
                <p className="text-xs text-slate-500">Capture 9 statutory fields including IT credentials and 01st Apr to 31st Mar annual bank statements.</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Customer MRP Fee</span>
                <div className="text-base font-black text-emerald-950 font-mono">
                  ₹{getServicePrice("itr_filing").mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                  Wholesale Rate: ₹{getServicePrice("itr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <form onSubmit={handleItSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1) Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={itCustomerName}
                    onChange={(e) => setItCustomerName(e.target.value)}
                    placeholder="Full name as per PAN"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2a) IT Portal Login ID (PAN) *</label>
                  <input
                    type="text"
                    required
                    value={itLoginUser}
                    onChange={(e) => setItLoginUser(e.target.value.toUpperCase())}
                    placeholder="PAN Number or User ID"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2b) IT Portal Login Password *</label>
                  <input
                    type="password"
                    required
                    value={itLoginPassword}
                    onChange={(e) => setItLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3) PAN Card Number *</label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={itPan}
                    onChange={(e) => setItPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4) Aadhaar Card Number *</label>
                  <input
                    type="text"
                    maxLength={12}
                    required
                    value={itAadhaar}
                    onChange={(e) => setItAadhaar(e.target.value)}
                    placeholder="1234 5678 9012"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5) GST Number {itFilerType === "business" ? "*" : "(Optional)"}
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    required={itFilerType === "business"}
                    value={itGstNo}
                    onChange={(e) => setItGstNo(e.target.value.toUpperCase())}
                    placeholder="33AABCT9981K1Z2"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6) SSI / MSME Udyam No (Optional)</label>
                  <input
                    type="text"
                    value={itSsiMsme}
                    onChange={(e) => setItSsiMsme(e.target.value)}
                    placeholder="UDYAM-TN-03-0012345"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">7) Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={itMobile}
                    onChange={(e) => setItMobile(e.target.value)}
                    placeholder="+91 94432 10982"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">8) Mail ID *</label>
                  <input
                    type="email"
                    required
                    value={itEmail}
                    onChange={(e) => setItEmail(e.target.value)}
                    placeholder="taxpayer@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                  9) Bank Statements & Color Documents Upload
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <DocumentSlot label="3) PAN Card Scanned Copy" code="it_pan_doc" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="4) Aadhaar Card Scanned Copy" code="it_aadhaar_doc" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="9a) SB Account Statement (01 Apr - 31 Mar)" code="it_sb_bank" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="9b) Current Account Statement (01 Apr - 31 Mar)" code="it_ca_bank" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="6) MSME / SSI Certificate" code="it_msme_doc" stateMap={itDocs} setStateMap={setItDocs} required={false} />
                  <DocumentSlot label="Form 16 / AIS / TIS Summary" code="it_form16_doc" stateMap={itDocs} setStateMap={setItDocs} required={false} />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isItSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isItSubmitting ? "Submitting IT Return..." : `File IT Return (₹${getServicePrice("itr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 3: GST RETURN FILING (GSTR-1 & 3B)                                   */}
      {/* ========================================================================= */}
      {activeDesk === "gstr_filing" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Monthly & Quarterly Compliance
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">GSTR-1 & GSTR-3B Return Filing Desk</h2>
              <p className="text-xs text-slate-500">Auto-calculate output tax, set-off Input Tax Credit (ITC), and generate ARN receipt.</p>
            </div>
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Customer MRP Fee</span>
              <div className="text-base font-black text-indigo-950 font-mono">
                ₹{getServicePrice("gstr_filing").mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-indigo-800 font-semibold mt-0.5">
                Wholesale Rate: ₹{getServicePrice("gstr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <form onSubmit={handleGstrSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Type</label>
                <select
                  value={gstrReturnType}
                  onChange={(e) => setGstrReturnType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-bold"
                >
                  <option value="GSTR-3B">GSTR-3B (Monthly Summary & Tax Payment)</option>
                  <option value="GSTR-1">GSTR-1 (Outward Supplies Sales Invoices)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number (15-Digit) *</label>
                <input
                  type="text"
                  maxLength={15}
                  required
                  value={gstrGstin}
                  onChange={(e) => setGstrGstin(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tax Period</label>
                <select
                  value={gstrPeriod}
                  onChange={(e) => setGstrPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-bold"
                >
                  <option value="August 2026">August 2026 (Active Return Period)</option>
                  <option value="July 2026">July 2026</option>
                  <option value="Q1 FY26-27">Q1 FY26-27 (QRMP Scheme)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Taxable Outward Supplies (INR)</label>
                <input
                  type="number"
                  value={gstrTurnover}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setGstrTurnover(e.target.value);
                    setGstrOutputTax((val * 0.18).toFixed(2));
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Output Tax Liability (18% IGST)</label>
                <input
                  type="number"
                  value={gstrOutputTax}
                  onChange={(e) => setGstrOutputTax(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Eligible ITC Claim (2B Auto)</label>
                <input
                  type="number"
                  value={gstrItcClaim}
                  onChange={(e) => setGstrItcClaim(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isGstrSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isGstrSubmitting ? "Filing Return..." : `File ${gstrReturnType} & Generate ARN (₹${getServicePrice("gstr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK: COMPANY ANNOUNCEMENTS & STATUTORY NOTICES                            */}
      {/* ========================================================================= */}
      {activeDesk === "announcements" && (
        <AnnouncementsDesk
          announcements={announcements}
          loading={loadingData}
          onRefresh={loadAllData}
          userRole="retailer"
        />
      )}

      {/* ========================================================================= */}
      {/* DESK 4: DOCUMENT VAULT                                                    */}
      {/* ========================================================================= */}
      {activeDesk === "vault" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Cloudflare R2 Secure Vault
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">Enterprise Document Storage & AI Extraction</h2>
            <p className="text-xs text-slate-500">Encrypted client records, bank statements, and tax return filing attachments.</p>
          </div>
          <DocumentUploadVault />
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 5: SHOP STAFF (TIER 4 OPERATORS)                                     */}
      {/* ========================================================================= */}
      {activeDesk === "staff" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Tier 4 Counter Staff
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Store Operators & Shift Terminals</h2>
              <p className="text-xs text-slate-500">Manage counter employees, shift hours, float limits, and credentials.</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Counter Staff</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="p-3.5">Operator Name</th>
                  <th className="p-3.5">Email & Login</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5 text-right">Shift Float Balance</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {staffMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      No counter staff added yet. Click '+ Add Counter Staff' above.
                    </td>
                  </tr>
                ) : (
                  staffMembers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">{s.email}</td>
                      <td className="p-3.5">{s.contact}</td>
                      <td className="p-3.5 text-right font-black text-amber-700 font-mono">
                        ₹{(parseFloat(s.wallet || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenStaffPermsModal(s)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-[11px] inline-flex items-center space-x-1 cursor-pointer"
                          title="Configure Desk Access Permissions"
                        >
                          <Key className="w-3 h-3 text-purple-600" />
                          <span>Permissions</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setShowAdjustFloatModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px]"
                        >
                          Float
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setShowResetPassModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 text-[11px]"
                        >
                          Password
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
      {/* DESK: SERVICE APPROVALS (TIER 4 DOCUMENT VERIFICATION)                    */}
      {/* ========================================================================= */}
      {activeDesk === "service-approvals" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Tier 4 Document Verification Desk
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Operator Filing Verification & Approvals</h2>
              <p className="text-xs text-slate-500">Inspect scanned color documents, approve with verified proof upload, or reject with mandatory remarks.</p>
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
                  <th className="p-3.5">Operator Staff</th>
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
                      No {serviceApprovalSubTab} service applications found.
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
                        <td className="p-3.5 font-medium text-slate-700">{app.operator_name || "Store Operator"}</td>
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
      {/* DESK 6: FLOAT APPROVALS (TIER 4 SHIFT FLOAT CLEARANCE)                    */}
      {/* ========================================================================= */}
      {activeDesk === "approvals" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Counter Float Clearance
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Operator Float Requests & Approvals</h2>
              <p className="text-xs text-slate-500">Approve counter shift float requirements submitted by Tier 4 operators.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {(["pending", "approved", "rejected"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setApprovalSubTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    approvalSubTab === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab} ({operatorRequests.filter(r => r.status === tab).length})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="p-3.5">Reference / ID</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Requested Time</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                      No {approvalSubTab} requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-[11px] text-blue-700">{r.reference_no || r.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{r.requester_name || "Counter Operator"}</td>
                      <td className="p-3.5 font-mono text-[11px]">{r.payment_mode}</td>
                      <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                        ₹{(parseFloat(r.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : r.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{r.date || "Today"}</td>
                      <td className="p-3.5 text-center">
                        {r.status === 'pending' ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedWalletRequest(r);
                                setShowWalletActionModal(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWalletRequest(r);
                                setShowWalletActionModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        )}
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
      {/* DESK 7: STORE AUDIT LEDGER                                                */}
      {/* ========================================================================= */}
      {activeDesk === "reports" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Financial Audit Trail
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Store Double-Entry Audit Ledger</h2>
              <p className="text-xs text-slate-500">Immutable record of service debits, operator float allocations, and margin earnings.</p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search reference or naration..."
                className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="p-3.5">Reference ID</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5 text-right">Balance After</th>
                  <th className="p-3.5">Narration</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {paginatedLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      No ledger records found.
                    </td>
                  </tr>
                ) : (
                  paginatedLedger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{tx.reference_id}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold font-mono">
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-600">
                        -₹{(parseFloat(tx.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        ₹{(parseFloat(tx.balance_after || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600">{tx.note}</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{tx.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIVERSAL RECENT SHIFT FILINGS TABLE (Visible on Filing Desks)            */}
      {/* ========================================================================= */}
      {["gst_reg", "itr", "gstr_filing"].includes(activeDesk) && (
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Store Filings Feed & Tax Invoices ({filings.length})</span>
              </h2>
              <p className="text-xs text-slate-500">Live transaction stream with instant customer receipt printing.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="p-3.5">Transaction / ARN</th>
                  <th className="p-3.5">Citizen Customer</th>
                  <th className="p-3.5">Service Name</th>
                  <th className="p-3.5 text-right">Fee (₹)</th>
                  <th className="p-3.5 text-right">Margin Earned (₹)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {paginatedFilings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                      No filings submitted in this shift yet.
                    </td>
                  </tr>
                ) : (
                  paginatedFilings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-[11px] text-blue-700">{f.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{f.client}</div>
                        <div className="text-[11px] text-slate-400">{f.date}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{f.service}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900 font-mono">
                        ₹{f.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600 font-mono">
                        +₹{f.comm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedServiceApproval({
                              id: f.id,
                              service_category: f.service?.toLowerCase().includes("income") ? "itr" : "gst",
                              arn: f.id,
                              client_name: f.client,
                              entity_type: f.service,
                              pan: f.customerPanOrGst || "N/A",
                              amount: f.amount,
                              status: f.status,
                              documents: f.documents || {},
                              verified_doc_url: f.verified_doc_url,
                              rejection_remarks: f.rejection_remarks,
                              submitted_at: f.date
                            })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer"
                            title="Inspect Attached Documents"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Docs</span>
                          </button>
                          <button
                            onClick={() => setSelectedReceipt(f)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          {f.verified_doc_url && (
                            <button
                              type="button"
                              onClick={() => setSelectedServiceApproval({
                                id: f.id,
                                service_category: f.service?.toLowerCase().includes("income") ? "itr" : "gst",
                                arn: f.id,
                                client_name: f.client,
                                entity_type: f.service,
                                pan: f.customerPanOrGst || "N/A",
                                amount: f.amount,
                                status: f.status,
                                documents: f.documents || {},
                                verified_doc_url: f.verified_doc_url,
                                rejection_remarks: f.rejection_remarks,
                                submitted_at: f.date
                              })}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer flex items-center space-x-1"
                              title="View Verified Certificate & Proof"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              <span>Proof</span>
                            </button>
                          )}
                        </div>
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
      {/* MODALS: ADD STAFF, EDIT STAFF, RESET PASS, ADJUST FLOAT                   */}
      {/* ========================================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Counter Staff</h3>
                  <p className="text-xs text-slate-500">Provision Tier 4 store operator</p>
                </div>
              </div>
              <button onClick={() => setShowStaffModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2.5 text-xs text-rose-700 font-bold animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{staffErrorMsg}</span>
              </div>
            )}

            {staffSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                {staffSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleOnboardStaff} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g., K. Vignesh"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email ID (Login Username) *</label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="staff@store.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={staffMobile}
                    onChange={(e) => setStaffMobile(e.target.value)}
                    placeholder="9844672249"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowStaffModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" disabled={isStaffSaving} className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md">
                    {isStaffSaving ? "Adding..." : "Add Staff"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showAdjustFloatModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Adjust Float: {selectedStaff.name}</h3>
              <button onClick={() => setShowAdjustFloatModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustFloatSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="credit">Credit / Add Float to Staff</option>
                  <option value="debit">Debit / Reclaim Float from Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (INR) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-black font-mono bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAdjustFloatModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={isAdjustingFloat} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md">
                  {isAdjustingFloat ? "Adjusting..." : "Update Float"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPassModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Reset Password: {selectedStaff.name}</h3>
              <button onClick={() => setShowResetPassModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowResetPassModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={isResettingPass} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md">
                  {isResettingPass ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE TIER 4 STAFF ROLE ACCESS & PERMISSIONS MODAL */}
      {showStaffPermsModal && selectedStaffForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Tier 4 Counter Staff
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    Staff Desk Permissions
                  </h2>
                  <p className="text-xs text-slate-500 truncate">{selectedStaffForPerms.name} • {selectedStaffForPerms.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStaffPermsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Permitted Counter Desks
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const allowed = ["gst_registration", "itr_filing", "gstr_filing", "reports"].filter(k => tenantPermissions.length === 0 || tenantPermissions.includes("all") || tenantPermissions.includes(k));
                    setStaffPermsList(allowed);
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Select All Allowed
                </button>
              </div>

              {/* Checkbox List */}
              <div className="space-y-2.5">
                {[
                  { key: "gst_registration", label: "1. GST Registration Desk", desc: "Allow filing 1a Sole Prop, 1b Pvt Ltd, 1c LLP" },
                  { key: "itr_filing", label: "2. Income Tax Filing Desk", desc: "Allow filing Individual & Business IT returns" },
                  { key: "gstr_filing", label: "3. GST Return Filing", desc: "Allow filing GSTR-1 & GSTR-3B statements" },
                  { key: "reports", label: "4. Shift Wallet Report", desc: "Allow viewing shift transaction logs & float audit" }
                ].map((item) => {
                  const isAllowedByRetailer = tenantPermissions.length === 0 || tenantPermissions.includes("all") || tenantPermissions.includes(item.key);
                  const isChecked = staffPermsList.includes(item.key) || staffPermsList.includes("all");

                  return (
                    <label 
                      key={item.key}
                      className={`p-3 rounded-2xl border transition-all flex items-start space-x-2.5 cursor-pointer ${
                        !isAllowedByRetailer ? "opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed" :
                        isChecked ? "bg-purple-50/80 border-purple-300 text-purple-950" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!isAllowedByRetailer}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStaffPermsList(prev => [...prev.filter(p => p !== "all"), item.key]);
                          } else {
                            const current = staffPermsList.includes("all") 
                              ? ["gst_registration", "itr_filing", "gstr_filing", "reports"]
                              : staffPermsList;
                            setStaffPermsList(current.filter(p => p !== item.key && p !== "all"));
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
                onClick={() => setShowStaffPermsModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingStaffPerms}
                onClick={handleSaveStaffPerms}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingStaffPerms ? "Saving..." : "Save Staff Permissions"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
