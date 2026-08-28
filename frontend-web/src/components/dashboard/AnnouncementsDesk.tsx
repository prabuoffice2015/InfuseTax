"use client";

import React, { useState, useMemo } from "react";
import { 
  Megaphone, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Bell, 
  Building2, 
  Clock, 
  ExternalLink, 
  X, 
  CheckCircle2,
  Filter,
  Layers,
  Sparkles
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  category: string;
  message: string;
  due_date?: string;
  urgency: "CRITICAL" | "HIGH" | "NORMAL" | string;
  target_tiers?: string[];
  is_active: boolean;
  date?: string;
  company_name?: string;
  company_code?: string;
}

interface AnnouncementsDeskProps {
  announcements: Announcement[];
  loading?: boolean;
  onRefresh?: () => void;
  userRole?: string;
}

export default function AnnouncementsDesk({
  announcements = [],
  loading = false,
  onRefresh,
  userRole = "operator"
}: AnnouncementsDeskProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchSearch =
        !searchTerm ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.company_name && a.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        categoryFilter === "all" ||
        a.category.toUpperCase() === categoryFilter.toUpperCase();

      const matchUrgency =
        urgencyFilter === "all" ||
        a.urgency.toUpperCase() === urgencyFilter.toUpperCase();

      return matchSearch && matchCategory && matchUrgency;
    });
  }, [announcements, searchTerm, categoryFilter, urgencyFilter]);

  // Counts
  const criticalCount = announcements.filter(
    (a) => a.urgency?.toUpperCase() === "CRITICAL" || a.urgency?.toUpperCase() === "HIGH"
  ).length;

  const gstCount = announcements.filter((a) => a.category?.toUpperCase() === "GST").length;
  const itrCount = announcements.filter((a) => a.category?.toUpperCase() === "INCOME_TAX" || a.category?.toUpperCase() === "IT").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Megaphone className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Official Network Broadcasts & Statutory Circulars</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Company Announcements & Compliance Desk
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Stay updated with critical statutory deadlines, GST return due dates, IT circulars, and executive store directives.
              </p>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <span>Refresh Notices</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
              <div className="text-[11px] text-slate-400 uppercase font-bold">Total Active Notices</div>
              <div className="text-2xl font-extrabold text-white mt-0.5">{announcements.length}</div>
            </div>
            <div className="bg-rose-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-rose-500/20">
              <div className="text-[11px] text-rose-300 uppercase font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>High Urgency / Deadlines</span>
              </div>
              <div className="text-2xl font-extrabold text-rose-300 mt-0.5">{criticalCount}</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-blue-500/20">
              <div className="text-[11px] text-blue-300 uppercase font-bold">GST Notifications</div>
              <div className="text-2xl font-extrabold text-blue-300 mt-0.5">{gstCount}</div>
            </div>
            <div className="bg-emerald-500/10 backdrop-blur-sm p-3.5 rounded-2xl border border-emerald-500/20">
              <div className="text-[11px] text-emerald-300 uppercase font-bold">Income Tax Circulars</div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-0.5">{itrCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circulars by keyword, title, or reference..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: "all", label: "All Categories" },
              { id: "GST", label: "GST Desks" },
              { id: "INCOME_TAX", label: "Income Tax" },
              { id: "COMPLIANCE", label: "Compliance" },
              { id: "GENERAL", label: "General" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { id: "all", label: "All Urgency" },
              { id: "CRITICAL", label: "Critical" },
              { id: "HIGH", label: "High" },
              { id: "NORMAL", label: "Normal" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setUrgencyFilter(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                  urgencyFilter === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List / Cards */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Announcements Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no active company broadcast notices matching your filter criteria.
          </p>
          {(searchTerm || categoryFilter !== "all" || urgencyFilter !== "all") && (
            <button
              onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setUrgencyFilter("all"); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((item) => {
            const urgency = item.urgency?.toUpperCase();
            const isCritical = urgency === "CRITICAL";
            const isHigh = urgency === "HIGH";

            const cardBorder = isCritical
              ? "border-rose-300/80 hover:border-rose-400 bg-gradient-to-b from-rose-50/30 to-white"
              : isHigh
              ? "border-amber-300/80 hover:border-amber-400 bg-gradient-to-b from-amber-50/30 to-white"
              : "border-slate-200/80 hover:border-blue-300 bg-white";

            const badgeBg = isCritical
              ? "bg-rose-100 text-rose-800 border-rose-200"
              : isHigh
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-blue-100 text-blue-800 border-blue-200";

            return (
              <div
                key={item.id}
                className={`rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${cardBorder}`}
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Urgency Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeBg} flex items-center space-x-1`}>
                      {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                      <span>{item.urgency || "NORMAL"}</span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.category || "GENERAL"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* Message Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {item.message}
                  </p>
                </div>

                {/* Metadata Footer */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1 text-[11px] text-slate-500">
                    {item.due_date && (
                      <div className="flex items-center space-x-1.5 text-rose-600 font-bold">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Statutory Due: {item.due_date}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{item.company_name || "Global Network"}</span>
                      </div>
                      <span>{item.date || "Active Broadcast"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAnnouncement(item)}
                    className="w-full py-2 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Read Full Circular Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    selectedAnnouncement.urgency?.toUpperCase() === "CRITICAL"
                      ? "bg-rose-100 text-rose-800 border-rose-200"
                      : selectedAnnouncement.urgency?.toUpperCase() === "HIGH"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {selectedAnnouncement.urgency || "NORMAL"} NOTICE
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedAnnouncement.category || "GENERAL"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {selectedAnnouncement.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Directive Message Body */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {selectedAnnouncement.message}
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Due Date</div>
                <div className="font-extrabold text-rose-600 mt-0.5">
                  {selectedAnnouncement.due_date || "No statutory due date"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Broadcast Authority</div>
                <div className="font-extrabold text-slate-800 mt-0.5">
                  {selectedAnnouncement.company_name || "InfuseTax Network Office"}
                </div>
              </div>
            </div>

            {/* Action Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Close Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
