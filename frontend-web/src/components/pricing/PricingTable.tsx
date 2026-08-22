"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingTable() {
  const plans = [
    {
      name: "Retailer Outlet",
      badge: "Most Popular",
      price: "₹999",
      period: "/ year",
      desc: "For local cyber cafes, CSC centers, and tax consultants serving walk-in customers.",
      features: [
        "Full ITR & GST Return Desks",
        "Form 16 AI OCR Auto-Extraction",
        "PAN Card (Form 49A / Correction)",
        "Passport Application & PCC Desk",
        "Dynamic Government Certificates",
        "Instant Digital Wallet Payouts",
        "Print Branded Tax Receipts",
      ],
      cta: "Register as Retailer",
      ctaLink: "/create-account",
      popular: true,
      cardBg: "bg-white border-blue-600 shadow-xl ring-2 ring-blue-600",
      btnBg: "bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20",
    },
    {
      name: "Master Distributor",
      badge: "High Margin",
      price: "₹4,999",
      period: "/ year",
      desc: "For regional distribution partners managing a network of 50+ retail counters.",
      features: [
        "Everything in Retailer Outlet",
        "Unlimited Downline Retailer Creation",
        "P2P Wallet Balance Distribution",
        "Network-Wide Commission Overrides",
        "Consolidated Tax Filing Reports",
        "Priority Document Approval Queue",
        "Dedicated Account Manager",
      ],
      cta: "Become Distributor",
      ctaLink: "/create-account",
      popular: false,
      cardBg: "bg-white border-slate-200 shadow-sm hover:shadow-lg",
      btnBg: "bg-slate-900 hover:bg-slate-800 text-white",
    },
    {
      name: "White-Label Tenant",
      badge: "Enterprise",
      price: "₹14,999",
      period: "/ year",
      desc: "For corporate brands and FinTechs launching their own branded tax portal.",
      features: [
        "Everything in Master Distributor",
        "Custom Domain (tax.yourbrand.com)",
        "Custom Logo, Favicon & Brand Colors",
        "Custom SMS Sender ID & Invoicing",
        "Full REST API & Webhook Access",
        "Self-Hosted or Cloud Deployment",
        "24/7 SLA & Regulatory Compliance",
      ],
      cta: "Contact Enterprise",
      ctaLink: "/create-account",
      popular: false,
      cardBg: "bg-white border-slate-200 shadow-sm hover:shadow-lg",
      btnBg: "bg-slate-900 hover:bg-slate-800 text-white",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Flexible Plans for Every Stage of Growth
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Choose the right subscription tier for your counter, regional distributor network, or white-label enterprise.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 ${plan.cardBg}`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-700'}`}>
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-6 min-h-[36px]">{plan.desc}</p>

                {/* Price */}
                <div className="flex items-baseline space-x-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-sm font-semibold text-slate-500">{plan.period}</span>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Included Features:</div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2.5 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <Link
                href={plan.ctaLink}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] ${plan.btnBg}`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
