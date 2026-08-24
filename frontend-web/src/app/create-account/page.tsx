"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  Users, 
  Lock, 
  PhoneCall, 
  Mail, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function CreateAccountPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-12 relative z-10 text-center space-y-8">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <div className="relative h-12 w-52 brightness-0 invert">
              <Image
                src="/brand/infusetax_logo_600x200.png"
                alt="InfuseTax Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Security Shield Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-900/40 border border-blue-500/30 rounded-3xl flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
          <ShieldCheck className="w-10 h-10 text-blue-400" />
        </div>

        {/* Notice Content */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-950/60 border border-amber-800/60 rounded-full text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Closed Enterprise Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account Provisioning is Managed by Zonal Distributors
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            To ensure compliance, data privacy, and KYC verification, public self-registration is closed. All Retailer POS and Operator accounts are directly provisioned by authorized <strong>Zonal Master Distributors</strong> and <strong>Super Admins</strong>.
          </p>
        </div>

        {/* How to Access */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-left space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">How to get access:</h3>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Existing Franchisees & Operators:</strong> Use your registered credentials (Email / Mobile & Password) to sign in directly.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>New Retailers:</strong> Contact your Regional Zonal Distributor to create your outlet and allocate your opening prepaid wallet balance.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Corporate & Enterprise Inquiries:</strong> Reach out to the Super Admin team to onboard a new Master Distribution zone.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <span>Proceed to Portal Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
