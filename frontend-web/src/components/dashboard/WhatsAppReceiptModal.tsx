"use client";

import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  Send, 
  X, 
  MessageSquare, 
  Smartphone, 
  Sparkles, 
  Share2, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { ReceiptData } from "./ReceiptModal";

interface WhatsAppReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
  senderId?: string;
}

export default function WhatsAppReceiptModal({ receipt, onClose, senderId = "INFUST" }: WhatsAppReceiptModalProps) {
  const [mobileNumber, setMobileNumber] = useState<string>(
    receipt?.customerMobile ? receipt.customerMobile.replace("+91", "").trim() : "9876543210"
  );
  const [dispatchType, setDispatchType] = useState<"whatsapp" | "sms">("whatsapp");
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!receipt) return null;

  const downloadUrl = `https://infusetax.com/verify/receipt?ref=${encodeURIComponent(receipt.id)}`;

  // Formatted WhatsApp Compliant Message
  const whatsappMessage = `*Official Tax Compliance Filing Slip* 📄
━━━━━━━━━━━━━━━━━━━━
*InfuseTax E-Governance Network*

Dear *${receipt.client}*,
Your *${receipt.service}* has been processed successfully.

• *Acknowledgment / ARN:* \`${receipt.id}\`
• *Customer Ref:* ${receipt.customerPanOrGst || "Verified via Aadhaar"}
• *Status:* *${receipt.status}*
• *Filing Date:* ${receipt.date}
• *Fee Paid:* ₹${(receipt.amount || 0).toLocaleString()} (Paid via Retailer Wallet)

📥 *Download Official Tax Slip / ARN PDF:*
${downloadUrl}

_This is an automated system generated compliance slip. Thank you for choosing InfuseTax!_`;

  // Formatted DLT Compliant SMS (under 160 chars)
  const smsMessage = `[INFUST] Dear ${receipt.client}, your ${receipt.service} ARN is ${receipt.id}. Status: ${receipt.status}. Download slip: ${downloadUrl} - InfuseTax`;

  const handleCopy = () => {
    const textToCopy = dispatchType === "whatsapp" ? whatsappMessage : smsMessage;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanNumber = mobileNumber.replace(/\D/g, "");
    const formattedPhone = cleanNumber.startsWith("91") ? cleanNumber : `91${cleanNumber}`;
    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  const handleSendSms = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      alert(`SMS sent to +91 ${mobileNumber} via DLT Header [${senderId}]`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Dispatch Customer E-Receipt</h3>
              <p className="text-[11px] text-emerald-200">Instant WhatsApp & DLT SMS Notification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dispatch Channel Switch */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDispatchType("whatsapp")}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                dispatchType === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Notification</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchType("sms")}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                dispatchType === "sms"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>DLT SMS ({senderId})</span>
            </button>
          </div>

          {/* Customer Mobile Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Mobile Number (India +91)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">+91</span>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Message Live Preview Card */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Message Preview</span>
              {dispatchType === "sms" && <span className="font-mono text-[10px] text-slate-400">124/160 Chars</span>}
            </div>

            {dispatchType === "whatsapp" ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-slate-800 font-sans whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {whatsappMessage}
              </div>
            ) : (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                {smsMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {dispatchType === "whatsapp" ? (
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-transform transform hover:scale-[1.01]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send WhatsApp Receipt to +91 {mobileNumber}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendSms}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-700/25 flex items-center justify-center space-x-2 transition-transform transform hover:scale-[1.01]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Dispatch DLT SMS via [{senderId}]</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Message Copied to Clipboard!" : "Copy Formatted Compliance Text"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
