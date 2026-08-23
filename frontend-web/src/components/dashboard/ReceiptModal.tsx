"use client";

import React, { useState } from "react";
import { Printer, X, CheckCircle2, QrCode, Download, ShieldCheck, Share2 } from "lucide-react";
import WhatsAppReceiptModal from "./WhatsAppReceiptModal";

export interface ReceiptData {
  id: string;
  client: string;
  service: string;
  amount: number;
  comm: number;
  status: string;
  date: string;
  customerMobile?: string;
  customerPanOrGst?: string;
  operatorId?: string;
  paymentMode?: string;
  taxBreakdown?: {
    baseAmount: number;
    cgst: number;
    sgst: number;
  };
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const [printLayout, setPrintLayout] = useState<"thermal" | "a4">("a4");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  if (!receipt) return null;

  const baseAmount = receipt.taxBreakdown?.baseAmount ?? Math.round(receipt.amount / 1.18);
  const totalTax = receipt.amount - baseAmount;
  const halfTax = +(totalTax / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <WhatsAppReceiptModal
        receipt={showWhatsAppModal ? receipt : null}
        onClose={() => setShowWhatsAppModal(false)}
      />

      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
          {/* Header Controls */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">Official InfuseTax Transaction Receipt</span>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Format Toggle */}
              <div className="bg-slate-800 p-1 rounded-xl flex items-center space-x-1 text-xs">
                <button
                  onClick={() => setPrintLayout("a4")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    printLayout === "a4" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPrintLayout("thermal")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    printLayout === "thermal" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  80mm
                </button>
              </div>

              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-900/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Printable Content Area */}
        <div className="p-8 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
          {printLayout === "a4" ? (
            /* Standard A4 Layout */
            <div className="space-y-6 text-slate-900 font-sans border border-slate-200 p-6 rounded-2xl bg-white">
              {/* Header Branding */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-extrabold text-lg">
                      IT
                    </div>
                    <span className="text-xl font-extrabold text-slate-950 tracking-tight">
                      Infuse<span className="text-blue-700">Tax</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    AI-Powered Tax, GST & E-Governance Platform
                  </div>
                  <div className="text-[11px] text-slate-500">GSTIN: 33AAACI1234F1Z5 | PAN: AAACI1234F</div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300 inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>PAYMENT SUCCESS</span>
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-2">
                    Ref: <span className="text-blue-700">{receipt.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{receipt.date}</div>
                </div>
              </div>

              {/* Retailer / Store Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Authorized Retail Desk</div>
                  <div className="font-bold text-slate-900 mt-0.5">Sri Balaji Digital Seva POS</div>
                  <div className="text-slate-500 text-[11px]">Retailer ID: RET-9082 | Agent: Prabhu T.</div>
                  <div className="text-slate-500 text-[11px]">Location: Salem, Tamil Nadu, IN</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Customer Details</div>
                  <div className="font-bold text-slate-900 mt-0.5">{receipt.client}</div>
                  <div className="text-slate-500 text-[11px]">Mobile: {receipt.customerMobile || "+91 98765 43210"}</div>
                  <div className="text-slate-500 text-[11px]">Ref Doc: {receipt.customerPanOrGst || "Aadhaar e-KYC"}</div>
                </div>
              </div>

              {/* Service Item Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Description of Service</th>
                    <th className="p-3 border-b border-slate-200">HSN / SAC</th>
                    <th className="p-3 border-b border-slate-200 text-right">Taxable Amt</th>
                    <th className="p-3 border-b border-slate-200 text-right">GST (18%)</th>
                    <th className="p-3 border-b border-slate-200 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{receipt.service}</div>
                      <div className="text-[11px] text-slate-500">Government Portal E-Filing & Acknowledgment Slip</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">998311</td>
                    <td className="p-3 text-right font-mono">₹{baseAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">₹{totalTax.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">₹{receipt.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals & Tax Breakup */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-1 text-[11px] text-slate-500 max-w-xs">
                  <div className="font-bold text-slate-700">Tax Breakdown (18% GST):</div>
                  <div className="flex justify-between">
                    <span>Central GST (CGST @ 9%):</span>
                    <span className="font-mono font-bold text-slate-700">₹{halfTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State GST (SGST @ 9%):</span>
                    <span className="font-mono font-bold text-slate-700">₹{halfTax.toFixed(2)}</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400">Payment Channel: InfuseTax Instant Wallet Ledger</div>
                </div>

                <div className="w-56 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">₹{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes:</span>
                    <span className="font-mono font-bold">₹{totalTax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-1.5 flex justify-between text-sm font-extrabold text-blue-900">
                    <span>Total Paid:</span>
                    <span className="font-mono">₹{receipt.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Verification Stamp & QR Code Footer */}
              <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700">
                    <QrCode className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Digitally Verified Receipt</div>
                    <div className="text-[11px] text-slate-500">Scan QR to verify filing status on tax portal</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ 256-bit Cryptographic Proof</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-24 h-10 border border-slate-300 border-dashed rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase mx-auto mb-1">
                    Store Seal
                  </div>
                  <div className="text-[10px] font-bold text-slate-700">Authorized Signatory</div>
                </div>
              </div>
            </div>
          ) : (
            /* 80mm Thermal Layout */
            <div className="max-w-xs mx-auto p-4 bg-white border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-900 space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <div className="font-bold text-sm">INfUSETax DIGITAL</div>
                <div className="text-[10px]">Sri Balaji Digital Seva Desk</div>
                <div className="text-[10px]">Salem, Tamil Nadu, IN</div>
                <div className="text-[10px]">GSTIN: 33AAACI1234F1Z5</div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                <div>TXN ID: {receipt.id}</div>
                <div>DATE: {receipt.date}</div>
                <div>CLIENT: {receipt.client}</div>
                <div>STATUS: COMPLETED</div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="font-bold">{receipt.service}</div>
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span>₹{halfTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span>₹{halfTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 flex justify-between font-bold text-xs">
                <span>TOTAL PAID:</span>
                <span>₹{receipt.amount.toFixed(2)}</span>
              </div>

              <div className="text-center pt-1 space-y-1">
                <div className="text-[10px]">THANK YOU FOR YOUR VISIT!</div>
                <div className="text-[9px] text-slate-500">Scan QR on portal for e-filing proof</div>
                <div className="text-[9px] text-slate-500">Support: support@infusetax.com</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
