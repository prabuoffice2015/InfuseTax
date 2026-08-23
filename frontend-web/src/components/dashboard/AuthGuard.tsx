"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isUserAuthenticated, getAuthUser, getRoleDashboardUrl } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check if user is logged in
    if (!isUserAuthenticated()) {
      setIsAuthorized(false);
      router.replace("/sign-in");
      return;
    }

    const user = getAuthUser();
    const role = (user?.role || "").toLowerCase();

    // 2. Role-Based Route Protection
    if (pathname.startsWith("/dashboard/company")) {
      // Super Admin Only
      if (!role.includes("admin") && !role.includes("super_admin")) {
        const allowedUrl = getRoleDashboardUrl(role);
        router.replace(allowedUrl);
        return;
      }
    } else if (pathname.startsWith("/dashboard/distributor")) {
      // Distributor or Admin
      if (!role.includes("distributor") && !role.includes("admin")) {
        const allowedUrl = getRoleDashboardUrl(role);
        router.replace(allowedUrl);
        return;
      }
    }

    setIsAuthorized(true);
  }, [pathname, router]);

  // Loading state while verifying auth session
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span>Verifying InfuseTax Cryptographic Session...</span>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
