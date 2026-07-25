import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  ScanLine, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  FileText, 
  ShoppingBag, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { BillOCRResult, InventoryItem, Transaction } from '../types';
import { scanBillAPI } from '../services/aiService';

interface BillScannerViewProps {
  onImportBillStock: (
    billItems: {
      item_name: string;
      quantity: number;
      unit: any;
      cost_price: number;
      selling_price: number;
      total_amount: number;
      category?: string;
    }[],
    vendorName: string
  ) => void;
}

export const BillScannerView: React.FC<BillScannerViewProps> = ({ onImportBillStock }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<BillOCRResult | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Editable bill line items
  const [editableItems, setEditableItems] = useState<any[]>([]);

  // Start Camera Capture
  const startCamera = async () => {
    try {
      setUseCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access failed or permission denied. You can upload an image file instead.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
        processBillImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        processBillImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleBill = () => {
    // Generate sample purchase invoice canvas image preview
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 800);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('METRO CASH & CARRY WHOLESALE', 50, 60);
      ctx.font = '14px sans-serif';
      ctx.fillText('Tax Invoice #INV-2026-904 | Date: 2026-07-25', 50, 90);
      ctx.fillRect(50, 110, 500, 2);
      
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Item Description           Qty   Cost(₹)  Total(₹)', 50, 150);
      ctx.font = '14px monospace';
      ctx.fillText('1. Aashirvaad Atta 5kg     10    210      2100', 50, 190);
      ctx.fillText('2. Thumbs Up 600ml Bottle  24    30       720', 50, 220);
      ctx.fillText('3. Surf Excel 1kg Powder   12    115      1380', 50, 250);
      
      ctx.fillRect(50, 280, 500, 2);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('GRAND TOTAL: ₹4,200', 320, 320);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      processBillImage(dataUrl);
    }
  };

  const processBillImage = async (base64Img: string) => {
    setIsScanning(true);
    setOcrResult(null);

    try {
      const result = await scanBillAPI(base64Img);
      setOcrResult(result);
      setEditableItems(result.items || []);
    } catch (err) {
      console.error('Bill OCR scanning error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    // Recalculate total
    if (field === 'quantity' || field === 'cost_price') {
      const q = Number(updated[index].quantity) || 1;
      const cp = Number(updated[index].cost_price) || 0;
      updated[index].total_amount = q * cp;
    }
    setEditableItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleConfirmImport = () => {
    if (editableItems.length === 0) return;
    onImportBillStock(editableItems, ocrResult?.vendor_name || 'Wholesale Supplier');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50/60 to-emerald-50 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-teal-700" />
            <h1 className="text-2xl font-black text-slate-900">AI Purchase Bill Scanner</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Photograph wholesale purchase bills. Gemini Flash Vision extracts stock lines & updates inventory instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleBill}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-teal-800 text-xs font-semibold border border-slate-300 shadow-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Load Sample Invoice</span>
          </button>
        </div>
      </div>

      {/* Input Methods Grid: Camera Capture & File Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Camera Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px]">
          {useCamera ? (
            <div className="w-full space-y-3">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 rounded-xl bg-black object-cover border border-slate-300 shadow-inner" />
              <div className="flex gap-2">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition"
                >
                  📸 Take Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Live Camera Capture</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Use smartphone or laptop camera to photograph paper bills.
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-white text-xs shadow-sm transition inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Start Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload File Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px]">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Upload Bill Photo / Image</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Upload JPG, PNG, or PDF screenshot of receipt.
            </p>
            <label className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm cursor-pointer transition inline-flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-white" />
              <span>Select File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

      </div>

      {/* Image Preview & Scanning Status */}
      {imagePreview && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="w-48 h-56 rounded-xl border border-slate-300 overflow-hidden bg-slate-50 flex-shrink-0">
            <img src={imagePreview} alt="Bill Preview" className="w-full h-full object-contain" />
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            {isScanning ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-teal-700 font-bold text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Gemini 1.5 Flash Vision Reading Bill OCR...</span>
                </div>
                <p className="text-xs text-slate-500">
                  Extracting line items, vendor details, quantities, and cost prices...
                </p>
              </div>
            ) : ocrResult ? (
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✅ OCR Scan Complete
                </span>
                <h3 className="text-lg font-bold text-slate-900">{ocrResult.vendor_name}</h3>
                <p className="text-xs text-slate-600">
                  Bill No: <span className="text-slate-900 font-mono font-bold">{ocrResult.bill_number}</span> • Date: <span className="text-slate-900 font-medium">{ocrResult.bill_date}</span>
                </p>
                <p className="text-xs text-emerald-700 font-bold">
                  Grand Total extracted: ₹{ocrResult.grand_total?.toLocaleString('en-IN')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Interactive Editable Line-Item Preview Table */}
      {editableItems.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Review Extracted Bill Items ({editableItems.length})
              </h3>
              <p className="text-xs text-slate-500">Review or adjust prices before saving to inventory stock.</p>
            </div>

            <button
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-sm transition flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Confirm & Import All Stock</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Item Name</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">Unit</th>
                  <th className="p-3 text-right">Cost Price (CP ₹)</th>
                  <th className="p-3 text-right">Selling Price (SP ₹)</th>
                  <th className="p-3 text-right">Total (₹)</th>
                  <th className="p-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {editableItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleUpdateItem(idx, 'item_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:border-emerald-500"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-16 text-center px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-emerald-500"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                        {item.unit || 'packet'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={item.cost_price}
                        onChange={(e) => handleUpdateItem(idx, 'cost_price', Number(e.target.value))}
                        className="w-20 text-right px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-emerald-500"
                      />
                    </td>

                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={item.selling_price || Math.round(item.cost_price * 1.2)}
                        onChange={(e) => handleUpdateItem(idx, 'selling_price', Number(e.target.value))}
                        className="w-20 text-right px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-emerald-700 font-bold focus:border-emerald-500"
                      />
                    </td>

                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      ₹{item.total_amount?.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
