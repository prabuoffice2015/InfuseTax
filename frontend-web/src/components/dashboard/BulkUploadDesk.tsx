"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileUp, 
  Check, 
  Loader2, 
  Eye, 
  Download, 
  X, 
  FileCheck, 
  CheckCircle2,
  Trash2,
  Wand2,
  FolderArchive
} from "lucide-react";

export interface DocumentSlotConfig {
  code: string;
  label: string;
  num?: string;
  keywords: string[];
  required?: boolean;
}

export interface DocumentFileEntry {
  name: string;
  type: string;
  size: string;
  dataUrl: string;
  uploadedAt: string;
}

export const SOLE_PROP_SLOTS: DocumentSlotConfig[] = [
  { code: "sp_pan_doc", label: "1) PAN Card (Color Copy)", num: "1", keywords: ["pan", "proprietor_pan", "nsdl", "uti"] },
  { code: "sp_aadhaar_doc", label: "2) Aadhaar Card (Color Copy)", num: "2", keywords: ["aadhaar", "aadhar", "uid", "adhaar", "eaadhaar"] },
  { code: "sp_photo", label: "3) Photo Scanned", num: "3", keywords: ["passport", "photograph", "selfie", "face", "portrait", "applicant_photo"] },
  { code: "sp_signature", label: "4) Signature Scanned", num: "4", keywords: ["sign", "signature", "signat", "specimen"] },
  { code: "sp_rent_deed", label: "7) Rent Deed / Own Property Deed", num: "7", keywords: ["rent", "deed", "lease", "rental", "agreement", "patta", "tenancy", "ownership"] },
  { code: "sp_eb_receipt", label: "8) EB Receipt of Own or Lease", num: "8", keywords: ["eb", "electric", "power", "tneb", "bescom", "bill", "electricity", "kseb", "mseb"] },
  { code: "sp_tax_receipt", label: "9) Property Tax Receipt", num: "9", keywords: ["tax", "property", "corporation", "kist", "municipal", "house_tax"] },
  { code: "sp_name_board", label: "10) Front Office Name Board (2/2 Cut Out)", num: "10", keywords: ["board", "nameboard", "name_board", "signboard", "cutout", "office_board", "shop_board"] },
  { code: "sp_geo_photo", label: "11) Premises Geo Photo with Owner & Board", num: "11", keywords: ["geo", "premise", "shop", "location", "gps", "premises", "latitude", "longitude"] },
];

export const PVT_LTD_SLOTS: DocumentSlotConfig[] = [
  { code: "pvt_coi", label: "1) Incorporation Certificate (COI)", num: "1", keywords: ["coi", "incorporation", "certificate", "cin", "mca"] },
  { code: "pvt_dir_pan", label: "2) PAN Card for Both Directors", num: "2", keywords: ["director_pan", "dir_pan", "pan"] },
  { code: "pvt_dir_aadhaar", label: "3) Aadhaar for Both Directors", num: "3", keywords: ["director_aadhaar", "dir_aadhaar", "aadhaar", "aadhar", "uid"] },
  { code: "pvt_dir_photo", label: "4) Photo Scanned for Both Directors", num: "4", keywords: ["director_photo", "dir_photo", "passport", "photograph"] },
  { code: "pvt_dir_sig", label: "5) Signature of Both Directors", num: "5", keywords: ["director_sig", "dir_sig", "sign", "signature"] },
  { code: "pvt_rent_deed", label: "8) Rental Deed / Property Deed", num: "8", keywords: ["rent", "deed", "lease", "rental", "agreement", "patta"] },
  { code: "pvt_eb_receipt", label: "9) EB Receipt of Own or Lease", num: "9", keywords: ["eb", "electric", "power", "tneb", "bill", "electricity"] },
  { code: "pvt_tax_receipt", label: "10) Property Tax Receipt", num: "10", keywords: ["tax", "property", "corporation", "municipal"] },
  { code: "pvt_geo_photo", label: "11) Premises Geo Photo with Owner & Board", num: "11", keywords: ["geo", "premise", "shop", "office", "gps", "premises"] },
  { code: "pvt_msme", label: "12) MSME Registration (Udyam)", num: "12", keywords: ["msme", "udyam", "ssi"] },
  { code: "pvt_bank_proof", label: "13) Bank Passbook / Cheque (Company)", num: "13", keywords: ["bank", "cheque", "passbook", "statement"] },
  { code: "pvt_name_board", label: "14) Front Office Name Board (2/2 Cut Out)", num: "14", keywords: ["board", "name", "signboard", "office"] },
];

export const PARTNERSHIP_SLOTS: DocumentSlotConfig[] = [
  { code: "firm_deed", label: "1) Partnership Deed / LLP Agreement", num: "1", keywords: ["deed", "agreement", "llp", "partnership"] },
  { code: "firm_reg_cert", label: "2) Partnership Registration Certificate", num: "2", keywords: ["reg_cert", "registration", "certificate"] },
  { code: "firm_pan_doc", label: "3) Firm PAN Card Copy", num: "3", keywords: ["firm_pan", "pan"] },
  { code: "firm_partner_pan", label: "4) PAN Card for Both Partners", num: "4", keywords: ["partner_pan", "pan"] },
  { code: "firm_partner_aadhaar", label: "5) Aadhaar for Both Partners", num: "5", keywords: ["partner_aadhaar", "aadhaar", "aadhar", "uid"] },
  { code: "firm_partner_photo", label: "6) Photo Scanned for Both Partners", num: "6", keywords: ["partner_photo", "passport", "photograph"] },
  { code: "firm_partner_sig", label: "7) Signature of Both Partners", num: "7", keywords: ["partner_sig", "sign", "signature"] },
  { code: "firm_rent_deed", label: "10) Rental Deed / Property Deed", num: "10", keywords: ["rent", "deed", "lease", "rental"] },
  { code: "firm_eb_receipt", label: "11) EB Receipt of Own or Lease", num: "11", keywords: ["eb", "electric", "power", "tneb", "bill", "electricity"] },
  { code: "firm_tax_receipt", label: "12) Property Tax Receipt", num: "12", keywords: ["tax", "property", "corporation", "municipal"] },
  { code: "firm_geo_photo", label: "13) Premises Geo Photo with Owner & Board", num: "13", keywords: ["geo", "premise", "shop", "office", "gps"] },
  { code: "firm_msme", label: "14) MSME Registration (Udyam)", num: "14", keywords: ["msme", "udyam", "ssi"] },
  { code: "firm_bank_proof", label: "15) Bank Passbook / Cheque (Firm Account)", num: "15", keywords: ["bank", "cheque", "passbook", "statement"] },
];

export const ITR_SLOTS: DocumentSlotConfig[] = [
  { code: "it_pan_doc", label: "3) PAN Card Scanned Copy", num: "3", keywords: ["pan"] },
  { code: "it_aadhaar_doc", label: "4) Aadhaar Card Scanned Copy", num: "4", keywords: ["aadhaar", "aadhar", "uid"] },
  { code: "it_sb_bank", label: "9a) SB Account Statement (01 Apr - 31 Mar)", num: "9a", keywords: ["sb", "savings", "statement", "bank", "passbook"] },
  { code: "it_ca_bank", label: "9b) Current Account Statement (01 Apr - 31 Mar)", num: "9b", keywords: ["ca", "current", "business_bank", "statement"] },
  { code: "it_msme_doc", label: "6) MSME / SSI Certificate", num: "6", keywords: ["msme", "ssi", "udyam"], required: false },
];

/**
 * Core smart distribution function that matches files to checklist slots
 */
export function distributeFilesToSlots(
  loadedFiles: { file: File; dataUrl: string }[],
  slots: DocumentSlotConfig[],
  stateMap: Record<string, any>
): Record<string, DocumentFileEntry> {
  const updates: Record<string, DocumentFileEntry> = {};
  const usedCodes = new Set<string>();
  const unassigned: { file: File; dataUrl: string }[] = [];

  // Pass 1: Smart Keyword matching on currently empty slots
  for (const item of loadedFiles) {
    const lowerName = item.file.name.toLowerCase();
    
    // Check if filename has number prefix matching slot.num (e.g. "1_pan.jpg" or "doc1.pdf")
    const matchedSlotByNum = slots.find(s => 
      !usedCodes.has(s.code) && 
      !stateMap[s.code] &&
      s.num && 
      (lowerName.startsWith(s.num + "_") || lowerName.startsWith(s.num + "-") || lowerName.startsWith(s.num + " ") || lowerName.startsWith(s.num + ")") || lowerName.includes("(" + s.num + ")"))
    );

    // Or check keywords
    const matchedSlotByKeyword = matchedSlotByNum || slots.find(s => 
      !usedCodes.has(s.code) && 
      !stateMap[s.code] && 
      s.keywords.some(kw => lowerName.includes(kw))
    );

    if (matchedSlotByKeyword) {
      usedCodes.add(matchedSlotByKeyword.code);
      updates[matchedSlotByKeyword.code] = {
        name: item.file.name,
        type: item.file.type || (item.file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        size: `${(item.file.size / 1024).toFixed(1)} KB`,
        dataUrl: item.dataUrl,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    } else {
      unassigned.push(item);
    }
  }

  // Pass 2: Sequential assignment of unassigned files to remaining EMPTY slots
  for (const slot of slots) {
    if (!usedCodes.has(slot.code) && !stateMap[slot.code] && unassigned.length > 0) {
      const item = unassigned.shift()!;
      usedCodes.add(slot.code);
      updates[slot.code] = {
        name: item.file.name,
        type: item.file.type || (item.file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        size: `${(item.file.size / 1024).toFixed(1)} KB`,
        dataUrl: item.dataUrl,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }
  }

  // Pass 3: If still unassigned files remain, replace existing filled slots
  if (unassigned.length > 0) {
    for (const slot of slots) {
      if (!usedCodes.has(slot.code) && unassigned.length > 0) {
        const item = unassigned.shift()!;
        usedCodes.add(slot.code);
        updates[slot.code] = {
          name: item.file.name,
          type: item.file.type || (item.file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
          size: `${(item.file.size / 1024).toFixed(1)} KB`,
          dataUrl: item.dataUrl,
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      }
    }
  }

  return updates;
}

/**
 * Generate a clean sample SVG dataUrl for instant testing / demo
 */
function createSampleDocDataUrl(title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#f8fafc"/>
    <rect x="20" y="20" width="760" height="560" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="40" y="40" width="720" height="70" rx="12" fill="#1e293b"/>
    <text x="60" y="82" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">TAXPARTNER VERIFIED ATTACHMENT</text>
    <rect x="40" y="140" width="720" height="380" rx="12" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="400" cy="280" r="50" fill="#10b981"/>
    <path d="M380 280 l15 15 l30 -30" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <text x="400" y="370" fill="#0f172a" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${title}</text>
    <text x="400" y="405" fill="#64748b" font-family="sans-serif" font-size="14" text-anchor="middle">Official Color Scan Attached • AES-256 Cloud Vault Verified</text>
  </svg>`;
  return "data:image/svg+xml;base64," + (typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(svg))) : "");
}

/**
 * Robust Individual Document Slot Component
 */
export function DocumentSlotItem({
  label,
  code,
  stateMap,
  setStateMap,
  required = true,
  onToast,
  allSlots,
}: {
  label: string;
  code: string;
  stateMap: Record<string, any>;
  setStateMap: React.Dispatch<React.SetStateAction<any>>;
  required?: boolean;
  onToast?: (msg: string, type?: "success" | "error") => void;
  allSlots?: DocumentSlotConfig[];
}) {
  const [isReading, setIsReading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileEntry = stateMap[code];
  const isUploaded = !!fileEntry;
  const customFileName = typeof fileEntry === "object" && fileEntry?.name ? fileEntry.name : null;
  const customSize = typeof fileEntry === "object" && fileEntry?.size ? fileEntry.size : null;
  const customDataUrl = typeof fileEntry === "object" && fileEntry?.dataUrl ? fileEntry.dataUrl : typeof fileEntry === "string" && fileEntry.startsWith("data:") ? fileEntry : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // If operator selected multiple files in this slot's picker, distribute them across all slots!
    if (fileList.length > 1 && allSlots && allSlots.length > 0) {
      setIsReading(true);
      try {
        const files = Array.from(fileList);
        const readPromises = files.map(file => {
          return new Promise<{ file: File; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ file, dataUrl: (ev.target?.result as string) || "" });
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            reader.readAsDataURL(file);
          });
        });
        const loaded = await Promise.all(readPromises);
        const updates = distributeFilesToSlots(loaded, allSlots, stateMap);
        setStateMap((prev: any) => ({ ...prev, ...updates }));
        const count = Object.keys(updates).length;
        if (onToast) onToast(`✓ Multi-Upload: ${count} documents attached across slots!`, "success");
      } catch (err: any) {
        if (onToast) onToast(`Upload error: ${err.message}`, "error");
      } finally {
        setIsReading(false);
      }
      return;
    }

    // Single file upload for this exact slot
    const file = fileList[0];
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = (ev.target?.result as string) || "";
      setStateMap((prev: any) => ({
        ...prev,
        [code]: {
          name: file.name,
          type: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
          size: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl: dataUrl,
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      }));
      setIsReading(false);
      if (onToast) onToast(`✓ ${label} attached (${file.name})!`, "success");
    };
    reader.onerror = () => {
      setIsReading(false);
      if (onToast) onToast(`Failed to read file ${file.name}`, "error");
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleDownload = () => {
    if (customDataUrl) {
      const link = document.createElement("a");
      link.href = customDataUrl;
      link.download = customFileName || `${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
        isUploaded ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300"
      }`}>
        <div className="flex items-center space-x-2.5 overflow-hidden min-w-0 flex-1">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
            isReading ? "bg-amber-100 text-amber-700" : isUploaded ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            {isReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isUploaded ? <Check className="w-4 h-4" /> : <FileUp className="w-3.5 h-3.5" />}
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-bold truncate flex items-center space-x-1.5">
              <span>{label}</span>
              {required && <span className="text-rose-500 text-[10px]">*</span>}
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {isReading ? "⏳ Processing file..." : customFileName ? `✓ ${customFileName} (${customSize || ""})` : isUploaded ? "✓ Scanned Copy Attached" : "Color Scan (PDF/JPG/PNG)"}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {isUploaded && customDataUrl && (
            <>
              <button
                type="button"
                onClick={() => setPreviewModal(true)}
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                title="Preview Attached File"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                title="Download Attached File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isReading}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
              isReading ? "bg-amber-100 text-amber-700 pointer-events-none" :
              isUploaded ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            }`}
          >
            {isReading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Attaching...</span>
              </>
            ) : (
              <span>{isUploaded ? "Replace" : "Upload"}</span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            disabled={isReading}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {previewModal && customDataUrl && (
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-extrabold truncate">{customFileName || label}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModal(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto bg-slate-100 flex items-center justify-center min-h-[250px]">
              {customDataUrl.startsWith("data:image/") ? (
                <img src={customDataUrl} alt={customFileName || label} className="max-h-[60vh] max-w-full object-contain rounded-xl shadow border" />
              ) : (
                <iframe src={customDataUrl} className="w-full h-[60vh] rounded-xl border" title={customFileName || label} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Enterprise Bulk Upload Zone with Drag-and-Drop, Multi-Select, & Auto-Distribution
 */
export function BulkUploadZone({
  slots,
  stateMap,
  setStateMap,
  theme = "amber",
  onToast
}: {
  slots: DocumentSlotConfig[];
  stateMap: Record<string, any>;
  setStateMap: React.Dispatch<React.SetStateAction<any>>;
  theme?: "amber" | "emerald" | "blue";
  onToast?: (msg: string, type?: "success" | "error") => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSlots = slots.length;
  const uploadedCount = slots.filter(s => !!stateMap[s.code]).length;
  const isComplete = uploadedCount >= totalSlots;

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const fileDataPromises = files.map(file => {
        return new Promise<{ file: File; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ file, dataUrl: (e.target?.result as string) || "" });
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const loadedFiles = await Promise.all(fileDataPromises);
      const updates = distributeFilesToSlots(loadedFiles, slots, stateMap);

      setStateMap((prev: any) => ({ ...prev, ...updates }));
      const newCount = Object.keys(updates).length;
      if (onToast) {
        onToast(`✓ Bulk Upload: ${newCount} file${newCount > 1 ? "s" : ""} uploaded and assigned to slots!`, "success");
      }
    } catch (err: any) {
      if (onToast) onToast(`Bulk upload error: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoneClick = (e: React.MouseEvent) => {
    // Avoid triggering if clicked on inner buttons (like Clear or Auto-Fill)
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStateMap((prev: any) => {
      const next = { ...prev };
      slots.forEach(s => delete next[s.code]);
      return next;
    });
    if (onToast) onToast("All attached documents cleared.");
  };

  const handleQuickFillSampleDocs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const demoUpdates: Record<string, DocumentFileEntry> = {};
    slots.forEach(slot => {
      if (!stateMap[slot.code]) {
        const cleanName = `${slot.code}.png`;
        demoUpdates[slot.code] = {
          name: cleanName,
          type: "image/png",
          size: "68.4 KB",
          dataUrl: createSampleDocDataUrl(slot.label),
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      }
    });
    setStateMap((prev: any) => ({ ...prev, ...demoUpdates }));
    const count = Object.keys(demoUpdates).length;
    if (onToast) onToast(`✓ Attached ${count} sample color scans to remaining slots!`, "success");
  };

  const isAmber = theme === "amber";
  const isBlue = theme === "blue";

  return (
    <div
      onClick={handleZoneClick}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
      className={`p-4 sm:p-5 rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none group ${
        isDragging
          ? isAmber ? "border-amber-500 bg-amber-100/90 scale-[1.01]" : isBlue ? "border-blue-500 bg-blue-100/90 scale-[1.01]" : "border-emerald-500 bg-emerald-100/90 scale-[1.01]"
          : isComplete
          ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-400"
          : isAmber 
          ? "border-amber-300/90 bg-gradient-to-r from-amber-50/80 to-orange-50/50 hover:border-amber-500 hover:bg-amber-50" 
          : isBlue
          ? "border-blue-300/90 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 hover:border-blue-500 hover:bg-blue-50"
          : "border-emerald-300/90 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 hover:border-emerald-500 hover:bg-emerald-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
            isProcessing ? "bg-amber-100 text-amber-700" :
            isComplete ? "bg-emerald-600 text-white" :
            isAmber ? "bg-amber-600 text-white" : isBlue ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
          }`}>
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                ⚡ Bulk Upload All Color Documents
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                isComplete 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isAmber ? "bg-amber-100 text-amber-900 border-amber-200" : isBlue ? "bg-blue-100 text-blue-900 border-blue-200" : "bg-emerald-100 text-emerald-900 border-emerald-200"
              }`}>
                {uploadedCount} / {totalSlots} Attached
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              {isProcessing
                ? "Reading and mapping files concurrently..."
                : isComplete
                ? "✓ All mandatory color copies attached and ready for submission!"
                : "Click anywhere or drag & drop files here. Automatically distributes customer files across all slots!"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isComplete && (
            <button
              type="button"
              onClick={handleQuickFillSampleDocs}
              disabled={isProcessing}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Auto-fill demo copies for remaining empty slots"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-Fill All Slots</span>
            </button>
          )}

          {uploadedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isProcessing}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer shadow-xs active:scale-95"
              title="Clear all attached documents"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }
            }}
            disabled={isProcessing}
            className={`px-4 py-2 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
              isAmber 
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                : isBlue
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Files...</span>
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                <span>Bulk Select Files</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            disabled={isProcessing}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
