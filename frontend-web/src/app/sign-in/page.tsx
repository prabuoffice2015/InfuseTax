"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { setAuthSession, isUserAuthenticated, getAuthUser, getRoleDashboardUrl } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [companyCode, setCompanyCode] = useState("INFUSE");
  const [identifier, setIdentifier] = useState("retailer@infusetax.com");
  const [password, setPassword] = useState("Retailer@1234");
  const [adminPin, setAdminPin] = useState("9988");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeRoleType, setActiveRoleType] = useState<string>("retailer");

  // 1. Auto-Redirect if user is already logged in
  useEffect(() => {
    if (isUserAuthenticated()) {
      const user = getAuthUser();
      const targetUrl = getRoleDashboardUrl(user?.role);
      router.replace(targetUrl);
    }
  }, [router]);

  // 2. Quick Demo Fill
  const handleDemoFill = (role: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    setCompanyCode("INFUSE");
    setActiveRoleType(role);

    if (role === "admin") {
      setIdentifier("admin@infusetax.com");
      setPassword("Admin@1234");
      setAdminPin("9988");
    } else if (role === "accountant") {
      setIdentifier("accountant@infusetax.com");
      setPassword("Accountant@1234");
    } else if (role === "distributor") {
      setIdentifier("distributor@infusetax.com");
      setPassword("Distributor@1234");
    } else if (role === "retailer") {
      setIdentifier("retailer@infusetax.com");
      setPassword("Retailer@1234");
    } else if (role === "employee") {
      setIdentifier("operator@infusetax.com");
      setPassword("Operator@1234");
    }
  };

  // 3. Form Submit with Live Backend API Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!identifier || !password) {
      setErrorMsg("Please enter both email/mobile and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Code": companyCode,
        },
        body: jsonBody(),
      });

      const data = await response.json();

      if (response.ok && data.status === "success" && data.token) {
        // Save authenticated session in localStorage & cookie
        setAuthSession(data.token, data.user);
        setSuccessMsg(`✓ Welcome ${data.user.name}! Redirecting to your dashboard...`);

        const targetUrl = getRoleDashboardUrl(data.user.role || activeRoleType);
        setTimeout(() => {
          router.push(targetUrl);
        }, 600);
      } else {
        setErrorMsg(data.message || "Invalid email/mobile or password. Please verify and try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Unable to reach authentication server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const jsonBody = () => {
    const payload: any = {
      identifier: identifier.trim(),
      password: password.trim(),
    };
    if (activeRoleType === "admin") {
      payload.admin_pin = adminPin;
    }
    return JSON.stringify(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Illustration & Value Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Top Logo & Tagline */}
          <div className="relative z-10 space-y-3">
            <Link href="/">
              <div className="relative h-12 w-48 brightness-0 invert">
                <Image
                  src="/brand/infusetax_logo_600x200.png"
                  alt="InfuseTax Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-300">
              AI-Powered Multi-Tenant Tax Compliance & FinTech Super-Platform
            </p>
          </div>

          {/* Center Illustration */}
          <div className="relative z-10 my-8 flex items-center justify-center">
            <div className="relative w-full max-w-sm h-64">
              <Image
                src="/assets/images/sign-in.png"
                alt="Sign In Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Bcrypt & HMAC-SHA256 JWT Security</span>
            </div>
            <span className="font-mono">v2.0.0</span>
          </div>
        </div>

        {/* Right Side: Sign-In Form Card */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Logo on Mobile */}
          <div className="md:hidden flex justify-center mb-6">
            <Link href="/">
              <div className="relative h-12 w-44">
                <Image
                  src="/brand/infusetax_logo_600x200.png"
                  alt="InfuseTax Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Toggle Tab Buttons */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              className="py-2 text-xs sm:text-sm font-bold text-blue-700 bg-white rounded-xl shadow-sm border border-slate-200/60"
            >
              Sign In
            </button>
            <Link
              href="/create-account"
              className="py-2 text-xs sm:text-sm font-semibold text-slate-600 text-center hover:text-slate-900 transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with your registered credentials to access your tax terminal.</p>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Company Tenant Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Tenant Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INFUSE"
                  required
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email / Mobile No / User Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com or 9876543210"
                  required
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-11 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin 2FA PIN (Only visible if Admin selected) */}
            {activeRoleType === "admin" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Super Admin Security PIN (2FA) <span className="text-blue-600 font-mono text-[10px]">(Default: 9988)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-blue-50/50 border border-blue-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-mono font-bold tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Remember session</span>
              </label>
              <Link href="#" className="text-xs font-bold text-blue-700 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-700/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Test Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Role Test Fill (Click & Sign In)
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleDemoFill("admin")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors border cursor-pointer ${activeRoleType === "admin" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-slate-200"}`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("distributor")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors border cursor-pointer ${activeRoleType === "distributor" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-slate-200"}`}
              >
                Distributor
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("retailer")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors border cursor-pointer ${activeRoleType === "retailer" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-slate-200"}`}
              >
                Retailer
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("employee")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors border cursor-pointer ${activeRoleType === "employee" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-slate-200"}`}
              >
                Operator
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
