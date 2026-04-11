"use client";

import { useMemo, useState, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";

const parsePrice = (price: any) => { 
  if (!price) return 0; 
  return parseFloat(String(price).replace(",", ".")); 
};

export function ProductInfoSettings() {
  const { 
    formas, activeFormaId, updateSlotProduct, setSlotProduct,
    masterProductPool, setMasterProductPool, productPool, setProductPool 
  } = useCatalogStore();
  const { selectedSlotIds } = useUIStore();
  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Onay penceresi için state
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedSlot, selectedPageNumber, selectedGlobalNumber } = useMemo(() => {
    if (selectedSlotIds.length !== 1) {
      return { selectedSlot: null, selectedPageNumber: null, selectedGlobalNumber: null };
    }
    const selectedId = selectedSlotIds[0];
    
    let foundSlot = null;
    let foundPageNum = null;

    for (const f of formas) {
      for (const p of f.pages) {
        const s = p.slots.find(slot => slot.id === selectedId);
        if (s) {
          foundSlot = s;
          foundPageNum = p.pageNumber;
          break;
        }
      }
      if (foundSlot) break;
    }
    
    return {
      selectedSlot: foundSlot,
      selectedPageNumber: foundPageNum,
      selectedGlobalNumber: foundSlot?.globalNumber || null,
    };
  }, [selectedSlotIds, formas]);

  let profit = 0;
  let hasCost = false;
  let isLoss = false;

  if (selectedSlot?.product) {
    const sale = parsePrice(selectedSlot.product.price);
    const cost = parsePrice(selectedSlot.product.raw?.EK);
    if (cost > 0) {
      hasCost = true;
      profit = ((sale - cost) / cost) * 100;
      isLoss = profit < 0;
    }
  }

  const maxPos = useMemo(() => {
    let currentMax = 0;
    masterProductPool.forEach(p => {
      if (p.raw) {
         const keys = Object.keys(p.raw);
         const posKey = keys.find(k => k.trim().toUpperCase() === "POS");
         if (posKey && p.raw[posKey]) {
            const match = String(p.raw[posKey]).match(/\d+/);
            if (match) {
               const val = parseInt(match[0], 10);
               if (val > currentMax) currentMax = val;
            }
         }
      }
    });
    return currentMax;
  }, [masterProductPool]);

  const nextPos = maxPos + 1;

  const handleProductUpdate = (updates: Partial<any>, rawUpdates?: Partial<any>) => {
    if (!selectedSlot || selectedPageNumber === null) return;
    
    if (selectedSlot.product) {
      const mergedRaw = rawUpdates ? { ...selectedSlot.product.raw, ...rawUpdates } : selectedSlot.product.raw;
      updateSlotProduct(selectedPageNumber, selectedSlot.id, { ...updates, raw: mergedRaw });
    } else {
      const newProduct = {
        id: `custom-${Date.now()}`,
        name: "", price: "0", sku: "", category: "", image: "",
        raw: rawUpdates || {}, ...updates
      };
      setSlotProduct(selectedPageNumber, selectedSlot.id, newProduct);
    }
  };

  // İLK AŞAMA: Tıklanınca onay mekanizmasını kontrol et
  const handleSaveClick = () => {
    if (!selectedSlot || !selectedSlot.product || !selectedSlot.product.name) {
      alert("Lütfen önce bir ürün adı girin!");
      return;
    }

    const currentSku = selectedSlot.product.sku || `YENİ-${nextPos}`;
    const existingIndex = masterProductPool.findIndex(item => item.sku === currentSku);

    // Eğer bir resim seçildiyse VE bu ürün halihazırda varsa onay ekranını göster
    if (selectedFile && existingIndex >= 0) {
      setShowConfirm(true);
    } else {
      // Zaten yeni bir ürünse veya resim seçilmemişse direkt kaydet
      executeSave();
    }
  };

  // İKİNCİ AŞAMA: Asıl kaydetme işlemi (Onaylandıktan sonra veya onaya gerek yoksa çalışır)
  const executeSave = async () => {
    setShowConfirm(false); // Onay kutusunu kapat

    if (!selectedSlot || !selectedSlot.product) {
      // This case should ideally not be reached because of the guards in handleSaveClick,
      // but it satisfies TypeScript's null-check.
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    
    const p = selectedSlot.product;
    const currentSku = p.sku || `YENİ-${nextPos}`;
    let finalImageUrl = p.image;

    if (selectedFile) {
      const filename = `${currentSku}.png`; 
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("filename", filename);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            finalImageUrl = `${data.path}?t=${Date.now()}`; 
          } else {
            alert("Sunucu hatası: " + data.error);
          }
        }
      } catch (err: any) {
        alert("Bağlantı hatası: " + err.message);
      }
    }

    const existingIndex = masterProductPool.findIndex(item => item.sku === currentSku);
    const updatedProduct = {
      ...p,
      sku: currentSku,
      image: finalImageUrl,
      raw: {
        ...(p.raw || {}),
        ARTNR: currentSku,
        RESIM: finalImageUrl
      }
    };

    if (existingIndex >= 0) {
      const existingProduct = masterProductPool[existingIndex];
      const mergedProduct = {
        ...existingProduct,
        ...updatedProduct,
        raw: { ...existingProduct.raw, ...updatedProduct.raw }
      };

      const newMaster = [...masterProductPool];
      newMaster[existingIndex] = mergedProduct;
      setMasterProductPool(newMaster);

      const poolIndex = productPool.findIndex(item => item.sku === currentSku);
      if(poolIndex >= 0) {
        const newPool = [...productPool];
        newPool[poolIndex] = mergedProduct;
        setProductPool(newPool);
      }
      updateSlotProduct(selectedPageNumber!, selectedSlot.id, mergedProduct);

    } else {
      updatedProduct.id = `custom-pool-${Date.now()}`;
      updatedProduct.raw.POS = nextPos;

      setMasterProductPool([...masterProductPool, updatedProduct]);
      setProductPool([...productPool, updatedProduct]);
      updateSlotProduct(selectedPageNumber!, selectedSlot.id, updatedProduct);
    }

    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setIsSaving(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {selectedSlotIds.length !== 1 ? (
        <div className="text-[10px] text-center text-slate-500 font-bold p-4 bg-white rounded border border-slate-200 shadow-sm">
          Lütfen tablodan sadece BİR adet hücre seçin.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm mb-3">
            <span className="text-[10px] font-black text-slate-600">Seçili Hücre: #{selectedGlobalNumber}</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500">Ürün Adı (Bezeichnung)</span>
              <textarea 
                rows={2}
                value={selectedSlot?.product?.name || ""} 
                onChange={(e) => handleProductUpdate({ name: e.target.value }, { BEZEICHNUNG: e.target.value })} 
                className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Satış Fiyatı (VK Netto)</span>
                  <input 
                    type="text" 
                    value={selectedSlot?.product?.price || ""} 
                    onChange={(e) => handleProductUpdate({ price: e.target.value }, { VK_NETTO: e.target.value })} 
                    className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Alış Fiyatı (EK)</span>
                  <input 
                    type="text" 
                    value={selectedSlot?.product?.raw?.EK || ""} 
                    onChange={(e) => handleProductUpdate({}, { EK: e.target.value })} 
                    className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
                  />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Ürün Kodu (Artnr)</span>
                  <input 
                    type="text" 
                    value={selectedSlot?.product?.sku || ""} 
                    onChange={(e) => handleProductUpdate({ sku: e.target.value }, { ARTNR: e.target.value })} 
                    className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Kâr Oranı (Kar %)</span>
                  <div className={`w-full text-[10px] font-bold border rounded p-1.5 flex items-center justify-center h-8.5 ${hasCost ? (isLoss ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600") : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    {hasCost ? `%${profit.toFixed(1)}` : "Maliyet Yok"}
                  </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Kategori (Artgrp)</span>
                  <input 
                    type="text" 
                    value={selectedSlot?.product?.category || ""} 
                    onChange={(e) => handleProductUpdate({ category: e.target.value }, { ARTGRP: e.target.value })} 
                    className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500">Sıra (Pos)</span>
                  <div className="w-full h-8.5 flex items-center justify-center text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded p-1.5 cursor-not-allowed">
                    {masterProductPool.some(p => p.sku === selectedSlot?.product?.sku) ? selectedSlot?.product?.raw?.POS : `${nextPos} (Yeni)`}
                  </div>
                </div>
            </div>

            {/* GÖRSEL SEÇME ALANI */}
            <div className="space-y-1 pt-1">
              <span className="text-[9px] font-bold text-slate-500">Görsel Seç</span>
              <input type="file" accept="image/*" className="hidden" id="image-upload" ref={fileInputRef} onChange={handleFileChange} />
              <label htmlFor="image-upload" className="w-full h-8.5 flex items-center justify-center text-[10px] font-bold text-slate-600 bg-white border border-slate-300 hover:border-blue-400 rounded p-1.5 cursor-pointer shadow-sm transition-all">
                {selectedFile ? selectedFile.name : "Bilgisayardan Görsel Seç"}
              </label>
            </div>

            {/* ONAY EKRANI VEYA KAYDET BUTONU */}
            {showConfirm ? (
              <div className="bg-amber-50 border border-amber-300 rounded p-3 mt-4 space-y-3 shadow-inner">
                <p className="text-[10px] font-bold text-amber-800 text-center leading-tight">
                  ⚠️ DİKKAT: Bu Ürün Kodu (ARTNR) ile sistemde zaten bir resim var. <br/> <span className="text-red-600">Üzerine kaydedilecek!</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={executeSave} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded transition-colors shadow-sm">
                    Yine de Onayla
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded transition-colors shadow-sm">
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleSaveClick}
                disabled={!selectedSlot?.product?.name || isSaving}
                className={`w-full py-2.5 rounded text-[11px] font-bold text-white transition-all shadow-sm mt-4 ${(!selectedSlot?.product?.name || isSaving) ? "bg-slate-300 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700"}`}
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}