'use client';

import React, { useState } from 'react';
import { InventoryItem, Category } from '@/app/types';
import { ScanLine, Upload, Sparkles, CheckCircle2, Loader2, Barcode, FileText, Plus } from 'lucide-react';

interface ScannerViewProps {
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setActiveTab: (tab: string) => void;
}

export default function ScannerView({ setItems, setActiveTab }: ScannerViewProps) {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sampleReceipts = [
    {
      title: "Supermarket Fresh Receipt",
      desc: "Whole Milk, Avocados, Organic Eggs, Sourdough Bread, Cheddar Cheese",
      image: "https://picsum.photos/seed/receipt1/600/400",
      query: "Extract items from this supermarket receipt: 2 Gallon Organic Milk ($4.99), 1 Pack Avocados ($3.49), 1 Dozen Free Range Eggs ($5.20), 1 Loaf Sourdough Bread ($4.50), 1 Block Aged Cheddar ($6.80)."
    },
    {
      title: "Pantry & Spices Barcode Scan",
      desc: "Extra Virgin Olive Oil, Jasmine Rice, Black Pepper, Himalayan Salt",
      image: "https://picsum.photos/seed/barcode2/600/400",
      query: "Extract items from these barcode scans: 1 Bottle Extra Virgin Olive Oil 750ml ($12.99), 5kg Bag Jasmine Rice ($14.50), 200g Black Pepper Grinder ($4.25), 1kg Pink Himalayan Salt ($3.10)."
    },
    {
      title: "Fresh Produce & Meat Restock",
      desc: "Grass-fed Ribeye Steak, Atlantic Salmon Fillets, Fresh Spinach, Roma Tomatoes",
      image: "https://picsum.photos/seed/receipt3/600/400",
      query: "Extract items from grocery restock: 2 lbs Grass-fed Ribeye Steak ($18.99), 1 lb Atlantic Salmon ($14.50), 2 Bags Baby Spinach ($5.00), 3 lbs Roma Tomatoes ($4.20)."
    }
  ];

  const handleScanSample = async (sample: typeof sampleReceipts[0]) => {
    setLoading(true);
    setError(null);
    setSelectedImage(sample.image);

    try {
      // Fetch sample image as base64 or send text query
      const res = await fetch(sample.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const apiRes = await fetch('/api/gemini/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data, textQuery: sample.query })
        });
        const data = await apiRes.json();
        if (data.error) throw new Error(data.error);
        setScanResult(data.items);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setError(err.message || "Scanning failed");
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Full = reader.result as string;
      setSelectedImage(base64Full);
      const base64data = base64Full.split(',')[1];

      setLoading(true);
      setError(null);
      try {
        const apiRes = await fetch('/api/gemini/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data, mimeType: file.type })
        });
        const data = await apiRes.json();
        if (data.error) throw new Error(data.error);
        setScanResult(data.items);
      } catch (err: any) {
        setError(err.message || "Failed to scan uploaded image");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addAllToInventory = () => {
    if (!scanResult) return;
    const newItems: InventoryItem[] = scanResult.map((item, idx) => ({
      id: 'scanned-' + Date.now() + '-' + idx,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'pcs',
      category: (item.category as Category) || 'Pantry',
      expiryDate: new Date(Date.now() + (item.expiryDays || 7) * 86400000).toISOString().split('T')[0],
      minThreshold: 1,
      price: item.price || 3.99,
      storeName: 'Scanned Supermarket'
    }));

    setItems(prev => [...newItems, ...prev]);
    setActiveTab('inventory');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Receipt & Barcode Scanner</h1>
            <p className="text-teal-100 text-sm">
              Instantly automate fridge stocking by scanning supermarket receipts or barcode tags using Gemini Vision OCR.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Sample Selectors */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Upload Receipt / Barcode</span>
            </h2>
            <p className="text-xs text-slate-500">
              Upload a photo of your paper receipt, store invoice, or barcode label.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-all group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mb-2" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-800">Click to upload image</span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Try Sample Supermarket Scans</span>
            </h2>
            <div className="space-y-3">
              {sampleReceipts.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleScanSample(sample)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-start space-x-3 group"
                >
                  <img src={sample.image} alt={sample.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700">{sample.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{sample.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Preview & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs min-h-[450px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Extracted Rations & Inventory Items</span>
                </h2>
                {scanResult && scanResult.length > 0 && (
                  <button
                    onClick={addAllToInventory}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Stock All to Fridge ({scanResult.length})</span>
                  </button>
                )}
              </div>

              {selectedImage && (
                <div className="mb-4 flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <img src={selectedImage} alt="Scanned Receipt" className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Source Image Loaded</span>
                    <p className="text-sm font-medium text-slate-800">Gemini Vision OCR successfully parsed all items.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Gemini OCR is analyzing items, expiration dates & prices...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {!loading && !scanResult && !error && (
                <div className="py-24 text-center space-y-3">
                  <Barcode className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-sm font-medium">Select a sample scan or upload an image to extract items.</p>
                </div>
              )}

              {!loading && scanResult && (
                <div className="space-y-3">
                  {scanResult.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {item.quantity} {item.unit}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Category: {item.category} • Shelf Life: {item.expiryDays} days
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">${(item.price || 3.99).toFixed(2)}</div>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Parsed</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {scanResult && scanResult.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={addAllToInventory}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Confirm & Add to Fridge Inventory</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
