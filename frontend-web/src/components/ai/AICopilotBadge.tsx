"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ScanText, 
  Scale, 
  AlertTriangle, 
  Mic, 
  Camera, 
  ArrowRight, 
  Check 
} from "lucide-react";

export default function AICopilotBadge() {
  return (
    <section id="ai-copilot" className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: AI Overview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>InfuseTax AI Copilot Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              File Taxes & E-Gov Services in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">Seconds, Not Hours</span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              InfuseTax integrates state-of-the-art AI vision and intelligent financial reasoning directly into your daily operations. Eliminate manual typing errors and boost customer satisfaction.
            </p>

            {/* AI Capabilities Checklist */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl mt-0.5">
                  <ScanText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Form 16 & Bank PDF OCR</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Extracts salary income, exemptions, 80C/80D deductions, and TDS in under 3 seconds to auto-fill ITR returns.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Tax Regime Optimizer</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Calculates Old vs. New Tax Regime liabilities side-by-side, guaranteeing maximum refund recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">GST Return Anomaly & ITC Pre-Checker</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Flags mathematical discrepancies, ineligible ITC claims, and invalid GSTIN codes prior to portal filing.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/sign-in"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02]"
              >
                <span>Experience AI Tax Copilot</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: AI Live Visual Interactive Display */}
          <div className="lg:col-span-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              {/* Top Terminal Bar */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-rose-500 rounded-full" />
                  <span className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-mono text-slate-400 ml-2">infusetax-copilot.engine</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Ready
                </span>
              </div>

              {/* Simulated Auto-Extraction Step */}
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-300">
                  <span className="text-blue-400">$ infusetax-ai analyze --doc=Form16_AY2025.pdf</span>
                  <div className="mt-2 text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Document parsed successfully (0.84s)</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700 space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Tax Details</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-200">
                    <div className="p-2 bg-slate-800/80 rounded-lg">
                      <div className="text-[10px] text-slate-400">Gross Salary (Sec 17)</div>
                      <div className="text-sm font-bold text-white">₹12,45,000</div>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg">
                      <div className="text-[10px] text-slate-400">Total Deductions (80C/D)</div>
                      <div className="text-sm font-bold text-emerald-400">₹1,75,000</div>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg">
                      <div className="text-[10px] text-slate-400">TDS Deposited (26AS)</div>
                      <div className="text-sm font-bold text-amber-400">₹84,200</div>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg">
                      <div className="text-[10px] text-slate-400">Optimal Regime</div>
                      <div className="text-sm font-bold text-sky-400">New Regime (Save ₹12.8k)</div>
                    </div>
                  </div>
                </div>

                {/* Multilingual Voice / Quality Bar */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2.5">
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] text-slate-300 font-sans">Voice in 8+ Languages</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-2.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] text-slate-300 font-sans">Auto Blur & Crop Filter</span>
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
