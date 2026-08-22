"use client";

import React, { useState } from "react";
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
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function CompanyDashboardPage() {
  // White-Label Config State
  const [companyName, setCompanyName] = useState("InfuseTax Technologies");
  const [primaryColor, setPrimaryColor] = useState("#1E40AF");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");
  const [smsSenderId, setSmsSenderId] = useState("INFUST");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    gst: true,
    itr: true,
    pan: true,
    passport: true,
    certificates: true,
    aiOcr: true,
  });

  // Pending UTR Topup Requests
  const [pendingUtrs, setPendingUtrs] = useState([
    { id: 1, retailer: "Ramesh Digital Seva (#RET1029)", bank: "HDFC Bank", utr: "423519827361", amount: 25000, date: "22 Aug 2026, 14:20" },
    { id: 2, retailer: "Kumar Tax Point (#RET1088)", bank: "ICICI Bank", utr: "991823746123", amount: 50000, date: "22 Aug 2026, 14:45" },
    { id: 3, retailer: "Sai E-Seva Center (#RET1102)", bank: "SBI Bank", utr: "128472910394", amount: 10000, date: "22 Aug 2026, 15:10" },
  ]);

  const handleApproveUtr = (id: number) => {
    setPendingUtrs(pendingUtrs.filter(item => item.id !== id));
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Tier 1: Tenant Super Admin Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Company Management & Master Audit Desk
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>Multi-Tenant Engine Online</span>
          </span>
        </div>
      </div>

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
            <span>Total Retailer Outlets</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">1,480</div>
          <div className="text-[11px] text-indigo-600 font-semibold">Across 42 Master Distributors</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending UTR Top-Ups</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">{pendingUtrs.length} Requests</div>
          <div className="text-[11px] text-slate-500 font-medium">₹85,000 awaiting approval</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Monthly Tax Filings</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">12,840</div>
          <div className="text-[11px] text-emerald-600 font-semibold">₹1.84 Cr customer tax refunds</div>
        </div>
      </div>

      {/* Section: Pending UTR Approvals */}
      <div id="utr-approvals" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Retailer UTR Bank Deposit Approval Queue</h2>
              <p className="text-xs text-slate-500">Verify bank deposit references and credit retailer wallets instantly</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
            {pendingUtrs.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          {pendingUtrs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              ✓ All pending UTR deposit requests have been approved.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Retailer Outlet</th>
                  <th className="p-4">Deposit Bank</th>
                  <th className="p-4">Bank UTR Reference</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Submission Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingUtrs.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{req.retailer}</td>
                    <td className="p-4">{req.bank}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{req.utr}</td>
                    <td className="p-4 font-bold text-slate-900 font-mono">₹{req.amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-500">{req.date}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproveUtr(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all"
                      >
                        Approve & Credit
                      </button>
                      <button
                        onClick={() => handleApproveUtr(req.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold rounded-lg border border-slate-200 transition-all"
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

      {/* Section: White-Label Branding Engine */}
      <div id="branding" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">White-Label Branding & Theming Engine</h2>
              <p className="text-xs text-slate-500">Configure your company identity, custom domain, SMS sender ID, and feature matrix</p>
            </div>
          </div>

          {saveSuccess && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Saved Successfully!</span>
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">SMS Sender ID (6 Chars)</label>
              <input
                type="text"
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Theme Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Secondary Accent Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Feature Matrix Toggles */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Service Activation Matrix</h4>
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
                <span>Income Tax (ITR) Filing</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={featureFlags.aiOcr}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, aiOcr: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>AI Form 16 OCR Parser</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={featureFlags.pan}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, pan: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>PAN Card Desk (Form 49A)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={featureFlags.passport}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, passport: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Passport Application Desk</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={featureFlags.certificates}
                  onChange={(e) => setFeatureFlags({ ...featureFlags, certificates: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Dynamic Government Certs</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/20 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Tenant Branding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
