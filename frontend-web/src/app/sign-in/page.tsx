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
import { secureApiCall } from "@/lib/crypto";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [companyCode, setCompanyCode] = useState("INFUSE");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeRoleType, setActiveRoleType] = useState<string>("admin");

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotError("");
    setForgotMsg("");

    try {
      const { ok, data } = await secureApiCall("/api/v1/auth/password/forgot", {
        method: "POST",
        body: { email: forgotEmail }
      });
      const res = { ok };
      if (res.ok && data.status === "success") {
        setForgotMsg(`✓ ${data.message} (Demo OTP: ${data.demo_otp || "884422"})`);
        setForgotOtp(data.demo_otp || "884422");
        setForgotStep(2);
      } else {
        setForgotError(data.message || "Failed to generate reset OTP.");
      }
    } catch (err) {
      setForgotError("Network connection error.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handlePerformReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotError("");
    setForgotMsg("");

    try {
      const { ok, data } = await secureApiCall("/api/v1/auth/password/reset", {
        method: "POST",
        body: {
          email: forgotEmail,
          otp: forgotOtp,
          new_password: forgotNewPass,
        }
      });
      const res = { ok };
      if (res.ok && data.status === "success") {
        setForgotMsg("✓ Password reset successfully! You can now log in.");
        setPassword(forgotNewPass);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotMsg("");
        }, 1500);
      } else {
        setForgotError(data.message || "Invalid OTP or reset failed.");
      }
    } catch (err) {
      setForgotError("Network connection error.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // 1. Auto-Redirect if user is already logged in
  useEffect(() => {
    if (isUserAuthenticated()) {
      const user = getAuthUser();
      const targetUrl = getRoleDashboardUrl(user?.role);
      router.replace(targetUrl);
    }
  }, [router]);

  // Form Submit with Live Backend API Verification
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
      const { ok, data } = await secureApiCall("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "X-Tenant-Code": companyCode,
        },
        body: jsonBody(),
      });
      const response = { ok };

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

          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2 border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Enterprise Access</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with your registered franchise credentials to access your terminal.</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Optional 2FA PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security PIN (Optional / 2FA)
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
                  placeholder="4-digit PIN (if applicable)"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-mono font-bold tracking-widest"
                />
              </div>
            </div>
            
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
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotEmail(identifier);
                }}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                Forgot password?
              </button>
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
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Account Password</h3>
                  <p className="text-xs text-slate-500">Fast 2-Step OTP Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {forgotMsg}
              </div>
            )}

            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                ⚠ {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter Registered Email or Mobile *</label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. retailer@infusetax.com"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                  ℹ️ A secure 6-digit one-time password (OTP) will be sent to your registered account.
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isForgotLoading ? "Generating OTP..." : "Send Verification OTP"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePerformReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP Code *</label>
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="e.g. 884422"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 tracking-widest text-center text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isForgotLoading ? "Resetting..." : "Confirm Password Reset"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
