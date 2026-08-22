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
              <div className="relative h-12 w-48 brightness-0 invert opacity-90">
                <Image
                  src="/brand/infusetax_logo_600x200.png"
                  alt="InfuseTax Logo"
                  fill
                  className="object-contain object-left"
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

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tax Desks</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Income Tax (ITR-1/2/4)</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">GST Registration</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">GSTR-1 & GSTR-3B Filing</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Form 16 OCR Auto-Fill</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">TDS Reconciliations</Link></li>
            </ul>
          </div>

          {/* E-Gov Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">E-Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">PAN Card Desk (Form 49A)</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Aadhaar Updates Hub</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Passport Application Desk</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Dynamic Certificates</Link></li>
              <li><Link href="#services" className="hover:text-amber-400 transition-colors">Voter & Ration Card Desks</Link></li>
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
