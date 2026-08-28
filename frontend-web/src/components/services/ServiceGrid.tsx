"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Receipt, 
  FileSpreadsheet, 
  Building, 
  Sparkles, 
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowRight
} from "lucide-react";

export default function ServiceGrid() {
  const [activeTab, setActiveTab] = useState<"all" | "gst" | "itr">("all");

  const services = [
    {
      id: "gst-registration",
      category: "gst",
      icon: Building,
      badge: "Fast Track 3-7 Days",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      title: "GST Registration Desk",
      subtitle: "Sole Prop, Pvt Ltd, Partnership & LLP",
      desc: "Complete end-to-end GST registration with instant TRN generation, mandatory color scanned KYC document verification, Aadhaar e-KYC authentication, and live ARN tracking.",
      features: [
        "1a. Sole Proprietorship (11 Documents Checklist)",
        "1b. Private Limited Company (Dual Director & COI)",
        "1c. Partnership Firm / LLP (Firm Deed & RoF)",
        "15-Digit GSTIN Certificate Issuance",
      ],
      color: "from-blue-600 to-indigo-600",
      link: "/sign-in",
    },
    {
      id: "itr-filing",
      category: "itr",
      icon: FileSpreadsheet,
      badge: "AY 2025-26 Budget Ready",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "Income Tax (IT) Return Filing",
      subtitle: "Individual & Business Person Desks",
      desc: "Comprehensive IT filing engine with ITD login credentials integration, 01st Apr to 31st Mar annual bank statements upload, and AI regime comparison (Old vs. New ₹75k Standard Deduction).",
      features: [
        "Individual (Salaried / Pensioner ITR-1 / 2)",
        "Business Person (ITR-3 / 4 Presumptive)",
        "Full FY Bank Statements (01 Apr - 31 Mar)",
        "Instant Verified ITR-V Slip Download",
      ],
      color: "from-emerald-600 to-teal-600",
      link: "/sign-in",
    },
    {
      id: "gst-filing",
      category: "gst",
      icon: Receipt,
      badge: "TaxBuddy Standard",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      title: "GST Return Filing (GSTR-1 & 3B)",
      subtitle: "Monthly / Quarterly QRMP Compliance",
      desc: "Automated monthly return filing with auto-calculated outward supplies liability, Input Tax Credit (ITC 2B) reconciliation, cash ledger set-off, and instant ARN assignment.",
      features: [
        "GSTR-1 (Outward Supplies & Sales B2B/B2C)",
        "GSTR-3B (Summary Return & Tax Cash Ledger)",
        "Automated ITC 2B Set-off & Anomaly Alerts",
        "Instant B2B Tax Invoice & Receipt Printing",
      ],
      color: "from-indigo-600 to-purple-600",
      link: "/sign-in",
    },
  ];

  const filteredServices = activeTab === "all" 
    ? services 
    : services.filter(s => s.category === activeTab);

  return (
    <section id="services" className="py-20 lg:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-blue-200 rounded-full px-4 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>InfuseTax Core Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The 3 Core Tax & Compliance Desks
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Engineered to industry standards of <strong className="text-slate-800">TaxBuddy</strong> & <strong className="text-slate-800">eTaxPrime</strong> — providing your distributor, retailer, and counter network with 100% statutory accuracy.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl space-x-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              All 3 Services
            </button>
            <button
              onClick={() => setActiveTab("gst")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "gst" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              GST Desks (Registration & Returns)
            </button>
            <button
              onClick={() => setActiveTab("itr")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "itr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Income Tax (IT) Filing
            </button>
          </div>
        </div>

        {/* Services Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredServices.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-400 mb-3">{item.subtitle}</div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action */}
                <Link
                  href={item.link}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-2 border border-slate-200 hover:border-transparent group/btn"
                >
                  <span>Launch Filing Desk</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
