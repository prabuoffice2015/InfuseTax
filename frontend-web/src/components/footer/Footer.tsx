"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ArrowRight
} from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-48 max-w-[200px] max-h-[48px] brightness-0 invert opacity-90">
                <Image
                  src="/brand/infusetax_logo_600x200.png"
                  alt="InfuseTax Logo"
                  width={200}
                  height={48}
                  className="object-contain object-left max-h-12 w-auto h-auto"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              InfuseTax is a comprehensive AI-powered B2B FinTech, Tax Compliance & E-Governance platform. Enabling retailers, distributors, and enterprises with end-to-end digital filing desks.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 27001 Certified & Bank-Grade Encryption</span>
            </div>
          </div>

          {/* Quick Links: The 3 Core Compliance Desks */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">The 3 Core Desks</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">1. GST Registration (1a/1b/1c)</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">2. Income Tax (IT) Return Filing</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">3. GST Return Filing (GSTR-1 &amp; 3B)</Link></li>
              <li><Link href="#ai-copilot" className="hover:text-amber-400 transition-colors">Form 16 OCR &amp; Tax Regime AI</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">ITC 2B Reconciliation</Link></li>
            </ul>
          </div>

          {/* Partner Suite */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Tier Network</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/sign-in" className="hover:text-amber-400 transition-colors">Tier 1: Company Super Admin</Link></li>
              <li><Link href="/sign-in" className="hover:text-amber-400 transition-colors">Tier 2: Master Distributor Desk</Link></li>
              <li><Link href="/sign-in" className="hover:text-amber-400 transition-colors">Tier 3: Retailer Outlet POS</Link></li>
              <li><Link href="/sign-in" className="hover:text-amber-400 transition-colors">Tier 4: Operator Counter Terminal</Link></li>
              <li><Link href="#pricing" className="hover:text-amber-400 transition-colors">Commercial Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>InfuseTax Headquarters, Financial District, Cyber City, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+91 98765 43210 (24x7 Partner Desk)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>support@infusetax.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Subscribe to Tax Updates & Regulatory Changes:</div>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                />
                <button className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold flex-shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div>
            &copy; {new Date().getFullYear()} InfuseTax Technologies Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-xs">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Security Architecture</Link>
            <Link href="#" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
