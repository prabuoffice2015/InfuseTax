"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  Clock, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  FileText, 
  Building2, 
  CreditCard 
} from "lucide-react";

export default function HeaderTwo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      {/* Top Header Contact Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>support@infusetax.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISO 27001 Certified & Bank-Grade Security</span>
            </span>
            <span className="text-slate-600">|</span>
            <Link href="/sign-in" className="hover:text-amber-400 transition-colors">Partner Portal</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-12 w-48 sm:h-14 sm:w-56 transition-transform duration-200 group-hover:scale-[1.02]">
            <Image
              src="/brand/infusetax_logo_600x200.png"
              alt="InfuseTax Logo"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Desktop Menu Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-700">
          <Link href="/" className="text-blue-700 font-semibold hover:text-blue-800 transition-colors">
            Home
          </Link>

          {/* Services Dropdown */}
          <div className="relative group" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
            <button className="flex items-center space-x-1 hover:text-blue-700 py-2 transition-colors">
              <span>Services</span>
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 transition-all duration-200 ${isServicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="space-y-1">
                <Link href="#services" className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">GST Registration & Filing</div>
                    <div className="text-[11px] text-slate-500">GSTR-1, GSTR-3B & Anomaly Check</div>
                  </div>
                </Link>

                <Link href="#services" className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-amber-50 transition-colors">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Income Tax (ITR) Filing</div>
                    <div className="text-[11px] text-slate-500">ITR-1, 2, 4 with Form 16 OCR</div>
                  </div>
                </Link>

                <Link href="#services" className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">E-Governance Desk</div>
                    <div className="text-[11px] text-slate-500">PAN, Aadhaar & Passport Desks</div>
                  </div>
                </Link>

                <Link href="#services" className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-purple-50 transition-colors">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Dynamic Certificates</div>
                    <div className="text-[11px] text-slate-500">Community, Income & Seva Desks</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="#ai-copilot" className="flex items-center space-x-1.5 text-slate-700 hover:text-blue-700 transition-colors">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Copilot</span>
          </Link>

          <Link href="#pricing" className="hover:text-blue-700 transition-colors">
            Pricing Plans
          </Link>

          <Link href="#contact" className="hover:text-blue-700 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            href="/sign-in"
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg shadow-blue-700/20 hover:shadow-blue-700/30 transition-all transform hover:-translate-y-0.5 flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-blue-200" />
            <span>Partner Portal Login</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-700 font-semibold">Home</Link>
            <Link href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-700">Tax & E-Gov Services</Link>
            <Link href="#ai-copilot" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-700 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Copilot & OCR</span>
            </Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-700">Pricing Plans</Link>
            <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-700">Contact Support</Link>
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5">
            <Link
              href="/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-blue-700 rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span>Partner Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
