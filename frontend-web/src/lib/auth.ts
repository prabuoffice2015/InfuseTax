"use client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "distributor" | "retailer" | "operator" | string;
  tenant?: string;
  mobile?: string;
  city?: string;
  state?: string;
  wallet?: number;
}

const TOKEN_KEY = "infusetax_jwt_token";
const USER_KEY = "infusetax_auth_user";

export function setAuthSession(token: string, user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Set cookie for middleware and server actions
    document.cookie = `infusetax_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `infusetax_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "infusetax_token=; path=/; max-age=0";
    document.cookie = "infusetax_role=; path=/; max-age=0";
  }
}

export function isUserAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getRoleDashboardUrl(role?: string): string {
  const normalized = (role || "").toLowerCase();
  if (normalized.includes("admin")) {
    return "/dashboard/company";
  } else if (normalized.includes("distributor")) {
    return "/dashboard/distributor";
  } else if (normalized.includes("operator") || normalized.includes("employee")) {
    return "/dashboard/operator";
  }
  return "/dashboard/retailer";
}
