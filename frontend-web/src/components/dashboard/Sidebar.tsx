"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Plane, 
  Award, 
  Wallet, 
  Users, 
  Palette, 
  CheckSquare, 
  History, 
  LogOut, 
  Sparkles, 
  ShieldAlert,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Building
} from "lucide-react";
import { clearAuthSession, getAuthUser } from "@/lib/auth";

interface SidebarProps {
  currentRole?: string;
}

export default function Sidebar({ currentRole = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeUserRole, setActiveUserRole] = useState(currentRole);

  useEffect(() => {
    setMounted(true);
    const user = getAuthUser();
    if (user?.role) {
      setActiveUserRole(user.role);
    }
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthSession();
    router.push("/sign-in");
  };

  const getRoleNavItems = () => {
    const role = (activeUserRole || currentRole).toLowerCase();

    if (role.includes("admin") || role.includes("super_admin") || role === "company") {
      return [
        { label: "Company Overview", href: "/dashboard/company", icon: LayoutDashboard },
        { label: "White-Label Theming", href: "/dashboard/company#branding", icon: Palette },
        { label: "UTR Top-Up Approvals", href: "/dashboard/company#utr-approvals", icon: CheckSquare },
        { label: "Master Audit Ledger", href: "/dashboard/company#audit", icon: History },
        { label: "Retailer Outlets", href: "/dashboard/company#users", icon: Users },
      ];
    } else if (role.includes("distributor")) {
      return [
        { label: "Distributor Hub", href: "/dashboard/distributor", icon: LayoutDashboard },
        { label: "Downline Retailers", href: "/dashboard/distributor#retailers", icon: Users },
        { label: "P2P Fund Transfer", href: "/dashboard/distributor#p2p", icon: Wallet },
        { label: "Commission Analytics", href: "/dashboard/distributor#commissions", icon: TrendingUp },
      ];
    } else if (role.includes("operator") || role.includes("employee")) {
      return [
        { label: "Operator POS Desk", href: "/dashboard/operator", icon: LayoutDashboard },
        { label: "GST Registration", href: "/dashboard/operator#gst", icon: Receipt },
        { label: "Form 16 ITR Filing", href: "/dashboard/operator#itr", icon: FileSpreadsheet },
        { label: "PAN & Passport Desks", href: "/dashboard/operator#egov", icon: CreditCard },
        { label: "Shift Transactions", href: "/dashboard/operator#shift", icon: History },
      ];
    } else {
      // Retailer Store POS
      return [
        { label: "Retailer POS Terminal", href: "/dashboard/retailer", icon: LayoutDashboard },
        { label: "GST Registration Desk", href: "/dashboard/retailer#gst-reg", icon: Building },
        { label: "GSTR-1 & 3B (AI ITC)", href: "/dashboard/retailer#gstr-filing", icon: FileSpreadsheet },
        { label: "Form 16 ITR Filing", href: "/dashboard/retailer#itr-filing", icon: Sparkles },
        { label: "PAN Card Desk (49A)", href: "/dashboard/retailer#pan-desk", icon: CreditCard },
        { label: "Passport Seva Suvidha", href: "/dashboard/retailer#passport-desk", icon: Plane },
        { label: "Dynamic E-Certificates", href: "/dashboard/retailer#dynamic-certs", icon: Award },
        { label: "Document Vault (R2)", href: "/dashboard/retailer#vault", icon: ShieldCheck },
      ];
    }
  };

  const navItems = getRoleNavItems();

  const getRoleBadge = () => {
    const role = (activeUserRole || currentRole).toLowerCase();
    if (role.includes("admin")) {
      return { name: "Super Admin", color: "bg-purple-100 text-purple-800 border-purple-200", tier: 1 };
    } else if (role.includes("distributor")) {
      return { name: "Distributor", color: "bg-blue-100 text-blue-800 border-blue-200", tier: 2 };
    } else if (role.includes("operator")) {
      return { name: "Counter Staff", color: "bg-amber-100 text-amber-800 border-amber-200", tier: 4 };
    } else {
      return { name: "Retailer POS", color: "bg-emerald-100 text-emerald-800 border-emerald-200", tier: 3 };
    }
  };

  const badge = getRoleBadge();
  const isAdmin = (activeUserRole || currentRole).toLowerCase().includes("admin");

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 min-h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="block">
            <div className="relative h-10 w-44 brightness-0 invert opacity-95">
              <Image
                src="/brand/infusetax_logo_600x200.png"
                alt="InfuseTax Logo"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Active Role Pill */}
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
              {badge.name}
            </span>
            <span className="text-[10px] font-mono text-slate-500">Tier {badge.tier}</span>
          </div>
        </div>

        {/* Role-Specific Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href.includes("#") && pathname === item.href.split("#")[0]);
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Session & Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Admin Tier Switcher Only Visible for Super Admin */}
        {isAdmin && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Admin Mode Switcher
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium">
              <Link href="/dashboard/company" className="p-1.5 bg-slate-800/80 hover:bg-blue-900/60 text-slate-300 hover:text-white rounded-lg text-center border border-slate-700">
                Company
              </Link>
              <Link href="/dashboard/distributor" className="p-1.5 bg-slate-800/80 hover:bg-blue-900/60 text-slate-300 hover:text-white rounded-lg text-center border border-slate-700">
                Distributor
              </Link>
              <Link href="/dashboard/retailer" className="p-1.5 bg-slate-800/80 hover:bg-blue-900/60 text-slate-300 hover:text-white rounded-lg text-center border border-slate-700">
                Retailer POS
              </Link>
              <Link href="/dashboard/operator" className="p-1.5 bg-slate-800/80 hover:bg-blue-900/60 text-slate-300 hover:text-white rounded-lg text-center border border-slate-700">
                Operator
              </Link>
            </div>
          </div>
        )}

        {/* Functional Bottom Left Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center space-x-2 w-full py-2.5 bg-slate-800/60 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700/80 hover:border-rose-800/60 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
