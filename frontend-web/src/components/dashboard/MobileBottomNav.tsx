"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Users, 
  Receipt, 
  Terminal, 
  QrCode, 
  UploadCloud,
  FileSpreadsheet,
  Layers,
  FileCheck2,
  FileText,
  Clock,
  ArrowRightLeft
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>("retailer");

  useEffect(() => {
    const user = getAuthUser();
    if (user?.role) {
      setRole(user.role.toLowerCase());
    } else if (pathname.includes("/dashboard/company")) {
      setRole("super_admin");
    } else if (pathname.includes("/dashboard/distributor")) {
      setRole("distributor");
    } else if (pathname.includes("/dashboard/operator")) {
      setRole("operator");
    }
  }, [pathname]);

  const currentTab = searchParams.get("tab") || "overview";

  const getNavItems = () => {
    if (role.includes("admin")) {
      return [
        { label: "Overview", href: "/dashboard/company?tab=overview", icon: Building2, active: currentTab === "overview" },
        { label: "UTR Approvals", href: "/dashboard/company?tab=utr", icon: Receipt, active: currentTab === "utr" },
        { label: "Outlets", href: "/dashboard/company?tab=users", icon: Users, active: currentTab === "users" },
        { label: "Ledger", href: "/dashboard/company?tab=ledger", icon: FileText, active: currentTab === "ledger" },
      ];
    } else if (role.includes("distributor")) {
      return [
        { label: "Overview", href: "/dashboard/distributor", icon: Building2, active: pathname === "/dashboard/distributor" },
        { label: "Outlets", href: "/dashboard/distributor", icon: Users, active: false },
        { label: "Disbursal", href: "/dashboard/distributor", icon: ArrowRightLeft, active: false },
        { label: "Ledger", href: "/dashboard/distributor", icon: FileText, active: false },
      ];
    } else if (role.includes("operator")) {
      return [
        { label: "Queue", href: "/dashboard/operator", icon: Clock, active: true },
        { label: "New Entry", href: "/dashboard/operator", icon: FileText, active: false },
        { label: "Verify Docs", href: "/dashboard/operator", icon: FileCheck2, active: false },
      ];
    } else {
      return [
        { label: "Overview", href: "/dashboard/retailer", icon: Layers, active: pathname === "/dashboard/retailer" },
        { label: "GST / ITR", href: "/dashboard/retailer", icon: FileSpreadsheet, active: false },
        { label: "Batch OCR", href: "/dashboard/retailer", icon: UploadCloud, active: false },
        { label: "QR POS", href: "/dashboard/retailer", icon: QrCode, active: false },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              item.active
                ? "text-blue-700 font-bold bg-blue-50/80 scale-105"
                : "text-slate-500 font-medium hover:text-slate-900"
            }`}
          >
            <Icon className={`w-5 h-5 ${item.active ? "text-blue-700" : "text-slate-500"}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
