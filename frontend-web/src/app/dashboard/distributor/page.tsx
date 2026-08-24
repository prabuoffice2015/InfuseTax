"use client";

import React, { useState } from "react";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Send, 
  Check, 
  Search, 
  Plus, 
  ShieldCheck, 
  Award, 
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  History,
  Lock,
  Download,
  Percent,
  UserPlus,
  X,
  Building2,
  AlertCircle
} from "lucide-react";
import { getAuthToken } from "@/lib/auth";

export default function DistributorDashboardPage() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState("RET1029");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Onboard Retailer Form State
  const [newShopName, setNewShopName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newCity, setNewCity] = useState("Madurai");
  const [newState, setNewState] = useState("Tamil Nadu");
  const [newOpeningBal, setNewOpeningBal] = useState("5000");
  const [newPassword, setNewPassword] = useState("Retailer@1234");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState("");
  const [onboardErrorMsg, setOnboardErrorMsg] = useState("");

  const [retailers, setRetailers] = useState([
    { id: 1, code: "RET1029", shop: "Ramesh Digital Seva", owner: "Ramesh Kumar", city: "Chennai, TN", balance: 48750, monthlyTx: 142, marginPct: 20, status: "Active" },
    { id: 2, code: "RET1088", shop: "Kumar Tax & GST Point", owner: "Senthil Nathan", city: "Madurai, TN", balance: 12400, monthlyTx: 88, marginPct: 20, status: "Active" },
    { id: 3, code: "RET1102", shop: "Sai E-Governance Center", owner: "Vignesh Raj", city: "Coimbatore, TN", balance: 5200, monthlyTx: 64, marginPct: 18, status: "Active" },
    { id: 4, code: "RET1145", shop: "Apex CSC Tax Desk", owner: "Kavitha Priya", city: "Salem, TN", balance: 28900, monthlyTx: 110, marginPct: 22, status: "Active" },
    { id: 5, code: "RET1190", shop: "Citizen Seva Kendra", owner: "Mohan Dass", city: "Tiruchirappalli, TN", balance: 1580, monthlyTx: 35, marginPct: 20, status: "Active" },
  ]);

  const [transferHistory, setTransferHistory] = useState([
    { id: "P2P-9081", toCode: "RET1029", toName: "Ramesh Digital Seva", amount: 15000, date: "23 Aug 2026, 14:10", remarks: "Emergency tax filing liquidity" },
    { id: "P2P-9080", toCode: "RET1088", toName: "Kumar Tax Point", amount: 25000, date: "22 Aug 2026, 11:30", remarks: "GST Return filing top-up" },
    { id: "P2P-9079", toCode: "RET1145", toName: "Apex CSC Tax Desk", amount: 10000, date: "21 Aug 2026, 16:45", remarks: "Weekend advance" },
  ]);

  const handleOnboardRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboarding(true);
    setOnboardErrorMsg("");
    setOnboardSuccessMsg("");

    try {
      const token = getAuthToken();
      const res = await fetch("/api/v1/distributor/retailers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: `${newShopName} (${newOwnerName})`,
          email: newEmail,
          mobile: newMobile,
          role: "retailer",
          city: newCity,
          state: newState,
          opening_balance: parseFloat(newOpeningBal) || 0,
          password: newPassword,
        })
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        const newEntry = {
          id: Date.now(),
          code: `RET${Math.floor(1200 + Math.random() * 800)}`,
          shop: newShopName,
          owner: newOwnerName,
          city: `${newCity}, TN`,
          balance: parseFloat(newOpeningBal) || 0,
          monthlyTx: 0,
          marginPct: 20,
          status: "Active"
        };
        setRetailers([newEntry, ...retailers]);
        setOnboardSuccessMsg(`✓ Retailer "${newShopName}" provisioned successfully!`);
        setTimeout(() => {
          setShowOnboardModal(false);
          setOnboardSuccessMsg("");
          setNewShopName("");
          setNewOwnerName("");
          setNewEmail("");
          setNewMobile("");
        }, 1500);
      } else {
        setOnboardErrorMsg(data.message || "Failed to onboard retailer.");
      }
    } catch (err: any) {
      setOnboardErrorMsg("Network error connecting to backend API.");
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleP2pTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) return;

    const target = retailers.find(r => r.code === selectedRetailer);
    setRetailers(retailers.map(r => r.code === selectedRetailer ? { ...r, balance: r.balance + amt } : r));

    const newLog = {
      id: `P2P-${Math.floor(9082 + Math.random() * 100)}`,
      toCode: selectedRetailer,
      toName: target?.shop || selectedRetailer,
      amount: amt,
      date: "Just now",
      remarks: transferRemarks || "Instant P2P Balance Allocation",
    };
    setTransferHistory([newLog, ...transferHistory]);
    setTransferSuccess(true);

    setTimeout(() => {
      setTransferSuccess(false);
      setShowTransferModal(false);
      setTransferAmount("");
      setTransferRemarks("");
    }, 1200);
  };

  const openTransferFor = (code: string) => {
    setSelectedRetailer(code);
    setShowTransferModal(true);
  };

  const filteredRetailers = retailers.filter(r => 
    r.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Tier 2: Master Distributor Network Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Network Operations & Liquidity Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage downline retail outlets, disburse instant P2P wallet balance, and track overriding commissions.
          </p>
        </div>        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowOnboardModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/25 flex items-center space-x-2 transition-transform transform hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Onboard Downline Retailer</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-5 py-3 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-2xl border border-purple-200 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-purple-700" />
            <span>Allocate Balance (P2P)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Downline Retailers</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{retailers.length} Active</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+4 onboarded this week</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Distributor Liquidity</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">₹4,50,000</div>
          <div className="text-[11px] text-slate-500 font-medium">Ready for instant allocation</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Network Tax Volume</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">₹84.2 Lakhs</div>
          <div className="text-[11px] text-indigo-600 font-semibold">1,240 returns filed</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Override Commission</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">₹1,42,800</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Auto-credited per filing</div>
        </div>
      </div>

      {/* Downline Retailers Directory */}
      <div id="retailers" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Downline Retailer Outlets</h2>
            <p className="text-xs text-slate-500">Monitor store liquidity, monthly filings, and disburse wallet balances</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shop, code or owner..."
                className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Outlet</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Retailer Code</th>
                <th className="p-4">Store / Business Name</th>
                <th className="p-4">Proprietor</th>
                <th className="p-4">Location</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4">Monthly Filings</th>
                <th className="p-4">Margin %</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRetailers.map((ret) => (
                <tr key={ret.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700">{ret.code}</td>
                  <td className="p-4 font-bold text-slate-900">{ret.shop}</td>
                  <td className="p-4">{ret.owner}</td>
                  <td className="p-4 text-slate-500">{ret.city}</td>
                  <td className="p-4 font-mono font-bold text-emerald-600">₹{ret.balance.toLocaleString()}</td>
                  <td className="p-4 font-mono">{ret.monthlyTx} filings</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ret.marginPct}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {ret.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openTransferFor(ret.code)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg transition-colors border border-purple-200 cursor-pointer"
                    >
                      Top-Up Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P2P Transfer History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Parent-to-Child Disbursals</h2>
            <p className="text-xs text-slate-500">Live double-entry audit trail of wallet transfers to downline retailers</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-700">
            <History className="w-4 h-4" />
            <span>Audit Synchronized</span>
          </div>
        </div>

        <div className="space-y-3">
          {transferHistory.map((tx) => (
            <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold font-mono text-xs">
                  P2P
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{tx.toName} ({tx.toCode})</div>
                  <div className="text-[11px] text-slate-500">{tx.remarks} • {tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-purple-700">-₹{tx.amount.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Settled Instantly</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Onboard Downline Retailer Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard Downline Retailer Outlet</h3>
                  <p className="text-xs text-slate-500">Tier 2 Zonal Franchise Provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{onboardSuccessMsg}</span>
              </div>
            )}

            {onboardErrorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{onboardErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleOnboardRetailer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Balaji Tax Seva"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proprietor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Senthil Kumar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="senthil.tax@infusetax.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="+91 98421 77889"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Madurai"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Wallet Disbursal (₹)</label>
                  <input
                    type="number"
                    value={newOpeningBal}
                    onChange={(e) => setNewOpeningBal(e.target.value)}
                    placeholder="5000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Retailer@1234"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl text-[11px] text-purple-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Downline Linkage & Commission Settlement</span>
                </div>
                <p>This retailer will be linked under your Master Distributor account. All filing margin overrides will auto-credit to your distributor wallet.</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/25 flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isOnboarding ? (
                    <span>Provisioning Retailer...</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Provision Outlet Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: P2P Wallet Allocation Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">P2P Wallet Allocation</h3>
                  <p className="text-xs text-slate-500">Instant parent-to-child liquidity disbursal</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccess ? (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Disbursal Completed!</h4>
                <p className="text-xs text-slate-600">₹{Number(transferAmount).toLocaleString()} credited instantly to Retailer {selectedRetailer}.</p>
              </div>
            ) : (
              <form onSubmit={handleP2pTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Downline Retailer</label>
                  <select
                    value={selectedRetailer}
                    onChange={(e) => setSelectedRetailer(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 font-medium"
                  >
                    {retailers.map(r => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.shop} ({r.owner})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transfer Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    required
                    min="1"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Reference Note (Optional)</label>
                  <input
                    type="text"
                    value={transferRemarks}
                    onChange={(e) => setTransferRemarks(e.target.value)}
                    placeholder="e.g. Weekend advance liquidity"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                  ⚡ <strong>Zero Gateway Fees:</strong> Parent-to-child wallet transfers settle with double-entry ACID safety.
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-700/20 cursor-pointer"
                  >
                    Disburse Balance Now
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
