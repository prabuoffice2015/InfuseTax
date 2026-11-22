import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("infusetax_token")?.value;
  const role = (request.cookies.get("infusetax_role")?.value || "").toLowerCase();

  // 1. Unauthenticated users trying to access dashboard routes -> Redirect to /sign-in
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Role-based URL access control
    const getFallbackUrl = () => {
      if (role.includes("customer") || role.includes("operator")) return "/dashboard/customer";
      if (role === "admin" || role.includes("distributor")) return "/dashboard/admin";
      if (role === "super_admin" || role.includes("super_admin")) return "/dashboard/company";
      return "/dashboard/retailer";
    };

    if (pathname.startsWith("/dashboard/company")) {
      // Super Admin routes - Admin, Retailer, Customer CANNOT access
      if (role !== "super_admin" && !role.includes("super_admin")) {
        return NextResponse.redirect(new URL(getFallbackUrl(), request.url));
      }
    } else if (pathname.startsWith("/dashboard/distributor")) {
      // Normalize distributor route to admin route
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (pathname.startsWith("/dashboard/admin")) {
      // Admin routes - Retailer & Customer CANNOT access
      if (role !== "admin" && !role.includes("distributor") && role !== "super_admin" && !role.includes("super_admin")) {
        return NextResponse.redirect(new URL(getFallbackUrl(), request.url));
      }
    } else if (pathname.startsWith("/dashboard/retailer")) {
      // Retailer routes - Customer & Operator CANNOT access
      if (role.includes("customer") || role.includes("operator")) {
        return NextResponse.redirect(new URL("/dashboard/customer", request.url));
      }
    }
  }

  // 2. Authenticated users visiting /sign-in -> Redirect to their respective dashboard
  if (pathname === "/sign-in" && token) {
    let dashboardPath = "/dashboard/retailer";
    if (role === "super_admin" || role.includes("super_admin")) {
      dashboardPath = "/dashboard/company";
    } else if (role === "admin" || role.includes("distributor")) {
      dashboardPath = "/dashboard/admin";
    } else if (role.includes("customer") || role.includes("operator") || role.includes("employee")) {
      dashboardPath = "/dashboard/customer";
    }
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
  ],
};
