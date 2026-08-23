"use client";

import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle, Clock, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";

interface TaxEvent {
  id: string;
  name: string;
  category: "GST" | "INCOME_TAX" | "TDS" | "ADVANCE_TAX";
  dueDate: string;
  penaltyPerDay: number;
  description: string;
  status: "URGENT" | "UPCOMING" | "CRITICAL";
}

export default function TaxCalendarTicker() {
  const [activeEvents] = useState<TaxEvent[]>([
    {
      id: "1",
      name: "GSTR-3B Monthly Return",
      category: "GST",
      dueDate: "20th of Every Month",
      penaltyPerDay: 50,
      description: "Summary return of outward supplies & ITC claim. Late fee: ₹50/day (₹20 for Nil return).",
      status: "URGENT",
    },
    {
      id: "2",
      name: "GSTR-1 Outward Supplies",
      category: "GST",
      dueDate: "11th of Every Month",
      penaltyPerDay: 50,
      description: "Details of B2B & B2C sales invoices for auto-populating recipient GSTR-2B.",
      status: "UPCOMING",
    },
    {
      id: "3",
      name: "TDS / TCS Monthly Deposit",
      category: "TDS",
      dueDate: "7th of Every Month",
      penaltyPerDay: 200,
      description: "Challan 281 tax deducted at source payment. Interest: 1.5% per month on delayed deposit.",
      status: "UPCOMING",
    },
    {
      id: "4",
      name: "Advance Tax Q2 Installment",
      category: "ADVANCE_TAX",
      dueDate: "15th September 2026",
      penaltyPerDay: 0,
      description: "45% cumulative advance tax liability for FY 2026-27 under Section 208/211.",
      status: "CRITICAL",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeEvents.length]);

  const current = activeEvents[currentIndex];

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "GST":
        return "bg-blue-600 text-white";
      case "INCOME_TAX":
        return "bg-amber-600 text-white";
      case "TDS":
        return "bg-purple-600 text-white";
      case "ADVANCE_TAX":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-md mb-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        
        {/* Left: Live Ticker Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2 bg-amber-500/20 border border-amber-400/30 text-amber-400 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-200">Statutory Tax Calendar</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Auto-Syncing with GSTN & CBDT Portals</div>
          </div>
        </div>

        {/* Center: Dynamic Event Details */}
        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getBadgeStyle(current.category)}`}>
              {current.category}
            </span>
            <span className="text-xs font-bold text-white">{current.name}</span>
            <span className="hidden lg:inline text-slate-400 text-xs">•</span>
            <span className="hidden lg:inline text-xs text-slate-300">{current.description}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0 text-xs">
            <span className="text-amber-300 font-bold font-mono">Due: {current.dueDate}</span>
            {current.penaltyPerDay > 0 && (
              <span className="text-[11px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/50 font-medium">
                Late Fee: ₹{current.penaltyPerDay}/day
              </span>
            )}
          </div>
        </div>

        {/* Right: Dot Pagination */}
        <div className="hidden sm:flex items-center space-x-1 shrink-0">
          {activeEvents.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-4 bg-amber-400" : "w-1.5 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
