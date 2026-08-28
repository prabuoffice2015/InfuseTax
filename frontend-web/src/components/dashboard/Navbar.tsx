"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Plus, 
  Sparkles, 
  Bell, 
  User, 
  Building2, 
  Search, 
  Check, 
  ArrowUpRight,
  Globe
} from "lucide-react";

import AiCopilotDrawer from "@/components/dashboard/AiCopilotDrawer";
import { Language, languageNames } from "@/lib/i18n";
import { getAuthUser, getAuthToken, clearAuthSession } from "@/lib/auth";
import { secureApiCall } from "@/lib/crypto";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userTitle?: string;
  userCode?: string;
  walletBalance?: number;
}

export default function Navbar({
  userTitle = "Ramesh Kumar",
  userCode = "INF1029",
  walletBalance = 48750.00
}: NavbarProps) {
  const router = useRouter();
  // Notifications & Global Search State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [isNotifLoading, setIsNotifLoading] = useState<boolean>(false);

  const fetchLiveNotifications = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const { ok, data } = await secureApiCall("/api/v1/notifications");
      if (ok && data.status === "success" && Array.isArray(data.notifications)) {
        setNotificationsList(data.notifications);
        setUnreadNotifCount(data.unread_count || 0);
      }
    } catch (e) {
      console.error("Failed to load live notifications:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadNotifCount(0);
      await secureApiCall("/api/v1/notifications/read-all", { method: "POST" });
    } catch (e) {
      console.error("Failed to mark all read:", e);
    }
  };

  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "password" | "pin">("profile");
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [activeUser, setActiveUser] = useState<{ name: string; email: string; role: string; wallet?: number; mobile?: string; city?: string; state?: string; tenant?: string } | null>(null);
  const [utrAmount, setUtrAmount] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank (A/c: 50200012345678)");
  const [isSuccess, setIsSuccess] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCity, setEditCity] = useState("Coimbatore");
  const [editState, setEditState] = useState("Tamil Nadu");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSuccessMsg, setPassSuccessMsg] = useState("");
  const [passErrorMsg, setPassErrorMsg] = useState("");
  const [isSavingPass, setIsSavingPass] = useState(false);

  const [liveWallet, setLiveWallet] = useState<number | null>(null);

  const fetchLiveBalance = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const { ok, data } = await secureApiCall("/api/v1/auth/profile");
      if (ok && data.user) {
        setActiveUser(data.user);
        if (data.user.wallet !== undefined && data.user.wallet !== null) {
          setLiveWallet(parseFloat(data.user.wallet));
        }
      }
    } catch (e) {
      console.error("Failed to fetch live balance:", e);
    }
  };

  React.useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setActiveUser(user);
      setEditName(user.name || "");
      setEditMobile(user.mobile || "");
      setEditCity(user.city || "Coimbatore");
      setEditState(user.state || "Tamil Nadu");
    }
    fetchLiveBalance();
    fetchLiveNotifications();

    const handleWalletUpdated = () => fetchLiveBalance();
    const handleNotifUpdated = () => fetchLiveNotifications();

    window.addEventListener("infusetax_wallet_updated", handleWalletUpdated);
    window.addEventListener("infusetax_notification_updated", handleNotifUpdated);

    const notifInterval = setInterval(() => {
      fetchLiveNotifications();
    }, 10000);

    return () => {
      window.removeEventListener("infusetax_wallet_updated", handleWalletUpdated);
      window.removeEventListener("infusetax_notification_updated", handleNotifUpdated);
      clearInterval(notifInterval);
    };
  }, []);

  // Security PIN State
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSuccessMsg, setPinSuccessMsg] = useState("");
  const [pinErrorMsg, setPinErrorMsg] = useState("");
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg("");
    setPinSuccessMsg("");

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinErrorMsg("Security PIN must be exactly 4 digits (0-9).");
      return;
    }
    if (newPin !== confirmPin) {
      setPinErrorMsg("New PIN and Confirm PIN do not match.");
      return;
    }

    setIsSavingPin(true);
    try {
      const token = getAuthToken() || "";
      const res = await fetch("/api/v1/auth/pin/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ new_pin: newPin })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setPinSuccessMsg("Security 2FA PIN updated successfully!");
        setNewPin("");
        setConfirmPin("");
      } else {
        setPinErrorMsg(data.message || "Failed to update Security PIN.");
      }
    } catch (err) {
      setPinErrorMsg("Network connection error.");
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    clearAuthSession();
    router.push("/sign-in");
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrAmount || parseFloat(utrAmount) <= 0) return;

    try {
      const token = getAuthToken() || "";
      if (!token) {
        alert("Session expired. Please sign in again.");
        return;
      }

      const res = await fetch("/api/v1/wallet/requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(utrAmount),
          payment_mode: "BANK_UTR",
          reference_no: utrNo || `UTR-${Date.now()}`,
          reference_id: utrNo || `UTR-${Date.now()}`,
          remarks: `Deposit to: ${selectedBank}`
        })
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setIsSuccess(true);
        window.dispatchEvent(new Event("infusetax_wallet_updated"));
        setTimeout(() => {
          setIsSuccess(false);
          setShowTopupModal(false);
          setUtrAmount("");
          setUtrNo("");
        }, 1800);
      } else {
        alert(data.message || "Failed to submit top-up request.");
      }
    } catch (err) {
      console.error("Top-up request failed:", err);
      alert("Network error submitting top-up request.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    try {
      const token = getAuthToken() || "";
      const res = await fetch("/api/v1/auth/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editName,
          mobile: editMobile,
          city: editCity,
          state: editState,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setProfileSuccessMsg("Profile updated successfully!");
        if (activeUser) {
          setActiveUser({ ...activeUser, name: editName, mobile: editMobile, city: editCity, state: editState });
        }
      } else {
        setProfileErrorMsg(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileErrorMsg("Network connection error.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg("");
    setPassSuccessMsg("");

    if (newPass !== confirmPass) {
      setPassErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsSavingPass(true);
    try {
      const token = getAuthToken() || "";
      const res = await fetch("/api/v1/auth/password/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPass,
          new_password: newPass,
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setPassSuccessMsg("Password changed successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassErrorMsg(data.message || "Failed to change password.");
      }
    } catch (err) {
      setPassErrorMsg("Network connection error.");
    } finally {
      setIsSavingPass(false);
    }
  };

  // Check if current user is Retailer or Operator (Only they require wallet balance & topup)
  const currentRole = (activeUser?.role || "").toLowerCase();
  const showWalletBadge = currentRole.includes("retailer") || currentRole.includes("operator");

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left: Tenant Code, Search & Language Switcher */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-xl">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900 font-mono">Tenant: {activeUser?.tenant || "INFUSE"}</span>
          </div>

          <div 
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center justify-between px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/60 rounded-xl border border-slate-200/60 w-56 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Quick search...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-white border border-slate-300 rounded px-1 text-slate-400">Ctrl+K</kbd>
          </div>

          {/* Regional Language Switcher */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as Language)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {Object.entries(languageNames).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Wallet Balance (Retailer/Operator only), AI Status & Profile */}
        <div className="flex items-center space-x-4">
          {/* Live AI Copilot Status Trigger Button */}
          <button
            type="button"
            onClick={() => setShowAiDrawer(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 hover:border-amber-300 rounded-full text-xs font-semibold text-amber-800 transition-all cursor-pointer shadow-xs transform hover:scale-105"
            title="Open AI Tax & Compliance Copilot Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI Copilot Active</span>
          </button>

          {/* Wallet Balance Badge - Shown ONLY for Retailer (Tier 3) and Operator (Tier 4) */}
          {showWalletBadge && (
            <div className="flex items-center bg-slate-900 text-white rounded-xl pl-3.5 pr-1.5 py-1.5 shadow-md shadow-slate-900/10">
              <div className="flex items-center space-x-2 mr-3">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Wallet Balance</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white font-mono leading-tight">
                    ₹{(liveWallet !== null ? liveWallet : (activeUser?.wallet !== undefined ? activeUser.wallet : walletBalance)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTopupModal(true)}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold cursor-pointer"
                title="Request Bank UTR Top-Up"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Top Up</span>
              </button>
            </div>
          )}

          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchLiveNotifications();
              }}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
              title="Platform Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center px-1 shadow-md shadow-rose-600/30 animate-pulse">
                  {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Platform Notifications</span>
                    {unreadNotifCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full">
                        {unreadNotifCount} New
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                        Up to date
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notificationsList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                      No recent notifications
                    </div>
                  ) : (
                    notificationsList.map(n => (
                      <div key={n.id} className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-blue-600' : 'bg-slate-300'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="text-xs font-bold text-slate-900 truncate">{n.title}</div>
                            {n.category && (
                              <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded ${
                                n.category === 'approval' ? 'bg-emerald-100 text-emerald-800' :
                                n.category === 'filing' ? 'bg-amber-100 text-amber-800' :
                                n.category === 'wallet' ? 'bg-blue-100 text-blue-800' :
                                n.category === 'pricing' ? 'bg-purple-100 text-purple-800' :
                                n.category === 'announcement' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {n.category}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 leading-snug">{n.desc}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{n.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info & Dropdown Trigger */}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left cursor-pointer group"
              title="Click to view Profile & Change Password"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform">
                {(activeUser?.name || userTitle).charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none group-hover:text-blue-700 transition-colors">
                  {activeUser?.name || userTitle}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {activeUser?.role ? activeUser.role.toUpperCase() : userCode}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer ml-1"
              title="Sign Out to Login Desk"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Profile & Security Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Account Management</h3>
                  <p className="text-xs text-slate-500">Edit profile details or update security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl space-x-1">
              <button
                onClick={() => setProfileTab("profile")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${profileTab === "profile" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setProfileTab("password")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${profileTab === "password" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Password
              </button>
              {/* 2FA Security PIN only for Tier 1 Super Admin */}
              {(activeUser?.role === "super_admin" || activeUser?.role === "admin") && (
                <button
                  onClick={() => setProfileTab("pin")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${profileTab === "pin" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  2FA Security PIN
                </button>
              )}
            </div>

            {/* Tab 1: Profile Edit */}
            {profileTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                    ✓ {profileSuccessMsg}
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                    ⚠ {profileErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={activeUser?.email || ""}
                    className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Mobile</label>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                    <input
                      type="text"
                      disabled
                      value={(activeUser?.role || "").toUpperCase()}
                      className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            )}


            {/* Tab 3: Security 2FA PIN */}
            {profileTab === "pin" && (
              <form onSubmit={handleSavePin} className="space-y-4">
                {pinSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                    ✓ {pinSuccessMsg}
                  </div>
                )}
                {pinErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                    ⚠ {pinErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New 4-Digit Security PIN *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[1em] text-lg p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Enter a 4-digit numerical PIN used for approving instant transactions & 2FA.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm 4-Digit Security PIN *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[1em] text-lg p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPin}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isSavingPin ? "Saving..." : "Update Security PIN"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Change Password */}
            {profileTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                    ✓ {passSuccessMsg}
                  </div>
                )}
                {passErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                    ⚠ {passErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPass}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isSavingPass ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manual Bank UTR Top-Up Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Wallet Top-Up Request</h3>
                  <p className="text-xs text-slate-500">Deposit to Company Bank & submit UTR</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Top-Up Request Submitted!</h4>
                <p className="text-xs text-slate-600">Company Accountant will verify UTR and credit your wallet within 15 mins.</p>
              </div>
            ) : (
              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Deposit Company Bank Account</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option>HDFC Bank (A/c: 50200012345678, IFSC: HDFC0001234)</option>
                    <option>ICICI Bank (A/c: 001105009988, IFSC: ICIC0000011)</option>
                    <option>State Bank of India (A/c: 33445566778, IFSC: SBIN0004567)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top-Up Amount (₹) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={utrAmount}
                    onChange={(e) => setUtrAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    required
                    min="100"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank UTR / IMPS Reference No <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={utrNo}
                    onChange={(e) => setUtrNo(e.target.value)}
                    placeholder="e.g. 423512349876"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20"
                  >
                    Submit UTR for Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Tax Copilot Assistant Drawer */}
      <AiCopilotDrawer 
        isOpen={showAiDrawer} 
        onClose={() => setShowAiDrawer(false)} 
      />

      {/* Global Command Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-4 pt-20">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-100 rounded-2xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Search tax services, tenant companies, users, or audit logs..."
                className="bg-transparent text-sm text-slate-900 font-semibold focus:outline-none w-full"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">ESC</button>
            </div>

            <div className="p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Quick Shortcuts</div>
              {[
                { title: "Platform Overview", desc: "KPIs, liquidity pool & company breakdown", href: "/dashboard/company?tab=overview" },
                { title: "Company Creation & Management", desc: "Deploy white-label tenant companies", href: "/dashboard/company?tab=companies" },
                { title: "Company Users (T2/T3/T4)", desc: "Manage downline network user directory", href: "/dashboard/company?tab=company-users" },
                { title: "Tier 2 Pricing Setup", desc: "Configure base costs for 6 compliance services", href: "/dashboard/company?tab=pricing" },
                { title: "Bank UTR Approvals", desc: "Review and credit pending wallet deposits", href: "/dashboard/company?tab=utr" },
                { title: "Master Financial Audit Ledger", desc: "Immutable double-entry transaction trail", href: "/dashboard/company?tab=ledger" },
              ]
                .filter(item => !globalSearchTerm || item.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || item.desc.toLowerCase().includes(globalSearchTerm.toLowerCase()))
                .map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setShowSearchModal(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
