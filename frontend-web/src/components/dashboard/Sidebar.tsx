"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Building,
  FileText,
  Scale,
  Megaphone,
  MessageSquare,
  FileCheck,
  CheckCircle2,
  QrCode
} from "lucide-react";
import { clearAuthSession, getAuthUser } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";

interface SidebarProps {
  currentRole?: string;
}

export default function Sidebar({ currentRole = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeUserRole, setActiveUserRole] = useState(currentRole);
  const [enabledServices, setEnabledServices] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const user = getAuthUser();
    if (user?.role) {
      setActiveUserRole(user.role);
    }
    
    const loadUserPermissions = () => {
      secureApiCall("/api/v1/auth/profile").then(res => {
        if (res.ok && res.data?.user) {
          if (res.data.user.role) setActiveUserRole(res.data.user.role);
          if (res.data.user.enabled_services) {
            const list = res.data.user.enabled_services.split(",").map((s: string) => s.trim());
            setEnabledServices(list);
          } else if (Array.isArray(res.data.user.permissions)) {
            setEnabledServices(res.data.user.permissions);
          }
        }
      }).catch(() => {});
    };

    loadUserPermissions();

    if (typeof window !== "undefined") {
      window.addEventListener("infusetax_permissions_updated", loadUserPermissions);
      window.addEventListener("infusetax_wallet_updated", loadUserPermissions);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("infusetax_permissions_updated", loadUserPermissions);
        window.removeEventListener("infusetax_wallet_updated", loadUserPermissions);
      }
    };
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthSession();
    router.push("/sign-in");
  };

  const getRoleNavItems = () => {
    const role = (activeUserRole || currentRole).toLowerCase();

    if (role === "super_admin" || role.includes("super_admin") || role === "company") {
      return [
        { label: "Dashboard", href: "/dashboard/company?tab=overview", tabKey: "overview", icon: LayoutDashboard },
        { label: "Admin", href: "/dashboard/company?tab=admins", tabKey: "admins", icon: ShieldCheck },
        { label: "Retailer", href: "/dashboard/company?tab=retailers", tabKey: "retailers", icon: Building },
        { label: "Customer", href: "/dashboard/company?tab=customers", tabKey: "customers", icon: Users },
        { label: "Wallet Approval", href: "/dashboard/company?tab=utr", tabKey: "utr", icon: CheckSquare },
        { label: "GST Registration", href: "/dashboard/company?tab=gst-reg", tabKey: "gst-reg", icon: Building },
        { label: "GST Filing", href: "/dashboard/company?tab=gst-filing", tabKey: "gst-filing", icon: FileSpreadsheet },
        { label: "IT Filing", href: "/dashboard/company?tab=it-filing", tabKey: "it-filing", icon: FileText },
        { label: "Reports", href: "/dashboard/company?tab=ledger", tabKey: "ledger", icon: History },
        { label: "Companies", href: "/dashboard/company?tab=companies", tabKey: "companies", icon: Building },
        { label: "Tier 2 Pricing", href: "/dashboard/company?tab=pricing", tabKey: "pricing", icon: Sliders },
        { label: "Announcements", href: "/dashboard/company?tab=announcements", tabKey: "announcements", icon: Megaphone },
        { label: "White Labeling", href: "/dashboard/company?tab=branding", tabKey: "branding", icon: Palette },
        { label: "Bank & QR Settings", href: "/dashboard/company?tab=bank-accounts", tabKey: "bank-accounts", icon: QrCode },
        { label: "WhatsApp Gateway", href: "/dashboard/company?tab=whatsapp", tabKey: "whatsapp", icon: MessageSquare },
      ];
    } else if (role === "admin" || role.includes("distributor")) {
      return [
        { label: "Dashboard", href: "/dashboard/admin?tab=overview", tabKey: "overview", icon: LayoutDashboard, permKey: "overview" },
        { label: "All Service Approvals", href: "/dashboard/admin?tab=service-approvals", tabKey: "service-approvals", icon: CheckCircle2, permKey: "overview" },
        { label: "Wallet Approval", href: "/dashboard/admin?tab=approvals", tabKey: "approvals", icon: CheckSquare, permKey: "overview" },
        { label: "GST Registration", href: "/dashboard/admin?tab=gst-reg", tabKey: "gst-reg", icon: Building, permKey: "gst_registration" },
        { label: "GST Filing", href: "/dashboard/admin?tab=gst-filing", tabKey: "gst-filing", icon: FileSpreadsheet, permKey: "gstr_filing" },
        { label: "IT Filing", href: "/dashboard/admin?tab=it-filing", tabKey: "it-filing", icon: FileText, permKey: "itr_filing" },
        { label: "Reports", href: "/dashboard/admin?tab=reports", tabKey: "reports", icon: History, permKey: "reports" },
      ];
    } else if (role.includes("customer") || role.includes("operator") || role.includes("employee")) {
      return [
        { label: "Dashboard", href: "/dashboard/customer?tab=overview", tabKey: "overview", icon: LayoutDashboard },
        { label: "My Filings", href: "/dashboard/customer?tab=my_filings", tabKey: "my_filings", icon: FileCheck },
        { label: "Receipts", href: "/dashboard/customer?tab=receipts", tabKey: "receipts", icon: Receipt },
      ];
    } else {
      // Retailer Store POS (Tier 3)
      return [
        { label: "Dashboard", href: "/dashboard/retailer?desk=overview", deskKey: "overview", icon: LayoutDashboard, permKey: "overview" },
        { label: "Wallet", href: "/dashboard/retailer?desk=wallet", deskKey: "wallet", icon: Wallet, permKey: "wallet" },
        { label: "Customer", href: "/dashboard/retailer?desk=customers", deskKey: "customers", icon: Users, permKey: "customer_desk", altKey: "customers" },
        { label: "GST Filing", href: "/dashboard/retailer?desk=gstr_filing", deskKey: "gstr_filing", icon: FileSpreadsheet, permKey: "gstr_filing" },
        { label: "GST Registration", href: "/dashboard/retailer?desk=gst_reg", deskKey: "gst_reg", icon: Building, permKey: "gst_registration", altKey: "gst_reg" },
        { label: "IT Filing", href: "/dashboard/retailer?desk=itr", deskKey: "itr", icon: FileText, permKey: "itr_filing", altKey: "itr" },
        { label: "Eseva Services", href: "/dashboard/retailer?desk=esevai", deskKey: "esevai", icon: Award, permKey: "esevai" },
        { label: "Pan Card", href: "/dashboard/retailer?desk=pan", deskKey: "pan", icon: CreditCard, permKey: "pan_card", altKey: "pan" },
        { label: "Passport", href: "/dashboard/retailer?desk=passport", deskKey: "passport", icon: Plane, permKey: "passport" },
        { label: "Report", href: "/dashboard/retailer?desk=reports", deskKey: "reports", icon: History, permKey: "reports" },
      ];
    }
  };

  const allNavItems = getRoleNavItems();
  const navItems = allNavItems.filter((item: any) => {
    if (!item.permKey || item.permKey === "overview") return true;
    if (enabledServices.length === 0 || enabledServices.includes("all")) return true;
    return enabledServices.includes(item.permKey) || (item.altKey && enabledServices.includes(item.altKey));
  });

  const getRoleBadge = () => {
    const role = (activeUserRole || currentRole).toLowerCase().trim();
    if (role === "super_admin" || role.includes("super_admin") || role === "company") {
      return { name: "Super Admin", color: "bg-purple-100 text-purple-800 border-purple-200", tier: 1 };
    } else if (role === "admin" || role.includes("distributor")) {
      return { name: "Admin", color: "bg-blue-100 text-blue-800 border-blue-200", tier: 2 };
    } else if (role === "customer" || role.includes("customer") || role.includes("operator")) {
      return { name: "Customer", color: "bg-amber-100 text-amber-800 border-amber-200", tier: 4 };
    } else {
      return { name: "Retailer", color: "bg-emerald-100 text-emerald-800 border-emerald-200", tier: 3 };
    }
  };

  const badge = getRoleBadge();
  const currentTab = searchParams.get("tab") || "overview";
  const currentDesk = searchParams.get("desk") || "overview";

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 min-h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="block">
            <div className="relative h-10 w-44 opacity-95">
              <Image
                src="/brand/taxpartner_logo_white_600x200.png"
                alt="TaxPartner Logo"
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
          {navItems.map((item: any, idx) => {
            const Icon = item.icon;
            let isActive = false;

            if (item.tabKey) {
              isActive = pathname.startsWith(item.href.split("?")[0]) && currentTab === item.tabKey;
            } else if (item.deskKey) {
              isActive = pathname.startsWith(item.href.split("?")[0]) && currentDesk === item.deskKey;
            } else {
              isActive = pathname === item.href.split("?")[0];
            }

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
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Session & Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Logged In User Profile Info */}
        <div className="px-1">
          <div className="text-xs font-bold text-white truncate">
            {getAuthUser()?.name || "TaxPartner User"}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {getAuthUser()?.email || "user@taxpartner.in"}
          </div>
        </div>

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
