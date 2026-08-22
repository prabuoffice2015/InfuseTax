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
  AlertCircle
} from "lucide-react";

export default function RetailerDashboardPage() {
  const [activeDesk, setActiveDesk] = useState<"gst_reg" | "gstr_filing" | "itr" | "pan" | "passport" | "certs">("gst_reg");
  
  // GST Reg Form State
  const [gstTradeName, setGstTradeName] = useState("");
  const [gstEntityType, setGstEntityType] = useState("proprietorship");
  const [gstPan, setGstPan] = useState("");
  const [gstMobile, setGstMobile] = useState("");
  const [gstRegSuccess, setGstRegSuccess] = useState(false);

  // Form 16 AI OCR State
  const [isAnalyzingOcr, setIsAnalyzingOcr] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);

  // Recent Filings History
  const [filings, setFilings] = useState([
    { id: "GSTREG1082", client: "Sri Balaji Traders", service: "GST Registration", amount: 1500, comm: 300, status: "ARN Generated", date: "Today, 14:15" },
    { id: "GSTR3B-771", client: "Murugan Textiles", service: "GSTR-3B Filing", amount: 500, comm: 150, status: "Completed", date: "Today, 12:40" },
    { id: "ITR2026-44", client: "Dr. Ananya Sharma", service: "ITR-1 (Salaried)", amount: 800, comm: 250, status: "ITR-V Uploaded", date: "Yesterday" },
    { id: "PAN49A-992", client: "K. Selvam", service: "New PAN (Form 49A)", amount: 110, comm: 25, status: "Dispatched", date: "20 Aug 2026" },
  ]);

  const handleSimulateForm16Upload = () => {
    setIsAnalyzingOcr(true);
    setOcrData(null);

    setTimeout(() => {
      setIsAnalyzingOcr(false);
      setOcrData({
        pan: "ABCDE1234F",
        employer: "TechCorp Solutions Pvt Ltd",
        grossSalary: 1250000,
        standardDeduction: 50000,
        sec80C: 150000,
        sec80D: 25000,
        tdsDeducted: 87500,
        oldTaxLiability: 82500,
        newTaxLiability: 65000,
        optimalRegime: "NEW",
        netRefund: 22500,
      });
    }, 1800);
  };

  const handleGstRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGstRegSuccess(true);
    const newEntry = {
      id: `GSTREG${Math.floor(1000 + Math.random() * 9000)}`,
      client: gstTradeName,
      service: `GST Reg (${gstEntityType})`,
      amount: 1500,
      comm: 300,
      status: "TRN Created",
      date: "Just now",
    };
    setFilings([newEntry, ...filings]);

    setTimeout(() => {
      setGstRegSuccess(false);
      setGstTradeName("");
      setGstPan("");
      setGstMobile("");
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Tier 3: Retailer Counter POS Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Customer Tax Filing & Digital Desks
          </h1>
        </div>

        {/* Live Wallet & Commission Pill */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Today&apos;s Commission</div>
            <div className="text-sm font-extrabold text-emerald-900 font-mono">+₹725.00</div>
          </div>
        </div>
      </div>

      {/* Desk Selector Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        <button
          onClick={() => setActiveDesk("gst_reg")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "gst_reg" ? "bg-blue-700 text-white shadow-md shadow-blue-700/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Building className="w-4 h-4" />
          <span>GST Registration Desk</span>
        </button>

        <button
          onClick={() => setActiveDesk("gstr_filing")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "gstr_filing" ? "bg-blue-700 text-white shadow-md shadow-blue-700/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Receipt className="w-4 h-4" />
          <span>GSTR-1 & 3B Returns</span>
        </button>

        <button
          onClick={() => setActiveDesk("itr")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "itr" ? "bg-amber-600 text-white shadow-md shadow-amber-600/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Form 16 AI ITR Desk</span>
        </button>

        <button
          onClick={() => setActiveDesk("pan")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "pan" ? "bg-blue-700 text-white shadow-md shadow-blue-700/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <CreditCard className="w-4 h-4" />
          <span>PAN Card (49A)</span>
        </button>

        <button
          onClick={() => setActiveDesk("passport")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "passport" ? "bg-blue-700 text-white shadow-md shadow-blue-700/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Plane className="w-4 h-4" />
          <span>Passport Application</span>
        </button>

        <button
          onClick={() => setActiveDesk("certs")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all ${activeDesk === "certs" ? "bg-blue-700 text-white shadow-md shadow-blue-700/25" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
        >
          <Award className="w-4 h-4" />
          <span>Dynamic Certificates</span>
        </button>
      </div>

      {/* Main Workspace Card for Active Desk */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Desk 1: GST Registration Desk */}
        {activeDesk === "gst_reg" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">New GST Registration Desk (eTaxPrime Standard)</h3>
                <p className="text-xs text-slate-500">Capture applicant business information, upload proofs, and generate TRN</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                Fee: ₹1,500 | Your Margin: ₹300
              </span>
            </div>

            {gstRegSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">GST Registration Application Submitted!</h4>
                <p className="text-xs text-slate-600">TRN generated. Net fee of ₹1,200 deducted from wallet (Instant ₹300 commission retained).</p>
              </div>
            ) : (
              <form onSubmit={handleGstRegSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Entity Classification <span className="text-rose-500">*</span></label>
                    <select
                      value={gstEntityType}
                      onChange={(e) => setGstEntityType(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value="proprietorship">Sole Proprietorship</option>
                      <option value="partnership">Partnership Firm</option>
                      <option value="llp">Limited Liability Partnership (LLP)</option>
                      <option value="pvt_ltd">Private Limited Company</option>
                      <option value="opc">One Person Company (OPC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Business Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={gstTradeName}
                      onChange={(e) => setGstTradeName(e.target.value)}
                      placeholder="e.g. Sri Balaji Enterprises"
                      required
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PAN Card Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={gstPan}
                      onChange={(e) => setGstPan(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      required
                      maxLength={10}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Upload checklist */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mandatory Upload Checklist:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                      <div className="font-bold text-slate-900">1. PAN Card</div>
                      <div className="text-[10px] text-emerald-600">✓ Uploaded</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                      <div className="font-bold text-slate-900">2. Aadhaar e-KYC</div>
                      <div className="text-[10px] text-emerald-600">✓ Verified OTP</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                      <div className="font-bold text-slate-900">3. Electricity / Rent NOC</div>
                      <div className="text-[10px] text-emerald-600">✓ Attached PDF</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                      <div className="font-bold text-slate-900">4. Bank Passbook / Cheque</div>
                      <div className="text-[10px] text-emerald-600">✓ Attached PDF</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Net wallet deduction: <strong>₹1,200</strong> (Instant ₹300 margin earned)
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20"
                  >
                    Submit & Generate TRN
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Desk 2: GSTR-1 & 3B Returns */}
        {activeDesk === "gstr_filing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">GST Return Filing Desk (TaxBuddy Standard)</h3>
                <p className="text-xs text-slate-500">GSTR-1 Sales, GSTR-3B Summary & Input Tax Credit (ITC) reconciliation</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                Fee: ₹500 | Your Margin: ₹150
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>File GSTR-1 (Outward Supplies)</span>
                </h4>
                <p className="text-xs text-slate-600">Upload B2B/B2C Sales Excel or CSV invoices for automated JSON payload creation.</p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800">Click to Upload Sales Register</div>
                  <div className="text-[10px] text-slate-400">Excel / Tally Export (.xlsx / .csv)</div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>File GSTR-3B (Summary & Tax Payment)</span>
                </h4>
                <p className="text-xs text-slate-600">Auto-matches GSTR-2B Input Tax Credit to prevent supplier default notices.</p>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>AI ITC Reconciler Ready</span>
                  </div>
                  <div>Matches purchase registers with portal data with 0% mismatch.</div>
                </div>
                <button className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm">
                  Run GSTR-2B ITC Match & File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desk 3: Income Tax Form 16 AI OCR Desk */}
        {activeDesk === "itr" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Income Tax (ITR) Filing with AI Form 16 OCR</h3>
                <p className="text-xs text-slate-500">Auto-extract Form 16 PDF & calculate Old vs. New Tax Regime savings in 2 seconds</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                Fee: ₹800 | Your Margin: ₹250
              </span>
            </div>

            {/* Simulated OCR Upload Box */}
            <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-3xl p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Upload Form 16 PDF / Salary Slip</h4>
                <p className="text-xs text-slate-500">AI Vision automatically reads Part A + Part B without typing</p>
              </div>
              <button
                type="button"
                onClick={handleSimulateForm16Upload}
                disabled={isAnalyzingOcr}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-transform transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isAnalyzingOcr ? "AI OCR Extracting Data (1.2s)..." : "Simulate Form 16 PDF Auto-Scan"}
              </button>
            </div>

            {/* Extracted Data Result & Optimizer */}
            {ocrData && (
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AI OCR Extraction Completed (0.84s)</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAN: {ocrData.pan}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Gross Salary</div>
                    <div className="text-base font-bold text-white">₹{ocrData.grossSalary.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">80C + 80D Deductions</div>
                    <div className="text-base font-bold text-emerald-400">₹{(ocrData.sec80C + ocrData.sec80D).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">TDS Already Deducted</div>
                    <div className="text-base font-bold text-amber-400">₹{ocrData.tdsDeducted.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Tax Refund Due</div>
                    <div className="text-base font-bold text-sky-400">₹{ocrData.netRefund.toLocaleString()}</div>
                  </div>
                </div>

                {/* Old vs New Regime Comparison Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl border border-blue-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">AI Optimizer Recommendation</div>
                    <div className="text-sm font-bold text-white">New Tax Regime Saves Customer ₹17,500 in Net Tax!</div>
                  </div>
                  <button className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shrink-0">
                    File ITR-1 with New Regime
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desk 4, 5, 6: E-Gov / Dynamic Certs */}
        {(activeDesk === "pan" || activeDesk === "passport" || activeDesk === "certs") && (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeDesk === "pan" ? "PAN Card Processing Hub (Form 49A)" : activeDesk === "passport" ? "Passport & PCC Application Desk" : "Dynamic Government Certificates"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ready for high-speed client submission with instant wallet debit, automated acknowledgment slip generation, and receipt printing.
            </p>
            <button className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md">
              Open Full Filing Form
            </button>
          </div>
        )}
      </div>

      {/* Recent Filings Table & Receipt Printing */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Store Filings & Receipts</h2>
            <p className="text-xs text-slate-500">Track application statuses and print customer receipts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Reference No</th>
                <th className="p-4">Customer / Business</th>
                <th className="p-4">Service Desk</th>
                <th className="p-4">Fee Charged</th>
                <th className="p-4">Your Margin</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{f.id}</td>
                  <td className="p-4 font-bold text-slate-900">{f.client}</td>
                  <td className="p-4">{f.service}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">₹{f.amount}</td>
                  <td className="p-4 font-mono font-bold text-emerald-600">+₹{f.comm}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200 text-[11px]">
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => alert(`Printing official InfuseTax receipt for ${f.id}...`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all border border-slate-200 text-xs inline-flex items-center space-x-1"
                    >
                      <Printer className="w-3 h-3" />
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
