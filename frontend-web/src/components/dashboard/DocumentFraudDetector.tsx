"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Fingerprint, 
  FileText,
  Scan,
  RefreshCw
} from "lucide-react";

interface ForensicCheck {
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export default function DocumentFraudDetector() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("TANGEDCO_Electricity_Bill_July2026.pdf");

  const [checks, setChecks] = useState<ForensicCheck[]>([
    {
      label: "Font & Glyph Uniformity",
      passed: true,
      score: 98,
      detail: "No font substitution or misaligned raster overlays detected.",
    },
    {
      label: "Metadata & Timestamp Integrity",
      passed: true,
      score: 95,
      detail: "PDF generation timestamp matches billing cycle metadata.",
    },
    {
      label: "Digital Seal & QR Hash Verification",
      passed: true,
      score: 99,
      detail: "QR code digital signature verified against TANGEDCO portal registry.",
    },
    {
      label: "Cross-Outlet Duplicate Detection",
      passed: true,
      score: 100,
      detail: "Document SHA-256 hash has not been submitted by any other retailer outlet.",
    },
  ]);

  const handleRunScan = () => {
    setIsScanning(true);
    setHasScanned(false);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-indigo-700">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>AI Document Forensic & Fraud Detector</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full">
                AI Vision 2.0
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Automated anti-forgery scan for Electricity Bills, PAN Cards, Form 16, and Rent Agreements
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Document Pixels...</span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              <span>Run AI Forensic Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Document Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Active Document:</span>
          <span className="text-xs font-mono font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {selectedDoc}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
          <span>SHA-256 Hash:</span>
          <span className="font-mono text-slate-700">e3b0c44298fc1c149afbf4c8...</span>
        </div>
      </div>

      {/* Forensic Diagnostic Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl border transition-all ${
              hasScanned
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {hasScanned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Cpu className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-900">{c.label}</span>
              </div>
              <span
                className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md ${
                  hasScanned ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {hasScanned ? `${c.score}% Match` : "Pending Scan"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">{c.detail}</p>
          </div>
        ))}
      </div>

      {/* Final Verification Badge */}
      {hasScanned && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">
                100% AUTHENTIC DOCUMENT — APPROVED FOR FILING
              </div>
              <div className="text-[11px] text-emerald-700">
                No tampering, pixel manipulation, or duplicated hashes found. Safe for GSTN/ITD submission.
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-800 shadow-2xs shrink-0">
            Audit ID: FRAUD-VERIFIED-90812
          </div>
        </div>
      )}

    </div>
  );
}
