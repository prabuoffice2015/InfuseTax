import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("infusetax_token")?.value;
  const role = request.cookies.get("infusetax_role")?.value || "";

  // 1. Unauthenticated users trying to access dashboard routes -> Redirect to /sign-in
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Role-based URL access control
    if (pathname.startsWith("/dashboard/company")) {
      if (!role.includes("admin") && !role.includes("super_admin")) {
        const allowedUrl = new URL("/dashboard/retailer", request.url);
        return NextResponse.redirect(allowedUrl);
      }
    } else if (pathname.startsWith("/dashboard/distributor")) {
      if (!role.includes("distributor") && !role.includes("admin")) {
        const allowedUrl = new URL("/dashboard/retailer", request.url);
        return NextResponse.redirect(allowedUrl);
      }
    }
  }

  // 2. Authenticated users visiting /sign-in -> Redirect to their respective dashboard
  if (pathname === "/sign-in" && token) {
    let dashboardPath = "/dashboard/retailer";
    if (role.includes("admin")) {
      dashboardPath = "/dashboard/company";
    } else if (role.includes("distributor")) {
      dashboardPath = "/dashboard/distributor";
    } else if (role.includes("operator") || role.includes("employee")) {
      dashboardPath = "/dashboard/operator";
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
