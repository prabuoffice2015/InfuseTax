"use client";

import AnnouncementsDesk from "@/components/dashboard/AnnouncementsDesk";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Terminal,
  Search,
  Megaphone, 
  Receipt, 
  FileSpreadsheet, 
  Clock, 
  Printer, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Wallet,
  Plus,
  History,
  Building,
  Loader2,
  Sparkles,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Scale,
  FileText,
  Building2,
  ShieldCheck,
  Send,
  UploadCloud,
  FileUp,
  Eye
} from "lucide-react";
import ReceiptModal, { ReceiptData } from "@/components/dashboard/ReceiptModal";
import ServiceApprovalModal, { ServiceApprovalItem } from "@/components/dashboard/ServiceApprovalModal";
import TaxCalendarTicker from "@/components/dashboard/TaxCalendarTicker";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";

export default function OperatorTerminalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDeskParam = searchParams.get("desk") || "gst_reg";

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeDesk, setActiveDesk] = useState<"gst_reg" | "itr" | "gstr_filing" | "reports">(
    (["gst_reg", "itr", "gstr_filing", "reports"].includes(currentDeskParam) ? currentDeskParam : "gst_reg") as any
  );

  useEffect(() => {
    if (currentDeskParam && ["gst_reg", "itr", "gstr_filing", "reports"].includes(currentDeskParam)) {
      setActiveDesk(currentDeskParam as any);
    }
  }, [currentDeskParam]);

  const switchDesk = (desk: "gst_reg" | "itr" | "gstr_filing" | "reports") => {
    setActiveDesk(desk);
    router.push(`/dashboard/operator?desk=${desk}`);
  };

  const [counterBalance, setCounterBalance] = useState(20400.00);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tenantPermissions, setTenantPermissions] = useState<string[]>([]);

  // Request Float Modal State
  const [showRequestFloatModal, setShowRequestFloatModal] = useState(false);
  const [floatAmount, setFloatAmount] = useState("5000");
  const [floatMode, setFloatMode] = useState("CASH_COUNTER");
  const [floatRef, setFloatRef] = useState("");
  const [floatRemarks, setFloatRemarks] = useState("Counter shift float top-up");
  const [isRequestingFloat, setIsRequestingFloat] = useState(false);
  const [floatSuccessMsg, setFloatSuccessMsg] = useState("");

  // Universal Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ServiceApprovalItem | null>(null);
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Auto-redirect to first permitted desk if current desk is disabled
  useEffect(() => {
    if (tenantPermissions.length > 0 && !tenantPermissions.includes("all")) {
      const permMap: Record<string, string> = {
        "gst_reg": "gst_registration",
        "itr": "itr_filing",
        "gstr_filing": "gstr_filing",
        "reports": "reports"
      };
      const requiredPerm = permMap[activeDesk];
      if (requiredPerm && !tenantPermissions.includes(requiredPerm)) {
        const allDesks = ["gst_reg", "itr", "gstr_filing", "reports"] as const;
        const firstVisible = allDesks.find(d => tenantPermissions.includes(permMap[d]));
        if (firstVisible) {
          switchDesk(firstVisible);
        }
      }
    }
  }, [tenantPermissions, activeDesk]);

  // -------------------------------------------------------------
  // CORE SERVICE 1: GST REGISTRATION STATE (1a, 1b, 1c)
  // -------------------------------------------------------------
  const [gstRegType, setGstRegType] = useState<"sole_proprietorship" | "private_limited" | "partnership_llp">("sole_proprietorship");
  
  // 1a: Sole Prop
  const [spTradeName, setSpTradeName] = useState("");
  const [spPan, setSpPan] = useState("");
  const [spAadhaar, setSpAadhaar] = useState("");
  const [spMobile, setSpMobile] = useState("");
  const [spEmail, setSpEmail] = useState("");
  const [spDocs, setSpDocs] = useState<{ [key: string]: boolean }>({});

  // 1b: Private Limited
  const [pvtCompanyName, setPvtCompanyName] = useState("");
  const [pvtCin, setPvtCin] = useState("");
  const [pvtMobile, setPvtMobile] = useState("");
  const [pvtEmail, setPvtEmail] = useState("");
  const [pvtAuthSignatory, setPvtAuthSignatory] = useState("");
  const [pvtDocs, setPvtDocs] = useState<{ [key: string]: boolean }>({});

  // 1c: Partnership / LLP
  const [firmName, setFirmName] = useState("");
  const [firmPan, setFirmPan] = useState("");
  const [firmMobile, setFirmMobile] = useState("");
  const [firmEmail, setFirmEmail] = useState("");
  const [firmAuthSignatory, setFirmAuthSignatory] = useState("");
  const [firmDocs, setFirmDocs] = useState<{ [key: string]: boolean }>({});

  // -------------------------------------------------------------
  // CORE SERVICE 2: IT FILING STATE (Individual & Business)
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

  // -------------------------------------------------------------
  // CORE SERVICE 3: GST RETURN FILING STATE (GSTR-1 & 3B)
  // -------------------------------------------------------------
  const [gstrReturnType, setGstrReturnType] = useState<"GSTR-3B" | "GSTR-1">("GSTR-3B");
  const [gstrGstin, setGstrGstin] = useState("33AABCT9981K1Z2");
  const [gstrPeriod, setGstrPeriod] = useState("August 2026");
  const [gstrTurnover, setGstrTurnover] = useState("450000");
  const [gstrOutputTax, setGstrOutputTax] = useState("81000");
  const [gstrItcClaim, setGstrItcClaim] = useState("64000");

  // Shift Filings Data
  const [shiftFilings, setShiftFilings] = useState<any[]>([]);

  // Shift Audit Ledger & Wallet Transactions State
  const [auditLedger, setAuditLedger] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPerPage, setLedgerPerPage] = useState(10);
  const [ledgerActionFilter, setLedgerActionFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const loadOperatorData = async () => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingData(true);

    try {
      // Dynamic 5-Service Pricing Matrix
      const { ok: prOk, data: priceData } = await secureApiCall("/api/v1/pricing");
      if (prOk && priceData.pricing) {
        setPricingList(priceData.pricing);
      }

      // Dynamic Announcements
      const { ok: aOk, data: annData } = await secureApiCall("/api/v1/announcements");
      if (aOk && annData.announcements) {
        setAnnouncements(annData.announcements);
      }

      const [
        pRes, lRes, fRes
      ] = await Promise.allSettled([
        secureApiCall("/api/v1/auth/profile"),
        secureApiCall("/api/v1/admin/audit-ledger"),
        secureApiCall("/api/v1/filings/recent")
      ]);

      if (pRes.status === "fulfilled" && pRes.value.ok && pRes.value.data?.user) {
        const u = pRes.value.data.user;
        setUserProfile(u);
        if (u.wallet !== undefined && u.wallet !== null) {
          setCounterBalance(parseFloat(u.wallet));
        }
      }

      if (lRes.status === "fulfilled" && lRes.value.ok && lRes.value.data?.ledger) {
        setAuditLedger(lRes.value.data.ledger);
      }

      if (fRes.status === "fulfilled" && fRes.value.ok && fRes.value.data?.filings) {
        setShiftFilings(fRes.value.data.filings.map((f: any) => ({
          id: f.id,
          customer: f.client,
          service: f.service,
          fee: parseFloat(f.amount || 0),
          status: f.status,
          documents: f.documents || {},
          verified_doc_url: f.verified_doc_url,
          rejection_remarks: f.rejection_remarks,
          time: f.date || "Today",
          mobile: f.mobile || "+91 98765 00004",
          pan: f.pan || f.id
        })));
      }
    } catch (e) {
      console.error("Error loading operator terminal:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadOperatorData();

    const handleUpdate = () => loadOperatorData();
    window.addEventListener("infusetax_wallet_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    const interval = setInterval(loadOperatorData, 30000);

    return () => {
      window.removeEventListener("infusetax_wallet_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Request Float Submission
  const handleRequestFloatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingFloat(true);
    setFloatSuccessMsg("");

    try {
      const { ok, data } = await secureApiCall("/api/v1/wallet/requests/create", {
        method: "POST",
        body: {
          amount: parseFloat(floatAmount),
          payment_mode: floatMode,
          reference_no: floatRef || `SHIFT-FLOAT-${Date.now()}`,
          reference_id: floatRef || `SHIFT-FLOAT-${Date.now()}`,
          remarks: floatRemarks || "Counter shift float top-up"
        }
      });
      if (ok && data.status === "success") {
        setFloatSuccessMsg("Float request submitted to Retailer & Distributor for instant clearance!");
        showToast("✓ Shift Float requested successfully!");
        setTimeout(() => {
          setShowRequestFloatModal(false);
          setFloatSuccessMsg("");
        }, 2000);
        loadOperatorData();
      } else {
        showToast(data.message || "Failed to submit float request", "error");
      }
    } catch (err) {
      showToast("Network error submitting float request", "error");
    } finally {
      setIsRequestingFloat(false);
    }
  };

  // -------------------------------------------------------------
  // DESK 1: SUBMIT GST REGISTRATION
  // -------------------------------------------------------------
  // Audit Ledger Filtering & Pagination Pipeline
  const filteredLedger = useMemo(() => {
    return auditLedger.filter((tx) => {
      const matchAction =
        ledgerActionFilter === "all" ||
        (ledgerActionFilter === "CREDIT" && (parseFloat(tx.credit || 0) > 0 || tx.type?.includes("CREDIT") || tx.type?.includes("TOPUP"))) ||
        (ledgerActionFilter === "DEBIT" && (parseFloat(tx.debit || 0) > 0 || tx.type?.includes("FEE") || tx.type?.includes("DEBIT"))) ||
        (ledgerActionFilter === "REFUND" && tx.type?.includes("REFUND")) ||
        tx.type === ledgerActionFilter;

      const matchSearch =
        !ledgerSearch ||
        (tx.reference_id && tx.reference_id.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.note && tx.note.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        (tx.type && tx.type.toLowerCase().includes(ledgerSearch.toLowerCase()));

      return matchAction && matchSearch;
    });
  }, [auditLedger, ledgerActionFilter, ledgerSearch]);

  const paginatedLedger = useMemo(() => {
    const start = (ledgerPage - 1) * ledgerPerPage;
    return filteredLedger.slice(start, start + ledgerPerPage);
  }, [filteredLedger, ledgerPage, ledgerPerPage]);

  const totalCredits = useMemo(() => {
    return auditLedger.reduce((sum, tx) => sum + (parseFloat(tx.credit || 0)), 0);
  }, [auditLedger]);

  const totalDebits = useMemo(() => {
    return auditLedger.reduce((sum, tx) => sum + (parseFloat(tx.debit || 0)), 0);
  }, [auditLedger]);

  // Dynamic 5-Service Price Lookup Helper
  const getServicePrice = (serviceKey: string) => {
    const p = Array.isArray(pricingList) ? pricingList.find((item: any) => item.service_key === serviceKey) : null;
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
    setIsSubmittingService(true);
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
          trade_name: trade || "Aadhya Traders",
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
          setCounterBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: any = {
          id: data.arn,
          client: data.trade_name || "Applicant",
          customer: data.trade_name || "Applicant",
          service: `GST Registration (${gstRegType.replace(/_/g, ' ').toUpperCase()})`,
          amount: getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee || 1500.00,
          fee: getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee || 1500.00,
          comm: data.earned_margin || 350,
          status: "ARN Generated",
          date: "Just now",
          time: "Just now",
          customerMobile: data.mobile || "+91 94432 10982",
          mobile: data.mobile || "+91 94432 10982",
          customerPanOrGst: data.trade_name,
          pan: data.trade_name
        };
        setShiftFilings(prev => [receipt, ...prev]);
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
        loadOperatorData();
        showToast(`✓ GST Registration submitted! ARN: ${data.arn}`);
      } else {
        showToast(data.message || "Failed to process GST registration", "error");
      }
    } catch (err) {
      showToast("Network error submitting GST registration", "error");
    } finally {
      setIsSubmittingService(false);
    }
  };

  // -------------------------------------------------------------
  // DESK 2: SUBMIT IT FILING
  // -------------------------------------------------------------
  const handleItSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateItForm();
    if (valErr) {
      showToast(valErr, 'error');
      return;
    }
    setIsSubmittingService(true);
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
          setCounterBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: any = {
          id: data.ack_number,
          client: data.customer_name || "Taxpayer",
          customer: data.customer_name || "Taxpayer",
          service: `Income Tax Filing (${itFilerType.toUpperCase()})`,
          amount: getServicePrice("itr_filing").mrp_customer_fee || 800.00,
          fee: getServicePrice("itr_filing").mrp_customer_fee || 800.00,
          comm: data.earned_margin || 250,
          status: "ITR-V Generated",
          date: "Just now",
          time: "Just now",
          customerMobile: data.mobile || "+91 94432 10982",
          mobile: data.mobile || "+91 94432 10982",
          customerPanOrGst: data.pan,
          pan: data.pan
        };
        setShiftFilings(prev => [receipt, ...prev]);
        setSelectedReceipt(receipt);
        // Clear ITR form state completely
        setItCustomerName("");
        setItLoginUser("");
        setItLoginPassword("");
        setItPan("");
        setItAadhaar("");
        setItGstNo("");
        setItSsiMsme("");
        setItMobile("");
        setItEmail("");
        setItDocs({});
        loadOperatorData();
        showToast(`✓ IT Return filed! Ack: ${data.ack_number}`);
      } else {
        showToast(data.message || "Failed to process IT filing", "error");
      }
    } catch (err) {
      showToast("Network error submitting IT filing", "error");
    } finally {
      setIsSubmittingService(false);
    }
  };

  // -------------------------------------------------------------
  // DESK 3: SUBMIT GSTR FILING
  // -------------------------------------------------------------
  const handleGstrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validateGstrForm();
    if (valErr) {
      showToast(valErr, 'error');
      return;
    }
    setIsSubmittingService(true);
    try {
      const token = getAuthToken();
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
          setCounterBalance(parseFloat(data.new_wallet_bal));
          setUserProfile((prev: any) => prev ? { ...prev, wallet: parseFloat(data.new_wallet_bal) } : prev);
        }
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_wallet_updated"));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("infusetax_notification_updated"));
        const receipt: ReceiptData = {
          id: data.arn,
          client: data.gstin,
          service: `${gstrReturnType} Return (${data.period})`,
          amount: getServicePrice("gstr_filing").mrp_customer_fee || 500.00,
          comm: 150,
          status: "Filed Successfully",
          date: "Just now",
          customerMobile: "+91 94432 10982",
          customerPanOrGst: data.gstin
        };
        setShiftFilings(prev => [receipt, ...prev]);
        setSelectedReceipt(receipt);
        // Clear GSTR form state completely
        setGstrGstin("");
        setGstrTurnover("");
        setGstrOutputTax("");
        setGstrItcClaim("");
        loadOperatorData();
        showToast(`✓ ${gstrReturnType} filed! ARN: ${data.arn}`);
      } else {
        showToast(data.message || "Failed to process GSTR filing", "error");
      }
    } catch (err) {
      showToast("Network error submitting GSTR filing", "error");
    } finally {
      setIsSubmittingService(false);
    }
  };

  const paginatedFilings = useMemo(() => {
    const start = (page - 1) * perPage;
    return shiftFilings.slice(start, start + perPage);
  }, [shiftFilings, page, perPage]);

  // Upgraded Document Slot with In-Slot Preview, Download & Active Reading Spinner
  const DocumentSlot = ({ label, code, stateMap, setStateMap, required = true }: { label: string; code: string; stateMap: any; setStateMap: any; required?: boolean }) => {
    const [isReading, setIsReading] = useState(false);
    const [previewSlotModal, setPreviewSlotModal] = useState(false);
    const fileEntry = stateMap[code];
    const isUploaded = !!fileEntry;
    const customFileName = typeof fileEntry === "object" && fileEntry?.name ? fileEntry.name : null;
    const customSize = typeof fileEntry === "object" && fileEntry?.size ? fileEntry.size : null;
    const customDataUrl = typeof fileEntry === "object" && fileEntry?.dataUrl ? fileEntry.dataUrl : typeof fileEntry === "string" && fileEntry.startsWith("data:") ? fileEntry : null;
    const inputId = `file-input-op-${code}`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setIsReading(true);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setStateMap((prev: any) => ({
            ...prev,
            [code]: {
              name: file.name,
              type: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
              size: `${(file.size / 1024).toFixed(1)} KB`,
              dataUrl: dataUrl,
              uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          }));
          setIsReading(false);
          showToast(`✓ ${label} attached (${file.name})!`);
        };
        reader.onerror = () => {
          setIsReading(false);
          showToast(`Failed to read file ${file.name}`, "error");
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      }
    };

    const handleDownloadSlotFile = () => {
      if (customDataUrl) {
        const link = document.createElement("a");
        link.href = customDataUrl;
        link.download = customFileName || `${code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <>
        <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
          isUploaded ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300"
        }`}>
          <div className="flex items-center space-x-2.5 overflow-hidden min-w-0 flex-1">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
              isReading ? "bg-amber-100 text-amber-700" : isUploaded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {isReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isUploaded ? <Check className="w-4 h-4" /> : <FileUp className="w-3.5 h-3.5" />}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold truncate flex items-center space-x-1.5">
                <span>{label}</span>
                {required && <span className="text-rose-500 text-[10px]">*</span>}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {isReading ? "⏳ Processing file..." : customFileName ? `✓ ${customFileName} (${customSize || ""})` : isUploaded ? "✓ Scanned Copy Attached" : "Color Scan (PDF/JPG/PNG)"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {isUploaded && customDataUrl && (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewSlotModal(true)}
                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                  title="Preview Attached File"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSlotFile}
                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                  title="Download Attached File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <label 
              htmlFor={inputId}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
                isReading ? "bg-amber-100 text-amber-700 pointer-events-none" :
                isUploaded ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              }`}
            >
              {isReading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Attaching...</span>
                </>
              ) : (
                <span>{isUploaded ? "Replace" : "Upload"}</span>
              )}
              <input
                id={inputId}
                key={`input-op-${code}`}
                type="file"
                accept="image/*,.pdf"
                disabled={isReading}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {previewSlotModal && customDataUrl && (
          <div 
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setPreviewSlotModal(false)}
          >
            <div 
              className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 truncate">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-extrabold truncate">{customFileName || label}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadSlotFile}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSlotModal(false)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto bg-slate-100 flex items-center justify-center min-h-[250px]">
                {customDataUrl.startsWith("data:image/") ? (
                  <img src={customDataUrl} alt={customFileName || label} className="max-h-[60vh] max-w-full object-contain rounded-xl shadow border" />
                ) : (
                  <iframe src={customDataUrl} className="w-full h-[60vh] rounded-xl border" title={customFileName || label} />
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Universal Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      <ServiceApprovalModal item={selectedApprovalItem} readOnly={true} onClose={() => setSelectedApprovalItem(null)} onSuccess={(msg) => { showToast(msg); loadOperatorData(); }} />

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-900/50 text-white">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Terminal className="w-4 h-4" />
            <span>Tier 4: Store Operator Counter Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {userProfile?.name || "Counter Staff (Operator Terminal)"}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Active Shift Desk: {userProfile?.city || "Store Counter"} • Company: <span className="text-amber-300 font-bold">{userProfile?.tenant || "INFUSE"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
            <div className="text-xs text-amber-200 font-medium">Counter Shift Float</div>
            <div className="text-2xl font-black text-amber-400 tracking-tight font-mono">
              ₹{counterBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button
            onClick={() => setShowRequestFloatModal(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Shift Float</span>
          </button>
          <button
            onClick={loadOperatorData}
            disabled={loadingData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 cursor-pointer"
            title="Refresh Terminal Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Sub-Navigation Tab Switcher for 3 Core Desks */}
      {(() => {
        const allDesks = [
          { id: "gst_reg", label: "1. GST Registration Desk", icon: Building, fee: getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee || 1500, badge: `Wholesale ₹${getServicePrice(getCurrentGstServiceKey(gstRegType)).tier3_price || 1100}`, permKey: "gst_registration" },
          { id: "itr", label: "2. IT Filing Desk", icon: FileText, fee: getServicePrice("itr_filing").mrp_customer_fee || 800, badge: `Wholesale ₹${getServicePrice("itr_filing").tier3_price || 550}`, permKey: "itr_filing" },
          { id: "gstr_filing", label: "3. GST Return Filing", icon: FileSpreadsheet, fee: getServicePrice("gstr_filing").mrp_customer_fee || 500, badge: `Wholesale ₹${getServicePrice("gstr_filing").tier3_price || 350}`, permKey: "gstr_filing" },
          { id: "reports", label: "4. Shift Wallet Report", icon: History, fee: 0, badge: `${auditLedger.length} Records`, permKey: "reports" },
        ];

        const isPermitted = (permKey?: string) => {
          if (!permKey) return true;
          if (tenantPermissions.length === 0 || tenantPermissions.includes("all")) return true;
          return tenantPermissions.includes(permKey);
        };

        const visibleDesks = allDesks.filter(d => isPermitted(d.permKey));

        return (
          <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-thin">
            {visibleDesks.map((desk) => {
              const Icon = desk.icon;
              const isActive = activeDesk === desk.id;
              return (
                <button
                  key={desk.id}
                  onClick={() => switchDesk(desk.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{desk.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 font-mono"}`}>
                    ₹{desk.fee} ({desk.badge})
                  </span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* DESK 1: GST REGISTRATION (1a Sole Prop / 1b Pvt Ltd / 1c LLP)              */}
      {/* ========================================================================= */}
      {activeDesk === "gst_reg" && (
        <div className="space-y-6">
          {/* Registration Type Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 max-w-2xl">
            <button
              onClick={() => setGstRegType("sole_proprietorship")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "sole_proprietorship" ? "bg-white text-amber-900 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1a. Sole Proprietorship (11 Items)
            </button>
            <button
              onClick={() => setGstRegType("private_limited")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "private_limited" ? "bg-white text-amber-900 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1b. Private Limited Co (15 Items)
            </button>
            <button
              onClick={() => setGstRegType("partnership_llp")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                gstRegType === "partnership_llp" ? "bg-white text-amber-900 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1c. Partnership / LLP (17 Items)
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {gstRegType === "sole_proprietorship" ? "1a. Sole Proprietorship Color Copy" : gstRegType === "private_limited" ? "1b. Private Limited (Dual Director)" : "1c. Partnership / LLP (Dual Partner)"}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">GST Registration Service Desk</h2>
                <p className="text-xs text-slate-500">Capture applicant business KYC, entity constitution, and submit for instant ARN assignment.</p>
              </div>
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-right">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Customer Fee (MRP)</span>
                <div className="text-sm font-black text-amber-900 font-mono">
                  ₹{getServicePrice(getCurrentGstServiceKey(gstRegType)).mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                  Shift Float Debit: ₹{getServicePrice(getCurrentGstServiceKey(gstRegType)).tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <form onSubmit={handleGstSubmit} className="space-y-6">
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
                        placeholder="e.g., Sri Balaji Traders"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Scanned Color Copy Uploads (11 Items Checklist)
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
                      <DocumentSlot label="11) Premises Geo Photo with Owner & Board" code="sp_geo_photo" stateMap={spDocs} setStateMap={setSpDocs} />
                    </div>
                  </div>
                </div>
              )}

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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">6) Company Mobile *</label>
                      <input
                        type="tel"
                        required
                        value={pvtMobile}
                        onChange={(e) => setPvtMobile(e.target.value)}
                        placeholder="+91 98421 00000"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">15) Assign Authorized Signatory *</label>
                      <input
                        type="text"
                        required
                        value={pvtAuthSignatory}
                        onChange={(e) => setPvtAuthSignatory(e.target.value)}
                        placeholder="Director Name / DIN"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Scanned Color Copy Uploads (15 Items Checklist)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <DocumentSlot label="1) Incorporation Certificate (COI)" code="pvt_coi" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="2) PAN Card for Both Directors" code="pvt_dir_pan" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="3) Aadhaar for Both Directors" code="pvt_dir_aadhaar" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="4) Photo Scanned for Both Directors" code="pvt_dir_photo" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="5) Signature of Both Directors" code="pvt_dir_sig" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="8) Rental Deed / Property Deed" code="pvt_rent_deed" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="9) EB Receipt of Own or Lease" code="pvt_eb_receipt" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="10) Property Tax Receipt" code="pvt_tax_receipt" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="11) Premises Geo Photo with Owner & Board" code="pvt_geo_photo" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="12) MSME Registration (Udyam)" code="pvt_msme" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="13) Bank Passbook / Cheque (Company)" code="pvt_bank_proof" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                      <DocumentSlot label="14) Front Office Name Board (2/2 Cut Out)" code="pvt_name_board" stateMap={pvtDocs} setStateMap={setPvtDocs} />
                    </div>
                  </div>
                </div>
              )}

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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">3) Firm PAN Card *</label>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={firmPan}
                        onChange={(e) => setFirmPan(e.target.value.toUpperCase())}
                        placeholder="AAAFF1234K"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Scanned Color Copy Uploads (17 Items Checklist)
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
                      <DocumentSlot label="12) Property Tax Receipt" code="firm_tax_receipt" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="13) Premises Geo Photo with Owner & Board" code="firm_geo_photo" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="14) MSME Registration (Udyam)" code="firm_msme" stateMap={firmDocs} setStateMap={setFirmDocs} />
                      <DocumentSlot label="15) Bank Passbook / Cheque (Firm Account)" code="firm_bank_proof" stateMap={firmDocs} setStateMap={setFirmDocs} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmittingService}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Building className="w-4 h-4" />
                  <span>{isSubmittingService ? "Transmitting REG-01..." : `Submit GST Registration (₹${getServicePrice(getCurrentGstServiceKey(gstRegType)).tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Float)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 2: IT FILING WORKFLOW (Individual & Business Person)                 */}
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
              Individual Filer
            </button>
            <button
              onClick={() => setItFilerType("business")}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                itFilerType === "business" ? "bg-white text-emerald-800 shadow-md font-extrabold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Business Person
            </button>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  AY 2025-26 IT Filing Desk ({itFilerType === "individual" ? "Individual" : "Business Person"})
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Income Tax Return Counter Filing Desk</h2>
                <p className="text-xs text-slate-500">Capture 9 statutory fields including IT credentials and 01st Apr to 31st Mar annual bank statements.</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Customer Fee (MRP)</span>
                <div className="text-sm font-black text-emerald-900 font-mono">
                  ₹{getServicePrice("itr_filing").mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                  Shift Float Debit: ₹{getServicePrice("itr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    placeholder="Full Name as on PAN"
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
                    placeholder="PAN / User ID"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2b) IT Portal Password *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">6) SSI / MSME Registration</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">8) Email ID *</label>
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
                  9) Bank Statements & Documents Upload (01st Apr to 31st Mar)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <DocumentSlot label="3) PAN Card Scanned Copy" code="it_pan_doc" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="4) Aadhaar Card Scanned Copy" code="it_aadhaar_doc" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="9a) SB Account Statement (01 Apr - 31 Mar)" code="it_sb_bank" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="9b) Current Account Statement (01 Apr - 31 Mar)" code="it_ca_bank" stateMap={itDocs} setStateMap={setItDocs} />
                  <DocumentSlot label="6) MSME / SSI Certificate" code="it_msme_doc" stateMap={itDocs} setStateMap={setItDocs} required={false} />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmittingService}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isSubmittingService ? "Processing ITR..." : "File IT Return & Generate ITR-V (₹800 Float)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESK 3: GSTR-1 & 3B FILING WORKFLOW                                       */}
      {/* ========================================================================= */}
      {activeDesk === "gstr_filing" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                GSTR Monthly Compliance
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">GSTR-1 & GSTR-3B Monthly Return Desk</h2>
              <p className="text-xs text-slate-500">Auto-calculate output tax, set-off Input Tax Credit (ITC), and generate ARN receipt.</p>
            </div>
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl text-right">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Customer Fee (MRP)</span>
              <div className="text-sm font-black text-indigo-900 font-mono">
                ₹{getServicePrice("gstr_filing").mrp_customer_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-indigo-800 font-semibold mt-0.5">
                Shift Float Debit: ₹{getServicePrice("gstr_filing").tier3_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Period</label>
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
                disabled={isSubmittingService}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isSubmittingService ? "Transmitting Return..." : `Submit ${gstrReturnType} & Generate ARN (₹500 Float)`}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHIFT FILINGS ACTIVITY STREAM & INSTANT RECEIPT PRINTING                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>Shift Activity Feed & Receipts ({shiftFilings.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Real-time counter execution log with instant B2B tax receipt printing.</p>
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
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {paginatedFilings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    No shift transactions logged yet. Use the service desks above to process filings.
                  </td>
                </tr>
              ) : (
                paginatedFilings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-[11px] text-amber-700">{f.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{f.customer || f.client || "Customer"}</div>
                      <div className="text-[11px] text-slate-400">{f.time || f.date || "Today"}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{f.service}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900 font-mono">
                      ₹{(parseFloat(f.fee || f.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          f.status === 'APPROVED' || f.status === 'FILED_ACTIVE' || f.status === 'ARN_GENERATED' || f.status === 'FILED_VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : f.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {f.status === 'PENDING_APPROVAL' ? '⏳ Under Review' : f.status}
                        </span>
                        {f.status === 'REJECTED' && f.rejection_remarks && (
                          <div className="text-[10px] text-rose-600 font-bold max-w-xs">
                            Reason: {f.rejection_remarks}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedApprovalItem({
                            id: f.id,
                            service_category: f.service?.toLowerCase().includes("income") ? "itr" : "gst",
                            arn: f.id,
                            client_name: f.customer || f.client,
                            entity_type: f.service,
                            pan: f.pan || f.id,
                            amount: f.fee || f.amount,
                            status: f.status,
                            documents: f.documents || {},
                            verified_doc_url: f.verified_doc_url,
                            rejection_remarks: f.rejection_remarks,
                            submitted_at: f.time || f.date
                          })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer"
                          title="Inspect Uploaded Documents"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Docs</span>
                        </button>
                        <button
                          onClick={() => setSelectedReceipt({
                            id: f.id,
                            client: f.customer || f.client,
                            service: f.service,
                            amount: parseFloat(f.fee || f.amount || 0),
                            comm: 0,
                            status: f.status,
                            date: f.time || f.date,
                            customerMobile: f.mobile || f.customerMobile || userProfile?.mobile || "+91 98765 00004",
                            customerPanOrGst: f.pan || f.customerPanOrGst || f.id
                          })}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        {f.verified_doc_url && (
                          <button
                            type="button"
                            onClick={() => setSelectedApprovalItem({
                              id: f.id,
                              service_category: f.service?.toLowerCase().includes("income") ? "itr" : "gst",
                              arn: f.id,
                              client_name: f.customer || f.client,
                              entity_type: f.service,
                              pan: f.pan || "N/A",
                              amount: parseFloat(f.fee || f.amount || 0),
                              status: f.status,
                              documents: f.documents || {},
                              verified_doc_url: f.verified_doc_url,
                              rejection_remarks: f.rejection_remarks,
                              submitted_at: f.time || f.date
                            })}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl border border-emerald-200 cursor-pointer flex items-center space-x-0.5"
                            title="View Verified Certificate & ARN Proof"
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Showing {shiftFilings.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, shiftFilings.length)} of {shiftFilings.length} filings</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {page} of {Math.max(1, Math.ceil(shiftFilings.length / perPage))}</span>
            <button
              onClick={() => setPage(prev => Math.min(Math.ceil(shiftFilings.length / perPage), prev + 1))}
              disabled={page >= Math.ceil(shiftFilings.length / perPage)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESK 4: SHIFT WALLET & FLOAT TRANSACTION REPORT (PASSBOOK)                 */}
      {/* ========================================================================= */}
      {activeDesk === "reports" && (
        <div className="space-y-6">
          {/* Executive Overview Header */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Operator Shift Wallet Passbook & Ledger</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Counter Shift Float & Wallet Report
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl mt-1">
                    Complete cryptographic audit trail of all shift float advances, service fee deductions, customer receipts, and refunds.
                  </p>
                </div>
                <button
                  onClick={loadOperatorData}
                  disabled={loadingData}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh Ledger</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Current Shift Float</div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                    ₹{counterBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-emerald-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-emerald-500/20">
                  <div className="text-[11px] text-emerald-300 uppercase font-bold">Total Float Inflow</div>
                  <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
                    +₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-rose-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-rose-500/20">
                  <div className="text-[11px] text-rose-300 uppercase font-bold">Total Service Debits</div>
                  <div className="text-2xl font-black text-rose-300 font-mono mt-0.5">
                    -₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-blue-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-blue-500/20">
                  <div className="text-[11px] text-blue-300 uppercase font-bold">Total Transactions</div>
                  <div className="text-2xl font-extrabold text-blue-300 mt-0.5">
                    {auditLedger.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                placeholder="Search by Reference ID, ARN, or narration..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-medium text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: "all", label: "All Transactions" },
                  { id: "CREDIT", label: "Float Advances (+)" },
                  { id: "DEBIT", label: "Service Debits (-)" },
                  { id: "REFUND", label: "Refunds" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setLedgerActionFilter(tab.id); setLedgerPage(1); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      ledgerActionFilter === tab.id
                        ? "bg-white text-amber-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction Passbook Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                  <tr>
                    <th className="p-3.5">Reference / Tx ID</th>
                    <th className="p-3.5">Transaction Type</th>
                    <th className="p-3.5">Description & Narration</th>
                    <th className="p-3.5 text-right">Debit (-₹)</th>
                    <th className="p-3.5 text-right">Credit (+₹)</th>
                    <th className="p-3.5 text-right">Running Float (₹)</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 font-bold">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedLedger.map((tx: any) => {
                      const isCredit = (parseFloat(tx.credit || 0) > 0) || tx.type?.includes("CREDIT") || tx.type?.includes("TOPUP");
                      const isDebit = (parseFloat(tx.debit || 0) > 0) || tx.type?.includes("FEE") || tx.type?.includes("DEBIT");
                      const isRefund = tx.type?.includes("REFUND");

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-amber-700 text-[11px]">
                            {tx.reference_id || tx.id?.substring(0, 8)}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isRefund ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              isCredit ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                              {tx.type || "SERVICE_TX"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{tx.note || "Counter Filing Transaction"}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{tx.entity || "Counter Desk"}</div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-rose-600">
                            {parseFloat(tx.debit || 0) > 0 ? `-₹${(parseFloat(tx.debit)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "—"}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                            {parseFloat(tx.credit || 0) > 0 ? `+₹${(parseFloat(tx.credit)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "—"}
                          </td>
                          <td className="p-3.5 text-right font-mono font-black text-slate-900">
                            ₹{(parseFloat(tx.balance || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                            {tx.date || tx.created_at || "Recent"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span>Showing {filteredLedger.length === 0 ? 0 : (ledgerPage - 1) * ledgerPerPage + 1} to {Math.min(ledgerPage * ledgerPerPage, filteredLedger.length)} of {filteredLedger.length} records</span>
                <select
                  value={ledgerPerPage}
                  onChange={(e) => { setLedgerPerPage(Number(e.target.value)); setLedgerPage(1); }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                  disabled={ledgerPage === 1}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-700">Page {ledgerPage} of {Math.max(1, Math.ceil(filteredLedger.length / ledgerPerPage))}</span>
                <button
                  onClick={() => setLedgerPage(prev => Math.min(Math.ceil(filteredLedger.length / ledgerPerPage), prev + 1))}
                  disabled={ledgerPage >= Math.ceil(filteredLedger.length / ledgerPerPage)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REQUEST SHIFT FLOAT MODAL                                                 */}
      {/* ========================================================================= */}
      {showRequestFloatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Request Shift Float</h3>
                  <p className="text-xs text-slate-500">Request float top-up for counter transactions</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestFloatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {floatSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div>{floatSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleRequestFloatSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Float Amount Required (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      value={floatAmount}
                      onChange={(e) => setFloatAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm font-black font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deposit / Clearance Method</label>
                  <select
                    value={floatMode}
                    onChange={(e) => setFloatMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 font-bold"
                  >
                    <option value="CASH_COUNTER">Cash Handed Over at Store Counter</option>
                    <option value="UPI_TRANSFER">UPI / GPay / PhonePe Clearance</option>
                    <option value="NET_BANKING">IMPS / NEFT Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reference / UTR ID (Optional)</label>
                  <input
                    type="text"
                    value={floatRef}
                    onChange={(e) => setFloatRef(e.target.value)}
                    placeholder="e.g., UTR-12345678 or CASH-ENTRY"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Notes / Remarks</label>
                  <input
                    type="text"
                    value={floatRemarks}
                    onChange={(e) => setFloatRemarks(e.target.value)}
                    placeholder="Shift start float requirement"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRequestFloatModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRequestingFloat}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isRequestingFloat ? "Submitting..." : "Submit Float Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}