"use client";

import React, { useState } from "react";
import { 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Plane, 
  Award, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  Check, 
  ArrowRight, 
  Building, 
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
  FileCheck
} from "lucide-react";
import ReceiptModal, { ReceiptData } from "@/components/dashboard/ReceiptModal";

export default function RetailerDashboardPage() {
  const [activeDesk, setActiveDesk] = useState<"gst_reg" | "gstr_filing" | "itr" | "pan" | "passport" | "certs">("gst_reg");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  // -------------------------------------------------------------
  // Desk 1: GST Registration Wizard State (eTaxPrime Benchmark)
  // -------------------------------------------------------------
  const [gstStep, setGstStep] = useState(1);
  const [gstEntityType, setGstEntityType] = useState("proprietorship");
  const [gstTradeName, setGstTradeName] = useState("Sri Balaji Enterprises");
  const [gstLegalName, setGstLegalName] = useState("Prabhu Thangavel");
  const [gstPan, setGstPan] = useState("AAACI1234F");
  const [gstMobile, setGstMobile] = useState("9876543210");
  const [gstState, setGstState] = useState("Tamil Nadu");
  const [gstHsnSearch, setGstHsnSearch] = useState("");
  const [gstSelectedHsns, setGstSelectedHsns] = useState(["998311 - Tax & Accounting Services", "6203 - Men's Garments"]);
  const [gstSubmitting, setGstSubmitting] = useState(false);
  const [gstResultArn, setGstResultArn] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Desk 2: GSTR-1 & GSTR-3B with AI ITC Reconciler (TaxBuddy Benchmark)
  // -------------------------------------------------------------
  const [isReconcilingItc, setIsReconcilingItc] = useState(false);
  const [itcReconciliationDone, setItcReconciliationDone] = useState(false);
  const [gstrTab, setGstrTab] = useState<"gstr1" | "itc_reconcile" | "gstr3b">("itc_reconcile");
  const [gstrFilingSuccess, setGstrFilingSuccess] = useState(false);

  // -------------------------------------------------------------
  // Desk 3: Income Tax Form 16 AI OCR & Regime Optimizer
  // -------------------------------------------------------------
  const [isAnalyzingOcr, setIsAnalyzingOcr] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [itrFilingSuccess, setItrFilingSuccess] = useState(false);

  // -------------------------------------------------------------
  // Desk 4: PAN Card Processing State
  // -------------------------------------------------------------
  const [panType, setPanType] = useState<"new_49a" | "correction" | "reprint">("new_49a");
  const [panCardMode, setPanCardMode] = useState<"physical_and_e" | "e_only">("physical_and_e");
  const [panApplicantName, setPanApplicantName] = useState("");
  const [panDob, setPanDob] = useState("");
  const [panAadhaar, setPanAadhaar] = useState("");
  const [panSuccess, setPanSuccess] = useState(false);

  // -------------------------------------------------------------
  // Desk 5: Passport Seva Suvidha
  // -------------------------------------------------------------
  const [passportType, setPassportType] = useState<"normal" | "tatkaal">("normal");
  const [passportPages, setPassportPages] = useState<"36" | "60">("36");
  const [passportCity, setPassportCity] = useState("Chennai PSK");
  const [passportName, setPassportName] = useState("");
  const [passportSuccess, setPassportSuccess] = useState(false);

  // -------------------------------------------------------------
  // Desk 6: Dynamic Government Certificates
  // -------------------------------------------------------------
  const [certType, setCertType] = useState<"income" | "community" | "nativity" | "first_grad">("income");
  const [certApplicant, setCertApplicant] = useState("");
  const [certAnnualIncome, setCertAnnualIncome] = useState("180000");
  const [certCommunity, setCertCommunity] = useState("OBC");
  const [certPreviewModal, setCertPreviewModal] = useState<any | null>(null);

  // -------------------------------------------------------------
  // Recent Store Filings Table
  // -------------------------------------------------------------
  const [filings, setFilings] = useState<ReceiptData[]>([
    {
      id: "GSTREG1082",
      client: "Sri Balaji Traders",
      service: "GST Registration (Proprietorship)",
      amount: 1500,
      comm: 300,
      status: "ARN Generated",
      date: "22 Aug 2026, 14:15",
      customerMobile: "+91 98765 43210",
      customerPanOrGst: "AAACI1234F",
    },
    {
      id: "GSTR3B-771",
      client: "Murugan Textiles",
      service: "GSTR-3B Monthly Return",
      amount: 500,
      comm: 150,
      status: "Completed",
      date: "22 Aug 2026, 12:40",
      customerMobile: "+91 98421 90812",
      customerPanOrGst: "33AAACM9081F1Z2",
    },
    {
      id: "ITR2026-44",
      client: "Dr. Ananya Sharma",
      service: "ITR-1 Salaried (AI Form 16)",
      amount: 800,
      comm: 250,
      status: "ITR-V Uploaded",
      date: "21 Aug 2026",
      customerMobile: "+91 94432 10982",
      customerPanOrGst: "BNKPS9081A",
    },
    {
      id: "PAN49A-992",
      client: "K. Selvam",
      service: "New Physical PAN (Form 49A)",
      amount: 110,
      comm: 25,
      status: "Dispatched",
      date: "20 Aug 2026",
      customerMobile: "+91 90807 12381",
      customerPanOrGst: "Aadhaar e-KYC",
    },
  ]);

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleGstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGstSubmitting(true);

    setTimeout(() => {
      setGstSubmitting(false);
      const generatedArn = `AA330826${Math.floor(1000000 + Math.random() * 9000000)}Z`;
      setGstResultArn(generatedArn);

      const newEntry: ReceiptData = {
        id: generatedArn,
        client: gstTradeName,
        service: `GST Registration (${gstEntityType.toUpperCase()})`,
        amount: 1500,
        comm: 300,
        status: "ARN Generated",
        date: "Just now",
        customerMobile: `+91 ${gstMobile}`,
        customerPanOrGst: gstPan,
      };
      setFilings([newEntry, ...filings]);
    }, 1200);
  };

  const handleSimulateForm16Upload = (profile: "salaried" | "business" | "freelance" = "salaried") => {
    setIsAnalyzingOcr(true);
    setOcrData(null);
    setItrFilingSuccess(false);

    setTimeout(() => {
      setIsAnalyzingOcr(false);
      if (profile === "salaried") {
        setOcrData({
          profileName: "Salaried IT Professional (Form 16)",
          pan: "ABCDE1234F",
          employer: "Infosys Tech Solutions Ltd",
          grossSalary: 1250000,
          stdDeduction: 75000, // Budget 2025-26 New Regime Standard deduction
          sec80C: 150000,
          sec80D: 25000,
          sec80CCD: 50000,
          hraExempt: 60000,
          tdsDeducted: 98000,
          oldTaxLiability: 88500,
          newTaxLiability: 65000,
          optimalRegime: "NEW REGIME",
          taxSaved: 23500,
          netRefundDue: 33000,
        });
      } else if (profile === "business") {
        setOcrData({
          profileName: "Retail Store / Trader (Section 44AD)",
          pan: "BHJPT9981K",
          employer: "Self Employed Retailer",
          grossSalary: 2800000,
          stdDeduction: 0,
          sec80C: 150000,
          sec80D: 50000,
          sec80CCD: 0,
          hraExempt: 0,
          tdsDeducted: 45000,
          oldTaxLiability: 135000,
          newTaxLiability: 110000,
          optimalRegime: "NEW REGIME (Sec 44AD)",
          taxSaved: 25000,
          netRefundDue: 0,
        });
      } else {
        setOcrData({
          profileName: "Freelance Consultant (Section 44ADA)",
          pan: "CNMPS4321Q",
          employer: "Design & Digital Consultant",
          grossSalary: 1800000,
          stdDeduction: 0,
          sec80C: 150000,
          sec80D: 25000,
          sec80CCD: 50000,
          hraExempt: 0,
          tdsDeducted: 75000,
          oldTaxLiability: 62500,
          newTaxLiability: 45000,
          optimalRegime: "NEW REGIME (Sec 44ADA)",
          taxSaved: 17500,
          netRefundDue: 30000,
        });
      }
    }, 1400);
  };

  const handleSimulateItcReconcile = () => {
    setIsReconcilingItc(true);
    setTimeout(() => {
      setIsReconcilingItc(false);
      setItcReconciliationDone(true);
    }, 1200);
  };

  const handleFileGstr3B = () => {
    setGstrFilingSuccess(true);
    const newEntry: ReceiptData = {
      id: `GSTR3B-${Math.floor(1000 + Math.random() * 9000)}`,
      client: "Murugan Textiles & Garments",
      service: "GSTR-3B Monthly Return (Auto-Matched ITC)",
      amount: 500,
      comm: 150,
      status: "Filed with EVC",
      date: "Just now",
      customerMobile: "+91 98421 90812",
      customerPanOrGst: "33AAACM9081F1Z2",
    };
    setFilings([newEntry, ...filings]);
  };

  const handleFileItrNow = () => {
    setItrFilingSuccess(true);
    const newEntry: ReceiptData = {
      id: `ITR26-${Math.floor(10000 + Math.random() * 90000)}`,
      client: ocrData.profileName,
      service: "ITR-1 Return (New Regime Optimized)",
      amount: 800,
      comm: 250,
      status: "ITR-V Generated",
      date: "Just now",
      customerMobile: "+91 94432 10982",
      customerPanOrGst: ocrData.pan,
    };
    setFilings([newEntry, ...filings]);
  };

  const handlePanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPanSuccess(true);
    const newEntry: ReceiptData = {
      id: `UTI${Math.floor(100000000 + Math.random() * 900000000)}`,
      client: panApplicantName || "R. Karthikeyan",
      service: panCardMode === "physical_and_e" ? "New Physical PAN + e-PAN (49A)" : "Instant e-PAN Only (49A)",
      amount: panCardMode === "physical_and_e" ? 110 : 66,
      comm: 25,
      status: "e-KYC Verified",
      date: "Just now",
      customerMobile: "+91 90807 12381",
      customerPanOrGst: `Aadhaar: ${panAadhaar || "XXXX-XXXX-9081"}`,
    };
    setFilings([newEntry, ...filings]);
  };

  const handlePassportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassportSuccess(true);
    const newEntry: ReceiptData = {
      id: `PSK-${Math.floor(100000 + Math.random() * 900000)}`,
      client: passportName || "V. Sangeetha",
      service: `Passport Seva (${passportType.toUpperCase()} - ${passportPages} Pgs)`,
      amount: passportType === "normal" ? 1500 : 3500,
      comm: 350,
      status: "Slot Booked",
      date: "Just now",
      customerMobile: "+91 98421 77651",
      customerPanOrGst: passportCity,
    };
    setFilings([newEntry, ...filings]);
  };

  const handleCertGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const certNum = `TN-EDIST-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setCertPreviewModal({
      certNum,
      type: certType,
      applicant: certApplicant || "M. Rajesh Kumar",
      income: certAnnualIncome,
      community: certCommunity,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    });

    const newEntry: ReceiptData = {
      id: certNum,
      client: certApplicant || "M. Rajesh Kumar",
      service: `Digital ${certType.toUpperCase()} Certificate`,
      amount: 150,
      comm: 45,
      status: "Digital Seal Issued",
      date: "Just now",
      customerMobile: "+91 99441 12390",
      customerPanOrGst: certNum,
    };
    setFilings([newEntry, ...filings]);
  };

  return (
    <div className="space-y-8">
      {/* Universal Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />

      {/* Top Banner & Fast Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Tier 3: Retailer Store POS & Tax Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Customer Tax Filing & Digital Services Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Benchmarked against <span className="font-semibold text-blue-700">TaxBuddy</span> & <span className="font-semibold text-indigo-700">eTaxPrime</span> standards with instant wallet cashback
          </p>
        </div>

        {/* Live Wallet & Commission Pill */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-right">
            <div className="text-[10px] uppercase font-bold text-blue-700">Counter Wallet Balance</div>
            <div className="text-base font-extrabold text-blue-950 font-mono">₹24,850.00</div>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Today&apos;s Earned Margin</div>
            <div className="text-base font-extrabold text-emerald-900 font-mono">+₹1,470.00</div>
          </div>
        </div>
      </div>

      {/* Desk Selector Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        <button
          onClick={() => setActiveDesk("gst_reg")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "gst_reg" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 ring-2 ring-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Building className="w-4 h-4" />
          <span>GST Registration Hub</span>
        </button>

        <button
          onClick={() => setActiveDesk("gstr_filing")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "gstr_filing" ? "bg-indigo-700 text-white shadow-lg shadow-indigo-700/25 ring-2 ring-indigo-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>GSTR-1 & 3B (AI ITC Match)</span>
        </button>

        <button
          onClick={() => setActiveDesk("itr")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "itr" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-2 ring-amber-600/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Form 16 AI ITR Optimizer</span>
        </button>

        <button
          onClick={() => setActiveDesk("pan")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "pan" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 ring-2 ring-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <CreditCard className="w-4 h-4" />
          <span>PAN Card (49A / Reprint)</span>
        </button>

        <button
          onClick={() => setActiveDesk("passport")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "passport" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 ring-2 ring-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Plane className="w-4 h-4" />
          <span>Passport Seva Suvidha</span>
        </button>

        <button
          onClick={() => setActiveDesk("certs")}
          className={`px-4 py-3 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "certs" ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25 ring-2 ring-blue-700/20" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Award className="w-4 h-4" />
          <span>Dynamic E-Certificates</span>
        </button>
      </div>

      {/* Main Interactive Workspace Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* ========================================================= */}
        {/* DESK 1: GST REGISTRATION HUB (eTaxPrime Benchmark)        */}
        {/* ========================================================= */}
        {activeDesk === "gst_reg" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">New GST Registration Wizard (eTaxPrime Standard)</h3>
                <p className="text-xs text-slate-500">Fast 4-step compliance wizard with HSN directory and automatic TRN/ARN creation</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                  Govt + Portal Fee: ₹1,500
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Instant Margin: +₹300
                </span>
              </div>
            </div>

            {/* Wizard Steps Navigation */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
              {[
                { step: 1, title: "1. Constitution" },
                { step: 2, title: "2. Promoters & e-KYC" },
                { step: 3, title: "3. Business Place & Proofs" },
                { step: 4, title: "4. HSN & Submit" }
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setGstStep(s.step)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    gstStep === s.step
                      ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                      : gstStep > s.step
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {gstResultArn ? (
              <div className="p-8 bg-emerald-50/60 border border-emerald-200 rounded-3xl text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">GST Registration Application Submitted Successfully!</h4>
                  <div className="text-xs text-slate-600 mt-1">
                    Application Reference Number (ARN): <span className="font-mono font-bold text-blue-700 text-sm">{gstResultArn}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Net ₹1,200 debited from counter wallet. Instant ₹300 margin earned and credited.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedReceipt({
                        id: gstResultArn,
                        client: gstTradeName,
                        service: `GST Registration (${gstEntityType.toUpperCase()})`,
                        amount: 1500,
                        comm: 300,
                        status: "ARN Generated",
                        date: "Just now",
                        customerMobile: `+91 ${gstMobile}`,
                        customerPanOrGst: gstPan,
                      });
                    }}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Customer Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setGstResultArn(null);
                      setGstStep(1);
                    }}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                  >
                    Register Another Business
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGstSubmit} className="space-y-6">
                {gstStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Business Constitution <span className="text-rose-500">*</span></label>
                        <select
                          value={gstEntityType}
                          onChange={(e) => setGstEntityType(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                        >
                          <option value="proprietorship">Sole Proprietorship (Individual)</option>
                          <option value="partnership">Partnership Firm</option>
                          <option value="llp">Limited Liability Partnership (LLP)</option>
                          <option value="pvt_ltd">Private Limited Company</option>
                          <option value="sez">Special Economic Zone (SEZ) Unit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Trade Name of Enterprise <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={gstTradeName}
                          onChange={(e) => setGstTradeName(e.target.value)}
                          required
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-blue-600"
                          placeholder="e.g. Sri Balaji Enterprises"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Entity PAN Card <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={gstPan}
                          onChange={(e) => setGstPan(e.target.value.toUpperCase())}
                          required
                          maxLength={10}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:border-blue-600 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary State <span className="text-rose-500">*</span></label>
                        <select
                          value={gstState}
                          onChange={(e) => setGstState(e.target.value)}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                        >
                          <option value="Tamil Nadu">Tamil Nadu (33)</option>
                          <option value="Karnataka">Karnataka (29)</option>
                          <option value="Maharashtra">Maharashtra (27)</option>
                          <option value="Kerala">Kerala (32)</option>
                          <option value="Andhra Pradesh">Andhra Pradesh (37)</option>
                          <option value="Delhi">Delhi (07)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Registration <span className="text-rose-500">*</span></label>
                        <select className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-blue-600">
                          <option>Crossing Aggregate Turnover Threshold (&gt;₹40L/₹20L)</option>
                          <option>Voluntary Registration</option>
                          <option>Inter-State Supply of Goods</option>
                          <option>E-Commerce Seller (Amazon, Flipkart, Meesho)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setGstStep(2)}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                      >
                        <span>Continue to Promoters</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {gstStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Authorized Signatory Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={gstLegalName}
                          onChange={(e) => setGstLegalName(e.target.value)}
                          required
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Linked Mobile No <span className="text-rose-500">*</span></label>
                        <input
                          type="tel"
                          value={gstMobile}
                          onChange={(e) => setGstMobile(e.target.value)}
                          required
                          maxLength={10}
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-emerald-950">Aadhaar e-KYC Verification Active</div>
                          <div className="text-[11px] text-emerald-800">Biometric / OTP verification enabled for instant 3-day approval without site visit.</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold">
                        OTP Verified ✓
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setGstStep(1)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setGstStep(3)}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                      >
                        <span>Continue to Place of Business</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {gstStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mandatory Upload Checklist:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                          <div className="font-bold text-slate-900">1. Electricity Bill</div>
                          <div className="text-[10px] text-emerald-600 font-bold">✓ Uploaded (EB-2026.pdf)</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                          <div className="font-bold text-slate-900">2. Rent NOC / Deed</div>
                          <div className="text-[10px] text-emerald-600 font-bold">✓ Attached (NOC.pdf)</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                          <div className="font-bold text-slate-900">3. Bank Passbook</div>
                          <div className="text-[10px] text-emerald-600 font-bold">✓ Verified Statement</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                          <div className="font-bold text-slate-900">4. Promoter Photo</div>
                          <div className="text-[10px] text-emerald-600 font-bold">✓ Passport Photo</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setGstStep(2)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setGstStep(4)}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                      >
                        <span>Continue to HSN Selection</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {gstStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Search & Add Goods & Services (HSN / SAC Code)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={gstHsnSearch}
                          onChange={(e) => setGstHsnSearch(e.target.value)}
                          placeholder="Search e.g. IT services, Garments, Restaurant, Grocery..."
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (gstHsnSearch) {
                              setGstSelectedHsns([...gstSelectedHsns, gstHsnSearch]);
                              setGstHsnSearch("");
                            }
                          }}
                          className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shrink-0"
                        >
                          + Add HSN
                        </button>
                      </div>
                    </div>

                    {/* Selected HSN chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {gstSelectedHsns.map((hsn, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <span>{hsn}</span>
                          <button
                            type="button"
                            onClick={() => setGstSelectedHsns(gstSelectedHsns.filter((_, i) => i !== idx))}
                            className="text-blue-500 hover:text-rose-600 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Ledger Billing Summary:</div>
                        <div className="font-bold text-sm text-white">Govt & Desk Processing: ₹1,500.00</div>
                        <div className="text-emerald-400 text-[11px] font-bold">Your Counter Margin: +₹300.00 (Net Wallet Debit: ₹1,200.00)</div>
                      </div>

                      <button
                        type="submit"
                        disabled={gstSubmitting}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 shrink-0 disabled:opacity-50"
                      >
                        {gstSubmitting ? "Submitting to GST Portal..." : "Confirm & Submit GST Application"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESK 2: GSTR-1 & 3B WITH AI ITC RECONCILER (TaxBuddy)     */}
        {/* ========================================================= */}
        {activeDesk === "gstr_filing" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">GST Return Filing & AI Input Tax Credit (ITC) Reconciler</h3>
                <p className="text-xs text-slate-500">Auto-match GSTR-2B with Purchase Register to claim 100% eligible ITC without notice risks</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                  Filing Fee: ₹500
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Your Margin: +₹150
                </span>
              </div>
            </div>

            {/* GSTR Sub-Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setGstrTab("itc_reconcile")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  gstrTab === "itc_reconcile" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                AI ITC Reconciler (2B vs Books)
              </button>
              <button
                onClick={() => setGstrTab("gstr1")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  gstrTab === "gstr1" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                GSTR-1 (Outward Supplies)
              </button>
              <button
                onClick={() => setGstrTab("gstr3b")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  gstrTab === "gstr3b" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                GSTR-3B Summary & Tax Payment
              </button>
            </div>

            {/* Tab 1: AI ITC Reconciler */}
            {gstrTab === "itc_reconcile" && (
              <div className="space-y-5">
                <div className="p-5 bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>AI GSTR-2B Match Engine</span>
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        Client: Murugan Textiles (GSTIN: 33AAACM9081F1Z2)
                      </div>
                      <div className="text-xs text-indigo-200">Return Period: July 2026 | Books Invoices: 42 Uploaded</div>
                    </div>

                    <button
                      onClick={handleSimulateItcReconcile}
                      disabled={isReconcilingItc}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/25 shrink-0 transition-transform transform hover:scale-105 disabled:opacity-50"
                    >
                      {isReconcilingItc ? "Matching 42 Invoices with Portal (1.2s)..." : "Run AI 2B Reconciliation"}
                    </button>
                  </div>
                </div>

                {itcReconciliationDone && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Reconciled Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Total Invoices</div>
                        <div className="text-xl font-extrabold text-slate-900 mt-1">42 Bills</div>
                        <div className="text-[10px] text-slate-400">Total Purchase: ₹3,40,000</div>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <div className="text-emerald-700 text-[10px] uppercase font-bold">100% Matched ITC</div>
                        <div className="text-xl font-extrabold text-emerald-900 mt-1">₹48,500</div>
                        <div className="text-[10px] text-emerald-600">39 Invoices Found in 2B ✓</div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="text-amber-700 text-[10px] uppercase font-bold">Missing in 2B</div>
                        <div className="text-xl font-extrabold text-amber-900 mt-1">₹3,500</div>
                        <div className="text-[10px] text-amber-700">3 Supplier Invoices Pending</div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                        <div className="text-blue-700 text-[10px] uppercase font-bold">Safe Claimable ITC</div>
                        <div className="text-xl font-extrabold text-blue-900 mt-1">₹48,500</div>
                        <div className="text-[10px] text-blue-600">0% Notice Risk Guaranteed</div>
                      </div>
                    </div>

                    {/* Action Card */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Auto-Populate GSTR-3B Table 4(A)(5) with ₹48,500.00</div>
                        <div className="text-[11px] text-slate-400">Automated tax challan offset calculated. Ready for one-click filing.</div>
                      </div>

                      <button
                        onClick={() => setGstrTab("gstr3b")}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
                      >
                        <span>Proceed to GSTR-3B</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: GSTR-1 */}
            {gstrTab === "gstr1" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">B2B Invoices (Taxable)</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">18 Invoices (₹2,10,000)</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">B2CS (Retail Counter Sales)</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">₹1,30,000 (Tax: ₹23,400)</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Nil Rated / Exempted</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">₹15,000</div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-900">Upload Sales Register / Tally Excel</div>
                  <div className="text-[10px] text-slate-500">Auto-validates duplicate invoice numbers and tax rate percentages</div>
                </div>
              </div>
            )}

            {/* Tab 3: GSTR-3B */}
            {gstrTab === "gstr3b" && (
              <div className="space-y-4">
                {gstrFilingSuccess ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">GSTR-3B Successfully Filed with Portal EVC!</h4>
                    <p className="text-xs text-slate-600">Acknowledgment Reference: ARN-GSTR3B-908123992. Net fee of ₹350 debited.</p>
                    <button
                      onClick={() => {
                        setSelectedReceipt({
                          id: "ARN-GSTR3B-908123992",
                          client: "Murugan Textiles",
                          service: "GSTR-3B Monthly Return",
                          amount: 500,
                          comm: 150,
                          status: "Completed",
                          date: "Just now",
                          customerMobile: "+91 98421 90812",
                          customerPanOrGst: "33AAACM9081F1Z2",
                        });
                      }}
                      className="px-5 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Customer Filing Receipt</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Outward Tax Liability</div>
                        <div className="text-base font-bold text-slate-900 mt-1">₹61,200.00</div>
                      </div>
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Eligible ITC (Table 4)</div>
                        <div className="text-base font-bold text-emerald-900 mt-1">-₹48,500.00</div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                        <div className="text-[10px] text-blue-700 font-bold uppercase">Net Cash Tax Payable</div>
                        <div className="text-base font-bold text-blue-950 mt-1">₹12,700.00</div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleFileGstr3B}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Submit GSTR-3B with EVC
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESK 3: INCOME TAX FORM 16 AI OCR & REGIME OPTIMIZER       */}
        {/* ========================================================= */}
        {activeDesk === "itr" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Income Tax (ITR) Filing with AI Form 16 OCR</h3>
                <p className="text-xs text-slate-500">Auto-extract Form 16 PDF & calculate Old vs. New Tax Regime savings instantly</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  Filing Fee: ₹800
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Your Margin: +₹250
                </span>
              </div>
            </div>

            {/* Quick Profile Load Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold text-[11px]">Quick Load Profile:</span>
              <button
                onClick={() => handleSimulateForm16Upload("salaried")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300"
              >
                1. Salaried IT Employee (₹12.5L)
              </button>
              <button
                onClick={() => handleSimulateForm16Upload("business")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300"
              >
                2. Retail Trader / Sec 44AD (₹28L)
              </button>
              <button
                onClick={() => handleSimulateForm16Upload("freelance")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300"
              >
                3. Freelance Consultant / 44ADA (₹18L)
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-3xl p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upload Form 16 PDF / Salary Slips</h4>
                <p className="text-xs text-slate-500">AI Vision scans Part A + Part B, verifies AIS / 26AS TDS credits automatically</p>
              </div>
              <button
                type="button"
                onClick={() => handleSimulateForm16Upload("salaried")}
                disabled={isAnalyzingOcr}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-transform transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isAnalyzingOcr ? "AI OCR Extracting Salary Data (1.2s)..." : "Simulate Form 16 Auto-Scan"}
              </button>
            </div>

            {/* Extracted Data Result & Optimizer */}
            {ocrData && (
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AI OCR Extracted: {ocrData.profileName}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAN: {ocrData.pan}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Gross Income</div>
                    <div className="text-base font-bold text-white">₹{ocrData.grossSalary.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">80C + 80D + Deductions</div>
                    <div className="text-base font-bold text-emerald-400">₹{(ocrData.sec80C + ocrData.sec80D + ocrData.sec80CCD).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">TDS Credit (26AS)</div>
                    <div className="text-base font-bold text-amber-400">₹{ocrData.tdsDeducted.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Refund Due</div>
                    <div className="text-base font-bold text-sky-400">₹{ocrData.netRefundDue.toLocaleString()}</div>
                  </div>
                </div>

                {/* Side-by-Side Old vs New Regime Comparison Table */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-800/90 p-3 font-bold text-slate-300">
                    <div>Tax Computation Component</div>
                    <div className="text-right">Old Regime</div>
                    <div className="text-right text-emerald-400">New Regime (FY 2025-26)</div>
                  </div>
                  <div className="divide-y divide-slate-800 bg-slate-900/60 p-3 space-y-2 font-medium">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-400">Standard Deduction</span>
                      <span className="text-right">₹50,000</span>
                      <span className="text-right font-bold text-emerald-400">₹75,000 (Budget Slab)</span>
                    </div>
                    <div className="grid grid-cols-3 pt-2">
                      <span className="text-slate-400">Section 80C + 80D Deductions</span>
                      <span className="text-right text-emerald-400">-₹{(ocrData.sec80C + ocrData.sec80D).toLocaleString()}</span>
                      <span className="text-right text-slate-500">Not Applicable</span>
                    </div>
                    <div className="grid grid-cols-3 pt-2 font-bold text-sm">
                      <span>Total Net Tax Payable</span>
                      <span className="text-right text-slate-300 font-mono">₹{ocrData.oldTaxLiability.toLocaleString()}</span>
                      <span className="text-right text-emerald-400 font-mono">₹{ocrData.newTaxLiability.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl border border-blue-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">AI Optimizer Result</div>
                    <div className="text-sm font-bold text-white">
                      {ocrData.optimalRegime} saves customer ₹{ocrData.taxSaved.toLocaleString()} in net tax!
                    </div>
                  </div>

                  {itrFilingSuccess ? (
                    <button
                      onClick={() => {
                        setSelectedReceipt({
                          id: "ITR26-90812",
                          client: ocrData.profileName,
                          service: "ITR-1 Return (New Regime Optimized)",
                          amount: 800,
                          comm: 250,
                          status: "ITR-V Generated",
                          date: "Just now",
                          customerMobile: "+91 94432 10982",
                          customerPanOrGst: ocrData.pan,
                        });
                      }}
                      className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1 shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print ITR-V Receipt</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFileItrNow}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shrink-0 shadow-lg shadow-amber-400/25"
                    >
                      File ITR with Optimal New Regime
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESK 4: PAN CARD PROCESSING (49A / REPRINT)               */}
        {/* ========================================================= */}
        {activeDesk === "pan" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">PAN Card Processing Hub (UTIITSL / NSDL Standard)</h3>
                <p className="text-xs text-slate-500">New Form 49A applications, data corrections, and physical card delivery</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                  Govt Fee: ₹110 (Physical) / ₹66 (e-PAN)
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Margin: +₹25
                </span>
              </div>
            </div>

            {panSuccess ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">PAN Application Submitted & e-KYC Verified!</h4>
                <p className="text-xs text-slate-600">Acknowledgment Reference: UTI-PAN-908123992. Dispatch expected in 5 working days.</p>
                <button
                  onClick={() => {
                    setSelectedReceipt({
                      id: "UTI-PAN-908123992",
                      client: panApplicantName || "R. Karthikeyan",
                      service: "New Physical PAN (Form 49A)",
                      amount: 110,
                      comm: 25,
                      status: "Dispatched",
                      date: "Just now",
                      customerMobile: "+91 90807 12381",
                      customerPanOrGst: "Aadhaar e-KYC",
                    });
                  }}
                  className="px-5 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PAN Acknowledgment Slip</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handlePanSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Application Type <span className="text-rose-500">*</span></label>
                    <select
                      value={panType}
                      onChange={(e) => setPanType(e.target.value as any)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="new_49a">New PAN - Indian Citizen (Form 49A)</option>
                      <option value="correction">PAN Changes or Correction in Name/DOB</option>
                      <option value="reprint">Reprint / Lost PAN Card Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode <span className="text-rose-500">*</span></label>
                    <select
                      value={panCardMode}
                      onChange={(e) => setPanCardMode(e.target.value as any)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="physical_and_e">Physical Card Delivered to Home + Digital e-PAN (₹110)</option>
                      <option value="e_only">Only Digital e-PAN on Email (₹66)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Name (as in Aadhaar) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={panApplicantName}
                      onChange={(e) => setPanApplicantName(e.target.value)}
                      placeholder="e.g. R. Karthikeyan"
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={panDob}
                      onChange={(e) => setPanDob(e.target.value)}
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit Aadhaar No <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={panAadhaar}
                      onChange={(e) => setPanAadhaar(e.target.value)}
                      maxLength={12}
                      placeholder="XXXX-XXXX-XXXX"
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Submit PAN Application & Deduct Wallet
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESK 5: PASSPORT SEVA SUVIDHA                             */}
        {/* ========================================================= */}
        {activeDesk === "passport" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Passport Seva Suvidha (Ministry of External Affairs)</h3>
                <p className="text-xs text-slate-500">Fresh / Re-issue Normal & Tatkaal appointment booking and document checklist</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                  Fee: ₹1,500 / ₹3,500 (Tatkaal)
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Your Margin: +₹350
                </span>
              </div>
            </div>

            {passportSuccess ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Passport Appointment Slot Reserved!</h4>
                <p className="text-xs text-slate-600">Location: {passportCity} | Appt Time: 28 Aug 2026, 10:30 AM (Batch 4)</p>
                <button
                  onClick={() => {
                    setSelectedReceipt({
                      id: "PSK-908123",
                      client: passportName || "V. Sangeetha",
                      service: `Passport Seva (${passportType.toUpperCase()} - ${passportPages} Pgs)`,
                      amount: passportType === "normal" ? 1500 : 3500,
                      comm: 350,
                      status: "Slot Booked",
                      date: "Just now",
                      customerMobile: "+91 98421 77651",
                      customerPanOrGst: passportCity,
                    });
                  }}
                  className="px-5 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Passport Appointment Slip</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handlePassportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Scheme <span className="text-rose-500">*</span></label>
                    <select
                      value={passportType}
                      onChange={(e) => setPassportType(e.target.value as any)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="normal">Normal Scheme (₹1,500)</option>
                      <option value="tatkaal">Tatkaal Emergency (₹3,500)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Booklet Pages <span className="text-rose-500">*</span></label>
                    <select
                      value={passportPages}
                      onChange={(e) => setPassportPages(e.target.value as any)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="36">36 Pages (Standard Traveler)</option>
                      <option value="60">60 Pages (Frequent Flyer Jumbo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PSK Appointment Hub <span className="text-rose-500">*</span></label>
                    <select
                      value={passportCity}
                      onChange={(e) => setPassportCity(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="Chennai PSK">Chennai PSK (Saligramam)</option>
                      <option value="Salem PSK">Salem PSK</option>
                      <option value="Coimbatore PSK">Coimbatore PSK</option>
                      <option value="Madurai PSK">Madurai PSK</option>
                      <option value="Bangalore PSK">Bangalore PSK</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Full Name (Given + Surname) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={passportName}
                      onChange={(e) => setPassportName(e.target.value)}
                      placeholder="e.g. V. Sangeetha"
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type <span className="text-rose-500">*</span></label>
                    <select className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium">
                      <option>Private Sector</option>
                      <option>Self Employed / Business</option>
                      <option>Government / PSU</option>
                      <option>Student</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Reserve PSK Slot & Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESK 6: DYNAMIC GOVERNMENT CERTIFICATES                   */}
        {/* ========================================================= */}
        {activeDesk === "certs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dynamic E-District Government Certificates</h3>
                <p className="text-xs text-slate-500">Income, Community, Nativity & First Graduate certificates with QR digital verification seal</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                  Fee: ₹150
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Margin: +₹45
                </span>
              </div>
            </div>

            {/* Certificate Preview Modal */}
            {certPreviewModal && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-700" />
                    <span className="text-sm font-bold text-slate-900">Official Digital Certificate Preview</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700">{certPreviewModal.certNum}</span>
                </div>

                <div className="p-6 bg-white border-2 border-amber-300 rounded-2xl space-y-4 text-center font-serif text-slate-900 shadow-inner">
                  <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Government of Tamil Nadu - Revenue Department</div>
                  <div className="text-lg font-bold underline text-blue-900 uppercase">
                    {certPreviewModal.type === "income" ? "Certificate of Annual Income" : `${certPreviewModal.type.toUpperCase()} Certificate`}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto font-sans">
                    This is to certify that <strong>{certPreviewModal.applicant}</strong>, residing at Salem District, has an assessed annual family income of <strong>₹{Number(certPreviewModal.income).toLocaleString()}</strong> (Rupees One Lakh Eighty Thousand Only).
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-xs font-sans text-left">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-10 h-10 text-slate-900" />
                      <div className="text-[10px] text-slate-500">
                        <div>Date of Issue: {certPreviewModal.date}</div>
                        <div className="text-emerald-700 font-bold">✓ Digitally Signed by Tahsildar</div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-700">
                      <div>Revenue Authority Seal</div>
                      <div className="text-slate-400">Salem Taluk</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedReceipt({
                        id: certPreviewModal.certNum,
                        client: certPreviewModal.applicant,
                        service: `Digital ${certPreviewModal.type.toUpperCase()} Certificate`,
                        amount: 150,
                        comm: 45,
                        status: "Digital Seal Issued",
                        date: "Just now",
                        customerMobile: "+91 99441 12390",
                        customerPanOrGst: certPreviewModal.certNum,
                      });
                    }}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Certificate & Customer Receipt</span>
                  </button>
                  <button
                    onClick={() => setCertPreviewModal(null)}
                    className="px-4 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            )}

            {!certPreviewModal && (
              <form onSubmit={handleCertGenerate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Certificate Category <span className="text-rose-500">*</span></label>
                    <select
                      value={certType}
                      onChange={(e) => setCertType(e.target.value as any)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="income">Annual Income Certificate</option>
                      <option value="community">Community / Caste Certificate (OBC/BC/SC)</option>
                      <option value="nativity">Nativity / Domicile Certificate</option>
                      <option value="first_grad">First Graduate in Family Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Full Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={certApplicant}
                      onChange={(e) => setCertApplicant(e.target.value)}
                      placeholder="e.g. M. Rajesh Kumar"
                      required
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                {certType === "income" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income (₹) <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        value={certAnnualIncome}
                        onChange={(e) => setCertAnnualIncome(e.target.value)}
                        required
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Source of Income</label>
                      <select className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium">
                        <option>Agriculture & Allied</option>
                        <option>Small Business / Retail</option>
                        <option>Private Salary</option>
                        <option>Daily Wages</option>
                      </select>
                    </div>
                  </div>
                )}

                {certType === "community" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Community Classification <span className="text-rose-500">*</span></label>
                      <select
                        value={certCommunity}
                        onChange={(e) => setCertCommunity(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="OBC">Other Backward Class (OBC)</option>
                        <option value="BC">Backward Class (BC)</option>
                        <option value="MBC">Most Backward Class (MBC)</option>
                        <option value="SC">Scheduled Caste (SC)</option>
                        <option value="ST">Scheduled Tribe (ST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Caste Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kongu Vellalar"
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Generate Digital Certificate & Seal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* RECENT STORE FILINGS TABLE & PRINT RECEIPT ACTIONS       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Counter Filings & Receipts</h2>
            <p className="text-xs text-slate-500">Click any transaction to print A4 Invoice or 80mm Thermal POS receipt</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Reference No</th>
                <th className="p-4">Customer / Enterprise</th>
                <th className="p-4">Service Desk</th>
                <th className="p-4">Fee Charged</th>
                <th className="p-4">Your Margin</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Print Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{f.id}</td>
                  <td className="p-4 font-bold text-slate-900">{f.client}</td>
                  <td className="p-4">{f.service}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">₹{f.amount.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-emerald-600">+₹{f.comm.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200 text-[11px]">
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(f)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
