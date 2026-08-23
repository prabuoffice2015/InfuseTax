"use client";

import React, { useState, useEffect } from "react";
import { 
  QrCode, 
  Check, 
  Copy, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  X, 
  ArrowRight,
  AlertCircle,
  Smartphone,
  CheckCircle2
} from "lucide-react";

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number, txnId: string) => void;
  userRole?: string;
}

export default function UpiQrModal({ isOpen, onClose, onSuccess, userRole = "Retailer" }: UpiQrModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("5000");
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [txnRef, setTxnRef] = useState<string>("");

  const VPA = "infusetax.retail@icici";
  const PAYEE_NAME = "InfuseTax Technologies Pvt Ltd";

  useEffect(() => {
    if (isOpen) {
      const generatedRef = `TXN${Date.now().toString().slice(-8)}`;
      setTxnRef(generatedRef);
      setTimeLeft(300);
      setIsPaid(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || isPaid) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, isPaid]);

  if (!isOpen) return null;

  const currentAmt = parseFloat(customAmount) || selectedAmount || 1000;
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(VPA)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${currentAmt}&cu=INR&tr=${txnRef}&tn=${encodeURIComponent(`Wallet Topup ${txnRef}`)}`;

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiIntentString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        onSuccess(currentAmt, txnRef);
        onClose();
      }, 1800);
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Dynamic UPI QR Top-Up</h3>
              <p className="text-[11px] text-blue-200">Instant Wallet Balance Credit (0% Fees)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Payment Verified!</h4>
              <p className="text-xs text-slate-500 mt-1">₹{currentAmt.toLocaleString()} credited instantly to your wallet.</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono font-bold text-emerald-800">
              UTR Ref: {txnRef}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount Selection Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Top-Up Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      parseFloat(customAmount) === amt
                        ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount..."
                  className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Dynamic QR Code Card */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">Scan via Any UPI App</span>
                <div className="flex items-center space-x-1 text-amber-600 font-bold font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* Dynamic QR Code Representation */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <svg
                  className="w-44 h-44 mx-auto"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer corner finders */}
                  <rect x="10" y="10" width="50" height="50" rx="6" fill="#1E293B" />
                  <rect x="20" y="20" width="30" height="30" rx="3" fill="white" />
                  <rect x="27" y="27" width="16" height="16" rx="2" fill="#1E40AF" />

                  <rect x="140" y="10" width="50" height="50" rx="6" fill="#1E293B" />
                  <rect x="150" y="20" width="30" height="30" rx="3" fill="white" />
                  <rect x="157" y="27" width="16" height="16" rx="2" fill="#1E40AF" />

                  <rect x="10" y="140" width="50" height="50" rx="6" fill="#1E293B" />
                  <rect x="20" y="150" width="30" height="30" rx="3" fill="white" />
                  <rect x="27" y="157" width="16" height="16" rx="2" fill="#1E40AF" />

                  {/* Data Pattern Grid Simulated */}
                  <rect x="70" y="15" width="12" height="12" fill="#334155" />
                  <rect x="90" y="15" width="12" height="12" fill="#334155" />
                  <rect x="115" y="15" width="12" height="12" fill="#334155" />
                  <rect x="70" y="35" width="12" height="12" fill="#334155" />
                  <rect x="100" y="35" width="20" height="12" fill="#334155" />
                  <rect x="70" y="55" width="55" height="12" fill="#334155" />

                  <rect x="15" y="70" width="45" height="12" fill="#334155" />
                  <rect x="70" y="75" width="15" height="15" fill="#334155" />
                  <rect x="95" y="75" width="35" height="15" fill="#334155" />
                  <rect x="140" y="70" width="45" height="12" fill="#334155" />

                  {/* Center InfuseTax Logo Badge */}
                  <rect x="75" y="75" width="50" height="50" rx="10" fill="#1E40AF" />
                  <text x="100" y="105" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>

                  <rect x="15" y="115" width="45" height="12" fill="#334155" />
                  <rect x="70" y="135" width="18" height="18" fill="#334155" />
                  <rect x="95" y="135" width="35" height="18" fill="#334155" />
                  <rect x="140" y="90" width="18" height="35" fill="#334155" />
                  <rect x="165" y="90" width="20" height="15" fill="#334155" />

                  <rect x="70" y="165" width="55" height="15" fill="#334155" />
                  <rect x="135" y="140" width="20" height="40" fill="#334155" />
                  <rect x="160" y="140" width="25" height="40" fill="#334155" />
                </svg>
              </div>

              {/* Amount & VPA */}
              <div className="space-y-1">
                <div className="text-lg font-extrabold text-slate-900 font-mono">₹{currentAmt.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center space-x-1">
                  <span>VPA: {VPA}</span>
                </div>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">GPay</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">PhonePe</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Paytm</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">BHIM</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Cred</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-transform transform hover:scale-[1.01] disabled:opacity-60"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>I Have Paid (Simulate Webhook Credit)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "UPI Intent Link Copied!" : "Copy UPI Intent Link"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
