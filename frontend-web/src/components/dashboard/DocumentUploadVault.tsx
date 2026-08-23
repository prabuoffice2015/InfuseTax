"use client";

import React, { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  X, 
  Eye, 
  Download, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  FileCheck,
  AlertCircle
} from "lucide-react";

export interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  size: string;
  type: "pdf" | "image";
  uploadedAt: string;
  r2Url: string;
  encrypted: boolean;
}

interface DocumentUploadVaultProps {
  category?: string;
  onUploadSuccess?: (doc: UploadedDocument) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
}

export default function DocumentUploadVault({
  category = "Tax & Compliance Proofs",
  onUploadSuccess,
  allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"],
  maxSizeMb = 10,
}: DocumentUploadVaultProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: "DOC-9081",
      name: "Electricity_Bill_July2026.pdf",
      category: "Principal Place of Business Proof",
      size: "1.4 MB",
      type: "pdf",
      uploadedAt: "23 Aug 2026, 14:15",
      r2Url: "https://r2.infusetax.com/vault/encrypted_ebill_9081.pdf",
      encrypted: true,
    },
    {
      id: "DOC-9082",
      name: "Form16_PartA_PartB.pdf",
      category: "Form 16 Salary Certificate",
      size: "2.8 MB",
      type: "pdf",
      uploadedAt: "23 Aug 2026, 15:30",
      r2Url: "https://r2.infusetax.com/vault/encrypted_form16_9082.pdf",
      encrypted: true,
    },
    {
      id: "DOC-9083",
      name: "Promoter_Aadhaar_Front_Back.jpg",
      category: "Promoter Identity & KYC Proof",
      size: "890 KB",
      type: "image",
      uploadedAt: "23 Aug 2026, 16:05",
      r2Url: "https://r2.infusetax.com/vault/encrypted_aadhaar_9083.jpg",
      encrypted: true,
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  const handleSimulatedUpload = (fileName: string, cat: string) => {
    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      const isPdf = fileName.toLowerCase().endsWith(".pdf");
      const newDoc: UploadedDocument = {
        id: `DOC-${Math.floor(9084 + Math.random() * 1000)}`,
        name: fileName,
        category: cat || category,
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        type: isPdf ? "pdf" : "image",
        uploadedAt: "Just now",
        r2Url: `https://r2.infusetax.com/vault/encrypted_${fileName}`,
        encrypted: true,
      };

      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
      setUploadSuccess(true);
      if (onUploadSuccess) onUploadSuccess(newDoc);

      setTimeout(() => setUploadSuccess(false), 2500);
    }, 1200);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{previewDoc.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AES-256 Cloudflare R2 Vault Secured</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 space-y-4">
              <div className="h-64 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center space-y-2">
                {previewDoc.type === "pdf" ? (
                  <>
                    <FileText className="w-16 h-16 text-rose-500" />
                    <div className="text-xs font-bold text-slate-800">PDF Document Stream Ready</div>
                    <div className="text-[11px] text-slate-500 font-mono">{previewDoc.r2Url}</div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-16 h-16 text-blue-500" />
                    <div className="text-xs font-bold text-slate-800">High-Resolution Image Document</div>
                    <div className="text-[11px] text-slate-500 font-mono">{previewDoc.r2Url}</div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
                <span>File Size: <strong>{previewDoc.size}</strong></span>
                <span>Uploaded: <strong>{previewDoc.uploadedAt}</strong></span>
                <span>Category: <strong>{previewDoc.category}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => alert(`Downloading ${previewDoc.name} from Cloudflare R2...`)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure Copy</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare R2 Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            handleSimulatedUpload(e.dataTransfer.files[0].name, category);
          }
        }}
        className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-3 transition-all ${
          isDragging
            ? "border-blue-600 bg-blue-50/50 scale-[1.01]"
            : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"
        }`}
      >
        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {isUploading ? "Encrypting & Storing to Cloudflare R2..." : "Drag & Drop Tax Documents Here"}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports PDF, JPG, PNG up to {maxSizeMb}MB (Auto-compressed with AES-256 zero-knowledge encryption)
          </p>
        </div>

        {uploadSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl inline-flex items-center space-x-1.5">
            <Check className="w-4 h-4" />
            <span>Document Uploaded & Encrypted Successfully!</span>
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleSimulatedUpload("Electricity_Bill_Latest.pdf", "Electricity Bill / NOC Proof")}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm"
          >
            + Upload Electricity Bill
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedUpload("Form16_IncomeTax_2026.pdf", "Form 16 Salary Certificate")}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm"
          >
            + Upload Form 16 PDF
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedUpload("Rent_Agreement_Signed.pdf", "Registered Rent Agreement")}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm"
          >
            + Upload Rent Agreement
          </button>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Encrypted Cloudflare R2 Document Vault</h4>
              <p className="text-[11px] text-slate-500">Zero-egress cloud storage compliant with GSTN & ITD data sovereignty</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {documents.length} Files
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs font-medium">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${doc.type === "pdf" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
                  {doc.type === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{doc.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                    <span>{doc.category}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Encrypted (R2)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-bold text-xs flex items-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
