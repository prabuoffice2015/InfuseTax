"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Plus, 
  Sparkles, 
  Bell, 
  User, 
  Building2, 
  Search, 
  Check, 
  ArrowUpRight 
} from "lucide-react";

import AiCopilotDrawer from "@/components/dashboard/AiCopilotDrawer";

interface NavbarProps {
  userTitle?: string;
  userCode?: string;
  walletBalance?: number;
}

export default function Navbar({
  userTitle = "Ramesh Kumar",
  userCode = "INF1029",
  walletBalance = 48750.00
}: NavbarProps) {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [utrAmount, setUtrAmount] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank (A/c: 50200012345678)");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowTopupModal(false);
      setUtrAmount("");
      setUtrNo("");
    }, 1500);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left: Tenant Code & Search */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-xl">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900 font-mono">Tenant: INFUSE</span>
          </div>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search services, GSTIN, PAN..."
              className="bg-transparent text-xs text-slate-700 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right: Wallet Balance, AI Status & Profile */}
        <div className="flex items-center space-x-4">
          {/* Live AI Copilot Status Trigger Button */}
          <button
            type="button"
            onClick={() => setShowAiDrawer(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 hover:border-amber-300 rounded-full text-xs font-semibold text-amber-800 transition-all cursor-pointer shadow-xs transform hover:scale-105"
            title="Open AI Tax & Compliance Copilot Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI Copilot Active</span>
          </button>

          {/* Wallet Balance Badge */}
          <div className="flex items-center bg-slate-900 text-white rounded-xl pl-3.5 pr-1.5 py-1.5 shadow-md shadow-slate-900/10">
            <div className="flex items-center space-x-2 mr-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Wallet Balance</div>
                <div className="text-xs sm:text-sm font-extrabold text-white font-mono leading-tight">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTopupModal(true)}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold"
              title="Request Bank UTR Top-Up"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Top Up</span>
            </button>
          </div>

          {/* Notifications */}
          <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {userTitle.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">{userTitle}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{userCode}</div>
              </div>
            </div>

            {/* Role Switcher Links */}
            <div className="hidden xl:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <Link href="/dashboard/company" className="px-2 py-1 rounded-lg hover:bg-white text-slate-700">Admin</Link>
              <Link href="/dashboard/distributor" className="px-2 py-1 rounded-lg hover:bg-white text-slate-700">Distributor</Link>
              <Link href="/dashboard/retailer" className="px-2 py-1 rounded-lg hover:bg-white text-slate-700">Retailer</Link>
              <Link href="/dashboard/operator" className="px-2 py-1 rounded-lg hover:bg-white text-slate-700">Operator</Link>
            </div>

            {/* Logout Button */}
            <Link
              href="/sign-in"
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
              title="Sign Out to Login Desk"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Manual Bank UTR Top-Up Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Wallet Top-Up Request</h3>
                  <p className="text-xs text-slate-500">Deposit to Company Bank & submit UTR</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Top-Up Request Submitted!</h4>
                <p className="text-xs text-slate-600">Company Accountant will verify UTR and credit your wallet within 15 mins.</p>
              </div>
            ) : (
              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Deposit Company Bank Account</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option>HDFC Bank (A/c: 50200012345678, IFSC: HDFC0001234)</option>
                    <option>ICICI Bank (A/c: 001105009988, IFSC: ICIC0000011)</option>
                    <option>State Bank of India (A/c: 33445566778, IFSC: SBIN0004567)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top-Up Amount (₹) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={utrAmount}
                    onChange={(e) => setUtrAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    required
                    min="100"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank UTR / IMPS Reference No <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={utrNo}
                    onChange={(e) => setUtrNo(e.target.value)}
                    placeholder="e.g. 423512349876"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20"
                  >
                    Submit UTR for Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Tax Copilot Assistant Drawer */}
      <AiCopilotDrawer 
        isOpen={showAiDrawer} 
        onClose={() => setShowAiDrawer(false)} 
      />
    </>
  );
}
