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
  Percent
} from "lucide-react";

export default function DistributorDashboardPage() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState("RET1029");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-700/25 flex items-center space-x-2 shrink-0 transition-transform transform hover:scale-[1.02]"
        >
          <Send className="w-4 h-4" />
          <span>Allocate Retailer Balance (P2P)</span>
        </button>
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
                <th className="p-4 text-right">Liquidity Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRetailers.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700">{ret.code}</td>
                  <td className="p-4 font-bold text-slate-900">{ret.shop}</td>
                  <td className="p-4 text-slate-700">{ret.owner}</td>
                  <td className="p-4 text-slate-500">{ret.city}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    ₹{ret.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200">
                      {ret.monthlyTx} returns
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 font-mono">{ret.marginPct}%</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200 text-[10px]">
                      {ret.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openTransferFor(ret.code)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold rounded-lg transition-all border border-purple-200 text-xs inline-flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Transfer Money</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P2P Disbursal Logs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent P2P Balance Transfers</h2>
              <p className="text-xs text-slate-500">History of wallet disbursements to downline stores</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Transfer ID</th>
                <th className="p-4">Recipient Store</th>
                <th className="p-4">Amount Disbursed</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Remarks</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transferHistory.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-purple-700">{t.id}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{t.toName}</span>{" "}
                    <span className="font-mono text-slate-400 text-[11px]">({t.toCode})</span>
                  </td>
                  <td className="p-4 font-mono font-extrabold text-emerald-600">₹{t.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-500">{t.date}</td>
                  <td className="p-4 text-slate-700">{t.remarks}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] border border-emerald-200">
                      SETTLED ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P2P Fund Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Disburse Wallet Liquidity (P2P)</h3>
                  <p className="text-xs text-slate-500">Atomic instant debit from your wallet to downline</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {transferSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Transfer Successful!</h4>
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
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-700/20"
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
