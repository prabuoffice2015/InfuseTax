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
  FileCheck
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

    if (role.includes("admin") || role.includes("super_admin") || role === "company") {
      return [
        { label: "Platform Overview", href: "/dashboard/company?tab=overview", tabKey: "overview", icon: LayoutDashboard },
        { label: "Company Creation", href: "/dashboard/company?tab=companies", tabKey: "companies", icon: Building },
        { label: "Company Users (T2/T3/T4)", href: "/dashboard/company?tab=company-users", tabKey: "company-users", icon: Users },
        { label: "Tier 2 Pricing Setup", href: "/dashboard/company?tab=pricing", tabKey: "pricing", icon: Sliders },
        { label: "UTR Bank Approvals", href: "/dashboard/company?tab=utr", tabKey: "utr", icon: CheckSquare },
        { label: "Company Announcements", href: "/dashboard/company?tab=announcements", tabKey: "announcements", icon: Megaphone },
        { label: "White Labeling & Permissions", href: "/dashboard/company?tab=branding", tabKey: "branding", icon: Palette },
        { label: "💬 WhatsApp Gateway & Alerts", href: "/dashboard/company?tab=whatsapp", tabKey: "whatsapp", icon: MessageSquare },
        { label: "Master Audit Ledger", href: "/dashboard/company?tab=ledger", tabKey: "ledger", icon: History },
      ];
    } else if (role.includes("distributor")) {
      return [
        { label: "Distributor Dashboard", href: "/dashboard/distributor?tab=overview", tabKey: "overview", icon: LayoutDashboard, permKey: "overview" },
        { label: "📋 Service Approvals (T3 & T4)", href: "/dashboard/distributor?tab=service-approvals", tabKey: "service-approvals", icon: FileCheck, permKey: "service_approvals" },
        { label: "💳 Wallet Approvals (T3 & T4)", href: "/dashboard/distributor?tab=approvals", tabKey: "approvals", icon: CheckSquare, permKey: "float_approvals" },
        { label: "Tier 3 Pricing Setup", href: "/dashboard/distributor?tab=pricing", tabKey: "pricing", icon: Sliders, permKey: "pricing" },
        { label: "Network Outlets (Users)", href: "/dashboard/distributor?tab=outlets", tabKey: "outlets", icon: Users, permKey: "outlets" },
        { label: "Company Announcements", href: "/dashboard/distributor?tab=announcements", tabKey: "announcements", icon: Megaphone, permKey: "announcements" },
        { label: "Wallet & Master Reports", href: "/dashboard/distributor?tab=reports", tabKey: "reports", icon: History, permKey: "reports" },
      ];
    } else if (role.includes("operator") || role.includes("employee")) {
      return [
        { label: "GST Registration Desk", href: "/dashboard/operator?desk=gst_reg", deskKey: "gst_reg", icon: Building, permKey: "gst_registration" },
        { label: "IT Filing Desk", href: "/dashboard/operator?desk=itr", deskKey: "itr", icon: FileText, permKey: "itr_filing" },
        { label: "GST Return Filing", href: "/dashboard/operator?desk=gstr_filing", deskKey: "gstr_filing", icon: FileSpreadsheet, permKey: "gstr_filing" },
        { label: "Shift Wallet Report", href: "/dashboard/operator?desk=reports", deskKey: "reports", icon: History, permKey: "reports" },
      ];
    } else {
      // Retailer Store POS (Tier 3)
      return [
        { label: "GST Registration Desk", href: "/dashboard/retailer?desk=gst_reg", deskKey: "gst_reg", icon: Building, permKey: "gst_registration" },
        { label: "IT Filing Desk", href: "/dashboard/retailer?desk=itr", deskKey: "itr", icon: FileText, permKey: "itr_filing" },
        { label: "GST Return Filing", href: "/dashboard/retailer?desk=gstr_filing", deskKey: "gstr_filing", icon: FileSpreadsheet, permKey: "gstr_filing" },
        { label: "Company Announcements", href: "/dashboard/retailer?desk=announcements", deskKey: "announcements", icon: Megaphone, permKey: "announcements" },
        { label: "Document Vault & AI", href: "/dashboard/retailer?desk=vault", deskKey: "vault", icon: ShieldCheck, permKey: "vault" },
        { label: "Shop Staff (Tier 4)", href: "/dashboard/retailer?desk=staff", deskKey: "staff", icon: Users, permKey: "staff" },
        { label: "📋 Service Approvals (Tier 4)", href: "/dashboard/retailer?desk=service-approvals", deskKey: "service-approvals", icon: FileCheck, permKey: "service_approvals" },
        { label: "💳 Float Approvals (Tier 4)", href: "/dashboard/retailer?desk=approvals", deskKey: "approvals", icon: CheckSquare, permKey: "float_approvals" },
        { label: "Store Audit Ledger", href: "/dashboard/retailer?desk=reports", deskKey: "reports", icon: History, permKey: "reports" },
      ];
    }
  };

  const allNavItems = getRoleNavItems();
  const navItems = allNavItems.filter((item: any) => {
    if (!item.permKey) return true;
    if (enabledServices.length === 0 || enabledServices.includes("all")) return true;
    return enabledServices.includes(item.permKey);
  });

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
  const currentTab = searchParams.get("tab") || "overview";
  const currentDesk = searchParams.get("desk") || "gst_reg";

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
            {getAuthUser()?.name || "InfuseTax User"}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {getAuthUser()?.email || "user@infusetax.com"}
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
