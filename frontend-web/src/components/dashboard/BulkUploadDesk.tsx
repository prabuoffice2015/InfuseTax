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
  FolderArchive
} from "lucide-react";

export interface DocumentSlotConfig {
  code: string;
  label: string;
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
  { code: "sp_pan_doc", label: "1) PAN Card (Color Copy)", keywords: ["pan", "proprietor_pan"] },
  { code: "sp_aadhaar_doc", label: "2) Aadhaar Card (Color Copy)", keywords: ["aadhaar", "aadhar", "uid", "adhaar"] },
  { code: "sp_photo", label: "3) Photo Scanned", keywords: ["photo", "pic", "passport", "image"] },
  { code: "sp_signature", label: "4) Signature Scanned", keywords: ["sign", "signature", "signat"] },
  { code: "sp_rent_deed", label: "7) Rent Deed / Own Property Deed", keywords: ["rent", "deed", "lease", "rental", "agreement"] },
  { code: "sp_eb_receipt", label: "8) EB Receipt of Own or Lease", keywords: ["eb", "electric", "power", "tneb", "bescom", "bill"] },
  { code: "sp_tax_receipt", label: "9) Property Tax Receipt", keywords: ["tax", "property", "corporation", "kist"] },
  { code: "sp_name_board", label: "10) Front Office Name Board (2/2 Cut Out)", keywords: ["board", "name", "office", "signboard", "cutout"] },
  { code: "sp_geo_photo", label: "11) Premises Geo Photo with Owner & Board", keywords: ["geo", "premise", "shop", "location", "gps"] },
];

export const PVT_LTD_SLOTS: DocumentSlotConfig[] = [
  { code: "pvt_coi", label: "1) Incorporation Certificate (COI)", keywords: ["coi", "incorporation", "certificate", "cin"] },
  { code: "pvt_dir_pan", label: "2) PAN Card for Both Directors", keywords: ["director_pan", "dir_pan", "pan"] },
  { code: "pvt_dir_aadhaar", label: "3) Aadhaar for Both Directors", keywords: ["director_aadhaar", "dir_aadhaar", "aadhaar", "aadhar", "uid"] },
  { code: "pvt_dir_photo", label: "4) Photo Scanned for Both Directors", keywords: ["director_photo", "dir_photo", "photo", "pic"] },
  { code: "pvt_dir_sig", label: "5) Signature of Both Directors", keywords: ["director_sig", "dir_sig", "sign", "signature"] },
  { code: "pvt_rent_deed", label: "8) Rental Deed / Property Deed", keywords: ["rent", "deed", "lease", "rental", "agreement"] },
  { code: "pvt_eb_receipt", label: "9) EB Receipt of Own or Lease", keywords: ["eb", "electric", "power", "tneb", "bill"] },
  { code: "pvt_tax_receipt", label: "10) Property Tax Receipt", keywords: ["tax", "property", "corporation"] },
  { code: "pvt_geo_photo", label: "11) Premises Geo Photo with Owner & Board", keywords: ["geo", "premise", "shop", "office", "gps"] },
  { code: "pvt_msme", label: "12) MSME Registration (Udyam)", keywords: ["msme", "udyam", "ssi"] },
  { code: "pvt_bank_proof", label: "13) Bank Passbook / Cheque (Company)", keywords: ["bank", "cheque", "passbook", "statement"] },
  { code: "pvt_name_board", label: "14) Front Office Name Board (2/2 Cut Out)", keywords: ["board", "name", "signboard", "office"] },
];

export const PARTNERSHIP_SLOTS: DocumentSlotConfig[] = [
  { code: "firm_deed", label: "1) Partnership Deed / LLP Agreement", keywords: ["deed", "agreement", "llp", "partnership"] },
  { code: "firm_reg_cert", label: "2) Partnership Registration Certificate", keywords: ["reg_cert", "registration", "certificate"] },
  { code: "firm_pan_doc", label: "3) Firm PAN Card Copy", keywords: ["firm_pan", "pan"] },
  { code: "firm_partner_pan", label: "4) PAN Card for Both Partners", keywords: ["partner_pan", "pan"] },
  { code: "firm_partner_aadhaar", label: "5) Aadhaar for Both Partners", keywords: ["partner_aadhaar", "aadhaar", "aadhar", "uid"] },
  { code: "firm_partner_photo", label: "6) Photo Scanned for Both Partners", keywords: ["partner_photo", "photo", "pic"] },
  { code: "firm_partner_sig", label: "7) Signature of Both Partners", keywords: ["partner_sig", "sign", "signature"] },
  { code: "firm_rent_deed", label: "10) Rental Deed / Property Deed", keywords: ["rent", "deed", "lease", "rental"] },
  { code: "firm_eb_receipt", label: "11) EB Receipt of Own or Lease", keywords: ["eb", "electric", "power", "tneb", "bill"] },
  { code: "firm_tax_receipt", label: "12) Property Tax Receipt", keywords: ["tax", "property", "corporation"] },
  { code: "firm_geo_photo", label: "13) Premises Geo Photo with Owner & Board", keywords: ["geo", "premise", "shop", "office"] },
  { code: "firm_msme", label: "14) MSME Registration (Udyam)", keywords: ["msme", "udyam", "ssi"] },
  { code: "firm_bank_proof", label: "15) Bank Passbook / Cheque (Firm Account)", keywords: ["bank", "cheque", "passbook", "statement"] },
];

export const ITR_SLOTS: DocumentSlotConfig[] = [
  { code: "it_pan_doc", label: "3) PAN Card Scanned Copy", keywords: ["pan"] },
  { code: "it_aadhaar_doc", label: "4) Aadhaar Card Scanned Copy", keywords: ["aadhaar", "aadhar", "uid"] },
  { code: "it_sb_bank", label: "9a) SB Account Statement (01 Apr - 31 Mar)", keywords: ["sb", "savings", "statement", "bank", "passbook"] },
  { code: "it_ca_bank", label: "9b) Current Account Statement (01 Apr - 31 Mar)", keywords: ["ca", "current", "business_bank", "statement"] },
  { code: "it_msme_doc", label: "6) MSME / SSI Certificate", keywords: ["msme", "ssi", "udyam"], required: false },
];

/**
 * Robust Individual Document Slot Component
 */
export function DocumentSlotItem({
  label,
  code,
  stateMap,
  setStateMap,
  required = true,
  onToast
}: {
  label: string;
  code: string;
  stateMap: Record<string, any>;
  setStateMap: React.Dispatch<React.SetStateAction<any>>;
  required?: boolean;
  onToast?: (msg: string, type?: "success" | "error") => void;
}) {
  const [isReading, setIsReading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileEntry = stateMap[code];
  const isUploaded = !!fileEntry;
  const customFileName = typeof fileEntry === "object" && fileEntry?.name ? fileEntry.name : null;
  const customSize = typeof fileEntry === "object" && fileEntry?.size ? fileEntry.size : null;
  const customDataUrl = typeof fileEntry === "object" && fileEntry?.dataUrl ? fileEntry.dataUrl : typeof fileEntry === "string" && fileEntry.startsWith("data:") ? fileEntry : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
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
    }
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
 * Enterprise Bulk Upload Zone with Drag-and-Drop, Multi-Select, & Smart Auto-Mapping
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
      const updates: Record<string, DocumentFileEntry> = {};
      const unassigned: { file: File; dataUrl: string }[] = [];
      const usedCodes = new Set<string>();

      // Pass 1: Smart Keyword matching
      for (const item of loadedFiles) {
        const lowerName = item.file.name.toLowerCase();
        const matchedSlot = slots.find(s => !usedCodes.has(s.code) && s.keywords.some(kw => lowerName.includes(kw)));
        if (matchedSlot) {
          usedCodes.add(matchedSlot.code);
          updates[matchedSlot.code] = {
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

      // Pass 2: Sequential assignment to remaining empty slots
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

      // Pass 3: If still unassigned files exist (e.g. replacing existing slots sequentially)
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleClearAll = () => {
    setStateMap((prev: any) => {
      const next = { ...prev };
      slots.forEach(s => delete next[s.code]);
      return next;
    });
    if (onToast) onToast("All attached documents cleared.");
  };

  const isAmber = theme === "amber";
  const isBlue = theme === "blue";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`p-4 sm:p-5 rounded-3xl border-2 border-dashed transition-all ${
        isDragging
          ? isAmber ? "border-amber-500 bg-amber-50 scale-[1.01]" : isBlue ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-emerald-500 bg-emerald-50 scale-[1.01]"
          : isComplete
          ? "border-emerald-300 bg-emerald-50/50"
          : isAmber 
          ? "border-amber-300/90 bg-gradient-to-r from-amber-50/80 to-orange-50/50 hover:border-amber-400" 
          : isBlue
          ? "border-blue-300/90 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 hover:border-blue-400"
          : "border-emerald-300/90 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 hover:border-emerald-400"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isProcessing ? "bg-amber-100 text-amber-700" :
            isComplete ? "bg-emerald-600 text-white" :
            isAmber ? "bg-amber-600 text-white" : isBlue ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
          }`}>
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                ⚡ Bulk Upload All Color Documents
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                isComplete 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isAmber ? "bg-amber-100 text-amber-900 border-amber-200" : isBlue ? "bg-blue-100 text-blue-900 border-blue-200" : "bg-emerald-100 text-emerald-900 border-emerald-200"
              }`}>
                {uploadedCount} / {totalSlots} Attached
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {isProcessing
                ? "Reading and parsing files concurrently..."
                : isComplete
                ? "All mandatory color copies successfully attached and ready for submission!"
                : "Drag & drop all customer scans here, or multi-select files. Auto-maps PAN, Aadhaar, Photo, Deeds & Receipts!"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {uploadedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isProcessing}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
              title="Clear all attached documents"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
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
