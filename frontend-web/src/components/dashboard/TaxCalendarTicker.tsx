"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  X, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  Info 
} from "lucide-react";
import { getAuthToken } from "@/lib/auth";

interface AnnouncementEvent {
  id: string;
  title: string;
  category: "GST" | "INCOME_TAX" | "TDS" | "ADVANCE_TAX" | "ANNOUNCEMENT" | "MAINTENANCE" | "COMPLIANCE" | string;
  due_date?: string;
  message: string;
  urgency: "URGENT" | "UPCOMING" | "CRITICAL" | "INFO" | "NORMAL" | "HIGH" | string;
  company_name?: string;
  date?: string;
}

export default function TaxCalendarTicker() {
  const [events, setEvents] = useState<AnnouncementEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<AnnouncementEvent | null>(null);

  // Fetch Live Dynamic Announcements from Backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const res = await fetch("/api/v1/announcements", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.announcements)) {
          // Filter strictly active ones
          const activeOnly = data.announcements.filter((a: any) => a.is_active !== false && a.is_active !== 0 && a.is_active !== "0");
          setEvents(activeOnly);
        } else {
          setEvents([]);
        }
      } catch (e) {
        setEvents([]);
      }
    };

    fetchAnnouncements();
    // Poll every 30 seconds for live updates
    const pollInterval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  // 6-Second Auto-Rotation (paused if modal is open)
  useEffect(() => {
    if (events.length <= 1 || selectedEvent) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [events.length, selectedEvent]);

  // If there are no active announcements, completely hide this section
  if (!events || events.length === 0) {
    return null;
  }

  const current = events[currentIndex] || events[0];
  if (!current) return null;

  const getBadgeStyle = (category: string) => {
    switch (category?.toUpperCase()) {
      case "GST":
        return "bg-blue-600 text-white";
      case "INCOME_TAX":
      case "IT":
        return "bg-emerald-600 text-white";
      case "TDS":
        return "bg-purple-600 text-white";
      case "ADVANCE_TAX":
        return "bg-rose-600 text-white";
      case "ANNOUNCEMENT":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
      case "MAINTENANCE":
        return "bg-rose-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case "URGENT":
      case "CRITICAL":
        return "bg-rose-950/80 text-rose-300 border-rose-800/60 animate-pulse";
      case "HIGH":
        return "bg-amber-950/80 text-amber-300 border-amber-800/60";
      case "INFO":
      case "NORMAL":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-md mb-6 relative overflow-hidden">
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          
          {/* Left: Live Ticker Indicator */}
          <div 
            onClick={() => setSelectedEvent(current)}
            className="flex items-center space-x-3 shrink-0 cursor-pointer group"
            title="Click to view all circular details"
          >
            <div className="p-2 bg-amber-500/20 border border-amber-400/30 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Megaphone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                  Live Announcements & Broadcasts
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Auto-Syncing with GSTN, CBDT & Company Node</div>
            </div>
          </div>

          {/* Center: Dynamic Event Display (Clickable) */}
          <div 
            onClick={() => setSelectedEvent(current)}
            className="flex-1 w-full bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-blue-500/60 rounded-xl px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden cursor-pointer transition-all group"
            title="Click to read full circular"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${getBadgeStyle(current.category)}`}>
                {current.category}
              </span>
              <span className="text-xs font-bold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                {current.title}
              </span>
              <span className="hidden lg:inline text-xs text-slate-400 truncate max-w-md">
                • {current.message}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
              {current.due_date && (
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  {current.due_date}
                </span>
              )}
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getUrgencyBadge(current.urgency)}`}>
                {current.urgency}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors ml-1" />
            </div>
          </div>

          {/* Right: Manual Stepper Controls */}
          {events.length > 1 && (
            <div className="flex items-center space-x-1 shrink-0 self-end md:self-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Previous Notice"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-500 px-1">
                {currentIndex + 1}/{events.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % events.length);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Next Notice"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Click-to-View Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    selectedEvent.urgency?.toUpperCase() === "CRITICAL" || selectedEvent.urgency?.toUpperCase() === "URGENT"
                      ? "bg-rose-100 text-rose-800 border-rose-200"
                      : selectedEvent.urgency?.toUpperCase() === "HIGH"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {selectedEvent.urgency || "NORMAL"} NOTICE
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedEvent.category || "GENERAL"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {selectedEvent.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Directive Message Body */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {selectedEvent.message}
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-rose-500" />
                  <span>Statutory Due Date</span>
                </div>
                <div className="font-extrabold text-rose-600 mt-0.5">
                  {selectedEvent.due_date || "No statutory due date"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>Broadcast Node</span>
                </div>
                <div className="font-extrabold text-slate-800 mt-0.5 truncate">
                  {selectedEvent.company_name || "InfuseTax Network Office"}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Close Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
