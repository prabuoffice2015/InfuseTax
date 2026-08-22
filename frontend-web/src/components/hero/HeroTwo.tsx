"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Zap, 
  FileCheck2, 
  TrendingUp 
} from "lucide-react";

export default function HeroTwo() {
  const [selectedService, setSelectedService] = useState("itr");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Decorative Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Trending Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-blue-300 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>AI-Powered Form 16 OCR & Smart Tax Regime Optimizer</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">New</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">Tax & E-Governance</span> Platform for Businesses
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              InfuseTax empowers Distributors, Retailers, and Tax Professionals with instant GST return filing, Form 16 AI auto-extraction, PAN & Passport desks, and real-time multi-tier wallet commissions.
            </p>

            {/* Interactive Service Finder Search Bar */}
            <div className="bg-slate-800/80 backdrop-blur-xl p-2 sm:p-3 rounded-2xl border border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-auto flex-1 flex items-center space-x-3 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <Search className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-full cursor-pointer"
                >
                  <option value="itr" className="bg-slate-900 text-white">Income Tax (ITR) Filing (Form 16 OCR)</option>
                  <option value="gst" className="bg-slate-900 text-white">GST Registration & GSTR-1/3B Return</option>
                  <option value="pan" className="bg-slate-900 text-white">PAN Card (New / Correction / Duplicate)</option>
                  <option value="passport" className="bg-slate-900 text-white">Passport Application & PCC Desk</option>
                  <option value="certificate" className="bg-slate-900 text-white">Dynamic Government Certificates</option>
                </select>
              </div>

              <Link
                href="/sign-in"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Launch Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Value Props Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Wallet Payouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>99.9% AI OCR Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>White-Label Branding</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                
                {/* Header of Card */}
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-5 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Live AI Engine</div>
                      <div className="text-base font-bold text-white">Smart Tax & Compliance Hub</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span>Active</span>
                  </span>
                </div>

                {/* Simulated Live Analytics Feed */}
                <div className="space-y-3.5">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Form 16 OCR Extracted</div>
                        <div className="text-xs text-slate-400">Old vs New Tax: Saved ₹18,400</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">1.2s</span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">GSTR-3B Anomaly Audit</div>
                        <div className="text-xs text-slate-400">ITC Matched 100% with GSTR-2B</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-400">Passed</span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Digital Wallet Settlement</div>
                        <div className="text-xs text-slate-400">Instant Double-Entry Commission</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">+₹1,250</span>
                  </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="text-xl sm:text-2xl font-extrabold text-white">50,000+</div>
                    <div className="text-xs text-slate-400 font-medium">Retailer Outlets</div>
                  </div>
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                    <div className="text-xl sm:text-2xl font-extrabold text-amber-400">₹250 Cr+</div>
                    <div className="text-xs text-slate-400 font-medium">Taxes Filed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
