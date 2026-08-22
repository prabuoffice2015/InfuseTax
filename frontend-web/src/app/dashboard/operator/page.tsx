"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Plane, 
  Award, 
  Clock, 
  Printer, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function OperatorTerminalPage() {
  const [activeShiftHours, setActiveShiftHours] = useState("4h 18m");

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Tier 4: Store Operator Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Counter Execution & Shift Terminal
          </h1>
        </div>

        {/* Active Shift Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Active Shift: {activeShiftHours}</span>
          </div>
        </div>
      </div>

      {/* Operator Scoped Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-3 text-xs text-blue-900">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Operator Scoped Permissions:</strong> You have authorization to file GST, ITR, PAN, Passport, and Dynamic Certificates on behalf of walk-in customers. Financial ledger withdrawals and store ownership settings are restricted to the store manager.
        </div>
      </div>

      {/* Quick Launch Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/retailer"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">GST Registration</h3>
            <p className="text-xs text-slate-500 mt-1">Proprietorship, Partnership, LLP & Pvt Ltd registrations</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Launch Desk</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/dashboard/retailer"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Form 16 ITR Auto-Filing</h3>
            <p className="text-xs text-slate-500 mt-1">Upload PDF for instant 2-second AI OCR data auto-fill</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Launch Desk</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/dashboard/retailer"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">PAN Card Application</h3>
            <p className="text-xs text-slate-500 mt-1">New 49A, Demographic Correction & Lost Reprint</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Launch Desk</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Shift Activity Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Your Shift Applications Log</h2>
          <p className="text-xs text-slate-500">All customer filings initiated during your current login session</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Desk</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-mono text-slate-500">14:15</td>
                <td className="p-4 font-bold text-slate-900">Sri Balaji Traders</td>
                <td className="p-4">GST Registration</td>
                <td className="p-4"><span className="text-emerald-600 font-bold">✓ Submitted</span></td>
                <td className="p-4 text-right">
                  <button onClick={() => alert('Printing receipt...')} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200">
                    <Printer className="w-3.5 h-3.5 inline mr-1" /> Print
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-mono text-slate-500">12:40</td>
                <td className="p-4 font-bold text-slate-900">Murugan Textiles</td>
                <td className="p-4">GSTR-3B Return</td>
                <td className="p-4"><span className="text-emerald-600 font-bold">✓ Filed</span></td>
                <td className="p-4 text-right">
                  <button onClick={() => alert('Printing receipt...')} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200">
                    <Printer className="w-3.5 h-3.5 inline mr-1" /> Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
