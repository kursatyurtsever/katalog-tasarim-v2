"use client";

import { useState, useMemo, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import * as XLSX from "xlsx";

export function ProductManagement() {
  const productPool = useCatalogStore((state) => state.productPool);
  const setProductPool = useCatalogStore((state) => state.setProductPool);
  
  const masterProductPool = useCatalogStore((state) => state.masterProductPool);
  const setMasterProductPool = useCatalogStore((state) => state.setMasterProductPool);
  
  const pages = useCatalogStore((state) => state.pages);
  const autoFillSlots = useCatalogStore((state) => state.autoFillSlots);
  const clearProducts = useCatalogStore((state) => state.clearProducts);
  const resetCatalog = useCatalogStore((state) => state.resetCatalog);

  const [searchTerm, setSearchTerm] = useState("");

  // Input alanlarını sıfırlayabilmek için referanslar oluşturuyoruz
  const layoutFileRef = useRef<HTMLInputElement>(null);
  const masterFileRef = useRef<HTMLInputElement>(null);

  const handleLayoutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const formattedProducts = data.map((row: any, index: number) => {
        const sku = row.ARTNR?.toString() || row.KOD?.toString() || row.SKU?.toString() || `urun-${index}`;
        return {
          id: sku,
          name: row.BEZEICHNUNG || row.URUN_ADI || row.AD || row.NAME || "İsimsiz Ürün",
          price: row.VK_NETTO?.toString() || row.SATIS?.toString() || row["G.VK.KND"]?.toString() || row.FIYAT?.toString() || row.PRICE?.toString() || "0",
          sku: sku,
          category: row.KATEGORI || row.CATEGORY || "Yüklenen Ürünler",
          image: row.RESIM || `/images/products/${sku}.png`,
          raw: row,
        };
      });
      setProductPool(formattedProducts);
    };
    reader.readAsBinaryString(file);
  };

  const handleMasterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const formattedProducts = data.map((row: any, index: number) => {
        const sku = row.ARTNR?.toString() || row.KOD?.toString() || row.SKU?.toString() || `urun-${index}`;
        return {
          id: sku,
          name: row.BEZEICHNUNG || row.URUN_ADI || row.AD || row.NAME || "İsimsiz Ürün",
          price: row.VK_NETTO?.toString() || row.SATIS?.toString() || row["G.VK.KND"]?.toString() || row.FIYAT?.toString() || row.PRICE?.toString() || "0",
          sku: sku,
          category: row.KATEGORI || row.CATEGORY || "Yüklenen Ürünler",
          image: row.RESIM || `/images/products/${sku}.png`,
          raw: row,
        };
      });
      setMasterProductPool(formattedProducts);
    };
    reader.readAsBinaryString(file);
  };

  // Tüm veri ve inputları temizleyen fonksiyon
  const handleClearAll = () => {
    clearProducts(); // Hücrelerdeki ürünleri temizler
    setProductPool([]); // Otomatik dizilim havuzunu boşaltır
    setMasterProductPool([]); // Sürükle bırak havuzunu boşaltır
    setSearchTerm(""); // Arama kutusunu temizler
    
    // Dosya seçim inputlarını sıfırlar
    if (layoutFileRef.current) layoutFileRef.current.value = "";
    if (masterFileRef.current) masterFileRef.current.value = "";
  };

  const activeSkus = useMemo(() => {
    const skus = new Set<string>();
    pages.forEach(p => p.slots.forEach(s => {
      if (s.product && s.product.sku) skus.add(s.product.sku);
    }));
    return skus;
  }, [pages]);

  const filteredMaster = useMemo(() => {
    if (!searchTerm) return masterProductPool;
    return masterProductPool.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [masterProductPool, searchTerm]);

  const groupedMaster = useMemo(() => {
    return filteredMaster.reduce((acc, product) => {
      const cat = product.category || "Diğer Ürünler";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, typeof masterProductPool>);
  }, [filteredMaster]);

  return (
    <>
      <div className="p-4 border-b border-slate-200 bg-white space-y-4 shadow-sm shrink-0">
        
        <div>
          <label className="block text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-wider">
            1. Otomatik Dizilim İçin Excel Yükle
          </label>
          <input ref={layoutFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleLayoutFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-md" />
        </div>
        
        <div className="flex gap-2 w-full">
          <button onClick={autoFillSlots} disabled={productPool.length === 0} className={`flex-1 font-bold py-2.5 rounded-md text-[11px] transition-all shadow-sm ${productPool.length > 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
            Yerleştir
          </button>
          <button onClick={handleClearAll} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm" title="Tüm yüklenen ürünleri ve hücreleri temizle">
            Temizle
          </button>
          <button onClick={resetCatalog} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm" title="Tasarımı ve ürünleri tamamen sıfırla">
            Sıfırla
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-purple-600 mb-2 uppercase tracking-wider">
            2. Tüm Ürün Havuzunu Yükle (Manuel Dağıtım)
          </label>
          <input ref={masterFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleMasterFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-slate-200 rounded-md" />
        </div>

      </div>

      <div className="flex-1 p-3 bg-slate-100 flex flex-col min-h-0">
        <div className="mb-3 shrink-0 relative">
          <input type="text" placeholder="Ürün Ara... (İsim veya Kod)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" />
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
          {masterProductPool.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-medium italic p-4 text-center">
              Ürün havuzu boş. Lütfen yukarıdan Excel dosyanızı yükleyin.
            </div>
          ) : (
            Object.entries(groupedMaster).map(([category, products]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-200 rounded text-[11px] font-bold text-slate-700 mb-2">
                  <span>{category.split(' - ')[1] || category}</span>
                  <span className="bg-white px-1.5 rounded">{products.length}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {products.map((product, index) => {
                    const isActive = activeSkus.has(product.sku || "");
                    return (
                      <div
                        key={`${product.id || product.sku}-${index}`}
                        draggable={!isActive}
                        onDragStart={(e) => {
                          if (!isActive) e.dataTransfer.setData("newProductFromSidebar", JSON.stringify(product));
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${
                          isActive ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        <div className="w-8 h-8 bg-slate-50 rounded border flex justify-center items-center overflow-hidden shrink-0">
                          {product.image ? <img src={product.image} className="max-w-full max-h-full object-contain" /> : <span className="text-[8px] text-slate-400 font-bold uppercase">Yok</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-slate-800 truncate leading-none">{product.name}</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[9px] font-semibold text-slate-500">{product.sku}</span>
                            <span className="text-[9px] font-bold text-blue-600">{product.price} TL</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}