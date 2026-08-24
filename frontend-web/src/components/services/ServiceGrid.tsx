"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Plane, 
  Award, 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2,
  FileCheck2,
  Building,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

export default function ServiceGrid() {
  const [activeTab, setActiveTab] = useState<"all" | "gst" | "itr" | "egov">("all");

  const services = [
    {
      id: "gst-registration",
      category: "gst",
      icon: Building,
      badge: "Fast Track 3-7 Days",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      title: "GST Registration (New GSTIN)",
      subtitle: "Turnover > ₹40L (Goods) / ₹20L (Services)",
      desc: "Complete end-to-end GST registration for Proprietorships, Partnerships, LLPs, and Pvt Ltd companies with instant TRN generation, Aadhaar e-KYC authentication, and ARN tracking.",
      features: [
        "Proprietorship, Partnership, LLP & Pvt Ltd",
        "Aadhaar OTP e-KYC & TRN Generation",
        "Principal Place Proof & Rent NOC Review",
        "15-Digit GSTIN Certificate Issuance",
      ],
      color: "from-blue-600 to-indigo-600",
      link: "/sign-in",
    },
    {
      id: "gst-filing",
      category: "gst",
      icon: Receipt,
      badge: "TaxBuddy Standard",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      title: "GST Return Filing (GSTR-1 & 3B)",
      subtitle: "Monthly / Quarterly QRMP & CMP-08",
      desc: "Automated return filing for regular and composition taxpayers. Includes AI-powered GSTR-2B Input Tax Credit (ITC) reconciliation to prevent supplier mismatches and penalty notices.",
      features: [
        "GSTR-1 (Sales Outward) & IFF Invoices",
        "GSTR-3B (Summary, ITC & Tax Cash Ledger)",
        "CMP-08 Composition & GSTR-9 Annual Return",
        "AI Anomaly Checker & ITC Mismatch Alerts",
      ],
      color: "from-indigo-600 to-sky-600",
      link: "/sign-in",
    },
    {
      id: "itr-filing",
      category: "itr",
      icon: FileSpreadsheet,
      badge: "Form 16 Auto-OCR",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      title: "Income Tax (ITR) Return Filing",
      subtitle: "ITR-1, ITR-2, ITR-4 Desks",
      desc: "Upload Form 16 or Bank Statements for instant AI OCR data extraction in <3 seconds. Automatic comparison of Old vs. New Tax Regimes to maximize customer tax refund eligibility.",
      features: [
        "Instant Form 16 PDF Auto-Extraction",
        "Salary, Business & Capital Gains Support",
        "Chapter VI-A (80C, 80D, 80CCD) Maximizer",
        "Automated Verified ITR-V Slip Download",
      ],
      color: "from-amber-600 to-yellow-600",
      link: "/sign-in",
    },
    {
      id: "pan-desk",
      category: "egov",
      icon: CreditCard,
      badge: "Instant e-KYC",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "PAN Card Processing Hub",
      subtitle: "Form 49A, Correction & Duplicate",
      desc: "Facilitate physical and digital PAN card applications, demographic corrections (Name/DOB/Father's Name), and damaged/lost PAN reprints with Aadhaar OTP e-Sign verification.",
      features: [
        "New PAN Application (Form 49A)",
        "Minor to Major & Demographic Correction",
        "Instant Admin Acknowledgment Slip Upload",
        "Integrated Wallet Fee Deduction",
      ],
      color: "from-emerald-600 to-teal-600",
      link: "/sign-in",
    },
    {
      id: "passport-desk",
      category: "egov",
      icon: Plane,
      badge: "Excel Batch Export",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      title: "Passport & PCC Application Desk",
      subtitle: "Normal, Tatkaal & Police Clearance",
      desc: "Comprehensive passport filing portal supporting Fresh, Re-issue, and PCC submissions. Features an administrative batch Excel export engine for bulk filing on the passport portal.",
      features: [
        "Normal & Tatkaal Application Modes",
        "Police Clearance Certificate (PCC) Flow",
        "Batch Excel Export Engine for Portals",
        "Appointment Slip & Fee Receipt Vault",
      ],
      color: "from-purple-600 to-pink-600",
      link: "/sign-in",
    },
    {
      id: "dynamic-certificates",
      category: "egov",
      icon: Award,
      badge: "Custom JSONB Schema",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      title: "Dynamic Government Certificates",
      subtitle: "Income, Community, Native, Seva",
      desc: "Customizable government certificate workflow engine. Super Admins dynamically configure required document attachments, form fields, and service margins with zero code deployments.",
      features: [
        "Dynamic JSONB Form & Document Schema",
        "Community, Income, Native & Legal Heir",
        "Real-Time Application Status Tracker",
        "Download Verified Certificate Proofs",
      ],
      color: "from-rose-600 to-orange-600",
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
            Integrated Tax, GST & E-Governance Desks
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Engineered to industry standards of <strong className="text-slate-800">TaxBuddy</strong> & <strong className="text-slate-800">eTaxPrime</strong> — providing your retail and distributor network with maximum compliance accuracy.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl space-x-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              All Services
            </button>
            <button
              onClick={() => setActiveTab("gst")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "gst" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              GST Services
            </button>
            <button
              onClick={() => setActiveTab("itr")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "itr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Income Tax (ITR)
            </button>
            <button
              onClick={() => setActiveTab("egov")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === "egov" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              E-Governance
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-blue-600 mb-3">
                    {item.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6 border-t border-slate-100 pt-5">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Link */}
                <Link
                  href={item.link}
                  className="inline-flex items-center justify-between w-full pt-4 border-t border-slate-100 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors group/link"
                >
                  <span>Launch Application Desk</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Compliance Guarantee Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-800/50">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Statutory Compliance Guarantee</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold">Ready to Offer Tax & GST Services at Your Outlet?</h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Equip your retail counter or distribution network with instant digital wallets and automated filing desks.
            </p>
          </div>
          <Link
            href="/sign-in"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all transform hover:scale-[1.02] flex-shrink-0"
          >
            Access Partner Portal
          </Link>
        </div>
      </div>
    </section>
  );
}
