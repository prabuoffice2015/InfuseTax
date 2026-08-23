"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Users, 
  Receipt, 
  Terminal, 
  QrCode, 
  UploadCloud,
  FileSpreadsheet
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Admin",
      href: "/dashboard/company",
      icon: Building2,
      active: pathname.includes("/dashboard/company"),
    },
    {
      label: "Distributor",
      href: "/dashboard/distributor",
      icon: Users,
      active: pathname.includes("/dashboard/distributor"),
    },
    {
      label: "Retailer POS",
      href: "/dashboard/retailer",
      icon: Receipt,
      active: pathname.includes("/dashboard/retailer"),
    },
    {
      label: "Operator",
      href: "/dashboard/operator",
      icon: Terminal,
      active: pathname.includes("/dashboard/operator"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
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
