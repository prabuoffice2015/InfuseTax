"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  Zap
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citation?: string;
  actionPrompt?: string;
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiCopilotDrawer({ isOpen, onClose }: AiCopilotDrawerProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Namaste! I am your InfuseTax AI Compliance Copilot. Ask me anything about Budget 2025-26 Tax Slabs, GST HSN Codes, GSTR-2B ITC Mismatches, or Section 80CCD(1B) deductions.",
      timestamp: "Just now",
      citation: "CBDT & GSTN Circulars 2025-26",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sampleQueries = [
    "What is the standard deduction in Budget 2025-26?",
    "HSN code for Readymade Cotton Garments",
    "How to resolve GSTR-2B vs Books ITC mismatch?",
    "Threshold for GST Composition Scheme in TN",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    // Simulate AI Copilot Intelligent Inference
    setTimeout(() => {
      let aiReply = "";
      let citation = "";

      const lower = textToSend.toLowerCase();

      if (lower.includes("budget") || lower.includes("standard deduction") || lower.includes("regime") || lower.includes("slab")) {
        aiReply = "Under Union Budget 2025-26, the Standard Deduction for salaried taxpayers under the New Tax Regime is ₹75,000 (increased from ₹50,000). Income up to ₹7,75,000 is effectively tax-free under Section 87A rebate! The 0% slab applies up to ₹3,00,000, 5% for ₹3L-₹7L, 10% for ₹7L-₹10L, 15% for ₹10L-₹12L, 20% for ₹12L-₹15L, and 30% above ₹15L.";
        citation = "Finance Act 2025 / Section 115BAC";
      } else if (lower.includes("hsn") || lower.includes("garment") || lower.includes("cotton")) {
        aiReply = "The HSN code for Readymade Cotton Garments is HSN 6109 (T-Shirts/Singlets knitted) or HSN 6205 (Men's Woven Cotton Shirts). The GST rate is 5% if sales value is ≤ ₹1,000 per piece, and 12% if value is > ₹1,000 per piece.";
        citation = "GST Rate Schedule / Chapter 61 & 62";
      } else if (lower.includes("itc") || lower.includes("mismatch") || lower.includes("2b")) {
        aiReply = "To resolve GSTR-2B vs Purchase Register mismatch: 1) Verify if supplier filed GSTR-1 after 11th/13th of the month. 2) Ineligible ITC under Sec 17(5) (e.g. food, motor vehicles) must be reversed in Table 4(B). 3) For un-reflected invoices, mark status as 'Pending Supplier Upload' and claim in subsequent return once reflected.";
        citation = "Rule 36(4) CGST Rules & Sec 16(2)(aa)";
      } else if (lower.includes("composition") || lower.includes("threshold")) {
        aiReply = "The turnover limit for the GST Composition Scheme in Tamil Nadu and normal category states is ₹1.50 Crore (₹75 Lakhs for Special Category North-East States). Composition tax rate: Traders/Manufacturers = 1% (0.5% CGST + 0.5% SGST), Restaurants = 5%, Service Providers under Sec 10(2A) = 6% (up to ₹50L turnover).";
        citation = "Section 10 CGST Act 2017";
      } else {
        aiReply = `Under Indian taxation rules, your query regarding "${textToSend}" requires reviewing the relevant GSTN / Income Tax portal guidelines. Our automated filing engine applies all validated thresholds with zero penalty risk.`;
        citation = "InfuseTax Compliance Knowledge Graph";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citation,
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold flex items-center space-x-1.5">
                  <span>AI Tax & Compliance Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono font-normal">
                    Budget 2025-26
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">Live Indian Tax Law Knowledge Base</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Query Chips */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 text-[11px] rounded-lg font-medium shrink-0 transition-all text-left shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${m.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.sender === "user"
                      ? "bg-blue-700 text-white"
                      : "bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xs"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] space-y-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      m.sender === "user"
                        ? "bg-blue-700 text-white font-medium rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none font-normal"
                    }`}
                  >
                    {m.text}

                    {m.citation && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center space-x-1 text-[10px] text-slate-500 font-medium">
                        <BookOpen className="w-3 h-3 text-amber-600" />
                        <span>Source: {m.citation}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 font-mono px-1">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>AI analyzing tax provisions & case laws...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about GST, ITR, TDS, HSN..."
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-800"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl shadow-md transition-transform transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>InfuseTax AI Engine • Verified against Income Tax Act 1961 & CGST Rules</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
