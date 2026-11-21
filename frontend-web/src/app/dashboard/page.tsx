"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser, getRoleDashboardUrl } from "@/lib/auth";

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();
    const target = getRoleDashboardUrl(user?.role);
    router.replace(target);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
