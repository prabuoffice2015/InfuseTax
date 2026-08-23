"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import AuthGuard from "@/components/dashboard/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getRoleFromPath = () => {
    if (pathname.includes("/dashboard/company")) return "admin";
    if (pathname.includes("/dashboard/distributor")) return "distributor";
    if (pathname.includes("/dashboard/operator")) return "operator";
    return "retailer";
  };

  const role = getRoleFromPath();

  const getUserDetails = () => {
    switch (role) {
      case "admin":
        return { name: "InfuseTax Super Admin", code: "SUPER_01", balance: 2500000.00 };
      case "distributor":
        return { name: "Apex Zonal Distributor", code: "DIST_882", balance: 450000.00 };
      case "operator":
        return { name: "Counter Staff (Operator)", code: "EMP_09", balance: 15400.00 };
      case "retailer":
      default:
        return { name: "Ramesh Digital Seva", code: "RET_1029", balance: 48750.00 };
    }
  };

  const user = getUserDetails();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
        {/* Role-Aware Sidebar */}
        <Sidebar currentRole={role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            userTitle={user.name} 
            userCode={user.code} 
            walletBalance={user.balance} 
          />

          <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
