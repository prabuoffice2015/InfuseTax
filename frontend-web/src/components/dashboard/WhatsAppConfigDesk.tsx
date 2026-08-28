"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  Settings2, 
  Phone, 
  Key, 
  Radio, 
  Sparkles, 
  Check, 
  Zap,
  Globe,
  Sliders
} from "lucide-react";
import { secureApiCall } from "@/lib/crypto";

export default function WhatsAppConfigDesk() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [provider, setProvider] = useState<string>("meta");
  const [phoneNumberId, setPhoneNumberId] = useState<string>("109283746592019");
  const [apiToken, setApiToken] = useState<string>("");
  const [senderPhone, setSenderPhone] = useState<string>("+91 98765 43210");
  const [commonAdminNumber, setCommonAdminNumber] = useState<string>("9944072249");
  const [envEnabled, setEnvEnabled] = useState<boolean>(true);

  // Test Message State
  const [testMobile, setTestMobile] = useState<string>("+91 98765 43210");
  const [testMessage, setTestMessage] = useState<string>(
    "Hello from InfuseTax! This is a verified test notification from the WhatsApp Business Gateway."
  );
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await secureApiCall("/api/v1/whatsapp/config");
      if (res.ok && res.data?.config) {
        const c = res.data.config;
        setEnvEnabled(c.env_enabled ?? true);
        setWhatsappEnabled(c.tier1_tenant_enabled ?? true);
        setProvider(c.tier1_tenant_config?.provider || c.provider || "meta");
        setPhoneNumberId(c.tier1_tenant_config?.phone_number_id || c.phone_number_id || "");
        setSenderPhone(c.tier1_tenant_config?.sender_phone || c.sender_number || "+91 98765 43210");
        setCommonAdminNumber(c.common_admin_number || "9944072249");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await secureApiCall("/api/v1/admin/whatsapp/config", {
        method: "POST",
        body: JSON.stringify({
          enabled: whatsappEnabled,
          provider,
          phone_number_id: phoneNumberId,
          api_token: apiToken,
          sender_phone: senderPhone,
        })
      });

      if (res.ok) {
        showToast("WhatsApp Gateway configuration saved successfully.", "success");
      } else {
        showToast(res.data?.message || "Failed to save configuration.", "error");
      }
    } catch (e) {
      showToast("Network error saving configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMobile) {
      showToast("Please enter a recipient mobile number.", "error");
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await secureApiCall("/api/v1/whatsapp/test-message", {
        method: "POST",
        body: JSON.stringify({
          mobile: testMobile,
          message: testMessage
        })
      });

      setTestResult(res.data?.result || res.data);
      if (res.ok && res.data?.result?.status !== "skipped") {
        showToast("Test WhatsApp message dispatched successfully!", "success");
      } else if (res.data?.result?.status === "skipped") {
        showToast("WhatsApp dispatch was skipped because communication is turned OFF.", "error");
      } else {
        showToast(res.data?.message || "Dispatch failed.", "error");
      }
    } catch (e) {
      showToast("Network error sending test message.", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg ${
          toastMsg.type === "success" 
            ? "bg-emerald-600 text-white shadow-emerald-600/20" 
            : "bg-red-600 text-white shadow-red-600/20"
        }`}>
          <div className="flex items-center space-x-2">
            {toastMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="hover:opacity-75 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white border border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Tier 1 &amp; Tier 2 Multi-Tenant Gateway</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              whatsappEnabled && envEnabled 
                ? "bg-emerald-500 text-white border-emerald-400 animate-pulse" 
                : "bg-slate-700 text-slate-300 border-slate-600"
            }`}>
              {whatsappEnabled && envEnabled ? "🟢 Active & Enabled" : "🔴 Disabled"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            WhatsApp Business Communication Gateway
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Automate instant real-time WhatsApp alerts for <strong className="text-emerald-300">Wallet Apply Requests</strong>, <strong className="text-emerald-300">Wallet Approval Credits</strong>, and <strong className="text-emerald-300">GST/ITR Verified Certificates</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={loadConfig}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 transition-all cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid Layout: Config + Test Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Tenant WhatsApp Preferences</h3>
                  <p className="text-xs text-slate-500">Configure global WhatsApp dispatch for downlines and clients.</p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-black text-slate-800">
                  {whatsappEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </label>
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                WhatsApp API Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "meta", title: "Meta Cloud API", desc: "Official WhatsApp Business API" },
                  { id: "ultramsg", title: "UltraMsg / Webhook", desc: "Instance Webhook Gateway" },
                  { id: "twilio", title: "Twilio WhatsApp", desc: "Enterprise Communications" },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      provider === p.id 
                        ? "border-emerald-600 bg-emerald-50/50 shadow-sm" 
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">{p.title}</span>
                      {provider === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Phone Number ID / Instance ID
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 109283746592019"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Default Sender Number
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Common Admin WhatsApp Alert Number (.env)
                  </label>
                  <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    Auto-Copied on All Wallet Events
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={commonAdminNumber ? `+91 ${commonAdminNumber}` : "+91 9944072249"}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-black font-mono text-emerald-900 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Whenever any <strong>Tier 3 Retailer</strong> or <strong>Tier 4 Operator</strong> applies for or receives approval for wallet funds, this central number automatically receives instant WhatsApp audit notifications with applicant details.
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  API Access Token (Meta Cloud Token / Bearer Key)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Leave empty to use server .env configured token"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Default token loaded from server environment variable <code className="text-slate-700 font-bold">WHATSAPP_API_TOKEN</code>.
                </p>
              </div>
            </div>

            {/* Triggers Breakdown */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Automated WhatsApp Event Triggers
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "Wallet Apply Alert", desc: "Notifies Super Admin/Distributor when Retailer submits top-up.", active: true },
                  { title: "Wallet Credit Approval", desc: "Sends instant credit slip & updated balance to Retailer.", active: true },
                  { title: "Service Filing Approved", desc: "Sends official ARN certificate download link to client.", active: true },
                  { title: "Shift Balance & Receipt", desc: "Enables operators to share instant thermal slips via WhatsApp.", active: true },
                ].map((t, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 block">{t.title}</span>
                      <span className="text-[11px] text-slate-500 leading-tight">{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save WhatsApp Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live WhatsApp Test Harness */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Live WhatsApp Tester</h3>
                <p className="text-[11px] text-slate-500">Test outbound message dispatch.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Recipient Phone Number</label>
                <input
                  type="text"
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Message Content</label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestMessage}
                disabled={testing}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{testing ? "Dispatching..." : "Send Test WhatsApp Message"}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono space-y-1 overflow-hidden border border-slate-800 animate-in fade-in">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Gateway Response:</div>
                <pre className="overflow-x-auto text-[10px] leading-tight">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
